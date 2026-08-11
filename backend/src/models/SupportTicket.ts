import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISupportTicket extends Document {
  userId: string;
  partnerId?: string;
  bookingId?: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedAdmin?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>({
  userId: { type: String, required: true, index: true },
  partnerId: { type: String, index: true },
  bookingId: { type: String, index: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN', index: true },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM', index: true },
  assignedAdmin: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

export const SupportTicketModel: Model<ISupportTicket> =
  (mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema)) as any;
