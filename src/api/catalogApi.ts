import apiClient from './client';
import { CatalogItem, ApiResponse } from '../types';

export const catalogApi = {
  getCatalog: async (params?: { category?: string; city?: string; search?: string; trending?: boolean }): Promise<CatalogItem[]> => {
    try {
      const res = await apiClient.get<ApiResponse<CatalogItem[]>>('/catalog', { params });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.warn('catalogApi getCatalog error:', err);
      return [];
    }
  },

  getByCategory: async (category: string, params?: { city?: string; search?: string }): Promise<CatalogItem[]> => {
    try {
      const res = await apiClient.get<ApiResponse<CatalogItem[]>>(`/catalog/${category}`, { params });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.warn('catalogApi getByCategory error:', err);
      return [];
    }
  },

  getItemById: async (category: string, id: string): Promise<CatalogItem | null> => {
    try {
      const res = await apiClient.get<ApiResponse<CatalogItem>>(`/catalog/${category}/${id}`);
      if (res.data && res.data.success && res.data.data) {
        return res.data.data;
      }
      return null;
    } catch {
      return null;
    }
  }
};
