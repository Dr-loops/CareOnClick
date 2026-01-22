"use client";
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const res = login(email, password);
        if (!res.success) {
            setError(res.error);
        }
    };

    return (
        <div className="container" style={{ marginTop: '4rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div className="card" style={{ maxWidth: '400px', flex: '1', minWidth: '300px' }}>
                <h2 style={{ textAlign: 'center' }}>Welcome Back</h2>
                {error && <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            suppressHydrationWarning
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            suppressHydrationWarning
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} suppressHydrationWarning>
                        Log In
                    </button>
                </form>

                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    <p>Don't have an account? <Link href="/register">Register here</Link></p>
                </div>
            </div>

            {/* Test Credentials Panel */}
            <div className="card" style={{ maxWidth: '350px', flex: '1', minWidth: '300px', backgroundColor: '#f8f9fa' }}>
                <h3 style={{ marginTop: 0, fontSize: '1.2rem', color: '#2c3e50' }}>🧪 Test Credentials</h3>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>Use these accounts to test different roles. Password is <strong>password123</strong> for all.</p>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {[
                        { role: 'Admin', email: 'admin@drkal.com' },
                        { role: 'Doctor', email: 'doctor@drkal.com' },
                        { role: 'Nurse', email: 'nurse@drkal.com' },
                        { role: 'Pharmacist', email: 'pharmacist@drkal.com' },
                        { role: 'Lab Scientist', email: 'scientist@drkal.com' },
                        { role: 'Dietician', email: 'dietician@drkal.com' },
                        { role: 'Psychologist', email: 'psychologist@drkal.com' },
                        { role: 'Patient (Generic)', email: 'patient@drkal.com' },
                    ].map(creds => (
                        <div key={creds.role} style={{
                            marginBottom: '0.8rem',
                            padding: '0.5rem',
                            background: 'white',
                            borderRadius: '4px',
                            border: '1px solid #eee',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                            onClick={() => { setEmail(creds.email); setPassword('password123'); }}
                            title="Click to auto-fill"
                        >
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{creds.role}</div>
                                <div style={{ fontSize: '0.8rem', color: '#555' }}>{creds.email}</div>
                            </div>
                            <span style={{ fontSize: '1.2rem' }}>📋</span>
                        </div>
                    ))}

                    <div style={{ borderTop: '1px solid #ddd', margin: '1rem 0', paddingTop: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: '#444', marginBottom: '0.5rem' }}>Start Patients (12)</h4>
                        {[
                            { name: 'Yaw Adom', email: 'yaw.adom.1768218659084@example.com' },
                            { name: 'Kojo Boateng', email: 'kojo.boateng.1768218659385@example.com' },
                            { name: 'Yaw Sarpong', email: 'yaw.sarpong.1768218659666@example.com' },
                            { name: 'Abena Appiah', email: 'abena.appiah.1768218659690@example.com' },
                            { name: 'Grace Boakye', email: 'grace.boakye.1768218659033@example.com' },
                            { name: 'Grace Sarpong', email: 'grace.sarpong.1768218659202@example.com' },
                            { name: 'Grace Sarpong (2)', email: 'grace.sarpong.1768218659282@example.com' },
                            { name: 'Emmanuel Adom', email: 'emmanuel.adom.1768218659046@example.com' },
                            { name: 'Kojo Mensah', email: 'kojo.mensah.1768218659160@example.com' },
                            { name: 'Emmanuel Boakye', email: 'emmanuel.boakye.1768218659536@example.com' },
                            { name: 'Abena Boakye', email: 'abena.boakye.1768218659060@example.com' },
                            { name: 'Akosua Owusu', email: 'akosua.owusu.1768218659612@example.com' }
                        ].map((p, idx) => (
                            <div key={idx} style={{
                                marginBottom: '0.5rem',
                                padding: '0.4rem',
                                background: '#f8f9fa',
                                borderRadius: '4px',
                                border: '1px solid #e9ecef',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                                onClick={() => { setEmail(p.email); setPassword('password123'); }}
                                title={`Click to login as ${p.name}`}
                            >
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{p.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#777' }}>{p.email}</div>
                                </div>
                                <span style={{ fontSize: '1rem' }}>👤</span>
                            </div>
                        ))}
                    </div>
                </div>
                <p style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '1rem', color: '#888' }}>Click any card to auto-fill</p>
            </div>
        </div>
    );
}
