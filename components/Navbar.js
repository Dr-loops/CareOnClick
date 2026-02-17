"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, Menu, X, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function Navbar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const isLoggedIn = !!user;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu when route changes
    useEffect(() => setIsMenuOpen(false), [pathname]);

    // [NEW] Hide global Navbar on Dashboard pages to prevent interference
    if (pathname.startsWith('/dashboard')) return null;

    return (
        <nav className={`main-nav ${scrolled ? 'scrolled' : ''}`}>
            <div className="container nav-container">
                {/* Logo Section */}
                <Link href="/" className="nav-logo">
                    <img src="/logo_new.jpg" alt="CareOnClick Logo" />
                    <span className="text-gradient">CareOnClick</span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="nav-links-desktop">
                    <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
                    <Link href="/services" className={pathname === '/services' ? 'active' : ''}>Services</Link>
                    <Link href="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
                    <Link href="/vision" className={pathname === '/vision' ? 'active' : ''}>Vision</Link>
                    <Link href="/mission" className={pathname === '/mission' ? 'active' : ''}>Mission</Link>
                </div>

                {/* Action Buttons */}
                <div className="nav-actions">
                    <Link href="https://wa.me/233246344188" target="_blank" className="btn btn-secondary hide-on-mobile">
                        <MessageCircle size={18} />
                        Help Center
                    </Link>

                    {isLoggedIn ? (
                        <div className="nav-user-controls">
                            <Link href="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
                            <button onClick={logout} className="btn-icon text-error-dark" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="btn btn-primary hide-on-mobile">Log In</Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Menu */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
                <div className="mobile-menu-content" onClick={e => e.stopPropagation()}>
                    <div className="mobile-menu-header">
                        <img src="/logo_new.jpg" alt="Logo" />
                        <span className="text-gradient">CareOnClick</span>
                        <button onClick={() => setIsMenuOpen(false)}><X /></button>
                    </div>

                    <div className="mobile-menu-links">
                        <Link href="/" className={pathname === '/' ? 'active' : ''}>
                            Home <ChevronRight size={16} />
                        </Link>
                        <Link href="/services" className={pathname === '/services' ? 'active' : ''}>
                            Services <ChevronRight size={16} />
                        </Link>
                        <Link href="/about" className={pathname === '/about' ? 'active' : ''}>
                            About <ChevronRight size={16} />
                        </Link>
                        <Link href="/vision" className={pathname === '/vision' ? 'active' : ''}>
                            Vision <ChevronRight size={16} />
                        </Link>
                        <Link href="/mission" className={pathname === '/mission' ? 'active' : ''}>
                            Mission <ChevronRight size={16} />
                        </Link>
                        <hr />
                        {!isLoggedIn ? (
                            <Link href="/login" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Login / Register</Link>
                        ) : (
                            <button onClick={logout} className="btn btn-danger" style={{ marginTop: '1rem', width: '100%' }}>Logout</button>
                        )}
                        <Link href="https://wa.me/233246344188" target="_blank" className="mobile-help-link">
                            <MessageCircle size={18} /> Need Help? Chat with us
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

