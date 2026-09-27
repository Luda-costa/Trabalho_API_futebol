import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { AppError } from '../errors/app-error.js';

export function publicUser(user) {
  const { senhaHash: _senhaHash, ...safeUser } = user;
  return safeUser;
}

export class UserService {
  constructor(userRepository) {
    this.users = userRepository;
  }

  async register(input) {
    const email = input.email.trim().toLowerCase();
    if (await this.users.findByEmail(email)) {
      throw new AppError(409, 'EMAIL_JA_CADASTRADO', 'Já existe um usuário com este e-mail.');
    }

    const user = {
      id: randomUUID(),
      nome: input.nome.trim(),
      email,
      senhaHash: await bcrypt.hash(input.senha, 12),
      role: 'user',
      ativo: true,
      criadoEm: new Date().toISOString()
    };
    const created = await this.users.create(user);
    if (!created) throw new AppError(409, 'EMAIL_JA_CADASTRADO', 'Já existe um usuário com este e-mail.');
    return publicUser(user);
  }
}
