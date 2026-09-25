import { env } from '../config/env.js';
import { requestContext } from '../context/request-context.js';
import { AppError } from '../errors/app-error.js';
import { logger } from '../lib/logger.js';
import { CircuitBreaker } from './circuit-breaker.js';
import { ExpiringCache } from './expiring-cache.js';

interface RequestOptions {
  query?: Record<string, string | number | undefined>;
  cache?: boolean;
}

class RetryableExternalError extends Error {
  constructor(public readonly status?: number, message = 'Falha externa temporária') {
    super(message);
  }
}

export class FootballDataClient {
  private readonly cache = new ExpiringCache<unknown>(env.CACHE_TTL_MS);
  private readonly breaker = new CircuitBreaker(
    env.CIRCUIT_FAILURE_THRESHOLD,
    env.CIRCUIT_RESET_TIMEOUT_MS
  );

  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(`${env.FOOTBALL_DATA_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`);
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const cacheKey = url.toString();
    if (options.cache !== false) {
      const cached = this.cache.get(cacheKey);
      if (cached !== undefined) return cached as T;
    }

    let value: T;
    try {
      value = await this.breaker.execute(
        () => this.withRetry<T>(url),
        (error) => error instanceof RetryableExternalError
      );
    } catch (error) {
      if (error instanceof RetryableExternalError) {
        throw new AppError(502, 'EXTERNAL_SERVICE_ERROR', 'Falha definitiva ao consultar o serviço externo.');
      }
      throw error;
    }

    if (options.cache !== false) this.cache.set(cacheKey, value);
    return value;
  }

  private async withRetry<T>(url: URL): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= env.FOOTBALL_DATA_MAX_RETRIES; attempt += 1) {
      try {
        return await this.singleRequest<T>(url);
      } catch (error) {
        lastError = error;
        const retryable = error instanceof RetryableExternalError;
        if (!retryable || attempt >= env.FOOTBALL_DATA_MAX_RETRIES) break;

        const base = 250 * 2 ** attempt;
        const jitter = Math.floor(Math.random() * 100);
        await new Promise((resolve) => setTimeout(resolve, base + jitter));
      }
    }

    if (lastError instanceof AppError || lastError instanceof RetryableExternalError) throw lastError;
    throw new AppError(502, 'EXTERNAL_SERVICE_ERROR', 'Falha ao consultar o serviço externo.');
  }

  private async singleRequest<T>(url: URL): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.FOOTBALL_DATA_TIMEOUT_MS);
    const correlationId = requestContext.correlationId();

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Auth-Token': env.FOOTBALL_DATA_API_KEY,
          ...(correlationId ? { 'X-Correlation-Id': correlationId } : {})
        },
        signal: controller.signal
      });

      if (response.status >= 500) {
        throw new RetryableExternalError(response.status);
      }

      if (!response.ok) {
        logger.warn({
          correlationId,
          externalStatus: response.status,
          path: url.pathname
        }, 'Resposta não bem-sucedida da football-data.org');

        throw new AppError(502, 'EXTERNAL_SERVICE_ERROR', 'Serviço externo rejeitou a solicitação.');
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof AppError || error instanceof RetryableExternalError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new RetryableExternalError(undefined, 'Timeout na API externa');
      }
      if (error instanceof TypeError) {
        throw new AppError(502, 'EXTERNAL_SERVICE_ERROR', 'Falha de rede ao consultar o serviço externo.');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const footballDataClient = new FootballDataClient();
