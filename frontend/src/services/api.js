import axios from 'axios';

/* Detect dev environment */
const isDev = import.meta.env.DEV;
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = configuredApiBaseUrl || (isDev ? 'http://localhost:5000' : '');

/* Create axios instance */
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* Add token from auth store */
api.interceptors.request.use(
  (config) => {
    if (!API_BASE_URL && !isDev) {
      const configError = new Error('Missing VITE_API_BASE_URL in frontend production environment');
      configError.code = 'MISSING_API_BASE_URL';
      throw configError;
    }

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
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response && error.code === 'ERR_NETWORK') {
      error.message = 'Network error: backend unreachable or blocked by CORS';
    }

    if (error.response?.status === 401) {
      console.log('Unauthorized - Token may have expired');
    }
    return Promise.reject(error);
  }
);

export default api;
