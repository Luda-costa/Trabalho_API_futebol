import type { Favorite, FavoriteType } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const favoriteRepository = {
  findDuplicate(usuarioId: string, tipo: FavoriteType, itemExternoId: number): Promise<Favorite | null> {
    return prisma.favorite.findUnique({
      where: {
        usuarioId_tipo_itemExternoId: { usuarioId, tipo, itemExternoId }
      }
    });
  },

  create(data: { usuarioId: string; tipo: FavoriteType; itemExternoId: number }): Promise<Favorite> {
    return prisma.favorite.create({ data });
  },

  listByUser(usuarioId: string): Promise<Favorite[]> {
    return prisma.favorite.findMany({
      where: { usuarioId },
      orderBy: { criadoEm: 'desc' }
    });
  },

  findById(id: string): Promise<Favorite | null> {
    return prisma.favorite.findUnique({ where: { id } });
  },

  async delete(id: string): Promise<void> {
    await prisma.favorite.delete({ where: { id } });
  }
};
