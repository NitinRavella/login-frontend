// components/ProtectedLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

const ProtectedLayout = () => (
    <>
        <NavBar />
        <div className="container mt-4">
            <Outlet />
        </div>
    </>
);

export default ProtectedLayout;
