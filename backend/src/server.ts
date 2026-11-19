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
  const rawOriginInputs = [
    process.env.CORS_ORIGIN,
    process.env.CLIENT_URL,
    env.CLIENT_URL,
    'https://bookyourday.com',
    'https://www.bookyourday.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ]
    .filter((val): val is string => Boolean(val && val.trim()))
    .flatMap((val) => val.split(/[,;\s]+/).map((s) => s.trim()))
    .filter((url) => url.length > 0);

  const allowedOriginsSet = new Set(rawOriginInputs.map((url) => url.replace(/\/+$/, '')));

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV !== 'production') return callback(null, true);

      const cleanOrigin = origin.replace(/\/+$/, '');

      // 1. Direct match in allowed origins set
      if (allowedOriginsSet.has(cleanOrigin)) {
        return callback(null, true);
      }

      // 2. Allow any Vercel domain (*.vercel.app)
      if (/^https:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/i.test(cleanOrigin)) {
        return callback(null, true);
      }

      // 3. Allow any Render domain (*.onrender.com)
      if (/^https:\/\/([a-zA-Z0-9-]+\.)*onrender\.com$/i.test(cleanOrigin)) {
        return callback(null, true);
      }

      // 4. Allow localhost or 127.0.0.1 on any port
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(cleanOrigin)) {
        return callback(null, true);
      }

      // 5. Hostname comparison for custom domains
      try {
        const originHost = new URL(cleanOrigin).host;
        for (const allowed of allowedOriginsSet) {
          try {
            if (new URL(allowed).host === originHost) {
              return callback(null, true);
            }
          } catch {
            // ignore malformed URLs
          }
        }
      } catch {
        // ignore malformed origin
      }

      console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID', 'X-Idempotency-Key']
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

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

