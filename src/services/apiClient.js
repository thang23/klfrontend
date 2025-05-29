import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(

    (response) => response,
    async (error) => {
        console.log("sbcjshbb");
        const originalRequest = error.config;
        if (error.response?.status === 401 || error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                console.log('Attempting to refresh token with:', refreshToken);
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, { refreshToken });
                    const { token, role, refreshToken: newRefreshToken } = response.data;
                    console.log('Refresh successful. New token:', token);
                    localStorage.setItem('token', token);
                    localStorage.setItem('role', role);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken); // Lưu refreshToken mới
                    }
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                } else {
                    console.error('No refresh token available');
                    throw new Error('No refresh token');
                }
            } catch (refreshError) {
                console.error('Refresh token failed:', refreshError.response?.data || refreshError.message);
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;