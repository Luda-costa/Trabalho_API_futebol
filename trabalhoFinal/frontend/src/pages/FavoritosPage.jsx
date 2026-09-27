import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorMessage, EmptyState, Loading } from '../components/Feedback.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { createFavorite, listFavorites, removeFavorite } from '../services/favorites-api.js';
import { formatDate } from '../utils/format.js';
import { PageHeader } from './CampeonatosPage.jsx';

export function FavoritosPage() {
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ tipo: 'TIME', itemExternoId: '' });
  const [formError, setFormError] = useState('');
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const load = useCallback(async () => {
    setState((value) => ({ ...value, loading: true }));
    try { setState({ loading: false, data: await listFavorites({ page, pageSize: 12 }), error: null }); }
    catch (error) { setState({ loading: false, data: null, error }); }
  }, [page]);
  useEffect(() => { load(); }, [load]);

  async function add(event) {
    event.preventDefault(); setFormError('');
    try { await createFavorite(form); setForm({ ...form, itemExternoId: '' }); await load(); }
    catch (error) { setFormError(error.message); }
  }
  async function remove(id) { try { await removeFavorite(id); await load(); } catch (error) { setFormError(error.message); } }

  return <section className="section page-section"><div className="container"><PageHeader eyebrow="Área pessoal" title="Favoritos" description="Seus times e campeonatos em um só lugar." />
    <form className="favorite-form" onSubmit={add}><div><h2>Adicionar por ID</h2><p>Use o código do campeonato ou o ID numérico do time.</p></div><label><span>Tipo</span><select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}><option value="TIME">Time</option><option value="CAMPEONATO">Campeonato</option></select></label><label><span>ID externo</span><input required value={form.itemExternoId} onChange={(e) => setForm({ ...form, itemExternoId: e.target.value })} placeholder={form.tipo === 'TIME' ? 'Ex.: 86' : 'Ex.: PL'} /></label><button className="button button-primary">Adicionar</button></form>
    {formError && <div className="form-error inline-error">{formError}</div>}
    {state.loading ? <Loading /> : state.error ? <ErrorMessage error={state.error} retry={load} /> : state.data.dados.length ? <><div className="favorites-list">{state.data.dados.map((favorite) => <article className="favorite-row" key={favorite.id}><span className="favorite-type">{favorite.tipo === 'TIME' ? 'TM' : 'CP'}</span><div><small>{favorite.tipo}</small><h3><Link to={favorite.tipo === 'TIME' ? `/times/${favorite.itemExternoId}` : `/campeonatos/${favorite.itemExternoId}`}>{favorite.itemExternoId}</Link></h3><p>Adicionado em {formatDate(favorite.criadoEm)}</p></div><button className="button button-danger" onClick={() => remove(favorite.id)}>Remover</button></article>)}</div><Pagination pagination={state.data.paginacao} onPageChange={setPage} /></> : <EmptyState title="Sua lista está vazia" description="Favorite um time ou campeonato para encontrá-lo aqui." />}
  </div></section>;
}
