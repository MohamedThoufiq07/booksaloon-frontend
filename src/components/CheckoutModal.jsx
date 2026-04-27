import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, CreditCard, ShoppingBag, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
import PaymentButton from './PaymentButton';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, product, user }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [address, setAddress] = useState({
        street: '',
        city: 'Tirunelveli',
        state: 'Tamil Nadu',
        zipCode: ''
    });

    const handleCheckout = async () => {
        // 1. Check Payment Availability First
        // Since we only have Razorpay (which is disabled) and no other option for store yet,
        // we'll show the message and stop here.
        setError('Online payments (Razorpay/UPI) are currently unavailable. We are working to restore this feature soon.');
        return;

        /* Original logic commented out to prevent execution */
        /*
        setLoading(true);
        setError('');
        try {
            // 2. Create Order
            const res = await api.post('/orders', {
                items: [{
                    product: product._id || product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                }],
                totalAmount: product.price,
                shippingAddress: address
            });

            if (res.data.success) {
                // Razorpay/UPI is currently disabled
                setLoading(false);
                return;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Checkout failed. Please try again.');
        } finally {
            setLoading(false);
        }
        */
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="checkout-overlay">
                <motion.div
                    className="checkout-content glass-effect"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                >
                    <button className="close-checkout" onClick={onClose}><X size={20} /></button>

                    {success ? (
                        <div className="order-success text-center py-10">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="success-icon-bg">
                                <CheckCircle2 size={48} color="#2dd4bf" />
                            </motion.div>
                            <h2 className="gradient-text mt-6">Order Placed!</h2>
                            <p className="mt-2 text-muted">A nearby partner salon will receive your order and process it shortly.</p>
                            <button className="btn-primary w-full mt-10" onClick={onClose}>CONTINUE SHOPPING</button>
                        </div>
                    ) : (
                        <>
                            <div className="checkout-steps">
                                <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                                <div className="step-line"></div>
                                <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
                            </div>

                            {step === 1 && (
                                <div className="address-view">
                                    <h3>Shipping Address</h3>
                                    <p className="text-muted text-sm mb-6">Enter where you want your product delivered.</p>
                                    <div className="address-form mt-4">
                                        <div className="form-group-checkout">
                                            <label>Street Address</label>
                                            <input
                                                type="text"
                                                placeholder="House No, Area, Locality"
                                                value={address.street}
                                                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                            />
                                        </div>
                                        <div className="row-group">
                                            <div className="form-group-checkout">
                                                <label>City</label>
                                                <input type="text" value={address.city} readOnly />
                                            </div>
                                            <div className="form-group-checkout">
                                                <label>Zip Code</label>
                                                <input
                                                    type="text"
                                                    placeholder="627001"
                                                    value={address.zipCode}
                                                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-primary w-full mt-8"
                                        disabled={!address.street || !address.zipCode}
                                        onClick={() => setStep(2)}
                                    >
                                        PROCEED TO PAYMENT
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="payment-view">
                                    <h3>Order Summary</h3>
                                    <div className="product-summary-card glass-effect mt-6">
                                        <img
                                            src={product.img || product.image || `https://source.unsplash.com/200x200/?${encodeURIComponent(product.name)}`}
                                            alt={product.name}
                                            className="summary-img"
                                            onError={(e) => {
                                                if (!e.target.dataset.fallback) {
                                                    e.target.dataset.fallback = '1';
                                                    e.target.src = `https://source.unsplash.com/200x200/?${encodeURIComponent(product.name)}`;
                                                } else {
                                                    e.target.src = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80';
                                                }
                                            }}
                                        />
                                        <div className="summary-details">
                                            <h4>{product.name}</h4>
                                            <p className="text-primary-glow font-bold">₹{product.price}</p>
                                        </div>
                                    </div>

                                    <div className="total-box mt-8">
                                        <div className="summary-row">
                                            <span>Subtotal</span>
                                            <span>₹{product.price}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Shipping</span>
                                            <span className="text-green-400">FREE</span>
                                        </div>
                                        <div className="summary-row total-row mt-4 pt-4 border-t border-white/10">
                                            <span>Total</span>
                                            <span className="text-xl font-black">₹{product.price}</span>
                                        </div>
                                    </div>

                                    {error && <p className="error-text text-center mt-4 text-red-400 text-sm">{error}</p>}

                                    <PaymentButton 
                                        amount={product.price}
                                        type="product"
                                        className="btn-primary w-full mt-10"
                                        onBefore={async () => {
                                            try {
                                                const res = await api.post('/orders', {
                                                    items: [{
                                                        product: product._id || product.id,
                                                        name: product.name,
                                                        price: product.price,
                                                        quantity: 1
                                                    }],
                                                    totalAmount: product.price,
                                                    shippingAddress: address
                                                });
                                                return res.data.success ? res.data.order._id : null;
                                            } catch (err) {
                                                setError(err.response?.data?.message || 'Order creation failed');
                                                return null;
                                            }
                                        }}
                                        onSuccess={() => {
                                            setSuccess(true);
                                            setStep(3);
                                        }}
                                        onFailure={(err) => setError(err.message || "Payment failed")}
                                        prefill={{
                                            name: user?.name,
                                            email: user?.email,
                                            contact: user?.phone
                                        }}
                                        label="PAY NOW"
                                    />
                                    <button className="btn-secondary w-full mt-4" onClick={() => setStep(1)}>BACK</button>
                                </div>
                            )}
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CheckoutModal;
