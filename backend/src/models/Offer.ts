import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  bankPartner: string; // e.g., 'HDFC Bank', 'ICICI Bank', 'Amazon Pay'
  bannerImage: string;
  offerCode: string;
  description: string;
  discountSummary: string;
  categoryApplicable: string; // e.g. 'Movies', 'Events', 'All'
  validUntil: string;
  isActive: boolean;
}

const OfferSchema = new Schema<IOffer>({
  title: { type: String, required: true },
  bankPartner: { type: String, required: true },
  bannerImage: { type: String, required: true },
  offerCode: { type: String, required: true },
  description: { type: String, required: true },
  discountSummary: { type: String, required: true },
  categoryApplicable: { type: String, default: 'All' },
  validUntil: { type: String, required: true },
  isActive: { type: Boolean, default: true }
});

export const OfferModel: Model<IOffer> = (mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema)) as any;
