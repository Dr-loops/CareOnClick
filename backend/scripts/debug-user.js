const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    const email = 'drkalsvirtualhospital@gmail.com';
    console.log(`Searching for user with email: [${email}]`);

    // Try exact match
    let user = await prisma.user.findUnique({ where: { email } });
    console.log(`findUnique result:`, user);

    if (!user) {
        // Try findFirst
        user = await prisma.user.findFirst({ where: { email } });
        console.log(`findFirst result:`, user);
    }

    if (!user) {
        // Search by role
        const admins = await prisma.user.findMany({ where: { role: 'admin' } });
        console.log(`Admins found:`, admins);
    }

    await prisma.$disconnect();
}

debug();
