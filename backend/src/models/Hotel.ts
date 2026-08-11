import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHotel extends Document {
  partnerId: string;
  name: string;
  description: string;
  images: string[];
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: 'FREE_CANCELLATION' | 'PARTIAL_REFUND' | 'NON_REFUNDABLE';
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'PAUSED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const HotelSchema = new Schema<IHotel>({
  partnerId: { type: String, required: true, index: true },
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  address: { type: String, required: true },
  city: { type: String, required: true, index: true },
  state: { type: String, default: 'West Bengal' },
  country: { type: String, default: 'India' },
  latitude: { type: Number, default: 22.5726 },
  longitude: { type: Number, default: 88.3639 },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 120 },
  amenities: [{ type: String }],
  checkInTime: { type: String, default: '14:00' },
  checkOutTime: { type: String, default: '11:00' },
  cancellationPolicy: {
    type: String,
    enum: ['FREE_CANCELLATION', 'PARTIAL_REFUND', 'NON_REFUNDABLE'],
    default: 'FREE_CANCELLATION'
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'PAUSED', 'REJECTED'],
    default: 'PUBLISHED',
    index: true
  }
}, { timestamps: true });

HotelSchema.index({ name: 'text', description: 'text', city: 'text' });

export const HotelModel: Model<IHotel> = (mongoose.models.Hotel || mongoose.model<IHotel>('Hotel', HotelSchema)) as any;
