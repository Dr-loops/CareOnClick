const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function check() {
    const adminEmail = "drkalsvirtualhospital@gmail.com";
    const onlineAdminPassword = "DrKal@Secure2026";
    const onlinePatientPassword = "123456";
    const patientEmail = "jfrytol22@gmail.com";

    console.log('--- DATABASE SYNC CHECK ---');
    console.log(`Checking connection: ${process.env.DATABASE_URL}`);

    const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (admin) {
        const adminMatch = await bcrypt.compare(onlineAdminPassword, admin.password);
        console.log(`Admin Found: ${admin.email}`);
        console.log(`Online Password Match: ${adminMatch}`);
    } else {
        console.log('Admin NOT FOUND in this database.');
    }

    const patient = await prisma.user.findUnique({ where: { email: patientEmail } });
    if (patient) {
        const patientMatch = await bcrypt.compare(onlinePatientPassword, patient.password);
        console.log(`Patient Found: ${patient.email}`);
        console.log(`Online Password Match: ${patientMatch}`);
    } else {
        console.log('Patient NOT FOUND in this database.');
    }
}

check().finally(() => prisma.$disconnect());
