import type { Role } from '../domain/models.js';

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
      auth?: {
        userId: string;
        role: Role;
      };
    }
  }
}

export {};
