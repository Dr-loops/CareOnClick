
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    const email = 'patient@drkal.com';
    const password = await bcrypt.hash('password123', 10);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log("User already exists, updating password...");
        await prisma.user.update({
            where: { email },
            data: { password }
        });
        console.log("Updated user:", email);
    } else {
        try {
            const user = await prisma.user.create({
                data: {
                    id: 'pat1',
                    name: 'John Doe',
                    email,
                    password,
                    role: 'patient',
                    verificationStatus: 'Verified',
                    pathNumber: 'PATH-1234',
                    country: 'Ghana',
                    region: 'Accra', // Required field
                    phoneNumber: '555-0123'
                }
            });
            console.log("Created user:", user.email);
        } catch (e) {
            console.error("Failed to create user (maybe ID exists?):", e.message);
        }
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
