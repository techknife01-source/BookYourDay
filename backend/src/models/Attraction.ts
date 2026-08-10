import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttraction extends Document {
  title: string;
  category: string; // e.g., 'Theme Park', 'Museum', 'Waterpark', 'Heritage'
  image: string;
  city: string;
  address: string;
  timings: string;
  entryPrice: number;
  rating: number;
  description: string;
  inclusions: string[];
  isTrending?: boolean;
  partnerId?: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'PAUSED';
}

const AttractionSchema = new Schema<IAttraction>({
  title: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  city: { type: String, required: true, index: true },
  address: { type: String, required: true },
  timings: { type: String, required: true },
  entryPrice: { type: Number, required: true },
  rating: { type: Number, default: 4.7 },
  description: { type: String, required: true },
  inclusions: [{ type: String }],
  isTrending: { type: Boolean, default: false },
  partnerId: { type: String, index: true },
  status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'PAUSED'], default: 'PUBLISHED', index: true }
});

AttractionSchema.index({ title: 1, city: 1, entryPrice: 1, rating: -1 });

export const AttractionModel: Model<IAttraction> = (mongoose.models.Attraction || mongoose.model<IAttraction>('Attraction', AttractionSchema)) as any;
