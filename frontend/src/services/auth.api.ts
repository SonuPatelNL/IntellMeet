// @ts-nocheck
import { api } from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  avatarUrl?: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<{ status: string; data: { user: AuthUser } }>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    api.post<{ status: string; data: { user: AuthUser } }>('/auth/login', payload),

  logout: () => api.post('/auth/logout'),

  refresh: () => api.post('/auth/refresh'),

  forgotPassword: (email: string) =>
    api.post<{ status: string; message: string }>('/auth/forgot-password', { email }),

  resetPassword: (password: string, token: string) =>
    api.post<{ status: string; message: string }>(`/auth/reset-password/${token}`, { password }),
};
