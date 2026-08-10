import { Router } from 'express';
import { PartnerController } from '../controllers/partnerController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/stats', authenticate, PartnerController.getDashboard);
router.post('/listings', authenticate, PartnerController.createListing);

export default router;
