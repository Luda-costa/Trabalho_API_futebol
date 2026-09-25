import { z } from 'zod';

export const userInput = z.object({
  nome: z.string().trim().min(2).max(100),
  email: z.email(),
  senha: z.string().min(8).max(100)
}).strict();

export const credentials = z.object({ email: z.email(), senha: z.string().min(1) }).strict();

export const favoriteInput = z.object({
  tipo: z.enum(['TIME', 'CAMPEONATO']),
  itemExternoId: z.string().trim().min(1)
}).strict();

export const activeInput = z.object({ ativo: z.boolean() }).strict();

export const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const competitionQuery = pagination.extend({ pais: z.string().trim().optional() });

export const competitionMatchesQuery = pagination.extend({
  dataInicio: z.iso.date().optional(),
  dataFim: z.iso.date().optional(),
  status: z.enum(['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED', 'EXTRA_TIME', 'PENALTY_SHOOTOUT', 'FINISHED', 'SUSPENDED', 'POSTPONED', 'CANCELLED', 'AWARDED']).optional()
});

export const matchesQuery = pagination.extend({
  dataInicio: z.iso.date().optional(),
  dataFim: z.iso.date().optional(),
  timeId: z.coerce.number().int().positive().optional()
});
