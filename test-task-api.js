
const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

async function testApi() {
    try {
        const prisma = new PrismaClient();
        let patient = await prisma.user.findFirst({ where: { role: 'PATIENT' } });
        if (!patient) {
            console.log('No PATIENT found, fetching any user...');
            patient = await prisma.user.findFirst();
        }
        await prisma.$disconnect();

        if (!patient) {
            console.error('No user found in DB at all.');
            return;
        }

        console.log(`Testing POST /api/tasks with Patient ID: ${patient.id}...`);
        const res = await fetch('http://localhost:3000/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patientId: patient.id,
                description: 'Test Task from Script',
                priority: 'Urgent'
            })
        });

        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);

        if (res.ok) {
            console.log('POST Success. Testing GET...');
            const getRes = await fetch('http://localhost:3000/api/tasks');
            const tasks = await getRes.json();
            console.log('GET Response:', tasks.length + ' tasks found');
            console.log('First task:', tasks[0]);
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

testApi();
