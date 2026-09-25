import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/app-error.js';
import { userService } from '../services/user-service.js';

const createSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  senha: z.string().min(8).max(128)
});

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Dados de cadastro inválidos.');
    const user = await userService.create(parsed.data);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}
