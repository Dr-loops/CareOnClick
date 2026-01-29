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
    console.log("🌱 Creating Fresh Patient Data...");

    // 0a. Cleanup (Integrated from debug_seed.js)
    console.log("🔥 Cleanup: Wiping old patient data...");
    try {
        await prisma.appointment.deleteMany({}); // Wipe allocations
        await prisma.vitalSign.deleteMany({});
        await prisma.patientProfile.deleteMany({});
        await prisma.user.deleteMany({ where: { role: 'patient' } });
        console.log("✅ Cleanup Complete.");
    } catch (e) {
        console.log("⚠️ Cleanup warning (non-fatal):", e.message);
    }

    // 0b. Find a valid professional for appointments
    let professional = await prisma.user.findFirst({ where: { role: { not: 'patient' } } });
    if (!professional) {
        console.log("Creating dummy professional...");
        professional = await prisma.user.create({
            data: {
                id: 'PRO-DEFAULT',
                name: "Dr. Default",
                email: "dr.default@hospital.com",
                password: "password123",
                role: 'doctor',
                verificationStatus: 'Verified'
            }
        });
    }
    const professionalId = professional.id;

    let count = 0;
    let seqId = 1; // Start from 1
    for (const category of CATEGORIES) {
        // console.log(`Creating 2 patients for category: ${category}`);

        for (let i = 0; i < 2; i++) {
            const firstName = NAMES_FIRST[Math.floor(Math.random() * NAMES_FIRST.length)];
            const lastName = NAMES_LAST[Math.floor(Math.random() * NAMES_LAST.length)];
            const fullName = `${firstName} ${lastName}`;

            // Generate Sequential ID: PATH0001, PATH0002...
            const pId = `PATH${seqId.toString().padStart(4, '0')}`;
            seqId++;

            const uniqueSuffix = Date.now() + Math.floor(Math.random() * 1000);

            const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];

            const hasDebt = Math.random() < 0.5;
            const balanceDetails = hasDebt ? { amountPaid: 50.00, balanceDue: 150.00 } : { amountPaid: 200.00, balanceDue: 0.00 };

            const vitals = {
                bp: `${Math.floor(110 + Math.random() * 40)}/${Math.floor(70 + Math.random() * 20)}`,
                hr: Math.floor(60 + Math.random() * 40),
                spo2: Math.floor(92 + Math.random() * 8),
                temp: (36.5 + Math.random() * 1.5).toFixed(1)
            };

            const meds = category === 'Pharmacist' ? "Amoxicillin 500mg, Paracetamol" : (Math.random() > 0.5 ? "Metformin" : null);

            await prisma.user.create({
                data: {
                    id: pId, // Force ID to match format
                    name: fullName,
                    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${uniqueSuffix}@example.com`,
                    password: 'password123',
                    role: 'patient',
                    pathNumber: pId, // Keep synced
                    verificationStatus: 'Verified',
                    country: 'Ghana',
                    profile: {
                        create: {
                            // fullName: fullName, 
                            dateOfBirth: new Date(1950 + Math.floor(Math.random() * 50), 0, 1),
                            gender: Math.random() > 0.5 ? 'Male' : 'Female',
                            phoneNumber: `024${Math.floor(Math.random() * 10000000)}`,
                            address: `${Math.floor(Math.random() * 100)} some street, ${region}`,
                            region: region,
                            medicalHistory: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
                            currentMedications: meds,
                            admissionStatus: Math.random() > 0.8 ? 'Admitted' : 'Outpatient'
                        }
                    },

                    VitalSign: {
                        create: [{ // Wrapped in array
                            temperature: parseFloat(vitals.temp),
                            bloodPressure: vitals.bp,
                            heartRate: vitals.hr,
                            spo2: vitals.spo2
                        }]
                    },

                    appointmentsAsPatient: {
                        create: [{
                            patientName: fullName, // REQUIRED FIELD
                            professionalId: professionalId,
                            professionalName: professional.name,
                            professionalCategory: category,
                            date: new Date(new Date().setDate(new Date().getDate() + Math.floor(Math.random() * 10))),
                            time: "10:00 AM",
                            type: Math.random() > 0.5 ? "Video" : "In-Person",
                            status: 'Upcoming',
                            amountPaid: balanceDetails.amountPaid,
                            balanceDue: balanceDetails.balanceDue,
                            paymentStatus: hasDebt ? 'Pending' : 'Paid'
                        }]
                    }

                }
            });
            count++;
        }
    }

    console.log(`✅ Successfully created ${count} new patients.`);
}

main()
    .catch(e => {
        console.error("SEED API ERROR (Full):");
        console.error(e.toString());
        console.error(e.stack ? e.stack.substring(0, 300) : "No Stack");
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
