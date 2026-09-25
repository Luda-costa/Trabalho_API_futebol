import { formatDate, initials, statusLabels } from '../utils/format.js';

function TeamBadge({ team }) {
  return team?.escudoUrl
    ? <img className="team-badge" src={team.escudoUrl} alt="" loading="lazy" />
    : <span className="team-badge team-badge-fallback">{initials(team?.nome)}</span>;
}

export function MatchCard({ match }) {
  const played = match.placar?.casa !== null && match.placar?.visitante !== null;
  return (
    <article className="match-card">
      <div className="match-meta">
        <span className={`status status-${match.status?.toLowerCase()}`}>{statusLabels[match.status] ?? match.status}</span>
        <time>{formatDate(match.dataHora, true)}</time>
      </div>
      <div className="match-teams">
        <div className="match-team home"><span>{match.timeCasa?.nome ?? 'A definir'}</span><TeamBadge team={match.timeCasa} /></div>
        <div className="score">{played ? <><strong>{match.placar.casa}</strong><i>×</i><strong>{match.placar.visitante}</strong></> : <span>vs</span>}</div>
        <div className="match-team away"><TeamBadge team={match.timeVisitante} /><span>{match.timeVisitante?.nome ?? 'A definir'}</span></div>
      </div>
    </article>
  );
}
