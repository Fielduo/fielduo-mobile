import { create } from 'zustand';

interface AuthState {
  user: any;
  token: string;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: '',
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  clearAuth: () => set({ user: null, token: '' }),
}));
