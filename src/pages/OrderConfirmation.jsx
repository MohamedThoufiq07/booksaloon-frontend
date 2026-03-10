import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, MapPin, Calendar, ArrowRight, ShoppingBag } from 'lucide-react';
import api from '../utils/api';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('id');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/orders/${orderId}`);
            if (res.data.success) {
                setOrder(res.data.order);
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-state">Loading order details...</div>;
    }

    if (!order) {
        return (
            <div className="error-state text-center py-20">
                <h2>Order Not Found</h2>
                <p>We couldn't retrieve the details for this order id: {orderId}</p>
                <Link to="/products" className="btn-primary mt-8">GO TO PRODUCTS</Link>
            </div>
        );
    }

    return (
        <div className="confirmation-container page-fade-in">
            <motion.div
                className="confirmation-card glass-effect"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="success-header">
                    <CheckCircle2 size={80} className="text-secondary" />
                    <h1 className="gradient-text mt-6">Order Successful!</h1>
                    <p className="text-muted mt-2">We've sent a confirmation email to your registered address.</p>
                    <p className="order-id-badge mt-4">ORDER ID: #{order._id.slice(-8).toUpperCase()}</p>
                </div>

                <div className="order-details-summary mt-12 pt-12 border-t border-white/10">
                    <div className="summary-section">
                        <h4><Package size={20} /> Items ({order.items.length})</h4>
                        <div className="summary-items-list-lite mt-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="summary-item-lite">
                                    <span>{item.name} × {item.quantity}</span>
                                    <span>₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="summary-section mt-8">
                        {order.deliveryType === 'home' ? (
                            <>
                                <h4><MapPin size={20} /> Shipping Address</h4>
                                <div className="info-box-lite mt-4">
                                    <p className="font-bold">{order.shippingAddress.name}</p>
                                    <p>{order.shippingAddress.street}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
                                    <p className="mt-2 text-primary">{order.shippingAddress.phone}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <h4><Package size={20} /> Pickup Point</h4>
                                <div className="info-box-lite mt-4">
                                    <p className="font-bold">Partner Salon Pickup</p>
                                    <p>Please visit your nearest partner salon with this ID.</p>
                                    <p className="text-secondary mt-2">READY IN 2 HOURS</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="summary-total-final mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                        <span className="text-muted font-bold text-lg">Total Paid</span>
                        <span className="text-3xl font-black text-secondary">₹{order.totalAmount}</span>
                    </div>
                </div>

                <div className="confirmation-next-steps mt-12 grid grid-cols-2 gap-8">
                    <Link to="/products" className="btn-secondary flex items-center justify-center gap-3">
                        <ShoppingBag size={20} /> SHOP MORE
                    </Link>
                    <Link to="/dashboard" className="btn-primary flex items-center justify-center gap-3">
                        TRACK ORDER <ArrowRight size={20} />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderConfirmation;
