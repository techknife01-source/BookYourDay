import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHotelReservation extends Document {
  bookingId: string;
  hotelId: string;
  roomTypeId: string;
  inventoryId: string;
  userId: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  totalPrice: number;
  status: 'PAYMENT_PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  expiresAt?: Date;
  createdAt: Date;
}

const HotelReservationSchema = new Schema<IHotelReservation>({
  bookingId: { type: String, required: true, index: true },
  hotelId: { type: String, required: true, index: true },
  roomTypeId: { type: String, required: true, index: true },
  inventoryId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  checkIn: { type: Date, required: true, index: true },
  checkOut: { type: Date, required: true, index: true },
  nights: { type: Number, required: true },
  rooms: { type: Number, required: true, default: 1 },
  adults: { type: Number, required: true },
  children: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PAYMENT_PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED'],
    default: 'PAYMENT_PENDING',
    index: true
  },
  expiresAt: { type: Date, index: true },
  createdAt: { type: Date, default: Date.now }
});

HotelReservationSchema.index({ inventoryId: 1, status: 1, checkIn: 1, checkOut: 1 });

export const HotelReservationModel: Model<IHotelReservation> = (mongoose.models.HotelReservation || mongoose.model<IHotelReservation>('HotelReservation', HotelReservationSchema)) as any;
