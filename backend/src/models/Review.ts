import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  itemType: string;
  itemId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  likesCount: number;
  helpfulCount: number;
  helpfulUsers: string[];
  verifiedBooking: boolean;
  bookingId?: string;
  photos: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  itemType: { type: String, required: true, index: true },
  itemId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  userEmail: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  likesCount: { type: Number, default: 0 },
  helpfulCount: { type: Number, default: 0 },
  helpfulUsers: [{ type: String }],
  verifiedBooking: { type: Boolean, default: false },
  bookingId: { type: String },
  photos: [{ type: String }],
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'APPROVED', index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ReviewSchema.index({ itemId: 1, status: 1 });
ReviewSchema.index({ userId: 1, itemId: 1 }, { unique: true });

export const ReviewModel: Model<IReview> =
  (mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)) as any;
