
const { PrismaClient: BackendPrisma } = require('./backend/node_modules/@prisma/client');
const { PrismaClient: FrontendPrisma } = require('./frontend/node_modules/@prisma/client');

async function checkDb(name, client) {
    console.log(`\n--- Checking ${name} ---`);
    try {
        const users = await client.user.findMany();
        console.log(`Total Users: ${users.length}`);
        users.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}]`));

        const ads = await client.ad.findMany();
        console.log(`Total Ads: ${ads.length}`);
        ads.forEach(ad => console.log(`- Ad: ${ad.title}`));

        const news = await client.newsItem.findMany();
        console.log(`Total News: ${news.length}`);

    } catch (err) {
        console.error(`Error checking ${name}:`, err.message);
    }
}

async function main() {
    // Note: This requires the clients to be generated and pointing to the right paths.
    // Instead of complex imports, let's use a simpler approach: node-sqlite3 or just running two separate scripts.
}
