process.env.IS_ORCHESTRATED = 'true';

import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import apiRoutes from './backend/src/routes/apiRoutes.ts';
import { connectDB } from './backend/src/config/db.ts';
import { errorHandler } from './backend/src/middleware/errorHandler.ts';

async function startOrchestratedServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    }
  }));

  // Attempt database connection
  await connectDB();

  // Mount backend API routes
  const resolvedApiRoutes = (apiRoutes as any).default || apiRoutes;
  app.use('/api', resolvedApiRoutes);

  // Serve Frontend with Vite in Dev, or static dist in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: process.cwd(),
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Book Your Day Full-Stack App running on http://0.0.0.0:${PORT}`);
  });
}

startOrchestratedServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
