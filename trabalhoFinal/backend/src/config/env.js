import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
export const backendRoot = path.resolve(currentDirectory, '../..');

dotenv.config({ path: path.resolve(backendRoot, '../.env'), quiet: true });

function numberFromEnvironment(name, fallback) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: numberFromEnvironment('PORT', 3000),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  footballApiKey: process.env.API_KEY_FOOTBALL,
  footballApiUrl: 'https://api.football-data.org/v4',
  externalTimeoutMs: numberFromEnvironment('EXTERNAL_TIMEOUT_MS', 5000),
  externalMaxAttempts: numberFromEnvironment('EXTERNAL_MAX_ATTEMPTS', 3),
  circuitFailureThreshold: numberFromEnvironment('CIRCUIT_FAILURE_THRESHOLD', 5),
  circuitOpenMs: numberFromEnvironment('CIRCUIT_OPEN_MS', 30000),
  cacheTtlMs: numberFromEnvironment('CACHE_TTL_MS', 60000),
  dataDirectory: process.env.DATA_DIRECTORY
    ? path.resolve(process.env.DATA_DIRECTORY)
    : path.resolve(backendRoot, 'data')
});

export function validateEnvironment() {
  const missing = [];
  if (!env.jwtSecret) missing.push('JWT_SECRET');
  if (!env.footballApiKey) missing.push('API_KEY_FOOTBALL');

  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`);
  }
}
