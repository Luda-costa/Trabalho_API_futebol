import { beforeEach, describe, expect, it, vi } from 'vitest';

const repo = vi.hoisted(() => ({
  findDuplicate: vi.fn(),
  create: vi.fn(),
  listByUser: vi.fn(),
  findById: vi.fn(),
  delete: vi.fn()
}));

vi.mock('../src/repositories/favorite-repository.js', () => ({ favoriteRepository: repo }));

describe('favoriteService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('bloqueia favorito duplicado', async () => {
    repo.findDuplicate.mockResolvedValue({ id: 'f1' });
    const { favoriteService } = await import('../src/services/favorite-service.js');
    await expect(favoriteService.create('u1', { tipo: 'time', itemExternoId: 10 }))
      .rejects.toMatchObject({ code: 'FAVORITE_ALREADY_EXISTS' });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('impede remover favorito de outro usuário', async () => {
    repo.findById.mockResolvedValue({ id: 'f1', usuarioId: 'u2' });
    const { favoriteService } = await import('../src/services/favorite-service.js');
    await expect(favoriteService.remove('u1', 'f1')).rejects.toMatchObject({ status: 403, code: 'FORBIDDEN' });
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
