const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log("Forcing Password Reset for PATH0001 - PATH0012...");

    const passwordHash = await bcrypt.hash('password123', 10);

    for (let i = 1; i <= 12; i++) {
        const numStr = i.toString().padStart(4, '0'); // 0001, 0002...
        const pathNumber = `PATH${numStr}`;
        const email = `patient${i}@drkal.com`;

        // Check if user exists by pathNumber
        const existing = await prisma.user.findUnique({ where: { pathNumber } });

        if (existing) {
            console.log(`Updating existing user ${existing.name} (${pathNumber})...`);
            await prisma.user.update({
                where: { pathNumber },
                data: {
                    password: passwordHash,
                    // Optional: Update email to match pattern if desired, but user might want to keep name
                    // Let's just reset password so they can login.
                    // We can also print the email so the user knows what to login with.
                }
            });
            console.log(`✅ Reset password for ${pathNumber} (Email: ${existing.email})`);
        } else {
            console.log(`Creating new user ${pathNumber}...`);
            // Create if not exists
            try {
                await prisma.user.create({
                    data: {
                        email,
                        name: `Test Patient ${i}`,
                        role: 'patient',
                        pathNumber: pathNumber,
                        password: passwordHash,
                        verificationStatus: 'Verified'
                    }
                });
                console.log(`✅ Created ${pathNumber} (Email: ${email})`);
            } catch (e) {
                console.error(`❌ Failed to create ${pathNumber}: ${e.message}`);
            }
        }
    }

    console.log("Done.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
