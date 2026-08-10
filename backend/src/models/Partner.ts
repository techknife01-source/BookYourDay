import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPartner extends Document {
  userId: string;
  businessName: string;
  businessType: string;
  description?: string;
  email: string;
  phone?: string;
  address?: string;
  city: string;
  state?: string;
  country?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason?: string;
  verified: boolean;
  totalListings: number;
  totalTicketsSold: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerSchema = new Schema<IPartner>({
  userId: { type: String, required: true, index: true },
  businessName: { type: String, required: true },
  businessType: { type: String, required: true },
  description: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  city: { type: String, required: true },
  state: { type: String, default: 'West Bengal' },
  country: { type: String, default: 'India' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'], default: 'PENDING', index: true },
  rejectionReason: { type: String },
  verified: { type: Boolean, default: false },
  totalListings: { type: Number, default: 0 },
  totalTicketsSold: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const PartnerModel: Model<IPartner> = (mongoose.models.Partner || mongoose.model<IPartner>('Partner', PartnerSchema)) as any;
