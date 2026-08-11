import { Router } from 'express';
import { HotelController } from '../controllers/hotelController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Public customer routes
router.get('/', HotelController.getHotels);
router.get('/:id', HotelController.getHotelById);

// Authenticated customer booking route
router.post('/reserve', authenticate, HotelController.createHotelBooking);

// Partner hotel management routes
router.post('/partner', authenticate, HotelController.createHotelPartner);
router.get('/partner/my', authenticate, HotelController.getPartnerHotels);
router.post('/partner/room-types', authenticate, HotelController.createRoomTypePartner);
router.get('/partner/room-types/:hotelId', authenticate, HotelController.getPartnerRoomTypes);
router.get('/partner/reservations', authenticate, HotelController.getPartnerReservations);

export default router;
