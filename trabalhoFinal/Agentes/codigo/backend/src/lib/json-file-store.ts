import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export class JsonFileStore<T> {
  private queue: Promise<void> = Promise.resolve();

  constructor(
    private readonly filePath: string,
    private readonly initialValue: T
  ) {}

  async read(): Promise<T> {
    await this.queue;
    return this.readInternal();
  }

  async update<R>(updater: (data: T) => R | Promise<R>): Promise<R> {
    const task = this.queue.then(async () => {
      const data = await this.readInternal();
      const result = await updater(data);
      await this.writeInternal(data);
      return result;
    });

    this.queue = task.then(
      () => undefined,
      () => undefined
    );

    return task;
  }

  private async readInternal(): Promise<T> {
    await this.ensureFile();
    const content = await readFile(this.filePath, 'utf8');

    try {
      return JSON.parse(content) as T;
    } catch {
      throw new Error(`Arquivo JSON inválido: ${this.filePath}`);
    }
  }

  private async writeInternal(data: T): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    await rename(temporaryPath, this.filePath);
  }

  private async ensureFile(): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      await readFile(this.filePath, 'utf8');
    } catch (error: any) {
      if (error?.code !== 'ENOENT') throw error;
      await writeFile(this.filePath, `${JSON.stringify(this.initialValue, null, 2)}\n`, 'utf8');
    }
  }
}
