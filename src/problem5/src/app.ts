import express, { Application, Request, Response } from 'express';
import postRoutes from './routes/post.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

export const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(express.json());

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/posts', postRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: {
        message: 'Route not found',
        code: 'NOT_FOUND',
      },
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};
