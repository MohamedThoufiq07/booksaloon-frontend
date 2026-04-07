import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home as HomeIcon, Scissors, Package, Info,
    User, LogIn, ChevronDown, Sparkles, Settings,
    LogOut, Menu, X, LayoutDashboard,
    Store, MoreHorizontal, Briefcase, ShoppingBag, ClipboardList, Calendar
} from 'lucide-react';
import logo from '../assets/logo.png';
import './Navbar.css';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = ({ isDashboard, partnerPills }) => {
    const { isLoggedIn, user, logout } = useAuth();
    const { cartCount } = useCart();
    const [showLoginMenu, setShowLoginMenu] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showPartnerMore, setShowPartnerMore] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isPartnerPath = location.pathname.startsWith('/partner');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        if (newState) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        document.body.classList.remove('no-scroll');
        setShowLoginMenu(false);
        setShowProfileMenu(false);
        setShowPartnerMore(false);
    };

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            {/* Left Side: Logo & Brand */}
            <Link to="/" className="navbar-brand" onClick={closeMenu}>
                <img src={logo} alt="BookSaloonz Logo" className="brand-logo" />
                <span className="brand-name">BookSaloonz</span>
            </Link>

            <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle Menu">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Navigation & Auth Section */}
            <div className={`navbar-menu ${isMenuOpen ? 'mobile-active' : ''}`}>
                <ul className="navbar-links">
                    {isDashboard && partnerPills ? (
                        <div className="navbar-pills-integrated">
                            <button
                                className={`pill-nav-mini ${partnerPills.currentView === 'dashboard' ? 'active' : ''}`}
                                onClick={() => partnerPills.onViewChange('dashboard')}
                            >
                                <LayoutDashboard size={16} /> Dashboard
                            </button>
                            <button
                                className={`pill-nav-mini ${partnerPills.currentView === 'salon' ? 'active' : ''}`}
                                onClick={() => partnerPills.onViewChange('salon')}
                            >
                                <Store size={16} /> Salon
                            </button>
                            <button
                                className={`pill-nav-mini ${partnerPills.currentView === 'services' ? 'active' : ''}`}
                                onClick={() => partnerPills.onViewChange('services')}
                            >
                                <ClipboardList size={16} /> Services
                            </button>
                            <button
                                className={`pill-nav-mini ${partnerPills.currentView === 'products' ? 'active' : ''}`}
                                onClick={() => partnerPills.onViewChange('products')}
                            >
                                <Package size={16} /> Inventory
                            </button>
                            <button
                                className={`pill-nav-mini ${partnerPills.currentView === 'orders' ? 'active' : ''}`}
                                onClick={() => partnerPills.onViewChange('orders')}
                            >
                                <ShoppingBag size={16} /> Orders
                            </button>
                            <button
                                className={`pill-nav-mini ${partnerPills.currentView === 'bookings' ? 'active' : ''}`}
                                onClick={() => partnerPills.onViewChange('bookings')}
                            >
                                <Calendar size={16} /> Bookings
                            </button>
                        </div>
                    ) : (
                        isPartnerPath || user?.role === 'salonOwner' ? (
                            <>
                            </>
                        ) : (
                            <>
                                <li>
                                    <NavLink to="/" className="nav-item" onClick={closeMenu}>
                                        <HomeIcon size={18} /> Home
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/salons" className="nav-item" onClick={closeMenu}>
                                        <Scissors size={18} /> Salons
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/products" className="nav-item" onClick={closeMenu}>
                                        <Package size={18} /> Products
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/cart" className="nav-item cart-nav-item" onClick={closeMenu}>
                                        <div className="cart-icon-wrapper">
                                            <ShoppingBag size={18} />
                                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                                        </div>
                                        Cart
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/about" className="nav-item" onClick={closeMenu}>
                                        <Info size={18} /> About
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/hair-tracker" className="nav-item ai-tracker-nav" onClick={closeMenu}>
                                        <Sparkles size={18} /> AI Hair Tracker
                                    </NavLink>
                                </li>
                            </>
                        )
                    )}
                </ul>

                <div className="auth-group">
                    {isLoggedIn ? (
                        <div className="profile-container">
                            <div
                                className="profile-wrapper profile-icon-only"
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                title={user?.name || 'Profile'}
                            >
                                <div className="profile-icon glow-effect">
                                    {user?.name ? (
                                        <span className="user-initials">
                                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                        </span>
                                    ) : (
                                        <User size={20} />
                                    )}
                                </div>
                                <ChevronDown size={14} className={`dropdown-arrow ${showProfileMenu ? 'active' : ''}`} />
                            </div>

                            {showProfileMenu && (
                                <div className="profile-dropdown glass-effect">
                                    <div className="dropdown-user-info">
                                        <p className="dropdown-user-name">{user?.name || 'User'}</p>
                                        <p className="dropdown-user-email">{user?.email || ''}</p>
                                    </div>
                                    <hr className="dropdown-divider" />
                                    {/* Dynamic Dashboard link based on role */}
                                    <Link 
                                        to={user?.role === 'salonOwner' ? "/partner/dashboard" : user?.role === 'admin' ? "/admin/dashboard" : "/user/dashboard"} 
                                        className="profile-dropdown-item" 
                                        onClick={closeMenu}
                                    >
                                        <User size={16} /> Dashboard
                                    </Link>
                                    <Link 
                                        to={user?.role === 'salonOwner' ? "/partner/dashboard?view=salon" : user?.role === 'admin' ? "/admin/dashboard" : "/user/dashboard?tab=settings"} 
                                        className="profile-dropdown-item" 
                                        onClick={closeMenu}
                                    >
                                        <Settings size={16} /> Settings
                                    </Link>
                                    <hr className="dropdown-divider" />
                                    <button className="logout-btn" onClick={() => { logout(); closeMenu(); }}>
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="dropdown">
                                <button
                                    className={`dropdown-btn ${showLoginMenu ? 'active' : ''}`}
                                    onClick={() => setShowLoginMenu(!showLoginMenu)}
                                >
                                    <LogIn size={18} /> Login <ChevronDown size={14} className={showLoginMenu ? 'rotate-180' : ''} />
                                </button>
                                {showLoginMenu && (
                                    <div className="dropdown-content glass-effect">
                                        <Link to="/login" className="dropdown-item" onClick={closeMenu}>
                                            <User size={16} /> User Login
                                        </Link>
                                        <Link to="/partner-connect" className="dropdown-item" onClick={closeMenu}>
                                            <Briefcase size={16} /> Partner Login
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <Link to="/signup" className="signup-btn" onClick={closeMenu}>
                                JOIN US
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
