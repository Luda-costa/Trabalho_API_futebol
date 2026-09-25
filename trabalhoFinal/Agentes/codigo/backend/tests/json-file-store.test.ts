import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { JsonFileStore } from '../src/lib/json-file-store.js';

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('JsonFileStore', () => {
  it('cria o arquivo e persiste alterações', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'futebol-sdd-'));
    directories.push(directory);
    const file = path.join(directory, 'dados.json');
    const store = new JsonFileStore<Array<{ id: number }>>(file, []);

    await store.update((items) => {
      items.push({ id: 1 });
    });

    expect(await store.read()).toEqual([{ id: 1 }]);
    expect(JSON.parse(await readFile(file, 'utf8'))).toEqual([{ id: 1 }]);
  });
});
