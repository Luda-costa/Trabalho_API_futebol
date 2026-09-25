import { createHash } from 'node:crypto';
import { AppError } from '../errors/app-error.js';

const storedResponses = new Map();
const TTL_MS = 15 * 60 * 1000;

export function idempotency(req, res, next) {
  const key = req.get('Idempotency-Key');
  if (!key) return next();

  const storageKey = `${req.user.id}:${key}`;
  const fingerprint = createHash('sha256').update(JSON.stringify(req.body)).digest('hex');
  const stored = storedResponses.get(storageKey);

  if (stored && stored.expiresAt > Date.now()) {
    if (stored.fingerprint !== fingerprint) {
      return next(new AppError(409, 'CHAVE_IDEMPOTENCIA_REUTILIZADA', 'A Idempotency-Key já foi usada com outro conteúdo.'));
    }
    return res.status(stored.status).json(stored.body);
  }
  if (stored) storedResponses.delete(storageKey);

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      storedResponses.set(storageKey, {
        fingerprint,
        status: res.statusCode,
        body,
        expiresAt: Date.now() + TTL_MS
      });
    }
    return originalJson(body);
  };
  return next();
}
