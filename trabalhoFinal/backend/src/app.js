import cors from 'cors';
import express from 'express';
import { createContainer } from './container.js';
import { registerSwagger } from './docs/swagger.js';
import { correlationId } from './middlewares/correlation-id.js';
import { errorHandler, notFound } from './middlewares/error-handler.js';
import { createRouter } from './routes/index.js';

export function createApp(overrides = {}) {
  const app = express();
  const { controllers } = createContainer(overrides);

  app.disable('x-powered-by');
  app.use(cors({ exposedHeaders: ['X-Correlation-Id'] }));
  app.use(express.json({ limit: '100kb' }));
  app.use(correlationId);
  registerSwagger(app);
  app.use('/api', createRouter(controllers));
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
