import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITicket extends Document {
  bookingId: mongoose.Types.ObjectId | string;
  ticketNumber: string;
  userId: string;
  itemTitle: string;
  venueOrCinema: string;
  seatDetails: string;
  qrCode: string;
  validDate: string;
  validTime: string;
  status: 'VALID' | 'USED' | 'CANCELLED';
  createdAt: Date;
}

const TicketSchema = new Schema<ITicket>({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  ticketNumber: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  itemTitle: { type: String, required: true },
  venueOrCinema: { type: String, required: true },
  seatDetails: { type: String, required: true },
  qrCode: { type: String, required: true },
  validDate: { type: String, required: true },
  validTime: { type: String, required: true },
  status: { type: String, enum: ['VALID', 'USED', 'CANCELLED'], default: 'VALID' },
  createdAt: { type: Date, default: Date.now }
});

export const TicketModel: Model<ITicket> = (mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema)) as any;
