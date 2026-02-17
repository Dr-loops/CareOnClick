require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Testing Prisma connection to Neon...");
        console.log("DB URL (partial):", process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + "..." : "MISSING");

        const userCount = await prisma.user.count();
        console.log("✅ Success! Total users in Neon:", userCount);

        const admin = await prisma.user.findFirst({
            where: { role: 'admin' },
            select: { email: true, verificationStatus: true }
        });
        console.log("Admin account found:", JSON.stringify(admin, null, 2));
    } catch (error) {
        console.error("❌ Prisma Connection Failed!");
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
