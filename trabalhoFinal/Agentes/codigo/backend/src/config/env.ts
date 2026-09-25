import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('2h'),
  FOOTBALL_DATA_API_KEY: z.string().min(1),
  FOOTBALL_DATA_BASE_URL: z.string().url().default('https://api.football-data.org/v4'),
  FOOTBALL_DATA_TIMEOUT_MS: z.coerce.number().int().positive().default(4000),
  FOOTBALL_DATA_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2),
  CIRCUIT_FAILURE_THRESHOLD: z.coerce.number().int().positive().default(5),
  CIRCUIT_RESET_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  CACHE_TTL_MS: z.coerce.number().int().positive().default(30000),
  CORS_ORIGIN: z.string().default('http://localhost:5173')
});

const result = schema.safeParse(process.env);
if (!result.success) {
  throw new Error(`Variáveis de ambiente inválidas: ${result.error.message}`);
}

export const env = result.data;
