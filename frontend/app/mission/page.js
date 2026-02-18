"use client";
import React from 'react';
import { Target, Heart, Shield, Users } from 'lucide-react';

export default function MissionPage() {
    return (
        <div className="container" style={{ padding: '6rem 0', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: 'var(--color-sea-blue)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                }}>
                    <Target size={40} />
                </div>
                <h1 style={{ fontSize: '3.5rem', color: 'var(--color-navy)', fontWeight: '800', marginBottom: '1.5rem' }}>
                    Our <span style={{ color: 'var(--color-sea-blue)' }}>Mission</span>
                </h1>
            </div>

            <div style={{
                padding: '4rem',
                background: 'white',
                borderRadius: '32px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                maxWidth: '900px',
                width: '100%',
                textAlign: 'center',
                border: '1px solid #f1f5f9'
            }}>
                <p style={{ fontSize: '1.75rem', lineHeight: '1.6', color: 'var(--color-navy)', fontWeight: '500', marginBottom: '3rem' }}>
                    "To provide compassionate, seamless, and comprehensive healthcare services that empower patients to lead healthier lives, through a robust network of dedicated professionals and secure digital innovation."
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '3rem' }}>
                    <div style={{ padding: '1rem' }}>
                        <Heart className="text-sea-blue" size={32} style={{ marginBottom: '1rem' }} />
                        <h4 style={{ marginBottom: '0.5rem' }}>Compassion</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Patient-centric care at every touchpoint.</p>
                    </div>
                    <div style={{ padding: '1rem' }}>
                        <Shield className="text-sea-blue" size={32} style={{ marginBottom: '1rem' }} />
                        <h4 style={{ marginBottom: '0.5rem' }}>Trust</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Secure, ethical, and private medical records.</p>
                    </div>
                    <div style={{ padding: '1rem' }}>
                        <Users className="text-sea-blue" size={32} style={{ marginBottom: '1rem' }} />
                        <h4 style={{ marginBottom: '0.5rem' }}>Excellence</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Certified professionals in good standing.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

