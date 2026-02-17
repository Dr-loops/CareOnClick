import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');
        const admittedOnly = searchParams.get('admittedOnly') === 'true';

        const where = {
            role: 'patient',
        };

        if (admittedOnly) {
            where.profile = {
                admissionStatus: 'Admitted'
            };
        }

        if (query) {
            where.OR = [
                { name: { contains: query } },
                { pathNumber: { contains: query } }
            ];
        }

        const patients = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                pathNumber: true,
                phoneNumber: true,
                profile: {
                    select: {
                        dateOfBirth: true,
                        gender: true,
                        currentRoom: true,
                        admissionStatus: true,
                        conditionStatus: true,
                        allergies: true,
                        medicalHistory: true,
                    }
                },
                // Fetch latest vitals (hacky without dedicated latest relation, but okay for MVP)
                // In real prod, we might optimize this query or use a raw query
                appointmentsAsPatient: {
                    select: {
                        balanceDue: true,
                        amountPaid: true,
                        status: true
                    }
                }
            }
        });

        console.log(`[API/Patients] Found ${patients.length} patients with filter:`, JSON.stringify(where));


        const patientsWithVitals = await Promise.all(patients.map(async (p) => {
            const latestVital = await prisma.vitalSign.findFirst({
                where: { patientId: p.id },
                orderBy: { recordedAt: 'desc' }
            });

            const activeAlerts = [];
            // Simple alert logic simulation
            if (latestVital) {
                if (latestVital.temperature > 37.8) activeAlerts.push('High Temp');
                if (latestVital.spo2 < 95) activeAlerts.push('Low SpO2');
            }

            // Calculate Financials
            const totalDebt = p.appointmentsAsPatient
                .filter(a => a.status !== 'Cancelled')
                .reduce((sum, a) => sum + (a.balanceDue || 0), 0);

            const totalPaid = p.appointmentsAsPatient
                .filter(a => a.status !== 'Cancelled')
                .reduce((sum, a) => sum + (a.amountPaid || 0), 0);

            // Remove appointments list from detailed response to keep it light if needed, 
            // but keeping it doesn't hurt much for now.
            const { appointmentsAsPatient, ...rest } = p;

            return {
                ...rest,
                latestVital,
                activeAlerts,
                financials: {
                    totalDebt,
                    totalPaid,
                    status: totalDebt > 0 ? 'Overdue' : 'Clear'
                }
            };
        }));

        return NextResponse.json(patientsWithVitals);
    } catch (error) {
        console.error('Error fetching patients:', error);
        return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
    }
}
