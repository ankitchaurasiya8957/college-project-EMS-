import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * BUG-9 FIX: AdminRoute — Protects admin-only routes by checking role
 * before rendering. Prevents non-admin users from seeing the admin dashboard
 * or triggering admin-only API calls.
 */
const AdminRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default AdminRoute;
