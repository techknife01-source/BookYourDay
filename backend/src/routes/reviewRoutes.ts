import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public: Get reviews for an item
router.get('/:itemType/:itemId', ReviewController.getItemReviews);

// Protected: Submit or vote on reviews
router.post('/', authenticate, ReviewController.submitReview);
router.post('/:id/helpful', authenticate, ReviewController.toggleHelpful);
router.delete('/:id', authenticate, ReviewController.deleteReview);

// Admin review moderation
router.get('/admin/all', authenticate, requireRole(['admin']), ReviewController.getAllReviewsAdmin);
router.patch('/admin/:id/status', authenticate, requireRole(['admin']), ReviewController.updateReviewStatusAdmin);

export default router;
