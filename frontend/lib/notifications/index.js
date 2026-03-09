
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import sgMail from '@sendgrid/mail';
import { sendEmailViaGmailAPI } from '@/lib/gmailApi';

// Safe console-only logger (Vercel has read-only filesystem - no file writes allowed)
class LocalAdapter {
    static async sendSMS(to, body) {
        console.log(`📱 [SMS-MOCK] ➔ To: ${to} | Body: "${body}"`);
        return { success: true, method: 'LOCAL_MOCK', mockMode: true };
    }

    static async sendEmail(to, subject, text) {
        console.warn(`📧 [EMAIL-MOCK] ➔ To: ${to} | Subject: "${subject}" (NOT SENT - all providers failed)`);
        return { success: true, method: 'LOCAL_MOCK', mockMode: true };
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
                console.error('[Notify] Twilio Init Failed:', e.message);
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
                await this.twilioClient.messages.create({ body, from: this.twilioPhone, to });
                console.log(`[Notify] [SMS-REAL] (Twilio) Sent to ${to}`);
                return { success: true, method: 'TWILIO' };
            } catch (error) {
                console.error('[Notify] Twilio Error:', error.message);
            }
        }
        return LocalAdapter.sendSMS(to, body);
    }

    async sendEmail(to, subject, text, html) {
        // 1. Try Gmail REST API using Service Account (most reliable from Vercel)
        if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.EMAIL_USER) {
            try {
                console.log(`[Notify] Attempting Gmail API send to: ${to}`);
                const result = await sendEmailViaGmailAPI({ to, subject, text, html });
                return result;
            } catch (gmailError) {
                console.error('[Notify] Gmail API failed, trying SMTP fallback:', gmailError.message);
                // Fall through to SMTP
            }
        }

        // 2. Try Nodemailer SMTP fallback
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                console.log(`[Notify] Attempting SMTP send to: ${to}`);
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });
                await transporter.sendMail({
                    from: `"${process.env.EMAIL_FROM_NAME || 'CareOnClick'}" <${process.env.EMAIL_USER}>`,
                    to, subject, text, html: html || `<p>${text}</p>`
                });
                console.log(`[Notify] [EMAIL-REAL] (SMTP) Sent to ${to}`);
                return { success: true, method: 'NODEMAILER' };
            } catch (smtpError) {
                console.error('[Notify] SMTP Error:', {
                    message: smtpError.message,
                    code: smtpError.code,
                    responseCode: smtpError.responseCode,
                    response: smtpError.response,
                });
            }
        }

        // 3. Try SendGrid
        if (this.sendGridEnabled) {
            try {
                await sgMail.send({
                    to, from: this.emailFrom, subject, text, html: html || `<p>${text}</p>`
                });
                console.log(`[Notify] [EMAIL-REAL] (SendGrid) Sent to ${to}`);
                return { success: true, method: 'SENDGRID' };
            } catch (sgError) {
                console.error('[Notify] SendGrid Error:', sgError.message);
            }
        }

        // 4. All providers failed — log and return mockMode
        console.error(`[Notify] ALL EMAIL PROVIDERS FAILED for: ${to}`);
        return LocalAdapter.sendEmail(to, subject, text);
    }

    async sendAlert(recipients, message) {
        const results = [];
        for (const user of recipients) {
            if (user.phoneNumber) {
                results.push(await this.sendSMS(user.phoneNumber, `[ALERT] ${message}`));
            } else if (user.email) {
                results.push(await this.sendEmail(user.email, 'URGENT ALERT', message));
            }
        }
        return { success: true, count: results.length };
    }
}

const notificationService = new NotificationService();
export { notificationService };
