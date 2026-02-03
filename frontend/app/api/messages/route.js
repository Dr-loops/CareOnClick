
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Force Node.js runtime for file system access
export const runtime = 'nodejs';

// Path to the local JSON storage
const DATA_DIR = path.join(process.cwd(), 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Helper to ensure data directory and file exist
const ensureStorage = () => {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(MESSAGES_FILE)) {
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]), 'utf8');
    }
};

// Helper to read messages
const readMessages = () => {
    ensureStorage();
    try {
        const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading messages file:", error);
        return [];
    }
};

// Helper to write messages
const writeMessages = (messages) => {
    ensureStorage();
    try {
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error("Error writing messages file:", error);
        return false;
    }
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');

        // Read all messages from local file
        const allMessages = readMessages();

        // If a patientId is provided, filter by that context (Room)
        // For the "Care Team" view, we want all messages related to this patient.
        let filteredMessages = allMessages;

        if (patientId) {
            filteredMessages = allMessages.filter(msg =>
                msg.recipientId === patientId || // Sent TO the patient channel
                msg.senderId === patientId ||    // Sent BY the patient
                (msg.details && msg.details.patientId === patientId) // Context match
            );
        }

        // Sort by timestamp if not already
        filteredMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        return NextResponse.json(filteredMessages);
    } catch (error) {
        console.error("Message Fetch Error", error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { recipientId, recipientName, content, type, senderName, role, senderId } = body;

        // Validation
        if (!content || !recipientId) {
            return NextResponse.json({ error: 'Missing content or recipient' }, { status: 400 });
        }

        // 1. Resolve Sender Name (if missing)
        let resolvedSenderName = senderName;
        if ((!resolvedSenderName || resolvedSenderName === 'Unknown Professional') && senderId) {
            const sender = await prisma.user.findUnique({ where: { id: senderId } });
            if (sender) resolvedSenderName = sender.name;
        }
        resolvedSenderName = resolvedSenderName || 'CareOnClick Team';

        // 2. Fetch Recipient for Notification Details
        const recipient = await prisma.user.findUnique({ where: { id: recipientId } });

        // 3. Create Message Object (Persist to DB/File)
        // Ideally we should switch to Prisma 'Message' model if we want robust query, 
        // but keeping file sync for now if that's the established pattern, OR switching to Prisma if schema supports it.
        // Reviewing schema: `model Message` exists! Let's use DB for consistency.

        const newMessage = await prisma.message.create({
            data: {
                senderId: senderId || 'SYSTEM',
                senderName: resolvedSenderName,
                role: role || 'System',
                recipientId: recipientId,
                recipientName: recipientName || (recipient ? recipient.name : 'Patient'),
                type: type || 'CHAT',
                content: content,
            }
        });

        // 4. Trigger Real Notifications (SMS/Email)
        if (type === 'SMS' && recipient?.phoneNumber) {
            await notificationService.sendSMS(recipient.phoneNumber, `[${resolvedSenderName}] ${content}`);
        }

        if (type === 'EMAIL' && recipient?.email) {
            await notificationService.sendEmail(
                recipient.email,
                `New Message from ${resolvedSenderName}`,
                content,
                `<div style="padding: 20px; font-family: sans-serif;">
                    <h3>New Message from ${resolvedSenderName}</h3>
                    <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${content}</p>
                    <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login">Log in to reply</a></p>
                  </div>`
            );
        }

        // Also trigger ALERT types
        if (type === 'ALERT') {
            await notificationService.sendAlert([recipient], content);
        }

        return NextResponse.json({ success: true, message: newMessage });

    } catch (error) {
        console.error("Message Send Error", error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}

export async function DELETE() {
    // Optional: Implement delete if needed, but for now filtering locally in UI is fine for the demo
    return NextResponse.json({ success: true });
}
