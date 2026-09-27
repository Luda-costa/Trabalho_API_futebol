import { useCallback, useEffect, useState } from 'react';
import { ErrorMessage, EmptyState, Loading } from '../components/Feedback.jsx';
import { MatchCard } from '../components/MatchCard.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { listMatches } from '../services/sports-api.js';
import { PageHeader } from './CampeonatosPage.jsx';

export function PartidasPage() {
  const [page, setPage] = useState(1);
  const [inputs, setInputs] = useState({ dataInicio: '', dataFim: '', timeId: '' });
  const [filters, setFilters] = useState({});
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const load = useCallback(async () => {
    setState((value) => ({ ...value, loading: true, error: null }));
    try { setState({ loading: false, data: await listMatches({ page, pageSize: 12, ...filters }), error: null }); }
    catch (error) { setState({ loading: false, data: null, error }); }
  }, [page, filters]);
  useEffect(() => { load(); }, [load]);

  function submit(event) { event.preventDefault(); setPage(1); setFilters(inputs); }
  return <section className="section page-section"><div className="container"><PageHeader eyebrow="Agenda e resultados" title="Partidas" description="Consulte confrontos por período ou por time." />
    <form className="filter-bar filter-grid" onSubmit={submit}><label><span>Data inicial</span><input type="date" value={inputs.dataInicio} onChange={(e) => setInputs({ ...inputs, dataInicio: e.target.value })} /></label><label><span>Data final</span><input type="date" value={inputs.dataFim} onChange={(e) => setInputs({ ...inputs, dataFim: e.target.value })} /></label><label><span>ID do time</span><input type="number" min="1" value={inputs.timeId} onChange={(e) => setInputs({ ...inputs, timeId: e.target.value })} placeholder="Ex.: 86" /></label><button className="button button-secondary">Aplicar filtros</button></form>
    {state.loading ? <Loading /> : state.error ? <ErrorMessage error={state.error} retry={load} /> : state.data.dados.length ? <><div className="matches-list">{state.data.dados.map((match) => <MatchCard match={match} key={match.id} />)}</div><Pagination pagination={state.data.paginacao} onPageChange={setPage} /></> : <EmptyState title="Nenhuma partida encontrada" description="Altere o período ou remova os filtros para tentar novamente." />}
  </div></section>;
}
