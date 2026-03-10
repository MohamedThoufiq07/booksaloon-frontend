import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MapPin, Star, Clock, Info, Check,
    ChevronLeft, Share2, Heart, ShieldCheck,
    MessageCircle, Scissors, Sparkles
} from 'lucide-react';
import BookingModal from '../components/BookingModal';
import SkeletonLoader from '../components/SkeletonLoader';
import api from '../utils/api';
import './SalonDetails.css';

const SalonDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [salon, setSalon] = useState(null);
    const [services, setServices] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('services');

    useEffect(() => {
        fetchSalonDetails();
    }, [id]);

    const fetchSalonDetails = async () => {
        setLoading(true);
        try {
            const [salonRes, servicesRes, reviewsRes] = await Promise.all([
                api.get(`/salons/${id}`),
                api.get(`/services/salon/${id}`),
                api.get(`/reviews/salon/${id}`)
            ]);

            if (salonRes.data.success) setSalon(salonRes.data.data);
            if (servicesRes.data.success) setServices(servicesRes.data.services);
            if (reviewsRes.data.success) setReviews(reviewsRes.data.data);
        } catch (err) {
            console.error('Error fetching salon details:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-page"><SkeletonLoader type="card" count={1} /></div>;

    if (!salon) return <div className="error-page text-center"><h2>Salon not found</h2><button onClick={() => navigate('/salons')}>Go Back</button></div>;

    return (
        <div className="salon-details-container page-fade-in">
            {/* Header / Hero */}
            <div className="salon-hero">
                <button className="back-circle" onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} />
                </button>
                <img src={salon.img || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"} alt={salon.name} className="hero-img" />
                <div className="hero-overlay">
                    <div className="hero-content-bottom">
                        <div className="salon-badge">
                            <Sparkles size={14} /> PREMIUM SALON
                        </div>
                        <h1>{salon.name}</h1>
                        <div className="hero-meta">
                            <span><MapPin size={16} /> {salon.address}</span>
                            <span><Star size={16} fill="#fbbf24" color="#fbbf24" /> {salon.rating || '4.0'} ({salon.totalReviews || 0} Reviews)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="details-layout">
                <div className="details-main">
                    {/* Tabs */}
                    <div className="details-tabs glass-effect">
                        <button className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>Services</button>
                        <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reviews</button>
                        <button className={activeTab === 'about' ? 'active' : ''} onClick={() => setActiveTab('about')}>About</button>
                    </div>

                    <div className="tab-content mt-8">
                        {activeTab === 'services' && (
                            <div className="services-section">
                                <div className="section-header-row">
                                    <h3>A La Carte Services</h3>
                                    <span>{services.length} items</span>
                                </div>
                                <div className="services-list-details">
                                    {services.map(s => (
                                        <div key={s._id} className="service-detail-card glass-effect">
                                            <div className="service-info-col">
                                                <h4>{s.name}</h4>
                                                <p>{s.description || 'Professional grooming service tailored for you.'}</p>
                                                <div className="service-meta-tags">
                                                    <span><Clock size={12} /> {s.duration} mins</span>
                                                    <span><ShieldCheck size={12} /> Warranty included</span>
                                                </div>
                                            </div>
                                            <div className="service-action-col">
                                                <span className="service-price">₹{s.price}</span>
                                                <button className="btn-primary-small" onClick={() => setIsModalOpen(true)}>Book</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="reviews-section">
                                <div className="rating-summary glass-effect">
                                    <div className="big-rating">{salon.rating || '4.0'}</div>
                                    <div className="rating-stats">
                                        <div className="stars-row"><Star size={16} fill="#fbbf24" color="#fbbf24" /> Excellent work</div>
                                        <p>Based on {salon.totalReviews || 0} verified customer experiences.</p>
                                    </div>
                                </div>
                                <div className="reviews-list mt-8">
                                    {reviews.length > 0 ? reviews.map(r => (
                                        <div key={r._id} className="review-card glass-effect">
                                            <div className="review-header">
                                                <div className="reviewer-avatar">{r.user?.name?.charAt(0)}</div>
                                                <div className="reviewer-info">
                                                    <strong>{r.user?.name}</strong>
                                                    <div className="review-rating">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={12} fill={i < r.rating ? "#fbbf24" : "rgba(255,255,255,0.1)"} color="none" />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="review-comment">{r.comment}</p>
                                        </div>
                                    )) : <p className="text-muted text-center py-10">No reviews yet. Be the first to review!</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="about-tab glass-effect">
                                <h3>About {salon.name}</h3>
                                <p className="salon-desc">{salon.description || 'Welcome to our premium salon. We provide a wide range of services for hair, skin, and nails, using the highest quality products. Our experienced stylists are dedicated to helping you achieve your desired look in a relaxing and professional environment.'}</p>
                                <div className="salon-features-grid">
                                    <div className="feature-small"><Check size={16} /> Air Conditioned</div>
                                    <div className="feature-small"><Check size={16} /> Free Wi-Fi</div>
                                    <div className="feature-small"><Check size={16} /> Parking Available</div>
                                    <div className="feature-small"><Check size={16} /> Professional Staff</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Sticky Card */}
                <aside className="details-sidebar">
                    <div className="sticky-booking-card glass-effect">
                        <div className="card-header">
                            <h3>Ready to shine?</h3>
                            <p>Select your favorite service and date.</p>
                        </div>
                        <button className="btn-primary w-full py-4" onClick={() => setIsModalOpen(true)}>
                            BOOK NOW
                        </button>
                        <hr className="my-6 border-white/5" />
                        <div className="sidebar-contact">
                            <div className="contact-item">
                                <Clock size={16} />
                                <div>
                                    <h5>Opening Hours</h5>
                                    <p>09:00 AM - 09:00 PM</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <MessageCircle size={16} />
                                <div>
                                    <h5>Chat with us</h5>
                                    <p>Available on WhatsApp</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                salon={salon}
            />
        </div>
    );
};

export default SalonDetails;
