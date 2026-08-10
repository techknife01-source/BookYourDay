export type CategoryType = 'movies' | 'events' | 'sports' | 'attractions' | 'experiences' | 'dining';

export interface Location {
  id: string;
  name: string;
  state?: string;
  country: string;
  isPopular?: boolean;
}

export interface Movie {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  votesCount: number;
  genre: string[];
  language: string[];
  duration: string;
  releaseDate: string;
  format: string[]; // 2D, 3D, IMAX 3D, 4DX
  description: string;
  cast: { name: string; role: string; avatar: string }[];
  director: string;
  trailerUrl?: string;
  isTrending?: boolean;
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  city: string;
  amenities: string[];
  shows: {
    id: string;
    showtime: string;
    format: string;
    price: number;
    availableSeatsCount: number;
    totalSeatsCount: number;
  }[];
}

export interface EventItem {
  id: string;
  title: string;
  category: string; // Concert, Comedy, Theatre, Festival, Workshop
  image: string;
  backdrop: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  startingPrice: number;
  rating: number;
  organizer: string;
  description: string;
  ticketTiers: {
    id: string;
    name: string;
    price: number;
    description: string;
    availableQuantity: number;
  }[];
  isTrending?: boolean;
}

export interface SportsEvent {
  id: string;
  title: string;
  teams: { name: string; logo: string }[];
  tournament: string;
  sport: string; // Cricket, Football, Basketball, Tennis, Kabaddi
  image: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  startingPrice: number;
  stands: { id: string; name: string; price: number; seatsAvailable: number }[];
  isTrending?: boolean;
}

export interface Attraction {
  id: string;
  title: string;
  category: string; // Theme Park, Water Park, Museum, Zoo, Landmark
  image: string;
  city: string;
  rating: number;
  reviewsCount: number;
  adultPrice: number;
  childPrice: number;
  openingHours: string;
  description: string;
  highlights: string[];
  isTrending?: boolean;
}

export interface Experience {
  id: string;
  title: string;
  category: string; // Escape Room, Bowling, VR Arena, Cooking, Adventure
  image: string;
  city: string;
  rating: number;
  pricePerPerson: number;
  duration: string;
  address: string;
  timeSlots: { time: string; availableCapacity: number; maxCapacity: number }[];
  isTrending?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  image: string;
  city: string;
  address: string;
  rating: number;
  priceForTwo: number;
  priceRange: '$$' | '$$$' | '$$$$';
  openingHours: string;
  availableSlots: string[];
  description: string;
  menuHighlights: string[];
  isTrending?: boolean;
}

export interface Seat {
  id: string; // e.g. "A12"
  row: string; // "A"
  number: number; // 12
  type: 'standard' | 'premium' | 'vip' | 'accessible';
  price: number;
  status: 'available' | 'selected' | 'occupied' | 'locked';
}

export interface Offer {
  id: string;
  title: string;
  code: string;
  description: string;
  category: CategoryType | 'all';
  discountPercentage?: number;
  maxDiscount?: number;
  minAmount?: number;
  flatDiscount?: number;
  validUntil: string;
  bankName?: string;
  bannerBg: string;
}

export interface Booking {
  id: string;
  bookingNumber: string; // e.g. "BYD-984210"
  userId: string;
  category: CategoryType;
  itemTitle: string;
  itemImage: string;
  venueOrCinema: string;
  city: string;
  date: string;
  time: string;
  seatsOrTicketsDetails: string;
  quantity: number;
  subtotal: number;
  convenienceFee: number;
  taxes: number;
  discount: number;
  totalAmount: number;
  status: 'CONFIRMED' | 'PAYMENT_PENDING' | 'CANCELLED' | 'REFUNDED';
  paymentMethod: 'UPI' | 'CREDIT_CARD' | 'NET_BANKING' | 'WALLET';
  paymentTransactionId: string;
  qrCodeData: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  canCancelUntil?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'booking' | 'offer' | 'reminder' | 'system';
  isRead: boolean;
  link?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: 'user' | 'partner' | 'admin';
  walletBalance: number;
  isMemberPlus: boolean;
  memberPlusExpiry?: string;
  savedCity: string;
  wishlist?: string[];
}

export interface CatalogItem {
  id: string;
  category: 'MOVIE' | 'EVENT' | 'SPORTS' | 'ATTRACTION' | 'RESTAURANT' | 'EXPERIENCE';
  title: string;
  description: string;
  image: string;
  backdrop?: string;
  location?: string;
  city?: string;
  rating?: number;
  reviewCount?: number;
  priceFrom?: number;
  currency?: string;
  availability?: 'AVAILABLE' | 'FEW_LEFT' | 'SOLD_OUT';
  metadata: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    details?: any;
  };
}

export interface WishlistItem {
  id: string;
  category: CategoryType;
}

export interface SearchResultItem extends CatalogItem {}

export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchResponseData {
  results: SearchResultItem[];
  pagination: SearchPagination;
}

export interface SearchFilters {
  q?: string;
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  date?: string;
  sort?: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}


