import { randomUUID } from 'node:crypto';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function correlationId(req, res, next) {
  const received = req.get('X-Correlation-Id');
  req.correlationId = received && UUID_PATTERN.test(received) ? received : randomUUID();
  res.set('X-Correlation-Id', req.correlationId);
  next();
}
