export interface LogContext {
  requestId?: string;
  userId?: string;
  partnerId?: string;
  bookingId?: string;
  paymentId?: string;
  [key: string]: any;
}

function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeData);

  const sanitized: Record<string, any> = {};
  const sensitiveKeys = ['password', 'passwordhash', 'jwt_secret', 'secret', 'signature', 'token', 'authorization', 'razorpay_key_secret', 'razorpay_webhook_secret', 'card', 'cvv'];

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export class Logger {
  static info(message: string, context: LogContext = {}) {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...sanitizeData(context)
    }));
  }

  static warn(message: string, context: LogContext = {}) {
    console.warn(JSON.stringify({
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...sanitizeData(context)
    }));
  }

  static error(message: string, error?: any, context: LogContext = {}) {
    const safeErrorMessage = error?.message ? String(error.message).replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@') : undefined;

    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      errorMessage: safeErrorMessage,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      ...sanitizeData(context)
    }));
  }
}
