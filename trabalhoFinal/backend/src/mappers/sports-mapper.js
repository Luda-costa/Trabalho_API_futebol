export function mapCompetition(competition) {
  return {
    id: String(competition.code ?? competition.id),
    nome: competition.name,
    pais: competition.area?.name ?? '',
    temporadaAtual: {
      inicio: competition.currentSeason?.startDate ?? null,
      fim: competition.currentSeason?.endDate ?? null,
      rodadaAtual: competition.currentSeason?.currentMatchday ?? null
    }
  };
}

export function mapTeam(team) {
  return {
    id: team.id,
    nome: team.name,
    sigla: team.tla ?? null,
    escudoUrl: team.crest ?? null,
    pais: team.area?.name ?? null
  };
}

export function mapMatch(match) {
  return {
    id: match.id,
    campeonatoId: String(match.competition?.code ?? match.competition?.id ?? ''),
    dataHora: match.utcDate,
    status: match.status,
    timeCasa: mapTeam(match.homeTeam ?? {}),
    timeVisitante: mapTeam(match.awayTeam ?? {}),
    placar: match.score
      ? {
          casa: match.score.fullTime?.home ?? null,
          visitante: match.score.fullTime?.away ?? null
        }
      : null
  };
}
