import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'BOOKING_CONFIRMED',
      'PAYMENT_SUCCESS',
      'PAYMENT_FAILED',
      'BOOKING_CANCELLED',
      'REFUND_PROCESSED',
      'REMINDER',
      'OFFER',
      'SYSTEM'
    ],
    default: 'SYSTEM'
  },
  link: { type: String },
  metadata: { type: Schema.Types.Mixed },
  isRead: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

export const NotificationModel: Model<INotification> =
  (mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)) as any;
