import Link from 'next/link';
import AdBanner from '@/components/AdBanner';
import NewsFeed from '@/components/NewsFeed';

export default function Home() {
    return (
        <div className="container main-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        CareOnClick
                    </h1>
                    <p className="hero-subtitle">
                        Connect with top-tier medical professionals from the comfort of your home. Secure, efficient, and patient-centered care for everyone.
                    </p>
                    <div className="hero-btns">
                        <Link href="/register?type=patient" className="btn btn-primary btn-lg">
                            Get Started
                        </Link>
                        <Link href="/login" className="btn btn-secondary btn-lg">
                            Sign In
                        </Link>
                    </div>
                    <div className="hero-meta">
                        <Link href="/register?type=professional" className="prof-registration-card">
                            Register as Health Professional
                        </Link>
                    </div>
                </div>
                <div className="hero-image-wrapper">
                    <div className="hero-visual-card float-effect">
                        <div className="visual-icon">🏥</div>
                        <p className="visual-label">Official Virtual Healthcare Partner</p>
                        <div className="visual-badge">24/7 Available</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2 className="section-title">Why Choose Us?</h2>
                    <p className="section-subtitle">High-quality medical services delivered with precision and empathy.</p>
                </div>

                <div className="features-grid">
                    <div className="card feature-card">
                        <div className="feature-icon">🩺</div>
                        <h3>Expert Care</h3>
                        <p>Access certified doctors, nurses, and specialists anytime, anywhere.</p>
                    </div>
                    <div className="card feature-card">
                        <div className="feature-icon">📅</div>
                        <h3>Easy Scheduling</h3>
                        <p>Book video or in-person appointments in just a few simple clicks.</p>
                    </div>
                    <div className="card feature-card">
                        <div className="feature-icon">🛡️</div>
                        <h3>Secure Records</h3>
                        <p>Your medical history is safe, encrypted, and accessible only to you.</p>
                    </div>
                </div>
            </section>

            {/* Ad & News Section */}
            <section className="ad-news-section">
                <div className="ad-wrapper animate-fade-in">
                    <AdBanner />
                </div>
                <div className="news-wrapper animate-fade-in">
                    <NewsFeed />
                </div>
            </section>
        </div>
    );
}

