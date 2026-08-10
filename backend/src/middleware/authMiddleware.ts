import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwtUtils.js';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Missing token.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }

  (req as AuthRequest).user = payload;
  next();
}

export function requireRole(roles: Array<'user' | 'partner' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    if (!authReq.user || !roles.includes(authReq.user.role)) {
      return res.status(403).json({ success: false, message: 'Access forbidden. Insufficient permissions.' });
    }
    next();
  };
}
