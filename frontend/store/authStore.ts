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
          
          // sanitize tokens to remove accidental whitespace/newlines
          const cleanToken = typeof data.token === 'string' ? data.token.replace(/\s+/g, '') : data.token;
          const cleanRefresh = typeof data.refreshToken === 'string' ? data.refreshToken.replace(/\s+/g, '') : data.refreshToken;

          set({
            user: data.user,
            token: cleanToken,
            refreshToken: cleanRefresh,
            isAuthenticated: true,
          });
          // Immediately sync to sessionStorage to avoid a later rehydrate overwriting the in-memory state
          try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
              const payload = {
                state: {
                  token: cleanToken,
                  refreshToken: cleanRefresh,
                  user: data.user,
                  isAuthenticated: true,
                },
                version: 0,
              };
              window.sessionStorage.setItem('visaflow-auth', JSON.stringify(payload));
              // set a transient flag to tell rehydrate to skip applying older persisted state
              (window as any).__authJustLoggedIn = true;
            }
          } catch {}
          // debug: confirm token set
          try {
            // eslint-disable-next-line no-console
            console.log('[authStore] login successful, token set:', data.token?.slice?.(0,10));
          } catch {}
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
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state: any) => {
        return (inboundState: any) => {
          try {
            // If we just logged in, skip applying persisted inbound state (it may be stale)
            if (typeof window !== 'undefined' && (window as any).__authJustLoggedIn) {
              (window as any).__authJustLoggedIn = false;
            }

            // Always mark store as hydrated so UI stops showing loading state
            const s = useAuthStore.getState();
            s?.setHydrated?.();
          } catch {}
        };
      },
    }
  )
);

// Debug exposure removed in cleanup
