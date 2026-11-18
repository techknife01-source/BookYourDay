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
  },

  getMovieShows: async (movieId: string, params?: { date?: string; city?: string }) => {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>(`/movies/${movieId}/shows`, { params });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.warn('catalogApi getMovieShows error:', err);
      return [];
    }
  },

  getShowSeats: async (showId: string) => {
    try {
      const res = await apiClient.get<ApiResponse<any>>(`/movies/shows/${showId}/seats`);
      if (res.data && res.data.success && res.data.data) {
        return res.data.data;
      }
      return null;
    } catch (err) {
      console.warn('catalogApi getShowSeats error:', err);
      return null;
    }
  },

  getOffers: async (category?: string) => {
    try {
      const params = category && category !== 'all' ? { category } : undefined;
      const res = await apiClient.get<ApiResponse<any[]>>('/coupons/offers', { params });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.warn('catalogApi getOffers error:', err);
      return [];
    }
  },

  getReviews: async (itemId: string) => {
    try {
      const res = await apiClient.get<ApiResponse<any>>(`/reviews/item/${itemId}`);
      if (res.data && res.data.success && res.data.data) {
        return res.data.data;
      }
      return { reviews: [], total: 0, averageRating: 5, distribution: {} };
    } catch (err) {
      console.warn('catalogApi getReviews error:', err);
      return { reviews: [], total: 0, averageRating: 5, distribution: {} };
    }
  },

  submitReview: async (data: { itemId: string; itemType: string; rating: number; title: string; comment: string; photos?: string[] }) => {
    const res = await apiClient.post<ApiResponse<any>>('/reviews', data);
    return res.data;
  },

  markReviewHelpful: async (reviewId: string) => {
    const res = await apiClient.post<ApiResponse<any>>(`/reviews/${reviewId}/helpful`);
    return res.data;
  },

  getRecommendations: async (params?: { category?: string; city?: string; limit?: number }) => {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/catalog/recommendations', { params });
      if (res.data && res.data.success && res.data.data) {
        return res.data.data;
      }
      return { recommended: [], popularNearYou: [], trending: [] };
    } catch (err) {
      console.warn('catalogApi getRecommendations error:', err);
      return { recommended: [], popularNearYou: [], trending: [] };
    }
  }
};
