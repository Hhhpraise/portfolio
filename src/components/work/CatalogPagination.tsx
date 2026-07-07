interface CatalogPaginationProps { currentPage: number; totalPages: number; onPageChange: (p: number) => void; }

export default function CatalogPagination({ currentPage, totalPages, onPageChange }: CatalogPaginationProps) {
  if (totalPages <= 1) return null;
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
  const pages: (number | string)[] = [];
  if (start > 1) { pages.push(1); if (start > 2) pages.push('dots'); }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) { if (end < totalPages - 1) pages.push('dots'); pages.push(totalPages); }

  return (
    <div className="catalog-pagination">
      <button className="pagination-btn" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}><i className="fas fa-chevron-left" /></button>
      <div className="pagination-numbers">
        {pages.map((p, i) =>
          typeof p === 'string' ? <span key={p + i} className="pagination-dots">...</span> :
            <button key={p} onClick={() => onPageChange(p)} className={`pagination-number${p === currentPage ? ' active' : ''}`}>{p}</button>
        )}
      </div>
      <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}><i className="fas fa-chevron-right" /></button>
    </div>
  );
}
