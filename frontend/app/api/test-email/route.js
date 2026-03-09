import { NextResponse } from 'next/server';
import { sendEmailViaGmailAPI } from '@/lib/gmailApi';
import nodemailer from 'nodemailer';

/**
 * Debug endpoint to test email delivery on Vercel live.
 * Hit: GET /api/test-email?to=email@example.com
 * Logs all errors to Vercel function logs and returns them in the response.
 */
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const to = searchParams.get('to') || 'takyinaomi025@gmail.com';

    const results = {
        to,
        timestamp: new Date().toISOString(),
        env: {
            hasGoogleClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
            hasGooglePrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
            hasEmailUser: !!process.env.EMAIL_USER,
            hasEmailPass: !!process.env.EMAIL_PASS,
            emailUser: process.env.EMAIL_USER || 'MISSING',
        },
        tests: {}
    };

    // Test 1: Gmail API
    try {
        const gmailResult = await sendEmailViaGmailAPI({
            to,
            subject: '[TEST] CareOnClick Email Test (Gmail API)',
            text: 'This is a test email sent via Gmail REST API.',
            html: '<h2>CareOnClick Email Test</h2><p>This is a test email sent via <strong>Gmail REST API</strong>.</p>'
        });
        results.tests.gmailApi = { success: true, result: gmailResult };
    } catch (e) {
        results.tests.gmailApi = {
            success: false,
            error: e.message,
            code: e.code,
            errors: e?.errors,
        };
    }

    // Test 2: SMTP (as backup diagnosis)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            
            await transporter.verify();
            results.tests.smtpVerify = { success: true, message: 'SMTP connection OK' };

            await transporter.sendMail({
                from: `"CareOnClick Test" <${process.env.EMAIL_USER}>`,
                to,
                subject: '[TEST] CareOnClick Email Test (SMTP)',
                text: 'This is a test email sent via Gmail SMTP.'
            });
            results.tests.smtp = { success: true };
        } catch (e) {
            results.tests.smtp = {
                success: false,
                error: e.message,
                code: e.code,
                responseCode: e.responseCode,
                response: e.response,
            };
        }
    } else {
        results.tests.smtp = { success: false, error: 'EMAIL_USER or EMAIL_PASS missing' };
    }

    return NextResponse.json(results, { status: 200 });
}
