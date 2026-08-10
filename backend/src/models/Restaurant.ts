import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  cuisine: string[];
  image: string;
  city: string;
  locality: string;
  costForTwo: number;
  discountOffer?: string; // e.g. "Flat 20% OFF on Dining"
  rating: number;
  isBookable: boolean;
  partnerId?: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'PAUSED';
  createdAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>({
  name: { type: String, required: true },
  cuisine: [{ type: String }],
  image: { type: String, required: true },
  city: { type: String, required: true, index: true },
  locality: { type: String, required: true },
  costForTwo: { type: Number, required: true },
  discountOffer: { type: String },
  rating: { type: Number, default: 4.6 },
  isBookable: { type: Boolean, default: true },
  partnerId: { type: String, index: true },
  status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'PAUSED'], default: 'PUBLISHED', index: true },
  createdAt: { type: Date, default: Date.now }
});

RestaurantSchema.index({ name: 1, city: 1, costForTwo: 1, rating: -1 });

export const RestaurantModel: Model<IRestaurant> = (mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema)) as any;
