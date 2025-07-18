import axios from 'axios';
import { API_URL } from '../services/ServiceConstants';
import { notifyError, notifyWarning, notifyLoading, notifyUpdateToast, } from '../utils/toastUtils';

const api = axios.create({
    baseURL: API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

api.interceptors.request.use(config => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const toastId = notifyLoading("Re-authenticating your session...");

            try {
                const res = await api.post('/auth/refresh-token');
                const newToken = res.data.token;
                notifyUpdateToast(toastId, 'success', "You’re back online! Session refreshed.", 3000);
                sessionStorage.setItem('token', newToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                notifyUpdateToast(toastId, 'error', "Session expired. Please log in again.", 3000);

                sessionStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || "An error occurred";

            if (status === 403) {
                notifyWarning("You don't have permission to perform this action.");
            } else if (status === 404) {
                notifyError("Requested resource not found.");
            } else if (status >= 500) {
                notifyError("Server error. Please try again later.");
            } else {
                notifyError(message);
            }
        } else {
            notifyError("Network error. Please check your connection.");
        }

        return Promise.reject(error);
    }
);

export default api;
