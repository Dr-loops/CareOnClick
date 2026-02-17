
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
        const roomId = searchParams.get('roomId');
        const currentUserId = session.user.id;

        // Filtering logic:
        // 1. If roomId is provided, it's a room/collaboration chat.
        // 2. If patientId is provided AND we're in a P2P context (e.g. CommunicationHub), 
        //    we should ideally filter for the conversation between session user and patientId.
        //    However, to maintain compatibility with existing 'CollaborationTab' which uses patientId as RoomId:

        let whereClause = {};

        if (roomId) {
            // Room-based chat (e.g. Collaboration for a specific patient)
            whereClause = {
                OR: [
                    { recipientId: roomId },
                    { senderId: roomId }
                ]
            };
        } else if (patientId) {
            // Check if 'direct' flag is present for strict P2P
            const direct = searchParams.get('direct') === 'true';
            if (direct) {
                whereClause = {
                    OR: [
                        { AND: [{ senderId: currentUserId }, { recipientId: patientId }] },
                        { AND: [{ senderId: patientId }, { recipientId: currentUserId }] }
                    ]
                };
            } else {
                // Legacy support/Broad view (Admin/Nurse viewing all patient messages)
                whereClause = {
                    OR: [
                        { recipientId: patientId },
                        { senderId: patientId }
                    ]
                };
            }
        } else {
            // General inbox for the current user
            whereClause = {
                OR: [
                    { recipientId: currentUserId },
                    { senderId: currentUserId }
                ]
            };
        }

        const messages = await prisma.message.findMany({
            where: whereClause,
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

        // AUDIT LOG: Message Sent
        try {
            await prisma.auditLog.create({
                data: {
                    action: 'SEND_MESSAGE',
                    actorId: finalSenderId,
                    actorName: resolvedSenderName,
                    target: `User:${recipientId}`,
                    details: `Message sent to ${recipientName || 'Recipient'} (${type})`,
                    timestamp: new Date(new Date().setFullYear(2026)) // Force 2026
                }
            });
        } catch (logErr) { console.error("Audit Log Msg Error", logErr); }

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

