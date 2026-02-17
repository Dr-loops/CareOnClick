const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs'); // Assuming bcryptjs is installed

async function testAuthLogic(email, password) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('User not found');
            return;
        }

        console.log(`Checking user: ${user.email}, Status: ${user.verificationStatus}`);

        // Simulate auth logic
        if (user.verificationStatus !== 'Verified') {
            console.log(`[TEST] ⚠️ BLOCK: User ${user.email} is ${user.verificationStatus} (not Verified)`);
            console.log('Test PASSED: Logic would block this user.');
        } else {
            console.log(`[TEST] ✅ ALLOW: User ${user.email} is Verified.`);
            console.log('Test FAILED: Logic would allow this user (expected block for new professional).');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Get the latest doctor created
async function run() {
    const user = await prisma.user.findFirst({
        where: { role: 'doctor' },
        orderBy: { createdAt: 'desc' }
    });
    if (user) {
        await testAuthLogic(user.email, 'password123');
    } else {
        console.log('No doctor found to test.');
    }
}

run();
