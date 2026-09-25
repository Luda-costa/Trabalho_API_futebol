import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { currentUser } from '../api/auth';

type Competition = { id: number; codigo: string | null; nome: string; tipo: string | null; emblema: string | null; area: string | null };
type Page<T> = { items: T[]; pagina: number; limite: number; total: number };

export function Home() {
  const [data, setData] = useState<Page<Competition> | null>(null);
  const [error, setError] = useState('');
  const user = currentUser();

  useEffect(() => {
    api<Page<Competition>>('/campeonatos?limite=50').then(setData).catch((e) => setError(e.message));
  }, []);

  async function favorite(id: number) {
    try {
      await api('/favoritos', {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({ tipo: 'campeonato', itemExternoId: id })
      });
      alert('Campeonato adicionado aos favoritos.');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Falha ao favoritar');
    }
  }

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Carregando...</p>;

  return (
    <section>
      <h1>Campeonatos</h1>
      <div className="grid">
        {data.items.map((item) => (
          <article className="card" key={item.id}>
            {item.emblema && <img src={item.emblema} alt="" />}
            <div>
              <h2><Link to={`/campeonatos/${item.id}`}>{item.nome}</Link></h2>
              <p>{item.area ?? 'Área não informada'} {item.codigo ? `• ${item.codigo}` : ''}</p>
              {user && <button onClick={() => favorite(item.id)}>Favoritar</button>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
