const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('--- DB USERS ---');
    users.forEach(u => {
        console.log(`- ${u.email} (ID: ${u.id}, Role: ${u.role})`);
    });
    console.log('--- END DB USERS ---');
}

main().finally(() => prisma.$disconnect());
