import type { Role } from '@prisma/client';

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
