import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding news...');

    const newsItems = [
        {
            title: 'Flu Season Awareness',
            summary: 'Protect yourself and your family. Vaccination shots are now available.',
            content: 'Detailed content about flu prevention...',
            imageUrl: 'https://placehold.co/600x400/006994/FFFFFF?text=Flu+Shot',
            category: 'Health Alert',
            published: true
        },
        {
            title: 'New Pediatric Wing',
            summary: 'We are expanding our children\'s ward to provide better care.',
            content: 'Construction details...',
            imageUrl: 'https://placehold.co/600x400/4CAF50/FFFFFF?text=Pediatrics',
            category: 'Hospital Update',
            published: true
        },
        {
            title: 'Healthy Eating Workshop',
            summary: 'Join our dietician for a free session on balanced nutrition.',
            content: 'Event details...',
            imageUrl: 'https://placehold.co/600x400/FF9800/FFFFFF?text=Nutrition',
            category: 'Education',
            published: true
        },
        {
            title: 'Telemedicine App Update',
            summary: 'Version 2.0 is live with improved video quality.',
            content: 'Tech update details...',
            imageUrl: 'https://placehold.co/600x400/2196F3/FFFFFF?text=Telehealth',
            category: 'Tech',
            published: true
        }
    ];

    for (const item of newsItems) {
        await prisma.newsItem.create({ data: item });
    }

    console.log('News seeded!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
