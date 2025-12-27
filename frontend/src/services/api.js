import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // Important: send cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to headers if available
api.interceptors.request.use(
  (config) => {
    // You can add token to Authorization header if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
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
