import { Router } from 'express';
import { SearchController } from '../controllers/searchController.js';
import { NearbyController } from '../controllers/nearbyController.js';

const router = Router();

router.get('/', SearchController.search);
router.get('/nearby', NearbyController.getNearby);

export default router;
