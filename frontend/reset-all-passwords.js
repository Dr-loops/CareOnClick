const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    try {
        const newPassword = 'password';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log(`🚀 Starting global password reset to: "${newPassword}"...`);

        // Update all users in a single operation
        const result = await prisma.user.updateMany({
            data: {
                password: hashedPassword
            }
        });

        console.log(`✅ Successfully reset passwords for ${result.count} users.`);
        console.log(`📝 Users can now log in with their email and "${newPassword}".`);
        console.log(`🛡️  The system remains flexible; they can change this anytime via their profile settings.`);

    } catch (e) {
        console.error("❌ Global reset failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
