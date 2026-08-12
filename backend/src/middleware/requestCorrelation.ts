import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface CorrelatedRequest extends Request {
  requestId?: string;
  startTime?: number;
}

export function requestCorrelation(req: Request, res: Response, next: NextFunction) {
  const existingId = req.headers['x-request-id'] as string;
  const requestId = existingId && existingId.trim().length > 0 ? existingId : `req_${crypto.randomUUID().replace(/-/g, '')}`;

  (req as CorrelatedRequest).requestId = requestId;
  (req as CorrelatedRequest).startTime = Date.now();

  res.setHeader('X-Request-ID', requestId);

  // Structured request start log
  if (process.env.NODE_ENV !== 'test') {
    const isHealthCheck = req.path.startsWith('/api/health');
    if (!isHealthCheck) {
      console.log(JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        requestId,
        method: req.method,
        path: req.path,
        ip: req.ip || req.socket.remoteAddress
      }));
    }
  }

  next();
}
