import { Router } from 'express';
import { NearbyController } from '../controllers/nearbyController.js';

const router = Router();

router.get('/', NearbyController.getNearby);

export default router;
