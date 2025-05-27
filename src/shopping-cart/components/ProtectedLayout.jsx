// components/ProtectedLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const ProtectedLayout = () => (
    <>
        <Outlet />
    </>
);

export default ProtectedLayout;
