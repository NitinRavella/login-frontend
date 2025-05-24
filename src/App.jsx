import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import PrivateRoute from './components/PrivateRoute';
import Profile from './components/Profile';
import ProtectedLayout from './components/ProtectedLayout';
import { ToastContainer } from 'react-toastify';
import ProductDetails from './components/ProductDetails';
import 'react-toastify/dist/ReactToastify.css';

class App extends Component {
    render() {
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        return (
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes */}
                    <Route element={<PrivateRoute><ProtectedLayout /></PrivateRoute>}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/product/:id" element={<ProductDetails />} />
                    </Route>
                </Routes>
            </Router>
        );
    }
}

export default App;
