import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
    try {
        const { to, subject, html, text } = await request.json();

        // 1. Validate Request
        if (!to || !subject || (!html && !text)) {
            return NextResponse.json({ error: 'Missing required fields: to, subject, body' }, { status: 400 });
        }

        // 2. Configure Transporter (Gmail)
        // Ideally these are in process.env.EMAIL_USER and process.env.EMAIL_PASS

        // CHECK FOR MISSING CREDENTIALS & SIMULATE
        if (!process.env.EMAIL_PASS) {
            console.warn("EMAIL_PASS not set. Simulating email send.");
            // Simulate 1s delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return NextResponse.json({
                success: true,
                simulated: true,
                message: "Email simulated (Configure EMAIL_PASS in .env for real sending)"
            });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'drkalsvirtualhospital@gmail.com',
                pass: process.env.EMAIL_PASS
            }
        });

        try {
            const info = await transporter.sendMail({
                from: `"DR KAL'S VIRTUAL HOSPITAL" <${process.env.EMAIL_USER || 'drkalsvirtualhospital@gmail.com'}>`,
                to,
                subject,
                text,
                html
            });

            console.log("Message sent: %s", info.messageId);
            return NextResponse.json({ success: true, messageId: info.messageId });
        } catch (sendError) {
            console.error("Transporter Send Error (falling back to simulation):", sendError);
            // Fallback to simulation response
            return NextResponse.json({
                success: true,
                simulated: true,
                message: "Real email failed (Auth/Net Error), simulated instead.",
                warning: sendError.message
            });
        }

    } catch (error) {
        console.error("Email Send Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            hint: "Ensure EMAIL_USER and EMAIL_PASS (App Password) are set in .env"
        }, { status: 500 });
    }
}
