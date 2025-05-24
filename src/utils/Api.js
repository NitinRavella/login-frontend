// src/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // so cookies (refresh token) are sent
});

// Request interceptor to attach access token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to refresh token on 401
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await api.post('/refresh-token');
                const newToken = res.data.token;
                localStorage.setItem('token', newToken);
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return api(originalRequest); // retry request with new token
            } catch (err) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
