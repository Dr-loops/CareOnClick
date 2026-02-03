const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    const counts = {};
    users.forEach(u => {
        counts[u.email] = (counts[u.email] || 0) + 1;
    });
    console.log('--- EMAIL DUPLICATES ---');
    Object.keys(counts).forEach(email => {
        if (counts[email] > 1) console.log(`${email}: ${counts[email]} times`);
    });
    console.log('--- END DUPLICATES ---');
}

main().finally(() => prisma.$disconnect());
