import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from './useGSAP';

export function useLenis(): Lenis | null {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    const id = requestAnimationFrame(raf);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    const handleAnchor = (e: Event) => {
      const link = (e.target as HTMLElement).closest('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href?.startsWith('#')) return;
      const el = document.querySelector(href) as HTMLElement | null;
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el, { offset: 0, duration: 1.5 });
      }
    };

    document.addEventListener('click', handleAnchor, { capture: true });

    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      document.removeEventListener('click', handleAnchor, { capture: true });
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
    };
  }, []);

  return null;
}
