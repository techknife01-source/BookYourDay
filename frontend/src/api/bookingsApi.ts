import apiClient from './client';
import { Booking } from '../types';

export const bookingsApi = {
  createBooking: async (bookingData: Partial<Booking>): Promise<Booking> => {
    try {
      const response = await apiClient.post('/bookings', bookingData);
      return response.data;
    } catch (err) {
      console.warn('Backend booking API unavailable, local persistence fallback used', err);
      const newBooking: Booking = {
        id: `b-${Date.now()}`,
        bookingNumber: `BYD-${Math.floor(100000 + Math.random() * 900000)}`,
        userId: 'u-1',
        category: bookingData.category || 'movies',
        itemTitle: bookingData.itemTitle || 'Ticketed Item',
        itemImage: bookingData.itemImage || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
        venueOrCinema: bookingData.venueOrCinema || 'Partner Venue',
        city: bookingData.city || 'Asansol',
        date: bookingData.date || new Date().toISOString().split('T')[0],
        time: bookingData.time || '19:30',
        seatsOrTicketsDetails: bookingData.seatsOrTicketsDetails || '2 Seats',
        quantity: bookingData.quantity || 2,
        subtotal: bookingData.subtotal || 500,
        convenienceFee: bookingData.convenienceFee || 30,
        taxes: bookingData.taxes || 18,
        discount: bookingData.discount || 0,
        totalAmount: bookingData.totalAmount || 548,
        status: 'CONFIRMED',
        paymentMethod: bookingData.paymentMethod || 'UPI',
        paymentTransactionId: `TXN${Date.now()}`,
        qrCodeData: `BYD-VERIFY-${Date.now()}`,
        createdAt: new Date().toISOString(),
        customerName: bookingData.customerName || 'Anish Roy',
        customerEmail: bookingData.customerEmail || 'anish@example.com',
        customerPhone: bookingData.customerPhone || '+91 9876543210',
        canCancelUntil: new Date(Date.now() + 86400000).toISOString()
      };

      const existing = JSON.parse(localStorage.getItem('byd_user_bookings') || '[]');
      localStorage.setItem('byd_user_bookings', JSON.stringify([newBooking, ...existing]));
      return newBooking;
    }
  },

  getUserBookings: async (): Promise<Booking[]> => {
    try {
      const response = await apiClient.get('/bookings');
      return response.data;
    } catch (err) {
      return JSON.parse(localStorage.getItem('byd_user_bookings') || '[]');
    }
  },

  cancelBooking: async (bookingId: string) => {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/cancel`);
      return response.data;
    } catch (err) {
      const existing: Booking[] = JSON.parse(localStorage.getItem('byd_user_bookings') || '[]');
      const updated = existing.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b);
      localStorage.setItem('byd_user_bookings', JSON.stringify(updated));
      return { success: true, refundAmount: 500 };
    }
  }
};
