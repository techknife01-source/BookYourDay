import { Request, Response, NextFunction } from 'express';
import { CorrelatedRequest } from './requestCorrelation.js';
import { Logger } from '../utils/logger.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const requestId = (req as CorrelatedRequest).requestId;
  const statusCode = err.statusCode || err.status || 500;
  
  // Clean message
  let message = err.message || 'Internal Server Error';
  if (message.includes('mongodb+srv://') || message.includes('mongodb://')) {
    message = 'Database operation failed. Please try again later.';
  }

  Logger.error('API Error Encountered', err, {
    requestId,
    path: req.path,
    method: req.method,
    statusCode
  });

  const errorCode = err.code || (statusCode === 401 ? 'UNAUTHORIZED' : statusCode === 403 ? 'FORBIDDEN' : statusCode === 404 ? 'NOT_FOUND' : statusCode === 409 ? 'CONFLICT' : 'SERVER_ERROR');

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred processing your request',
      requestId
    },
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

