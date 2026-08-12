import apiClient from './client';
import { ApiResponse } from '../types';

export interface TravelPackageItem {
  id: string;
  _id?: string;
  partnerId: string;
  title: string;
  description: string;
  images: string[];
  image?: string;
  origin: string;
  destination: string;
  durationDays: number;
  durationNights: number;
  startingPrice: number;
  pricePerAdult: number;
  pricePerChild: number;
  currency: string;
  inclusions: string[];
  exclusions: string[];
  itinerary: Array<{
    day: number;
    title?: string;
    destination?: string;
    activities?: string[];
    meals?: string[];
    hotel?: string;
    transport?: string;
  }>;
  cancellationPolicy: 'FREE_CANCELLATION' | 'PARTIAL_REFUND' | 'NON_REFUNDABLE';
  maxGuests: number;
  availableCapacity: number;
  rating: number;
  reviewCount: number;
  availableFrom: string;
  availableUntil: string;
  status: string;
}

export interface TravelTransferItem {
  id: string;
  _id?: string;
  partnerId: string;
  title: string;
  origin: string;
  destination: string;
  vehicleType: string;
  description: string;
  images: string[];
  image?: string;
  capacity: number;
  pricePerVehicle: number;
  priceFrom?: number;
  currency: string;
  availableCapacity: number;
  rating: number;
  reviewCount: number;
  cancellationPolicy: 'FREE_CANCELLATION' | 'PARTIAL_REFUND' | 'NON_REFUNDABLE';
  availableFrom: string;
  availableUntil: string;
  status: string;
}

export const travelApi = {
  getPackages: async (params?: Record<string, any>): Promise<TravelPackageItem[]> => {
    try {
      const res = await apiClient.get<ApiResponse<{ packages: TravelPackageItem[] }>>('/travel/packages', { params });
      if (res.data?.success && res.data?.data?.packages) {
        return res.data.data.packages;
      }
      return [];
    } catch (err) {
      console.warn('travelApi getPackages error:', err);
      return [];
    }
  },

  getPackageById: async (id: string): Promise<TravelPackageItem | null> => {
    try {
      const res = await apiClient.get<ApiResponse<TravelPackageItem>>(`/travel/packages/${id}`);
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
      return null;
    } catch (err) {
      console.warn('travelApi getPackageById error:', err);
      return null;
    }
  },

  reservePackage: async (payload: {
    packageId: string;
    departureDate: string;
    adults: number;
    children?: number;
    couponCode?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<any>>('/travel/packages/reserve', payload);
    return res.data;
  },

  getTransfers: async (params?: Record<string, any>): Promise<TravelTransferItem[]> => {
    try {
      const res = await apiClient.get<ApiResponse<{ transfers: TravelTransferItem[] }>>('/travel/transfers', { params });
      if (res.data?.success && res.data?.data?.transfers) {
        return res.data.data.transfers;
      }
      return [];
    } catch (err) {
      console.warn('travelApi getTransfers error:', err);
      return [];
    }
  },

  getTransferById: async (id: string): Promise<TravelTransferItem | null> => {
    try {
      const res = await apiClient.get<ApiResponse<TravelTransferItem>>(`/travel/transfers/${id}`);
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
      return null;
    } catch (err) {
      console.warn('travelApi getTransferById error:', err);
      return null;
    }
  },

  reserveTransfer: async (payload: {
    transferId: string;
    pickupDate: string;
    pickupTime?: string;
    passengerCount: number;
    pickupLocation: string;
    dropLocation: string;
    vehiclesCount?: number;
    couponCode?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<any>>('/travel/transfers/reserve', payload);
    return res.data;
  }
};
