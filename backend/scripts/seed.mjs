import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    if (!fs.existsSync(dbPath)) {
        console.error("No db.json found");
        return;
    }

    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Maps to resolve relations
    const pathNumberToUserId = {};
    const emailToUserId = {};

    console.log("Seeding Users...");
    for (const u of data.users) {
        // Hash password
        const hashedPassword = await bcrypt.hash(u.password, 10);

        try {
            const user = await prisma.user.create({
                data: {
                    id: u.id || undefined, // Use existing ID if possible
                    email: u.email,
                    password: hashedPassword,
                    name: u.name,
                    role: u.role,
                    pathNumber: u.pathNumber,
                    verificationStatus: u.verificationStatus || 'Pending'
                }
            });

            if (u.pathNumber) pathNumberToUserId[u.pathNumber] = user.id;
            emailToUserId[u.email] = user.id;
            // Also map ID to itself for easy lookup
            if (u.id) {
                pathNumberToUserId[u.id] = user.id; // Fallback
                emailToUserId[u.id] = user.id;
            }

        } catch (e) {
            console.warn(`Skipping user ${u.email}: ${e.message}`);
        }
    }

    console.log("Seeding Appointments...");
    for (const app of data.appointments) {
        // Resolve Patient ID
        // Try exact match, then pathNumber lookup
        let patientId = app.patientId;
        if (pathNumberToUserId[patientId]) patientId = pathNumberToUserId[patientId];

        // Resolve Professional ID
        let professionalId = app.professionalId;
        // Check if professional exists, if not, maybe it's missing in users array
        // For seed safety, we check if user exists in DB or map

        try {
            await prisma.appointment.create({
                data: {
                    id: app.id,
                    patientId: patientId, // Must exist in User table
                    patientName: app.patientName,
                    professionalId: professionalId,
                    professionalName: app.professionalName,
                    professionalCategory: app.professionalCategory,
                    date: new Date(app.date),
                    time: app.time,
                    type: app.type,
                    reason: app.reason,
                    status: app.status,
                    paymentStatus: app.paymentStatus,
                    amountPaid: app.amountPaid || 0,
                    balanceDue: app.balanceDue || 0,
                    createdAt: app.createdAt ? new Date(app.createdAt) : new Date()
                }
            });
        } catch (e) {
            console.warn(`Skipping appointment ${app.id} (Patient: ${app.patientId} -> ${patientId}): ${e.message}`);
        }
    }

    console.log("Seeding Complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
