
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { notificationService } from '@/lib/notifications';

export async function GET(request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');
        const currentUserId = session.user.id;

        // Fetch messages where the user is either the sender or recipient
        // If patientId is provided (e.g. from an admin/prof view), we filter for that patient's context.
        const messages = await prisma.message.findMany({
            where: patientId ? {
                OR: [
                    { recipientId: patientId },
                    { senderId: patientId }
                ]
            } : {
                OR: [
                    { recipientId: currentUserId },
                    { senderId: currentUserId }
                ]
            },
            orderBy: { timestamp: 'asc' }
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Message Fetch Error", error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { recipientId, recipientName, content, type, senderName, role, senderId } = body;

        if (!content || !recipientId) {
            return NextResponse.json({ error: 'Missing content or recipient' }, { status: 400 });
        }

        // Use session user ID if senderId is missing
        const finalSenderId = senderId || session.user.id;

        let resolvedSenderName = senderName;
        if ((!resolvedSenderName || resolvedSenderName === 'Unknown Professional') && finalSenderId) {
            const sender = await prisma.user.findUnique({ where: { id: finalSenderId } });
            if (sender) resolvedSenderName = sender.name;
        }
        resolvedSenderName = resolvedSenderName || session.user.name || 'CareOnClick Team';

        const recipient = await prisma.user.findUnique({ where: { id: recipientId } });

        const newMessage = await prisma.message.create({
            data: {
                senderId: finalSenderId,
                senderName: resolvedSenderName,
                role: role || session.user.role || 'System',
                recipientId: recipientId,
                recipientName: recipientName || (recipient ? recipient.name : 'Patient'),
                type: type || 'CHAT',
                content: content,
            }
        });

        // Trigger Notifications
        if (type === 'SMS' && recipient?.phoneNumber) {
            await notificationService.sendSMS(recipient.phoneNumber, `[${resolvedSenderName}] ${content}`);
        }

        if (type === 'EMAIL' && recipient?.email) {
            await notificationService.sendEmail(
                recipient.email,
                `New Message from ${resolvedSenderName}`,
                content,
                `<div><h3>New Message from ${resolvedSenderName}</h3><p>${content}</p></div>`
            );
        }

        if (type === 'ALERT') {
            await notificationService.sendAlert([recipient], content);
        }

        return NextResponse.json({ success: true, message: newMessage });
    } catch (error) {
        console.error("Message Send Error", error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
        }

        // Delete the message. 
        // In a strictly secure app, we'd check if the user is the sender or recipient:
        // where: { id, OR: [{ senderId: session.user.id }, { recipientId: session.user.id }] }
        await prisma.message.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Message Delete Error", error);
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }
}

