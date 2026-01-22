
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('Connecting to DB...');
        const users = await prisma.user.findMany({
            take: 3
        });
        console.log('Users found:', users.length);
        if (users.length > 0) {
            console.log('First User:', users[0]);
        } else {
            console.log('No users found. Creating a test patient...');
            // Create a dummy patient if none exists
            const newPatient = await prisma.user.create({
                data: {
                    email: `patient-${Date.now()}@example.com`,
                    password: 'hashed-password',
                    name: 'Test Patient',
                    role: 'PATIENT',
                    pathNumber: `PATH-${Date.now()}`
                }
            });
            console.log('Created User:', newPatient);
        }
    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
