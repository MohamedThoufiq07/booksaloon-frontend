import React, { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import api from '../utils/api';

/**
 * Reusable Payment Button that integrates with Razorpay Checkout
 * @param {number} amount - Amount in Rupees
 * @param {string} type - 'booking' or 'product'
 * @param {string} referenceId - bookingId or orderId
 * @param {function} onSuccess - Callback for successful payment
 * @param {function} onFailure - Callback for failed payment or error
 * @param {function} onBefore - Async function that runs before payment (e.g., to create booking/order). Should return the referenceId.
 * @param {string} className - Optional tailwind classes
 * @param {string} label - Button text label
 * @param {object} prefill - User info for pre-filling Razorpay checkout (name, email, contact)
 */
const PaymentButton = ({ 
    amount, 
    type, 
    referenceId, 
    onSuccess, 
    onFailure, 
    onBefore,
    className = "btn-primary", 
    label = "PAY NOW",
    prefill = {} 
}) => {
    const [loading, setLoading] = useState(false);

    // Script loading utility
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (loading || !amount) return;
        
        setLoading(true);
        try {
            let finalReferenceId = referenceId;

            // 0. Run pre-payment action if provided (e.g. create booking)
            if (onBefore) {
                finalReferenceId = await onBefore();
                if (!finalReferenceId) {
                    setLoading(false);
                    return;
                }
            }

            if (!finalReferenceId) {
                throw new Error("Missing Reference ID for payment.");
            }

            // 1. Load Razorpay script dynamically
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                alert("Razorpay SDK failed to load. Please check your internet connection.");
                setLoading(false);
                return;
            }

            // 2. Create Order on Backend
            const orderRes = await api.post('/payments/create-order', {
                amount,
                type,
                referenceId: finalReferenceId
            });

            if (!orderRes.data.success) {
                throw new Error(orderRes.data.message || 'Failed to create payment order');
            }

            const { orderId, amount: orderAmount, currency, keyId } = orderRes.data;

            // 3. Open Razorpay Checkout Window
            const options = {
                key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                amount: orderAmount,
                currency: currency,
                name: "BookSaloonz",
                description: type === 'booking' ? `Service Booking Confirmation` : `Product Order Checkout`,
                orderId: orderId, // Some SDKs expect orderId, some expect order_id
                order_id: orderId,
                handler: async (response) => {
                    try {
                        setLoading(true);
                        // 4. Verify Payment on Backend
                        const verifyRes = await api.post('/payments/verify', {
                            ...response,
                            type,
                            referenceId: finalReferenceId,
                            amount
                        });

                        if (verifyRes.data.success) {
                            if (onSuccess) onSuccess(verifyRes.data);
                        } else {
                            alert("Payment verification failed. Please contact our support team.");
                            if (onFailure) onFailure(verifyRes.data);
                        }
                    } catch (err) {
                        console.error('Payment Verification Error:', err);
                        alert("An error occurred while verifying your payment.");
                        if (onFailure) onFailure(err);
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: prefill.name || '',
                    email: prefill.email || '',
                    contact: prefill.contact || ''
                },
                notes: {
                    type,
                    referenceId
                },
                theme: {
                    color: "#2dd4bf" // Brand teal
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Razorpay payment initiation failed:', error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to initiate payment gateway.";
            alert(errorMessage);
            if (onFailure) onFailure(error);
            setLoading(false);
        }
    };

    return (
        <button 
            type="button" 
            className={className} 
            onClick={handlePayment} 
            disabled={loading}
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '12px',
                cursor: loading ? 'not-allowed' : 'pointer'
            }}
        >
            {loading ? <Loader2 size={18} className="spin" /> : <CreditCard size={18} />}
            {loading ? "PROCESSING..." : label.toUpperCase()}
        </button>
    );
};

export default PaymentButton;
