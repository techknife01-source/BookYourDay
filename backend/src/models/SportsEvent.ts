import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISportsEvent extends Document {
  title: string;
  sportType: string; // e.g., 'Cricket', 'Football', 'F1', 'Tennis'
  teamsOrPlayers: string[];
  image: string;
  backdrop?: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  startingPrice: number;
  rating: number;
  organizer: string;
  description: string;
  ticketTiers: { id: string; name: string; price: number; description: string; availableQuantity: number }[];
  isTrending?: boolean;
  partnerId?: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'PAUSED';
}

const SportsEventSchema = new Schema<ISportsEvent>({
  title: { type: String, required: true },
  sportType: { type: String, required: true },
  teamsOrPlayers: [{ type: String }],
  image: { type: String, required: true },
  backdrop: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  city: { type: String, required: true, index: true },
  startingPrice: { type: Number, required: true },
  rating: { type: Number, default: 4.8 },
  organizer: { type: String, required: true },
  description: { type: String, required: true },
  ticketTiers: [{ id: String, name: String, price: Number, description: String, availableQuantity: Number }],
  isTrending: { type: Boolean, default: false },
  partnerId: { type: String, index: true },
  status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'PAUSED'], default: 'PUBLISHED', index: true }
});

SportsEventSchema.index({ title: 1, city: 1, startingPrice: 1, rating: -1 });

export const SportsEventModel: Model<ISportsEvent> = (mongoose.models.SportsEvent || mongoose.model<ISportsEvent>('SportsEvent', SportsEventSchema)) as any;
