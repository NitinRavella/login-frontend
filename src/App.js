import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './shopping-cart/home/Home';
import PrivateRoute from './shopping-cart/components/PrivateRoute';
import Profile from './shopping-cart/profile/Profile';
import ProtectedLayout from './shopping-cart/components/ProtectedLayout';
import AdminUsersList from './shopping-cart/components/AdminUsersList';
import { ToastContainer } from 'react-toastify';
import ProductDetails from './shopping-cart/home/ProductDetails';
import 'react-toastify/dist/ReactToastify.css';
import AuthPage from './shopping-cart/login/AuthPage';
import Cart from './shopping-cart/cart/Cart';
import NavBar from './shopping-cart/components/NavBar';

class App extends Component {
    render() {
        return (
            <>
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
                <Router>
                    <NavBar />
                    <div className="mt-4">
                        <Routes>
                            <Route path="/" element={<Navigate to="/home" />} />

                            {/* Public Routes */}
                            <Route path="/login" element={<AuthPage />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/product/:id" element={<ProductDetails />} />

                            {/* Protected Routes (only after login) */}
                            <Route element={<PrivateRoute><ProtectedLayout /></PrivateRoute>}>
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/admin/users" element={<AdminUsersList />} />
                                <Route path="/profile" element={<Profile />} />
                            </Route>
                        </Routes>
                    </div>
                </Router>
            </>
        );
    }
}

export default App;
