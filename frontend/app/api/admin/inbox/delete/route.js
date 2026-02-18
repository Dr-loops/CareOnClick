import { NextResponse } from 'next/server';
import { deleteEmail } from '@/lib/imap_client.js';

export async function POST(req) {
    try {
        const { uid } = await req.json();

        if (!uid) {
            return NextResponse.json({ success: false, error: "UID is required" }, { status: 400 });
        }

        const result = await deleteEmail(uid);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error("Delete API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
