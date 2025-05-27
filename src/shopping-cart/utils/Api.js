// src/api.js
import axios from 'axios';
import { API_URL } from '../services/ServiceConstants';

const api = axios.create({
    baseURL: API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

// Request interceptor to attach access token
api.interceptors.request.use(config => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor with retry logic (max 3 retries)
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401) {
            originalRequest._retryCount = originalRequest._retryCount || 0;

            if (originalRequest._retryCount < 3) {
                originalRequest._retryCount += 1;

                try {
                    const res = await api.post('/refresh-token');
                    const newToken = res.data.token;
                    sessionStorage.setItem('token', newToken);
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return api(originalRequest); // Retry original request
                } catch (err) {
                    // Failed to refresh token
                }
            }

            // After 3 attempts, clear token and redirect
            sessionStorage.removeItem('token');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;
