"use client";
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
    const { login } = useAuth();
    // ... (rest of code before handleForgotConfirm)

    <form onSubmit={handleForgotConfirm}>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>Enter the 4-digit code and your new password.</p>
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-navy)' }}>OTP Code</label>
            <input type="text" className="input-field" placeholder="XXXX"
                value={resetData.otp} onChange={(e) => setResetData({ ...resetData, otp: e.target.value })} required />
        </div>
        <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-navy)' }}>New Password</label>
            <Input
                type="password"
                placeholder="Min 6 chars"
                minLength={6}
                value={resetData.newPassword}
                onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                required
                fullWidth
            />
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-navy)' }}>Email Address or Member ID</label>
                <input type="text" className="input-field" placeholder="your@email.com or PATH0001"
                    value={email} onChange={(e) => setEmail(e.target.value)} required suppressHydrationWarning />
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: '600', color: 'var(--color-navy)' }}>Password</label>
                    <button type="button" onClick={() => setIsForgotMode(true)} style={{ background: 'none', border: 'none', color: 'var(--color-sea-blue)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>Forgot?</button>
                </div>
                <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                    suppressHydrationWarning
                />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: '700' }} suppressHydrationWarning>
                Log In
            </button>
        </form>
    )
}

{
    !isForgotMode && (
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
                Don't have an account? <Link href="/register" style={{ color: 'var(--color-sea-blue)', fontWeight: '700' }}>Register here</Link>
            </p>
        </div>
    )
}
            </div >
        </div >
    );
}
