import apiClient from './client';
import { UserProfile, ApiResponse } from '../types';

export interface AuthLoginResponse {
  token?: string;
  user?: UserProfile;
  data?: UserProfile;
}

export const authApi = {
  login: async (email: string, phone?: string): Promise<AuthLoginResponse> => {
    const response = await apiClient.post<ApiResponse<UserProfile> & { token?: string; user?: UserProfile }>('/auth/login', { email, phone });
    if (response.data && response.data.token) {
      localStorage.setItem('byd_auth_token', response.data.token);
    }
    const userObj = response.data.data || response.data.user;
    return {
      token: response.data.token,
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
  }
};
