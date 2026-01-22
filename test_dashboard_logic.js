
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulateDashboard() {
    // 1. Fetch appointments like the API does
    const allApps = await prisma.appointment.findMany();

    // 2. Simulate Frontend Filtering
    // Felix's ID from previous check: e07289d8-ecd1-4... (partial, let's look it up dynamically)
    const felix = await prisma.user.findFirst({
        where: { name: { contains: 'Felix' } }
    });

    if (!felix) {
        console.log('Test Failed: Felix not found');
        return;
    }

    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

    console.log('--- SIMULATION START ---');
    console.log(`User: ${felix.name} (ID: ${felix.id})`);
    console.log(`TodayStr (Frontend Calc): ${todayStr}`);

    const filtered = allApps.filter(a => {
        // Simulate frontend date parsing
        const appDateRaw = a.date.toISOString(); // DB returns Date object, API sends ISO string
        let appDateStr = appDateRaw;

        if (appDateRaw && appDateRaw.includes('T')) {
            appDateStr = appDateRaw.split('T')[0];
        }

        const matchUser = (a.professionalId === felix.id);
        const matchDate = appDateStr === todayStr;

        if (matchUser) {
            console.log(`Checking App ${a.id}: UserMatch=YES, DateMatch=${matchDate ? 'YES' : 'NO'} (${appDateStr} vs ${todayStr})`);
        }

        return matchUser && matchDate;
    });

    console.log(`Total Matches: ${filtered.length}`);
}

simulateDashboard()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
