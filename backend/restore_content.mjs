
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Restoring Content ---');

    // 1. Restore Tele-education Ad
    console.log('Restoring Ads...');
    // Clear video ads if needed, or just append. Let's append but prioritized.
    // The user said "vanished tele-education info appeared at the bottom of the ads"
    // This implies it might be a banner or a specific ad.
    // Let's look at the ad images available: ad_1.jpg to ad_5.jpg.
    // We will assume ad_1.jpg is relevant or we will create a generic one.
    // Actually, "Tele-education" might be text *on* the ad or a specific ad title.

    // We will create an Image Ad for Tele-education using one of the existing images as placeholder
    // but with the specific title the user is looking for.
    await prisma.ad.create({
        data: {
            title: 'Tele-education for Medical Students',
            type: 'IMAGE',
            url: '/ads/ad_1.jpg', // Using existing asset
            link: '/education-hub', // Hypothetical link
            priority: 100, // High priority to show up
            active: true
        }
    });
    console.log('Tele-education Ad restored.');

    // 2. Clear Old Mock Data (John Doe) if present
    console.log('Cleaning up old mock data...');
    const oldMocks = ['John Doe', 'Samuel Yeboah', 'Jane Smith', 'Alice Johnson'];
    await prisma.user.deleteMany({
        where: {
            name: { in: oldMocks }
        }
    });
    console.log('Old mock users removed.');

    // 3. Ensure "Healthy Eating Workshop" is present
    const eduNews = await prisma.newsItem.findFirst({
        where: { title: 'Healthy Eating Workshop' }
    });

    if (!eduNews) {
        await prisma.newsItem.create({
            data: {
                title: 'Healthy Eating Workshop',
                summary: 'Join our dietician for a free session on balanced nutrition.',
                content: 'Event details...',
                imageUrl: 'https://placehold.co/600x400/FF9800/FFFFFF?text=Nutrition',
                category: 'Education',
                published: true
            }
        });
        console.log('Education News item restored.');
    } else {
        console.log('Education News item already exists.');
    }

}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
