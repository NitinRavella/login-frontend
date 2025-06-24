import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../services/ServiceConstants';

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
    error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            return toast.promise(
                api.post('/auth/refresh-token'),
                {
                    pending: '🔄 Re-authenticating your session...',
                    success: {
                        render() {
                            return '✅ You’re back online! Session refreshed.';
                        },
                    },
                    error: {
                        render() {
                            return '⚠️ Session expired. Please log in again.';
                        },
                    },
                },
                {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'colored',
                }
            ).then(res => {
                const newToken = res.data.token;
                sessionStorage.setItem('token', newToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return api(originalRequest);
            }).catch(refreshError => {
                sessionStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            });
        }

        return Promise.reject(error);
    }
);

export default api;
