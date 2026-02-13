const sqlite3 = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'frontend', 'prisma', 'dev.db');

try {
    const db = sqlite3(dbPath, { readonly: true });
    console.log('--- USERS IN FRONTEND SQLITE ---');
    const users = db.prepare('SELECT id, email, name, role, verificationStatus FROM User').all();
    console.table(users);
    db.close();
} catch (error) {
    console.error('❌ Error:', error.message);
}
