import { Router } from 'express';
import { BookingController } from '../controllers/bookingController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticate as any, BookingController.createBooking as any);
router.get('/', authenticate as any, BookingController.getUserBookings as any);
router.post('/:id/cancel', authenticate as any, BookingController.cancelBooking as any);

export default router;
