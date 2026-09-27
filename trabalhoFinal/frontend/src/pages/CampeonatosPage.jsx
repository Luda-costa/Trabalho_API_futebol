import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorMessage, EmptyState, Loading } from '../components/Feedback.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { ArrowIcon } from '../components/Icons.jsx';
import { listCompetitions } from '../services/sports-api.js';

export function CampeonatosPage() {
  const [page, setPage] = useState(1);
  const [countryInput, setCountryInput] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState({ loading: true, data: null, error: null });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try { setState({ loading: false, data: await listCompetitions({ page, pageSize: 12, pais: country }), error: null }); }
    catch (error) { setState({ loading: false, data: null, error }); }
  }, [page, country]);
  useEffect(() => { load(); }, [load]);

  function search(event) { event.preventDefault(); setPage(1); setCountry(countryInput.trim()); }

  return <section className="section page-section"><div className="container">
    <PageHeader eyebrow="Competições" title="Campeonatos" description="Descubra ligas e torneios de diferentes países." />
    <form className="filter-bar" onSubmit={search}><label><span>Filtrar por país</span><input value={countryInput} onChange={(e) => setCountryInput(e.target.value)} placeholder="Ex.: Brasil, England, Spain" /></label><button className="button button-secondary">Buscar</button></form>
    {state.loading ? <Loading /> : state.error ? <ErrorMessage error={state.error} retry={load} /> : state.data.dados.length === 0 ? <EmptyState /> : <>
      <div className="card-grid competition-grid">{state.data.dados.map((competition, index) => <Link className="competition-card" to={`/campeonatos/${competition.id}`} key={competition.id}>
        <span className="card-index">{String(index + 1 + (page - 1) * 12).padStart(2, '0')}</span>
        <div className="competition-symbol">{competition.id.slice(0, 3)}</div>
        <div><small>{competition.pais || 'Internacional'}</small><h2>{competition.nome}</h2><p>{competition.temporadaAtual?.inicio ? `Temporada desde ${competition.temporadaAtual.inicio}` : 'Temporada atual'}</p></div>
        <span className="card-arrow"><ArrowIcon /></span>
      </Link>)}</div>
      <Pagination pagination={state.data.paginacao} onPageChange={setPage} />
    </>}
  </div></section>;
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return <div className="page-header"><div><span className="eyebrow dark"><span /> {eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{actions}</div>;
}
