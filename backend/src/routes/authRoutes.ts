import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', AuthController.login);
router.get('/me', authenticate as any, AuthController.getMe as any);

export default router;
