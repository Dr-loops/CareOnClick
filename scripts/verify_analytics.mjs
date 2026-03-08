import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAnalytics() {
    console.log('--- ANALYTICS DATA VERIFICATION ---');
    try {
        const medicalRecords = await prisma.medicalRecord.count({
            where: { structuredData: { not: null } }
        });
        const users = await prisma.user.count({ where: { role: 'patient' } });
        const vitals = await prisma.vitalSign.count();

        console.log(`Patients: ${users}`);
        console.log(`Records with Data: ${medicalRecords}`);
        console.log(`Vital Signs: ${vitals}`);

        const topDiagnoses = await prisma.medicalRecord.findMany({
            where: { structuredData: { not: null } },
            take: 5
        });

        topDiagnoses.forEach(r => {
            try {
                const data = JSON.parse(r.structuredData);
                console.log(`- Sample Diagnosis: ${data.results?.diagnosis || data.results?.medicalHistory || 'N/A'}`);
            } catch (e) { }
        });

    } catch (error) {
        console.error("Verification failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAnalytics();
