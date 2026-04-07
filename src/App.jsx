import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Salons from './pages/Salons';
import Products from './pages/Products';
import About from './pages/About';
import Footer from './components/Footer';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AuthMaster from './pages/AuthMaster';
import HairTracker from './pages/HairTracker';
import HairStyleAI from './pages/HairStyleAI';
import PartnerDashboard from './pages/PartnerDashboard';
import PartnerConnect from './pages/PartnerConnect';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

import Dashboard from './pages/Dashboard';
import SalonDetails from './pages/SalonDetails';
import Cart from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';

import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

/**
 * DashboardRedirect component that navigates the user 
 * to their respective dashboard based on their role.
 */
const DashboardRedirect = () => {
    const { user } = useAuth();
    if (user?.role === 'salonOwner') return <Navigate to="/partner/dashboard" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
};

function AppContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isLoggedIn, user, loading } = useAuth();

    // Enforce role-based page isolation
    React.useEffect(() => {
        if (!loading && isLoggedIn && user) {
            const isPartnerPath = location.pathname.startsWith('/partner');
            const isAdminPath = location.pathname.startsWith('/admin');
            const isAuthPage = ['/login', '/signup', '/partner-login', '/partner-signup'].includes(location.pathname);

            // If partner is on a user-facing page or auth page, redirect to dashboard
            if (user.role === 'salonOwner' && (!isPartnerPath || isAuthPage)) {
                 // But wait, allow them to be on SOME pages? (Uncomment if needed)
                 // For now, strict: only partner pages
                 if (location.pathname !== '/partner/dashboard' && !isPartnerPath) {
                    navigate('/partner/dashboard', { replace: true });
                 }
            }
            
            // If admin is on a user-facing page or auth page, redirect to admin dashboard
            if (user.role === 'admin' && (!isAdminPath || isAuthPage)) {
                if (location.pathname !== '/admin/dashboard' && !isAdminPath) {
                    navigate('/admin/dashboard', { replace: true });
                }
            }

            // If a standard user tries to access auth pages while logged in
            if (user.role === 'user' && isAuthPage) {
                navigate('/user/dashboard', { replace: true });
            }
        }
    }, [isLoggedIn, user, loading, location.pathname, navigate]);

    const hideNavbarFooter = [
        '/login', '/signup', 
        '/partner-login', '/partner-signup', 
        '/partner/dashboard'
    ].some(path => location.pathname.startsWith(path));

    return (
        <div className="app-container">
            {!hideNavbarFooter && <Navbar />}
            <main className="content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/salons" element={<Salons />} />
                    <Route path="/salons/:id" element={<SalonDetails />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                    <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
                    <Route path="/about" element={<About />} />
                    <Route path="/login" element={<AuthMaster />} />
                    <Route path="/signup" element={<AuthMaster />} />
                    <Route path="/partner-login" element={<AuthMaster />} />
                    <Route path="/partner-signup" element={<AuthMaster />} />
                    
                    {/* Role-Based Dashboards */}
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
                    <Route path="/user/dashboard" element={<ProtectedRoute allowedRoles={['user']}><Dashboard /></ProtectedRoute>} />
                    <Route path="/partner/dashboard" element={<ProtectedRoute allowedRoles={['salonOwner']}><PartnerDashboard /></ProtectedRoute>} />
                    <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><div>Admin Dashboard</div></ProtectedRoute>} />

                    <Route path="/hair-tracker" element={<ProtectedRoute><HairTracker /></ProtectedRoute>} />
                    <Route path="/hairstyle-ai" element={<ProtectedRoute><HairStyleAI /></ProtectedRoute>} />
                    <Route path="/partner-connect" element={<PartnerConnect />} />
                    
                    {/* Fallback to user dashboard for legacy paths */}
                    <Route path="/partner-dashboard" element={<Navigate to="/partner/dashboard" replace />} />
                    
                    <Route path="*" element={<Home />} />
                </Routes>
            </main>
            {!hideNavbarFooter && <Footer />}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <ScrollToTop />
                    <AppContent />
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
