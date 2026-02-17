const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    try {
        const newPassword = 'password';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log(`🚀 Starting global password reset to: "${newPassword}"...`);

        const users = await prisma.user.findMany();
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });
            console.log(`Updated: ${user.email} (${user.role})`);
        }

        console.log(`✅ Successfully reset all passwords.`);

    } catch (e) {
        console.error("❌ Global reset failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
