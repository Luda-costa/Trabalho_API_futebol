import path from 'node:path';
import { env } from '../config/env.js';
import { JsonFileRepository } from './json-file-repository.js';

export class UserRepository {
  constructor(fileRepository = new JsonFileRepository(path.join(env.dataDirectory, 'usuarios.json'))) {
    this.file = fileRepository;
  }

  async findByEmail(email) {
    const normalized = email.trim().toLowerCase();
    return (await this.file.readAll()).find((user) => user.email === normalized) ?? null;
  }

  async findById(id) {
    return (await this.file.readAll()).find((user) => user.id === id) ?? null;
  }

  async list({ page, pageSize }) {
    const users = await this.file.readAll();
    const start = (page - 1) * pageSize;
    return { items: users.slice(start, start + pageSize), total: users.length };
  }

  async create(user) {
    return this.file.update((users) => {
      if (users.some((item) => item.email === user.email)) return null;
      users.push(user);
      return user;
    });
  }

  async updateActive(id, active) {
    return this.file.update((users) => {
      const user = users.find((item) => item.id === id);
      if (!user) return null;
      user.ativo = active;
      return user;
    });
  }
}
