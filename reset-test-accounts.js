const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    try {
        const password = 'Password123!';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Reset specific known roles for testing
        const rolesToReset = ['doctor', 'nurse', 'patient', 'psychologist', 'dietician', 'pharmacy'];

        console.log(`Resetting passwords for main roles to: ${password}\n`);

        for (const role of rolesToReset) {
            const user = await prisma.user.findFirst({ where: { role } });
            if (user) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { password: hashedPassword }
                });
                console.log(`✅ [${role}] Reset: ${user.email}`);
            } else {
                console.log(`ℹ️ [${role}] No user found with this role.`);
            }
        }

    } catch (e) {
        console.error("❌ Reset failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
