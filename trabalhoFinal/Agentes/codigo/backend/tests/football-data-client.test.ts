import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  process.env = {
    ...ORIGINAL_ENV,
    NODE_ENV: 'test',
    JWT_SECRET: '12345678901234567890123456789012',
    FOOTBALL_DATA_API_KEY: 'test-key',
    FOOTBALL_DATA_BASE_URL: 'https://example.test/v4',
    FOOTBALL_DATA_TIMEOUT_MS: '1000',
    FOOTBALL_DATA_MAX_RETRIES: '1',
    CIRCUIT_FAILURE_THRESHOLD: '5',
    CIRCUIT_RESET_TIMEOUT_MS: '30000',
    CACHE_TTL_MS: '1000'
  };
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
});

describe('FootballDataClient retry', () => {
  it('tenta novamente em 5xx temporário', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const { FootballDataClient } = await import('../src/clients/football-data-client.js');
    const client = new FootballDataClient();
    const pending = client.get<{ ok: boolean }>('/competitions', { cache: false });
    await vi.runAllTimersAsync();

    await expect(pending).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('aborta por timeout e faz somente o retry configurado', async () => {
    const fetchMock = vi.fn((_url: unknown, init?: RequestInit) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
    }));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const { FootballDataClient } = await import('../src/clients/football-data-client.js');
    const client = new FootballDataClient();
    const pending = client.get('/competitions', { cache: false });
    const expectation = expect(pending).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE_ERROR' });
    await vi.runAllTimersAsync();

    await expectation;
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('não aplica retry indiscriminadamente em 4xx', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 400 }));
    vi.stubGlobal('fetch', fetchMock);

    const { FootballDataClient } = await import('../src/clients/football-data-client.js');
    const client = new FootballDataClient();

    await expect(client.get('/competitions', { cache: false })).rejects.toMatchObject({ code: 'EXTERNAL_SERVICE_ERROR' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
