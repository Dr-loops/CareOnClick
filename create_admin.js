const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'frontend', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrl = envContent.match(/DATABASE_URL="([^"]+)"/)[1];

const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
});

async function main() {
    const email = 'drkalsvirtualhospital@gmail.com';
    const password = 'DrKal@Secure2026';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creating admin user in Neon...');
    const user = await prisma.user.upsert({
        where: { email },
        update: { password: hashedPassword },
        create: {
            email,
            password: hashedPassword,
            name: 'Dr. Kal Admin',
            role: 'admin',
            verificationStatus: 'Verified'
        }
    });

    console.log(`✅ Admin user ${user.email} created/updated in cloud database!`);
    console.log(`🔑 Login with: ${user.email} / ${password}`);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
