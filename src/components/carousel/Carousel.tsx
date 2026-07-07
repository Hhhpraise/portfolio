import { useEffect, useRef, useState, useCallback } from 'react';
import type { Project } from '../../types';

interface CarouselProps { projects: Project[]; loading: boolean; }
const INTERVAL = 7000;

export default function Carousel({ projects, loading }: CarouselProps) {
  const pages = projects.filter((p) => p.hasLiveDemo && p.name !== 'portfolio');
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const iframesLoaded = useRef<Set<number>>(new Set());
  const visible = pages.length > 0;

  const resetProgress = useCallback(() => {
    const fill = progressRef.current; if (!fill) return;
    fill.style.transition = 'none'; fill.style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.transition = `width ${INTERVAL}ms linear`; fill.style.width = '100%'; }));
  }, []);

  const goTo = useCallback((i: number) => { setIndex(i); resetProgress(); }, [resetProgress]);
  const startTimer = useCallback(() => { if (timerRef.current) clearInterval(timerRef.current); resetProgress(); timerRef.current = setInterval(() => { setIndex((prev) => (prev + 1) % pages.length); resetProgress(); }, INTERVAL); }, [pages.length, resetProgress]);
  const stopTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } const fill = progressRef.current; if (fill) { fill.style.transition = 'none'; fill.style.width = '0%'; } }, []);

  useEffect(() => { if (!visible) return; startTimer(); return stopTimer; }, [visible, startTimer, stopTimer]);
  useEffect(() => { if (!visible) return; [index, (index + 1) % pages.length, (index - 1 + pages.length) % pages.length].forEach((i) => { if (!iframesLoaded.current.has(i)) iframesLoaded.current.add(i); }); }, [index, pages.length, visible]);

  const touchX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => { const delta = touchX.current - e.changedTouches[0].clientX; if (Math.abs(delta) < 40) return; goTo(delta > 0 ? (index + 1) % pages.length : (index - 1 + pages.length) % pages.length); };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (!visible) return; if (e.key === 'ArrowRight') goTo((index + 1) % pages.length); if (e.key === 'ArrowLeft') goTo((index - 1 + pages.length) % pages.length); };
    document.addEventListener('keydown', handler); return () => document.removeEventListener('keydown', handler);
  }, [index, pages.length, visible, goTo]);

  if (loading || !visible) return null;

  return (
    <section id="live-pages" className="carousel-section">
      <div className="container">
        <span className="section-label">Live Demos</span>
        <h2 className="section-title">See my work<br />in action.</h2>
        <p className="section-subtitle">Click any preview to open the full site. These are real, deployed projects.</p>
      </div>
      <div className="carousel-container">
        <div className="carousel-progress"><div ref={progressRef} className="carousel-progress-fill" /></div>
        <div className="carousel-stage-wrapper">
          <button onClick={() => goTo((index - 1 + pages.length) % pages.length)} className="carousel-nav" aria-label="Previous"><i className="fas fa-chevron-left" /></button>
          <div className="carousel-stage" onMouseEnter={stopTimer} onMouseLeave={startTimer} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {pages.map((project, i) => {
              const isActive = i === index;
              const urlLabel = (project.liveDemo || '').replace('https://', '');
              const shouldLoad = iframesLoaded.current.has(i);
              return (
                <div key={project.id} className={`carousel-slide${isActive ? ' active' : ''}`}>
                  <div className="carousel-browser">
                    <div className="carousel-browser-bar">
                      <span className="browser-dot r" /><span className="browser-dot y" /><span className="browser-dot g" />
                      <div className="carousel-address"><i className="fas fa-lock text-[0.5rem]" />{urlLabel}</div>
                    </div>
                    <div className="carousel-viewport" onClick={() => window.open(project.liveDemo!, '_blank')}>
                      {shouldLoad && <iframe src={project.liveDemo!} scrolling="no" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" title={project.name} className="block border-none bg-white" style={{ width: '1280px', height: '800px', transform: 'scale(calc(var(--vp-width, 600) / 1280))', transformOrigin: 'top left' }} />}
                      <div className="absolute inset-0 z-[2] cursor-pointer" />
                    </div>
                  </div>
                  <div className="carousel-info">
                    <span className="carousel-lang"><i className="fas fa-code" /> {project.language}</span>
                    <h3 className="carousel-project-name">{project.name.replace(/-/g, ' ')}</h3>
                    <p className="carousel-project-desc" style={{ WebkitLineClamp: 3 }}>{project.description}</p>
                    <div className="carousel-stats"><span><i className="fas fa-star" />{project.stargazers_count}</span><span><i className="fas fa-code-branch" />{project.forks_count}</span></div>
                    {project.topics.length > 0 && <div className="carousel-tags">{project.topics.slice(0, 4).map((t) => <span key={t} className="carousel-tag">{t}</span>)}</div>}
                    <div className="carousel-cta">
                      <a href={project.liveDemo!} target="_blank" rel="noopener" className="carousel-cta-open"><i className="fas fa-external-link-alt" /> Open live site</a>
                      <a href={project.html_url} target="_blank" rel="noopener" className="carousel-cta-source"><i className="fab fa-github" /> View source</a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => goTo((index + 1) % pages.length)} className="carousel-nav" aria-label="Next"><i className="fas fa-chevron-right" /></button>
        </div>
        <div className="carousel-dots">
          {pages.map((_, i) => <button key={i} onClick={() => goTo(i)} className={`carousel-dot${i === index ? ' active' : ''}`} aria-label={`Slide ${i + 1}`} />)}
        </div>
      </div>
    </section>
  );
}
