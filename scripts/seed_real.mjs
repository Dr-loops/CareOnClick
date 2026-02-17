import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database with realistic medical data...');

    // Cleanup first
    try {
        await prisma.vitalSign.deleteMany();
        await prisma.task.deleteMany();
    } catch (e) {
        console.warn('Cleanup warning (tables might depend on missing tables):', e);
    }

    const patients = [
        {
            email: 'john.doe@example.com', name: 'John Doe', pathNumber: 'PATH-1234',
            profile: {
                dateOfBirth: new Date('1978-05-15'),
                gender: 'Male',
                currentRoom: '302-A',
                admissionStatus: 'Admitted',
                conditionStatus: 'Stable',
                allergies: 'Penicillin',
                medicalHistory: 'Hypertension, Type 2 Diabetes'
            }
        },
        {
            email: 'jane.smith@example.com', name: 'Jane Smith', pathNumber: 'PATH-5678',
            profile: {
                dateOfBirth: new Date('1992-10-20'),
                gender: 'Female',
                currentRoom: '105-B',
                admissionStatus: 'Admitted',
                conditionStatus: 'Critical',
                allergies: 'None',
                medicalHistory: 'Asthma'
            }
        },
        {
            email: 'alice.johnson@example.com', name: 'Alice Johnson', pathNumber: 'PATH-9012',
            profile: {
                dateOfBirth: new Date('1956-03-12'),
                gender: 'Female',
                currentRoom: '210-C',
                admissionStatus: 'Observation',
                conditionStatus: 'Fair',
                allergies: 'Peanuts',
                medicalHistory: 'CKD Stage 3'
            }
        }
    ];

    for (const p of patients) {
        try {
            console.log(`Processing ${p.name}...`);
            const user = await prisma.user.upsert({
                where: { email: p.email },
                update: {
                    pathNumber: p.pathNumber,
                    // Don't update profile in nested, do it separately
                },
                create: {
                    email: p.email,
                    name: p.name,
                    password: '$2b$10$EpOd/vK/d/8/8/8/8/8/8/', // Fake has
                    role: 'patient',
                    pathNumber: p.pathNumber,
                }
            });

            // Upsert Profile Separately
            await prisma.patientProfile.upsert({
                where: { userId: user.id },
                create: {
                    userId: user.id,
                    ...p.profile
                },
                update: {
                    ...p.profile
                }
            });

            console.log(`✅ Upserted Patient: ${user.name}`);

            // Seed Vitals
            await prisma.vitalSign.create({
                data: {
                    patientId: user.id,
                    temperature: p.profile.conditionStatus === 'Critical' ? 38.5 : 36.8,
                    bloodPressure: p.profile.conditionStatus === 'Critical' ? '90/60' : '120/80',
                    heartRate: p.profile.conditionStatus === 'Critical' ? 110 : 72,
                    spo2: p.profile.conditionStatus === 'Critical' ? 92 : 98,
                    recordedBy: 'System Seed'
                }
            });

            // Seed Tasks
            await prisma.task.createMany({
                data: [
                    {
                        patientId: user.id,
                        description: `Check Vitals for ${user.name}`,
                        category: 'Clinical',
                        priority: 'Routine',
                        status: 'Pending'
                    },
                    {
                        patientId: user.id,
                        description: `Administer Daily Meds`,
                        category: 'Medication',
                        priority: 'Urgent',
                        status: 'Pending',
                        dueDate: new Date(new Date().getTime() + 3600000) // 1 hour from now
                    }
                ]
            });
        } catch (innerError) {
            console.error(`❌ Error processing ${p.name}:`, innerError);
        }
    }

    console.log('✅ Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
