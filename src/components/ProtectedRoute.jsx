import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — wraps any route that requires login.
 * If user is not logged in, redirects to /login with a returnUrl
 * so the user can be sent back to the page after login.
 */
const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, loading } = useAuth();
    const location = useLocation();

    // While auth state is loading, show nothing (prevents flash redirect)
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
        // Redirect to login, preserving the intended destination
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
};

export default ProtectedRoute;
