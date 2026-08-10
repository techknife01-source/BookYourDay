import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  title: string;
  message: string;
  type: 'BOOKING_CONFIRMED' | 'OFFER' | 'REMINDER' | 'SYSTEM';
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['BOOKING_CONFIRMED', 'OFFER', 'REMINDER', 'SYSTEM'], default: 'SYSTEM' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const NotificationModel: Model<INotification> = (mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)) as any;
