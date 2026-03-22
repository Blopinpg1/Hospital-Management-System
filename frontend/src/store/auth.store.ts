import { create } from 'zustand';
import type { AuthUser } from '@/types';

interface AuthState {
  token: string | null;
  user: { user_id: number; email: string; role: string } | null;
  setAuth: (token: string, user: AuthState['user']) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('hh_token'),
  user: (() => {
    try {
      const u = localStorage.getItem('hh_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })(),

  setAuth: (token, user) => {
    localStorage.setItem('hh_token', token);
    localStorage.setItem('hh_user', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('hh_token');
    localStorage.removeItem('hh_user');
    set({ token: null, user: null });
  },

  isAuthenticated: () => !!get().token && !!get().user,
}));
