import { useGSAP, gsap } from '../../hooks/useGSAP';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function ReadingProgress() {
  const reducedMotion = useReducedMotion();
  const barRef = useGSAP<HTMLDivElement>((ref) => {
    if (!ref.current || reducedMotion) return;
    gsap.to(ref.current, {
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
      width: '100%', ease: 'none',
    });
  }, [reducedMotion]);
  return <div ref={barRef} className="reading-progress" />;
}
