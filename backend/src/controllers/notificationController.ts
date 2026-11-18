import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { NotificationService } from '../services/notificationService.js';

export class NotificationController {
  static async getMyNotifications(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try {
      const notifs = await NotificationService.getUserNotifications(userId);
      const formatted = notifs.map((n: any) => {
        const obj = n.toObject ? n.toObject() : n;
        return {
          id: obj._id ? obj._id.toString() : obj.id,
          title: obj.title,
          message: obj.message,
          type: obj.type,
          link: obj.link,
          isRead: obj.isRead,
          createdAt: obj.createdAt
        };
      });

      return res.json({ success: true, data: formatted });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: err?.message });
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try {
      await NotificationService.markAllAsRead(userId);
      return res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to update notifications', error: err?.message });
    }
  }

  static async markOneAsRead(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    const { id } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try {
      const updated = await NotificationService.markAsRead(id, userId);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to update notification', error: err?.message });
    }
  }
}
