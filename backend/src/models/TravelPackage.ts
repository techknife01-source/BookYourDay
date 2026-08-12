import mongoose, { Schema, Document } from 'mongoose';

export interface IItineraryDay {
  day: number;
  title?: string;
  destination?: string;
  activities?: string[];
  meals?: string[];
  hotel?: string;
  transport?: string;
}

export interface ITravelPackage extends Document {
  partnerId: string;
  title: string;
  description: string;
  images: string[];
  origin: string;
  destination: string;
  durationDays: number;
  durationNights: number;
  startingPrice: number;
  pricePerAdult: number;
  pricePerChild: number;
  currency: string;
  inclusions: string[];
  exclusions: string[];
  itinerary: IItineraryDay[];
  cancellationPolicy: 'FREE_CANCELLATION' | 'PARTIAL_REFUND' | 'NON_REFUNDABLE';
  maxGuests: number;
  totalCapacity: number;
  availableCapacity: number;
  availableFrom: Date;
  availableUntil: Date;
  rating: number;
  reviewCount: number;
  latitude?: number;
  longitude?: number;
  locationGeo?: { type: 'Point'; coordinates: number[] };
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'PAUSED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const TravelPackageSchema: Schema = new Schema(
  {
    partnerId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], default: [] },
    origin: { type: String, required: true, index: true },
    destination: { type: String, required: true, index: true },
    durationDays: { type: Number, required: true, default: 1 },
    durationNights: { type: Number, required: true, default: 0 },
    startingPrice: { type: Number, required: true, min: 0 },
    pricePerAdult: { type: Number, required: true, min: 0 },
    pricePerChild: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR' },
    inclusions: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },
    itinerary: [
      {
        day: { type: Number, required: true },
        title: { type: String },
        destination: { type: String },
        activities: { type: [String], default: [] },
        meals: { type: [String], default: [] },
        hotel: { type: String },
        transport: { type: String }
      }
    ],
    cancellationPolicy: {
      type: String,
      enum: ['FREE_CANCELLATION', 'PARTIAL_REFUND', 'NON_REFUNDABLE'],
      default: 'FREE_CANCELLATION'
    },
    maxGuests: { type: Number, default: 10 },
    totalCapacity: { type: Number, required: true, default: 50 },
    availableCapacity: { type: Number, required: true, default: 50 },
    availableFrom: { type: Date, required: true },
    availableUntil: { type: Date, required: true },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 45 },
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

TravelPackageSchema.index({ locationGeo: '2dsphere' }, { sparse: true });

export const TravelPackageModel = mongoose.model<ITravelPackage>('TravelPackage', TravelPackageSchema);
