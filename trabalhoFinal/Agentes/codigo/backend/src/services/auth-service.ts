import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import { userRepository } from '../repositories/user-repository.js';
import { userService } from './user-service.js';

export const authService = {
  async login(input: { email: string; senha: string }) {
    const user = await userRepository.findByEmail(input.email.trim().toLowerCase());
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha inválidos.');
    }

    const ok = await bcrypt.compare(input.senha, user.senhaHash);
    if (!ok) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha inválidos.');
    }

    const token = jwt.sign(
      { role: user.role },
      env.JWT_SECRET,
      { subject: user.id, expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    return { token, usuario: userService.toPublic(user) };
  }
};
