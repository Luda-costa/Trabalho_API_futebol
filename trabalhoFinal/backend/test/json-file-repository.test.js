import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { JsonFileRepository } from '../src/repositories/json-file-repository.js';

test('serializa escritas concorrentes sem perder registros', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'futebol-json-'));
  const filePath = path.join(directory, 'dados.json');
  const repository = new JsonFileRepository(filePath);

  try {
    await Promise.all(Array.from({ length: 10 }, (_, index) =>
      repository.update((items) => items.push({ id: index }))
    ));

    const stored = JSON.parse(await readFile(filePath, 'utf8'));
    assert.equal(stored.length, 10);
    assert.deepEqual(stored.map((item) => item.id).sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
