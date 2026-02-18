import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Temporary in-memory store for OTPs (In prod, use Redis or DB)
// Format: { 'email': { otp: '1234', expires: Date } }
const otpStore = new Map();

export async function POST(request) {
    try {
        const body = await request.json();
        const { action, email, phone, otp, newPassword, contact } = body; // 'contact' can be email or phone from UI

        console.log(`[Password Reset] Action: ${action}, Contact: ${contact || email || phone}`);

        if (action === 'request_reset') {
            const rawContact = contact || email || phone;
            if (!rawContact) return NextResponse.json({ error: 'Email or Phone required' }, { status: 400 });

            // Determine if input is Email or Phone
            const isEmail = rawContact.includes('@');
            const query = isEmail ? { email: rawContact } : { phoneNumber: rawContact };

            // 1. Verify User Exists
            const user = await prisma.user.findFirst({ where: query });

            if (!user) {
                // Security: Don't reveal if user exists, but for this dev stage maybe we do or simulate success
                // Returning generic message
                // Return success to prevent enumeration, but practically for this app:
                return NextResponse.json({ success: true, message: 'If account exists, OTP sent.' });
            }

            // 2. Generate OTP
            const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit otp
            const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

            // 3. Store OTP (Key is unique identifier - email or phone)
            const storeKey = isEmail ? user.email : user.phoneNumber;
            otpStore.set(storeKey, { otp: generatedOtp, expires });

            // 4. Send OTP (Email or SMS)
            let sent = false;
            let debugOtp = null;

            if (isEmail) {
                // ... Existing Email Logic ...
                if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                    try {
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
                        });
                        await transporter.sendMail({
                            from: `"${process.env.EMAIL_FROM_NAME || "Dr. Kal's Hospital"}" <${process.env.EMAIL_USER}>`,
                            to: user.email,
                            subject: "Password Reset Code",
                            html: `<p>Your Reset Code: <b>${generatedOtp}</b></p>`
                        });
                        sent = true;
                        console.log(`>>> OTP Email SENT to ${user.email} <<<`);
                    } catch (e) {
                        console.error("Email send failed", e);
                        // Fallback to simulation
                        debugOtp = generatedOtp;
                    }
                } else {
                    console.log(`>>> SIMULATION: OTP for ${user.email}: ${generatedOtp} <<<`);
                    debugOtp = generatedOtp;
                }
            } else {
                // SMS Logic
                if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
                    try {
                        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                        await client.messages.create({
                            body: `Your Dr. Kal's Virtual Hospital password reset code is: ${generatedOtp}`,
                            from: process.env.TWILIO_PHONE_NUMBER,
                            to: user.phoneNumber
                        });
                        sent = true;
                        console.log(`>>> OTP SMS SENT to ${user.phoneNumber} <<<`);
                    } catch (smsErr) {
                        console.error("Failed to send SMS:", smsErr);
                        debugOtp = generatedOtp;
                    }
                } else {
                    console.log(`>>> SIMULATION: SMS OTP for ${user.phoneNumber}: ${generatedOtp} <<<`);
                    debugOtp = generatedOtp;
                }
            }

            return NextResponse.json({
                success: true,
                message: sent ? `OTP sent to your ${isEmail ? 'email' : 'phone'}.` : 'OTP generated (Simulated).',
                debug_otp: debugOtp
            });

        } else if (action === 'confirm_reset') {
            // Need to know if we are verifying email or phone to lookup in store
            // We can try finding the user again by the provided contact
            const rawContact = contact || email;
            if (!rawContact || !otp || !newPassword) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

            // We need to resolve the User to find the Store Key (Email or Phone)
            // But actually, we just need the Store Key. 
            // If the user entered Email, key is Email. If Phone, key is Phone.
            // But we need to be consistent. 
            // The Frontend should pass the same 'contact' string used in request_reset.

            // However, the store key was set based on what was found in DB.
            // If user enters '1234', and DB has '+1234', we need to match.
            // Let's re-query the user to get the exact stored phone/email.

            const isEmail = rawContact.includes('@');
            const query = isEmail ? { email: rawContact } : { phoneNumber: rawContact };
            const user = await prisma.user.findFirst({ where: query });

            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 400 });

            const storeKey = isEmail ? user.email : user.phoneNumber;
            const storedData = otpStore.get(storeKey);

            if (!storedData) {
                return NextResponse.json({ error: 'Reset request expired or not found. Try again.' }, { status: 400 });
            }

            if (new Date() > storedData.expires) {
                otpStore.delete(email);
                return NextResponse.json({ error: 'OTP expired.' }, { status: 400 });
            }

            if (storedData.otp !== otp.trim()) {
                return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
            }

            // 2. Update Password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { email },
                data: { password: hashedPassword }
            });

            // 3. Cleanup
            otpStore.delete(email);

            return NextResponse.json({ success: true, message: 'Password reset successfully. Please login.' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error("Reset Error", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
