import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2, Plus, Minus, ShoppingBag, MapPin,
    Truck, CreditCard, ChevronRight, ChevronLeft,
    CheckCircle2, Loader2, Home, Store
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { user, isLoggedIn } = useAuth();
    const [step, setStep] = useState(1); // 1: Cart, 2: Delivery, 3: Address/Salon, 4: Payment
    const [deliveryType, setDeliveryType] = useState('home'); // 'home' or 'pickup'
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [salons, setSalons] = useState([]);
    const [selectedSalon, setSelectedSalon] = useState(null);
    const [address, setAddress] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: 'Tirunelveli',
        state: 'Tamil Nadu',
        zipCode: ''
    });

    useEffect(() => {
        if (deliveryType === 'pickup') {
            fetchNearbySalons();
        }
    }, [deliveryType]);

    const fetchNearbySalons = async () => {
        if (cartItems.length === 0) return;
        setLoading(true);
        try {
            // Fetch salons that sell the first product in the cart
            const productId = cartItems[0]._id || cartItems[0].id;
            const res = await api.get(`/salons/product/${productId}`);
            if (res.data.success) {
                setSalons(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching salons:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const orderData = {
                items: cartItems.map(item => ({
                    product: item._id || item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                totalAmount: cartTotal,
                deliveryType,
                shippingAddress: deliveryType === 'home' ? address : null,
                assignedSalon: deliveryType === 'pickup' ? selectedSalon?._id : null,
                paymentMethod
            };

            const res = await api.post('/orders', orderData);
            if (res.data.success) {
                clearCart();
                window.location.href = `/order-confirmation?id=${res.data.order._id}`;
            }
        } catch (err) {
            alert('Order placement failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0 && step === 1) {
        return (
            <div className="cart-empty-state">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <ShoppingBag size={80} className="empty-bag-icon" />
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added anything to your cart yet.</p>
                    <a href="/products" className="btn-primary-inline mt-8">CONTINUE SHOPPING</a>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="cart-page-container page-fade-in">
            <div className="cart-content-wrapper">
                {/* Stepper Header */}
                <div className="cart-stepper">
                    <div className={`stepper-item ${step >= 1 ? 'active' : ''}`}>
                        <div className="step-num">1</div>
                        <span>Cart</span>
                    </div>
                    <div className="step-divider"></div>
                    <div className={`stepper-item ${step >= 2 ? 'active' : ''}`}>
                        <div className="step-num">2</div>
                        <span>Delivery</span>
                    </div>
                    <div className="step-divider"></div>
                    <div className={`stepper-item ${step >= 3 ? 'active' : ''}`}>
                        <div className="step-num">3</div>
                        <span>Details</span>
                    </div>
                    <div className="step-divider"></div>
                    <div className={`stepper-item ${step >= 4 ? 'active' : ''}`}>
                        <div className="step-num">4</div>
                        <span>Payment</span>
                    </div>
                </div>

                <div className="main-cart-grid">
                    <div className="cart-main-section">
                        <AnimatePresence mode='wait'>
                            {step === 1 && (
                                <motion.div
                                    key="cart-list"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="cart-items-list"
                                >
                                    <h3>Review Your Items</h3>
                                    {cartItems.map(item => (
                                        <div key={item._id || item.id} className="cart-item-card glass-effect">
                                            <img src={item.img || item.image} alt={item.name} className="item-img" />
                                            <div className="item-info">
                                                <h4>{item.name}</h4>
                                                <p className="item-price-unit">₹{item.price}</p>
                                            </div>
                                            <div className="quantity-controls">
                                                <button onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}><Minus size={14} /></button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}><Plus size={14} /></button>
                                            </div>
                                            <div className="item-total-price">₹{item.price * item.quantity}</div>
                                            <button className="remove-item-btn" onClick={() => removeFromCart(item._id || item.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="delivery-choice"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="delivery-type-selection"
                                >
                                    <h3>Choose Delivery Method</h3>
                                    <div className="delivery-grid mt-8">
                                        <div
                                            className={`delivery-card glass-effect ${deliveryType === 'home' ? 'selected' : ''}`}
                                            onClick={() => setDeliveryType('home')}
                                        >
                                            <div className="delivery-label-tag">DELIVERY</div>
                                            <Truck size={32} />
                                            <h4>Home Delivery</h4>
                                            <p>Delivered to your doorstep</p>
                                            <div className="delivery-badge">FREE</div>
                                        </div>
                                        <div
                                            className={`delivery-card glass-effect ${deliveryType === 'pickup' ? 'selected' : ''}`}
                                            onClick={() => setDeliveryType('pickup')}
                                        >
                                            <div className="delivery-label-tag">PICKUP</div>
                                            <Store size={32} />
                                            <h4>Salon Pickup</h4>
                                            <p>Pickup from nearby partner salon</p>
                                            <div className="delivery-badge">FAST</div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && deliveryType === 'home' && (
                                <motion.div
                                    key="address-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="address-form-section"
                                >
                                    <h3>Delivery Address</h3>
                                    <div className="glass-effect p-8 rounded-3xl mt-6">
                                        <div className="form-row-cart">
                                            <div className="form-group-cart">
                                                <label>Full Name</label>
                                                <input type="text" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} />
                                            </div>
                                            <div className="form-group-cart">
                                                <label>Phone Number</label>
                                                <input type="text" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="form-group-cart mt-4">
                                            <label>Street Address</label>
                                            <input type="text" placeholder="Area, Locality" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                                        </div>
                                        <div className="form-row-cart mt-4">
                                            <div className="form-group-cart">
                                                <label>City</label>
                                                <input type="text" value={address.city} readOnly />
                                            </div>
                                            <div className="form-group-cart">
                                                <label>Pincode</label>
                                                <input type="text" value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && deliveryType === 'pickup' && (
                                <motion.div
                                    key="salon-selection"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="salon-pickup-section"
                                >
                                    <h3>Select Pickup Partner</h3>
                                    <div className="salons-pickup-list mt-6">
                                        {loading ? (
                                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                                <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px' }} />
                                                <p>Finding nearby salons...</p>
                                            </div>
                                        ) : (salons.length > 0 ? salons : [
                                            { _id: '65d8f1e1b1a1a1a1a1a1a1f1', name: 'BookSaloonz Partner - Main Branch', address: 'Town Hall Road, Tirunelveli, Tamil Nadu' },
                                            { _id: '65d8f1e1b1a1a1a1a1a1a1f2', name: 'BookSaloonz Partner - Junction', address: 'Palayamkottai Junction, Tirunelveli, Tamil Nadu' },
                                            { _id: '65d8f1e1b1a1a1a1a1a1a1f3', name: 'BookSaloonz Partner - Central', address: 'High Ground, Tirunelveli, Tamil Nadu' }
                                        ]).map(s => (
                                            <div
                                                key={s._id}
                                                className={`pickup-salon-card glass-effect ${selectedSalon?._id === s._id ? 'selected' : ''}`}
                                                onClick={() => setSelectedSalon(s)}
                                            >
                                                <div className="salon-pick-info">
                                                    <h4>{s.name}</h4>
                                                    <p><MapPin size={12} /> {s.address}</p>
                                                </div>
                                                <div className="salon-pick-dist">Available</div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="payment-summary"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="payment-section-cart"
                                >
                                    <h3>Final Payment</h3>
                                    <div className="payment-options-grid mt-8">
                                        <div
                                            className={`payment-card glass-effect ${paymentMethod === 'card' ? 'active' : ''}`}
                                            onClick={() => setPaymentMethod('card')}
                                        >
                                            <CreditCard size={28} />
                                            <div>
                                                <h4>Card</h4>
                                                <p>Credit / Debit Card</p>
                                            </div>
                                            <div className={`radio-circle-cart ${paymentMethod === 'card' ? 'selected' : ''}`}></div>
                                        </div>
                                        <div
                                            className={`payment-card glass-effect ${paymentMethod === 'upi' ? 'active' : ''}`}
                                            onClick={() => setPaymentMethod('upi')}
                                        >
                                            <CreditCard size={28} />
                                            <div>
                                                <h4>UPI</h4>
                                                <p>Google Pay, PhonePe, Paytm</p>
                                            </div>
                                            <div className={`radio-circle-cart ${paymentMethod === 'upi' ? 'selected' : ''}`}></div>
                                        </div>
                                        <div
                                            className={`payment-card glass-effect ${paymentMethod === 'salon' ? 'active' : ''}`}
                                            onClick={() => setPaymentMethod('salon')}
                                        >
                                            <Store size={28} />
                                            <div>
                                                <h4>Pay at Salon</h4>
                                                <p>Pay directly when visiting</p>
                                            </div>
                                            <div className={`radio-circle-cart ${paymentMethod === 'salon' ? 'selected' : ''}`}></div>
                                        </div>
                                    </div>

                                    <div className="summary-banner-checkout glass-effect mt-10">
                                        <CheckCircle2 size={24} className="text-secondary" />
                                        <p>Your order is secured and tracked by BookSaloonz Direct-to-Partner network.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="cart-navigation-btns mt-12">
                            {step > 1 && (
                                <button className="btn-secondary flex items-center gap-2" onClick={() => setStep(step - 1)}>
                                    <ChevronLeft size={18} /> BACK
                                </button>
                            )}
                            <div className="flex-grow"></div>
                            {step < 4 ? (
                                <button
                                    className="btn-primary flex items-center gap-2"
                                    disabled={(step === 3 && deliveryType === 'home' && (!address.street || !address.zipCode)) || (step === 3 && deliveryType === 'pickup' && !selectedSalon)}
                                    onClick={() => setStep(step + 1)}
                                >
                                    CONTINUE <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button className="btn-primary flex items-center gap-2" onClick={handleCheckout} disabled={loading}>
                                    {loading ? <Loader2 className="spin" /> : <>PLACE ORDER (₹{cartTotal}) <ChevronRight size={18} /></>}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Order Sidebar */}
                    <div className="cart-sidebar">
                        <div className="order-summary-box glass-effect">
                            <h4>Order Summary</h4>
                            <div className="summary-list-cart mt-6">
                                <div className="summary-item-cart">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <div className="summary-item-cart">
                                    <span>Delivery Fee</span>
                                    <span className="text-green-400">FREE</span>
                                </div>
                                <div className="summary-item-cart divider-cart mt-4 pt-4 border-t border-white/10">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-2xl font-black text-secondary">₹{cartTotal}</span>
                                </div>
                            </div>

                            <div className="cart-promo-box mt-6">
                                <input type="text" placeholder="Promo Code" />
                                <button>APPLY</button>
                            </div>
                        </div>

                        <div className="direct-partner-info glass-effect mt-6">
                            <Store className="text-secondary mb-3" />
                            <h5>Direct Partner Network</h5>
                            <p>We source products from verified nearby partner salons to ensure 100% authenticity and fast delivery.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
