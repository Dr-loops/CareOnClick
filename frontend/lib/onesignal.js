/**
 * OneSignal Server-Side Helper
 * Used by API routes to send push notifications to specific users.
 * Uses OneSignal REST API v1 with external_id (= user's DB ID).
 */

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

/**
 * Send a push notification to one or more users via OneSignal.
 * @param {object} options
 * @param {string[]} options.userIds     - Array of DB user IDs (used as external_id)
 * @param {string}   options.title       - Notification title
 * @param {string}   options.message     - Notification body text
 * @param {string}   [options.url]       - Click-through URL (e.g. '/dashboard')
 * @param {object}   [options.data]      - Extra data payload (optional)
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function sendPushNotification({ userIds, title, message, url, data }) {
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
        console.warn('[OneSignal] Missing env vars — NEXT_PUBLIC_ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY');
        return { success: false, error: 'Missing OneSignal config' };
    }

    if (!userIds || userIds.length === 0) {
        return { success: false, error: 'No recipient user IDs provided' };
    }

    const body = {
        app_id: ONESIGNAL_APP_ID,
        headings: { en: title || 'CareOnClick' },
        contents: { en: message || 'You have a new notification' },
        include_aliases: {
            external_id: userIds.map(String)
        },
        target_channel: 'push',
        ...(url && { url }),
        ...(data && { data }),
    };

    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();

        if (!response.ok || result.errors) {
            console.error('[OneSignal] Push failed:', result.errors || result);
            return { success: false, error: JSON.stringify(result.errors || result) };
        }

        console.log(`[OneSignal] Push sent (id: ${result.id}) to ${userIds.length} user(s)`);
        return { success: true, id: result.id };
    } catch (err) {
        console.error('[OneSignal] Network error:', err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Convenience: notify a single patient about new lab results
 */
export async function notifyPatientNewResults(patientId, professionalName) {
    return sendPushNotification({
        userIds: [patientId],
        title: '📋 New Result Available',
        message: `${professionalName} has uploaded a new result to your dashboard.`,
        url: '/dashboard',
    });
}

/**
 * Convenience: notify a professional about a new booking
 */
export async function notifyProfessionalNewBooking({ professionalId, patientName, date, time }) {
    return sendPushNotification({
        userIds: [professionalId],
        title: '📅 New Appointment Booking',
        message: `${patientName} booked an appointment on ${new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} at ${time}. Please confirm.`,
        url: '/dashboard',
    });
}

/**
 * Convenience: notify a patient that their appointment status changed
 */
export async function notifyPatientAppointmentStatus({ patientId, professionalName, status, date, time }) {
    const isAccepted = status === 'Upcoming';
    return sendPushNotification({
        userIds: [patientId],
        title: isAccepted ? '✅ Appointment Confirmed' : '❌ Appointment Cancelled',
        message: isAccepted
            ? `Your appointment with ${professionalName} on ${new Date(date).toLocaleDateString('en-GB')} at ${time} is confirmed.`
            : `Your appointment with ${professionalName} has been cancelled.`,
        url: '/dashboard',
    });
}

/**
 * Convenience: notify a user of a new chat message
 */
export async function notifyNewMessage({ recipientId, senderName, preview }) {
    return sendPushNotification({
        userIds: [recipientId],
        title: `💬 ${senderName}`,
        message: preview || 'You have a new message',
        url: '/dashboard',
    });
}

/**
 * Convenience: notify a user of an incoming video call
 */
export async function notifyIncomingCall({ recipientId, senderName, roomId }) {
    return sendPushNotification({
        userIds: [recipientId],
        title: `📞 Incoming Video Call`,
        message: `${senderName} is calling you for a video consultation. Tap to answer.`,
        url: `/consultation/${roomId}`,
    });
}
