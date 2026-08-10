import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/payments/create-order (Auth required)
router.post('/create-order', authenticate, PaymentController.createOrder);

// POST /api/payments/verify (Auth required)
router.post('/verify', authenticate, PaymentController.verifyPayment);

// POST /api/payments/webhook (Razorpay Webhook)
router.post('/webhook', PaymentController.handleWebhook);

// GET /api/payments/history (Auth required)
router.get('/history', authenticate, PaymentController.getPaymentHistory);

// POST /api/payments/cleanup-expired (Periodic/system cleanup)
router.post('/cleanup-expired', PaymentController.cleanupExpired);

export default router;
