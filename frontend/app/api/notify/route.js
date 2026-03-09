import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications';

export async function POST(req) {
    try {
        const payload = await req.json();
        const { to, subject, text, html, type, recipientId, phoneNumber } = payload;
        console.log(`[API/NOTIFY] Sending to: ${to || phoneNumber}, Type: ${type || 'auto'}`);

        let notifyResult = { success: true };

        if (type === 'email') {
            notifyResult = await notificationService.sendEmail(to, subject, text, html);
        } else if (type === 'sms') {
            notifyResult = await notificationService.sendSMS(phoneNumber, text);
        } else {
            // General notification handling
            if (to) {
                notifyResult = await notificationService.sendEmail(to, subject || 'Notification', text, html);
            }
            if (phoneNumber) {
                await notificationService.sendSMS(phoneNumber, text);
            }
        }

        return NextResponse.json({ 
            success: true, 
            mockMode: notifyResult?.mockMode || false,
            method: notifyResult?.method 
        });
    } catch (error) {
        console.error("Notification API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
