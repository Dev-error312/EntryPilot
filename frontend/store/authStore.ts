import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'AGENCY_ADMIN' | 'AGENCY_EMPLOYEE';
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    code: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  setHydrated: () => void;
}

const api = axios.create({
  baseURL: '/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('entrypilot-auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      } catch {}
    }
  }
  return config;
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,

      setHydrated: () => set({ isHydrated: true }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, refreshToken, user } = response.data;
          
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const message = error.response?.data?.message || 'Login failed';
          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
          });
          throw new Error(message);
        }
      },

      logout: () => {
        const token = get().token;
        if (token) {
          api.post('/auth/logout').catch(() => {});
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      clearError: () => set({ error: null }),

      checkAuth: async () => {
        const state = get();
        
        // If not hydrated yet, don't do anything
        if (!state.isHydrated) {
          return;
        }

        // If no token, user is not authenticated
        if (!state.token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        // If we have a token and user, trust the persisted state
        // Only verify on critical operations, not on every page load
        if (state.token && state.user) {
          set({ isAuthenticated: true });
          return;
        }

        // Fallback: verify token with backend
        try {
          const response = await api.get('/auth/me');
          set({ 
            user: response.data, 
            isAuthenticated: true 
          });
        } catch (error) {
          // Token is invalid, clear auth state
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'entrypilot-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Called when persist has finished hydration
        if (state) {
          // Set authenticated based on whether we have a token
          state.isAuthenticated = !!(state.token && state.user);
          state.setHydrated();
        }
      },
    }
  )
);
