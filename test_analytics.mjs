import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAnalytics() {
    try {
        console.log("Fetching medical records...");
        // 1. Diagnosis Analysis
        const medicalRecords = await prisma.medicalRecord.findMany({
            where: { structuredData: { not: null } },
            select: { structuredData: true }
        });

        const diagnosisCounts = {};
        const prescriptionCounts = {};

        medicalRecords.forEach(record => {
            try {
                const data = JSON.parse(record.structuredData);
                const results = data.results || {};

                // Extract Diagnosis
                if (results.diagnosis) {
                    const dx = results.diagnosis.split(',').map(s => s.trim()).filter(Boolean);
                    dx.forEach(d => {
                        diagnosisCounts[d] = (diagnosisCounts[d] || 0) + 1;
                    });
                } else if (results.medicalHistory) { // Legacy field mapping
                    diagnosisCounts[results.medicalHistory] = (diagnosisCounts[results.medicalHistory] || 0) + 1;
                }

                // Extract Prescriptions
                if (results.treatmentPlan) {
                    if (results.medications) {
                        const meds = results.medications.split(',').map(s => s.trim()).filter(Boolean);
                        meds.forEach(m => {
                            prescriptionCounts[m] = (prescriptionCounts[m] || 0) + 1;
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to parse structured data", e);
            }
        });

        console.log("Fetching users...");
        // 2. Demographic Analysis
        const users = await prisma.user.findMany({
            where: { role: 'patient' },
            include: { profile: true }
        });

        const regionCounts = {};
        const genderCounts = { Male: 0, Female: 0, Other: 0 };
        const ageRanges = { '0-18': 0, '19-35': 0, '36-60': 0, '60+': 0 };

        users.forEach(user => {
            const profile = user.profile || {};
            const region = user.region || profile.region || 'Unknown';
            regionCounts[region] = (regionCounts[region] || 0) + 1;

            const gender = profile.gender || 'Other';
            if (genderCounts[gender] !== undefined) genderCounts[gender]++;
            else genderCounts.Other++;

            if (profile.dateOfBirth) {
                const age = new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear();
                if (age <= 18) ageRanges['0-18']++;
                else if (age <= 35) ageRanges['19-35']++;
                else if (age <= 60) ageRanges['36-60']++;
                else ageRanges['60+']++;
            }
        });

        console.log("Fetching vitals...");
        // 3. Vitals Trends (Recent)
        const latestVitals = await prisma.vitalSign.findMany({
            orderBy: { recordedAt: 'desc' },
            take: 100
        });

        console.log("Vitals Length:", latestVitals.length);

        console.log("Fetching appointments...");
        // 4. Appointment Trends
        const appointments = await prisma.appointment.findMany({
            where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
        });

        console.log("Appointments Length:", appointments.length);

        console.log("SUCCESS!");
    } catch (e) {
        console.error("ERROR CAUGHT:");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

testAnalytics();
