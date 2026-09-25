import bcrypt from 'bcryptjs';
import type { User } from '../domain/models.js';
import { AppError } from '../errors/app-error.js';
import { userRepository } from '../repositories/user-repository.js';
import type { UsuarioPublicoDto } from '../contracts/dtos.js';

function toPublic(user: User): UsuarioPublicoDto {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
    criadoEm: user.criadoEm.toISOString()
  };
}

export const userService = {
  async create(input: { nome: string; email: string; senha: string }): Promise<UsuarioPublicoDto> {
    const email = input.email.trim().toLowerCase();
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError(400, 'EMAIL_ALREADY_EXISTS', 'E-mail já cadastrado.');
    }

    const senhaHash = await bcrypt.hash(input.senha, 12);
    const user = await userRepository.create({
      nome: input.nome.trim(),
      email,
      senhaHash
    });

    return toPublic(user);
  },

  toPublic
};
