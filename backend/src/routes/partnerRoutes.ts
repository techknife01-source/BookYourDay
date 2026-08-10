import { Router } from 'express';
import { PartnerController } from '../controllers/partnerController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/stats', authenticate as any, PartnerController.getDashboard as any);
router.post('/listings', authenticate as any, PartnerController.createListing as any);

export default router;
