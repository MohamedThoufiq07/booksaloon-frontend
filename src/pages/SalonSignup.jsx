import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Store, MapPin, Image, UserPlus, Eye, EyeOff, ShieldCheck, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './PartnerSignup.css';

const SalonSignup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        salonName: '',
        address: 'Tirunelveli, Tamil Nadu, India',
        salonPhoto: '',
        startingPrice: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { partnerSignup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (formData.name.length < 3) {
            setError('Owner Name must be at least 3 characters.');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);

        const partnerData = {
            ownerName: formData.name,
            salonName: formData.salonName,
            email: formData.email,
            password: formData.password,
            address: formData.address,
            salonPhoto: formData.salonPhoto,
            startingPrice: formData.startingPrice
        };

        try {
            const result = await partnerSignup(partnerData);
            if (result.success) {
                setSuccessMsg(result.message || 'Partner account created successfully! Redirecting...');
                setTimeout(() => {
                    navigate('/salon-login');
                }, 2000);
            } else {
                setError(result.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please check your connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="partner-signup-container">
            <div className="partner-signup-card">
                <div className="partner-signup-header">
                    <Link to="/">
                        <img src={logo} alt="BookSaloonz" className="partner-auth-logo" />
                    </Link>
                    <h1>Join as a Partner</h1>
                    <p>Grow your grooming business with our AI-powered platform</p>
                </div>

                {error && <div className="auth-error-msg">{error}</div>}
                {successMsg && <div className="auth-success-msg">{successMsg}</div>}

                <form onSubmit={handleSubmit} className="partner-signup-form">
                    <div className="signup-section">
                        <h3 className="signup-section-title">
                            <ShieldCheck size={20} />
                            Owner Information
                        </h3>
                        <div className="form-grid">
                            <div className="partner-field-group">
                                <label htmlFor="name">
                                    <User size={18} className="label-icon" />
                                    Owner Full Name
                                </label>
                                <div className="partner-input-container">
                                    <input type="text" id="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="partner-field-group">
                                <label htmlFor="email">
                                    <Mail size={18} className="label-icon" />
                                    Work Email
                                </label>
                                <div className="partner-input-container">
                                    <input type="email" id="email" placeholder="john@salon.com" value={formData.email} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="partner-field-group">
                                <label htmlFor="password">
                                    <Lock size={18} className="label-icon" />
                                    Security Password
                                </label>
                                <div className="partner-input-container">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        style={{ paddingRight: '2.8rem' }}
                                    />
                                    <button
                                        type="button"
                                        className="partner-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="partner-field-group">
                                <label htmlFor="confirmPassword">
                                    <Lock size={18} className="label-icon" />
                                    Confirm Password
                                </label>
                                <div className="partner-input-container">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        style={{ paddingRight: '2.8rem' }}
                                    />
                                    <button
                                        type="button"
                                        className="partner-password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="signup-section">
                        <h3 className="signup-section-title">
                            <Store size={20} />
                            Salon Details
                        </h3>
                        <div className="form-grid">
                            <div className="partner-field-group" style={{ gridColumn: '1 / -1' }}>
                                <label htmlFor="salonName">
                                    <Store size={18} className="label-icon" />
                                    Salon Business Name
                                </label>
                                <div className="partner-input-container">
                                    <input type="text" id="salonName" placeholder="The Premium Grooming Lounge" value={formData.salonName} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="partner-field-group">
                                <label htmlFor="address">
                                    <MapPin size={18} className="label-icon" />
                                    Operating City
                                </label>
                                <div className="partner-input-container">
                                    <input type="text" id="address" value={formData.address} readOnly />
                                </div>
                            </div>

                            <div className="partner-field-group">
                                <label htmlFor="startingPrice">
                                    <IndianRupee size={18} className="label-icon" />
                                    Base Service Price (₹)
                                </label>
                                <div className="partner-input-container">
                                    <input type="number" id="startingPrice" placeholder="499" value={formData.startingPrice} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="partner-field-group" style={{ gridColumn: '1 / -1' }}>
                                <label htmlFor="salonPhoto">
                                    <Image size={18} className="label-icon" />
                                    Salon Showcase Image (URL)
                                </label>
                                <div className="partner-input-container">
                                    <input type="text" id="salonPhoto" placeholder="https://images.unsplash.com/..." value={formData.salonPhoto} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="partner-signup-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Processing Application...' : (
                            <>
                                <UserPlus size={22} />
                                Submit Partner Application
                            </>
                        )}
                    </button>
                </form>

                <div className="partner-signup-footer">
                    <p>Already registered with us? <Link to="/salon-login">Partner Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default SalonSignup;
