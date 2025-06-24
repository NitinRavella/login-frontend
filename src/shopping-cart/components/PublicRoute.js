// shopping-cart/components/PublicRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
    const token = sessionStorage.getItem('token'); // or your auth logic
    return token ? <Navigate to="/home" /> : children;
};

export default PublicRoute;
