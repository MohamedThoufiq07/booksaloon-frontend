import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Sparkles, Star, Search,
    Users, Trophy, CheckCircle, Store,
    Clock, ShieldCheck, HelpCircle, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const suggestions = [
        "Modern Haircut", "Bridal Makeup", "Skin Glow Facial",
        "Spa Therapy", "Beard Grooming", "Hair Coloring"
    ];

    const handleBookNow = (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        navigate('/salons?location=Tirunelveli');
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
                        Smart Booking for Smart People
                    </motion.span>

                    <motion.h1 className="hero-title" variants={fadeInUp}>
                        Experience the <br />
                        <span className="gradient-text">Smart Way to Groom</span>
                    </motion.h1>

                    <motion.p className="hero-subtitle" variants={fadeInUp}>
                        Book premium salons instantly with AI-powered
                        recommendations and seamless slot selection.
                    </motion.p>

                    {/* Improved Search Bar */}
                    <motion.div className="hero-search-container" variants={fadeInUp}>
                        <div className="search-box-wrapper glass-effect">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search for services (e.g. Haircut, Spa)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />
                            <button 
                                className="search-btn"
                                onClick={() => navigate(`/salons?query=${searchQuery}`)}
                            >SEARCH</button>

                            <AnimatePresence>
                                {showSuggestions && (
                                    <motion.div
                                        className="search-suggestions glass-effect"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                    >
                                        <p className="suggestion-label">Popular Searches</p>
                                        {suggestions.map((item, idx) => (
                                            <div key={idx} className="suggestion-item">
                                                <Sparkles size={14} /> {item}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    <motion.div className="cta-group" variants={fadeInUp}>
                        <button
                            onClick={handleBookNow}
                            className="btn-primary pulse-glow"
                        >
                            <Sparkles size={20} /> BOOK NOW
                        </button>
                        <a href="/salons#nearby-salons" className="btn-secondary">
                            EXPLORE NEARBY SALONS <ArrowRight size={20} />
                        </a>
                    </motion.div>

                    {/* Trust Stats Section */}
                    <motion.div className="trust-stats-section" variants={fadeInUp}>
                        <div className="stat-card glass-effect">
                            <Star size={20} className="stat-icon yellow" />
                            <div className="stat-info">
                                <h4>4.8</h4>
                                <p>Avg. Rating</p>
                            </div>
                        </div>
                        <div className="stat-card glass-effect">
                            <Users size={20} className="stat-icon blue" />
                            <div className="stat-info">
                                <h4>10,000+</h4>
                                <p>Happy Users</p>
                            </div>
                        </div>
                        <div className="stat-card glass-effect">
                            <Store size={20} className="stat-icon green" />
                            <div className="stat-info">
                                <h4>150+</h4>
                                <p>Partner Salons</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Why Choose Us Section */}
            <section className="features-section">
                <div className="section-header text-center">
                    <h2 className="section-title">Why Choose BookSaloonz?</h2>
                    <p className="section-subtitle">Redefining your salon experience with smart technology.</p>
                </div>

                <div className="features-grid">
                    <motion.div className="feature-card glass-effect" whileHover={{ y: -10 }} variants={fadeInUp}>
                        <div className="feature-icon-wrapper blue">
                            <Clock size={24} />
                        </div>
                        <h3>Real-time Booking</h3>
                        <p>No more waiting on calls. See available slots and book instantly in seconds.</p>
                    </motion.div>

                    <motion.div className="feature-card glass-effect" whileHover={{ y: -10 }} variants={fadeInUp}>
                        <div className="feature-icon-wrapper gold">
                            <Sparkles size={24} />
                        </div>
                        <h3>AI Hair Tracker</h3>
                        <p>Try different hairstyles virtually before committing to any change.</p>
                    </motion.div>

                    <motion.div className="feature-card glass-effect" whileHover={{ y: -10 }} variants={fadeInUp}>
                        <div className="feature-icon-wrapper green">
                            <ShieldCheck size={24} />
                        </div>
                        <h3>Verified Salons</h3>
                        <p>Every salon on our platform is personally verified for quality and hygiene.</p>
                    </motion.div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="section-header">
                    <h2 className="section-title">What Our Users Say</h2>
                </div>

                <div className="testimonials-grid">
                    {[
                        { name: "Rahul S.", text: "The AI tracker is a game changer! I finally knew which haircut suited me best.", role: "Regular User" },
                        { name: "Priya M.", text: "Booking is so smooth. No more awkward calls to salons. Just tap and book!", role: "Professional" },
                        { name: "Anand K.", text: "Found the best salon in Tirunelveli through this app. Highly recommended.", role: "New Member" }
                    ].map((t, i) => (
                        <motion.div key={i} className="testimonial-card glass-effect" variants={fadeInUp}>
                            <div className="stars">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}
                            </div>
                            <p className="testimonial-text">"{t.text}"</p>
                            <div className="testimonial-author">
                                <strong>{t.name}</strong>
                                <span>{t.role}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <div className="section-header text-center">
                    <h2 className="section-title">Frequently Asked Questions</h2>
                </div>

                <div className="faq-container">
                    {[
                        { q: "Is there a booking fee?", a: "No, booking through BookSaloonz is completely free for users!" },
                        { q: "Can I cancel my booking?", a: "Yes, you can cancel up to 2 hours before the scheduled time from your dashboard." },
                        { q: "How does the AI Tracker work?", a: "Upload your photo, and our AI analyzes your face shape to suggest the perfect hairstyle." }
                    ].map((item, idx) => (
                        <div key={idx} className="faq-item glass-effect">
                            <details>
                                <summary>
                                    <span>{item.q}</span>
                                    <ChevronDown size={18} className="faq-arrow" />
                                </summary>
                                <div className="faq-content">
                                    <p>{item.a}</p>
                                </div>
                            </details>
                        </div>
                    ))}
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="newsletter-section">
                <motion.div className="newsletter-card glass-effect" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}>
                    <h2>Join the Grooming Revolution</h2>
                    <p>Get exclusive deals and latest fashion tips directly in your inbox.</p>
                    <div className="newsletter-form">
                        <input type="email" placeholder="Enter your email" />
                        <button className="btn-primary">SUBSCRIBE</button>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Home;
