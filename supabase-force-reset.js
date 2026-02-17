const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Corrected URL from check-supabase.js
const DATABASE_URL = "postgresql://postgres:DrKalsV%402026@db.xulniqmmnvnxmsphayjf.supabase.co:5432/postgres?schema=public&sslmode=require&pgbouncer=true";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL
        }
    }
});

async function supabaseReset() {
    const email = "drkalsvirtualhospital@gmail.com";
    const password = "DrKal@Secure2026";
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`🚀 RESETTING SUPABASE ADMIN: ${email}`);

    try {
        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            console.log("User found in Supabase. Updating password and role...");
            await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    role: 'admin',
                    verificationStatus: 'Approved'
                }
            });
            console.log("✅ Supabase User UPDATED.");
        } else {
            console.log("User NOT FOUND in Supabase. Creating new admin...");
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: "Dr. Kal Admin",
                    role: 'admin',
                    verificationStatus: 'Approved'
                }
            });
            console.log("✅ Supabase User CREATED.");
        }

        console.log("\n--- VERIFIED SUPABASE CREDENTIALS ---");
        console.log(`EMAIL:    ${email}`);
        console.log(`PASSWORD: ${password}`);
        console.log("---------------------------------------\n");

    } catch (e) {
        console.error("❌ Supabase reset failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

supabaseReset();
