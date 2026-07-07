import type { Project } from '../../types';
import { useGSAP, gsap } from '../../hooks/useGSAP';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import BentoGrid from './BentoGrid';
import CatalogSection from './CatalogSection';

interface WorkProps { projects: Project[]; loading: boolean; }

export default function Work({ projects, loading }: WorkProps) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useGSAP<HTMLElement>((ref) => {
    if (!ref.current || reducedMotion) return;
    gsap.from(ref.current.querySelector('.section-label'), { scrollTrigger: { trigger: ref.current, start: 'top 80%' }, opacity: 0, y: 20, duration: 0.5 });
    gsap.from(ref.current.querySelector('.section-title'), { scrollTrigger: { trigger: ref.current, start: 'top 80%' }, opacity: 0, y: 30, duration: 0.6, delay: 0.1 });
    gsap.from(ref.current.querySelector('.section-subtitle'), { scrollTrigger: { trigger: ref.current, start: 'top 80%' }, opacity: 0, y: 20, duration: 0.5, delay: 0.2 });
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} id="work">
      <div className="container">
        <span className="section-label">Featured Work</span>
        <h2 className="section-title">Projects worth<br />talking about.</h2>
        <p className="section-subtitle">A curated selection pulled live from GitHub. Hover to explore, click to dive in.</p>
        <BentoGrid projects={loading ? [] : projects} loading={loading} />
        <CatalogSection projects={loading ? [] : projects.slice(6)} loading={loading} />
      </div>
    </section>
  );
}
