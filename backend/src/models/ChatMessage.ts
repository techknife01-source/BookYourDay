import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatMessage extends Document {
  conversationId: string;
  senderId: string;
  senderRole: 'user' | 'admin';
  senderName: string;
  senderEmail?: string;
  recipientId: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true, index: true },
  senderRole: { type: String, enum: ['user', 'admin'], required: true },
  senderName: { type: String, required: true },
  senderEmail: { type: String },
  recipientId: { type: String, required: true, index: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

ChatMessageSchema.index({ conversationId: 1, createdAt: 1 });

export const ChatMessageModel: Model<IChatMessage> =
  (mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema)) as any;
