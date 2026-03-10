import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
    Calendar, Clock, MapPin, User, Settings,
    LogOut, ChevronRight, AlertCircle, CheckCircle2,
    XCircle, Clock3, Scissors
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout, updateMe } = useAuth();
    const location = useLocation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Profile Settings States
    const [profileData, setProfileData] = useState({ name: '', email: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [settingsMsg, setSettingsMsg] = useState({ type: '', text: '' });

    // Read tab from URL query params
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'upcoming';
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        fetchBookings();
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings/my');
            if (res.data.success) {
                setBookings(res.data.bookings);
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setSettingsMsg({ type: '', text: '' });

        try {
            const res = await api.put('/auth/update-profile', profileData);
            if (res.data.success) {
                setSettingsMsg({ type: 'success', text: 'Profile updated successfully!' });
                updateMe(res.data.user);
            }
        } catch (err) {
            setSettingsMsg({
                type: 'error',
                text: err.response?.data?.message || 'Update failed'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setSettingsMsg({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setIsChangingPassword(true);
        setSettingsMsg({ type: '', text: '' });

        try {
            const res = await api.put('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            if (res.data.success) {
                setSettingsMsg({ type: 'success', text: 'Password changed successfully! Please log in again.' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => {
                    logout();
                }, 2000);
            }
        } catch (err) {
            setSettingsMsg({
                type: 'error',
                text: err.response?.data?.message || 'Password change failed'
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            const res = await api.put(`/bookings/${id}/cancel`);
            if (res.data.success) {
                fetchBookings();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Cancellation failed');
        }
    };

    const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
    const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

    return (
        <div className="dashboard-container page-fade-in">
            <div className="dashboard-layout">
                {/* Sidebar */}
                <aside className="dashboard-sidebar glass-effect">
                    <div className="user-profile-brief">
                        <div className="avatar-large">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="user-info">
                            <h3>{user?.name}</h3>
                            <p>{user?.email}</p>
                        </div>
                    </div>

                    <nav className="dashboard-nav">
                        <button
                            className={`nav-item ${activeTab === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setActiveTab('upcoming')}
                        >
                            <Calendar size={20} /> Upcoming Bookings
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'past' ? 'active' : ''}`}
                            onClick={() => setActiveTab('past')}
                        >
                            <Clock3 size={20} /> Booking History
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings size={20} /> Account Settings
                        </button>
                        <div className="nav-divider"></div>
                        <button className="nav-item logout" onClick={logout}>
                            <LogOut size={20} /> Logout
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="dashboard-main">
                    <header className="dashboard-header">
                        <h1>
                            {activeTab === 'upcoming' && 'Upcoming Appointments'}
                            {activeTab === 'past' && 'Booking History'}
                            {activeTab === 'settings' && 'Account Settings'}
                        </h1>
                    </header>

                    <div className="dashboard-content">
                        {loading ? (
                            <div className="dashboard-loading">
                                <Clock size={40} className="spin" />
                                <p>Syncing your appointments...</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                {activeTab === 'upcoming' && (
                                    <motion.div
                                        key="upcoming"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bookings-list"
                                    >
                                        {upcomingBookings.length > 0 ? (
                                            upcomingBookings.map(booking => (
                                                <BookingCard
                                                    key={booking._id}
                                                    booking={booking}
                                                    onCancel={() => handleCancel(booking._id)}
                                                    isUpcoming
                                                />
                                            ))
                                        ) : (
                                            <EmptyState icon={<Calendar size={48} />} title="No upcoming bookings" />
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'past' && (
                                    <motion.div
                                        key="past"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bookings-list"
                                    >
                                        {pastBookings.length > 0 ? (
                                            pastBookings.map(booking => (
                                                <BookingCard key={booking._id} booking={booking} />
                                            ))
                                        ) : (
                                            <EmptyState icon={<Clock3 size={48} />} title="History is clean" />
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'settings' && (
                                    <motion.div
                                        key="settings"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="settings-view glass-effect"
                                    >
                                        <div className="settings-section">
                                            <h3>Profile Information</h3>
                                            {settingsMsg.text && (
                                                <div className={`settings-msg ${settingsMsg.type}`}>
                                                    {settingsMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                                    {settingsMsg.text}
                                                </div>
                                            )}
                                            <form onSubmit={handleUpdateProfile} className="settings-form">
                                                <div className="input-field-dashboard">
                                                    <label>Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.name}
                                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                        placeholder="Enter your name"
                                                    />
                                                </div>
                                                <div className="input-field-dashboard">
                                                    <label>Email Address</label>
                                                    <input
                                                        type="email"
                                                        value={profileData.email}
                                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                        placeholder="Enter your email"
                                                    />
                                                </div>
                                                <button type="submit" className="btn-secondary" disabled={isUpdating}>
                                                    {isUpdating ? 'Updating...' : 'Update Profile'}
                                                </button>
                                            </form>
                                        </div>
                                        <hr className="settings-divider" />
                                        <div className="settings-section">
                                            <h3>Security</h3>
                                            {!showPasswordForm ? (
                                                <button className="btn-secondary" onClick={() => setShowPasswordForm(true)}>
                                                    Change Password
                                                </button>
                                            ) : (
                                                <form onSubmit={handlePasswordChange} className="settings-form">
                                                    <div className="input-field-dashboard">
                                                        <label>Current Password</label>
                                                        <input
                                                            type="password"
                                                            value={passwordData.currentPassword}
                                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                            placeholder="Current password"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="input-field-dashboard">
                                                        <label>New Password</label>
                                                        <input
                                                            type="password"
                                                            value={passwordData.newPassword}
                                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                            placeholder="New password"
                                                            required
                                                            minLength={6}
                                                        />
                                                    </div>
                                                    <div className="input-field-dashboard">
                                                        <label>Confirm New Password</label>
                                                        <input
                                                            type="password"
                                                            value={passwordData.confirmPassword}
                                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                            placeholder="Confirm new password"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="form-actions">
                                                        <button type="submit" className="btn-secondary" disabled={isChangingPassword}>
                                                            {isChangingPassword ? 'Changing...' : 'Update Password'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-ghost"
                                                            onClick={() => {
                                                                setShowPasswordForm(false);
                                                                setSettingsMsg({ type: '', text: '' });
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

const BookingCard = ({ booking, onCancel, isUpcoming }) => {
    const statusIcons = {
        confirmed: <CheckCircle2 size={16} className="text-success" />,
        pending: <AlertCircle size={16} className="text-warning" />,
        completed: <CheckCircle2 size={16} className="text-primary" />,
        cancelled: <XCircle size={16} className="text-danger" />
    };

    return (
        <motion.div className="booking-card glass-effect" whileHover={{ x: 10 }}>
            <div className="booking-main">
                <div className="salon-logo-brief">
                    <Scissors size={24} />
                </div>
                <div className="booking-details">
                    <div className="booking-header">
                        <h4>{booking.salon?.name || 'Salon'}</h4>
                        <span className={`status-badge ${booking.status}`}>
                            {statusIcons[booking.status]} {booking.status}
                        </span>
                    </div>
                    <p className="booking-service">{booking.service}</p>
                    <div className="booking-meta">
                        <span><Calendar size={14} /> {booking.date}</span>
                        <span><Clock size={14} /> {booking.time}</span>
                        <span><MapPin size={14} /> {booking.salon?.address || 'Tirunelveli'}</span>
                    </div>
                </div>
            </div>

            {isUpcoming && booking.status === 'confirmed' && (
                <div className="booking-actions">
                    <button className="btn-ghost text-danger" onClick={onCancel}>Cancel</button>
                    <button className="btn-ghost">Reschedule</button>
                </div>
            )}

            {!isUpcoming && booking.status === 'completed' && (
                <div className="booking-actions">
                    <button className="btn-primary-small">Review Salon</button>
                </div>
            )}
        </motion.div>
    );
};

const EmptyState = ({ icon, title }) => (
    <div className="empty-state">
        {icon}
        <h3>{title}</h3>
        <p>Book your next grooming session now!</p>
        <button className="btn-primary mt-4" onClick={() => window.location.href = '/salons'}>
            Explore Salons
        </button>
    </div>
);

export default Dashboard;
