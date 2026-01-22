export default function MissionPage() {
    return (
        <div className="container" style={{ padding: '4rem 0', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="mission-box" style={{ padding: '3rem', background: 'white', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)', maxWidth: '800px', width: '100%', textAlign: 'center' }}>
                <h1 style={{ color: 'var(--color-sea-blue)', marginBottom: '2rem', fontSize: '2.5rem' }}>Our Mission</h1>
                <p style={{ fontSize: '1.4rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    To provide compassionate, seamless, and comprehensive healthcare services that empower patients to lead healthier lives, through a robust network of dedicated professionals and secure digital innovation.
                </p>
            </div>
        </div>
    );
}
