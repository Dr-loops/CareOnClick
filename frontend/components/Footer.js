"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    const pathname = usePathname();

    // Hide Footer on Dashboard pages
    if (pathname && pathname.startsWith('/dashboard')) return null;

    return (
        <footer className="site-footer">
            <div className="container footer-container">
                <div className="footer-grid">
                    {/* Brand Column */}
                    <div className="footer-col brand-col">
                        <Link href="/" className="footer-logo">
                            <span className="text-gradient">CareOnClick</span>
                        </Link>
                        <p className="footer-desc">
                            Your trusted virtual hospital. connecting patients with top-tier medical professionals worldwide.
                        </p>
                        <div className="social-links">
                            <Link href="#" className="social-link"><Facebook size={20} /></Link>
                            <Link href="#" className="social-link"><Twitter size={20} /></Link>
                            <Link href="#" className="social-link"><Instagram size={20} /></Link>
                            <Link href="#" className="social-link"><Linkedin size={20} /></Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/services">Services</Link></li>
                            <li><Link href="/mission">Our Mission</Link></li>
                            <li><Link href="/vision">Our Vision</Link></li>
                        </ul>
                    </div>

                    {/* Legal / Support */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Support</h4>
                        <ul className="footer-links">
                            <li><Link href="https://wa.me/233540509530" target="_blank">Help Center</Link></li>
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                            <li><Link href="/terms">Terms of Service</Link></li>
                            <li><Link href="/contact">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-col">
                        <h4 className="footer-heading">Contact</h4>
                        <ul className="contact-list">
                            <li>
                                <Mail size={16} />
                                <span>drkalsvirtualhospital@gmail.com</span>
                            </li>
                            <li>
                                <Phone size={16} />
                                <span>+233 59 544 1825</span>
                            </li>
                            <li>
                                <MapPin size={16} />
                                <span>Tamale, Ghana</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} CareOnClick. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
