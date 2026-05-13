import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      login: async (email: string, password: string) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
          }

          const data = await response.json();
          
          set({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
          });
        } catch (error: any) {
          throw new Error(error.message || 'Login failed');
        }
      },

      logout: () => {
        const token = get().token;
        if (token) {
          fetch('/api/auth/logout', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {});
        }
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },
    }),
    {
      name: 'visaflow-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);
