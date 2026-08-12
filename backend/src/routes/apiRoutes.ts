import { Router, Request, Response } from 'express';
import { getDatabaseStatus } from '../config/database.js';
import authRoutes from './authRoutes.js';
import movieRoutes from './movieRoutes.js';
import eventRoutes from './eventRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import seatRoutes from './seatRoutes.js';
import partnerRoutes from './partnerRoutes.js';
import catalogRoutes from './catalogRoutes.js';
import userRoutes from './userRoutes.js';
import couponRoutes from './couponRoutes.js';
import searchRoutes from './searchRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import adminRoutes from './adminRoutes.js';
import hotelRoutes from './hotelRoutes.js';
import travelRoutes from './travelRoutes.js';
import nearbyRoutes from './nearbyRoutes.js';
import plannerRoutes from './plannerRoutes.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { AdminController } from '../controllers/adminController.js';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  const dbState = getDatabaseStatus();
  res.json({
    success: true,
    message: 'Book Your Day API is running',
    database: dbState,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

router.get('/health/live', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'live',
    timestamp: new Date().toISOString()
  });
});

router.get('/health/ready', (req: Request, res: Response) => {
  const dbState = getDatabaseStatus();
  if (dbState === 'connected') {
    res.json({
      success: true,
      status: 'ready',
      database: dbState,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      success: false,
      status: 'not_ready',
      database: dbState,
      timestamp: new Date().toISOString()
    });
  }
});

const unwrap = (mod: any) => (mod && mod.default) || mod;

router.use('/auth', unwrap(authRoutes));
router.use('/catalog', unwrap(catalogRoutes));
router.use('/users', unwrap(userRoutes));
router.use('/movies', unwrap(movieRoutes));
router.use('/events', unwrap(eventRoutes));
router.use('/bookings', unwrap(bookingRoutes));
router.use('/seats', unwrap(seatRoutes));
router.use('/partner', unwrap(partnerRoutes));
router.use('/coupons', unwrap(couponRoutes));
router.use('/search', unwrap(searchRoutes));
router.use('/payments', unwrap(paymentRoutes));
router.use('/admin', unwrap(adminRoutes));
router.use('/hotels', unwrap(hotelRoutes));
router.use('/travel', unwrap(travelRoutes));
router.use('/nearby', unwrap(nearbyRoutes));
router.use('/planner', unwrap(plannerRoutes));

// Customer Support Endpoints
router.post('/support', authenticate, AdminController.submitSupportTicket);
router.get('/support/my', authenticate, AdminController.getMySupportTickets);

export default router;
