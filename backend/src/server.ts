import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import apiRoutes from './routes/apiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestCorrelation } from './middleware/requestCorrelation.js';

export async function createBackendApp() {
  const app = express();

  // Helmet security headers (disable CSP to avoid blocking Razorpay or image assets)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  // Production CORS safety
  const allowedOrigins = [
    process.env.CLIENT_URL,
    env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000'
  ].filter((url): url is string => Boolean(url && url.trim()));

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin) return callback(null, true);
        if (process.env.NODE_ENV !== 'production') return callback(null, true);

        const isAllowed = allowedOrigins.some((allowed) => {
          if (allowed === origin) return true;
          try {
            const allowedHost = new URL(allowed).host;
            const originHost = new URL(origin).host;
            return allowedHost === originHost;
          } catch {
            return false;
          }
        });

        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error('CORS policy: Access denied for origin.'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID', 'X-Idempotency-Key']
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(requestCorrelation);

  // Mount API routes
  app.use('/api', apiRoutes);

  // Error middleware
  app.use(errorHandler);

  return app;
}

if (!process.env.IS_ORCHESTRATED && process.env.NODE_ENV !== 'test') {
  createBackendApp().then(async (app) => {
    await connectDB();
    const port = parseInt(process.env.PORT || env.PORT || '5000', 10);
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Book Your Day Backend API listening on port ${port}`);
    });
  }).catch((err) => {
    console.error('Fatal backend startup error:', err);
    process.exit(1);
  });
}

