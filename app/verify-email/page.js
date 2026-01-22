"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getGlobalData, KEYS } from '@/lib/global_sync';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email');
    const type = searchParams.get('type'); // 'verification', 'approval', 'rejection'

    const [simulatedEmail, setSimulatedEmail] = useState(null);

    useEffect(() => {
        // Fetch the latest email log for this user
        // We use a small timeout to allow localStorage to update if we just got redirected
        const timer = setTimeout(() => {
            if (typeof window !== 'undefined') {
                const logs = JSON.parse(localStorage.getItem('dr_kal_email_logs') || '[]');
                const userEmails = logs.filter(l => l.to === email).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                if (userEmails.length > 0) {
                    setSimulatedEmail(userEmails[0]);
                }
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [email]);

    return (
        <div className="container" style={{ marginTop: '4rem', maxWidth: '800px' }}>
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✉️</div>
                <h1>Check Your Email</h1>
                <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
                    We've sent a message to <strong>{email || 'your address'}</strong>.
                </p>

                {/* DEV MODE PREVIEW */}
                <div style={{ textAlign: 'left', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#64748b', fontSize: '0.9rem' }}>DEV MODE: LOCAL MAIL CATCHER</strong>
                        <span style={{ fontSize: '0.8rem', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>Simulated Inbox</span>
                    </div>

                    {simulatedEmail ? (
                        <div>
                            <div style={{ marginBottom: '0.5rem' }}><strong>Subject:</strong> {simulatedEmail.subject}</div>
                            <div style={{ marginBottom: '1rem' }}><strong>To:</strong> {simulatedEmail.to}</div>
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap' }}>
                                {simulatedEmail.body}
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: '#999', fontStyle: 'italic' }}>Waiting for email simulation... (Data stored in localStorage)</div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={() => window.location.reload()} className="btn btn-secondary">
                        🔄 Refresh Inbox
                    </button>
                    <Link href="/login" className="btn btn-primary">
                        Return to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading email viewer...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
