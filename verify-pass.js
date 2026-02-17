const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkPassword(email, rawPassword) {
    console.log(`Checking password for: ${email}`);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log("❌ User not found in DB.");
        return;
    }

    console.log("User found. Role:", user.role);
    console.log("Hash in DB:", user.password);

    const match = await bcrypt.compare(rawPassword, user.password);
    if (match) {
        console.log("✅ SUCCESS: Password matches the hash in DB.");
    } else {
        console.log("❌ FAIL: Password does NOT match the hash in DB.");
    }
}

const args = process.argv.slice(2);
const email = args[0] || 'drkalsvirtualhospital@gmail.com';
const password = args[1] || 'password'; // Trying 'password' as it's the common reset value

checkPassword(email, password)
    .then(() => prisma.$disconnect())
    .catch(e => {
        console.error(e);
        prisma.$disconnect();
    });
