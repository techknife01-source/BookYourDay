import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import apiRoutes from './routes/apiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export async function createBackendApp() {
  const app = express();

  app.use(cors({ origin: '*' }));
  app.use(express.json());

  // Mount API routes
  app.use('/api', apiRoutes);

  // Error middleware
  app.use(errorHandler);

  return app;
}

if (!process.env.IS_ORCHESTRATED) {
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
