import { Router } from 'express';
import { CouponController } from '../controllers/couponController.js';

const router = Router();

router.get('/', CouponController.getOffers);
router.get('/offers', CouponController.getOffers);
router.post('/validate', CouponController.validateCoupon);

export default router;
