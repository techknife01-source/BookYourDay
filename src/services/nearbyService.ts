import { CatalogItem } from '../types';

export interface NearbyParams {
  lat?: number;
  lng?: number;
  radius?: number;
  city?: string;
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface NearbyResponse {
  success: boolean;
  data: {
    results: CatalogItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    searchParams?: {
      lat: number | null;
      lng: number | null;
      radiusKm: number;
      city: string | null;
      category: string;
      hasCoords: boolean;
    };
  };
  message?: string;
}

export class NearbyService {
  static async fetchNearby(params: NearbyParams): Promise<NearbyResponse> {
    const query = new URLSearchParams();
    if (params.lat !== undefined) query.set('lat', params.lat.toString());
    if (params.lng !== undefined) query.set('lng', params.lng.toString());
    if (params.radius !== undefined) query.set('radius', params.radius.toString());
    if (params.city) query.set('city', params.city);
    if (params.q) query.set('q', params.q);
    if (params.category) query.set('category', params.category);
    if (params.minPrice !== undefined) query.set('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) query.set('maxPrice', params.maxPrice.toString());
    if (params.minRating !== undefined) query.set('minRating', params.minRating.toString());
    if (params.availability) query.set('availability', params.availability);
    if (params.sort) query.set('sort', params.sort);
    if (params.page !== undefined) query.set('page', params.page.toString());
    if (params.limit !== undefined) query.set('limit', params.limit.toString());

    try {
      const response = await fetch(`/api/nearby?${query.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('Fallback fetching nearby items due to network error', error);
      // Fallback empty structure
      return {
        success: true,
        data: {
          results: [],
          pagination: { page: 1, limit: 12, total: 0, totalPages: 1 }
        }
      };
    }
  }
}
