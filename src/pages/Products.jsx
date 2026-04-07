import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Star, ShoppingCart, MapPin, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import './Products.css';

const FALLBACK_PRODUCTS = [
    // ===== TOOLS (7 Trimmers) =====
    { id: "65d8f1e1b1a1a1a1a1a1a1a1", name: "Nova NHT Basic Trimmer", category: "Tools", price: 799, rating: 4.2, img: "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1a2", name: "Philips BT1210 Beard Trimmer", category: "Tools", price: 1099, rating: 4.4, img: "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1a3", name: "Mi Cordless Beard Trimmer", category: "Tools", price: 1499, rating: 4.5, img: "https://images.unsplash.com/photo-1622287162716-f311baa69e57?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1a4", name: "Wahl Color Pro Trimmer", category: "Tools", price: 1999, rating: 4.6, img: "https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1a5", name: "Philips QT4011 Pro Trimmer", category: "Tools", price: 2499, rating: 4.7, img: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1a6", name: "Braun MGK7 Multi Grooming Kit", category: "Tools", price: 3499, rating: 4.8, img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1a7", name: "Dyson OneBlade Pro Trimmer", category: "Tools", price: 4999, rating: 4.9, img: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=400&q=80" },

    // ===== HAIR CARE (7 products) =====
    { id: "65d8f1e1b1a1a1a1a1a1a1a8", name: "Anti-Dandruff Shampoo", category: "Hair Care", price: 349, rating: 4.3, img: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1a9", name: "Argan Oil Conditioner", category: "Hair Care", price: 499, rating: 4.5, img: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1b1", name: "Keratin Repair Hair Serum", category: "Hair Care", price: 699, rating: 4.7, img: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1b2", name: "Biotin Hair Growth Oil", category: "Hair Care", price: 850, rating: 4.8, img: "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1b3", name: "Deep Nourish Hair Mask", category: "Hair Care", price: 999, rating: 4.6, img: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1b4", name: "Coconut Milk Shampoo", category: "Hair Care", price: 549, rating: 4.4, img: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1b5", name: "Hair Fall Control Tonic", category: "Hair Care", price: 1199, rating: 4.9, img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80" },

    // ===== STYLING (7 products) =====
    { id: "65d8f1e1b1a1a1a1a1a1a1b6", name: "Strong Hold Hair Gel", category: "Styling", price: 250, rating: 4.2, img: "https://images.unsplash.com/photo-1594434293289-ad62bd306596?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1b7", name: "Matte Finish Hair Wax", category: "Styling", price: 399, rating: 4.5, img: "https://images.unsplash.com/photo-1631730359585-38a4935ccbb2?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1b8", name: "Volume Boost Hair Spray", category: "Styling", price: 499, rating: 4.6, img: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1b9", name: "Sea Salt Texture Spray", category: "Styling", price: 599, rating: 4.4, img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1c1", name: "Clay Pomade Premium", category: "Styling", price: 749, rating: 4.7, img: "https://images.unsplash.com/photo-1590540179852-2110a54f813a?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1c2", name: "Heat Protect Hair Cream", category: "Styling", price: 450, rating: 4.3, img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1c3", name: "Fiber Hold Styling Paste", category: "Styling", price: 650, rating: 4.8, img: "https://images.unsplash.com/photo-1597854710098-65c4936e5fe3?auto=format&fit=crop&w=400&q=80" },

    // ===== SHAVING (7 products) =====
    { id: "65d8f1e1b1a1a1a1a1a1a1c4", name: "Classic Shaving Cream", category: "Shaving", price: 299, rating: 4.4, img: "https://images.unsplash.com/photo-1585751119414-ef2636f8aede?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1c5", name: "Premium Beard Oil", category: "Shaving", price: 550, rating: 4.6, img: "https://images.unsplash.com/photo-1621607505501-5765db196dc5?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1c6", name: "Luxury Razor Kit", category: "Shaving", price: 1299, rating: 4.8, img: "https://images.unsplash.com/photo-1593702288056-7927b442d0fa?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1c7", name: "After Shave Balm", category: "Shaving", price: 399, rating: 4.5, img: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1c8", name: "Pre-Shave Oil", category: "Shaving", price: 450, rating: 4.3, img: "https://images.unsplash.com/photo-1621607512150-b10cc15d6ece?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1c9", name: "Shaving Brush Set", category: "Shaving", price: 799, rating: 4.7, img: "https://images.unsplash.com/photo-1621607512004-3bade8bd7420?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1d1", name: "Beard Styling Balm", category: "Shaving", price: 649, rating: 4.6, img: "https://images.unsplash.com/photo-1621607512462-84842c1e1738?auto=format&fit=crop&w=400&q=80" },

    // ===== SKIN CARE (7 products) =====
    { id: "65d8f1e1b1a1a1a1a1a1a1d2", name: "Charcoal Deep Face Wash", category: "Skin Care", price: 299, rating: 4.4, img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1d3", name: "UV Shield Sunscreen SPF 50", category: "Skin Care", price: 499, rating: 4.7, img: "https://images.unsplash.com/photo-1532413992378-f169ac26fff0?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1d4", name: "Hydrating Face Moisturizer", category: "Skin Care", price: 599, rating: 4.6, img: "https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1d5", name: "Vitamin C Brightening Serum", category: "Skin Care", price: 899, rating: 4.8, img: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1d6", name: "Aloe Vera Soothing Gel", category: "Skin Care", price: 350, rating: 4.5, img: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1d7", name: "Under Eye Dark Circle Cream", category: "Skin Care", price: 749, rating: 4.3, img: "https://images.unsplash.com/photo-1556228841-a3c527ebefe5?auto=format&fit=crop&w=400&q=80" },
    { id: "65d8f1e1b1a1a1a1a1a1a1d8", name: "Exfoliating Face Scrub", category: "Skin Care", price: 449, rating: 4.6, img: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80" }
];

const Products = () => {
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth();
    const { addToCart } = useCart();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [productsData, setProductsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastProduct, setToastProduct] = useState(null);
    const GENERIC_PLACEHOLDER = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80";

    const categories = ['All', 'Hair Care', 'Styling', 'Shaving', 'Skin Care', 'Tools'];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            if (res.data.success && res.data.data && res.data.data.length > 0) {
                setProductsData(res.data.data);
            } else {
                // API returned empty — use fallback products
                setProductsData(FALLBACK_PRODUCTS);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setProductsData(FALLBACK_PRODUCTS);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product) => {
        if (!isLoggedIn) {
            navigate('/login', { state: { from: '/products' } });
            return;
        }
        addToCart(product);
        setToastProduct(product);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const filteredProducts = productsData.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="products-container">
            <div className="products-header">
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    Premium Grooming Products
                </motion.h1>

                <div className="search-wrapper">
                    <Search className="search-icon" size={24} color="#fbbf24" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for grooming products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="category-filters">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', color: 'white' }}>Loading Products...</div>
            ) : (
                <div className="product-grid">
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product._id || product.id}
                            className="product-card"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="product-img-container">
                                <img
                                    src={product.img || product.image || `https://source.unsplash.com/200x200/?${encodeURIComponent(product.name)}`}
                                    alt={product.name}
                                    className="product-card-img"
                                    onError={(e) => {
                                        if (!e.target.dataset.fallback) {
                                            e.target.dataset.fallback = '1';
                                            e.target.src = `https://source.unsplash.com/200x200/?${encodeURIComponent(product.name)}`;
                                        } else {
                                            e.target.src = GENERIC_PLACEHOLDER;
                                        }
                                    }}
                                />
                            </div>
                            <div className="product-info">
                                <h3 className="product-card-name" style={{ color: 'white' }}>{product.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 8px' }}>
                                    <MapPin size={12} />
                                    <span>{product.salonName || 'BookSaloonz Partner'} • {product.salonLocation || 'Tirunelveli'}</span>
                                </div>
                                <div className="product-card-footer">
                                    <div className="product-price">₹{product.price}</div>
                                    <div className="product-rating">
                                        <Star size={14} fill="#fbbf24" color="#fbbf24" style={{ marginRight: '5px' }} /> {product.rating}
                                    </div>
                                </div>
                                <button
                                    className="add-to-cart-btn"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: isLoggedIn ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', width: '100%', marginTop: '15px' }}
                                    onClick={() => handleAddToCart(product)}
                                >
                                    {isLoggedIn ? (
                                        <><ShoppingCart size={18} style={{ marginRight: '8px' }} /> Add to Cart</>
                                    ) : (
                                        <><LogIn size={18} style={{ marginRight: '8px' }} /> Login to Shop</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showToast && (
                    <motion.div
                        className="cart-toast"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                    >
                        <div className="toast-content glass-effect">
                            <ShoppingCart size={20} className="text-secondary" />
                            <div>
                                <span style={{ fontWeight: 800 }}>Product added to cart!</span>
                                {toastProduct && <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}><MapPin size={10} style={{ display: 'inline' }} /> {toastProduct.salonLocation || 'Tirunelveli'}</span>}
                            </div>
                            <a href="/cart" className="view-cart-link">View Cart</a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Products;
