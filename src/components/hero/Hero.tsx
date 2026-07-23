import { useGSAP, splitChars, gsap } from '../../hooks/useGSAP';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import Aurora from '../reactbits/Aurora';
import VantaWaves from '../reactbits/VantaWaves';
import HeroContent from './HeroContent';
import HeroScrollIndicator from './HeroScrollIndicator';

export default function Hero() {
  const reducedMotion = useReducedMotion();

  const sectionRef = useGSAP<HTMLElement>((ref) => {
    if (!ref.current) return;

    if (!reducedMotion) {
      const titleLines = ref.current.querySelectorAll<HTMLElement>('.hero-title-line');
      titleLines.forEach((line) => {
        const chars = splitChars(line);
        gsap.from(chars, {
          scrollTrigger: { trigger: ref.current, start: 'top 80%', toggleActions: 'play none none none' },
          opacity: 0, y: 60, rotationX: -40, duration: 0.8,
          stagger: { amount: 0.6, from: 'start' }, ease: 'power3.out',
        });
      });
    } else {
      const titleLines = ref.current.querySelectorAll<HTMLElement>('.hero-title-line');
      gsap.from(titleLines, {
        scrollTrigger: { trigger: ref.current, start: 'top 80%', toggleActions: 'play none none none' },
        opacity: 0, duration: 0.6, stagger: 0.1,
      });
    }

    gsap.from('.hero-eyebrow', { scrollTrigger: { trigger: ref.current, start: 'top 80%' }, opacity: 0, y: 20, duration: 0.6, delay: 0.2 });
    gsap.from('.hero-subtitle', { scrollTrigger: { trigger: ref.current, start: 'top 80%' }, opacity: 0, y: 30, duration: 0.7, delay: 1.0 });
    gsap.from('.hero-actions', { scrollTrigger: { trigger: ref.current, start: 'top 80%' }, opacity: 0, y: 20, duration: 0.6, delay: 1.3 });
    gsap.from('.hero-scroll', { scrollTrigger: { trigger: ref.current, start: 'top 80%' }, opacity: 0, duration: 0.8, delay: 1.5 });

    if (!reducedMotion) {
      gsap.to('.hero-scroll', { y: 12, duration: 1.4, ease: 'power1.inOut', yoyo: true, repeat: -1, delay: 2.5 });
    }
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="hero" id="hero">
      <div className="absolute inset-0 z-0">
        <VantaWaves color="#ff3d00" waveHeight={12} waveSpeed={0.4} shininess={20} zoom={0.7} />
      </div>
      <div className="absolute inset-0 opacity-40">
        <Aurora colorStops={['#ff3d00', '#7000ff', '#ff3d00']} amplitude={0.8} blend={0.5} />
      </div>
      <HeroContent />
      <HeroScrollIndicator />
    </section>
  );
}
