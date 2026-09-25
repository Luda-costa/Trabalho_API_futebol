import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/app-error.js';
import { logger } from '../lib/logger.js';

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const correlationId = req.correlationId ?? 'unknown';

  if (error instanceof AppError) {
    logger.warn({ correlationId, code: error.code, status: error.status }, error.message);
    res.status(error.status).json({
      code: error.code,
      message: error.message,
      correlationId
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    res.status(400).json({
      code: 'DUPLICATE_RESOURCE',
      message: 'Já existe um recurso com os mesmos dados únicos.',
      correlationId
    });
    return;
  }

  logger.error({ err: error, correlationId }, 'Erro não tratado');
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Erro interno do servidor.',
    correlationId
  });
};
