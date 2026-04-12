import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: send cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to headers if available
api.interceptors.request.use(
  (config) => {
    try {
      const persisted = localStorage.getItem('auth-store');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      // Ignore localStorage parse issues and continue with cookie auth.
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth state
      // This will be handled by the useAuthStore
      console.log('Unauthorized - Token may have expired');
    }
    return Promise.reject(error);
  }
);

export default api;
