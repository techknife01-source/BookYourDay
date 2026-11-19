import apiClient from './client';
import { UserProfile, ApiResponse } from '../types';

export interface AuthLoginResponse {
  token?: string;
  user?: UserProfile;
  data?: UserProfile;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: 'user' | 'partner';
}

export const authApi = {
  login: async (email: string, password?: string, phone?: string): Promise<AuthLoginResponse> => {
    const response = await apiClient.post<ApiResponse<UserProfile> & { token?: string; user?: UserProfile }>('/auth/login', {
      email,
      password,
      phone
    });

    const token = response.data?.token || (response.data as any)?.data?.token;
    if (token && token !== 'undefined' && token !== 'null') {
      localStorage.setItem('byd_auth_token', token);
      localStorage.setItem('token', token);
    }

    const userObj =
      response.data?.user ||
      (response.data as any)?.data?.user ||
      ((response.data as any)?.data?.id ? (response.data as any)?.data : null);

    if (userObj) {
      localStorage.setItem('byd_user', JSON.stringify(userObj));
      localStorage.setItem('user', JSON.stringify(userObj));
    }

    window.dispatchEvent(new Event('byd_auth_change'));
    window.dispatchEvent(new Event('storage'));

    return {
      token,
      user: userObj,
      data: userObj
    };
  },

  register: async (payload: RegisterPayload): Promise<AuthLoginResponse> => {
    const response = await apiClient.post<ApiResponse<UserProfile> & { token?: string; user?: UserProfile }>('/auth/register', payload);

    const token = response.data?.token || (response.data as any)?.data?.token;
    if (token && token !== 'undefined' && token !== 'null') {
      localStorage.setItem('byd_auth_token', token);
      localStorage.setItem('token', token);
    }

    const userObj =
      response.data?.user ||
      (response.data as any)?.data?.user ||
      ((response.data as any)?.data?.id ? (response.data as any)?.data : null);

    if (userObj) {
      localStorage.setItem('byd_user', JSON.stringify(userObj));
      localStorage.setItem('user', JSON.stringify(userObj));
    }

    window.dispatchEvent(new Event('byd_auth_change'));
    window.dispatchEvent(new Event('storage'));

    return {
      token,
      user: userObj,
      data: userObj
    };
  },

  getProfile: async (): Promise<UserProfile | null> => {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile> & { user?: UserProfile }>('/auth/me');
      if (response.data && response.data.success) {
        return response.data.data || response.data.user || null;
      }
      return null;
    } catch {
      return null;
    }
  },

  logout: (): void => {
    try {
      localStorage.removeItem('byd_auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('byd_user');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('byd_auth_change'));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // ignore
    }
  },

  isAuthenticated: (): boolean => {
    try {
      const token = localStorage.getItem('byd_auth_token') || localStorage.getItem('token');
      return Boolean(token && token !== 'undefined' && token !== 'null');
    } catch {
      return false;
    }
  }
};

export default authApi;
