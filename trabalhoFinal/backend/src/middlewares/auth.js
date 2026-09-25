import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';

export function authenticate(req, _res, next) {
  const [scheme, token] = (req.get('Authorization') ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new AppError(401, 'NAO_AUTENTICADO', 'Token de autenticação ausente.'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return next(new AppError(401, 'TOKEN_INVALIDO', 'Token inválido ou expirado.'));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, 'ACESSO_NEGADO', 'Você não possui permissão para este recurso.'));
    }
    return next();
  };
}
