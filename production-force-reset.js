const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use the exact database URL from the user's frontend .env
const DATABASE_URL = "postgresql://neondb_owner:npg_Y7k1HpEqJetO@ep-round-breeze-ahc91fmo.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL
        }
    }
});

async function nuclearReset() {
    const email = "drkalsvirtualhospital@gmail.com";
    const password = "DrKal@Secure2026";
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`☢️  NUCLEAR OPTION: Forcing Admin Credentials for: ${email}`);

    try {
        // 1. Find the user
        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            console.log("User found. Forcing update...");
            await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    role: 'admin',
                    verificationStatus: 'Approved'
                }
            });
            console.log("✅ User UPDATED.");
        } else {
            console.log("User NOT FOUND. Creating new admin...");
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: "Dr. Kal Admin",
                    role: 'admin',
                    verificationStatus: 'Approved'
                }
            });
            console.log("✅ User CREATED.");
        }

        console.log("\n--- VERIFIED PRODUCTION CREDENTIALS ---");
        console.log(`URL:      https://<your-vercel-domain>/login`);
        console.log(`EMAIL:    ${email}`);
        console.log(`PASSWORD: ${password}`);
        console.log("---------------------------------------\n");

    } catch (e) {
        console.error("❌ Nuclear reset failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

nuclearReset();
