import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  transactionId: string;
  bookingId: mongoose.Types.ObjectId | string;
  userId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  gatewayResponseCode?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'REFUND_PENDING' | 'REFUND_FAILED';
  failureReason?: string;
  refundId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  transactionId: { type: String, required: true, unique: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  userId: { type: String, required: true, index: true },
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: { type: String, index: true },
  razorpaySignature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String, default: 'UPI' },
  gatewayResponseCode: { type: String },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'REFUND_PENDING', 'REFUND_FAILED'], default: 'PENDING' },
  failureReason: { type: String },
  refundId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const PaymentModel: Model<IPayment> = (mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)) as any;

