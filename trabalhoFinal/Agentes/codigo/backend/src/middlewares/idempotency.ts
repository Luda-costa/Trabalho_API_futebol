import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';

interface CachedResponse {
  status: number;
  body: unknown;
  expiresAt: number;
}

const TTL_MS = 10 * 60 * 1000;
const store = new Map<string, CachedResponse>();

function cleanup(now: number): void {
  for (const [key, value] of store.entries()) {
    if (value.expiresAt <= now) store.delete(key);
  }
}

export function idempotency(req: Request, res: Response, next: NextFunction): void {
  const key = req.header('idempotency-key')?.trim();
  if (!key) {
    next(new AppError(400, 'IDEMPOTENCY_KEY_REQUIRED', 'Header Idempotency-Key é obrigatório.'));
    return;
  }

  const userId = req.auth?.userId ?? 'anonymous';
  const storageKey = `${userId}:${req.method}:${req.originalUrl}:${key}`;
  const now = Date.now();
  cleanup(now);

  const cached = store.get(storageKey);
  if (cached) {
    res.status(cached.status).json(cached.body);
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      store.set(storageKey, {
        status: res.statusCode,
        body,
        expiresAt: Date.now() + TTL_MS
      });
    }
    return originalJson(body);
  }) as Response['json'];

  next();
}
