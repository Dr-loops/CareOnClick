"use client";
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Forgot Password State
    const [isForgotMode, setIsForgotMode] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP & New Pass
    const [resetData, setResetData] = useState({ contact: '', otp: '', newPassword: '' }); // 'contact' replaces 'email'
    const [resetMsg, setResetMsg] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password);
        if (!res.success) {
            setError(res.error);
        }
    };

    const handleForgotRequest = async (e) => {
        e.preventDefault();
        setIsResetting(true);
        setResetMsg('');
        try {
            const res = await fetch('/api/auth/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'request_reset', contact: resetData.contact })
            });
            const data = await res.json();
            if (data.success) {
                setResetStep(2);
                if (data.debug_otp) alert(`[SIMULATION] Your OTP code is: ${data.debug_otp}`);
                setResetMsg(data.message || 'OTP Code sent to your contact.');
            } else {
                setError(data.error || 'Failed to send OTP');
            }
        } catch (err) { setError('Connection error'); }
        finally { setIsResetting(false); }
    };

    const handleForgotConfirm = async (e) => {
        e.preventDefault();
        setIsResetting(true);
        setError('');
        try {
            const res = await fetch('/api/auth/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'confirm_reset',
                    contact: resetData.contact,
                    otp: resetData.otp,
                    newPassword: resetData.newPassword
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Password Reset Successfully! Please login with your new password.");
                setIsForgotMode(false);
                setResetStep(1);
                // If they used email for recovery, prefill it. If phone, maybe leave blank or fill if possible (but login expects email usually?)
                // Login page expects 'email' state usually.
                if (resetData.contact.includes('@')) setEmail(resetData.contact);
                setPassword('');
            } else {
                setError(data.error || 'Reset failed');
            }
        } catch (err) { setError('Connection error'); }
        finally { setIsResetting(false); }
    };

    return (
        <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '3rem', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', borderRadius: '24px' }}>

                {/* HEADERS */}
                <h2 style={{ textAlign: 'center', fontSize: '2rem', color: 'var(--color-navy)', marginBottom: '1rem', fontWeight: '800' }}>
                    {isForgotMode ? 'Reset Password' : 'Welcome Back'}
                </h2>

                {/* ERROR/SUCCESS MESSAGES */}
                {error && <p style={{ color: 'var(--error)', marginBottom: '1.5rem', textAlign: 'center', padding: '0.75rem', background: '#fef2f2', borderRadius: '8px' }}>{error}</p>}
                {resetMsg && <p style={{ color: 'green', marginBottom: '1.5rem', textAlign: 'center', padding: '0.75rem', background: '#dcfce7', borderRadius: '8px' }}>{resetMsg}</p>}

                {/* --- FORGOT PASSWORD FORM --- */}
                {isForgotMode ? (
                    resetStep === 1 ? (
                        <form onSubmit={handleForgotRequest}>
                            <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>Enter your email or phone number to receive a recovery code.</p>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-navy)' }}>Email Address or Phone Number</label>
                                <input type="text" className="input-field" placeholder="Email or Phone (e.g. +233...)"
                                    value={resetData.contact} onChange={(e) => setResetData({ ...resetData, contact: e.target.value })} required />
                            </div>
                            <button type="submit" disabled={isResetting} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>
                                {isResetting ? 'Sending...' : 'Send OTP Code'}
                            </button>
                            <button type="button" onClick={() => setIsForgotMode(false)} style={{ width: '100%', marginTop: '1rem', background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>Cancel</button>
                        </form>
                    ) : (
                        <form onSubmit={handleForgotConfirm}>
                            <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>Enter the 4-digit code and your new password.</p>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-navy)' }}>OTP Code</label>
                                <input type="text" className="input-field" placeholder="XXXX"
                                    value={resetData.otp} onChange={(e) => setResetData({ ...resetData, otp: e.target.value })} required />
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-navy)' }}>New Password</label>
                                <input type="password" className="input-field" placeholder="Min 6 chars" minLength={6}
                                    value={resetData.newPassword} onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })} required />
                            </div>
                            <button type="submit" disabled={isResetting} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>
                                {isResetting ? 'Resetting...' : 'Set New Password'}
                            </button>
                            <button type="button" onClick={() => setResetStep(1)} style={{ width: '100%', marginTop: '1rem', background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>Back</button>
                        </form>
                    )
                ) : (
                    /* --- NORMAL LOGIN FORM --- */
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-navy)' }}>Email Address</label>
                            <input type="email" className="input-field" placeholder="your@email.com"
                                value={email} onChange={(e) => setEmail(e.target.value)} required suppressHydrationWarning />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <label style={{ fontWeight: '600', color: 'var(--color-navy)' }}>Password</label>
                                <button type="button" onClick={() => setIsForgotMode(true)} style={{ background: 'none', border: 'none', color: 'var(--color-sea-blue)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>Forgot?</button>
                            </div>
                            <input type="password" className="input-field" placeholder="••••••••"
                                value={password} onChange={(e) => setPassword(e.target.value)} required suppressHydrationWarning />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: '700' }} suppressHydrationWarning>
                            Log In
                        </button>
                    </form>
                )}

                {!isForgotMode && (
                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '1rem' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Don't have an account? <Link href="/register" style={{ color: 'var(--color-sea-blue)', fontWeight: '700' }}>Register here</Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
