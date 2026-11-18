import { Router } from 'express';
import { BookingController } from '../controllers/bookingController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', BookingController.createBooking);
router.get('/', BookingController.getUserBookings);
router.get('/my', BookingController.getUserBookings);
router.get('/:id', BookingController.getBookingById);
router.post('/:id/cancel', BookingController.cancelBooking);
router.post('/:id/reschedule', BookingController.rescheduleBooking);

export default router;
