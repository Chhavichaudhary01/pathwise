import axios from 'axios';

const getBaseUrl = () => {
    return import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:4444/api/v1';
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const res = await axios.post(`${getBaseUrl()}/auth/refreshtoken`, {
                    refreshToken,
                });
                const { accessToken, refreshToken: newRefreshToken } = res.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (err) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
