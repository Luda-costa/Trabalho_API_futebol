import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorMessage, EmptyState, Loading } from '../components/Feedback.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { listTeams } from '../services/sports-api.js';
import { initials } from '../utils/format.js';
import { PageHeader } from './CampeonatosPage.jsx';

export function TimesPage() {
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const load = useCallback(async () => {
    setState((value) => ({ ...value, loading: true }));
    try { setState({ loading: false, data: await listTeams({ page, pageSize: 20 }), error: null }); }
    catch (error) { setState({ loading: false, data: null, error }); }
  }, [page]);
  useEffect(() => { load(); }, [load]);
  return <section className="section page-section"><div className="container"><PageHeader eyebrow="Clubes e seleções" title="Times" description="Conheça os times disponíveis na plataforma." />
    {state.loading ? <Loading /> : state.error ? <ErrorMessage error={state.error} retry={load} /> : state.data.dados.length === 0 ? <EmptyState /> : <><div className="team-grid large-grid">{state.data.dados.map((team) => <Link className="team-card" to={`/times/${team.id}`} key={team.id}>{team.escudoUrl ? <img src={team.escudoUrl} alt="" loading="lazy" /> : <span className="team-fallback">{initials(team.nome)}</span>}<div><h3>{team.nome}</h3><p>{team.pais || team.sigla || 'Futebol'}</p></div></Link>)}</div><Pagination pagination={state.data.paginacao} onPageChange={setPage} /></>}
  </div></section>;
}
