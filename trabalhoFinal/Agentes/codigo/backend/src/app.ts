import cors from 'cors';
import express from 'express';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { correlationIdMiddleware } from './middlewares/correlation-id.js';
import { notFound } from './middlewares/not-found.js';
import { logger } from './lib/logger.js';
import { router } from './routes/index.js';

export const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '256kb' }));
app.use(correlationIdMiddleware);
app.use(pinoHttp({
  logger,
  genReqId: (req) => (req as any).correlationId,
  customProps: (req) => ({ correlationId: (req as any).correlationId })
}));

app.use(router);
app.use(notFound);
app.use(errorHandler);
