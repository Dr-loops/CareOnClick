require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log("DB URL:", process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + "..." : "NOT FOUND");

async function main() {
    try {
        const admin = await prisma.user.findFirst({
            where: { role: 'admin' }
        });
        console.log("--- ADMIN USER ---");
        console.log(JSON.stringify(admin, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
