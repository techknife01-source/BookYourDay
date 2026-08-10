import { apiClient } from './client';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PartnerProfile {
  id?: string;
  _id?: string;
  userId: string;
  businessName: string;
  businessType: string;
  description?: string;
  email: string;
  phone?: string;
  address?: string;
  city: string;
  state?: string;
  country?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason?: string;
  verified: boolean;
  totalListings: number;
  totalTicketsSold: number;
  totalRevenue: number;
  createdAt: string;
}

export interface PartnerStats {
  grossBookingValue: number;
  successfulBookingsCount: number;
  cancelledBookingsCount: number;
  refundsCount: number;
  refundsAmount: number;
  totalListingsCount: number;
}

export interface PartnerListing {
  id: string;
  _id?: string;
  title?: string;
  name?: string;
  category: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'PAUSED';
  price?: number;
  startingPrice?: number;
  entryPrice?: number;
  costForTwo?: number;
  pricePerPerson?: number;
  city?: string;
  date?: string;
}

export interface PartnerBooking {
  id: string;
  bookingNumber: string;
  itemTitle: string;
  category: string;
  date: string;
  time: string;
  seatsOrTicketsDetails: string;
  quantity: number;
  totalAmount: number;
  status: string;
  customerName: string;
  createdAt: string;
}

export const partnerApi = {
  applyPartner: async (data: any): Promise<PartnerProfile> => {
    const res = await apiClient.post<ApiResponse<PartnerProfile>>('/partner/apply', data);
    return res.data.data;
  },

  getPartnerProfile: async (): Promise<PartnerProfile | null> => {
    try {
      const res = await apiClient.get<ApiResponse<PartnerProfile>>('/partner/me');
      return res.data.data || null;
    } catch {
      return null;
    }
  },

  getDashboard: async (): Promise<{ partner: PartnerProfile; stats: PartnerStats; recentListings: PartnerListing[] }> => {
    const res = await apiClient.get<any>('/partner/stats');
    return res.data;
  },

  getListings: async (): Promise<PartnerListing[]> => {
    const res = await apiClient.get<ApiResponse<PartnerListing[]>>('/partner/listings');
    return res.data.data || [];
  },

  createListing: async (data: any): Promise<PartnerListing> => {
    const res = await apiClient.post<ApiResponse<PartnerListing>>('/partner/listings', data);
    return res.data.data;
  },

  updateListingStatus: async (category: string, id: string, status: string): Promise<any> => {
    const res = await apiClient.patch<ApiResponse<any>>(`/partner/listings/${category}/${id}/status`, { status });
    return res.data;
  },

  getPartnerBookings: async (): Promise<PartnerBooking[]> => {
    const res = await apiClient.get<ApiResponse<PartnerBooking[]>>('/partner/bookings');
    return res.data.data || [];
  },

  getPartnerRevenue: async (): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>('/partner/revenue');
    return res.data.data;
  },

  getAllPartnersAdmin: async (status?: string): Promise<PartnerProfile[]> => {
    const res = await apiClient.get<ApiResponse<PartnerProfile[]>>('/partner/admin/all', { params: { status } });
    return res.data.data || [];
  },

  updatePartnerStatusAdmin: async (partnerId: string, status: string, rejectionReason?: string): Promise<PartnerProfile> => {
    const res = await apiClient.patch<ApiResponse<PartnerProfile>>(`/partner/admin/${partnerId}/status`, { status, rejectionReason });
    return res.data.data;
  }
};
