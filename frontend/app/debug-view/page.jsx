import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    let dbStatus = 'Checking...';
    let adminFound = 'Checking...';
    let userCount = 0;

    try {
        const users = await prisma.user.findMany({ take: 3 });
        userCount = await prisma.user.count();
        dbStatus = '✅ Connected';

        const admin = await prisma.user.findUnique({
            where: { email: 'drkalsvirtualhospital@gmail.com' }
        });
        adminFound = admin ? `✅ Found (Role: ${admin.role})` : '❌ NOT FOUND';
    } catch (e) {
        dbStatus = `❌ Error: ${e.message}`;
        adminFound = '❌ Error';
    }

    const vars = {
        DATABASE_URL: process.env.DATABASE_URL ? 'PRESENT' : 'MISSING',
        ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY ? 'PRESENT' : 'MISSING',
        AUTH_SECRET: process.env.AUTH_SECRET ? 'PRESENT' : 'MISSING',
        AUTH_URL: process.env.AUTH_URL || 'NOT SET',
        AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || 'NOT SET',
        NODE_ENV: process.env.NODE_ENV,
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Deep Production Debugger</h1>

            <section style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
                <h2>1. Database Connectivity</h2>
                <p>Status: <strong>{dbStatus}</strong></p>
                <p>Total Users: <strong>{userCount}</strong></p>
                <p>Admin Search: <strong>{adminFound}</strong></p>
            </section>

            <section style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
                <h2>2. Environment Variables</h2>
                <pre>{JSON.stringify(vars, null, 2)}</pre>
            </section>

            <section style={{ padding: '1rem', background: '#fff4e5', borderLeft: '5px solid #ffa117' }}>
                <h3>Next Steps for "CredentialsSignin" Error:</h3>
                <ul>
                    <li>If <b>AUTH_TRUST_HOST</b> is not "true", add <code>AUTH_TRUST_HOST=true</code> to Vercel.</li>
                    <li>If <b>AUTH_SECRET</b> length is less than 32 chars, consider generating a stronger one.</li>
                    <li>Ensure <b>AUTH_URL</b> matches your production domain (e.g., <code>https://your-app.vercel.app</code>).</li>
                </ul>
            </section>
        </div>
    );
}
