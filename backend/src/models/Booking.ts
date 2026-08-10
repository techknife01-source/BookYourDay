import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
  bookingNumber: string;
  userId: string;
  category: string;
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
  status: 'CONFIRMED' | 'PAYMENT_PENDING' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED';
  paymentMethod: string;
  paymentTransactionId: string;
  razorpayOrderId?: string;
  expiresAt?: Date;
  qrCodeData: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  showId?: string;
  itemId?: string;
  partnerId?: string;
  idempotencyKey?: string;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  bookingNumber: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  category: { type: String, required: true },
  itemTitle: { type: String, required: true },
  itemImage: { type: String },
  venueOrCinema: { type: String, required: true },
  city: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  seatsOrTicketsDetails: { type: String, required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  convenienceFee: { type: Number, required: true },
  taxes: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['CONFIRMED', 'PAYMENT_PENDING', 'CANCELLED', 'REFUNDED', 'EXPIRED'], default: 'PAYMENT_PENDING' },
  paymentMethod: { type: String, default: 'UPI' },
  paymentTransactionId: { type: String, default: '' },
  razorpayOrderId: { type: String, index: true },
  expiresAt: { type: Date, index: true },
  qrCodeData: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  showId: { type: String, index: true },
  itemId: { type: String, index: true },
  partnerId: { type: String, index: true },
  idempotencyKey: { type: String, index: true },
  createdAt: { type: Date, default: Date.now }
});

export const BookingModel: Model<IBooking> = (mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)) as any;
