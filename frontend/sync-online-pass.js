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
    const patientEmail = "jfrytol22@gmail.com";

    const adminPass = "DrKal@Secure2026";
    const patientPass = "123456";

    const hashedAdmin = await bcrypt.hash(adminPass, 10);
    const hashedPatient = await bcrypt.hash(patientPass, 10);

    console.log('Synchronizing local database with online credentials...');

    await prisma.user.updateMany({
        where: { email: adminEmail },
        data: { password: hashedAdmin }
    });
    console.log(`Admin (${adminEmail}) password updated to match online.`);

    await prisma.user.updateMany({
        where: { email: patientEmail },
        data: { password: hashedPatient }
    });
    console.log(`Patient (${patientEmail}) password updated to match online.`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
