import type { CampeonatoDto, PartidaDto, TimeDto } from '../contracts/dtos.js';

type AnyObject = Record<string, any>;

export function mapCompetition(raw: AnyObject): CampeonatoDto {
  return {
    id: Number(raw.id),
    codigo: raw.code ?? null,
    nome: String(raw.name ?? ''),
    tipo: raw.type ?? null,
    emblema: raw.emblem ?? null,
    area: raw.area?.name ?? null
  };
}

export function mapTeam(raw: AnyObject): TimeDto {
  return {
    id: Number(raw.id),
    nome: String(raw.name ?? ''),
    nomeCurto: raw.shortName ?? null,
    tla: raw.tla ?? null,
    escudo: raw.crest ?? null,
    fundacao: raw.founded ?? null,
    estadio: raw.venue ?? null
  };
}

export function mapMatch(raw: AnyObject): PartidaDto {
  return {
    id: Number(raw.id),
    dataUtc: String(raw.utcDate ?? ''),
    status: String(raw.status ?? ''),
    rodada: raw.matchday ?? null,
    casa: {
      id: raw.homeTeam?.id ?? null,
      nome: raw.homeTeam?.name ?? null,
      escudo: raw.homeTeam?.crest ?? null
    },
    fora: {
      id: raw.awayTeam?.id ?? null,
      nome: raw.awayTeam?.name ?? null,
      escudo: raw.awayTeam?.crest ?? null
    },
    placar: {
      vencedor: raw.score?.winner ?? null,
      duracao: raw.score?.duration ?? null,
      golsCasa: raw.score?.fullTime?.home ?? null,
      golsFora: raw.score?.fullTime?.away ?? null
    }
  };
}
