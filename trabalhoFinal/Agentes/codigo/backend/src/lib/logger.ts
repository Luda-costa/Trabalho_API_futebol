import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.x-auth-token',
      'password',
      'senha',
      'token',
      'JWT_SECRET',
      'FOOTBALL_DATA_API_KEY'
    ],
    censor: '[REDACTED]'
  }
});
