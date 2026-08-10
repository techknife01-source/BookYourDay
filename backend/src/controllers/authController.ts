import { Request, Response } from 'express';
import { generateToken } from '../utils/jwtUtils.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { UserModel } from '../models/User.js';
import { getDatabaseStatus } from '../config/database.js';

export class AuthController {
  static async login(req: Request, res: Response) {
    const { email, phone, name } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email or Phone is required.',
        error: { code: 'MISSING_CREDENTIALS', details: 'Email or Phone is required' }
      });
    }

    const cleanEmail = (email || `user_${Date.now()}@bookyourday.com`).toLowerCase().trim();
    const userRole = cleanEmail.includes('partner') ? 'partner' : cleanEmail.includes('admin') ? 'admin' : 'user';

    try {
      let user: any = null;
      if (getDatabaseStatus() === 'connected') {
        user = await (UserModel as any).findOne({
          $or: [{ email: cleanEmail }, ...(phone ? [{ phone }] : [])]
        });

        if (!user) {
          user = await (UserModel as any).create({
            name: name || (cleanEmail.includes('admin') ? 'System Admin' : cleanEmail.includes('partner') ? 'Partner Venue Manager' : 'Alex Mercer'),
            email: cleanEmail,
            phone: phone || '+1 (555) 234-5678',
            role: userRole,
            walletBalance: 450,
            isMemberPlus: true,
            savedCity: 'Asansol',
            wishlist: []
          });
        }
      } else {
        // In-memory fallback when DB is disconnected
        user = {
          _id: 'usr_dev_101',
          name: name || (cleanEmail.includes('admin') ? 'System Admin' : cleanEmail.includes('partner') ? 'Partner Venue Manager' : 'Alex Mercer'),
          email: cleanEmail,
          phone: phone || '+1 (555) 234-5678',
          role: userRole,
          walletBalance: 450,
          isMemberPlus: true,
          savedCity: 'Asansol',
          wishlist: []
        };
      }

      const userId = user._id ? user._id.toString() : user.id;

      const token = generateToken({
        userId,
        email: user.email,
        role: user.role
      });

      const safeUserData = {
        id: userId,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        walletBalance: user.walletBalance || 0,
        isMemberPlus: user.isMemberPlus || false,
        savedCity: user.savedCity || 'Asansol',
        wishlist: user.wishlist || []
      };

      return res.json({
        success: true,
        token,
        data: safeUserData,
        user: safeUserData // backward compatibility
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Authentication failed',
        error: { code: 'AUTH_ERROR', details: error?.message }
      });
    }
  }

  static async getMe(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    const email = authReq.user?.email;

    if (!userId && !email) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload',
        error: { code: 'UNAUTHORIZED', details: 'No user ID in token' }
      });
    }

    try {
      let user = null;
      if (userId && userId.length === 24) {
        user = await (UserModel as any).findById(userId);
      }
      if (!user && email) {
        user = await (UserModel as any).findOne({ email: email.toLowerCase() });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Authenticated user profile not found',
          error: { code: 'USER_NOT_FOUND', details: 'User not found in MongoDB' }
        });
      }

      const safeUserData = {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        walletBalance: user.walletBalance || 0,
        isMemberPlus: user.isMemberPlus || false,
        savedCity: user.savedCity || 'Asansol',
        wishlist: user.wishlist || []
      };

      return res.json({
        success: true,
        data: safeUserData,
        user: safeUserData // backward compatibility
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to verify session',
        error: { code: 'AUTH_VERIFY_ERROR', details: error?.message }
      });
    }
  }
}
