
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Backend Database ---');
    try {
        const users = await prisma.user.findMany();
        console.log(`Found ${users.length} users:`);
        users.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}] ID: ${u.id}`));

        const ads = await prisma.ad.findMany();
        console.log(`Found ${ads.length} ads:`);
        ads.forEach(a => console.log(`- Ad: ${a.title} (${a.url})`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
