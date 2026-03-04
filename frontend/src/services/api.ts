import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('access_token', token);
    } else {
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
};

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => {
        return response.data; // Only return the data object
    },
    async (error) => {
        if (error.response?.status === 401) {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken && !error.config._retry) {
                error.config._retry = true;
                try {
                    // Attempt refresh
                    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
                    setAuthToken(res.data.data.accessToken);
                    error.config.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
                    return api(error.config);
                } catch (refreshErr) {
                    // Refresh failed, logout
                    setAuthToken(null);
                    window.location.href = '/login';
                }
            } else {
                setAuthToken(null);
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
