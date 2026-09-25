import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/app-error.js';
import { adminService } from '../services/admin-service.js';

const updateSchema = z.object({ role: z.enum(['user', 'admin']) });
const idSchema = z.string().uuid();

export async function listUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(200).json(await adminService.listUsers());
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = idSchema.safeParse(req.params.id);
    const body = updateSchema.safeParse(req.body);
    if (!id.success || !body.success) throw new AppError(400, 'VALIDATION_ERROR', 'Dados inválidos.');
    res.status(200).json(await adminService.updateUserRole(id.data, body.data.role));
  } catch (error) {
    next(error);
  }
}
