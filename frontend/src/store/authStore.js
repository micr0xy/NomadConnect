import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      // Sign up with email
      signup: async (firstName, lastName, email, password, confirmPassword) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/api/auth/signup', {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
          });

          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Signup failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Login with email
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/api/auth/login', {
            email,
            password,
          });

          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Google OAuth
      googleAuth: async (googleId, email, firstName, lastName, picture) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/api/auth/google', {
            googleId,
            email,
            firstName,
            lastName,
            picture,
          });

          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Google auth failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Check authentication status
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/api/auth/checkauth');

          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return response.data;
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return null;
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/api/auth/logout');

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Logout failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Set user
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
