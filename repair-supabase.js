const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const supabaseUrl = "postgresql://postgres:DrKalsV%402026@db.xulniqmmnvnxmsphayjf.supabase.co:5432/postgres?schema=public&sslmode=require&pgbouncer=true";

const prisma = new PrismaClient({
    datasources: {
        db: { url: supabaseUrl }
    }
});

async function main() {
    const adminEmail = "drkalsvirtualhospital@gmail.com";
    const adminPass = "DrKal@Secure2026";
    const hashedAdmin = await bcrypt.hash(adminPass, 10);

    const patientEmail = "jfrytol22@gmail.com";
    const patientPass = "123456";
    const hashedPatient = await bcrypt.hash(patientPass, 10);

    console.log('--- REPAIRING SUPABASE DATABASE (REAL ONLINE) ---');

    try {
        // Upsert Admin
        await prisma.user.upsert({
            where: { email: adminEmail },
            update: { password: hashedAdmin, role: 'admin' },
            create: {
                email: adminEmail,
                password: hashedAdmin,
                name: "Dr. Kal Admin",
                role: "admin",
                id: "admin_01",
                verificationStatus: "Verified"
            }
        });
        console.log(`✅ Supabase Admin Updated: ${adminEmail}`);

        // Upsert Patient
        await prisma.user.upsert({
            where: { email: patientEmail },
            update: { password: hashedPatient, role: 'patient' },
            create: {
                email: patientEmail,
                password: hashedPatient,
                name: "Julius Kaletsi",
                id: "PATH0001",
                role: "patient",
                pathNumber: "PATH0001",
                verificationStatus: "Verified"
            }
        });
        console.log(`✅ Supabase Patient Updated: ${patientEmail}`);
    } catch (e) {
        console.error('Failed to update Supabase:', e.message);
    }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
