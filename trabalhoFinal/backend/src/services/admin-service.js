import { AppError } from '../errors/app-error.js';
import { publicUser } from './user-service.js';

export class AdminService {
  constructor(userRepository) {
    this.users = userRepository;
  }

  async list(pagination) {
    const result = await this.users.list(pagination);
    return {
      dados: result.items.map(publicUser),
      paginacao: { ...pagination, total: result.total }
    };
  }

  async setActive(id, active) {
    const user = await this.users.updateActive(id, active);
    if (!user) throw new AppError(404, 'USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado.');
    return publicUser(user);
  }
}
