import type { Publication } from '../../types';

export default function PublicationCard({ pub }: { pub: Publication; index: number }) {
  return (
    <div className="publication-card">
      <h3 className="publication-card-title">{pub.title}</h3>
      <p className="publication-card-meta">{pub.journal}{pub.journal && pub.year && ' · '}{pub.year}</p>
      {pub.doi && (
        <div className="publication-card-links">
          <a href={pub.url!} target="_blank" rel="noopener" className="publication-card-link publication-card-link-primary"><i className="fas fa-external-link-alt" /> Read Paper</a>
          <a href={pub.url!} target="_blank" rel="noopener" className="publication-card-link publication-card-link-secondary"><i className="fas fa-link" /> DOI</a>
        </div>
      )}
    </div>
  );
}
