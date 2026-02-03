const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'file:./backend/prisma/dev.db',
        },
    },
});

async function main() {
    try {
        const users = await prisma.user.findMany();
        console.log('--- BACKEND SQLITE USERS ---');
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.log('Failed to read backend sqlite:', e.message);
    }
}

main().finally(() => prisma.$disconnect());
