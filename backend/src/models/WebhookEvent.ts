import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWebhookEvent extends Document {
  eventId: string;
  eventType: string;
  status: 'RECEIVED' | 'PROCESSED' | 'FAILED';
  processedAt?: Date;
  error?: string;
  createdAt: Date;
}

const WebhookEventSchema = new Schema<IWebhookEvent>({
  eventId: { type: String, required: true, unique: true, index: true },
  eventType: { type: String, required: true },
  status: { type: String, enum: ['RECEIVED', 'PROCESSED', 'FAILED'], default: 'RECEIVED', index: true },
  processedAt: { type: Date },
  error: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 } // TTL index 30 days
});

export const WebhookEventModel: Model<IWebhookEvent> = 
  (mongoose.models.WebhookEvent || mongoose.model<IWebhookEvent>('WebhookEvent', WebhookEventSchema)) as any;
