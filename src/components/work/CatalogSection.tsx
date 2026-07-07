import { useState, useMemo, useCallback } from 'react';
import CatalogControls from './CatalogControls';
import CatalogPagination from './CatalogPagination';
import type { Project } from '../../types';
import { CONFIG } from '../../config';

interface CatalogSectionProps { projects: Project[]; loading: boolean; }

export default function CatalogSection({ projects, loading }: CatalogSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'stars' | 'updated' | 'name'>('stars');

  const filteredCatalog = useMemo(() => {
    let filtered = [...projects];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || p.topics.some((t) => t.toLowerCase().includes(q)) || (p.language || '').toLowerCase().includes(q));
    }
    if (currentFilter !== 'all') {
      filtered = filtered.filter((p) => {
        switch (currentFilter) {
          case 'python': return p.language === 'Python';
          case 'javascript': return ['JavaScript', 'TypeScript'].includes(p.language || '');
          case 'java': return p.language === 'Java' || p.language === 'Kotlin';
          case 'web': return p.topics.includes('web') || p.has_pages || ['HTML', 'CSS', 'JavaScript', 'TypeScript'].includes(p.language || '');
          case 'android': return p.language === 'Java' || p.language === 'Kotlin' || p.topics.includes('android');
          case 'demo': return !!p.hasLiveDemo;
          case 'downloadable': return !!p.hasDownload;
          default: return true;
        }
      });
    }
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'updated': return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'name': return a.name.localeCompare(b.name);
        default: return b.stargazers_count - a.stargazers_count;
      }
    });
  }, [projects, searchQuery, currentFilter, sortBy]);

  const totalPages = Math.ceil(filteredCatalog.length / CONFIG.ITEMS_PER_PAGE);
  const pageItems = filteredCatalog.slice((currentPage - 1) * CONFIG.ITEMS_PER_PAGE, currentPage * CONFIG.ITEMS_PER_PAGE);

  const handleFilterChange = useCallback((f: string) => { setCurrentFilter(f); setCurrentPage(1); }, []);
  const handleSearchChange = useCallback((q: string) => { setSearchQuery(q); setCurrentPage(1); }, []);
  const handleSortChange = useCallback((s: 'stars' | 'updated' | 'name') => { setSortBy(s); setCurrentPage(1); }, []);

  return (
    <div className="catalog-section">
      <div className="catalog-header">
        <h3 className="catalog-title">All Repositories</h3>
        <p className="catalog-subtitle">Search, filter, and explore every public project.</p>
      </div>
      <CatalogControls currentFilter={currentFilter} onFilterChange={handleFilterChange} searchQuery={searchQuery} onSearchChange={handleSearchChange} sortBy={sortBy} onSortChange={handleSortChange} onClear={() => { setSearchQuery(''); setCurrentFilter('all'); setCurrentPage(1); }} />
      {loading ? (
        <div className="loading-spinner" />
      ) : !filteredCatalog.length ? (
        <div className="catalog-empty">
          <i className="fas fa-search" />
          <h4>No repos match your search</h4>
          <p>Try different keywords or clear the filters.</p>
          <button onClick={() => { setSearchQuery(''); setCurrentFilter('all'); setCurrentPage(1); }} className="catalog-empty-clear">Clear all filters</button>
        </div>
      ) : (
        <>
          <div className="catalog-grid">
            {pageItems.map((p) => (
              <CatalogCard key={p.id} project={p} />
            ))}
          </div>
          <CatalogPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
}

function CatalogCard({ project: p }: { project: Project }) {
  return (
    <div className="catalog-card">
      <div className="catalog-card-header">
        <h3 className="catalog-card-name">
          {p.name.replace(/-/g, ' ')}
          {p.hasDownload && <span className="catalog-card-dl-badge"><i className="fas fa-download" /> {p.downloadSize || 'DL'}</span>}
        </h3>
        <span className="catalog-card-stars"><i className="fas fa-star" /> {p.stargazers_count}</span>
      </div>
      <span className="catalog-card-lang">{p.language}</span>
      <p className="catalog-card-desc">{p.description}</p>
      {p.topics.length > 0 && (
        <div className="catalog-card-tags">
          {p.topics.slice(0, 4).map((t) => <span key={t} className="catalog-card-tag">{t}</span>)}
        </div>
      )}
      <div className="catalog-card-actions">
        <a href={p.html_url} target="_blank" rel="noopener" className="catalog-card-btn catalog-card-btn-source"><i className="fab fa-github" /> Source</a>
        {p.hasLiveDemo && <a href={p.liveDemo!} target="_blank" rel="noopener" className="catalog-card-btn catalog-card-btn-demo"><i className="fas fa-external-link-alt" /> Live</a>}
        {p.hasDownload && <a href={p.downloadUrl || p.html_url} target="_blank" rel="noopener" className="catalog-card-btn catalog-card-btn-download"><i className="fas fa-download" /> Download</a>}
      </div>
    </div>
  );
}
