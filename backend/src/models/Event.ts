import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  category: string;
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
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  backdrop: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  city: { type: String, required: true },
  startingPrice: { type: Number, required: true },
  rating: { type: Number, default: 4.8 },
  organizer: { type: String, required: true },
  description: { type: String, required: true },
  ticketTiers: [{ id: String, name: String, price: Number, description: String, availableQuantity: Number }],
  isTrending: { type: Boolean, default: false }
});

EventSchema.index({ title: 1, city: 1, startingPrice: 1, rating: -1 });

export const EventModel: Model<IEvent> = (mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema)) as any;
