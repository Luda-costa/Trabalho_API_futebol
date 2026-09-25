import { randomUUID } from 'node:crypto';
import type { Favorite, FavoriteType } from '../domain/models.js';
import { AppError } from '../errors/app-error.js';
import { dataFile } from '../lib/data-files.js';
import { JsonFileStore } from '../lib/json-file-store.js';

interface FavoriteRecord {
  id: string;
  usuarioId: string;
  tipo: FavoriteType;
  itemExternoId: number;
  criadoEm: string;
}

const store = new JsonFileStore<FavoriteRecord[]>(dataFile('favoritos.json'), []);

function fromRecord(record: FavoriteRecord): Favorite {
  return { ...record, criadoEm: new Date(record.criadoEm) };
}

export const favoriteRepository = {
  async findDuplicate(usuarioId: string, tipo: FavoriteType, itemExternoId: number): Promise<Favorite | null> {
    const favorites = await store.read();
    const favorite = favorites.find(
      (item) => item.usuarioId === usuarioId && item.tipo === tipo && item.itemExternoId === itemExternoId
    );
    return favorite ? fromRecord(favorite) : null;
  },

  async create(data: { usuarioId: string; tipo: FavoriteType; itemExternoId: number }): Promise<Favorite> {
    return store.update((favorites) => {
      const duplicate = favorites.some(
        (item) => item.usuarioId === data.usuarioId && item.tipo === data.tipo && item.itemExternoId === data.itemExternoId
      );
      if (duplicate) {
        throw new AppError(400, 'FAVORITE_ALREADY_EXISTS', 'Item já está nos favoritos do usuário.');
      }

      const record: FavoriteRecord = {
        id: randomUUID(),
        usuarioId: data.usuarioId,
        tipo: data.tipo,
        itemExternoId: data.itemExternoId,
        criadoEm: new Date().toISOString()
      };

      favorites.push(record);
      return fromRecord(record);
    });
  },

  async listByUser(usuarioId: string): Promise<Favorite[]> {
    const favorites = await store.read();
    return favorites
      .filter((item) => item.usuarioId === usuarioId)
      .map(fromRecord)
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
  },

  async findById(id: string): Promise<Favorite | null> {
    const favorites = await store.read();
    const favorite = favorites.find((item) => item.id === id);
    return favorite ? fromRecord(favorite) : null;
  },

  async delete(id: string): Promise<void> {
    await store.update((favorites) => {
      const index = favorites.findIndex((item) => item.id === id);
      if (index >= 0) favorites.splice(index, 1);
    });
  }
};
