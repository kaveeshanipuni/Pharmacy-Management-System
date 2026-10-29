import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pharmacy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses for consistent error handling and session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized due to expired token, clear storage if needed
      const isAuthRequest = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem('pharmacy_token');
        localStorage.removeItem('pharmacy_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
