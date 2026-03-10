import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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

import Dashboard from './pages/Dashboard';
import SalonDetails from './pages/SalonDetails';
import Cart from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';

function AppContent() {
    const location = useLocation();
    const hideNavbarFooter = [
        '/login', '/signup', '/salon-login', '/salon-signup',
        '/partner-login', '/partner-signup', '/partner-dashboard'
    ].includes(location.pathname);

    return (
        <div className="app-container">
            {!hideNavbarFooter && <Navbar />}
            <main className="content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/salons" element={<Salons />} />
                    <Route path="/salons/:id" element={<SalonDetails />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/login" element={<AuthMaster />} />
                    <Route path="/signup" element={<AuthMaster />} />
                    <Route path="/salon-login" element={<AuthMaster />} />
                    <Route path="/salon-signup" element={<AuthMaster />} />
                    <Route path="/partner-login" element={<AuthMaster />} />
                    <Route path="/partner-signup" element={<AuthMaster />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/hair-tracker" element={<HairTracker />} />
                    <Route path="/hairstyle-ai" element={<HairStyleAI />} />
                    <Route path="/partner-dashboard" element={<PartnerDashboard />} />
                    <Route path="/partner-connect" element={<PartnerConnect />} />
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
