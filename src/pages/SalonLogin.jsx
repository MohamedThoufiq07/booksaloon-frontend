import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import './Signup.css';

const SalonLogin = () => {
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

        const result = await partnerLogin(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message || 'Invalid email or password');
        }
        setIsLoading(false);
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <Link to="/" className="signup-header">
                    <img src={logo} alt="Logo" className="auth-logo" />
                    <h1>Partner Login</h1>
                    <p>Login to your Salon Partner account</p>
                </Link>

                {error && <div className="auth-error-msg">{error}</div>}

                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type="email"
                                id="email"
                                placeholder="owner@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
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
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="forgot-password-container">
                        <Link to="/forgot-password" title="Coming Soon" className="forgot-password-link">
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" className="signup-submit-btn" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : <><LogIn size={18} /> Partner Login</>}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Not a partner yet? <Link to="/salon-signup">Register Salon</Link></p>
                    <p style={{ marginTop: '10px' }}><Link to="/login">User Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default SalonLogin;
