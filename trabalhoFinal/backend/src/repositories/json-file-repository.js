import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const writeQueues = new Map();

export class JsonFileRepository {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async initialize() {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      await readFile(this.filePath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await writeFile(this.filePath, '[]\n', 'utf8');
    }
  }

  async readAll() {
    await this.initialize();
    const content = await readFile(this.filePath, 'utf8');
    const data = JSON.parse(content);
    if (!Array.isArray(data)) throw new Error(`O arquivo ${this.filePath} deve conter um array JSON.`);
    return data;
  }

  async update(mutator) {
    const previous = writeQueues.get(this.filePath) ?? Promise.resolve();
    const operation = previous.then(async () => {
      const current = await this.readAll();
      const result = await mutator(current);
      await this.writeAll(current);
      return result;
    });

    writeQueues.set(this.filePath, operation.catch(() => undefined));
    return operation;
  }

  async writeAll(data) {
    const temporaryPath = `${this.filePath}.${randomUUID()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    await rename(temporaryPath, this.filePath);
  }
}
