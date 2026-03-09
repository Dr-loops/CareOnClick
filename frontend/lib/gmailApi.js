import { google } from 'googleapis';

/**
 * Sends an email using the Gmail REST API with the configured service account.
 * This is more reliable than SMTP from serverless (Vercel) environments.
 * Requires:
 *  - GOOGLE_CLIENT_EMAIL (service account email)
 *  - GOOGLE_PRIVATE_KEY (service account private key)
 *  - EMAIL_USER (the Gmail account to send *from* via domain-wide delegation)
 */

const GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.send'
];

export async function sendEmailViaGmailAPI({ to, subject, text, html }) {
    try {
        if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
            throw new Error('Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY');
        }

        const senderEmail = process.env.EMAIL_USER;
        if (!senderEmail) {
            throw new Error('Missing EMAIL_USER (the Gmail address to send from)');
        }

        // Create JWT auth using service account, impersonating the sender email
        const auth = new google.auth.JWT({
            email: process.env.GOOGLE_CLIENT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            scopes: GMAIL_SCOPES,
            subject: senderEmail, // Domain-wide delegation: impersonate this user
        });

        const gmail = google.gmail({ version: 'v1', auth });

        // Build RFC 2822 email message
        const bodyHtml = html || `<p>${text}</p>`;
        const fromName = process.env.EMAIL_FROM_NAME || 'CareOnClick';

        const emailLines = [
            `From: "${fromName}" <${senderEmail}>`,
            `To: ${to}`,
            `Subject: ${subject}`,
            `MIME-Version: 1.0`,
            `Content-Type: text/html; charset=UTF-8`,
            ``,
            bodyHtml,
        ];

        const rawMessage = emailLines.join('\n');

        // Base64url encode (Gmail API requirement)
        const encodedMessage = Buffer.from(rawMessage)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const result = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });

        console.log(`[Gmail API] Email sent to ${to} | ID: ${result.data.id}`);
        return { success: true, method: 'GMAIL_API', messageId: result.data.id };
    } catch (error) {
        console.error('[Gmail API] Error sending email:', {
            message: error.message,
            code: error.code,
            errors: error?.errors,
        });
        throw error;
    }
}
