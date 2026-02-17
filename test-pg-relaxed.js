const { Client } = require('pg');

// Trying direct IP resolution if DNS is flaky in node, but nslookup worked.
// Connection string from BACKEND env.
const connectionString = "postgresql://postgres:DrKalsV%402026@db.xulniqmmnvnxmsphayjf.supabase.co:5432/postgres?sslmode=require";

async function test() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Relax SSL strictness for testing
    });
    try {
        console.log('Connecting to Supabase (Relaxed SSL)...');
        await client.connect();
        console.log('✅ Connected successfully!');
        const res = await client.query('SELECT email, role, password FROM "User" WHERE email = $1', ['drkalsvirtualhospital@gmail.com']);
        console.log('User found:', res.rows[0]?.email);
        console.log('Pass hash:', res.rows[0]?.password.substring(0, 15) + '...');
        await client.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        if (err.cause) console.error('Cause:', err.cause);
    }
}

test();
