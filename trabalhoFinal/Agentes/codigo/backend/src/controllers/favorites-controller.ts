import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/app-error.js';
import { favoriteService } from '../services/favorite-service.js';

const createSchema = z.object({
  tipo: z.enum(['time', 'campeonato']),
  itemExternoId: z.coerce.number().int().positive()
});

const idSchema = z.string().uuid();

export async function createFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Favorito inválido.');
    const item = await favoriteService.create(req.auth!.userId, parsed.data);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

export async function listFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(200).json(await favoriteService.list(req.auth!.userId));
  } catch (error) {
    next(error);
  }
}

export async function deleteFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = idSchema.safeParse(req.params.id);
    if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'ID de favorito inválido.');
    await favoriteService.remove(req.auth!.userId, parsed.data);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
