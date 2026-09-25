import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/app-error.js';
import { sportsService } from '../services/sports-service.js';

const idSchema = z.coerce.number().int().positive();
const querySchema = z.object({
  pagina: z.coerce.number().int().positive().optional(),
  limite: z.coerce.number().int().positive().max(100).optional(),
  temporada: z.coerce.number().int().min(1900).max(2200).optional(),
  status: z.string().trim().min(1).optional(),
  dataInicio: z.string().trim().min(1).optional(),
  dataFim: z.string().trim().min(1).optional(),
  campeonatoId: z.coerce.number().int().positive().optional()
});

function id(raw: unknown): number {
  const parsed = idSchema.safeParse(raw);
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'ID inválido.');
  return parsed.data;
}

function query(raw: unknown) {
  const parsed = querySchema.safeParse(raw);
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Filtros inválidos.');
  return parsed.data;
}

export const sportsController = {
  async listCompetitions(req: Request, res: Response, next: NextFunction) {
    try { res.json(await sportsService.listCompetitions(query(req.query))); } catch (e) { next(e); }
  },
  async getCompetition(req: Request, res: Response, next: NextFunction) {
    try { res.json(await sportsService.getCompetition(id(req.params.id))); } catch (e) { next(e); }
  },
  async listCompetitionTeams(req: Request, res: Response, next: NextFunction) {
    try { res.json(await sportsService.listCompetitionTeams(id(req.params.id), query(req.query))); } catch (e) { next(e); }
  },
  async listCompetitionMatches(req: Request, res: Response, next: NextFunction) {
    try { res.json(await sportsService.listCompetitionMatches(id(req.params.id), query(req.query))); } catch (e) { next(e); }
  },
  async listTeams(req: Request, res: Response, next: NextFunction) {
    try { res.json(await sportsService.listTeams(query(req.query))); } catch (e) { next(e); }
  },
  async getTeam(req: Request, res: Response, next: NextFunction) {
    try { res.json(await sportsService.getTeam(id(req.params.id))); } catch (e) { next(e); }
  },
  async listMatches(req: Request, res: Response, next: NextFunction) {
    try { res.json(await sportsService.listMatches(query(req.query))); } catch (e) { next(e); }
  },
  async getMatch(req: Request, res: Response, next: NextFunction) {
    try { res.json(await sportsService.getMatch(id(req.params.id))); } catch (e) { next(e); }
  }
};
