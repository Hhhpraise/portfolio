import { useRef } from 'react';
import { useGSAP, gsap } from '../../hooks/useGSAP';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { Project } from '../../types';

interface BentoGridProps { projects: Project[]; loading: boolean; }

const LAYOUTS = [
  ['span-2 span-2-row', '', '', 'span-2', '', 'span-2'],
  ['span-2', 'span-2', '', 'span-2 span-2-row', '', ''],
  ['', 'span-2 span-2-row', 'span-2', '', 'span-2', ''],
  ['span-2', '', 'span-2', '', 'span-2 span-2-row', ''],
  ['', '', 'span-2 span-2-row', 'span-2', '', 'span-2'],
];

export default function BentoGrid({ projects, loading }: BentoGridProps) {
  const reducedMotion = useReducedMotion();
  const gridRef = useGSAP<HTMLDivElement>((ref) => {
    if (!ref.current || reducedMotion) return;
    gsap.from(ref.current.querySelectorAll('.bento-item'), {
      scrollTrigger: { trigger: ref.current, start: 'top 80%', toggleActions: 'play none none none' },
      opacity: 0, y: 60, scale: 0.92, duration: 0.7, stagger: { each: 0.1, from: 'start' }, ease: 'power3.out',
    });
  }, [reducedMotion]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const cx = rect.width / 2, cy = rect.height / 2;
    gsap.to(card, { rotateX: ((y - cy) / cy) * -8, rotateY: ((x - cx) / cx) * 8, duration: 0.4, ease: 'power2.out' });
    const glow = card.querySelector('.bento-tilt-glow') as HTMLElement;
    if (glow) gsap.to(glow, { opacity: 1, background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,61,0,0.15) 0%, transparent 60%)`, duration: 0.3, ease: 'power2.out' });
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    gsap.to(e.currentTarget, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
    const glow = e.currentTarget.querySelector('.bento-tilt-glow') as HTMLElement;
    if (glow) gsap.to(glow, { opacity: 0, duration: 0.5, ease: 'power2.out' });
  };

  const display = projects.slice(0, 6);
  const layoutRef = useRef(LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)]);
  const layout = layoutRef.current;

  if (loading) return <div ref={gridRef} className="bento-grid"><div className="bento-loading"><div className="loading-spinner" /></div></div>;
  if (!display.length) return <div ref={gridRef} className="bento-grid"><div className="bento-loading"><p className="text-text-dim">No projects yet.</p></div></div>;

  return (
    <div ref={gridRef} className="bento-grid">
      {display.map((p, i) => (
        <div key={p.id} className={`bento-item ${layout[i] || ''}`}
          onClick={() => window.open(p.html_url, '_blank')} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} title={p.name}
          style={{ perspective: '800px', transformStyle: 'preserve-3d' }}>
          <div className="bento-item-bg"><img src={`https://github.com/${p.full_name.split('/')[0]}.png`} alt="" loading="lazy" /></div>
          <div className="bento-item-gradient" />
          <div className="bento-item-inner">
            <span className="bento-lang">{p.language}</span>
            <h3 className="bento-title">{p.name.replace(/-/g, ' ')}</h3>
            <p className="bento-desc">{p.description}</p>
            <div className="bento-meta">
              <span><i className="fas fa-star" /> {p.stargazers_count}</span>
              <span><i className="fas fa-code-branch" /> {p.forks_count}</span>
            </div>
            <div className="bento-links">
              <a href={p.html_url} target="_blank" rel="noopener" className="bento-link bento-link-source" onClick={(e) => e.stopPropagation()}><i className="fab fa-github" /> Source</a>
              {p.hasLiveDemo && <a href={p.liveDemo!} target="_blank" rel="noopener" className="bento-link bento-link-demo" onClick={(e) => e.stopPropagation()}>Live <i className="fas fa-external-link-alt" /></a>}
              {p.hasDownload && <a href={p.downloadUrl || p.html_url} target="_blank" rel="noopener" className="bento-link bento-link-download" onClick={(e) => e.stopPropagation()}><i className="fas fa-download" /> Download</a>}
            </div>
          </div>
          <div className="bento-tilt-glow" />
        </div>
      ))}
    </div>
  );
}
