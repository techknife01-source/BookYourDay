import { apiClient } from './client';

export interface OverviewMetrics {
  totalUsers: number;
  totalPartners: number;
  pendingPartnerApplications: number;
  publishedListings: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  grossBookingValue: number;
  successfulPayments: number;
  failedPayments: number;
  refundAmount: number;
  activeTickets: number;
  filterRange: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'partner' | 'admin';
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  walletBalance: number;
  isMemberPlus: boolean;
  savedCity: string;
  createdAt: string;
}

export interface AdminListing {
  _id: string;
  id?: string;
  title?: string;
  name?: string;
  category: string;
  partnerId?: string;
  status: string;
  city?: string;
  price?: number;
  ticketPrice?: number;
  venueName?: string;
  cinemaName?: string;
  createdAt?: string;
}

export interface AdminBooking {
  _id: string;
  id?: string;
  bookingNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  itemTitle: string;
  category: string;
  partnerId?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface AdminPayment {
  _id: string;
  transactionId: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  failureReason?: string;
  refundId?: string;
  createdAt: string;
}

export interface AdminTicket {
  _id: string;
  ticketNumber: string;
  bookingId: string;
  userId: string;
  itemTitle: string;
  venueOrCinema: string;
  seatDetails: string;
  validDate: string;
  validTime: string;
  status: string;
  createdAt: string;
}

export interface AdminCoupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  maxDiscountAmount?: number;
  minBookingAmount: number;
  validUntil: string;
  isActive: boolean;
}

export interface SupportTicket {
  _id: string;
  userId: string;
  partnerId?: string;
  bookingId?: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedAdmin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  actorUserId: string;
  actorRole: string;
  action: string;
  targetId?: string;
  targetType?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export const adminApi = {
  getOverviewMetrics: async (range = '30d', startDate?: string, endDate?: string): Promise<OverviewMetrics> => {
    const res = await apiClient.get('/admin/metrics', {
      params: { range, startDate, endDate }
    });
    return res.data.data;
  },

  getUsers: async (params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/admin/users', { params });
    return res.data.data;
  },

  updateUserStatus: async (userId: string, status: string) => {
    const res = await apiClient.patch(`/admin/users/${userId}/status`, { status });
    return res.data;
  },

  getListings: async (params?: { category?: string; search?: string; status?: string; partnerId?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/admin/listings', { params });
    return res.data.data;
  },

  updateListingStatus: async (category: string, id: string, status: string) => {
    const res = await apiClient.patch(`/admin/listings/${category}/${id}/status`, { status });
    return res.data;
  },

  getBookings: async (params?: { bookingNumber?: string; customer?: string; partnerId?: string; category?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/admin/bookings', { params });
    return res.data.data;
  },

  getBookingById: async (id: string) => {
    const res = await apiClient.get(`/admin/bookings/${id}`);
    return res.data.data;
  },

  getPayments: async (params?: { status?: string; bookingId?: string; userId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/admin/payments', { params });
    return res.data.data;
  },

  getTickets: async (params?: { ticketNumber?: string; bookingNumber?: string; userId?: string; partnerId?: string; category?: string; status?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/admin/tickets', { params });
    return res.data.data;
  },

  getCoupons: async (): Promise<AdminCoupon[]> => {
    const res = await apiClient.get('/admin/coupons');
    return res.data.data;
  },

  createCoupon: async (couponData: Partial<AdminCoupon>) => {
    const res = await apiClient.post('/admin/coupons', couponData);
    return res.data;
  },

  updateCoupon: async (id: string, couponData: Partial<AdminCoupon>) => {
    const res = await apiClient.put(`/admin/coupons/${id}`, couponData);
    return res.data;
  },

  toggleCouponStatus: async (id: string) => {
    const res = await apiClient.patch(`/admin/coupons/${id}/status`);
    return res.data;
  },

  globalSearch: async (q: string) => {
    const res = await apiClient.get('/admin/search', { params: { q } });
    return res.data.data;
  },

  getSupportTickets: async (params?: { status?: string; priority?: string; search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/admin/support', { params });
    return res.data.data;
  },

  updateSupportTicket: async (id: string, data: { status?: string; priority?: string; assignedAdmin?: string }) => {
    const res = await apiClient.patch(`/admin/support/${id}`, data);
    return res.data;
  },

  getAuditLogs: async (params?: any): Promise<AuditLog[]> => {
    const res = await apiClient.get('/admin/audit-logs', { params });
    return res.data.data;
  }
};
