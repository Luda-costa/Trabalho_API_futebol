import { describe, expect, it, vi } from 'vitest';
import { CircuitBreaker } from '../src/clients/circuit-breaker.js';

describe('CircuitBreaker', () => {
  it('abre após atingir o limite de falhas', async () => {
    const breaker = new CircuitBreaker(2, 10_000);
    const failing = () => Promise.reject(new Error('falha'));

    await expect(breaker.execute(failing)).rejects.toThrow('falha');
    await expect(breaker.execute(failing)).rejects.toThrow('falha');
    expect(breaker.getState()).toBe('OPEN');
  });

  it('volta para HALF_OPEN após o timeout', async () => {
    vi.useFakeTimers();
    const breaker = new CircuitBreaker(1, 1000);
    await expect(breaker.execute(() => Promise.reject(new Error('falha')))).rejects.toThrow();
    expect(breaker.getState()).toBe('OPEN');
    vi.advanceTimersByTime(1001);
    expect(breaker.getState()).toBe('HALF_OPEN');
    vi.useRealTimers();
  });
});
