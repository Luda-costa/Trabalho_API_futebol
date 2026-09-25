import { mapCompetition, mapMatch, mapTeam } from '../mappers/sports-mapper.js';

function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  return {
    dados: items.slice(start, start + pageSize),
    paginacao: { page, pageSize, total: items.length }
  };
}

export class SportsService {
  constructor(footballDataClient) {
    this.football = footballDataClient;
  }

  async listCompetitions(query, correlationId) {
    const payload = await this.football.get('/competitions', {}, correlationId);
    let items = (payload.competitions ?? []).map(mapCompetition);
    if (query.pais) {
      const country = query.pais.toLocaleLowerCase('pt-BR');
      items = items.filter((item) => item.pais.toLocaleLowerCase('pt-BR').includes(country));
    }
    return paginate(items, query.page, query.pageSize);
  }

  async getCompetition(id, correlationId) {
    return mapCompetition(await this.football.get(`/competitions/${encodeURIComponent(id)}`, {}, correlationId));
  }

  async listCompetitionTeams(id, correlationId) {
    const payload = await this.football.get(`/competitions/${encodeURIComponent(id)}/teams`, {}, correlationId);
    return (payload.teams ?? []).map(mapTeam);
  }

  async listCompetitionMatches(id, query, correlationId) {
    const payload = await this.football.get(`/competitions/${encodeURIComponent(id)}/matches`, {
      dateFrom: query.dataInicio,
      dateTo: query.dataFim,
      status: query.status
    }, correlationId);
    return paginate((payload.matches ?? []).map(mapMatch), query.page, query.pageSize);
  }

  async listTeams(query, correlationId) {
    const offset = (query.page - 1) * query.pageSize;
    const payload = await this.football.get('/teams', { limit: query.pageSize, offset }, correlationId);
    const items = (payload.teams ?? []).map(mapTeam);
    return {
      dados: items,
      paginacao: { page: query.page, pageSize: query.pageSize, total: payload.count ?? offset + items.length }
    };
  }

  async getTeam(id, correlationId) {
    return mapTeam(await this.football.get(`/teams/${id}`, {}, correlationId));
  }

  async listMatches(query, correlationId) {
    const resource = query.timeId ? `/teams/${query.timeId}/matches` : '/matches';
    const payload = await this.football.get(resource, {
      dateFrom: query.dataInicio,
      dateTo: query.dataFim,
      limit: query.pageSize,
      offset: (query.page - 1) * query.pageSize
    }, correlationId);
    const items = (payload.matches ?? []).map(mapMatch);
    return {
      dados: items,
      paginacao: {
        page: query.page,
        pageSize: query.pageSize,
        total: payload.resultSet?.count ?? items.length
      }
    };
  }

  async getMatch(id, correlationId) {
    return mapMatch(await this.football.get(`/matches/${id}`, {}, correlationId));
  }
}
