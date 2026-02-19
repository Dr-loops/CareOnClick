const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany();
        fs.writeFileSync('users_dump.json', JSON.stringify(users, null, 2));
        console.log(`Dumped ${users.length} users to users_dump.json`);
    } catch (err) {
        console.error('ERROR during dump:', err);
    }
}

main().finally(() => prisma.$disconnect());
