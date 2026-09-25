import assert from 'node:assert/strict';
import test from 'node:test';
import { FootballDataClient } from '../src/clients/football-data-client.js';

test('repete erro 5xx temporário e retorna a tentativa seguinte', async () => {
  let calls = 0;
  const client = new FootballDataClient({
    apiKey: 'test-key',
    maxAttempts: 2,
    fetch: async () => {
      calls += 1;
      if (calls === 1) return new Response('{}', { status: 503 });
      return new Response('{"competitions":[]}', { status: 200 });
    }
  });
  client.backoff = async () => undefined;

  const result = await client.get('/competitions', {}, '00000000-0000-4000-8000-000000000000');

  assert.equal(calls, 2);
  assert.deepEqual(result, { competitions: [] });
});

test('não repete resposta 4xx', async () => {
  let calls = 0;
  const client = new FootballDataClient({
    apiKey: 'test-key',
    maxAttempts: 3,
    fetch: async () => {
      calls += 1;
      return new Response('{}', { status: 404 });
    }
  });

  await assert.rejects(() => client.get('/teams/0', {}, '00000000-0000-4000-8000-000000000000'), (error) => error.status === 404);
  assert.equal(calls, 1);
});
