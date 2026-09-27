import path from 'node:path';
import { env } from '../config/env.js';
import { JsonFileRepository } from './json-file-repository.js';

export class FavoriteRepository {
  constructor(fileRepository = new JsonFileRepository(path.join(env.dataDirectory, 'favoritos.json'))) {
    this.file = fileRepository;
  }

  async listByUser(userId, { page, pageSize }) {
    const favorites = (await this.file.readAll()).filter((favorite) => favorite.usuarioId === userId);
    const start = (page - 1) * pageSize;
    return { items: favorites.slice(start, start + pageSize), total: favorites.length };
  }

  async create(favorite) {
    return this.file.update((favorites) => {
      const duplicate = favorites.some((item) =>
        item.usuarioId === favorite.usuarioId
        && item.tipo === favorite.tipo
        && item.itemExternoId === favorite.itemExternoId
      );
      if (duplicate) return null;
      favorites.push(favorite);
      return favorite;
    });
  }

  async removeOwned(id, userId) {
    return this.file.update((favorites) => {
      const index = favorites.findIndex((item) => item.id === id);
      if (index === -1) return { status: 'not_found' };
      if (favorites[index].usuarioId !== userId) return { status: 'forbidden' };
      favorites.splice(index, 1);
      return { status: 'removed' };
    });
  }
}
