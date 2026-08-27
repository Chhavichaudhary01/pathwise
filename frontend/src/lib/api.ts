import axios from 'axios';

const getBaseUrl = () => {
    let raw = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:4444/api/v1';
    raw = raw.trim().replace(/\/+$/, '');
    if (!raw.endsWith('/api/v1')) {
        raw = `${raw}/api/v1`;
    }
    return raw;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 45000, // 45s timeout to gracefully accommodate Render cold starts
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

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) {
            return Promise.reject(error);
        }

        // Avoid infinite loop on auth endpoints
        if (originalRequest.url?.includes('/auth/signin') ||
            originalRequest.url?.includes('/auth/signup') ||
            originalRequest.url?.includes('/auth/refreshtoken')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axios.post(`${getBaseUrl()}/auth/refreshtoken`, {
                    refreshToken,
                });
                const { accessToken, refreshToken: newRefreshToken } = res.data;

                if (!accessToken) {
                    throw new Error('No access token returned from refresh');
                }

                localStorage.setItem('accessToken', accessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                processQueue(null, accessToken);
                return api(originalRequest);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                console.warn('Authentication session expired, clearing credentials:', refreshErr);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('authUser');
                
                // Only redirect if not already on public/login pages
                if (typeof window !== 'undefined' && 
                    window.location.pathname !== '/login' && 
                    window.location.pathname !== '/signup' && 
                    window.location.pathname !== '/') {
                    window.location.href = '/login?expired=true';
                }
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
