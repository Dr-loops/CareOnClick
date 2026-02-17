const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    try {
        const email = 'admin@drkal.com';
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        console.log("✅ Admin password reset to 'admin123' for", email);
    } catch (e) {
        console.error("❌ Reset failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
