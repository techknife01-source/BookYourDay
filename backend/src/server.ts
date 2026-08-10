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

if (process.env.NODE_ENV !== 'production' && !process.env.IS_ORCHESTRATED) {
  createBackendApp().then(async (app) => {
    await connectDB();
    const port = env.PORT || 3000;
    app.listen(port, () => {
      console.log(`🚀 Book Your Day Backend API listening on port ${port}`);
    });
  });
}
