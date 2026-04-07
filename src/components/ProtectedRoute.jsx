import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — wraps any route that requires login and optionally specific roles.
 * If user is not logged in, redirects to /login.
 * If user does not have the required role, redirects them to their correct dashboard.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isLoggedIn, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '1rem'
            }}>
                Loading...
            </div>
        );
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // Role-based access control
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // Redirect to their respective dashboard if they're in the wrong place
        if (user?.role === 'salonOwner') return <Navigate to="/partner/dashboard" replace />;
        if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/user/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;

