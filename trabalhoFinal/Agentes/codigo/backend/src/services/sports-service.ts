import { footballDataClient } from '../clients/football-data-client.js';
import type { Paginated } from '../contracts/dtos.js';
import { AppError } from '../errors/app-error.js';
import { mapCompetition, mapMatch, mapTeam } from '../mappers/football-data-mapper.js';

type AnyObject = Record<string, any>;

function paginate<T>(items: T[], pagina = 1, limite = 20): Paginated<T> {
  const safePage = Math.max(1, pagina);
  const safeLimit = Math.min(100, Math.max(1, limite));
  const start = (safePage - 1) * safeLimit;
  return {
    items: items.slice(start, start + safeLimit),
    pagina: safePage,
    limite: safeLimit,
    total: items.length
  };
}

export const sportsService = {
  async listCompetitions(query: { pagina?: number; limite?: number }) {
    const raw = await footballDataClient.get<AnyObject>('/competitions');
    const items = Array.isArray(raw.competitions) ? raw.competitions.map(mapCompetition) : [];
    return paginate(items, query.pagina, query.limite);
  },

  async getCompetition(id: number) {
    const raw = await footballDataClient.get<AnyObject>(`/competitions/${id}`);
    if (!raw?.id) throw new AppError(404, 'COMPETITION_NOT_FOUND', 'Campeonato não encontrado.');
    return mapCompetition(raw);
  },

  async listCompetitionTeams(id: number, query: { pagina?: number; limite?: number; temporada?: number }) {
    const raw = await footballDataClient.get<AnyObject>(`/competitions/${id}/teams`, {
      query: { season: query.temporada }
    });
    const items = Array.isArray(raw.teams) ? raw.teams.map(mapTeam) : [];
    return paginate(items, query.pagina, query.limite);
  },

  async listCompetitionMatches(id: number, query: SportsQuery) {
    const raw = await footballDataClient.get<AnyObject>(`/competitions/${id}/matches`, {
      query: externalMatchFilters(query)
    });
    const items = Array.isArray(raw.matches) ? raw.matches.map(mapMatch) : [];
    return paginate(items, query.pagina, query.limite);
  },

  async listTeams(query: { pagina?: number; limite?: number; campeonatoId?: number; temporada?: number }) {
    if (query.campeonatoId) {
      return this.listCompetitionTeams(query.campeonatoId, query);
    }
    const raw = await footballDataClient.get<AnyObject>('/teams');
    const items = Array.isArray(raw.teams) ? raw.teams.map(mapTeam) : [];
    return paginate(items, query.pagina, query.limite);
  },

  async getTeam(id: number) {
    const raw = await footballDataClient.get<AnyObject>(`/teams/${id}`);
    if (!raw?.id) throw new AppError(404, 'TEAM_NOT_FOUND', 'Time não encontrado.');
    return mapTeam(raw);
  },

  async listMatches(query: SportsQuery) {
    const raw = await footballDataClient.get<AnyObject>('/matches', {
      query: {
        ...externalMatchFilters(query),
        competitions: query.campeonatoId
      }
    });
    const items = Array.isArray(raw.matches) ? raw.matches.map(mapMatch) : [];
    return paginate(items, query.pagina, query.limite);
  },

  async getMatch(id: number) {
    const raw = await footballDataClient.get<AnyObject>(`/matches/${id}`);
    if (!raw?.id) throw new AppError(404, 'MATCH_NOT_FOUND', 'Partida não encontrada.');
    return mapMatch(raw);
  }
};

interface SportsQuery {
  pagina?: number;
  limite?: number;
  temporada?: number;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  campeonatoId?: number;
}

function externalMatchFilters(query: SportsQuery): Record<string, string | number | undefined> {
  return {
    season: query.temporada,
    status: query.status,
    dateFrom: query.dataInicio,
    dateTo: query.dataFim
  };
}
