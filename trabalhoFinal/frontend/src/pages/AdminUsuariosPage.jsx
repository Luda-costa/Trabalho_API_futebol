import { useCallback, useEffect, useState } from 'react';
import { ErrorMessage, EmptyState, Loading } from '../components/Feedback.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { listUsers, setUserActive } from '../services/admin-api.js';
import { formatDate, initials } from '../utils/format.js';
import { PageHeader } from './CampeonatosPage.jsx';

export function AdminUsuariosPage() {
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState('');
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const load = useCallback(async () => {
    setState((value) => ({ ...value, loading: true }));
    try { setState({ loading: false, data: await listUsers({ page, pageSize: 20 }), error: null }); }
    catch (error) { setState({ loading: false, data: null, error }); }
  }, [page]);
  useEffect(() => { load(); }, [load]);
  async function toggle(user) { setActionError(''); try { await setUserActive(user.id, !user.ativo); await load(); } catch (error) { setActionError(error.message); } }
  return <section className="section page-section"><div className="container"><PageHeader eyebrow="Administração" title="Usuários" description="Gerencie o acesso dos usuários cadastrados." />
    {actionError && <div className="form-error inline-error">{actionError}</div>}
    {state.loading ? <Loading /> : state.error ? <ErrorMessage error={state.error} retry={load} /> : state.data.dados.length ? <><div className="users-table"><div className="users-head"><span>Usuário</span><span>Papel</span><span>Cadastro</span><span>Status</span><span /></div>{state.data.dados.map((user) => <div className="user-row" key={user.id}><div className="user-cell"><span className="avatar">{initials(user.nome)}</span><span><strong>{user.nome}</strong><small>{user.email}</small></span></div><span className="role-tag">{user.role}</span><span>{formatDate(user.criadoEm)}</span><span className={`user-status ${user.ativo ? 'active' : 'inactive'}`}>{user.ativo ? 'Ativo' : 'Inativo'}</span><button className="button button-ghost compact" onClick={() => toggle(user)}>{user.ativo ? 'Desativar' : 'Ativar'}</button></div>)}</div><Pagination pagination={state.data.paginacao} onPageChange={setPage} /></> : <EmptyState title="Nenhum usuário cadastrado" />}
  </div></section>;
}
