import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function Contact() {
    return (
        <div className="container main-page">
            <section className="contact-section">
                <div className="section-header">
                    <h1 className="section-title">Get in Touch</h1>
                    <p className="section-subtitle">We are here to help. Reach out to us via any of the channels below.</p>
                </div>

                <div className="contact-grid">
                    <div className="card contact-card">
                        <div className="contact-icon bg-blue-100 text-blue-600">
                            <Mail size={32} />
                        </div>
                        <h3>Email Us</h3>
                        <p>For general inquiries and support</p>
                        <a href="mailto:drkalsvirtualhospital@gmail.com" className="contact-link">drkalsvirtualhospital@gmail.com</a>
                    </div>

                    <div className="card contact-card">
                        <div className="contact-icon bg-green-100 text-green-600">
                            <Phone size={32} />
                        </div>
                        <h3>Call Us</h3>
                        <p>Speak directly with our support team</p>
                        <a href="tel:+233595441825" className="contact-link">+233 59 544 1825</a>
                    </div>

                    <div className="card contact-card">
                        <div className="contact-icon bg-green-100 text-green-600">
                            <MessageCircle size={32} />
                        </div>
                        <h3>WhatsApp</h3>
                        <p>Instant chat support</p>
                        <Link href="https://wa.me/233246344188" target="_blank" className="contact-link">
                            Chat on WhatsApp (+233 24 634 4188)
                        </Link>
                    </div>

                    <div className="card contact-card">
                        <div className="contact-icon bg-purple-100 text-purple-600">
                            <MapPin size={32} />
                        </div>
                        <h3>Visit Us</h3>
                        <p>Our operational headquarters</p>
                        <span className="contact-text">Tamale, Ghana</span>
                    </div>
                </div>

                <div className="map-placeholder card">
                    {/* Placeholder for a map or office image if needed in future */}
                    <div className="placeholder-content">
                        <h3>Virtual Hospital Operational Hub</h3>
                        <p>Serving patients globally from Tamale.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
