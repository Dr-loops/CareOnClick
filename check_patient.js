
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'patient@drkal.com';
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log(`User ${email} NOT FOUND.`);
        return;
    }

    console.log(`User found: ${user.email}, Role: ${user.role}, ID: ${user.id}`);
    console.log(`Stored Hash: ${user.password}`);

    const candidates = ['password', 'password123'];
    for (const pwd of candidates) {
        const match = await bcrypt.compare(pwd, user.password);
        console.log(`Password candidate '${pwd}': ${match ? 'MATCH' : 'NO MATCH'}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
