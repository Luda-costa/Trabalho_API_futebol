import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorMessage, Loading } from '../components/Feedback.jsx';
import { FavoriteButton } from '../components/FavoriteButton.jsx';
import { MatchCard } from '../components/MatchCard.jsx';
import { EmptyState } from '../components/Feedback.jsx';
import { getTeam, listMatches } from '../services/sports-api.js';
import { initials } from '../utils/format.js';

export function TimeDetalhesPage() {
  const { id } = useParams();
  const [state, setState] = useState({ loading: true, data: null, error: null });
  useEffect(() => {
    Promise.all([getTeam(id), listMatches({ timeId: id, page: 1, pageSize: 10 })])
      .then(([team, matches]) => setState({ loading: false, data: { team, matches }, error: null }))
      .catch((error) => setState({ loading: false, data: null, error }));
  }, [id]);
  if (state.loading) return <section className="section"><Loading /></section>;
  if (state.error) return <section className="section container"><ErrorMessage error={state.error} /></section>;
  const { team, matches } = state.data;
  return <><section className="detail-hero team-detail"><div className="container detail-heading">{team.escudoUrl ? <img className="detail-crest" src={team.escudoUrl} alt={`Escudo de ${team.nome}`} /> : <div className="competition-symbol large">{initials(team.nome)}</div>}<div><span className="eyebrow"><span /> {team.pais || 'Time'}</span><h1>{team.nome}</h1><p>{team.sigla ? `Sigla: ${team.sigla}` : 'Informações do time'}</p></div><FavoriteButton tipo="TIME" itemExternoId={team.id} /></div></section><section className="section"><div className="container"><div className="section-heading"><div><span className="eyebrow dark"><span /> Agenda</span><h2>Partidas do time</h2></div></div>{matches.dados.length ? <div className="matches-list">{matches.dados.map((match) => <MatchCard key={match.id} match={match} />)}</div> : <EmptyState title="Nenhuma partida disponível" />}</div></section></>;
}
