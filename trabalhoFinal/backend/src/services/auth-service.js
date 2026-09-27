import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';

export class AuthService {
  constructor(userRepository) {
    this.users = userRepository;
  }

  async login({ email, senha }) {
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(senha, user.senhaHash))) {
      throw new AppError(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha inválidos.');
    }
    if (!user.ativo) throw new AppError(403, 'USUARIO_INATIVO', 'Este usuário está inativo.');

    const token = jwt.sign({ role: user.role }, env.jwtSecret, {
      subject: user.id,
      expiresIn: env.jwtExpiresIn
    });
    const decoded = jwt.decode(token);
    return { token, expiraEm: new Date(decoded.exp * 1000).toISOString() };
  }
}
