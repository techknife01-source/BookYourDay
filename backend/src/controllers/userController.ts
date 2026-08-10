import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { UserModel } from '../models/User.js';

export class UserController {
  static async getProfile(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
      let user = await (UserModel as any).findById(userId);
      if (!user && authReq.user?.email) {
        user = await (UserModel as any).findOne({ email: authReq.user.email });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found'
        });
      }

      return res.json({
        success: true,
        data: {
          id: user._id ? user._id.toString() : user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          walletBalance: user.walletBalance || 0,
          isMemberPlus: user.isMemberPlus || false,
          savedCity: user.savedCity || 'Asansol',
          wishlist: user.wishlist || [],
          createdAt: user.createdAt
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile',
        error: { code: 'PROFILE_FETCH_ERROR', details: error?.message }
      });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    const { name, phone, savedCity, isMemberPlus } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
      let user = await (UserModel as any).findById(userId);
      if (!user && authReq.user?.email) {
        user = await (UserModel as any).findOne({ email: authReq.user.email });
      }

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (savedCity !== undefined) user.savedCity = savedCity;
      if (isMemberPlus !== undefined) user.isMemberPlus = isMemberPlus;

      await user.save();

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: user._id ? user._id.toString() : user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          walletBalance: user.walletBalance,
          isMemberPlus: user.isMemberPlus,
          savedCity: user.savedCity,
          wishlist: user.wishlist || []
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: { code: 'PROFILE_UPDATE_ERROR', details: error?.message }
      });
    }
  }

  static async getWishlist(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
      let user = await (UserModel as any).findById(userId);
      if (!user && authReq.user?.email) {
        user = await (UserModel as any).findOne({ email: authReq.user.email });
      }

      const rawWishlist = user?.wishlist || [];
      return res.json({
        success: true,
        data: rawWishlist
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch wishlist',
        error: { code: 'WISHLIST_FETCH_ERROR', details: error?.message }
      });
    }
  }

  static async addToWishlist(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    const { itemId, id, category } = req.body;
    const targetId = itemId || id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!targetId) {
      return res.status(400).json({ success: false, message: 'itemId is required' });
    }

    try {
      let user = await (UserModel as any).findById(userId);
      if (!user && authReq.user?.email) {
        user = await (UserModel as any).findOne({ email: authReq.user.email });
      }

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const itemEntry = category ? `${targetId}:${category}` : targetId;
      if (!user.wishlist) user.wishlist = [];

      if (!user.wishlist.includes(itemEntry) && !user.wishlist.includes(targetId)) {
        user.wishlist.push(itemEntry);
        await user.save();
      }

      return res.json({
        success: true,
        message: 'Item added to wishlist',
        data: user.wishlist
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to add to wishlist',
        error: { code: 'WISHLIST_ADD_ERROR', details: error?.message }
      });
    }
  }

  static async removeFromWishlist(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    const itemId = req.params.itemId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
      let user = await (UserModel as any).findById(userId);
      if (!user && authReq.user?.email) {
        user = await (UserModel as any).findOne({ email: authReq.user.email });
      }

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (user.wishlist) {
        user.wishlist = user.wishlist.filter(
          (w: string) => w !== itemId && !w.startsWith(`${itemId}:`)
        );
        await user.save();
      }

      return res.json({
        success: true,
        message: 'Item removed from wishlist',
        data: user.wishlist || []
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to remove from wishlist',
        error: { code: 'WISHLIST_REMOVE_ERROR', details: error?.message }
      });
    }
  }
}
