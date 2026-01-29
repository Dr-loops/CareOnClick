
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migratePatients() {
    console.log("Starting Patient ID Migration...");
    try {
        const patients = await prisma.user.findMany({
            where: { role: 'patient' },
            orderBy: { createdAt: 'asc' },
            include: { profile: true } // Include profile to easy copy
        });

        console.log(`Found ${patients.length} patients to migrate.`);

        let counter = 1;

        for (const oldUser of patients) {
            const newId = `PATH${counter.toString().padStart(4, '0')}`;
            counter++;

            console.log(`Migrating ${oldUser.name} (${oldUser.id}) -> ${newId}`);

            // 1. Rename old user email to free it up
            const tempEmail = `temp_${Date.now()}_${oldUser.email}`;
            await prisma.user.update({
                where: { id: oldUser.id },
                data: { email: tempEmail }
            });

            // 2. Create New User
            // We need to exclude 'id', 'createdAt', 'updatedAt' from copy effectively, and relations
            // But we want to preserve 'createdAt' if possible? No, let's just make new one.
            // Actually, preserving createdAt is nice.
            const { id, profile, appointmentsAsPatient, appointmentsAsProfessional, sentMessages, notifications, ...userData } = oldUser;

            // Fix role just in case
            userData.role = 'patient';
            userData.pathNumber = newId;

            const newUser = await prisma.user.create({
                data: {
                    ...userData,
                    id: newId,
                }
            });

            // 3. Move Related Records
            // PatientProfile (Has One, and copy manually or update?) 
            // The old user still has the profile linked? No, we didn't include it in update.
            // Actually, profile has userId foreign key. We can update it!
            // But we need to handle the unique constraint on userId in profile.
            // If we update profile userId, it moves to new user.

            // Check if profile exists
            const existingProfile = await prisma.patientProfile.findUnique({ where: { userId: oldUser.id } });
            if (existingProfile) {
                await prisma.patientProfile.update({
                    where: { id: existingProfile.id },
                    data: { userId: newUser.id }
                });
            }

            // Appointments
            await prisma.appointment.updateMany({
                where: { patientId: oldUser.id },
                data: { patientId: newUser.id }
            });

            // Vitals
            await prisma.vitalSign.updateMany({
                where: { patientId: oldUser.id },
                data: { patientId: newUser.id }
            });

            // Tasks
            await prisma.task.updateMany({
                where: { patientId: oldUser.id },
                data: { patientId: newUser.id }
            });

            // MedicalRecords (No relation, string match)
            await prisma.medicalRecord.updateMany({
                where: { patientId: oldUser.id },
                data: { patientId: newUser.id }
            });

            // Notifications
            await prisma.notification.updateMany({
                where: { userId: oldUser.id },
                data: { userId: newUser.id }
            });

            // Messages (As Sender or Recipient)
            // Careful: 'role' is 'patient', so usually 'patient' sends or receives?
            await prisma.message.updateMany({
                where: { senderId: oldUser.id },
                data: { senderId: newUser.id }
            });
            await prisma.message.updateMany({
                where: { recipientId: oldUser.id },
                data: { recipientId: newUser.id }
            });

            // 4. Delete Old User
            await prisma.user.delete({ where: { id: oldUser.id } });
        }

        console.log("Migration Complete.");

    } catch (e) {
        console.error("Migration Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

migratePatients();
