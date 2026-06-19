import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications';
import { sendPushNotification } from '@/lib/onesignal';

/**
 * Unified Notification API
 * POST /api/notify
 *
 * Supported types:
 *   - "push"  → OneSignal push notification (web + mobile)
 *   - "email" → Email via notificationService
 *   - "sms"   → SMS via notificationService
 *   - (auto)  → Email + SMS if provided
 */
export async function POST(req) {
    try {
        const payload = await req.json();
        const { type, recipientIds, to, subject, text, html, title, message, url, data, phoneNumber } = payload;

        console.log(`[API/NOTIFY] Type: ${type || 'auto'}, Recipients: ${recipientIds?.length || to || phoneNumber || 'N/A'}`);

        let result = { success: true };

        if (type === 'push') {
            // OneSignal push notification
            if (!recipientIds || recipientIds.length === 0) {
                return NextResponse.json({ error: 'recipientIds required for push' }, { status: 400 });
            }
            result = await sendPushNotification({
                userIds: recipientIds,
                title: title || 'CareOnClick',
                message: message || text || 'You have a new notification',
                url: url || '/dashboard',
                data,
            });

        } else if (type === 'email') {
            result = await notificationService.sendEmail(to, subject, text, html);

        } else if (type === 'sms') {
            result = await notificationService.sendSMS(phoneNumber, text);

        } else {
            // Auto: send all applicable channels
            if (to) {
                result = await notificationService.sendEmail(to, subject || 'Notification from CareOnClick', text, html);
            }
            if (phoneNumber) {
                await notificationService.sendSMS(phoneNumber, text);
            }
            if (recipientIds?.length) {
                await sendPushNotification({
                    userIds: recipientIds,
                    title: title || subject || 'CareOnClick',
                    message: message || text || 'You have a new update',
                    url: url || '/dashboard',
                });
            }
        }

        return NextResponse.json({
            success: result?.success ?? true,
            method: type || 'auto',
            ...(result?.id && { pushId: result.id }),
            ...(result?.mockMode && { mockMode: result.mockMode }),
        });

    } catch (error) {
        console.error('[API/NOTIFY] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
