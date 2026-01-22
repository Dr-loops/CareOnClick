export default function VisionPage() {
    return (
        <div className="container" style={{ padding: '4rem 0', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="vision-box" style={{ padding: '3rem', background: 'white', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)', maxWidth: '800px', width: '100%', textAlign: 'center' }}>
                <h1 style={{ color: 'var(--color-sea-blue)', marginBottom: '2rem', fontSize: '2.5rem' }}>Our Vision</h1>
                <p style={{ fontSize: '1.4rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                    To be the leading digital healthcare eco-system in Africa, employing cutting-edge technology to make world-class medical expertise universally accessible, affordable, and personalized.
                </p>
            </div>
        </div>
    );
}
