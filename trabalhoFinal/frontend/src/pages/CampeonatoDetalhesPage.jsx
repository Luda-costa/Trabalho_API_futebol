import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorMessage, EmptyState, Loading } from '../components/Feedback.jsx';
import { FavoriteButton } from '../components/FavoriteButton.jsx';
import { MatchCard } from '../components/MatchCard.jsx';
import { getCompetition, listCompetitionMatches, listCompetitionTeams } from '../services/sports-api.js';
import { formatDate, initials } from '../utils/format.js';

export function CampeonatoDetalhesPage() {
  const { id } = useParams();
  const [state, setState] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    let active = true;
    Promise.all([getCompetition(id), listCompetitionTeams(id), listCompetitionMatches(id, { page: 1, pageSize: 8 })])
      .then(([competition, teams, matches]) => active && setState({ loading: false, data: { competition, teams, matches }, error: null }))
      .catch((error) => active && setState({ loading: false, data: null, error }));
    return () => { active = false; };
  }, [id]);

  if (state.loading) return <section className="section"><Loading /></section>;
  if (state.error) return <section className="section container"><ErrorMessage error={state.error} /></section>;
  const { competition, teams, matches } = state.data;
  return <>
    <section className="detail-hero"><div className="container detail-heading"><div className="competition-symbol large">{competition.id.slice(0, 3)}</div><div><span className="eyebrow"><span /> {competition.pais || 'Internacional'}</span><h1>{competition.nome}</h1><p>{formatDate(competition.temporadaAtual?.inicio)} — {formatDate(competition.temporadaAtual?.fim)}</p></div><FavoriteButton tipo="CAMPEONATO" itemExternoId={competition.id} /></div></section>
    <section className="section"><div className="container"><div className="section-heading"><div><span className="eyebrow dark"><span /> Participantes</span><h2>Times</h2></div><span className="count-label">{teams.length} times</span></div>
      {teams.length ? <div className="team-grid">{teams.map((team) => <Link className="team-card" to={`/times/${team.id}`} key={team.id}>{team.escudoUrl ? <img src={team.escudoUrl} alt="" loading="lazy" /> : <span className="team-fallback">{initials(team.nome)}</span>}<div><h3>{team.nome}</h3><p>{team.sigla || team.pais}</p></div></Link>)}</div> : <EmptyState title="Nenhum time disponível" />}
      <div className="section-heading spaced"><div><span className="eyebrow dark"><span /> Calendário</span><h2>Partidas</h2></div></div>
      {matches.dados.length ? <div className="matches-list">{matches.dados.map((match) => <MatchCard match={match} key={match.id} />)}</div> : <EmptyState title="Nenhuma partida disponível" />}
    </div></section>
  </>;
}
