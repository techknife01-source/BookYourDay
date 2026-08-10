import apiClient from './client';
import { SearchFilters, SearchResponseData, ApiResponse } from '../types';

export const searchApi = {
  search: async (filters: SearchFilters = {}): Promise<SearchResponseData> => {
    const params: Record<string, any> = {};

    if (filters.q !== undefined && filters.q !== '') params.q = filters.q;
    if (filters.category && filters.category !== 'all' && filters.category !== 'ALL') params.category = filters.category;
    if (filters.city) params.city = filters.city;
    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice > 0) params.minPrice = filters.minPrice;
    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice > 0) params.maxPrice = filters.maxPrice;
    if (filters.minRating !== undefined && filters.minRating !== null && filters.minRating > 0) params.minRating = filters.minRating;
    if (filters.date) params.date = filters.date;
    if (filters.sort) params.sort = filters.sort;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    const res = await apiClient.get<ApiResponse<SearchResponseData>>('/search', { params });

    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }

    return {
      results: [],
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 12,
        total: 0,
        totalPages: 1
      }
    };
  }
};
