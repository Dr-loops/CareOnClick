const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
    console.log('--- DATABASE DIAGNOSIS ---');

    const userCount = await prisma.user.count();
    console.log('Total Users:', userCount);

    const users = await prisma.user.findMany();
    console.log('\nUsers by Role:');
    const roles = {};
    users.forEach(u => {
        roles[u.role] = (roles[u.role] || 0) + 1;
        console.log(`- ID: ${u.id}, Name: ${u.name}, Role: "${u.role}", Email: ${u.email}`);
    });
    console.log('Role counts:', roles);

    const appointmentCount = await prisma.appointment.count();
    console.log('\nTotal Appointments:', appointmentCount);

    if (appointmentCount > 0) {
        const firstApp = await prisma.appointment.findFirst();
        console.log('Example Appointment:', firstApp);
    }

    const patientProfiles = await prisma.patientProfile.count();
    console.log('\nTotal Patient Profiles:', patientProfiles);
}

diagnose()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
