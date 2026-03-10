import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './PartnerLogin.css';

const PartnerLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { partnerLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await partnerLogin(email, password);
            if (result.success) {
                navigate('/partner-dashboard');
            } else {
                setError(result.message || 'Invalid partner credentials');
            }
        } catch (err) {
            setError('An error occurred during login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="partner-login-container">
            <div className="partner-login-card">
                <Link to="/" className="partner-login-header">
                    <img src={logo} alt="BookSaloonz Logo" className="partner-auth-logo" />
                    <h1>Partner Portal</h1>
                    <p>Manage your salon with BookSaloonz</p>
                </Link>

                {error && <div className="auth-error-msg" style={{ marginBottom: '1.5rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="partner-login-form">
                    <div className="partner-form-group">
                        <label htmlFor="email">
                            <Mail size={18} className="label-icon" />
                            Work Email
                        </label>
                        <div className="partner-input-wrapper">
                            <input
                                type="email"
                                id="email"
                                placeholder="owner@salonname.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="partner-form-group">
                        <label htmlFor="password">
                            <Lock size={18} className="label-icon" />
                            Password
                        </label>
                        <div className="partner-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ paddingRight: '2.8rem' }}
                            />
                            <button
                                type="button"
                                className="partner-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="partner-options">
                        <label className="remember-me">
                            <input type="checkbox" />
                            Keep me logged in
                        </label>
                        <Link to="/forgot-password" title="Coming Soon" className="partner-forgot-link">
                            Trouble logging in?
                        </Link>
                    </div>

                    <button type="submit" className="partner-submit-btn" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : (
                            <>
                                <ShieldCheck size={22} />
                                Secure Partner Login
                            </>
                        )}
                    </button>
                </form>

                <div className="partner-login-footer">
                    <p>Interested in joining us?</p>
                    <Link to="/salon-signup">Register your Salon today</Link>
                    <br />
                    <Link to="/login" className="back-to-user">
                        <ArrowLeft size={16} />
                        Switch to User Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PartnerLogin;
