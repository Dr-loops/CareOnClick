require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function main() {
    try {
        await client.connect();
        console.log("Connected to Neon.");
        const res = await client.query('SELECT email, role, "verificationStatus" FROM "User" WHERE role = \'admin\'');
        console.log("Admins found:", res.rows.length);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error("Query Error:", err);
    } finally {
        await client.end();
    }
}

main();
