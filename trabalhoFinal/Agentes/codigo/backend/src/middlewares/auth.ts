import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';

interface JwtPayload {
  sub: string;
  role: Role;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authorization = req.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    next(new AppError(401, 'UNAUTHORIZED', 'Token de autenticação ausente.'));
    return;
  }

  const token = authorization.slice('Bearer '.length).trim();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & Partial<JwtPayload>;
    if (!decoded.sub || (decoded.role !== 'user' && decoded.role !== 'admin')) {
      throw new Error('payload inválido');
    }

    req.auth = { userId: decoded.sub, role: decoded.role };
    next();
  } catch {
    next(new AppError(401, 'UNAUTHORIZED', 'Token inválido ou expirado.'));
  }
}
