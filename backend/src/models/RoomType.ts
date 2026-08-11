import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoomType extends Document {
  hotelId: string;
  name: string;
  description: string;
  images: string[];
  maxAdults: number;
  maxChildren: number;
  maxGuests: number;
  bedType: string;
  amenities: string[];
  basePrice: number;
  currency: string;
  totalRooms: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const RoomTypeSchema = new Schema<IRoomType>({
  hotelId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  maxAdults: { type: Number, required: true, default: 2 },
  maxChildren: { type: Number, required: true, default: 1 },
  maxGuests: { type: Number, required: true, default: 3 },
  bedType: { type: String, default: '1 King Bed' },
  amenities: [{ type: String }],
  basePrice: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  totalRooms: { type: Number, required: true, default: 5 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

export const RoomTypeModel: Model<IRoomType> = (mongoose.models.RoomType || mongoose.model<IRoomType>('RoomType', RoomTypeSchema)) as any;
