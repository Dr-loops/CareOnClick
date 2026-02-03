const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    fs.writeFileSync('users_dump.json', JSON.stringify(users, null, 2));
    console.log('Dumped users to users_dump.json');
}

main().finally(() => prisma.$disconnect());
