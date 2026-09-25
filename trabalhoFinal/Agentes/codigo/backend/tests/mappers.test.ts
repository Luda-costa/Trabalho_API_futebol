import { describe, expect, it } from 'vitest';
import { mapCompetition, mapMatch, mapTeam } from '../src/mappers/football-data-mapper.js';

describe('BFF mappers', () => {
  it('não retorna o JSON bruto de campeonato', () => {
    const raw = { id: 1, code: 'BRA', name: 'Liga', type: 'LEAGUE', emblem: 'x', area: { name: 'Brasil' }, secret: 'raw' };
    const mapped = mapCompetition(raw);
    expect(mapped).toEqual({ id: 1, codigo: 'BRA', nome: 'Liga', tipo: 'LEAGUE', emblema: 'x', area: 'Brasil' });
    expect(mapped).not.toHaveProperty('secret');
  });

  it('mapeia time e partida sem propagar campos extras', () => {
    expect(mapTeam({ id: 2, name: 'Time', shortName: 'T', tla: 'TIM', crest: 'c', founded: 1900, venue: 'Estádio', extra: true }))
      .not.toHaveProperty('extra');

    expect(mapMatch({
      id: 3,
      utcDate: '2026-09-25T10:00:00Z',
      status: 'FINISHED',
      matchday: 1,
      homeTeam: { id: 1, name: 'A', crest: 'a' },
      awayTeam: { id: 2, name: 'B', crest: 'b' },
      score: { winner: 'HOME_TEAM', duration: 'REGULAR', fullTime: { home: 2, away: 1 } },
      internal: 'raw'
    })).not.toHaveProperty('internal');
  });
});
