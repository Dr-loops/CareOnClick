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
        console.log("Connecting to:", process.env.DATABASE_URL.substring(0, 50) + "...");
        await client.connect();
        console.log("CONNECTED!");
        const res = await client.query('SELECT NOW()');
        console.log("Query result:", res.rows[0]);
        await client.end();
    } catch (err) {
        console.error("CONNECTION ERROR:", err);
    }
}

main();
