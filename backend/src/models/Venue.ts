import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVenue extends Document {
  name: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  facilities: string[];
  totalScreens: number;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
}

const VenueSchema = new Schema<IVenue>({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true, index: true },
  state: { type: String },
  zipCode: { type: String },
  facilities: [{ type: String }],
  totalScreens: { type: Number, default: 1 },
  latitude: { type: Number },
  longitude: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

export const VenueModel: Model<IVenue> = (mongoose.models.Venue || mongoose.model<IVenue>('Venue', VenueSchema)) as any;
