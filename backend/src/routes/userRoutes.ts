import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.patch('/profile', UserController.updateProfile);
router.get('/wishlist', UserController.getWishlist);
router.post('/wishlist', UserController.addToWishlist);
router.delete('/wishlist/:itemId', UserController.removeFromWishlist);

export default router;
