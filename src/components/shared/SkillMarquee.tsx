import { useEffect, useRef } from 'react';
import { gsap } from '../../hooks/useGSAP';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const SKILLS = ['Python', 'JavaScript', 'Java', 'HTML/CSS', 'React', 'Node.js', 'Android', 'Git', 'Docker', 'SQL'];

export default function SkillMarquee() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!marqueeRef.current || reducedMotion) return;
    const track = marqueeRef.current.querySelector('.skills-track-inner') as HTMLElement;
    if (!track) return;
    const width = track.scrollWidth / 2;
    gsap.set(track, { x: 0 });
    const tween = gsap.to(track, { x: -width, duration: 25, ease: 'none', repeat: -1 });
    return () => { tween.kill(); };
  }, [reducedMotion]);

  return (
    <div ref={marqueeRef} className="skills-marquee">
      <div className="skills-track">
        <div className="skills-track-inner">
          {[...SKILLS, ...SKILLS].map((skill, i) => <span key={i} className="skill-marquee-item">{skill}</span>)}
        </div>
      </div>
    </div>
  );
}
