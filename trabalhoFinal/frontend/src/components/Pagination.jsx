export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.total <= pagination.pageSize) return null;
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  return (
    <div className="pagination" aria-label="Paginação">
      <button disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>Anterior</button>
      <span>Página <strong>{pagination.page}</strong> de {totalPages}</span>
      <button disabled={pagination.page >= totalPages} onClick={() => onPageChange(pagination.page + 1)}>Próxima</button>
    </div>
  );
}
