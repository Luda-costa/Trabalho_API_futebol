import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  process.env = {
    ...ORIGINAL_ENV,
    NODE_ENV: 'test',
    JWT_SECRET: '12345678901234567890123456789012',
    FOOTBALL_DATA_API_KEY: 'test-key'
  };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('JWT middleware', () => {
  it('retorna 401 sem Bearer token', async () => {
    const { authenticate } = await import('../src/middlewares/auth.js');
    const next = vi.fn();
    authenticate({ header: vi.fn().mockReturnValue(undefined) } as any, {} as any, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 401, code: 'UNAUTHORIZED' }));
  });

  it('aceita JWT com sub e role', async () => {
    const { authenticate } = await import('../src/middlewares/auth.js');
    const token = jwt.sign({ role: 'user' }, process.env.JWT_SECRET!, { subject: 'u1', expiresIn: '1h' });
    const req: any = { header: vi.fn().mockReturnValue(`Bearer ${token}`) };
    const next = vi.fn();
    authenticate(req, {} as any, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.auth).toEqual({ userId: 'u1', role: 'user' });
  });
});
