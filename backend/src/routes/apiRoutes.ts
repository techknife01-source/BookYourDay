import { Router } from 'express';
import { getDatabaseStatus } from '../config/database.js';
import authRoutes from './authRoutes.js';
import movieRoutes from './movieRoutes.js';
import eventRoutes from './eventRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import seatRoutes from './seatRoutes.js';
import partnerRoutes from './partnerRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  const dbState = getDatabaseStatus();
  res.json({
    success: true,
    message: 'Book Your Day API is running',
    database: dbState,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

const unwrap = (mod: any) => (mod && mod.default) || mod;

router.use('/auth', unwrap(authRoutes));
router.use('/movies', unwrap(movieRoutes));
router.use('/events', unwrap(eventRoutes));
router.use('/bookings', unwrap(bookingRoutes));
router.use('/seats', unwrap(seatRoutes));
router.use('/partner', unwrap(partnerRoutes));

export default router;
