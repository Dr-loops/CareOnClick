
import fs from 'fs';
import path from 'path';

// Optional: Import real providers
// We use dynamic imports or try/catch in a real app, 
// but here we just import and handle initialization errors gracefully if needed.
import twilio from 'twilio';
import sgMail from '@sendgrid/mail';

const LOG_FILE = path.join(process.cwd(), 'notifications.log');

class LocalAdapter {
    static async sendSMS(to, body) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const log = `📱 [SMS-REEL] ➔ To: ${to} | Body: "${body}"`;
        await LocalAdapter.writeLog(log);
        console.log('\x1b[36m%s\x1b[0m', log); // Cyan color
        return { success: true, method: 'LOCAL_MOCK' };
    }

    static async sendEmail(to, subject, text, html) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const log = `📧 [EMAIL-REEL] ➔ To: ${to} | Subject: "${subject}"`;
        await LocalAdapter.writeLog(log);
        console.log('\x1b[33m%s\x1b[0m', log); // Yellow color
        return { success: true, method: 'LOCAL_MOCK' };
    }

    static async writeLog(message) {
        const timestamp = new Date().toISOString();
        const line = `${timestamp} - ${message}\n`;
        try {
            await fs.promises.appendFile(LOG_FILE, line);
        } catch (e) {
            console.error("Failed to write to notification log", e);
        }
    }
}

class NotificationService {
    constructor() {
        this.twilioClient = null;
        this.sendGridEnabled = false;

        // Initialize Twilio
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            try {
                this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                this.twilioPhone = process.env.TWILIO_PHONE_NUMBER;
            } catch (e) {
                console.error("Twilio Init Failed:", e.message);
            }
        }

        // Initialize SendGrid
        if (process.env.SENDGRID_API_KEY) {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            this.sendGridEnabled = true;
            this.emailFrom = process.env.SENDGRID_FROM_EMAIL || 'noreply@drkalhospital.com';
        }
    }

    async sendSMS(to, body) {
        if (this.twilioClient && this.twilioPhone) {
            try {
                await this.twilioClient.messages.create({
                    body: body,
                    from: this.twilioPhone,
                    to: to
                });
                await LocalAdapter.writeLog(`[SMS-REAL] Sent to ${to}`);
                return { success: true, method: 'TWILIO' };
            } catch (error) {
                console.error("Twilio Send Error:", error);
                // Fallback to local
                return LocalAdapter.sendSMS(to, body + " (Fallback: Twilio Failed)");
            }
        }
        return LocalAdapter.sendSMS(to, body);
    }

    async sendEmail(to, subject, text, html) {
        if (this.sendGridEnabled) {
            try {
                await sgMail.send({
                    to,
                    from: this.emailFrom,
                    subject,
                    text,
                    html: html || text // Use text as HTML if not provided
                });
                await LocalAdapter.writeLog(`[EMAIL-REAL] Sent to ${to}`);
                return { success: true, method: 'SENDGRID' };
            } catch (error) {
                console.error("SendGrid Error:", error);
                return LocalAdapter.sendEmail(to, subject, text, html + " (Fallback: SendGrid Failed)");
            }
        }
        return LocalAdapter.sendEmail(to, subject, text, html);
    }

    async sendAlert(recipients, message) {
        // Broadcasts to multiple users (e.g. for emergency)
        const results = [];
        for (const user of recipients) {
            // Prioritize SMS, then Email
            if (user.phoneNumber) {
                results.push(await this.sendSMS(user.phoneNumber, `[ALERT] ${message}`));
            } else if (user.email) {
                results.push(await this.sendEmail(user.email, 'URGENT ALERT', message));
            }
        }
        await LocalAdapter.writeLog(`[ALERT-BROADCAST] Sent to ${recipients.length} users`);
        return { success: true, count: results.length };
    }
}

const notificationService = new NotificationService();
export default notificationService;
