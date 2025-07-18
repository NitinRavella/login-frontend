import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './shopping-cart/home/Home';
import PrivateRoute from './shopping-cart/components/PrivateRoute';
import Profile from './shopping-cart/profile/Profile';
import ProtectedLayout from './shopping-cart/components/ProtectedLayout';
import AdminUsersList from './shopping-cart/profile/AdminUsersList';
import { ToastContainer } from 'react-toastify';
import ProductDetails from './shopping-cart/home/ProductDetails';
import 'react-toastify/dist/ReactToastify.css';
import AuthPage from './shopping-cart/login/AuthPage';
import VerifyEmail from './shopping-cart/login/VerifyEmail';
import NavBar from './shopping-cart/components/NavBar';
import LikedProducts from './shopping-cart/home/LikedProducts';
import AddToCart from './shopping-cart/cart/AddToCart';
import Checkout from './shopping-cart/cart/Checkout';
import OrderConfirmation from './shopping-cart/cart/OrderConfirmation';
import OrderHistory from './shopping-cart/cart/OrderHistory';
import OrderDetailsPage from './shopping-cart/cart/OrderDetailsPage';
import PublicRoute from './shopping-cart/components/PublicRoute';
import AdminOrderCards from './shopping-cart/cart/AdminOrderCards';


class App extends Component {
    render() {
        return (
            <>
                <ToastContainer />
                <Router>
                    <NavBar />
                    <Routes>
                        <Route path="/" element={<Navigate to="/home" />} />

                        {/* Public Routes */}
                        <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
                        <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/product/:id" element={<ProductDetails />} />
                        <Route path="/order/:orderId" element={<OrderDetailsPage />} />
                        <Route path="/liked-products" element={<LikedProducts />} />

                        {/* Protected Routes (only after login) */}
                        <Route element={<PrivateRoute><ProtectedLayout /></PrivateRoute>}>
                            <Route path='/cart' element={<AddToCart />} />
                            <Route path='checkout' element={<Checkout />} />
                            <Route path='/order-confirmation' element={<OrderConfirmation />} />
                            <Route path="/admin/orders" element={<AdminOrderCards />} />
                            <Route path='/order-history' element={<OrderHistory />} />
                            <Route path="/admin/users" element={<AdminUsersList />} />
                            <Route path="/profile" element={<Profile />} />
                        </Route>
                    </Routes>
                </Router>
            </>
        );
    }
}

export default App;
