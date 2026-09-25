import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { currentUser } from '../api/auth';

type Team = { id: number; nome: string; nomeCurto: string | null; tla: string | null; escudo: string | null; fundacao: number | null; estadio: string | null };
type Match = { id: number; dataUtc: string; status: string; rodada: number | null; casa: { nome: string | null }; fora: { nome: string | null }; placar: { golsCasa: number | null; golsFora: number | null } };
type Page<T> = { items: T[] };

export function CompetitionDetail() {
  const { id } = useParams();
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState('');
  const user = currentUser();

  useEffect(() => {
    Promise.all([
      api<Page<Team>>(`/campeonatos/${id}/times?limite=100`),
      api<Page<Match>>(`/campeonatos/${id}/partidas?limite=100`)
    ]).then(([t, m]) => { setTeams(t.items); setMatches(m.items); }).catch((e) => setError(e.message));
  }, [id]);

  async function favoriteTeam(teamId: number) {
    try {
      await api('/favoritos', {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({ tipo: 'time', itemExternoId: teamId })
      });
      alert('Time adicionado aos favoritos.');
    } catch (e) { alert(e instanceof Error ? e.message : 'Falha ao favoritar'); }
  }

  if (error) return <p className="error">{error}</p>;

  return (
    <section>
      <h1>Detalhes do campeonato</h1>
      <h2>Times</h2>
      <div className="grid">
        {teams.map((team) => (
          <article className="card" key={team.id}>
            {team.escudo && <img src={team.escudo} alt="" />}
            <div><strong>{team.nome}</strong><p>{team.estadio ?? 'Estádio não informado'}</p>{user && <button onClick={() => favoriteTeam(team.id)}>Favoritar</button>}</div>
          </article>
        ))}
      </div>
      <h2>Partidas</h2>
      <div className="panel">
        {matches.map((m) => (
          <div className="match" key={m.id}>
            <span>{new Date(m.dataUtc).toLocaleString()}</span>
            <strong>{m.casa.nome ?? '?'} {m.placar.golsCasa ?? '-'} × {m.placar.golsFora ?? '-'} {m.fora.nome ?? '?'}</strong>
            <span>{m.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
