import { randomUUID } from 'node:crypto';
import { AppError } from '../errors/app-error.js';

function publicFavorite(favorite) {
  const { usuarioId: _usuarioId, ...safeFavorite } = favorite;
  return safeFavorite;
}

export class FavoriteService {
  constructor(favoriteRepository, footballDataClient) {
    this.favorites = favoriteRepository;
    this.football = footballDataClient;
  }

  async list(userId, pagination) {
    const result = await this.favorites.listByUser(userId, pagination);
    return {
      dados: result.items.map(publicFavorite),
      paginacao: { ...pagination, total: result.total }
    };
  }

  async create(userId, input, correlationId) {
    const resource = input.tipo === 'TIME'
      ? `/teams/${encodeURIComponent(input.itemExternoId)}`
      : `/competitions/${encodeURIComponent(input.itemExternoId)}`;
    await this.football.get(resource, {}, correlationId);

    const favorite = {
      id: randomUUID(),
      usuarioId: userId,
      tipo: input.tipo,
      itemExternoId: input.itemExternoId,
      criadoEm: new Date().toISOString()
    };
    const created = await this.favorites.create(favorite);
    if (!created) throw new AppError(409, 'FAVORITO_DUPLICADO', 'Este item já está nos seus favoritos.');
    return publicFavorite(created);
  }

  async remove(userId, favoriteId) {
    const result = await this.favorites.removeOwned(favoriteId, userId);
    if (result.status === 'not_found') throw new AppError(404, 'FAVORITO_NAO_ENCONTRADO', 'Favorito não encontrado.');
    if (result.status === 'forbidden') throw new AppError(403, 'ACESSO_NEGADO', 'Você não pode remover o favorito de outro usuário.');
  }
}
