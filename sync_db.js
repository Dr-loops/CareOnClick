const { PrismaClient: PrismaLocal } = require('./frontend/node_modules/@prisma/client');
const { PrismaClient: PrismaRemote } = require('./frontend/node_modules/@prisma/client');

async function syncUsers() {
    // Local SQLite Client
    const local = new PrismaLocal({
        datasources: {
            db: {
                url: 'file:./frontend/prisma/dev.db',
            },
        },
    });

    // Remote Neon Client
    const remote = new PrismaRemote({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

    try {
        console.log('Fetching users from local SQLite...');
        const users = await local.user.findMany();
        console.log(`Found ${users.length} users.`);

        console.log('Pushing users to Neon cloud...');
        for (const user of users) {
            try {
                await remote.user.upsert({
                    where: { email: user.email },
                    update: user,
                    create: user,
                });
                console.log(`✅ Synced: ${user.email}`);
            } catch (err) {
                console.error(`❌ Failed to sync ${user.email}:`, err.message);
            }
        }
        console.log('All users synced!');
    } catch (e) {
        console.error('Fatal Error:', e);
    } finally {
        await local.$disconnect();
        await remote.$disconnect();
    }
}

const dbUrlMatch = require('fs').readFileSync('./frontend/.env', 'utf8').match(/DATABASE_URL="([^"]+)"/);
if (dbUrlMatch) {
    process.env.DATABASE_URL = dbUrlMatch[1];
    syncUsers();
} else {
    console.error('DATABASE_URL not found');
}
