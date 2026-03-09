
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import sgMail from '@sendgrid/mail';

// Safe console-only logger (Vercel has read-only filesystem, so no file writing)
class LocalAdapter {
    static async sendSMS(to, body) {
        const log = `📱 [SMS-MOCK] ➔ To: ${to} | Body: "${body}"`;
        console.log('\x1b[36m%s\x1b[0m', log);
        return { success: true, method: 'LOCAL_MOCK', mockMode: true };
    }

    static async sendEmail(to, subject, text) {
        const log = `📧 [EMAIL-MOCK] ➔ To: ${to} | Subject: "${subject}" | Content: ${text?.substring(0, 50)}...`;
        console.warn('\x1b[33m%s\x1b[0m', log);
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
                console.log('[Notify] Twilio initialized.');
            } catch (e) {
                console.error('[Notify] Twilio Init Failed:', e.message);
            }
        }

        // Initialize SendGrid
        if (process.env.SENDGRID_API_KEY) {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            this.sendGridEnabled = true;
            this.emailFrom = process.env.SENDGRID_FROM_EMAIL || 'noreply@drkalhospital.com';
            console.log('[Notify] SendGrid initialized.');
        }
    }

    async sendSMS(to, body) {
        if (this.twilioClient && this.twilioPhone) {
            try {
                await this.twilioClient.messages.create({ body, from: this.twilioPhone, to });
                console.log(`[Notify] [SMS-REAL] (Twilio) Sent to ${to}`);
                return { success: true, method: 'TWILIO' };
            } catch (error) {
                console.error('[Notify] Twilio Send Error:', error.message);
            }
        }
        return LocalAdapter.sendSMS(to, body);
    }

    async sendEmail(to, subject, text, html) {
        // 1. Try Nodemailer (Gmail/SMTP) - PRIMARY
        // Uses static import (NOT dynamic) to ensure Vercel bundles this correctly
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                console.log(`[Notify] Attempting Nodemailer SMTP to: ${to}`);
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,  // Use SSL on port 465
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                    tls: {
                        rejectUnauthorized: false  // Allow self-signed certs in serverless
                    }
                });

                // Verify connection first to provide helpful error messages
                await transporter.verify();
                console.log('[Notify] SMTP connection verified OK.');

                await transporter.sendMail({
                    from: `"${process.env.EMAIL_FROM_NAME || 'CareOnClick'}" <${process.env.EMAIL_USER}>`,
                    to,
                    subject,
                    text,
                    html: html || `<p>${text}</p>`
                });

                console.log(`[Notify] [EMAIL-REAL] (Nodemailer/Gmail) Sent to ${to}`);
                return { success: true, method: 'NODEMAILER' };
            } catch (error) {
                // Log the FULL error so it shows in Vercel function logs
                console.error('[Notify] Nodemailer SMTP Error (full):', JSON.stringify({
                    message: error.message,
                    code: error.code,
                    command: error.command,
                    responseCode: error.responseCode,
                    response: error.response
                }));
                // Fall through to SendGrid or mock
            }
        } else {
            console.warn('[Notify] EMAIL_USER or EMAIL_PASS missing from environment!');
        }

        // 2. Try SendGrid - SECONDARY
        if (this.sendGridEnabled) {
            try {
                await sgMail.send({
                    to,
                    from: this.emailFrom,
                    subject,
                    text,
                    html: html || `<p>${text}</p>`
                });
                console.log(`[Notify] [EMAIL-REAL] (SendGrid) Sent to ${to}`);
                return { success: true, method: 'SENDGRID' };
            } catch (error) {
                console.error('[Notify] SendGrid Error:', error.message);
            }
        }

        // 3. Fallback to Local Mock (no file write - Vercel is read-only)
        console.warn(`[Notify] All email providers failed. Falling back to mock for: ${to}`);
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
