'use client';

import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatar?: string | null;
  newsletterSubscribed?: boolean;
  isActive?: boolean;
  roles?: string[];
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
  acceptTerms?: boolean;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  newsletterSubscribed?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: UpdateProfilePayload) => Promise<{ success: boolean; error?: string }>;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isInitialized: false,

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        set({ user: data.user || null, isLoading: false, isInitialized: true });
      } else {
        set({ user: null, isLoading: false, isInitialized: true });
      }
    } catch {
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },

  login: async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ isLoading: false });
        return { success: false, error: data.error || 'Đăng nhập không thành công' };
      }

      set({ user: data.user, isLoading: false, isInitialized: true });
      return { success: true };
    } catch (err: unknown) {
      set({ isLoading: false });
      const errorMsg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ';
      return { success: false, error: errorMsg };
    }
  },

  register: async (data: RegisterPayload) => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok) {
        set({ isLoading: false });
        return { success: false, error: resData.error || 'Đăng ký tài khoản thất bại' };
      }

      set({ user: resData.user, isLoading: false, isInitialized: true });
      return { success: true };
    } catch (err: unknown) {
      set({ isLoading: false });
      const errorMsg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ';
      return { success: false, error: errorMsg };
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      set({ user: null, isLoading: false });
    }
  },

  updateProfile: async (data: UpdateProfilePayload) => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok) {
        set({ isLoading: false });
        return { success: false, error: resData.error || 'Cập nhật thông tin thất bại' };
      }

      const updatedUser = resData.user || resData.data;
      set((state) => ({
        user: updatedUser ? { ...state.user, ...updatedUser } : state.user,
        isLoading: false,
      }));
      return { success: true };
    } catch (err: unknown) {
      set({ isLoading: false });
      const errorMsg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ';
      return { success: false, error: errorMsg };
    }
  },

  setUser: (user) => set({ user, isInitialized: true }),
}));

/**
 * Convenient custom hook exposing state & helper getters
 */
export function useAuth() {
  const store = useAuthStore();
  return {
    ...store,
    isAuthenticated: Boolean(store.user),
  };
}
