import type { Role } from '../domain/models.js';
import { AppError } from '../errors/app-error.js';
import { userRepository } from '../repositories/user-repository.js';
import { userService } from './user-service.js';

export const adminService = {
  async listUsers() {
    const users = await userRepository.list();
    return users.map(userService.toPublic);
  },

  async updateUserRole(id: string, role: Role) {
    const existing = await userRepository.findById(id);
    if (!existing) throw new AppError(404, 'USER_NOT_FOUND', 'Usuário não encontrado.');
    const user = await userRepository.updateRole(id, role);
    return userService.toPublic(user);
  }
};
