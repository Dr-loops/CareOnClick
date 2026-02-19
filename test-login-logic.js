const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testLogin(emailOrId, password) {
    console.log(`Testing login for: ${emailOrId}`);
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: emailOrId.toLowerCase() },
                    { email: emailOrId },
                    { id: emailOrId },
                    { pathNumber: emailOrId }
                ]
            }
        });

        if (!user) {
            console.log("❌ User not found");
            return;
        }

        console.log(`✅ User found: ${user.email}`);
        console.log(`Hash in DB: ${user.password}`);

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            console.log("✅ Password match!");
        } else {
            console.log("❌ Password MISMATCH");
        }
    } catch (err) {
        console.error("error", err);
    }
}

testLogin('test_new@drkal.com', 'password123')
    .finally(() => prisma.$disconnect());
