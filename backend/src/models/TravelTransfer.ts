import mongoose, { Schema, Document } from 'mongoose';

export interface ITravelTransfer extends Document {
  partnerId: string;
  title: string;
  origin: string;
  destination: string;
  vehicleType: string;
  description: string;
  images: string[];
  capacity: number;
  pricePerVehicle: number;
  currency: string;
  availableFrom: Date;
  availableUntil: Date;
  totalCapacity: number;
  availableCapacity: number;
  rating: number;
  reviewCount: number;
  latitude?: number;
  longitude?: number;
  locationGeo?: { type: 'Point'; coordinates: number[] };
  cancellationPolicy: 'FREE_CANCELLATION' | 'PARTIAL_REFUND' | 'NON_REFUNDABLE';
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'PAUSED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const TravelTransferSchema: Schema = new Schema(
  {
    partnerId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    origin: { type: String, required: true, index: true },
    destination: { type: String, required: true, index: true },
    vehicleType: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], default: [] },
    capacity: { type: Number, required: true, default: 4 }, // Max passengers per vehicle
    pricePerVehicle: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    availableFrom: { type: Date, required: true },
    availableUntil: { type: Date, required: true },
    totalCapacity: { type: Number, required: true, default: 20 },
    availableCapacity: { type: Number, required: true, default: 20 },
    rating: { type: Number, default: 4.7 },
    reviewCount: { type: Number, default: 30 },
    cancellationPolicy: {
      type: String,
      enum: ['FREE_CANCELLATION', 'PARTIAL_REFUND', 'NON_REFUNDABLE'],
      default: 'FREE_CANCELLATION'
    },
    latitude: { type: Number },
    longitude: { type: Number },
    locationGeo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: undefined }
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'PAUSED', 'REJECTED'],
      default: 'SUBMITTED',
      index: true
    }
  },
  { timestamps: true }
);

TravelTransferSchema.index({ locationGeo: '2dsphere' }, { sparse: true });

export const TravelTransferModel = mongoose.model<ITravelTransfer>('TravelTransfer', TravelTransferSchema);
