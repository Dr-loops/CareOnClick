"use client";
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, GraduationCap, Award, MapPin, Activity, Globe, Lock, Cpu } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="container" style={{ margin: '0 auto', padding: '4rem 1.5rem', maxWidth: '1000px' }}>
            {/* Hero Header */}
            <header style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <h1 style={{ fontSize: '3.5rem', color: 'var(--color-navy)', marginBottom: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                    About Dr Kal&apos;s <span style={{ color: 'var(--color-sea-blue)' }}>Virtual Hospital</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
                    Pioneering a borderless digital healthcare ecosystem. We bridge the gap between world-class medical expertise and your doorstep through innovation, empathy, and integrity.
                </p>
            </header>

            {/* CEO Profile Section */}
            <section style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(300px, 1fr) 2fr',
                gap: '4rem',
                alignItems: 'center',
                marginBottom: '6rem',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                padding: '4rem',
                borderRadius: '32px',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.04)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    {/* Size reverted/refined to elliptical 260x320px */}
                    <div className="ceo-photo-container" style={{
                        width: '260px',
                        height: '320px',
                        borderRadius: '130px / 160px',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        margin: '0 auto 2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-sea-blue)',
                        border: '8px solid white',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <img
                            src="/ceo.jpg"
                            alt="Dr. Julius Kaletsi"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center 10%',
                                transform: 'scale(2.2)'
                            }}
                        />
                    </div>
                    <h3 style={{ color: 'var(--color-navy)', fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: '700' }}>Dr. Julius Kaletsi</h3>
                    <p style={{ color: 'var(--color-sea-blue)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Founder & Chief Executive Officer</p>
                </div>

                <div>
                    <h2 style={{ fontSize: '2.25rem', color: 'var(--color-navy)', marginBottom: '1.5rem', fontWeight: '800' }}>The Visionary Path</h2>
                    <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                        Dr. Julius Kaletsi is a visionary medical professional committed to transforming healthcare delivery through technology. An alumnus of the esteemed <strong>University for Development Studies (UDS), Tamale Campus</strong> in the Northern Region of Ghana, Dr. Kaletsi brings a unique blend of clinical excellence and technological foresight.
                    </p>
                    <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Witnessing the disparities in healthcare access first-hand during his studies in the Northern Region, he founded Dr. Kal’s Virtual Hospital to ensure that high-quality medical guidance is a right, not a privilege, regardless of geographical location.
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-navy)', fontWeight: '600' }}>
                            <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px' }}><GraduationCap size={20} color="var(--color-sea-blue)" /></div>
                            <span>Alumnus, UDS Tamale</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-navy)', fontWeight: '600' }}>
                            <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px' }}><MapPin size={20} color="var(--color-sea-blue)" /></div>
                            <span>Northern Region, Ghana</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Detailed Functionality Section */}
            <section style={{ marginBottom: '6rem' }}>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--color-navy)', marginBottom: '3rem', textAlign: 'center', fontWeight: '800' }}>Platform Functionality</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2.5rem' }}>
                    <div className="card" style={{ padding: '3rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <Activity size={40} color="var(--color-sea-blue)" />
                            <div>
                                <h3 style={{ marginBottom: '1rem' }}>Comprehensive Care Cycle</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                                    Our platform facilitates the entire patient journey. From initial booking and monitoring to secure video consultations and digital prescriptions. We integrate Pharmacy, Laboratory, and Specialized therapy services into one seamless interface.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="card" style={{ padding: '3rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <Cpu size={40} color="var(--color-sea-blue)" />
                            <div>
                                <h3 style={{ marginBottom: '1rem' }}>Next-Gen Infrastructure</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                                    Utilizing low-latency WebRTC for crystalline video calls and high-availability PostgreSQL clusters for data integrity, Dr. Kal’s Virtual Hospital is built on a robust architecture designed for 24/7 reliability and data safety.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values / Professional Standards */}
            <section style={{ marginBottom: '6rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--color-navy)', marginBottom: '1rem', fontWeight: '800' }}>Our Professional Commitment</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Global standards of medical ethics and clinical excellence.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
                    {[
                        { icon: ShieldCheck, title: "Certified Experts", text: "Every professional listed is rigorously vetted. We only host practitioners with proven track records in their clinical fields.", color: "#16a34a", bg: "#f0fdf4" },
                        { icon: Award, title: "Licensed to Practice", text: "All practitioners hold verified, current licenses and maintain a status of good standing with national and regional medical councils.", color: "#2563eb", bg: "#eff6ff" },
                        { icon: Lock, title: "Secure & Ethical", text: "We strictly adhere to international data protection standards, ensuring patient confidentiality is never compromised.", color: "#9333ea", bg: "#faf5ff" }
                    ].map((item, idx) => (
                        <div key={idx} className="card" style={{ padding: '3rem', textAlign: 'center', background: 'white', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 25px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: item.color }}>
                                <item.icon size={36} />
                            </div>
                            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.5rem', color: 'var(--color-navy)', fontWeight: '700' }}>{item.title}</h3>
                            <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '1.05rem' }}>{item.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            <div style={{
                textAlign: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', // Deeper navy for better contrast
                color: 'white',
                padding: '6rem 3rem',
                borderRadius: '48px',
                marginTop: '6rem',
                boxShadow: '0 30px 70px rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem', fontWeight: '800', color: '#f8fafc' }}>Experience Better Healthcare Today</h2>
                <p style={{ fontSize: '1.35rem', marginBottom: '3.5rem', color: '#cbd5e1', maxWidth: '700px', margin: '0 auto 3.5rem', lineHeight: '1.6' }}>
                    Join the digital revolution in healthcare. Secure, expert advice is just a click away.
                </p>
                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/register?type=patient" className="btn btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', background: '#ffffff', color: '#0f172a', border: 'none', fontWeight: '700', borderRadius: '16px' }}>Get Started</Link>
                    <Link href="/services" className="btn btn-secondary" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.05)', color: '#ffffff', border: '2px solid rgba(255,255,255,0.8)', fontWeight: '600', borderRadius: '16px', backdropFilter: 'blur(5px)' }}>Browse Services</Link>
                </div>
            </div>
        </div>
    );
}


