import { AppError } from '../errors/app-error.js';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private openedAt = 0;
  private halfOpenInFlight = false;

  constructor(
    private readonly failureThreshold: number,
    private readonly resetTimeoutMs: number
  ) {}

  getState(): CircuitState {
    if (this.state === 'OPEN' && Date.now() - this.openedAt >= this.resetTimeoutMs) {
      this.state = 'HALF_OPEN';
      this.halfOpenInFlight = false;
    }
    return this.state;
  }

  async execute<T>(
    operation: () => Promise<T>,
    shouldCountFailure: (error: unknown) => boolean = () => true
  ): Promise<T> {
    const state = this.getState();
    if (state === 'OPEN') {
      throw new AppError(502, 'EXTERNAL_CIRCUIT_OPEN', 'Serviço externo temporariamente indisponível.');
    }
    if (state === 'HALF_OPEN' && this.halfOpenInFlight) {
      throw new AppError(502, 'EXTERNAL_CIRCUIT_OPEN', 'Serviço externo em recuperação.');
    }

    if (state === 'HALF_OPEN') this.halfOpenInFlight = true;

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      if (shouldCountFailure(error)) this.onFailure();
      throw error;
    } finally {
      this.halfOpenInFlight = false;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    this.openedAt = 0;
  }

  private onFailure(): void {
    this.failures += 1;
    if (this.state === 'HALF_OPEN' || this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.openedAt = Date.now();
    }
  }
}
