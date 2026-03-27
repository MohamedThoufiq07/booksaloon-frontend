import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Scissors, Check } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import SkeletonLoader from '../components/SkeletonLoader';
import NearbySalons from '../components/NearbySalons';
import api from '../utils/api';
import './Salons.css';

const Salons = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [salonsData, setSalonsData] = useState([
        {
            _id: '1',
            name: 'Elite Grooming Studio',
            address: 'Palayamkottai, Tirunelveli',
            startingPrice: 299,
            rating: 4.8,
            category: 'men',
            isApproved: true,
            img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80'
        },
        {
            _id: '2',
            name: 'Grace & Glamour',
            address: 'Vannarpettai, Tirunelveli',
            startingPrice: 499,
            rating: 4.9,
            category: 'women',
            isApproved: true,
            img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'
        },
        {
            _id: '3',
            name: 'The Royal Spa',
            address: 'Tirunelveli Junction',
            startingPrice: 999,
            rating: 4.7,
            category: 'spa',
            isApproved: true,
            img: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=800&q=80'
        },
        {
            _id: '4',
            name: 'Chennai Style Hub',
            address: 'T.Nagar, Chennai',
            startingPrice: 599,
            rating: 4.6,
            category: 'unisex',
            isApproved: true,
            img: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=800&q=80'
        },
        {
            _id: '5',
            name: 'Urban Cut & Care',
            address: 'RS Puram, Coimbatore',
            startingPrice: 350,
            rating: 4.5,
            category: 'men',
            isApproved: true,
            img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'
        },
        {
            _id: '6',
            name: 'Temple City Salon',
            address: 'Anna Nagar, Madurai',
            startingPrice: 400,
            rating: 4.8,
            category: 'unisex',
            isApproved: true,
            img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80'
        },
        {
            _id: '7',
            name: 'Ocean Mist Grooming',
            address: 'Beach Road, Kanyakumari',
            startingPrice: 350,
            rating: 4.6,
            category: 'men',
            isApproved: true,
            img: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80'
        },
        {
            _id: '8',
            name: 'Steel City Cuts',
            address: 'Old Bus Stand, Salem',
            startingPrice: 200,
            rating: 4.4,
            category: 'men',
            isApproved: true,
            img: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80'
        },
        {
            _id: '9',
            name: 'Rockfort Elegant Spa',
            address: 'Main Guard Gate, Trichy',
            startingPrice: 750,
            rating: 4.7,
            category: 'spa',
            isApproved: true,
            img: 'https://images.unsplash.com/photo-1470259078422-826894b933aa?auto=format&fit=crop&w=800&q=80'
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [selectedSalon, setSelectedSalon] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const EMPTY_IMAGE = "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80";

    // Pool of unique salon storefront images for salons without proper photos
    const SALON_IMAGES = [
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1470259078422-826894b933aa?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1597854710098-65c4936e5fe3?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1590540179852-2110a54f813a?auto=format&fit=crop&w=800&q=80"
    ];

    const location = useLocation();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search');
        const loc = params.get('location');
        if (search) setSearchTerm(search);
        if (loc) setSearchTerm(loc);
        fetchSalons();
    }, [location]);

    const fetchSalons = async () => {
        setLoading(true);
        try {
            const res = await api.get('/salons');
            if (res.data.success && res.data.data.length > 0) {
                // Assign unique images to salons that don't have proper unique photos
                const seen = new Set();
                const salonsWithImages = res.data.data.map((salon, index) => {
                    const hasUniqueImage = salon.img && !seen.has(salon.img);
                    if (hasUniqueImage) {
                        seen.add(salon.img);
                        return salon;
                    }
                    // Assign a unique image from our pool
                    return { ...salon, img: SALON_IMAGES[index % SALON_IMAGES.length] };
                });
                setSalonsData(salonsWithImages);
            }
        } catch (err) {
            console.error('Error fetching salons:', err);
            // On error, we keep the default sample salons
        } finally {
            setLoading(false);
        }
    };

    const filteredSalons = salonsData.filter(salon => {
        const matchesSearch =
            salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            salon.address.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleBookClick = (salon) => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        setSelectedSalon(salon);
        setIsModalOpen(true);
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="salons-container page-fade-in">
            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                salon={selectedSalon}
            />

            <div className="salons-header">
                <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    Find Your Perfect Look
                </motion.h1>

                <div className="search-filter-row">
                    <div className="search-wrapper glass-effect">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search salons, services, or locations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <a href="#nearby-salons" className="nearby-jump-btn">
                        <MapPin size={18} /> NEARBY SALONS
                    </a>
                </div>
            </div>

            {loading ? (
                <div className="salons-loading">
                    <SkeletonLoader type="card" count={6} />
                </div>
            ) : (
                <motion.div
                    className="salon-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {filteredSalons.length > 0 ? (
                        filteredSalons.map((salon) => (
                            <motion.div
                                key={salon._id}
                                className="salon-card glass-effect"
                                variants={cardVariants}
                                whileHover={{ y: -10 }}
                            >
                                <div className="salon-img-container">
                                    <img
                                        src={salon.img || EMPTY_IMAGE}
                                        alt={salon.name}
                                        className="salon-card-img"
                                        onError={(e) => { e.target.src = EMPTY_IMAGE; }}
                                    />
                                    {salon.isApproved && (
                                        <div className="verified-badge">
                                            <Check size={12} /> VERIFIED
                                        </div>
                                    )}
                                </div>
                                <div className="salon-info">
                                    <h3 className="salon-card-name">{salon.name}</h3>
                                    <p className="salon-card-address">
                                        <MapPin size={14} color="var(--primary)" /> {salon.address}
                                    </p>
                                    <div className="salon-card-footer">
                                        <div className="salon-price">
                                            <span className="price-label">Starts from</span>
                                            <span className="price-value">₹{salon.startingPrice}</span>
                                        </div>
                                        <div className="salon-rating">
                                            <Star size={14} fill="#fbbf24" color="#fbbf24" /> {salon.rating || '4.0'}
                                        </div>
                                    </div>
                                    <button
                                        className="book-btn-full mt-4"
                                        onClick={() => handleBookClick(salon)}
                                    >
                                        BOOK APPOINTMENT
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="no-results">
                            <Scissors size={48} className="text-muted" />
                            <h3>No salons found</h3>
                            <p>Try matching another location or name.</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ✅ Nearby Salons Feature added at the very bottom */}
            <NearbySalons />
        </div>
    );
};

export default Salons;
