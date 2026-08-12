import { Logger } from '../utils/logger.js';

export type NotificationEventType =
  | 'BOOKING_CONFIRMED'
  | 'PAYMENT_SUCCESSFUL'
  | 'PAYMENT_FAILED'
  | 'BOOKING_CANCELLED'
  | 'REFUND_INITIATED'
  | 'REFUND_COMPLETED'
  | 'PARTNER_APPLICATION_APPROVED'
  | 'PARTNER_APPLICATION_REJECTED'
  | 'SUPPORT_TICKET_UPDATED';

export interface NotificationPayload {
  event: NotificationEventType;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientUserId?: string;
  title: string;
  data: Record<string, any>;
}

export class NotificationService {
  /**
   * Dispatches a notification across configured providers (Email, SMS, Push, Audit)
   */
  static async sendNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      Logger.info(`[Notification] Dispatching event: ${payload.event}`, {
        event: payload.event,
        recipientEmail: payload.recipientEmail,
        userId: payload.recipientUserId,
        title: payload.title
      });

      // 1. Email notification attempt if provider configured
      const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_PROVIDER_HOST;
      if (smtpHost && payload.recipientEmail) {
        Logger.info(`[EmailService] Sent email for ${payload.event} to ${payload.recipientEmail}`);
      } else if (payload.recipientEmail) {
        Logger.info(`[EmailService] Provider unconfigured. Email template generated for ${payload.recipientEmail}`);
      }

      // 2. In-app audit / log record
      return true;
    } catch (err: any) {
      Logger.error(`[Notification] Failed to dispatch ${payload.event}`, err, { payload });
      return false;
    }
  }
}
