import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Sparkles, Star, LayoutDashboard,
    Users, Trophy, CheckCircle, Store,
    Clock, ShieldCheck, HelpCircle, ChevronDown,
    Package, BarChart3, TrendingUp, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Reusing Home styles for consistency

const PartnerConnect = () => {
    const navigate = useNavigate();

    const handleAction = (e) => {
        e.preventDefault();
        // Redirect any partner action to partner login/signup
        navigate('/partner-login');
    };

    // Animation Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    return (
        <div className="home-container page-fade-in">
            {/* Hero Section */}
            <section className="hero">
                <motion.div
                    className="hero-content"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <motion.span className="badge" variants={fadeInUp}>
                        <Sparkles size={14} className="text-primary-glow" />
                        Premium Partner Network
                    </motion.span>

                    <motion.h1 className="hero-title" variants={fadeInUp}>
                        Empower Your <br />
                        <span className="gradient-text">Salon Business</span>
                    </motion.h1>

                    <motion.p className="hero-subtitle" variants={fadeInUp}>
                        Join India's fastest-growing salon network. Manage bookings,
                        inventory, and analytics in one smart, integrated place.
                    </motion.p>

                    <motion.div className="cta-group" variants={fadeInUp}>
                        <button
                            onClick={handleAction}
                            className="btn-primary pulse-glow"
                        >
                            <Sparkles size={20} /> REGISTER YOUR SALON
                        </button>
                        <button onClick={handleAction} className="btn-secondary">
                            PARTNER LOGIN <ArrowRight size={20} />
                        </button>
                    </motion.div>

                    {/* Partner Stats */}
                    <motion.div className="trust-stats-section" variants={fadeInUp}>
                        <div className="stat-card glass-effect">
                            <TrendingUp size={20} className="stat-icon green" />
                            <div className="stat-info">
                                <h4>35%</h4>
                                <p>Revenue Growth</p>
                            </div>
                        </div>
                        <div className="stat-card glass-effect">
                            <Users size={20} className="stat-icon blue" />
                            <div className="stat-info">
                                <h4>500+</h4>
                                <p>Weekly Bookings</p>
                            </div>
                        </div>
                        <div className="stat-card glass-effect">
                            <BarChart3 size={20} className="stat-icon purple" />
                            <div className="stat-info">
                                <h4>Smart</h4>
                                <p>Analytics Hub</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Partner Features Section */}
            <section className="features-section">
                <div className="section-header text-center">
                    <h2 className="section-title">Grow with BookSaloonz</h2>
                    <p className="section-subtitle">The tools you need to run a successful modern salon.</p>
                </div>

                <div className="features-grid">
                    <motion.div className="feature-card glass-effect" whileHover={{ y: -10 }} onClick={handleAction} style={{ cursor: 'pointer' }}>
                        <div className="feature-icon-wrapper blue">
                            <LayoutDashboard size={24} />
                        </div>
                        <h3>Powerful Dashboard</h3>
                        <p>Complete overview of your salon performance, staff, and customer feedback.</p>
                    </motion.div>

                    <motion.div className="feature-card glass-effect" whileHover={{ y: -10 }} onClick={handleAction} style={{ cursor: 'pointer' }}>
                        <div className="feature-icon-wrapper gold">
                            <Package size={24} />
                        </div>
                        <h3>Inventory Management</h3>
                        <p>Track your salon products and grooming supplies with automatic stock alerts.</p>
                    </motion.div>

                    <motion.div className="feature-card glass-effect" whileHover={{ y: -10 }} onClick={handleAction} style={{ cursor: 'pointer' }}>
                        <div className="feature-icon-wrapper green">
                            <Settings size={24} />
                        </div>
                        <h3>Smart Auto-Scheduling</h3>
                        <p>AI-driven slot management to maximize your revenue and minimize idle time.</p>
                    </motion.div>
                </div>
            </section>

            {/* Partner Testimonials */}
            <section className="testimonials-section">
                <div className="section-header">
                    <h2 className="section-title">Partner Success Stories</h2>
                </div>

                <div className="testimonials-grid">
                    {[
                        { name: "Vikram R.", text: "Since joining BookSaloonz, our daily bookings have nearly doubled!", business: "Elite Grooming Studio" },
                        { name: "Sanya G.", text: "The dashboard makes managing multiple salon branches so simple and organized.", business: "Lavish Hair Spa" },
                        { name: "Karthik P.", text: "Best platform for independent salon owners to scale their business digitsally.", business: "K-Style Mens Salon" }
                    ].map((t, i) => (
                        <motion.div key={i} className="testimonial-card glass-effect" variants={fadeInUp}>
                            <div className="stars">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}
                            </div>
                            <p className="testimonial-text">"{t.text}"</p>
                            <div className="testimonial-author">
                                <strong>{t.name}</strong>
                                <span>{t.business}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Partner FAQ Section */}
            <section className="faq-section">
                <div className="section-header text-center">
                    <h2 className="section-title">Partner FAQs</h2>
                </div>

                <div className="faq-container">
                    {[
                        { q: "How much does it cost to join?", a: "We offer competitive pricing tailored to salon size. Contact our sales for a custom quote." },
                        { q: "Do you provide staff training?", a: "Yes, once you join, we provide a full toolkit and training sessions for your staff." },
                        { q: "Can I manage multiple salons?", a: "Absolutely! Our multi-branch dashboard is designed for growing salon chains." }
                    ].map((item, idx) => (
                        <div key={idx} className="faq-item glass-effect">
                            <details onClick={(e) => { e.preventDefault(); handleAction(e); }}>
                                <summary>
                                    <span>{item.q}</span>
                                    <ChevronDown size={18} className="faq-arrow" />
                                </summary>
                            </details>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default PartnerConnect;
