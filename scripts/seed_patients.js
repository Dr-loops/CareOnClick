const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const REGIONS = [
    "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
    "Northern", "Volta", "Upper East", "Upper West", "Bono"
];

const NAMES_FIRST = ["Kwame", "Kofi", "Ama", "Akosua", "Yaw", "Abena", "Kojo", "Adwoa", "Kweiser", "Yaa", "Emmanuel", "Grace"];
const NAMES_LAST = ["Mensah", "Owusu", "Appiah", "Boakye", "Osei", "Danso", "Adom", "Sarpong", "Tetteh", "Boateng"];
const CONDITIONS = ["Hypertension", "Diabetes", "Malaria", "Asthma", "Healthy", "Flu", "Anxiety", "Migraine"];

const CATEGORIES = ['Doctor', 'Nurse', 'Pharmacist', 'Dietician', 'Psychologist', 'Scientist'];

async function main() {
    console.log("🌱 Starting Data Seed (Scorched Earth)...");

    try {
        // 1. Global Wipe of Dependent Tables
        // This is safer than selective delete for correcting FK issues
        console.log("🔥 Wiping Appointments...");
        await prisma.appointment.deleteMany({});

        console.log("🔥 Wiping Vitals...");
        await prisma.vitalSign.deleteMany({});

        console.log("🔥 Wiping Tasks...");
        await prisma.task.deleteMany({});

        console.log("🔥 Wiping Messages...");
        await prisma.message.deleteMany({});

        console.log("🔥 Wiping Notifications...");
        await prisma.notification.deleteMany({});

        console.log("🔥 Wiping Patient Profiles...");
        // PatientProfile is tied to User, but deleting it first is safe
        await prisma.patientProfile.deleteMany({});

        console.log("🧹 Deleting Patients...");
        await prisma.user.deleteMany({ where: { role: 'patient' } });

        console.log("✅ Cleanup Complete.");

        // 2. Create New Data
        let count = 0;
        for (const category of CATEGORIES) {
            console.log(`Creating 2 patients for category: ${category}`);

            for (let i = 0; i < 2; i++) {
                const firstName = NAMES_FIRST[Math.floor(Math.random() * NAMES_FIRST.length)];
                const lastName = NAMES_LAST[Math.floor(Math.random() * NAMES_LAST.length)];
                const fullName = `${firstName} ${lastName}`;
                const pathNumber = `PATH-${Math.floor(1000 + Math.random() * 9000)}`;
                const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];

                // Financials: 50/50
                const hasDebt = Math.random() < 0.5;
                const balanceDetails = hasDebt ? { amountPaid: 50.00, balanceDue: 150.00 } : { amountPaid: 200.00, balanceDue: 0.00 };

                // Vitals
                const vitals = {
                    bp: `${Math.floor(110 + Math.random() * 40)}/${Math.floor(70 + Math.random() * 20)}`,
                    hr: Math.floor(60 + Math.random() * 40),
                    spo2: Math.floor(92 + Math.random() * 8),
                    temp: (36.5 + Math.random() * 1.5).toFixed(1)
                };

                const meds = category === 'Pharmacist' ? "Amoxicillin 500mg, Paracetamol" : (Math.random() > 0.5 ? "Metformin" : null);

                await prisma.user.create({
                    data: {
                        name: fullName,
                        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`,
                        password: 'password123',
                        role: 'patient',
                        pathNumber: pathNumber,
                        verificationStatus: 'Verified',
                        profile: {
                            create: {
                                fullName: fullName,
                                dateOfBirth: new Date(1950 + Math.floor(Math.random() * 50), 0, 1),
                                gender: Math.random() > 0.5 ? 'Male' : 'Female',
                                region: region, // Correct field
                                phoneNumber: `024${Math.floor(Math.random() * 10000000)}`,
                                address: `${Math.floor(Math.random() * 100)} some street, ${region}`,
                                medicalHistory: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
                                currentMedications: meds,
                                admissionStatus: Math.random() > 0.8 ? 'Admitted' : 'Outpatient'
                            }
                        },
                        VitalSign: {
                            create: {
                                temperature: parseFloat(vitals.temp),
                                bloodPressure: vitals.bp,
                                heartRate: vitals.hr,
                                spo2: vitals.spo2
                            }
                        },
                        appointmentsAsPatient: {
                            create: {
                                professionalId: 'admin', // Generic
                                professionalName: `Dr. ${category} Generic`,
                                professionalCategory: category,
                                date: new Date(new Date().setDate(new Date().getDate() + Math.floor(Math.random() * 10))),
                                time: "10:00 AM",
                                type: Math.random() > 0.5 ? "Video" : "In-Person",
                                status: 'Upcoming',
                                amountPaid: balanceDetails.amountPaid,
                                balanceDue: balanceDetails.balanceDue,
                                paymentStatus: hasDebt ? 'Pending' : 'Paid'
                            }
                        }
                    }
                });
                count++;
            }
        }
        console.log(`✅ Successfully seeded ${count} new patients.`);

    } catch (e) {
        console.error("FATAL SEED ERROR", e);
        // process.exit(1); 
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
