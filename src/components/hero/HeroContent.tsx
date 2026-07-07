import Magnet from '../reactbits/Magnet';

export default function HeroContent() {
  return (
    <div className="hero-inner">
      <div className="hero-eyebrow">
        <span className="hero-eyebrow-dot" />
        Available for work
      </div>

      <h1 className="hero-title">
        <span className="hero-title-line">I build software that</span>
        <span className="hero-title-line accent">feels invisible.</span>
      </h1>

      <p className="hero-subtitle">
        Full-stack developer focused on Python, JavaScript, and Android. I create fast, clean applications where the interface disappears and the experience takes over.
      </p>

      <div className="hero-actions">
        <Magnet padding={60} magnetStrength={4}>
          <a href="#live-pages" className="hero-btn hero-btn-primary">
            See live projects <i className="fas fa-arrow-down" />
          </a>
        </Magnet>
        <Magnet padding={60} magnetStrength={4}>
          <a href="#contact" className="hero-btn hero-btn-secondary">
            Get in touch
          </a>
        </Magnet>
      </div>
    </div>
  );
}
