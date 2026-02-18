const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdmin() {
    const adminEmail = 'drkalsvirtualhospital@gmail.com';
    const newPassword = 'DrKal@Secure2026';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(`Attempting to upsert admin user ${adminEmail}...`);

    try {
        const user = await prisma.user.upsert({
            where: { email: adminEmail },
            update: {
                password: hashedPassword,
                verificationStatus: 'Verified',
                role: 'admin'
            },
            create: {
                email: adminEmail,
                password: hashedPassword,
                name: 'System Admin',
                role: 'admin',
                verificationStatus: 'Verified'
            }
        });
        console.log(`✅ SUCCESS: Admin user ${user.email} is ready. Password: ${newPassword}`);
    } catch (error) {
        console.error(`❌ FAILED to upsert admin user:`, error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdmin();
