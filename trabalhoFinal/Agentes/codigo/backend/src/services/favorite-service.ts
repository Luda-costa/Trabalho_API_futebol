import type { FavoriteType } from '../domain/models.js';
import { AppError } from '../errors/app-error.js';
import { favoriteRepository } from '../repositories/favorite-repository.js';
import type { FavoritoDto } from '../contracts/dtos.js';

function toDto(favorite: {
  id: string;
  tipo: FavoriteType;
  itemExternoId: number;
  criadoEm: Date;
}): FavoritoDto {
  return {
    id: favorite.id,
    tipo: favorite.tipo,
    itemExternoId: favorite.itemExternoId,
    criadoEm: favorite.criadoEm.toISOString()
  };
}

export const favoriteService = {
  async create(usuarioId: string, input: { tipo: FavoriteType; itemExternoId: number }): Promise<FavoritoDto> {
    const duplicate = await favoriteRepository.findDuplicate(usuarioId, input.tipo, input.itemExternoId);
    if (duplicate) {
      throw new AppError(400, 'FAVORITE_ALREADY_EXISTS', 'Item já está nos favoritos do usuário.');
    }

    const favorite = await favoriteRepository.create({ usuarioId, ...input });
    return toDto(favorite);
  },

  async list(usuarioId: string): Promise<FavoritoDto[]> {
    const favorites = await favoriteRepository.listByUser(usuarioId);
    return favorites.map(toDto);
  },

  async remove(usuarioId: string, id: string): Promise<void> {
    const favorite = await favoriteRepository.findById(id);
    if (!favorite) {
      throw new AppError(404, 'FAVORITE_NOT_FOUND', 'Favorito não encontrado.');
    }
    if (favorite.usuarioId !== usuarioId) {
      throw new AppError(403, 'FORBIDDEN', 'Não é permitido remover favorito de outro usuário.');
    }

    await favoriteRepository.delete(id);
  }
};
