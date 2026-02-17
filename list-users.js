const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: { email: true, role: true, name: true }
    });
    console.log('USERS_LIST_START');
    console.log(JSON.stringify(users, null, 2));
    console.log('USERS_LIST_END');
}

main().finally(() => prisma.$disconnect());
