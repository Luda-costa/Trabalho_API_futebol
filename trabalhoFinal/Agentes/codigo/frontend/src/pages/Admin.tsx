import { useEffect, useState } from 'react';
import { api } from '../api/client';

type User = { id: string; nome: string; email: string; role: 'user' | 'admin'; criadoEm: string };

export function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  function load() { api<User[]>('/admin/usuarios').then(setUsers).catch((e) => setError(e.message)); }
  useEffect(load, []);

  async function changeRole(id: string, role: User['role']) {
    try {
      await api(`/admin/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify({ role }) });
      load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao atualizar'); }
  }

  return (
    <section>
      <h1>Administração</h1>
      {error && <p className="error">{error}</p>}
      <div className="panel">
        {users.map((user) => (
          <div className="row" key={user.id}>
            <span><strong>{user.nome}</strong><br /><small>{user.email}</small></span>
            <select value={user.role} onChange={(e) => changeRole(user.id, e.target.value as User['role'])}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}
