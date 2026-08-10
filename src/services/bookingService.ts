import { Booking, CategoryType, NotificationItem, UserProfile } from '../types';
import { INITIAL_USER_PROFILE, INITIAL_NOTIFICATIONS } from '../data/mockData';

const BOOKINGS_KEY = 'byd_bookings_v1';
const WISHLIST_KEY = 'byd_wishlist_v1';
const CITY_KEY = 'byd_saved_city_v1';
const NOTIFS_KEY = 'byd_notifs_v1';
const PROFILE_KEY = 'byd_profile_v1';

// Pre-seeded default sample booking for instant realistic feedback
const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk_1001',
    bookingNumber: 'BYD-984210',
    userId: 'usr_101',
    category: 'movies',
    itemTitle: 'Echoes of Tomorrow',
    itemImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    venueOrCinema: 'Grand Cineplex Dolby Atmos (Auditorium 3)',
    city: 'Asansol',
    date: '12 Aug 2026',
    time: '05:15 PM',
    seatsOrTicketsDetails: 'Seats E5, E6 (IMAX 3D)',
    quantity: 2,
    subtotal: 960,
    convenienceFee: 40,
    taxes: 80,
    discount: 100,
    totalAmount: 980,
    status: 'CONFIRMED',
    paymentMethod: 'UPI',
    paymentTransactionId: 'TXN_9981245100',
    qrCodeData: 'BYD-984210-E5E6-ECHOES',
    createdAt: '2026-08-09T18:30:00.000Z',
    customerName: 'Alex Mercer',
    customerEmail: 'alex.mercer@example.com',
    customerPhone: '+1 (555) 234-5678'
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

  static getBookings(): Booking[] {
    const saved = localStorage.getItem(BOOKINGS_KEY);
    if (!saved) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_BOOKINGS;
    }
  }

  static createBooking(bookingData: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt' | 'qrCodeData'>): Booking {
    const bookings = this.getBookings();
    const newId = `bk_${Date.now()}`;
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const bookingNumber = `BYD-${randomNumber}`;
    const qrCodeData = `${bookingNumber}-${bookingData.category.toUpperCase()}-${Date.now()}`;

    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      bookingNumber,
      qrCodeData,
      createdAt: new Date().toISOString()
    };

    bookings.unshift(newBooking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

    // Also push a confirmation notification
    this.addNotification({
      id: `n_${Date.now()}`,
      title: 'Booking Confirmed! 🎉',
      message: `Your booking for ${newBooking.itemTitle} (#${newBooking.bookingNumber}) is confirmed.`,
      timestamp: 'Just now',
      type: 'booking',
      isRead: false
    });

    return newBooking;
  }

  static cancelBooking(bookingId: string): boolean {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      bookings[index].status = 'CANCELLED';
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

      this.addNotification({
        id: `n_${Date.now()}`,
        title: 'Booking Cancelled',
        message: `Booking #${bookings[index].bookingNumber} was cancelled. Refund of ₹${bookings[index].totalAmount} initiated.`,
        timestamp: 'Just now',
        type: 'booking',
        isRead: false
      });
      return true;
    }
    return false;
  }

  static transferTicket(bookingId: string, recipientContact: string): boolean {
    const bookings = this.getBookings();
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      this.addNotification({
        id: `n_${Date.now()}`,
        title: 'Ticket Transferred',
        message: `Ticket #${booking.bookingNumber} (${booking.itemTitle}) transferred to ${recipientContact}.`,
        timestamp: 'Just now',
        type: 'booking',
        isRead: false
      });
      return true;
    }
    return false;
  }

  // Wishlist state
  static getWishlist(): { id: string; category: CategoryType }[] {
    const saved = localStorage.getItem(WISHLIST_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }

  static toggleWishlist(id: string, category: CategoryType): boolean {
    const list = this.getWishlist();
    const existingIndex = list.findIndex((item) => item.id === id);
    let added = false;
    if (existingIndex !== -1) {
      list.splice(existingIndex, 1);
    } else {
      list.push({ id, category });
      added = true;
    }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    return added;
  }

  static isInWishlist(id: string): boolean {
    return this.getWishlist().some((item) => item.id === id);
  }

  // Notifications
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

  // User Profile
  static getUserProfile(): UserProfile {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (!saved) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(INITIAL_USER_PROFILE));
      return INITIAL_USER_PROFILE;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_USER_PROFILE;
    }
  }

  static updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    const updated = { ...current, ...updates };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    return updated;
  }
}
