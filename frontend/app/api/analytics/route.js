import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'Admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
                    // Simple regex/keyword extraction might be needed if it's a block of text
                    // For now, let's look for specific medications if they were explicitly listed
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

        const topDiagnoses = Object.entries(diagnosisCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const topPrescriptions = Object.entries(prescriptionCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

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

        // 3. Vitals Trends (Recent)
        const latestVitals = await prisma.vitalSign.findMany({
            orderBy: { recordedAt: 'desc' },
            take: 100
        });

        let avgTemp = 0, avgHr = 0, avgSpo2 = 0;
        if (latestVitals.length > 0) {
            avgTemp = latestVitals.reduce((acc, v) => acc + v.temperature, 0) / latestVitals.length;
            avgHr = latestVitals.reduce((acc, v) => acc + v.heartRate, 0) / latestVitals.length;
            avgSpo2 = latestVitals.reduce((acc, v) => acc + v.spo2, 0) / latestVitals.length;
        }

        // 4. Appointment Trends (Mocking slightly if DB is thin, but targeting real structure)
        const appointments = await prisma.appointment.findMany({
            where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
        });

        return NextResponse.json({
            topDiagnoses,
            topPrescriptions,
            demographics: {
                regions: Object.entries(regionCounts).map(([name, value]) => ({ name, value })),
                gender: Object.entries(genderCounts).map(([name, value]) => ({ name, value })),
                age: Object.entries(ageRanges).map(([name, value]) => ({ name, value }))
            },
            vitals: {
                avgTemp: avgTemp.toFixed(1),
                avgHr: Math.round(avgHr),
                avgSpo2: Math.round(avgSpo2)
            },
            totalStats: {
                patients: users.length,
                appointments: appointments.length,
                records: medicalRecords.length
            }
        });

    } catch (error) {
        console.error("Analytics aggregation failed", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
