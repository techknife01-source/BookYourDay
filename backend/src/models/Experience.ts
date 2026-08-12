import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExperience extends Document {
  title: string;
  type: string; // e.g. 'Camping', 'Workshop', 'Sailing', 'Helicopter Ride'
  image: string;
  city: string;
  duration: string;
  pricePerPerson: number;
  rating: number;
  description: string;
  highlights: string[];
  isPopular?: boolean;
  latitude?: number;
  longitude?: number;
  locationGeo?: { type: 'Point'; coordinates: number[] };
  partnerId?: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'PAUSED';
}

const ExperienceSchema = new Schema<IExperience>({
  title: { type: String, required: true },
  type: { type: String, required: true },
  image: { type: String, required: true },
  city: { type: String, required: true, index: true },
  duration: { type: String, required: true },
  pricePerPerson: { type: Number, required: true },
  rating: { type: Number, default: 4.8 },
  description: { type: String, required: true },
  highlights: [{ type: String }],
  isPopular: { type: Boolean, default: false },
  latitude: { type: Number },
  longitude: { type: Number },
  locationGeo: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: undefined }
  },
  partnerId: { type: String, index: true },
  status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'PAUSED'], default: 'PUBLISHED', index: true }
});

ExperienceSchema.index({ title: 1, city: 1, pricePerPerson: 1, rating: -1 });
ExperienceSchema.index({ locationGeo: '2dsphere' }, { sparse: true });

export const ExperienceModel: Model<IExperience> = (mongoose.models.Experience || mongoose.model<IExperience>('Experience', ExperienceSchema)) as any;
