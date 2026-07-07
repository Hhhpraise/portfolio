import LoadingSpinner from '../shared/LoadingSpinner';
import PublicationCard from './PublicationCard';
import { usePublications } from '../../hooks/useGitHubData';
import { useGSAP, gsap } from '../../hooks/useGSAP';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function Publications() {
  const { publications, loading, error } = usePublications();
  const reducedMotion = useReducedMotion();

  const sectionRef = useGSAP<HTMLElement>((ref) => {
    if (!ref.current || reducedMotion) return;
    gsap.from(ref.current.querySelector('.section-label'), { scrollTrigger: { trigger: ref.current, start: 'top 80%' }, opacity: 0, y: 20, duration: 0.5 });
    gsap.from(ref.current.querySelector('.section-title'), { scrollTrigger: { trigger: ref.current, start: 'top 80%' }, opacity: 0, y: 30, duration: 0.6, delay: 0.1 });
    gsap.from(ref.current.querySelector('.section-subtitle'), { scrollTrigger: { trigger: ref.current, start: 'top 80%' }, opacity: 0, y: 20, duration: 0.5, delay: 0.2 });
    gsap.from(ref.current.querySelectorAll('.publication-card'), { scrollTrigger: { trigger: ref.current, start: 'top 70%' }, opacity: 0, x: -40, duration: 0.5, stagger: { each: 0.12 }, ease: 'power2.out' });
  }, [reducedMotion, publications.length]);

  return (
    <section ref={sectionRef} id="publications">
      <div className="container">
        <span className="section-label">Research</span>
        <h2 className="section-title">Published<br />work.</h2>
        <p className="section-subtitle">Academic papers and technical publications, retrieved from my ORCID profile.</p>
        {loading && <div className="flex flex-col gap-4 mt-12"><LoadingSpinner /></div>}
        {!loading && !error && publications.length > 0 && (
          <div className="publications-list">
            {publications.map((pub, i) => <PublicationCard key={i} pub={pub} index={i} />)}
          </div>
        )}
        {!loading && (error || publications.length === 0) && (
          <div className="publications-empty">
            <i className="fas fa-book-open" />
            <h4>Publications coming soon</h4>
            <p>View my full profile at <a href="https://orcid.org/0009-0007-8597-9017" target="_blank" rel="noopener">orcid.org/0009-0007-8597-9017</a></p>
          </div>
        )}
      </div>
    </section>
  );
}
