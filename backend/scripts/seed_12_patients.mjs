
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const patients = [
    { id: 'pat_0001', pathNumber: 'PATH0001', name: 'Yaw Adom', email: 'yaw.adom.1768218659084@example.com' },
    { id: 'pat_0002', pathNumber: 'PATH0002', name: 'Kojo Boateng', email: 'kojo.boateng.1768218659385@example.com' },
    { id: 'pat_0003', pathNumber: 'PATH0003', name: 'Yaw Sarpong', email: 'yaw.sarpong.1768218659666@example.com' },
    { id: 'pat_0004', pathNumber: 'PATH0004', name: 'Abena Appiah', email: 'abena.appiah.1768218659690@example.com' },
    { id: 'pat_0005', pathNumber: 'PATH0005', name: 'Grace Boakye', email: 'grace.boakye.1768218659033@example.com' },
    { id: 'pat_0006', pathNumber: 'PATH0006', name: 'Grace Sarpong', email: 'grace.sarpong.1768218659202@example.com' },
    { id: 'pat_0007', pathNumber: 'PATH0007', name: 'Grace Sarpong', email: 'grace.sarpong.1768218659282@example.com' },
    { id: 'pat_0008', pathNumber: 'PATH0008', name: 'Emmanuel Adom', email: 'emmanuel.adom.1768218659046@example.com' },
    { id: 'pat_0009', pathNumber: 'PATH0009', name: 'Kojo Mensah', email: 'kojo.mensah.1768218659160@example.com' },
    { id: 'pat_0010', pathNumber: 'PATH0010', name: 'Emmanuel Boakye', email: 'emmanuel.boakye.1768218659536@example.com' },
    { id: 'pat_0011', pathNumber: 'PATH0011', name: 'Abena Boakye', email: 'abena.boakye.1768218659060@example.com' },
    { id: 'pat_0012', pathNumber: 'PATH0012', name: 'Akosua Owusu', email: 'akosua.owusu.1768218659612@example.com' }
];

async function main() {
    console.log("Seeding 12 Patients...");
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (const p of patients) {
        try {
            const user = await prisma.user.upsert({
                where: { email: p.email },
                update: {
                    password: hashedPassword,
                    pathNumber: p.pathNumber,
                    name: p.name,
                    role: 'patient',
                    verificationStatus: 'Verified'
                },
                create: {
                    id: p.id,
                    email: p.email,
                    password: hashedPassword,
                    name: p.name,
                    role: 'patient',
                    verificationStatus: 'Verified',
                    pathNumber: p.pathNumber,
                    country: 'Ghana',
                    region: 'Accra',
                    phoneNumber: 'N/A'
                }
            });
            console.log(`✅ Processed: ${p.name} (${p.email})`);
        } catch (e) {
            console.error(`❌ Failed: ${p.name} - ${e.message}`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
