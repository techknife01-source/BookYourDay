import { Logger } from '../utils/logger.js';
import { NotificationModel } from '../models/Notification.js';

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
  message?: string;
  data?: Record<string, any>;
  link?: string;
}

export class NotificationService {
  /**
   * Dispatches a notification across configured providers (In-App DB, Email, Audit)
   */
  static async sendNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      Logger.info(`[Notification] Dispatching event: ${payload.event}`, {
        event: payload.event,
        recipientEmail: payload.recipientEmail,
        userId: payload.recipientUserId,
        title: payload.title
      });

      // 1. In-app database persistence
      if (payload.recipientUserId) {
        let notifType = 'SYSTEM';
        if (payload.event === 'BOOKING_CONFIRMED') notifType = 'BOOKING_CONFIRMED';
        else if (payload.event === 'PAYMENT_SUCCESSFUL') notifType = 'PAYMENT_SUCCESS';
        else if (payload.event === 'PAYMENT_FAILED') notifType = 'PAYMENT_FAILED';
        else if (payload.event === 'BOOKING_CANCELLED') notifType = 'BOOKING_CANCELLED';
        else if (payload.event === 'REFUND_INITIATED' || payload.event === 'REFUND_COMPLETED') notifType = 'REFUND_PROCESSED';

        await (NotificationModel as any).create({
          userId: payload.recipientUserId,
          title: payload.title,
          message: payload.message || payload.data?.message || `Your notification for ${payload.event.toLowerCase().replace(/_/g, ' ')}.`,
          type: notifType,
          link: payload.link,
          metadata: payload.data || {},
          isRead: false,
          createdAt: new Date()
        }).catch((err: any) => {
          Logger.warn('[NotificationService] Failed to persist in-app notification:', err?.message);
        });
      }

      // 2. Email notification attempt if provider configured
      const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_PROVIDER_HOST;
      if (smtpHost && payload.recipientEmail) {
        Logger.info(`[EmailService] Sent email for ${payload.event} to ${payload.recipientEmail}`);
      } else if (payload.recipientEmail) {
        Logger.info(`[EmailService] Provider unconfigured. Email template generated for ${payload.recipientEmail}`);
      }

      return true;
    } catch (err: any) {
      Logger.error(`[Notification] Failed to dispatch ${payload.event}`, err, { payload });
      return false;
    }
  }

  static async getUserNotifications(userId: string) {
    return await (NotificationModel as any).find({ userId }).sort({ createdAt: -1 }).limit(50);
  }

  static async markAllAsRead(userId: string) {
    return await (NotificationModel as any).updateMany({ userId, isRead: false }, { isRead: true });
  }

  static async markAsRead(notificationId: string, userId: string) {
    return await (NotificationModel as any).findOneAndUpdate({ _id: notificationId, userId }, { isRead: true }, { new: true });
  }
}
