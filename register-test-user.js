const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function registerTestUser() {
    const email = 'test_new@drkal.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        console.log('Registering test user...');
        const user = await prisma.user.create({
            data: {
                id: 'TEST_USER_001',
                email: email,
                name: 'Test User',
                password: hashedPassword,
                role: 'patient',
                verificationStatus: 'Verified'
            }
        });
        console.log('✅ Registered:', user.email);
    } catch (err) {
        console.error('Error during registration:', err);
    }
}

registerTestUser().finally(() => prisma.$disconnect());
