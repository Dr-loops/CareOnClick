
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Checking NewsItems ---');
        const news = await prisma.newsItem.findMany();
        console.log(`Found ${news.length} news items.`);
        if (news.length > 0) {
            news.forEach(item => {
                console.log(`- [${item.category}] ${item.title}: ${item.summary}`);
            });
        }

        console.log('\n--- Checking Ads ---');
        const ads = await prisma.ad.findMany();
        console.log(`Found ${ads.length} ads.`);
        if (ads.length > 0) {
            ads.forEach(ad => {
                console.log(`- ${ad.title} (${ad.type}): ${ad.url} -> ${ad.link}`);
            });
        }
    } catch (err) {
        console.error('ERROR during check:', err);
    }
}

main()
    .finally(() => prisma.$disconnect());
