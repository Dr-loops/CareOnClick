
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Checking Users in DB ---');
        const users = await prisma.user.findMany();
        console.log(`Found ${users.length} users.`);
        if (users.length > 0) {
            users.forEach(user => {
                console.log(`- ${user.name} | ${user.email} | ID: ${user.id} | Status: ${user.verificationStatus} | Role: ${user.role}`);
            });
        }
    } catch (err) {
        console.error('ERROR during check:', err);
    }
}

main()
    .finally(() => prisma.$disconnect());
