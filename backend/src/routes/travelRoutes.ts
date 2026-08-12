import { Router } from 'express';
import { TravelController } from '../controllers/travelController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Public Package routes
router.get('/packages', TravelController.getPackages);
router.get('/packages/:id', TravelController.getPackageById);
router.post('/packages/reserve', authenticate, TravelController.createPackageBooking);

// Public Transfer routes
router.get('/transfers', TravelController.getTransfers);
router.get('/transfers/:id', TravelController.getTransferById);
router.post('/transfers/reserve', authenticate, TravelController.createTransferBooking);

// Partner Package & Transfer Management routes
router.post('/partner/packages', authenticate, TravelController.createPartnerPackage);
router.get('/partner/packages', authenticate, TravelController.getPartnerPackages);
router.post('/partner/transfers', authenticate, TravelController.createPartnerTransfer);
router.get('/partner/transfers', authenticate, TravelController.getPartnerTransfers);

export default router;
