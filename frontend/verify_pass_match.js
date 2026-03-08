const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const passwordToTest = 'DrKal@Secure2026';
    const email = 'drkalsvirtualhospital@gmail.com';
    
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('USER_NOT_FOUND');
            return;
        }

        const match = await bcrypt.compare(passwordToTest, user.password);
        console.log(`PASSWORD_MATCH: ${match}`);
        console.log(`STORED_HASH: ${user.password}`);
    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
