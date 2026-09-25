import { useEffect, useState } from 'react';
import { api } from '../api/client';

type Favorite = { id: string; tipo: 'time' | 'campeonato'; itemExternoId: number; criadoEm: string };

export function Favorites() {
  const [items, setItems] = useState<Favorite[]>([]);
  const [error, setError] = useState('');

  function load() {
    api<Favorite[]>('/favoritos').then(setItems).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function remove(id: string) {
    try { await api(`/favoritos/${id}`, { method: 'DELETE' }); load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Falha ao remover'); }
  }

  return (
    <section>
      <h1>Meus favoritos</h1>
      {error && <p className="error">{error}</p>}
      <div className="panel">
        {items.length === 0 ? <p>Nenhum favorito.</p> : items.map((item) => (
          <div className="row" key={item.id}>
            <span><strong>{item.tipo}</strong> #{item.itemExternoId}</span>
            <button onClick={() => remove(item.id)}>Remover</button>
          </div>
        ))}
      </div>
    </section>
  );
}
