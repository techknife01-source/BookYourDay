import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISeat extends Document {
  screenId: mongoose.Types.ObjectId | string;
  seatNumber: string; // e.g. "A1", "C5"
  rowLabel: string; // "A", "B", "C"
  columnIndex: number;
  category: 'EXECUTIVE' | 'VIP' | 'RECLINER';
  isWheelchairAccessible?: boolean;
}

const SeatSchema = new Schema<ISeat>({
  screenId: { type: Schema.Types.ObjectId, ref: 'Screen', required: true, index: true },
  seatNumber: { type: String, required: true },
  rowLabel: { type: String, required: true },
  columnIndex: { type: Number, required: true },
  category: { type: String, enum: ['EXECUTIVE', 'VIP', 'RECLINER'], default: 'VIP' },
  isWheelchairAccessible: { type: Boolean, default: false }
});

export const SeatModel: Model<ISeat> = (mongoose.models.Seat || mongoose.model<ISeat>('Seat', SeatSchema)) as any;
