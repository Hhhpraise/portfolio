import { useGSAP, gsap } from '../../hooks/useGSAP';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import CountUp from '../reactbits/CountUp';
import type { Project } from '../../types';

interface AboutProps { projects: Project[]; user: { public_repos: number; followers: number }; loading: boolean; error: string | null; }

export default function About({ projects, user, loading: _loading }: AboutProps) {
  const reducedMotion = useReducedMotion();
  const totalStars = projects.reduce((s, p) => s + p.stargazers_count, 0);

  const sectionRef = useGSAP<HTMLElement>((ref) => {
    if (!ref.current || reducedMotion) return;
    gsap.from(ref.current.querySelector('.section-label'), { scrollTrigger: { trigger: ref.current, start: 'top 80%' }, opacity: 0, y: 20, duration: 0.5 });
    gsap.from(ref.current.querySelector('.section-title'), { scrollTrigger: { trigger: ref.current, start: 'top 80%' }, opacity: 0, y: 30, duration: 0.6, delay: 0.1 });
    gsap.from(ref.current.querySelector('.about-visual'), { scrollTrigger: { trigger: ref.current, start: 'top 75%' }, opacity: 0, x: -50, duration: 0.8, ease: 'power2.out', delay: 0.3 });
    gsap.from(ref.current.querySelector('.about-text'), { scrollTrigger: { trigger: ref.current, start: 'top 75%' }, opacity: 0, x: 50, duration: 0.8, ease: 'power2.out', delay: 0.4 });
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} id="about">
      <div className="container">
        <span className="section-label">About</span>
        <h2 className="section-title">The person behind<br />the code.</h2>
        <div className="about-grid">
          <div className="about-visual">
            <div className="about-image-wrapper">
              <img src="https://github.com/Hhhpraise.png" alt="Praise" loading="lazy" />
              <div className="about-image-border" />
            </div>
            <div className="about-accent-block" />
          </div>
          <div className="about-text">
            <p>I'm a software developer who believes the best code is the code you never notice. My work lives at the intersection of clean architecture, thoughtful interfaces, and relentless attention to detail.</p>
            <p>I build with Python for its clarity, JavaScript for its reach, and Java for its power on Android. Every project I ship starts with the same question: <em>will this make someone's life simpler?</em></p>
            <p>When I'm not writing code, you'll find me exploring new tools, contributing to open-source, or sketching out the next idea that refuses to leave my head.</p>
            <div className="about-stat-row">
              <div className="about-stat"><CountUp to={user.public_repos || projects.length} from={0} duration={2} className="about-stat-value" /><span className="about-stat-label">GitHub Repos</span></div>
              <div className="about-stat"><CountUp to={totalStars} from={0} duration={2} className="about-stat-value" /><span className="about-stat-label">Stars Earned</span></div>
              <div className="about-stat"><CountUp to={user.followers || 0} from={0} duration={2} className="about-stat-value" /><span className="about-stat-label">Followers</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
