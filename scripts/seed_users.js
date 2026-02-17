const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Configuration
const ROLES = [
    'admin',
    'doctor',
    'nurse',
    'pharmacist',
    'scientist',
    'dietician',
    'psychologist',
    'patient'
];
const COUNT_PER_ROLE = 3;
const DEFAULT_PASSWORD = 'password123';

// Mock Location Data (Subset)
const GHANA_REGIONS = [
    "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra", "North East",
    "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta", "Western", "Western North"
];

const generateUser = (role) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const region = faker.helpers.arrayElement(GHANA_REGIONS);

    return {
        id: faker.string.uuid(),
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: DEFAULT_PASSWORD, // Will be hashed
        role: role,
        phoneNumber: '+233' + faker.string.numeric(9),
        whatsappNumber: '+233' + faker.string.numeric(9),
        region: region,
        country: 'Ghana',
        verificationStatus: 'Verified',
        licenseNumber: role === 'patient' || role === 'admin' ? null : `LIC-${faker.string.alphanumeric(6).toUpperCase()}`,
        facilityType: role === 'patient' || role === 'admin' ? null : faker.helpers.arrayElement(['Government', 'Private', 'Mission']),
        currentFacility: role === 'patient' || role === 'admin' ? null : `${faker.location.city()} Hospital`,
        pathNumber: role === 'patient' ? `PATH-${faker.string.numeric(6)}` : null,
        createdAt: new Date().toISOString()
    };
};

async function seed() {
    console.log('🌱 Seeding Users...');
    const prisma = new PrismaClient();

    try {
        // 2. Clear Existing Data (Order matters due to Foreign Keys)
        console.log('🗑️ Clearing existing data...');
        // Delete dependent records first
        await prisma.patientProfile.deleteMany({});
        await prisma.medicalRecord.deleteMany({});
        await prisma.appointment.deleteMany({});
        await prisma.message.deleteMany({});
        await prisma.notification.deleteMany({});
        await prisma.auditLog.deleteMany({});
        // Finally delete users
        await prisma.user.deleteMany({});

        const newUsers = [];

        // 3. Generate New Users
        for (const role of ROLES) {
            for (let i = 0; i < COUNT_PER_ROLE; i++) {
                // Ensure at least one predictable email for the login page list
                let user = generateUser(role);
                if (i === 0) {
                    user.email = `${role}@drkal.com`;
                }
                newUsers.push(user);
            }
        }

        // 4. Write to DB
        console.log(`📝 Creating ${newUsers.length} new users...`);

        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

        for (const u of newUsers) {
            u.password = hashedPassword;
            await prisma.user.create({ data: u });
        }

        console.log('✅ Seeding Complete!');

        const credentialsList = ROLES.map(role => {
            return {
                role: role,
                email: `${role}@drkal.com`,
                password: DEFAULT_PASSWORD
            };
        });

        console.log('📋 Test Credentials:');
        console.table(credentialsList);

    } catch (e) {
        console.error('❌ Seeding Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
