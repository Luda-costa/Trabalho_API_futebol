import type { Role, User } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const userRepository = {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: { nome: string; email: string; senhaHash: string }): Promise<User> {
    return prisma.user.create({ data });
  },

  list(): Promise<User[]> {
    return prisma.user.findMany({ orderBy: { criadoEm: 'desc' } });
  },

  updateRole(id: string, role: Role): Promise<User> {
    return prisma.user.update({ where: { id }, data: { role } });
  }
};
