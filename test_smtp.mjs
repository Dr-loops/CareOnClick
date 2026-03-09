import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './frontend/.env' });

async function testSMTP() {
    console.log("Checking credentials:");
    console.log("USER:", process.env.EMAIL_USER);
    console.log("PASS:", process.env.EMAIL_PASS ? "********" : "MISSING");

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("Missing credentials!");
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        console.log("Attempting to send real email to takyinaomi025@gmail.com...");
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || "CareOnClick Test"}" <${process.env.EMAIL_USER}>`,
            to: "takyinaomi025@gmail.com",
            subject: "Testing SMTP Connection directly",
            text: "This is a direct SMTP test to ensure your App Password works."
        });

        console.log("SUCCESS! Message ID:", info.messageId);
    } catch (e) {
        console.error("SMTP Error:", e);
    }
}

testSMTP();
