import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Check, CreditCard, Calendar, Clock as ClockIcon,
    Scissors, ChevronRight, ChevronLeft, Loader2, Sparkles,
    AlertCircle, Sunrise, Sun, Moon
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PaymentButton from './PaymentButton';
import './BookingModal.css';

const BookingModal = ({ isOpen, onClose, salon }) => {
    const navigate = useNavigate();
    const { isLoggedIn, user: currentUser } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [error, setError] = useState('');

    // Selection state
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const resetModal = () => {
        setStep(1);
        setSelectedService(null);
        setSelectedSlot(null);
        setError('');
        setBookingSuccess(false);
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    // Fetch services and slots
    useEffect(() => {
        if (isOpen && salon?._id) {
            fetchServices();
        }
    }, [isOpen, salon?._id]);

    useEffect(() => {
        if (isOpen && salon?._id && selectedDate) {
            fetchSlots();
        }
    }, [selectedDate, salon?._id, isOpen]);

    const fetchServices = async () => {
        setServicesLoading(true);
        try {
            const res = await api.get(`/services/salon/${salon._id}`);
            if (res.data.success && res.data.services.length > 0) {
                setServices(res.data.services);
            } else if (salon.services && salon.services.length > 0) {
                // Fallback to services attached to salon object
                setServices(salon.services);
            } else {
                // Final fallback for demo
                setServices([
                    { _id: 's1', name: 'Regular Haircut', price: salon.startingPrice || 300, duration: 30 },
                    { _id: 's2', name: 'Premium Styling', price: (salon.startingPrice || 300) + 200, duration: 45 }
                ]);
            }
        } catch (err) {
            console.error('Error fetching services:', err);
            // Fallback to salon object or dummy
            if (salon.services && salon.services.length > 0) {
                setServices(salon.services);
            } else {
                setServices([
                    { _id: 's1', name: 'Regular Haircut', price: 300, duration: 30 },
                    { _id: 's2', name: 'Premium Styling', price: 500, duration: 45 }
                ]);
            }
        } finally {
            setServicesLoading(false);
        }
    };

    const fetchSlots = async () => {
        setLoading(true);
        setError('');
        
        const parseTime = (timeStr) => {
            const [time, period] = timeStr.split(' ');
            let [hours, mins] = time.split(':').map(Number);
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            return { hours, mins };
        };

        const now = new Date();
        const isToday = selectedDate === now.toISOString().split('T')[0];
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();

        try {
            const res = await api.get(`/bookings/slots/${salon._id}/${selectedDate}`);
            if (res.data.success && res.data.slots.length > 0) {
                const filtered = res.data.slots.map(slot => {
                    const { hours, mins } = parseTime(slot.time);
                    let available = slot.available;
                    if (isToday && (hours < currentHour || (hours === currentHour && mins <= currentMin))) {
                        available = false;
                    }
                    return { ...slot, available };
                });
                setAvailableSlots(filtered);
            } else {
                throw new Error('No slots from API');
            }
        } catch (err) {
            console.error('Error fetching slots:', err);
            // Fallback slots for demo with real-time filtering
            const slots = [
                { time: '09:00 AM' }, { time: '09:30 AM' }, { time: '10:00 AM' }, { time: '10:30 AM' },
                { time: '11:00 AM' }, { time: '11:30 AM' }, { time: '12:00 PM' }, { time: '12:30 PM' },
                { time: '01:00 PM' }, { time: '01:30 PM' }, { time: '02:00 PM' }, { time: '02:30 PM' },
                { time: '03:00 PM' }, { time: '03:30 PM' }, { time: '04:00 PM' }, { time: '04:30 PM' },
                { time: '05:00 PM' }, { time: '05:30 PM' }, { time: '06:00 PM' }, { time: '06:30 PM' },
                { time: '07:00 PM' }, { time: '07:30 PM' }, { time: '08:00 PM' }, { time: '08:30 PM' }
            ].map(slot => {
                const { hours, mins } = parseTime(slot.time);
                let available = true;
                if (isToday && (hours < currentHour || (hours === currentHour && mins <= currentMin))) {
                    available = false;
                }
                if (available && ['10:00 AM', '12:00 PM', '04:00 PM', '06:30 PM'].includes(slot.time)) {
                    available = false;
                }
                return { ...slot, available };
            });
            setAvailableSlots(slots);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!isLoggedIn) {
            onClose();
            navigate('/login', { state: { from: `/salons/${salon?._id}` } });
            return;
        }

        setLoading(true);
        setError('');
        try {
            // 1. Check Payment Availability First
            if (paymentMethod === 'razorpay') {
                setError('Razorpay & UPI payments are currently undergoing maintenance. Please select "Pay at Salon" to book your appointment.');
                setLoading(false);
                return;
            }

            // 2. Create Booking (Only if valid payment option is selected)
            const bookingRes = await api.post('/bookings', {
                salonId: salon._id,
                service: selectedService.name,
                serviceId: selectedService._id,
                price: selectedService.price,
                date: selectedDate,
                time: selectedSlot
            });

            if (!bookingRes.data.success) {
                throw new Error(bookingRes.data.message || 'Failed to create booking');
            }

            const bookingId = bookingRes.data.booking._id;

            // 3. Handle Success (Razorpay logic was moved to top check)
            setBookingSuccess(true);
        } catch (err) {
            console.error('Booking error:', err);
            setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
        } finally {
            if (paymentMethod !== 'razorpay') {
                setLoading(false);
            }
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay">
                <motion.div
                    className="modal-content glass-effect"
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                >
                    <button className="close-btn" onClick={handleClose}><X size={24} /></button>

                    {bookingSuccess ? (
                        <div className="success-view text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: 360 }}
                                className="success-icon-wrapper"
                            >
                                <Check size={48} />
                            </motion.div>
                            <h2 className="gradient-text">Booking Confirmed!</h2>
                            <p>We've sent the details to your email.</p>
                            <div className="booking-summary-card glass-effect">
                                <p><strong>{selectedService?.name}</strong></p>
                                <p>{selectedDate} at {selectedSlot}</p>
                            </div>
                            <button className="btn-primary w-full" onClick={handleClose}>DONE</button>
                        </div>
                    ) : (
                        <div className="booking-steps">
                            {/* Progress Bar */}
                            <div className="steps-progress">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`step-dot ${step >= i ? 'active' : ''}`}>
                                        {step > i ? <Check size={12} /> : i}
                                    </div>
                                ))}
                            </div>

                            <h2 className="step-title">
                                {step === 1 && 'Select Service'}
                                {step === 2 && 'Pick Date & Time'}
                                {step === 3 && 'Order Summary'}
                            </h2>

                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-badge">
                                    <AlertCircle size={16} /> {error}
                                </motion.div>
                            )}

                            {/* Step 1: Services */}
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="step-container"
                                    >
                                        <div className="services-grid-modal">
                                            {servicesLoading ? (
                                                <div className="flex flex-col items-center py-20 opacity-60">
                                                    <Loader2 size={32} className="spin mb-4" />
                                                    <p>Loading curated services...</p>
                                                </div>
                                            ) : services.length > 0 ? (
                                                services.map(s => (
                                                    <div
                                                        key={s._id || s.name}
                                                        className={`service-card-modal ${selectedService?._id === s._id || selectedService?.name === s.name ? 'active' : ''}`}
                                                        onClick={() => setSelectedService(s)}
                                                    >
                                                        <div className="service-info">
                                                            <h4>{s.name}</h4>
                                                            <span>{s.duration} mins</span>
                                                        </div>
                                                        <div className="service-price">₹{s.price}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-10 opacity-50">
                                                    <Scissors size={40} className="mx-auto mb-4 opacity-20" />
                                                    <p>No services available for this salon.</p>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-primary w-full mt-6"
                                            disabled={!selectedService}
                                            onClick={nextStep}
                                        >
                                            CONTINUE <ChevronRight size={18} />
                                        </button>
                                    </motion.div>
                                )}

                                {/* Step 2: Date & Slots */}
                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="step-container"
                                    >
                                        <div className="date-picker-modal-wrapper">
                                            <Calendar size={18} className="calendar-icon-styled" />
                                            <input
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="glass-input-styled"
                                            />
                                        </div>

                                        {loading ? (
                                            <div className="loading-slots">
                                                <Loader2 size={24} className="spin" />
                                                <span>Finding available slots...</span>
                                            </div>
                                        ) : (
                                            <div className="slots-container-enhanced">
                                                {availableSlots.length > 0 ? (
                                                    <>
                                                        {/* Categorized Slots */}
                                                        {[
                                                            { label: 'Morning', icon: <Sunrise size={16} />, filter: (t) => t.includes('AM') && !t.startsWith('12') },
                                                            { label: 'Afternoon', icon: <Sun size={16} />, filter: (t) => (t.includes('PM') && (t.startsWith('12') || t.startsWith('01') || t.startsWith('02') || t.startsWith('03'))) },
                                                            { label: 'Evening', icon: <Moon size={16} />, filter: (t) => (t.includes('PM') && !['12', '01', '02', '03'].some(h => t.startsWith(h))) }
                                                        ].map(group => {
                                                            const groupSlots = availableSlots.filter(s => group.filter(s.time));
                                                            if (groupSlots.length === 0) return null;
                                                            
                                                            return (
                                                                <div key={group.label} className="slot-group">
                                                                    <div className="group-header">
                                                                        {group.icon}
                                                                        <span>{group.label}</span>
                                                                    </div>
                                                                    <div className="slots-grid-enhanced">
                                                                        {groupSlots.map(slot => (
                                                                            <button
                                                                                key={slot.time}
                                                                                type="button"
                                                                                className={`slot-chip-enhanced ${selectedSlot === slot.time ? 'active' : ''} ${!slot.available ? 'disabled' : ''}`}
                                                                                disabled={!slot.available}
                                                                                onClick={() => setSelectedSlot(slot.time)}
                                                                            >
                                                                                {slot.time.replace(' ', '\u00A0')}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </>
                                                ) : (
                                                    <div className="no-slots-enhanced">
                                                        <AlertCircle size={40} className="mb-4 opacity-20" />
                                                        <p>No available slots for this date.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="step-footer mt-auto">
                                            <button type="button" className="btn-secondary" onClick={prevStep}>BACK</button>
                                            <button
                                                type="button"
                                                className="btn-primary"
                                                disabled={!selectedSlot}
                                                onClick={nextStep}
                                            >
                                                NEXT STEP <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Payment/Summary */}
                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="step-container"
                                    >
                                        <div className="summary-card glass-effect">
                                            <div className="summary-row">
                                                <span>Service</span>
                                                <span className="text-white">{selectedService?.name}</span>
                                            </div>
                                            <div className="summary-row">
                                                <span>Date</span>
                                                <span className="text-white">{selectedDate}</span>
                                            </div>
                                            <div className="summary-row">
                                                <span>Time</span>
                                                <span className="text-white">{selectedSlot}</span>
                                            </div>
                                            <hr className="border-white/5 my-4" />
                                            <div className="summary-row total">
                                                <span>Total Amount</span>
                                                <span className="text-primary-glow">₹{selectedService?.price}</span>
                                            </div>
                                        </div>

                                        <div className="payment-options-grid mt-6">
                                            <div
                                                className={`pay-option ${paymentMethod === 'razorpay' ? 'active' : ''}`}
                                                onClick={() => setPaymentMethod('razorpay')}
                                            >
                                                <CreditCard size={20} />
                                                <span>Razorpay / UPI</span>
                                            </div>
                                            <div
                                                className={`pay-option ${paymentMethod === 'cash' ? 'active' : ''}`}
                                                onClick={() => setPaymentMethod('cash')}
                                            >
                                                <Sparkles size={20} />
                                                <span>Pay at Salon</span>
                                            </div>
                                        </div>

                                        <div className="step-footer mt-6">
                                            <button type="button" className="btn-secondary" onClick={prevStep}>BACK</button>
                                            
                                            {paymentMethod === 'razorpay' ? (
                                                <PaymentButton 
                                                    amount={selectedService?.price}
                                                    type="booking"
                                                    onBefore={async () => {
                                                        try {
                                                            const res = await api.post('/bookings', {
                                                                salonId: salon._id,
                                                                service: selectedService.name,
                                                                serviceId: selectedService._id,
                                                                price: selectedService.price,
                                                                date: selectedDate,
                                                                time: selectedSlot
                                                            });
                                                            return res.data.success ? res.data.booking._id : null;
                                                        } catch (err) {
                                                            setError(err.response?.data?.message || "Booking failed");
                                                            return null;
                                                        }
                                                    }}
                                                    onSuccess={() => setBookingSuccess(true)}
                                                    onFailure={(err) => setError(err.message || "Payment failed")}
                                                    prefill={{
                                                        name: currentUser?.name,
                                                        email: currentUser?.email,
                                                        contact: currentUser?.phone
                                                    }}
                                                    label="CONFIRM & PAY"
                                                />
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn-primary"
                                                    disabled={loading}
                                                    onClick={handleBooking}
                                                >
                                                    {loading ? <Loader2 size={18} className="spin" /> : 'CONFIRM BOOKING'}
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BookingModal;
