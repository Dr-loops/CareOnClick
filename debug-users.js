const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- ENTIRE USER TABLE ---');
    const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true, name: true, pathNumber: true }
    });
    console.log(JSON.stringify(users, null, 2));
}

main().finally(() => prisma.$disconnect());
