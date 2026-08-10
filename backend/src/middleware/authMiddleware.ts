import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwtUtils.js';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. Missing token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
    return;
  }

  (req as AuthRequest).user = payload;
  next();
};

export function requireRole(roles: Array<'user' | 'partner' | 'admin'>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    if (!authReq.user || !roles.includes(authReq.user.role)) {
      res.status(403).json({ success: false, message: 'Access forbidden. Insufficient permissions.' });
      return;
    }
    next();
  };
}
