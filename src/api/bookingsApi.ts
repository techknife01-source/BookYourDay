import apiClient from './client';
import { Booking, ApiResponse } from '../types';

export const bookingsApi = {
  createBooking: async (bookingData: Partial<Booking>): Promise<Booking> => {
    const response = await apiClient.post<ApiResponse<Booking>>('/bookings', bookingData);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to create booking');
  },

  getUserBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get<ApiResponse<Booking[]>>('/bookings/my');
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  getBookingById: async (bookingId: string): Promise<Booking> => {
    const response = await apiClient.get<ApiResponse<Booking>>(`/bookings/${bookingId}`);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Failed to fetch booking details');
  },

  validateCoupon: async (code: string, category?: string, bookingAmount?: number): Promise<{
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  }> => {
    const response = await apiClient.post<ApiResponse<any>>('/coupons/validate', {
      code,
      category,
      bookingAmount
    });
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Invalid coupon code');
  },

  cancelBooking: async (bookingId: string): Promise<any> => {
    const response = await apiClient.post<ApiResponse>(`/bookings/${bookingId}/cancel`);
    if (response.data && response.data.success) {
      return response.data;
    }
    throw new Error(response.data?.message || 'Failed to cancel booking');
  }
};
