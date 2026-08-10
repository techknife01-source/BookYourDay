import { Router } from 'express';
import { BookingController } from '../controllers/bookingController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticate, BookingController.createBooking);
router.get('/', authenticate, BookingController.getUserBookings);
router.post('/:id/cancel', authenticate, BookingController.cancelBooking);

export default router;
