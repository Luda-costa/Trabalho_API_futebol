import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/app-error.js';
import { authService } from '../services/auth-service.js';

const schema = z.object({
  email: z.string().trim().email(),
  senha: z.string().min(1)
});

export async function createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Credenciais inválidas.');
    res.status(200).json(await authService.login(parsed.data));
  } catch (error) {
    next(error);
  }
}
