import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  itemType: 'Movie' | 'Event' | 'Attraction' | 'Restaurant';
  itemId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  likesCount: number;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  itemType: { type: String, enum: ['Movie', 'Event', 'Attraction', 'Restaurant'], required: true },
  itemId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  likesCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const ReviewModel: Model<IReview> = (mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)) as any;
