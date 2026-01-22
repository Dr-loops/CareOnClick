
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    const email = 'drfast@test.com';
    const password = await bcrypt.hash('password123', 10);

    // Check if exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log("User already exists:", existing.email);
        return;
    }

    const user = await prisma.user.create({
        data: {
            id: 'doc_' + Date.now(),
            name: 'Dr. Fast',
            email,
            password,
            role: 'doctor',
            verificationStatus: 'Verified',
            // Required common fields
            country: 'Ghana',
            region: 'Accra',
            phoneNumber: '1234567890',
            whatsappNumber: '1234567890',
            // Pro fields
            licenseNumber: 'MDC/FAST',
            currentFacility: 'Test Hook Hospital',
            facilityType: 'Private'
        }
    });
    console.log("Created user:", user.email);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
