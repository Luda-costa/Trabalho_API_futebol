import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';

const TRANSIENT_STATUS = new Set([500, 502, 503, 504]);

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export class FootballDataClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl ?? env.footballApiUrl;
    this.apiKey = options.apiKey ?? env.footballApiKey;
    this.timeoutMs = options.timeoutMs ?? env.externalTimeoutMs;
    this.maxAttempts = options.maxAttempts ?? env.externalMaxAttempts;
    this.failureThreshold = options.failureThreshold ?? env.circuitFailureThreshold;
    this.openMs = options.openMs ?? env.circuitOpenMs;
    this.cacheTtlMs = options.cacheTtlMs ?? env.cacheTtlMs;
    this.fetch = options.fetch ?? globalThis.fetch;
    this.cache = new Map();
    this.circuit = { state: 'CLOSED', failures: 0, openedAt: 0, probeRunning: false };
  }

  async get(resourcePath, query = {}, correlationId) {
    if (!this.apiKey) {
      throw new AppError(500, 'CONFIGURACAO_AUSENTE', 'A chave da API de futebol não foi configurada.');
    }

    const url = new URL(`${this.baseUrl}${resourcePath}`);
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    }

    const cacheKey = url.toString();
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return structuredClone(cached.value);
    if (cached) this.cache.delete(cacheKey);

    this.assertCircuitAllowsRequest();

    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await this.fetch(url, {
          headers: {
            'X-Auth-Token': this.apiKey,
            'X-Correlation-Id': correlationId
          },
          signal: controller.signal
        });

        if (response.status === 404) {
          this.recordSuccess();
          throw new AppError(404, 'RECURSO_NAO_ENCONTRADO', 'Recurso esportivo não encontrado.');
        }

        if (!response.ok) {
          if (TRANSIENT_STATUS.has(response.status) && attempt < this.maxAttempts) {
            await this.backoff(attempt);
            continue;
          }
          throw new AppError(502, 'API_EXTERNA_INDISPONIVEL', 'Não foi possível consultar os dados esportivos.');
        }

        const payload = await response.json();
        this.recordSuccess();
        this.cache.set(cacheKey, { value: payload, expiresAt: Date.now() + this.cacheTtlMs });
        return structuredClone(payload);
      } catch (error) {
        if (error instanceof AppError && error.status === 404) throw error;
        const transient = error.name === 'AbortError' || !(error instanceof AppError);
        if (transient && attempt < this.maxAttempts) {
          await this.backoff(attempt);
          continue;
        }
        this.recordFailure();
        if (error instanceof AppError) throw error;
        throw new AppError(502, 'API_EXTERNA_INDISPONIVEL', 'Não foi possível consultar os dados esportivos.');
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new AppError(502, 'API_EXTERNA_INDISPONIVEL', 'Não foi possível consultar os dados esportivos.');
  }

  assertCircuitAllowsRequest() {
    if (this.circuit.state !== 'OPEN') return;
    if (Date.now() - this.circuit.openedAt < this.openMs) {
      throw new AppError(502, 'CIRCUIT_BREAKER_ABERTO', 'A API de futebol está temporariamente indisponível.');
    }
    if (this.circuit.probeRunning) {
      throw new AppError(502, 'CIRCUIT_BREAKER_ABERTO', 'A API de futebol está temporariamente indisponível.');
    }
    this.circuit.state = 'HALF_OPEN';
    this.circuit.probeRunning = true;
  }

  recordSuccess() {
    this.circuit = { state: 'CLOSED', failures: 0, openedAt: 0, probeRunning: false };
  }

  recordFailure() {
    const failures = this.circuit.failures + 1;
    if (this.circuit.state === 'HALF_OPEN' || failures >= this.failureThreshold) {
      this.circuit = { state: 'OPEN', failures, openedAt: Date.now(), probeRunning: false };
      return;
    }
    this.circuit.failures = failures;
    this.circuit.probeRunning = false;
  }

  async backoff(attempt) {
    const base = 300 * (2 ** (attempt - 1));
    await wait(base + Math.floor(Math.random() * 100));
  }
}
