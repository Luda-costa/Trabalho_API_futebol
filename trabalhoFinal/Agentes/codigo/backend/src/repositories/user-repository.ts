import { randomUUID } from 'node:crypto';
import type { Role, User } from '../domain/models.js';
import { AppError } from '../errors/app-error.js';
import { dataFile } from '../lib/data-files.js';
import { JsonFileStore } from '../lib/json-file-store.js';

interface UserRecord {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  role: Role;
  criadoEm: string;
}

const store = new JsonFileStore<UserRecord[]>(dataFile('usuarios.json'), []);

function fromRecord(record: UserRecord): User {
  return { ...record, criadoEm: new Date(record.criadoEm) };
}

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const users = await store.read();
    const user = users.find((item) => item.email === email);
    return user ? fromRecord(user) : null;
  },

  async findById(id: string): Promise<User | null> {
    const users = await store.read();
    const user = users.find((item) => item.id === id);
    return user ? fromRecord(user) : null;
  },

  async create(data: { nome: string; email: string; senhaHash: string }): Promise<User> {
    return store.update((users) => {
      if (users.some((item) => item.email === data.email)) {
        throw new AppError(400, 'EMAIL_ALREADY_EXISTS', 'E-mail já cadastrado.');
      }

      const record: UserRecord = {
        id: randomUUID(),
        nome: data.nome,
        email: data.email,
        senhaHash: data.senhaHash,
        role: 'user',
        criadoEm: new Date().toISOString()
      };

      users.push(record);
      return fromRecord(record);
    });
  },

  async list(): Promise<User[]> {
    const users = await store.read();
    return users
      .map(fromRecord)
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
  },

  async updateRole(id: string, role: Role): Promise<User> {
    return store.update((users) => {
      const user = users.find((item) => item.id === id);
      if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'Usuário não encontrado.');
      user.role = role;
      return fromRecord(user);
    });
  }
};
