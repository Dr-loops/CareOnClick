const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        console.log(`Connection Successful. User count: ${userCount}`);
    } catch (e) {
        console.error("Connection Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
