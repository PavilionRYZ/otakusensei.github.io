// ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, redirectTo = '/', forAuth = false }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    if (forAuth) {
        // If the route is for authenticated users only and the user is not authenticated, redirect to the home page or login page.
        return isAuthenticated ? <Navigate to={redirectTo} /> : children;
    } else {
        // If the route is for non-authenticated users and the user is authenticated, redirect to the home page.
        return isAuthenticated ? children : <Navigate to={redirectTo} />;
    }
};

export default ProtectedRoute;
