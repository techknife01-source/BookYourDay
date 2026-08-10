import { Request, Response } from 'express';
import { generateToken } from '../utils/jwtUtils.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export class AuthController {
  static async login(req: Request, res: Response) {
    const { email, phone } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Email or Phone is required.' });
    }

    const userId = 'usr_101';
    const userRole = email && email.includes('partner') ? 'partner' : email && email.includes('admin') ? 'admin' : 'user';

    const token = generateToken({
      userId,
      email: email || 'user@bookyourday.com',
      role: userRole,
    });

    return res.json({
      success: true,
      token,
      user: {
        id: userId,
        name: 'Alex Mercer',
        email: email || 'alex.mercer@example.com',
        phone: phone || '+1 (555) 234-5678',
        role: userRole,
        walletBalance: 450,
        isMemberPlus: true,
        savedCity: 'Asansol'
      }
    });
  }

  static async getMe(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    return res.json({
      success: true,
      user: {
        id: authReq.user?.userId || 'usr_101',
        name: 'Alex Mercer',
        email: authReq.user?.email || 'alex.mercer@example.com',
        phone: '+1 (555) 234-5678',
        role: authReq.user?.role || 'user',
        walletBalance: 450,
        isMemberPlus: true,
        savedCity: 'Asansol'
      }
    });
  }
}
