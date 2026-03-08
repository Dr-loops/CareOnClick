const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'drkalsvirtualhospital@gmail.com';
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            console.log(`EMAIL_LENGTH: ${user.email.length}`);
            console.log(`EMAIL_HEX: ${Buffer.from(user.email).toString('hex')}`);
            console.log(`ROLE: ${user.role}`);
            console.log(`STATUS: ${user.verificationStatus}`);
        } else {
            console.log('USER_NOT_FOUND_BY_UNIQUE_EMAIL');
            // Try insensitive
            const users = await prisma.user.findMany();
            const match = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (match) {
                console.log(`PARTIAL_MATCH_FOUND: ${match.email}`);
                console.log(`PARTIAL_MATCH_HEX: ${Buffer.from(match.email).toString('hex')}`);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
