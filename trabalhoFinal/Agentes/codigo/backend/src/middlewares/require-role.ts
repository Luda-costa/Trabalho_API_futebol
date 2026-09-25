import type { Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new AppError(401, 'UNAUTHORIZED', 'Autenticação obrigatória.'));
      return;
    }

    if (!roles.includes(req.auth.role)) {
      next(new AppError(403, 'FORBIDDEN', 'Usuário sem permissão para este recurso.'));
      return;
    }

    next();
  };
}
