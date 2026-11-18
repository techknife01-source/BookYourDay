import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwtUtils.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { UserModel } from '../models/User.js';
import { getDatabaseStatus } from '../config/database.js';

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user account with secure password hashing
   */
  static async register(req: Request, res: Response) {
    const { name, email, password, phone, role = 'user', savedCity = 'Asansol' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required for registration.',
        error: { code: 'MISSING_FIELDS' }
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
        error: { code: 'WEAK_PASSWORD' }
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    try {
      const existingUser = await (UserModel as any).findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.',
          error: { code: 'EMAIL_EXISTS' }
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Only grant admin role if explicitly seeded admin email
      let userRole: 'user' | 'partner' | 'admin' = 'user';
      if (cleanEmail === 'admin@bookyourday.com') {
        userRole = 'admin';
      } else if (role === 'partner') {
        userRole = 'partner';
      }

      const newUser = await (UserModel as any).create({
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        phone: phone ? String(phone).trim() : '',
        role: userRole,
        walletBalance: 250, // Welcome gift
        isMemberPlus: false,
        savedCity: savedCity || 'Asansol',
        wishlist: [],
        createdAt: new Date()
      });

      const userId = newUser._id.toString();
      const token = generateToken({
        userId,
        email: newUser.email,
        role: newUser.role
      });

      const safeUserData = {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        walletBalance: newUser.walletBalance,
        isMemberPlus: newUser.isMemberPlus,
        savedCity: newUser.savedCity,
        wishlist: newUser.wishlist || []
      };

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to Book Your Day.',
        token,
        data: safeUserData,
        user: safeUserData
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.',
        error: { code: 'REGISTRATION_ERROR', details: error?.message }
      });
    }
  }

  /**
   * POST /api/auth/login
   * Login with email and password or demo credentials
   */
  static async login(req: Request, res: Response) {
    const { email, password, phone, name } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required.',
        error: { code: 'MISSING_CREDENTIALS', details: 'Email or Phone is required' }
      });
    }

    const cleanEmail = (email || '').toLowerCase().trim();

    try {
      let user: any = null;
      if (getDatabaseStatus() === 'connected') {
        user = await (UserModel as any).findOne({
          $or: [{ email: cleanEmail }, ...(phone ? [{ phone }] : [])]
        });

        if (user) {
          // Verify password if password exists on user
          if (user.passwordHash && password) {
            const passwordMatches = await bcrypt.compare(password, user.passwordHash);
            if (!passwordMatches) {
              return res.status(401).json({
                success: false,
                message: 'Invalid password. Please verify your credentials.',
                error: { code: 'INVALID_CREDENTIALS' }
              });
            }
          } else if (password && !user.passwordHash) {
            // Upgrade legacy account with password
            user.passwordHash = await bcrypt.hash(password, 10);
            await user.save();
          }
        } else {
          // If user does not exist yet (e.g. initial demo quick login or test)
          const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
          const userRole = cleanEmail === 'admin@bookyourday.com' ? 'admin' : cleanEmail.includes('partner') ? 'partner' : 'user';

          user = await (UserModel as any).create({
            name: name || (cleanEmail.includes('admin') ? 'System Admin' : cleanEmail.includes('partner') ? 'Partner Venue Manager' : 'Alex Mercer'),
            email: cleanEmail || `user_${Date.now()}@bookyourday.com`,
            passwordHash,
            phone: phone || '+1 (555) 234-5678',
            role: userRole,
            walletBalance: 450,
            isMemberPlus: true,
            savedCity: 'Asansol',
            wishlist: []
          });
        }
      } else {
        // In-memory fallback
        user = {
          _id: 'usr_dev_101',
          name: name || (cleanEmail.includes('admin') ? 'System Admin' : cleanEmail.includes('partner') ? 'Partner Venue Manager' : 'Alex Mercer'),
          email: cleanEmail || 'alex.mercer@example.com',
          phone: phone || '+1 (555) 234-5678',
          role: cleanEmail === 'admin@bookyourday.com' ? 'admin' : 'user',
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
        user: safeUserData
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
        user: safeUserData
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
