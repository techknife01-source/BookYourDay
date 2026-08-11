import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  phone?: string;
  role: 'user' | 'partner' | 'admin';
  status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  walletBalance: number;
  isMemberPlus: boolean;
  savedCity: string;
  wishlist: string[];
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String },
  phone: { type: String },
  role: { type: String, enum: ['user', 'partner', 'admin'], default: 'user' },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'], default: 'ACTIVE', index: true },
  walletBalance: { type: Number, default: 0 },
  isMemberPlus: { type: Boolean, default: false },
  savedCity: { type: String, default: 'Asansol' },
  wishlist: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export const UserModel: Model<IUser> = (mongoose.models.User || mongoose.model<IUser>('User', UserSchema)) as any;
