const { Client } = require('pg');

const connectionString = "postgresql://postgres:DrKalsV%402026@db.xulniqmmnvnxmsphayjf.supabase.co:5432/postgres?sslmode=require";

async function testConnection() {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        console.log("Connecting to database...");
        await client.connect();
        console.log("✅ Successfully connected to database!");
        const res = await client.query('SELECT NOW()');
        console.log("Current time from DB:", res.rows[0]);
        await client.end();
    } catch (err) {
        console.error("❌ Connection failed:", err.message);
        if (err.message.includes("ETIMEDOUT") || err.message.includes("ECONNREFUSED")) {
            console.log("This looks like a network/firewall issue blocking port 5432.");
        }
    }
}

testConnection();
