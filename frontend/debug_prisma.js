const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- DIAGNOSTIC START ---');
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'UNDEFINED');

    try {
        console.log('Trying to count users...');
        const count = await prisma.user.count();
        console.log('User count:', count);

        console.log('Trying to fetch one user...');
        const user = await prisma.user.findFirst();
        console.log('Sample user:', user ? { id: user.id, role: user.role } : 'NONE');

    } catch (e) {
        console.error('DIAGNOSTIC FAILED:');
        console.error('Error name:', e.name);
        console.error('Error message:', e.message);
        console.error('Error code:', e.code);
        console.error('Stack trace:', e.stack);
    } finally {
        await prisma.$disconnect();
        console.log('--- DIAGNOSTIC END ---');
    }
}

main();
