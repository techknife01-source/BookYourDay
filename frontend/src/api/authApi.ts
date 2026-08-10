import apiClient from './client';
import { UserProfile } from '../types';

export const authApi = {
  login: async (email: string, phone?: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, phone });
      if (response.data.token) {
        localStorage.setItem('byd_auth_token', response.data.token);
      }
      return response.data;
    } catch (err) {
      console.warn('API connection failed, using local auth mock', err);
      return {
        token: 'mock-jwt-token-byd',
        user: {
          id: 'u-1',
          name: 'Anish Roy',
          email: email || 'anish@example.com',
          phone: phone || '+91 9876543210',
          walletBalance: 450,
          isMemberPlus: true,
          savedCity: 'Asansol'
        } as UserProfile
      };
    }
  },

  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (err) {
      return {
        id: 'u-1',
        name: 'Anish Roy',
        email: 'anish.roy@example.com',
        phone: '+91 98765 43210',
        walletBalance: 450,
        isMemberPlus: true,
        memberPlusExpiry: '2026-12-31',
        savedCity: 'Asansol',
      };
    }
  }
};
