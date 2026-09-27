import { apiRequest, queryString } from './api.js';

export const listCompetitions = (filters) => apiRequest(`/campeonatos${queryString(filters)}`);
export const getCompetition = (id) => apiRequest(`/campeonatos/${encodeURIComponent(id)}`);
export const listCompetitionTeams = (id) => apiRequest(`/campeonatos/${encodeURIComponent(id)}/times`);
export const listCompetitionMatches = (id, filters) => apiRequest(`/campeonatos/${encodeURIComponent(id)}/partidas${queryString(filters)}`);
export const listTeams = (filters) => apiRequest(`/times${queryString(filters)}`);
export const getTeam = (id) => apiRequest(`/times/${id}`);
export const listMatches = (filters) => apiRequest(`/partidas${queryString(filters)}`);
export const getMatch = (id) => apiRequest(`/partidas/${id}`);
