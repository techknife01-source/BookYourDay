import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISeatLock extends Document {
  showId: string;
  seatId: string;
  userId: string;
  lockedAt: Date;
  expiresAt: Date;
}

const SeatLockSchema = new Schema<ISeatLock>({
  showId: { type: String, required: true, index: true },
  seatId: { type: String, required: true },
  userId: { type: String, required: true },
  lockedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expires: '0s' } }
});

export const SeatLockModel: Model<ISeatLock> = (mongoose.models.SeatLock || mongoose.model<ISeatLock>('SeatLock', SeatLockSchema)) as any;
