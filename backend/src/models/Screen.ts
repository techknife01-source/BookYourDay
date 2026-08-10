import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IScreen extends Document {
  venueId: mongoose.Types.ObjectId | string;
  name: string; // e.g. "Screen 1 - Dolby Atmos"
  format: string[]; // e.g. ["2D", "3D", "IMAX", "Dolby Atmos"]
  totalSeats: number;
  seatLayoutRows: { rowLabel: string; seatsCount: number; category: 'EXECUTIVE' | 'VIP' | 'RECLINER'; price: number }[];
  createdAt: Date;
}

const ScreenSchema = new Schema<IScreen>({
  venueId: { type: Schema.Types.ObjectId, ref: 'Venue', required: true, index: true },
  name: { type: String, required: true },
  format: [{ type: String }],
  totalSeats: { type: Number, required: true },
  seatLayoutRows: [
    {
      rowLabel: { type: String, required: true },
      seatsCount: { type: Number, required: true },
      category: { type: String, enum: ['EXECUTIVE', 'VIP', 'RECLINER'], default: 'VIP' },
      price: { type: Number, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export const ScreenModel: Model<IScreen> = (mongoose.models.Screen || mongoose.model<IScreen>('Screen', ScreenSchema)) as any;
