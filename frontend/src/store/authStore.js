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
      isHydrated: false,
      hasCheckedAuth: false,

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
            hasCheckedAuth: true,
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
            hasCheckedAuth: true,
            isLoading: false,
          });

          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Admin login with elevated credentials
      adminLogin: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/api/auth/admin/login', {
            email,
            password,
          });

          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            hasCheckedAuth: true,
            isLoading: false,
          });

          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Admin login failed';
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
        const authAlreadyResolved = get().hasCheckedAuth;
        if (authAlreadyResolved && get().isAuthenticated) {
          return { success: true, user: get().user };
        }

        set({ isLoading: false });
        try {
          const response = await api.get('/api/auth/checkauth');

          set({
            user: response.data.user,
            isAuthenticated: true,
            hasCheckedAuth: true,
            isLoading: false,
            error: null,
          });

          return response.data;
        } catch (error) {
          // If login/signup completed while this request was in flight, don't override it.
          if (get().isAuthenticated) {
            set({ hasCheckedAuth: true, isLoading: false });
            return null;
          }

          const status = error.response?.status;
          if (status === 401 || status === 403) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              hasCheckedAuth: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({ hasCheckedAuth: true, isLoading: false });
          }
          return null;
        }
      },

      // Update profile in backend and local store
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put('/api/auth/profile', profileData);
          set({
            user: response.data.user,
            isAuthenticated: true,
            hasCheckedAuth: true,
            isLoading: false,
          });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Profile update failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
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
            hasCheckedAuth: true,
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

      // Persist hydration marker
      setHydrated: (isHydrated) => set({ isHydrated }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user
          ? {
              _id: state.user._id,
              email: state.user.email,
              firstName: state.user.firstName,
              lastName: state.user.lastName,
              role: state.user.role,
              isBlocked: state.user.isBlocked,
              profileTheme: state.user.profileTheme,
            }
          : null,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export default useAuthStore;
