import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding video ads...');

    // Clear existing ads first (optional, but good for clean state)
    // await prisma.ad.deleteMany({}); 

    const ads = [
        {
            title: 'World-Class Hospital Care',
            url: '/videos/hospital.mp4',
            link: '/services',
            priority: 50
        },
        {
            title: 'Advanced Diagnostic Lab',
            url: '/videos/hospital.mp4', // Reusing local file for reliability
            link: '/services',
            priority: 40
        },
        {
            title: '24/7 Virtual Consultations',
            url: '/videos/hospital.mp4',
            link: '/register?type=patient',
            priority: 30
        },
        {
            title: 'Meet Our Specialists',
            url: '/videos/hospital.mp4',
            link: '/about',
            priority: 20
        },
        {
            title: 'Secure Health Records',
            url: '/videos/hospital.mp4',
            link: '/register',
            priority: 10
        }
    ];

    for (const ad of ads) {
        await prisma.ad.create({
            data: {
                title: ad.title,
                type: 'VIDEO',
                url: ad.url,
                link: ad.link,
                priority: ad.priority,
                active: true,
                startDate: new Date(),
            },
        });
    }

    console.log('5 Video Ads created!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
