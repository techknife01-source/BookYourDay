import { Router } from 'express';
import { SeatController } from '../controllers/seatController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/lock', authenticate, SeatController.lockSeats);
router.post('/unlock', authenticate, SeatController.unlockSeats);

export default router;
