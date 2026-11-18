import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { ReviewModel } from '../models/Review.js';
import { BookingModel } from '../models/Booking.js';
import { UserModel } from '../models/User.js';

export class ReviewController {
  /**
   * GET /api/reviews/:itemType/:itemId
   * Get reviews, average rating, and distribution for a specific catalog item
   */
  static async getItemReviews(req: Request, res: Response) {
    const { itemType, itemId } = req.params;
    const { sort = 'newest' } = req.query;

    try {
      const query: any = { itemId, status: 'APPROVED' };

      let sortOption: any = { createdAt: -1 };
      if (sort === 'highest') sortOption = { rating: -1, createdAt: -1 };
      else if (sort === 'lowest') sortOption = { rating: 1, createdAt: -1 };
      else if (sort === 'helpful') sortOption = { helpfulCount: -1, createdAt: -1 };

      const reviews = await (ReviewModel as any).find(query).sort(sortOption).lean();

      // Compute statistics
      const totalReviews = reviews.length;
      let totalScore = 0;
      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      for (const rev of reviews) {
        totalScore += rev.rating;
        const rounded = Math.min(5, Math.max(1, Math.round(rev.rating)));
        distribution[rounded] = (distribution[rounded] || 0) + 1;
      }

      const averageRating = totalReviews > 0 ? Math.round((totalScore / totalReviews) * 10) / 10 : 0;

      const formatted = reviews.map((r: any) => ({
        id: r._id ? r._id.toString() : r.id,
        itemType: r.itemType,
        itemId: r.itemId,
        userId: r.userId,
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        helpfulCount: r.helpfulCount || 0,
        helpfulUsers: r.helpfulUsers || [],
        verifiedBooking: Boolean(r.verifiedBooking),
        photos: r.photos || [],
        createdAt: r.createdAt
      }));

      return res.json({
        success: true,
        data: {
          reviews: formatted,
          stats: {
            averageRating,
            totalReviews,
            distribution
          }
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: err?.message });
    }
  }

  /**
   * POST /api/reviews
   * Submit a new review
   */
  static async submitReview(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    const userEmail = authReq.user?.email;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required to post a review' });
    }

    const { itemType, itemId, rating, comment, photos = [] } = req.body;

    if (!itemType || !itemId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Missing required review fields: itemType, itemId, rating (1-5), and comment are required.'
      });
    }

    const numericRating = Math.min(5, Math.max(1, Number(rating)));

    try {
      // 1. Fetch user name
      const user = await (UserModel as any).findById(userId).catch(() => null);
      const userName = user?.name || userEmail?.split('@')[0] || 'Verified Guest';

      // 2. Check if user has an eligible confirmed booking for this item
      const userBooking = await (BookingModel as any).findOne({
        userId,
        $or: [
          { itemId },
          { showId: itemId },
          { itemTitle: new RegExp(itemId, 'i') }
        ],
        status: { $in: ['CONFIRMED', 'COMPLETED'] }
      }).catch(() => null);

      const verifiedBooking = Boolean(userBooking);

      // 3. Upsert review (one review per user per item)
      const existingReview = await (ReviewModel as any).findOne({ userId, itemId });

      if (existingReview) {
        existingReview.rating = numericRating;
        existingReview.comment = comment.trim();
        existingReview.photos = Array.isArray(photos) ? photos : [];
        existingReview.verifiedBooking = verifiedBooking || existingReview.verifiedBooking;
        existingReview.updatedAt = new Date();
        existingReview.status = 'APPROVED';
        await existingReview.save();

        return res.json({
          success: true,
          message: 'Your review was updated successfully!',
          data: {
            ...existingReview.toObject(),
            id: existingReview._id.toString()
          }
        });
      }

      const newReview = await (ReviewModel as any).create({
        itemType,
        itemId,
        userId,
        userName,
        userEmail,
        rating: numericRating,
        comment: comment.trim(),
        photos: Array.isArray(photos) ? photos : [],
        verifiedBooking,
        bookingId: userBooking?._id?.toString(),
        helpfulCount: 0,
        helpfulUsers: [],
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return res.status(201).json({
        success: true,
        message: 'Thank you! Your review has been published.',
        data: {
          ...newReview.toObject(),
          id: newReview._id.toString()
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to submit review', error: err?.message });
    }
  }

  /**
   * POST /api/reviews/:id/helpful
   * Upvote a review as helpful
   */
  static async toggleHelpful(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try {
      const review = await (ReviewModel as any).findById(id);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      if (!review.helpfulUsers) review.helpfulUsers = [];

      const alreadyVoted = review.helpfulUsers.includes(userId);
      if (alreadyVoted) {
        review.helpfulUsers = review.helpfulUsers.filter((u: string) => u !== userId);
        review.helpfulCount = Math.max(0, (review.helpfulCount || 1) - 1);
      } else {
        review.helpfulUsers.push(userId);
        review.helpfulCount = (review.helpfulCount || 0) + 1;
      }

      await review.save();

      return res.json({
        success: true,
        helpfulCount: review.helpfulCount,
        hasVoted: !alreadyVoted
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to vote on review', error: err?.message });
    }
  }

  /**
   * DELETE /api/reviews/:id
   * Delete review (author or admin)
   */
  static async deleteReview(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    const role = authReq.user?.role;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try {
      const review = await (ReviewModel as any).findById(id);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      if (review.userId !== userId && role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
      }

      await (ReviewModel as any).findByIdAndDelete(id);
      return res.json({ success: true, message: 'Review deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to delete review', error: err?.message });
    }
  }

  /**
   * Admin: GET /api/reviews/admin/all
   */
  static async getAllReviewsAdmin(req: Request, res: Response) {
    try {
      const { status } = req.query;
      const query = status && status !== 'ALL' ? { status } : {};
      const reviews = await (ReviewModel as any).find(query).sort({ createdAt: -1 }).limit(100);
      return res.json({ success: true, data: reviews });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: err?.message });
    }
  }

  /**
   * Admin: PATCH /api/reviews/admin/:id/status
   */
  static async updateReviewStatusAdmin(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'PENDING', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    try {
      const updated = await (ReviewModel as any).findByIdAndUpdate(id, { status }, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Review not found' });
      return res.json({ success: true, data: updated, message: `Review status updated to ${status}` });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to update review status', error: err?.message });
    }
  }
}
