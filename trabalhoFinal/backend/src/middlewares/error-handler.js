import { AppError } from '../errors/app-error.js';

export function notFound(req, _res, next) {
  next(new AppError(404, 'ROTA_NAO_ENCONTRADA', `Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, req, res, _next) {
  const knownError = error instanceof AppError;
  const status = knownError ? error.status : 500;
  const code = knownError ? error.code : 'ERRO_INTERNO';
  const message = knownError ? error.message : 'Ocorreu um erro interno inesperado.';

  if (!knownError) {
    console.error({ correlationId: req.correlationId, error });
  }

  res.status(status).json({
    error: {
      code,
      message,
      correlationId: req.correlationId
    }
  });
}
