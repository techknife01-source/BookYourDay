import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  transactionId: string;
  bookingId: mongoose.Types.ObjectId | string;
  userId: string;
  amount: number;
  paymentMethod: 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'WALLET';
  gatewayResponseCode?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  transactionId: { type: String, required: true, unique: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  userId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'WALLET'], default: 'UPI' },
  gatewayResponseCode: { type: String },
  status: { type: String, enum: ['SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'], default: 'SUCCESS' },
  createdAt: { type: Date, default: Date.now }
});

export const PaymentModel: Model<IPayment> = (mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)) as any;
