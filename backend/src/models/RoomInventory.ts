import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoomInventory extends Document {
  hotelId: string;
  roomTypeId: string;
  roomNumberOrUnitId: string;
  status: 'AVAILABLE' | 'MAINTENANCE' | 'BLOCKED';
  createdAt: Date;
}

const RoomInventorySchema = new Schema<IRoomInventory>({
  hotelId: { type: String, required: true, index: true },
  roomTypeId: { type: String, required: true, index: true },
  roomNumberOrUnitId: { type: String, required: true },
  status: { type: String, enum: ['AVAILABLE', 'MAINTENANCE', 'BLOCKED'], default: 'AVAILABLE' },
  createdAt: { type: Date, default: Date.now }
});

export const RoomInventoryModel: Model<IRoomInventory> = (mongoose.models.RoomInventory || mongoose.model<IRoomInventory>('RoomInventory', RoomInventorySchema)) as any;
