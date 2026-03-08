const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
    const users = await prisma.user.findMany();
    console.log(`Total Users Found: ${users.length}`);
    users.forEach(u => {
        console.log(`ID: ${u.id} | Role: ${u.role} | Name: ${u.name}`);
    });

    const apps = await prisma.appointment.findMany({ take: 5 });
    console.log(`\nFound ${await prisma.appointment.count()} appointments.`);
    console.log('Sample Appointments (PatientId | ProfId):');
    apps.forEach(a => {
        console.log(`${a.patientId} | ${a.professionalId} | ${a.patientName}`);
    });
}

listUsers().catch(e => console.error(e)).finally(() => prisma.$disconnect());
