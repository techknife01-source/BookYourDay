import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * In-memory rate limiter for planner generation endpoints:
 * Max 15 requests per minute per IP address.
 */
export function plannerRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 15;

  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + windowMs
    });
    return next();
  }

  if (record.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded for AI Day Planner. Please wait a minute before generating new plans.'
    });
  }

  record.count += 1;
  next();
}
