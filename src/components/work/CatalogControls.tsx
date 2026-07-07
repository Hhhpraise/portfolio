interface CatalogControlsProps {
  currentFilter: string;
  onFilterChange: (f: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortChange: (s: 'stars' | 'updated' | 'name') => void;
  onClear: () => void;
}

const FILTERS = [
  { value: 'all', label: 'All', icon: '' },
  { value: 'python', label: 'Python', icon: 'fab fa-python' },
  { value: 'javascript', label: 'JavaScript', icon: 'fab fa-js' },
  { value: 'java', label: 'Java', icon: 'fab fa-java' },
  { value: 'web', label: 'Web', icon: 'fas fa-globe' },
  { value: 'android', label: 'Android', icon: 'fab fa-android' },
  { value: 'demo', label: 'Has Demo', icon: 'fas fa-play' },
  { value: 'downloadable', label: 'Downloadable', icon: 'fas fa-download' },
];

export default function CatalogControls({
  currentFilter, onFilterChange, searchQuery, onSearchChange, sortBy, onSortChange, onClear,
}: CatalogControlsProps) {
  return (
    <div className="catalog-controls">
      <div className="catalog-search">
        <i className="fas fa-search" />
        <input type="text" className="catalog-search-input" placeholder="Search by name, language, or topic..."
          value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
        {searchQuery && (
          <button onClick={onClear} className="catalog-search-clear" aria-label="Clear search"><i className="fas fa-times" /></button>
        )}
      </div>
      <div className="catalog-filters">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => onFilterChange(f.value)} className={`catalog-filter${currentFilter === f.value ? ' active' : ''}`}>
            {f.icon && <i className={f.icon} />}{f.label}
          </button>
        ))}
      </div>
      <div className="catalog-sort">
        <label htmlFor="catalog-sort-select">Sort:</label>
        <select id="catalog-sort-select" className="catalog-sort-select" value={sortBy} onChange={(e) => onSortChange(e.target.value as any)}>
          <option value="stars">Most Stars</option>
          <option value="updated">Last Updated</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>
    </div>
  );
}
