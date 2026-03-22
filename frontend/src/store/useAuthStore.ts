import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  hasResume: boolean;
  login: (email: string, hasResume?: boolean) => void;
  logout: () => void;
  setHasResume: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userEmail: null,
      hasResume: false,
      login: (email, hasResume = false) => set({ isAuthenticated: true, userEmail: email, hasResume }),
      logout: () => set({ isAuthenticated: false, userEmail: null, hasResume: false }),
      setHasResume: (val) => set({ hasResume: val })
    }),
    {
      name: 'auth-storage'
    }
  )
);
