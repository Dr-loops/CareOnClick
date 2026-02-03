import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/crypto';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;
        const isPatient = user.role === 'patient';
        // Basic RBAC: Patients only see their own data. Professionals see all.

        // Audit Log: Record who viewed the data
        await prisma.auditLog.create({
            data: {
                action: isPatient ? 'VIEW_OWN_DATA' : 'VIEW_ALL_DATA',
                actorId: user.id || user.email,
                actorName: user.name || user.email,
                target: isPatient ? `Patient:${user.id}` : 'Full Database',
                details: `User ${user.role} accessed data sync.`,
                timestamp: new Date()
            }
        });

        // Define Filters
        const messageFilter = isPatient ? { OR: [{ senderId: user.id }, { recipientId: user.id }] } : {};
        const notificationFilter = isPatient ? { userId: user.id } : {};

        // For 'users' list, patients need to see Professionals.
        const usersQuery = isPatient ? {
            OR: [
                { id: user.id },
                { role: { not: 'patient' } }
            ]
        } : {};

        const appointmentWhere = isPatient ? { patientId: user.id } : {};
        const recordWhere = isPatient ? { patientId: user.id } : {};

        const [users, appointments, messages, notifications, activity_logs, patient_profiles, records, vitals] = await Promise.all([
            prisma.user.findMany({ where: usersQuery }),
            prisma.appointment.findMany({ where: appointmentWhere }),
            prisma.message.findMany({ where: messageFilter }),
            prisma.notification.findMany({ where: notificationFilter }),
            prisma.auditLog.findMany({
                where: isPatient ? { actorId: user.id } : {},
                take: 100
            }),
            prisma.patientProfile.findMany({ where: isPatient ? { userId: user.id } : {} }),
            prisma.medicalRecord.findMany({ where: recordWhere }),
            prisma.vitalSign.findMany({ where: recordWhere }),
        ]);

        // Decrypt sensitive data for Patient Profiles
        const decryptedProfiles = patient_profiles.map(p => ({
            ...p,
            allergies: decrypt(p.allergies),
            medicalHistory: decrypt(p.medicalHistory),
            currentMedications: decrypt(p.currentMedications)
        }));

        // Decrypt sensitive data for Medical Records
        const decryptedRecords = records.map(r => ({
            ...r,
            structuredData: decrypt(r.structuredData)
        }));

        return NextResponse.json({
            users,
            appointments,
            messages,
            notifications,
            activity_logs,
            patient_profiles: decryptedProfiles, // Send decrypted data to client
            records: decryptedRecords,
            vitals,
            email_logs: []
        });
    } catch (error) {
        console.error("DB Read Error", error);
        return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { collection, item, action, id, updates } = body;

        // Map legacy collection names to Prisma delegates
        let modelDelegate;
        if (collection === 'users') modelDelegate = prisma.user;
        else if (collection === 'appointments') modelDelegate = prisma.appointment;
        else if (collection === 'messages') modelDelegate = prisma.message;
        else if (collection === 'notifications') modelDelegate = prisma.notification;
        else if (collection === 'activity_logs') modelDelegate = prisma.auditLog;
        else if (collection === 'patient_profiles') modelDelegate = prisma.patientProfile;
        else if (collection === 'records') modelDelegate = prisma.medicalRecord; // Mapped from 'records' to 'medicalRecord'
        else if (collection === 'vitals') modelDelegate = prisma.vitalSign; // Legacy Vitals table
        else if (collection === 'email_logs') return NextResponse.json({ success: true });

        if (!modelDelegate) {
            return NextResponse.json({ error: `Collection ${collection} not found` }, { status: 400 });
        }

        // Encryption Layer: Encrypt sensitive fields before saving
        let dataToSave = item ? { ...item } : null;
        let dataToUpdate = updates ? { ...updates } : null;

        if (collection === 'patient_profiles') {
            if (dataToSave) {
                if (dataToSave.allergies) dataToSave.allergies = encrypt(dataToSave.allergies);
                if (dataToSave.medicalHistory) dataToSave.medicalHistory = encrypt(dataToSave.medicalHistory);
                if (dataToSave.currentMedications) dataToSave.currentMedications = encrypt(dataToSave.currentMedications);
            }
            if (dataToUpdate) {
                if (dataToUpdate.allergies) dataToUpdate.allergies = encrypt(dataToUpdate.allergies);
                if (dataToUpdate.medicalHistory) dataToUpdate.medicalHistory = encrypt(dataToUpdate.medicalHistory);
                if (dataToUpdate.currentMedications) dataToUpdate.currentMedications = encrypt(dataToUpdate.currentMedications);
            }
        }

        if (collection === 'records') {
            if (dataToSave && dataToSave.structuredData) {
                dataToSave.structuredData = encrypt(dataToSave.structuredData);
            }
            if (dataToUpdate && dataToUpdate.structuredData) {
                dataToUpdate.structuredData = encrypt(dataToUpdate.structuredData);
            }
        }

        if (action === 'add') {
            const newRecord = await modelDelegate.create({ data: dataToSave });

            // APPOINTMENT CONFIRMATION NOTIFICATIONS
            if (collection === 'appointments' && newRecord) {
                try {
                    // 1. Fetch Patient for Contact Info
                    const patient = await prisma.user.findUnique({ where: { id: newRecord.patientId } });

                    if (patient) {
                        const { date, time, professionalName, amountPaid, balanceDue } = newRecord;
                        const msgBody = `Appointment Confirmed with ${professionalName} on ${new Date(date).toDateString()} at ${time}. Amount: GHS ${amountPaid}. Balance: GHS ${balanceDue}.`;

                        // 2. Send SMS
                        if (patient.phoneNumber) {
                            await notificationService.sendSMS(patient.phoneNumber, `CareOnClick: ${msgBody}`);
                        }

                        // 3. Send Email
                        if (patient.email) {
                            await notificationService.sendEmail(
                                patient.email,
                                "Appointment Confirmation - CareOnClick",
                                msgBody,
                                `
                                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                                    <h2 style="color: #0369a1;">Appointment Confirmed via CareOnClick</h2>
                                    <p>Dear ${patient.name},</p>
                                    <p>Your appointment has been successfully booked.</p>
                                    <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                        <p><strong>Professional:</strong> ${professionalName}</p>
                                        <p><strong>Date:</strong> ${new Date(date).toDateString()}</p>
                                        <p><strong>Time:</strong> ${time}</p>
                                        <p><strong>Paid:</strong> GHS ${amountPaid}</p>
                                        <p><strong>Balance Due:</strong> GHS ${balanceDue}</p>
                                    </div>
                                    <p>Please log in to your dashboard for the video link or more details.</p>
                                </div>
                                `
                            );
                        }
                    }
                } catch (notifyErr) {
                    console.error("Notification Logic Error", notifyErr);
                }
            }

        } else if (action === 'update' || action === 'save') {
            // Handle both email (legacy user ID) and UUIDs
            let whereClause = { id };

            if (collection === 'users' && id.includes('@')) {
                whereClause = { email: id };
            }
            // Patient Profile Logic: It uses 'userId' or 'pathNumber' as key often?
            // In global_sync.js: savePatientProfile uses 'pathNumber' as key. 
            // In Prisma, we have 'id' (CUID) and 'userId' (User relation).
            // We need to match the logic. existing logic in global_sync sends pathNumber as ID.
            // But PatientProfile in Prisma has 'userId' unique.
            // Let's assume for now the ID passed is the ID of the record, OR we might need to upsert by userId.

            // Fix for Patient Profiles Sync:
            // global_sync sends 'pathNumber' as 'id'. 
            // The PatientProfile model probably creates ID automatically.
            // If we are updating, we need to find the profile.
            // Strategy: Try updating by id. If fails/not found, handle specialized lookup.
            // ACTUALLY: global_sync passes the entire profile object in 'updates' or 'item'?
            // global_sync: syncToServer('patient_profiles', 'update', null, pathNumber, profiles[pathNumber]);
            // So 'id' is pathNumber. 'updates' is the profile object.

            // WARNING: If 'id' is pathNumber, we can't use it directly as Prisma ID if it's not the PK.
            // But we don't store pathNumber in PatientProfile, we store it in User.
            // We can try to find User by pathNumber, getting their profile.

            // To simplify for this phase:
            // We will attempt to update where { userId: ... } if we can resolve it, or skip if complex.
            // Given the complexity of mapping legacy 'pathNumber' to Prisma relations on the fly, 
            // I'll stick to standard ID updates if possible, or add a simplistic fallback.

            if (collection === 'patient_profiles') {
                // SPECIAL HANDLER: Update both User and PatientProfile
                // The 'id' passed here is usually 'pathNumber' (from frontend global_sync) or 'userId'
                // The 'updates' object contains mixture of User fields (name, email, phone) and Profile fields (age, address, history)

                console.log("Processing Patient Profile Update:", id, updates);

                // 1. Find the User first
                let user = await prisma.user.findUnique({
                    where: { id }
                });

                if (!user) {
                    // Try looking up by pathNumber
                    user = await prisma.user.findUnique({
                        where: { pathNumber: id }
                    });
                }

                if (!user) {
                    user = await prisma.user.findUnique({
                        where: { email: id } // Fallback if email passed as ID
                    });
                }

                if (!user) {
                    throw new Error(`User not found for identifier: ${id}`);
                }

                // 2. Prepare Data Split
                // User Fields: name, email, phone, region, country
                const userFields = {};
                if (updates.fullName) userFields.name = updates.fullName;
                if (updates.email) userFields.email = updates.email;
                if (updates.phone) userFields.phoneNumber = updates.phone;
                if (updates.region) userFields.region = updates.region;
                if (updates.country) userFields.country = updates.country; // Assuming 'country' added to schema in previous step? Schema has it? Yes verified.

                // Profile Fields: address, gender, dateOfBirth (from age), medicalHistory, allergies
                const profileFields = {};
                if (updates.address) profileFields.address = updates.address;
                if (updates.sex) profileFields.gender = updates.sex;
                if (updates.region) profileFields.region = updates.region; // Sync to Profile
                if (updates.phone) profileFields.phoneNumber = updates.phone; // Sync to Profile

                if (updates.allergies) profileFields.allergies = encrypt(updates.allergies);
                if (updates.medicalHistory) profileFields.medicalHistory = encrypt(updates.medicalHistory);
                if (updates.currentMedications) profileFields.currentMedications = encrypt(updates.currentMedications);

                // Calculate DOB from Age if provided (approximate)
                if (updates.age) {
                    const ageMetadata = parseInt(updates.age);
                    if (!isNaN(ageMetadata)) {
                        const today = new Date();
                        const birthYear = today.getFullYear() - ageMetadata;
                        profileFields.dateOfBirth = new Date(`${birthYear}-01-01`); // Approx Jan 1st
                    }
                }

                // 3. Perform Transactional Update
                await prisma.$transaction([
                    prisma.user.update({
                        where: { id: user.id },
                        data: userFields
                    }),
                    prisma.patientProfile.upsert({
                        where: { userId: user.id },
                        create: {
                            userId: user.id,
                            ...profileFields
                        },
                        update: profileFields
                    })
                ]);

                console.log("Successfully updated/upserted profile for User:", user.email);
                return NextResponse.json({ success: true });
            }

            try {
                await modelDelegate.update({
                    where: whereClause,
                    data: dataToUpdate
                });
            } catch (e) {
                console.error("Standard update failed, trying fallback...", e.message);
                throw e;
            }
        } else if (action === 'delete') {
            if (collection === 'users') {
                // Manual Cascade for Relations without onDelete: Cascade in Schema
                await prisma.appointment.deleteMany({
                    where: { OR: [{ patientId: id }, { professionalId: id }] }
                });
                await prisma.message.deleteMany({
                    where: { senderId: id }
                });
                // PatientProfile, Notification, VitalSign, Task have Cascade configured in Schema
            }
            await modelDelegate.delete({ where: { id } });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("DB Write Error", error);
        // Return success even on error to prevent UI blocking for this migration phase, 
        // but verify in logs.
        return NextResponse.json({ error: 'Failed to write to database: ' + error.message }, { status: 500 });
    }
}
