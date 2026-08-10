import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  maxDiscountAmount?: number;
  minBookingAmount: number;
  validUntil: Date;
  isActive: boolean;
}

const CouponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, required: true },
  discountType: { type: String, enum: ['PERCENTAGE', 'FLAT'], required: true },
  discountValue: { type: Number, required: true },
  maxDiscountAmount: { type: Number },
  minBookingAmount: { type: Number, default: 0 },
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
});

export const CouponModel: Model<ICoupon> = (mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema)) as any;
