import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { ChatMessageModel } from '../models/ChatMessage.js';
import { UserModel } from '../models/User.js';

export class ChatController {
  /**
   * GET /api/chat/my
   * Get authenticated customer's chat conversation
   */
  static async getMyMessages(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try {
      const messages = await (ChatMessageModel as any).find({
        $or: [{ senderId: userId }, { recipientId: userId }, { conversationId: `conv_${userId}` }]
      }).sort({ createdAt: 1 });

      // Mark admin messages as read
      await (ChatMessageModel as any).updateMany(
        { recipientId: userId, isRead: false },
        { isRead: true }
      );

      const formatted = messages.map((m: any) => ({
        id: m._id ? m._id.toString() : m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        senderRole: m.senderRole,
        senderName: m.senderName,
        message: m.message,
        isRead: m.isRead,
        createdAt: m.createdAt
      }));

      return res.json({ success: true, data: formatted });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch messages', error: err?.message });
    }
  }

  /**
   * POST /api/chat/send
   * Send a message in support chat
   */
  static async sendMessage(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    const userRole = authReq.user?.role || 'user';
    const userEmail = authReq.user?.email;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { message, recipientId, conversationId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    try {
      const user = await (UserModel as any).findById(userId).catch(() => null);
      const senderName = user?.name || (userRole === 'admin' ? 'Support Specialist' : userEmail?.split('@')[0] || 'Customer');

      const targetConversationId = conversationId || (userRole === 'admin' ? `conv_${recipientId}` : `conv_${userId}`);
      const targetRecipientId = recipientId || (userRole === 'admin' ? recipientId : 'admin_support');

      const newMessage = await (ChatMessageModel as any).create({
        conversationId: targetConversationId,
        senderId: userId,
        senderRole: userRole === 'admin' ? 'admin' : 'user',
        senderName,
        senderEmail: userEmail,
        recipientId: targetRecipientId,
        message: message.trim(),
        isRead: false,
        createdAt: new Date()
      });

      return res.status(201).json({
        success: true,
        data: {
          ...newMessage.toObject(),
          id: newMessage._id.toString()
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to send message', error: err?.message });
    }
  }

  /**
   * Admin: GET /api/chat/admin/conversations
   * Get all active customer support conversations
   */
  static async getAdminConversations(req: Request, res: Response) {
    try {
      // Group by conversationId to find latest message and unread count
      const conversations = await (ChatMessageModel as any).aggregate([
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$conversationId',
            latestMessage: { $first: '$message' },
            latestTimestamp: { $first: '$createdAt' },
            customerName: {
              $first: {
                $cond: [{ $eq: ['$senderRole', 'user'] }, '$senderName', '$recipientId']
              }
            },
            customerId: {
              $first: {
                $cond: [{ $eq: ['$senderRole', 'user'] }, '$senderId', '$recipientId']
              }
            },
            customerEmail: { $first: '$senderEmail' },
            unreadCount: {
              $sum: {
                $cond: [{ $and: [{ $eq: ['$isRead', false] }, { $eq: ['$senderRole', 'user'] }] }, 1, 0]
              }
            }
          }
        },
        { $sort: { latestTimestamp: -1 } }
      ]);

      return res.json({ success: true, data: conversations });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch conversations', error: err?.message });
    }
  }

  /**
   * Admin: GET /api/chat/admin/conversation/:conversationId
   */
  static async getConversationMessages(req: Request, res: Response) {
    const { conversationId } = req.params;

    try {
      const messages = await (ChatMessageModel as any).find({ conversationId }).sort({ createdAt: 1 });

      // Mark user messages as read by admin
      await (ChatMessageModel as any).updateMany(
        { conversationId, senderRole: 'user', isRead: false },
        { isRead: true }
      );

      const formatted = messages.map((m: any) => ({
        id: m._id ? m._id.toString() : m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        senderRole: m.senderRole,
        senderName: m.senderName,
        message: m.message,
        isRead: m.isRead,
        createdAt: m.createdAt
      }));

      return res.json({ success: true, data: formatted });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch conversation', error: err?.message });
    }
  }
}
