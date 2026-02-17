const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdmin() {
    const adminEmail = 'drkalsvirtualhospital@gmail.com';
    const newPassword = 'AdminPassword123!';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(`Attempting to reset password for ${adminEmail}...`);

    try {
        const user = await prisma.user.update({
            where: { email: adminEmail },
            data: {
                password: hashedPassword,
                verificationStatus: 'Verified'
            }
        });
        console.log(`✅ SUCCESS: Password for ${user.email} (Role: ${user.role}) has been reset to: ${newPassword}`);
    } catch (error) {
        console.error(`❌ FAILED: Could not find user with email ${adminEmail}.`);
        console.log("Checking for existing users...");
        const users = await prisma.user.findMany({ select: { email: true, role: true } });
        console.log("Existing users:", users);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdmin();
