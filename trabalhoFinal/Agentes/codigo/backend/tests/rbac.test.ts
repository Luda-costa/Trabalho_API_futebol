import { describe, expect, it, vi } from 'vitest';
import { requireRole } from '../src/middlewares/require-role.js';
import { AppError } from '../src/errors/app-error.js';

describe('RBAC', () => {
  it('retorna 401 quando não há autenticação', () => {
    const next = vi.fn();
    requireRole('admin')({} as any, {} as any, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 401, code: 'UNAUTHORIZED' } satisfies Partial<AppError>));
  });

  it('retorna 403 quando user tenta acessar recurso admin', () => {
    const next = vi.fn();
    requireRole('admin')({ auth: { userId: 'u1', role: 'user' } } as any, {} as any, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 403, code: 'FORBIDDEN' } satisfies Partial<AppError>));
  });

  it('permite admin', () => {
    const next = vi.fn();
    requireRole('admin')({ auth: { userId: 'u1', role: 'admin' } } as any, {} as any, next);
    expect(next).toHaveBeenCalledWith();
  });
});
