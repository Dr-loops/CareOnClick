export const dynamic = 'force-dynamic';

export default function DebugPage() {
    const vars = {
        DATABASE_URL: process.env.DATABASE_URL,
        ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY,
        AUTH_SECRET: process.env.AUTH_SECRET,
        NODE_ENV: process.env.NODE_ENV,
    };

    const status = {
        database_url: vars.DATABASE_URL ? (vars.DATABASE_URL.startsWith('postgres') ? 'Present' : 'Invalid Format') : 'MISSING',
        admin_secret: vars.ADMIN_SECRET_KEY ? 'Present' : 'MISSING',
        auth_secret: vars.AUTH_SECRET ? 'Present' : 'MISSING',
        environment: vars.NODE_ENV || 'unknown'
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
            <h1>Environment Debugger (Server Side)</h1>
            <p>Direct Server Environment Check:</p>
            <hr />
            <pre>{JSON.stringify(status, null, 2)}</pre>

            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f9ff' }}>
                <h3>Troubleshooting Guide:</h3>
                <ul>
                    <li>If <strong>DATABASE_URL</strong> is MISSING: Go to Vercel -&gt; Settings -&gt; Environment Variables and Add it.</li>
                    <li>Don't forget to <strong>REDEPLOY</strong> after adding variables.</li>
                </ul>
            </div>
        </div>
    );
}
