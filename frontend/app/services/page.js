"use client";
import Link from 'next/link';

export default function ServicesPage() {
    return (
        <div style={{ paddingBottom: '4rem' }}>
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, var(--color-sea-blue), #2c3e50)',
                color: 'white',
                padding: '4rem 2rem',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>World-Class Healthcare, Delivered Remotely</h1>
                <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', opacity: 0.9 }}>
                    Expert medical care from the comfort of your home. We use technology to bring the hospital to you.
                </p>
            </div>

            <div className="container" style={{ marginTop: '3rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-navy)' }}>Our Services</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* General Consulting */}
                    <div className="card">
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👨‍⚕️</div>
                        <h3>General Consulting</h3>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>
                            Secure video and voice consultations with qualified doctors. Get diagnoses, treatment plans, and referrals without leaving your house.
                        </p>
                    </div>

                    {/* Screening */}
                    <div className="card">
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔬</div>
                        <h3>Screening & Diagnostics</h3>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>
                            Confidential screening for STDs, fertility issues, and other preventative health checks. We coordinate sample collection and digital result delivery.
                        </p>
                    </div>

                    {/* Nursing Services */}
                    <div className="card">
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🩺</div>
                        <h3>General Nursing</h3>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>
                            Remote patient monitoring, vital signs tracking, and chronic disease management. Our nurses are just a click away for daily health checks.
                        </p>
                    </div>

                    {/* Dietician */}
                    <div className="card">
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🍎</div>
                        <h3>Dietician & Nutrition</h3>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>
                            Personalized meal plans and nutritional counseling for weight management, diabetes control, and overall wellness.
                        </p>
                    </div>

                    {/* Pharmacy */}
                    <div className="card">
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💊</div>
                        <h3>Pharmacy Services</h3>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>
                            Digital prescription management. Consultation with pharmacists and coordination for medication delivery to your doorstep.
                        </p>
                    </div>

                    {/* Lab Services */}
                    <div className="card">
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧪</div>
                        <h3>Lab Diagnostics</h3>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>
                            Full range of diagnostic tests. We partner with accredited labs to ensure accurate results, which are uploaded directly to your patient portal.
                        </p>
                    </div>
                </div>

                {/* Remote Care Emphasis */}
                <div style={{
                    marginTop: '4rem',
                    padding: '3rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ color: 'var(--color-sea-blue)' }}>We Work Remotely</h2>
                    <p style={{ maxWidth: '700px', margin: '1rem auto 2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                        At CareOnClick, we believe location shouldn't limit access to quality healthcare.
                        Our entire team of professionals works remotely to serve you better, faster, and more safely.
                    </p>
                    <Link href="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
                        Join Us Today
                    </Link>
                </div>
            </div>
        </div>
    );
}
