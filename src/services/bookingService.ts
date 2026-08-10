import { Booking, CategoryType, NotificationItem, UserProfile } from '../types';
import { bookingsApi } from '../api/bookingsApi';
import { userApi } from '../api/userApi';

const CITY_KEY = 'byd_saved_city_v1';
const NOTIFS_KEY = 'byd_notifs_v1';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Welcome to Book Your Day! 🎉',
    message: 'Explore movies, live events, sports, dining and attractions across cities.',
    timestamp: '2 hours ago',
    type: 'system',
    isRead: false
  }
];

export class BookingService {
  static getSavedCity(): string {
    const saved = localStorage.getItem(CITY_KEY);
    return saved || 'Asansol';
  }

  static setSavedCity(city: string): void {
    localStorage.setItem(CITY_KEY, city);
  }

  // Bookings - Direct backend interaction
  static async getBookingsAsync(): Promise<Booking[]> {
    try {
      return await bookingsApi.getUserBookings();
    } catch (err) {
      console.warn('Backend bookings fetch error:', err);
      return [];
    }
  }

  static async getBookingByIdAsync(bookingId: string): Promise<Booking | null> {
    try {
      return await bookingsApi.getBookingById(bookingId);
    } catch (err) {
      console.warn('Backend get booking by id error:', err);
      return null;
    }
  }

  static async validateCouponAsync(code: string, category?: string, bookingAmount?: number) {
    return await bookingsApi.validateCoupon(code, category, bookingAmount);
  }

  static async createBookingAsync(bookingData: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt' | 'qrCodeData'>): Promise<Booking> {
    const created = await bookingsApi.createBooking(bookingData as any);
    this.addNotification({
      id: `n_${Date.now()}`,
      title: 'Booking Confirmed! 🎉',
      message: `Your booking for ${created.itemTitle} (#${created.bookingNumber}) is confirmed.`,
      timestamp: 'Just now',
      type: 'booking',
      isRead: false
    });
    return created;
  }

  static async cancelBookingAsync(bookingId: string): Promise<boolean> {
    try {
      await bookingsApi.cancelBooking(bookingId);
      this.addNotification({
        id: `n_${Date.now()}`,
        title: 'Booking Cancelled',
        message: `Booking #${bookingId} was cancelled. Refund initiated.`,
        timestamp: 'Just now',
        type: 'booking',
        isRead: false
      });
      return true;
    } catch (err) {
      console.warn('Backend cancel booking error:', err);
      return false;
    }
  }

  static transferTicket(bookingId: string, recipientContact: string): boolean {
    this.addNotification({
      id: `n_${Date.now()}`,
      title: 'Ticket Transferred',
      message: `Ticket #${bookingId} transferred to ${recipientContact}.`,
      timestamp: 'Just now',
      type: 'booking',
      isRead: false
    });
    return true;
  }

  // Wishlist - Backend API authoritative store
  static async getWishlistAsync(): Promise<{ id: string; category: CategoryType }[]> {
    try {
      const wishlistRaw = await userApi.getWishlist();
      return wishlistRaw.map((entry) => {
        if (entry.includes(':')) {
          const [id, category] = entry.split(':');
          return { id, category: category.toLowerCase() as CategoryType };
        }
        return { id: entry, category: 'movies' as CategoryType };
      });
    } catch (err) {
      console.warn('Backend wishlist fetch error:', err);
      return [];
    }
  }

  static async toggleWishlistAsync(id: string, category: CategoryType): Promise<boolean> {
    try {
      const current = await this.getWishlistAsync();
      const exists = current.some(item => item.id === id);
      if (exists) {
        await userApi.removeFromWishlist(id);
        return false;
      } else {
        await userApi.addToWishlist(id, category);
        return true;
      }
    } catch (err) {
      console.warn('Wishlist toggle error:', err);
      return false;
    }
  }

  // User Profile - Backend API authoritative store
  static async getUserProfileAsync(): Promise<UserProfile | null> {
    try {
      return await userApi.getProfile();
    } catch (err) {
      console.warn('Backend user profile fetch error:', err);
      return null;
    }
  }

  static async updateUserProfileAsync(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      return await userApi.updateProfile(updates);
    } catch (err) {
      console.warn('Backend profile update error:', err);
      return null;
    }
  }

  // Notifications - Local session helper
  static getNotifications(): NotificationItem[] {
    const saved = localStorage.getItem(NOTIFS_KEY);
    if (!saved) {
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  static addNotification(item: NotificationItem): void {
    const notifs = this.getNotifications();
    notifs.unshift(item);
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
  }

  static markNotificationsRead(): void {
    const notifs = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
  }

  // Synchronous fallbacks for legacy components
  static createBooking(bookingData: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt' | 'qrCodeData'>): Booking {
    const newBooking: Booking = {
      ...bookingData,
      id: `bk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      bookingNumber: `BYD-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      qrCodeData: `https://bookyourday.com/ticket/${Date.now()}`
    };
    this.createBookingAsync(bookingData).catch(console.error);
    return newBooking;
  }

  static toggleWishlist(id: string, category: CategoryType): boolean {
    this.toggleWishlistAsync(id, category).catch(console.error);
    return true;
  }

  static isInWishlist(id: string, category?: CategoryType): boolean {
    return false;
  }

  static getWishlist(): { id: string; category: CategoryType }[] {
    return [];
  }

  static getBookings(): Booking[] {
    return [];
  }

  static getUserProfile(): UserProfile {
    return {
      id: 'usr_101',
      name: 'Alex Mercer',
      email: 'alex.mercer@example.com',
      phone: '+1 (555) 234-5678',
      walletBalance: 450,
      isMemberPlus: true,
      savedCity: this.getSavedCity()
    };
  }
}
