import apiClient from './client';
import { UserProfile, ApiResponse } from '../types';

export const userApi = {
  getProfile: async (): Promise<UserProfile | null> => {
    try {
      const res = await apiClient.get<ApiResponse<UserProfile>>('/users/profile');
      if (res.data && res.data.success && res.data.data) {
        return res.data.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    const res = await apiClient.patch<ApiResponse<UserProfile>>('/users/profile', updates);
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return null;
  },

  getWishlist: async (): Promise<string[]> => {
    try {
      const res = await apiClient.get<ApiResponse<string[]>>('/users/wishlist');
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  addToWishlist: async (itemId: string, category?: string): Promise<string[]> => {
    const res = await apiClient.post<ApiResponse<string[]>>('/users/wishlist', { itemId, category });
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  },

  removeFromWishlist: async (itemId: string): Promise<string[]> => {
    const res = await apiClient.delete<ApiResponse<string[]>>(`/users/wishlist/${itemId}`);
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  }
};
