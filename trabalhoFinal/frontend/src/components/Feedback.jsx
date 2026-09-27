export function Loading({ label = 'Carregando dados...' }) {
  return <div className="state-box" role="status"><span className="loader" /><p>{label}</p></div>;
}

export function ErrorMessage({ error, retry }) {
  return (
    <div className="state-box state-error" role="alert">
      <span className="state-symbol">!</span>
      <h3>Algo saiu do esperado</h3>
      <p>{error?.message ?? 'Não foi possível carregar os dados.'}</p>
      {error?.correlationId && <small>Protocolo: {error.correlationId}</small>}
      {retry && <button className="button button-secondary" onClick={retry}>Tentar novamente</button>}
    </div>
  );
}

export function EmptyState({ title = 'Nenhum resultado', description = 'Não encontramos itens para exibir.' }) {
  return <div className="state-box"><span className="state-symbol state-muted">—</span><h3>{title}</h3><p>{description}</p></div>;
}
