"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function DashboardNav() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Only show on dashboard pages
    if (!pathname || !pathname.startsWith('/dashboard')) return null;
    if (!user) return null; // Don't render if no user is logged in

    return (
        <>
            <nav className="dashboard-nav">
                <div className="dashboard-nav-container">
                    {/* Logo/Brand */}
                    <div className="dashboard-nav-brand">
                        <img src="/logo_new.jpg" alt="CareOnClick" className="dashboard-nav-logo" />
                        <span className="dashboard-nav-title">CareOnClick</span>
                    </div>

                    {/* Desktop Actions */}
                    <div className="dashboard-nav-actions">
                        <Link href="/" className="dashboard-nav-btn" title="Home">
                            <Home size={18} />
                            <span>Home</span>
                        </Link>
                        <Link href="https://wa.me/233540509530" target="_blank" className="dashboard-nav-btn" title="Help Center">
                            <MessageCircle size={18} />
                            <span>Help</span>
                        </Link>
                        <button onClick={logout} className="dashboard-nav-btn logout-btn" title="Logout">
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="dashboard-nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="dashboard-nav-mobile-overlay" onClick={() => setIsMenuOpen(false)}>
                    <div className="dashboard-nav-mobile-menu" onClick={(e) => e.stopPropagation()}>
                        <div className="dashboard-nav-mobile-header">
                            <img src="/logo_new.jpg" alt="CareOnClick" />
                            <span>CareOnClick</span>
                            <button onClick={() => setIsMenuOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="dashboard-nav-mobile-links">
                            <Link href="/" onClick={() => setIsMenuOpen(false)}>
                                <Home size={18} />
                                <span>Home</span>
                            </Link>
                            <Link href="https://wa.me/233540509530" target="_blank" onClick={() => setIsMenuOpen(false)}>
                                <MessageCircle size={18} />
                                <span>Help Center</span>
                            </Link>
                            <button onClick={() => { logout(); setIsMenuOpen(false); }} className="logout-mobile">
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .dashboard-nav {
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
                }

                .dashboard-nav-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0.75rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .dashboard-nav-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .dashboard-nav-logo {
                    height: 35px;
                    width: auto;
                    border-radius: 6px;
                }

                .dashboard-nav-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: white;
                    letter-spacing: -0.5px;
                }

                .dashboard-nav-actions {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }

                .dashboard-nav-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                }

                .dashboard-nav-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }

                .logout-btn {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: rgba(239, 68, 68, 0.4);
                }

                .logout-btn:hover {
                    background: rgba(239, 68, 68, 0.3);
                }

                .dashboard-nav-toggle {
                    display: none;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    padding: 0.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                }

                .dashboard-nav-mobile-overlay {
                    display: none;
                }

                @media (max-width: 768px) {
                    .dashboard-nav-actions {
                        display: none;
                    }

                    .dashboard-nav-toggle {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .dashboard-nav-mobile-overlay {
                        display: block;
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        z-index: 2000;
                        animation: fadeIn 0.2s ease;
                    }

                    .dashboard-nav-mobile-menu {
                        position: absolute;
                        top: 0;
                        right: 0;
                        width: 280px;
                        height: 100%;
                        background: white;
                        box-shadow: -4px 0 12px rgba(0, 0, 0, 0.2);
                        animation: slideIn 0.3s ease;
                    }

                    .dashboard-nav-mobile-header {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 1.25rem;
                        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                        color: white;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    }

                    .dashboard-nav-mobile-header img {
                        height: 30px;
                        width: auto;
                        border-radius: 4px;
                    }

                    .dashboard-nav-mobile-header span {
                        flex: 1;
                        font-weight: 700;
                        font-size: 1.1rem;
                    }

                    .dashboard-nav-mobile-header button {
                        background: rgba(255, 255, 255, 0.1);
                        border: none;
                        color: white;
                        padding: 0.5rem;
                        border-radius: 6px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .dashboard-nav-mobile-links {
                        display: flex;
                        flex-direction: column;
                        padding: 1rem;
                        gap: 0.5rem;
                    }

                    .dashboard-nav-mobile-links a,
                    .dashboard-nav-mobile-links button {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.875rem 1rem;
                        background: #f8fafc;
                        color: #1e293b;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        font-size: 0.95rem;
                        font-weight: 500;
                        cursor: pointer;
                        text-decoration: none;
                        transition: all 0.2s ease;
                        width: 100%;
                        text-align: left;
                    }

                    .dashboard-nav-mobile-links a:hover,
                    .dashboard-nav-mobile-links button:hover {
                        background: #e2e8f0;
                        transform: translateX(4px);
                    }

                    .logout-mobile {
                        background: #fef2f2 !important;
                        color: #dc2626 !important;
                        border-color: #fecaca !important;
                        margin-top: 0.5rem;
                    }

                    .logout-mobile:hover {
                        background: #fee2e2 !important;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes slideIn {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                }

                @media print {
                    .dashboard-nav {
                        display: none;
                    }
                }
            `}</style>
        </>
    );
}
