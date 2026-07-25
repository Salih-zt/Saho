import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  setUser: (user: UserProfile | null) => void;
  setGuest: (isGuest: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isGuest: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isGuest: false,
        }),
      setGuest: (isGuest) =>
        set({
          user: isGuest
            ? {
                id: 'guest_user',
                displayName: 'Guest User',
                email: null,
                recoveryGoals: [],
                isGuest: true,
                createdAt: Date.now(),
              }
            : null,
          isAuthenticated: false,
          isGuest: isGuest,
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isGuest: false,
        }),
    }),
    {
      name: 'saho-auth',
    }
  )
);
