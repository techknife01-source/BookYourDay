import { Router } from 'express';
import { SeatController } from '../controllers/seatController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/lock', authenticate as any, SeatController.lockSeats as any);
router.post('/unlock', authenticate as any, SeatController.unlockSeats as any);

export default router;
