const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function reset() {
    const adminEmail = "drkalsvirtualhospital@gmail.com";
    const patientEmail = "jfrytol22@gmail.com";
    const newPassword = "DefaultPassword2026!"; // Unified password for both
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log('Resetting passwords for synchronized access...');

    // Update Admin
    const admin = await prisma.user.updateMany({
        where: { email: adminEmail },
        data: { password: hashedPassword }
    });
    console.log(`Admin (${adminEmail}): ${admin.count > 0 ? 'UPDATED' : 'NOT FOUND'}`);

    // Update Patient
    const patient = await prisma.user.updateMany({
        where: { email: patientEmail },
        data: { password: hashedPassword }
    });
    console.log(`Patient (${patientEmail}): ${patient.count > 0 ? 'UPDATED' : 'NOT FOUND'}`);

    console.log('\n--- LOGIN CREDENTIALS ---');
    console.log(`EMAIL: ${adminEmail} OR ${patientEmail}`);
    console.log(`PASSWORD: ${newPassword}`);
}

reset()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
