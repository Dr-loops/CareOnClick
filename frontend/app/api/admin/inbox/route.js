import { NextResponse } from 'next/server';
import { getInbox } from '@/lib/imap_client.js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        if (!process.env.EMAIL_PASS) {
            return NextResponse.json({ error: "Email credentials not configured" }, { status: 500 });
        }

        const emails = await getInbox();
        return NextResponse.json({ success: true, emails });
    } catch (error) {
        console.error("Inbox Fetch Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
