import { Router } from 'express';
import { ChatController } from '../controllers/chatController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

// Customer endpoints
router.get('/my', ChatController.getMyMessages);
router.post('/send', ChatController.sendMessage);

// Admin endpoints
router.get('/admin/conversations', requireRole(['admin']), ChatController.getAdminConversations);
router.get('/admin/conversation/:conversationId', requireRole(['admin']), ChatController.getConversationMessages);

export default router;
