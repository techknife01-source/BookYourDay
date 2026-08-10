import { Router } from 'express';
import { PartnerController } from '../controllers/partnerController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Partner onboarding & profile
router.post('/apply', authenticate, PartnerController.applyPartner);
router.get('/me', authenticate, PartnerController.getPartnerProfile);

// Partner dashboard & statistics
router.get('/stats', authenticate, PartnerController.getDashboard);
router.get('/dashboard', authenticate, PartnerController.getDashboard);

// Partner listing management
router.get('/listings', authenticate, PartnerController.getListings);
router.post('/listings', authenticate, requireRole(['partner', 'admin']), PartnerController.createListing);
router.patch('/listings/:category/:id/status', authenticate, requireRole(['partner', 'admin']), PartnerController.updateListingStatus);

// Partner bookings & revenue
router.get('/bookings', authenticate, requireRole(['partner', 'admin']), PartnerController.getPartnerBookings);
router.get('/revenue', authenticate, requireRole(['partner', 'admin']), PartnerController.getPartnerRevenue);

// Admin partner management
router.get('/admin/all', authenticate, requireRole(['admin']), PartnerController.getAllPartners);
router.patch('/admin/:partnerId/status', authenticate, requireRole(['admin']), PartnerController.updatePartnerStatus);

export default router;
