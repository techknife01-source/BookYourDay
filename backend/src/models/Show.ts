import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShow extends Document {
  movieId: mongoose.Types.ObjectId | string;
  venueId: mongoose.Types.ObjectId | string;
  screenId: mongoose.Types.ObjectId | string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "18:30"
  endTime: string;
  language: string;
  format: string; // e.g. "IMAX 3D"
  priceCategories: { category: string; price: number }[];
  bookedSeats: string[]; // e.g. ["A1", "A2"]
  lockedSeats: { seatId: string; userId: string; lockedAt: Date }[];
  createdAt: Date;
}

const ShowSchema = new Schema<IShow>({
  movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
  venueId: { type: Schema.Types.ObjectId, ref: 'Venue', required: true, index: true },
  screenId: { type: Schema.Types.ObjectId, ref: 'Screen', required: true },
  date: { type: String, required: true, index: true },
  startTime: { type: String, required: true },
  endTime: { type: String },
  language: { type: String, default: 'English' },
  format: { type: String, default: '2D' },
  priceCategories: [{ category: String, price: Number }],
  bookedSeats: [{ type: String }],
  lockedSeats: [{ seatId: String, userId: String, lockedAt: Date }],
  createdAt: { type: Date, default: Date.now }
});

export const ShowModel: Model<IShow> = (mongoose.models.Show || mongoose.model<IShow>('Show', ShowSchema)) as any;
