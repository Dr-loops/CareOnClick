const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_Y7k1HpEqJetO@ep-round-breeze-ahc91fmo.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
        }
    }
});

async function main() {
    const adminEmail = "drkalsvirtualhospital@gmail.com";
    const adminPass = "DrKal@Secure2026";
    const hashedAdmin = await bcrypt.hash(adminPass, 10);

    const patientEmail = "jfrytol22@gmail.com";
    const patientPass = "123456";
    const hashedPatient = await bcrypt.hash(patientPass, 10);

    console.log('--- REPAIRING DATABASE USERS ---');

    // Deleting possible corrupt entries
    await prisma.user.deleteMany({
        where: { email: { in: [adminEmail, patientEmail] } }
    });
    console.log('Cleared existing local entries.');

    // Create Admin
    await prisma.user.create({
        data: {
            email: adminEmail,
            password: hashedAdmin,
            name: "Dr. Kal Admin",
            role: "admin",
            id: "admin_01",
            verificationStatus: "Verified"
        }
    });
    console.log(`✅ Admin Created: ${adminEmail} (Role: admin, Pass: ${adminPass})`);

    // Create Patient
    await prisma.user.create({
        data: {
            email: patientEmail,
            password: hashedPatient,
            name: "Julius Kaletsi",
            role: "patient",
            id: "PATH0001",
            pathNumber: "PATH0001",
            verificationStatus: "Verified"
        }
    });
    console.log(`✅ Patient Created: ${patientEmail} (Role: patient, Pass: ${patientPass})`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
