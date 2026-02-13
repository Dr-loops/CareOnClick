const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.message.count();
        console.log(`Current message count in DB: ${count}`);

        const latest = await prisma.message.findMany({
            take: 5,
            orderBy: { timestamp: 'desc' }
        });
        console.log("Latest messages:", JSON.stringify(latest, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
