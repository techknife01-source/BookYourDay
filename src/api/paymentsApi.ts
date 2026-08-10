import apiClient from './client';
import { ApiResponse, Booking } from '../types';

export interface RazorpayOrderData {
  orderId: string;
  amount: number; // in paise
  currency: string;
  keyId?: string;
  bookingId: string;
  bookingNumber: string;
  totalAmount: number;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId: string;
}

export interface PaymentRecord {
  id: string;
  transactionId: string;
  bookingId: any;
  userId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export const paymentsApi = {
  createPaymentOrder: async (checkoutData: any): Promise<RazorpayOrderData> => {
    const response = await apiClient.post<ApiResponse<RazorpayOrderData>>('/payments/create-order', checkoutData);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || response.data?.error?.details || 'Failed to create Razorpay payment order');
  },

  verifyPayment: async (payload: VerifyPaymentPayload): Promise<Booking> => {
    const response = await apiClient.post<ApiResponse<Booking>>('/payments/verify', payload);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || 'Payment verification failed');
  },

  getPaymentHistory: async (): Promise<PaymentRecord[]> => {
    const response = await apiClient.get<ApiResponse<PaymentRecord[]>>('/payments/history');
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  }
};
