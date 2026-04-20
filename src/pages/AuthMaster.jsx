import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Mail, Lock, LogIn, User, UserPlus, Sparkles,
    Eye, EyeOff, ShieldCheck, Store, MapPin,
    Image, IndianRupee, ArrowRight, CheckCircle2, Phone,
    KeyRound, ArrowLeft, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './AuthMaster.css';

const AuthMaster = () => {
    const [mode, setMode] = useState('login'); // 'login', 'signup', or 'forgot'
    const [forgotStep, setForgotStep] = useState(1); // 1 = email, 2 = OTP + new password
    const [userType, setUserType] = useState('user'); // 'user' or 'partner'
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const location = useLocation();
    const { login, signup, partnerLogin, partnerSignup, forgotPassword, resetPassword } = useAuth();
    const navigate = useNavigate();

    // Initialize based on path
    React.useEffect(() => {
        const path = location.pathname;
        if (path.includes('signup')) setMode('signup');
        else if (path.includes('login')) setMode('login');

        if (path.includes('salon') || path.includes('partner')) setUserType('partner');
        else setUserType('user');
    }, [location.pathname]);

    // Form data states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        salonName: '',
        address: 'Tirunelveli, Tamil Nadu, India',
        salonLocation: '',
        salonPhoto: '',
        salonPhotoFile: null,
        startingPrice: ''
    });

    // Forgot password form data
    const [resetData, setResetData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleResetChange = (e) => {
        setResetData({ ...resetData, [e.target.id]: e.target.value });
    };

    const resetMessages = () => {
        setError('');
        setSuccessMsg('');
    };

    const handleToggleMode = (newMode) => {
        setMode(newMode);
        setForgotStep(1);
        resetMessages();
    };

    const handleToggleUserType = (type) => {
        setUserType(type);
        resetMessages();
    };

    // Handle forgot password - Step 1: Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsLoading(true);

        if (!resetData.email) {
            setError('Please enter your email address');
            setIsLoading(false);
            return;
        }

        try {
            const accountType = userType === 'partner' ? 'partner' : 'user';
            const result = await forgotPassword(resetData.email, accountType);
            if (result.success) {
                setSuccessMsg('OTP sent to your email! Check your inbox.');
                setForgotStep(2);
            } else {
                setError(result.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle forgot password - Step 2: Verify OTP & Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsLoading(true);

        if (resetData.newPassword !== resetData.confirmNewPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (resetData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        try {
            const accountType = userType === 'partner' ? 'partner' : 'user';
            const result = await resetPassword(resetData.email, resetData.otp, resetData.newPassword, accountType);
            if (result.success) {
                setSuccessMsg('Password reset successfully! Redirecting to login...');
                setResetData({ email: '', otp: '', newPassword: '', confirmNewPassword: '' });
                setTimeout(() => {
                    handleToggleMode('login');
                }, 2000);
            } else {
                setError(result.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsLoading(true);

        try {
            if (mode === 'login') {
                if (userType === 'user') {
                    const result = await login(formData.email, formData.password);
                    if (result.success) {
                        setSuccessMsg('Login successful');
                        setTimeout(() => navigate('/'), 1000);
                    } else {
                        setError(result.message || 'Invalid credentials');
                    }
                } else {
                    const result = await partnerLogin(formData.email, formData.password);
                    if (result.success) {
                        setSuccessMsg('Login successful');
                        setTimeout(() => navigate('/partner/dashboard'), 1000);
                    } else {
                        setError(result.message || 'Invalid partner credentials');
                    }
                }
            } else {
                // Signup Logic
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    setIsLoading(false);
                    return;
                }

                if (userType === 'user') {
                    const result = await signup({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        password: formData.password,
                        role: 'user'
                    });
                    if (result.success) {
                        setSuccessMsg('Account created! Switching to login...');
                        setTimeout(() => handleToggleMode('login'), 2000);
                    } else setError(result.message || 'Signup failed');
                } else {
                    // Partner Signup
                    const partnerData = {
                        ownerName: formData.name,
                        salonName: formData.salonName,
                        email: formData.email,
                        phone: formData.phone,
                        password: formData.password,
                        address: formData.salonLocation || formData.address,
                        salonPhoto: formData.salonPhoto,
                        startingPrice: formData.startingPrice
                    };
                    const result = await partnerSignup(partnerData);
                    if (result.success) {
                        setSuccessMsg('Application submitted! Switching to login...');
                        setTimeout(() => handleToggleMode('login'), 2000);
                    } else setError(result.message || 'Registration failed');
                }
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Render forgot password flow
    const renderForgotPassword = () => (
        <div className="auth-form-container fade-in" key={`forgot-${forgotStep}-${userType}`}>
            <div className="form-title">
                <h2>
                    {forgotStep === 1 ? 'Forgot Password' : 'Reset Password'}
                    <span style={{ color: 'var(--primary-glow)', fontSize: '0.8em' }}>.</span>
                </h2>
                <p>
                    {forgotStep === 1
                        ? `Enter your ${userType === 'partner' ? 'partner' : 'user'} email to receive an OTP`
                        : 'Enter the OTP and your new password'}
                </p>
            </div>

            {error && <div className="error-msg">{error}</div>}
            {successMsg && <div className="success-msg">{successMsg}</div>}

            {forgotStep === 1 ? (
                <form onSubmit={handleSendOTP} className="master-form">
                    <div className="input-group">
                        <div className="input-field-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your registered email"
                                value={resetData.email}
                                onChange={handleResetChange}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            'Sending OTP...'
                        ) : (
                            <>
                                <Mail size={20} />
                                Send OTP
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        className="forgot-back-btn"
                        onClick={() => handleToggleMode('login')}
                    >
                        <ArrowLeft size={16} />
                        Back to Login
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} className="master-form">
                    <div className="otp-info-banner">
                        <ShieldAlert size={16} />
                        <span>OTP sent to <strong>{resetData.email}</strong></span>
                    </div>

                    <div className="input-group">
                        <div className="input-field-wrapper">
                            <KeyRound size={18} className="input-icon" />
                            <input
                                type="text"
                                id="otp"
                                placeholder="Enter 6-digit OTP"
                                value={resetData.otp}
                                onChange={handleResetChange}
                                maxLength={6}
                                autoComplete="one-time-code"
                                required
                                className="otp-input"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <div className="input-field-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="newPassword"
                                placeholder="New Password"
                                value={resetData.newPassword}
                                onChange={handleResetChange}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className="pass-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <div className="input-field-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmNewPassword"
                                placeholder="Confirm New Password"
                                value={resetData.confirmNewPassword}
                                onChange={handleResetChange}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className="pass-toggle-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            'Resetting...'
                        ) : (
                            <>
                                <CheckCircle2 size={20} />
                                Reset Password
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <div className="forgot-actions">
                        <button
                            type="button"
                            className="forgot-back-btn"
                            onClick={() => {
                                setForgotStep(1);
                                resetMessages();
                            }}
                        >
                            <ArrowLeft size={16} />
                            Change Email
                        </button>
                        <button
                            type="button"
                            className="resend-otp-btn"
                            onClick={async () => {
                                setError('');
                                setSuccessMsg('');
                                setIsLoading(true);
                                const accountType = userType === 'partner' ? 'partner' : 'user';
                                const result = await forgotPassword(resetData.email, accountType);
                                if (result.success) setSuccessMsg('New OTP sent!');
                                else setError(result.message || 'Failed to resend');
                                setIsLoading(false);
                            }}
                            disabled={isLoading}
                        >
                            Resend OTP
                        </button>
                    </div>
                </form>
            )}
        </div>
    );

    return (
        <div className="auth-master-container">
            <div className="auth-card">
                {/* Content Side only */}
                <div className="auth-content-panel">
                    <div className="auth-brand-header">
                        <Link to="/">
                            <img src={logo} alt="Logo" className="content-logo" />
                            <span className="brand-text">BookSaloonz</span>
                        </Link>
                    </div>
                    <div className="auth-toggles">
                        <div className="main-toggle">
                            <button
                                className={`main-toggle-btn ${userType === 'user' ? 'active' : ''}`}
                                onClick={() => handleToggleUserType('user')}
                            >
                                <User size={18} /> User Account
                            </button>
                            <button
                                className={`main-toggle-btn ${userType === 'partner' ? 'active' : ''}`}
                                onClick={() => handleToggleUserType('partner')}
                            >
                                <ShieldCheck size={18} /> Partner Portal
                            </button>
                        </div>

                        {mode !== 'forgot' && (
                            <div className="toggle-group">
                                <button
                                    className={`toggle-btn ${mode === 'login' ? 'active' : ''}`}
                                    onClick={() => handleToggleMode('login')}
                                >
                                    Login
                                </button>
                                <button
                                    className={`toggle-btn ${mode === 'signup' ? 'active' : ''}`}
                                    onClick={() => handleToggleMode('signup')}
                                >
                                    Create Account
                                </button>
                            </div>
                        )}
                    </div>

                    {mode === 'forgot' ? renderForgotPassword() : (
                        <div className="auth-form-container fade-in" key={`${mode}-${userType}`}>
                            <div className="form-title">
                                <h2>
                                    {mode === 'login' ? 'Welcome Back' : 'Get Started'}
                                    <span style={{ color: 'var(--primary-glow)', fontSize: '0.8em' }}>.</span>
                                </h2>
                                <p>
                                    {mode === 'login'
                                        ? `Enter your ${userType} credentials to continue`
                                        : `Create your ${userType} account in a few seconds`}
                                </p>
                            </div>

                            {error && <div className="error-msg">{error}</div>}
                            {successMsg && <div className="success-msg">{successMsg}</div>}

                            <form onSubmit={handleSubmit} className="master-form">
                                {/* Common Fields for Login */}
                                {mode === 'login' ? (
                                    <>
                                        <div className="input-group">
                                            <div className="input-field-wrapper">
                                                <Mail size={18} className="input-icon" />
                                                <input
                                                    type="email"
                                                    id="email"
                                                    placeholder="example@gmail.com"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    autoComplete="email"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <div className="input-field-wrapper">
                                                <Lock size={18} className="input-icon" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    id="password"
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    autoComplete="current-password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="pass-toggle-btn"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Forgot Password Link */}
                                        <div className="forgot-password-row">
                                            <button
                                                type="button"
                                                className="forgot-password-link"
                                                onClick={() => handleToggleMode('forgot')}
                                            >
                                                <KeyRound size={14} />
                                                Forgot Password?
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    /* Signup Fields */
                                    <>
                                        {userType === 'user' ? (
                                            <>
                                                <div className="input-group">
                                                    <div className="input-field-wrapper">
                                                        <User size={18} className="input-icon" />
                                                        <input type="text" id="name" placeholder="Name" value={formData.name} onChange={handleChange} autoComplete="name" required />
                                                    </div>
                                                </div>
                                                <div className="input-group">
                                                    <div className="input-field-wrapper">
                                                        <Mail size={18} className="input-icon" />
                                                        <input type="email" id="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} autoComplete="email" required />
                                                    </div>
                                                </div>
                                                <div className="input-group">
                                                    <div className="input-field-wrapper">
                                                        <Phone size={18} className="input-icon" />
                                                        <input type="tel" id="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} autoComplete="tel" required />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="input-group">
                                                        <div className="input-field-wrapper">
                                                            <Lock size={18} className="input-icon" />
                                                            <input type={showPassword ? "text" : "password"} id="password" placeholder="Password" value={formData.password} onChange={handleChange} autoComplete="new-password" required />
                                                            <button type="button" className="pass-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="input-field-wrapper">
                                                            <Lock size={18} className="input-icon" />
                                                            <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" placeholder="Confirm" value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" required />
                                                            <button type="button" className="pass-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            /* Partner Signup (Compact Grid) */
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                <div className="form-row">
                                                    <div className="input-group">
                                                        <div className="input-field-wrapper">
                                                            <User size={16} className="input-icon" />
                                                            <input type="text" id="name" placeholder="Name" value={formData.name} onChange={handleChange} autoComplete="name" required />
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="input-field-wrapper">
                                                            <Mail size={16} className="input-icon" />
                                                            <input type="email" id="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} autoComplete="email" required />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="input-group">
                                                        <div className="input-field-wrapper">
                                                            <Phone size={16} className="input-icon" />
                                                            <input type="tel" id="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} autoComplete="tel" required />
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="input-field-wrapper">
                                                            <Store size={16} className="input-icon" />
                                                            <input type="text" id="salonName" placeholder="Salon" value={formData.salonName} onChange={handleChange} required />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="input-group">
                                                        <div className="input-field-wrapper">
                                                            <IndianRupee size={16} className="input-icon" />
                                                            <input type="number" id="startingPrice" placeholder="Starting Price (₹)" value={formData.startingPrice} onChange={handleChange} required />
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="input-field-wrapper">
                                                            <MapPin size={16} className="input-icon" />
                                                            <input type="text" id="salonLocation" placeholder="Salon Location" value={formData.salonLocation} onChange={handleChange} required />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="input-group">
                                                    <div className="input-field-wrapper">
                                                        <Image size={16} className="input-icon" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        setFormData({ ...formData, salonPhoto: reader.result, salonPhotoFile: file });
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="input-group">
                                                        <div className="input-field-wrapper">
                                                            <Lock size={16} className="input-icon" />
                                                            <input type={showPassword ? "text" : "password"} id="password" placeholder="Password" value={formData.password} onChange={handleChange} autoComplete="new-password" required />
                                                            <button type="button" className="pass-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="input-group">
                                                        <div className="input-field-wrapper">
                                                            <Lock size={16} className="input-icon" />
                                                            <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" placeholder="Confirm" value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" required />
                                                            <button type="button" className="pass-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                                    {isLoading ? (
                                        'Processing...'
                                    ) : (
                                        <>
                                            {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                                            {mode === 'login' ? 'Login' : 'Sign Up'}
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthMaster;
