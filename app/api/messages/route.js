
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import notificationService from '@/lib/notifications';
import { auth } from '@/auth'; // Assuming auth.js v5

export async function POST(request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { recipientId, recipientEmail, recipientPhone, recipientName, content, subject, type } = body;

        if (!content || !recipientId) {
            return NextResponse.json({ error: 'Missing content or recipient' }, { status: 400 });
        }

        // 1. Save to Database
        const newMessage = await prisma.message.create({
            data: {
                senderId: session.user.id,
                senderName: session.user.name || 'Professional',
                role: session.user.role || 'doctor',
                recipientId: recipientId,
                recipientName: recipientName || 'Patient',
                content: content,
                type: type || 'CHAT' // 'SMS', 'EMAIL', 'CHAT'
            }
        });

        // 2. Trigger Notification (Real/Simulated)
        let notificationResult = { success: false, method: 'NONE' };

        if (type === 'ALERT') {
            // For Alert, currently we treat 'recipientId' as a single target, but could be broadcast if we expand.
            // Here we treat it as High Priority SMS to the patient
            notificationResult = await notificationService.sendSMS(recipientPhone, `[EMERGENCY ALERT] ${content}`);
        } else if (type === 'SMS' && recipientPhone) {
            notificationResult = await notificationService.sendSMS(recipientPhone, content);
        } else if (type === 'EMAIL' && recipientEmail) {
            notificationResult = await notificationService.sendEmail(recipientEmail, subject || 'New Message from Dr. Kal Hospital', content);
        }

        // 3. REEL ACTION: Send Confirmation to Professional (The Sender)
        // "Professional should receive a reel text message"
        try {
            const senderProfile = await prisma.user.findUnique({
                where: { id: session.user.id },
                include: { profile: true } // Assuming phone in profile
            });

            // Fallback logic for phone: check user root or profile
            const senderPhone = senderProfile?.phoneNumber || senderProfile?.profile?.phoneNumber;

            if (senderPhone) {
                await notificationService.sendSMS(senderPhone, `[System] Your message to ${recipientName} was successfully delivered.`);
            } else if (senderProfile?.email) {
                await notificationService.sendEmail(senderProfile.email, 'Delivery Confirmation', `Your message to ${recipientName} was delivered.`);
            }
        } catch (e) {
            console.error("Failed to send confirmation to professional", e);
        }

        return NextResponse.json({ success: true, message: newMessage, notification: notificationResult });

    } catch (error) {
        console.error("Message Send Error", error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const session = await auth();
        if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const searchParams = request.nextUrl.searchParams;
        let patientId = searchParams.get('patientId');

        // If the viewer is a patient, they only see their own messages
        const isPatientViewer = session.user.role === 'patient';
        const viewingId = isPatientViewer ? session.user.id : patientId;

        if (!viewingId) return NextResponse.json([], { status: 200 });

        // Resolve aliases for the patient being viewed/retrieved
        // This handles cases where professional sends to PathNumber instead of UUID
        let patientAliases = [viewingId];
        try {
            const p = await prisma.user.findFirst({
                where: { OR: [{ id: viewingId }, { pathNumber: viewingId }] },
                select: { id: true, pathNumber: true }
            });
            if (p) {
                if (p.id && !patientAliases.includes(p.id)) patientAliases.push(p.id);
                if (p.pathNumber && !patientAliases.includes(p.pathNumber)) patientAliases.push(p.pathNumber);
            }
        } catch (e) {
            console.error("Alias resolution error:", e);
        }

        // Fetch messages where any of the aliases is involved
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: { in: patientAliases } },
                    { recipientId: { in: patientAliases } }
                ]
            },
            take: 100,
            orderBy: { timestamp: 'desc' }
        });

        // Refine filtering:
        // If viewer is Professional: Return all messages between them and the specific patient aliases
        // If viewer is Patient: They already have all their relevant messages from the query above
        let filteredMessages = messages;
        if (!isPatientViewer) {
            filteredMessages = messages.filter(m =>
                (m.senderId === session.user.id && patientAliases.includes(m.recipientId)) ||
                (m.recipientId === session.user.id && patientAliases.includes(m.senderId))
            );
        }

        return NextResponse.json(filteredMessages);
    } catch (error) {
        console.error("Message Fetch Error", error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const session = await auth();
        if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const messageId = searchParams.get('id');

        if (!messageId) return NextResponse.json({ error: 'Missing message ID' }, { status: 400 });

        // Verify ownership/involvement before deleting
        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 });

        // Only sender or recipient can delete (simple policy)
        if (message.senderId !== session.user.id && message.recipientId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.message.delete({
            where: { id: messageId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Message Delete Error", error);
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }
}
