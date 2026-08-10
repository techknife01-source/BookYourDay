import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPartner extends Document {
  userId: string;
  businessName: string;
  category: string;
  city: string;
  verified: boolean;
  totalListings: number;
  totalTicketsSold: number;
  totalRevenue: number;
  createdAt: Date;
}

const PartnerSchema = new Schema<IPartner>({
  userId: { type: String, required: true },
  businessName: { type: String, required: true },
  category: { type: String, required: true },
  city: { type: String, required: true },
  verified: { type: Boolean, default: true },
  totalListings: { type: Number, default: 0 },
  totalTicketsSold: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const PartnerModel: Model<IPartner> = (mongoose.models.Partner || mongoose.model<IPartner>('Partner', PartnerSchema)) as any;
