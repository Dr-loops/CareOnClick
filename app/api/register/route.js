import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import notificationService from '@/lib/notifications';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password, name, role, ...otherData } = body;

        if (!email || !password || !name || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate IDs
        let customId;
        if (role === 'patient') {
            // Find last patient to increment ID
            const lastPatient = await prisma.user.findFirst({
                where: { role: 'patient', id: { startsWith: 'PATH' } },
                orderBy: { id: 'desc' }
            });

            let nextNum = 1;
            if (lastPatient && lastPatient.id.startsWith('PATH')) {
                const numericPart = parseInt(lastPatient.id.substring(4));
                if (!isNaN(numericPart)) {
                    nextNum = numericPart + 1;
                }
            }
            customId = `PATH${nextNum.toString().padStart(4, '0')}`;
        } else {
            const timestampSuffix = Date.now().toString().slice(-4);
            customId = `${role.substring(0, 3).toLowerCase()}${timestampSuffix}`;
        }


        // VALIDATION

        // 1. Common Requirements (All Users)
        const commonRequired = ['country', 'region', 'phoneNumber', 'whatsappNumber'];
        const missingCommon = commonRequired.filter(field => !otherData[field]);
        if (missingCommon.length > 0) {
            return NextResponse.json({ error: `Missing contact details: ${missingCommon.join(', ')}` }, { status: 400 });
        }

        // 2. Professional Requirements
        if (role !== 'patient' && role !== 'admin') {
            const professionRequired = ['licenseNumber', 'yearsOfExperience', 'currentFacility', 'facilityType'];
            const missing = professionRequired.filter(field => !otherData[field]);
            if (missing.length > 0) {
                return NextResponse.json({ error: `Missing professional details: ${missing.join(', ')}` }, { status: 400 });
            }
        }

        // 3. Admin Security Check
        if (role === 'admin') {
            const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;
            if (!ADMIN_SECRET) {
                console.error("CRITICAL: ADMIN_SECRET_KEY is not set in environment variables.");
                return NextResponse.json({ error: 'Server misconfiguration: Admin registration disabled.' }, { status: 503 });
            }
            if (otherData.adminSecret !== ADMIN_SECRET) {
                return NextResponse.json({ error: 'Security Violation: Invalid Admin Secret Key.' }, { status: 403 });
            }
        }

        // Verification logic
        const verificationStatus = (role === 'patient' || role === 'admin') ? 'Verified' : 'Pending';

        const newUser = await prisma.user.create({
            data: {
                id: customId,
                email,
                password: hashedPassword,
                name,
                role,
                verificationStatus,
                pathNumber: role === 'patient' ? customId : otherData.pathNumber,

                // Common Fields
                country: otherData.country,
                region: otherData.region,
                phoneNumber: otherData.phoneNumber,
                whatsappNumber: otherData.whatsappNumber,

                // Professional Fields (Nullable for patients)
                licenseNumber: otherData.licenseNumber,
                yearsOfExperience: otherData.yearsOfExperience ? parseInt(otherData.yearsOfExperience) : null,
                currentFacility: otherData.currentFacility,
                facilityType: otherData.facilityType,
            },
        });

        // --- NOTIFICATIONS ---
        try {
            // Welcome Email
            const emailSubject = `Welcome to Dr. Kal's Virtual Hospital!`;
            const emailHtml = `
                <h1>Welcome, ${name}!</h1>
                <p>Thank you for registering at Dr. Kal's Virtual Hospital.</p>
                <p>Your Member ID is: <strong>${newUser.id}</strong></p>
                <p>You can now login to access our services.</p>
                <br>
                <p>Best regards,<br>The Dr. Kal Team</p>
            `;
            await notificationService.sendEmail(email, emailSubject, `Welcome ${name}!`, emailHtml);

            // Welcome SMS (if phone exists)
            if (newUser.phoneNumber) {
                await notificationService.sendSMS(
                    newUser.phoneNumber,
                    `Welcome to Dr. Kal's Hospital! Your account (${newUser.id}) is ready.`
                );
            }
        } catch (noteError) {
            console.error("Failed to send welcome notifications:", noteError);
            // Don't block registration success
        }

        return NextResponse.json({ success: true, user: { id: newUser.id, email: newUser.email } });

    } catch (error) {
        console.error("Registration Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
