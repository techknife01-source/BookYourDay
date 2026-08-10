import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  actorUserId: string;
  actorRole: string;
  action: string;
  targetId?: string;
  targetType?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  actorUserId: { type: String, required: true, index: true },
  actorRole: { type: String, required: true },
  action: { type: String, required: true, index: true },
  targetId: { type: String },
  targetType: { type: String },
  details: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, index: true }
});

export const AuditLogModel: Model<IAuditLog> = 
  (mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)) as any;
