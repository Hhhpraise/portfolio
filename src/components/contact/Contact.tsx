import { useGSAP, gsap } from '../../hooks/useGSAP';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import ContactForm from './ContactForm';

export default function Contact() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useGSAP<HTMLElement>((ref) => {
    if (!ref.current || reducedMotion) return;
    gsap.from(ref.current.querySelector('.section-label'), { scrollTrigger: { trigger: ref.current, start: 'top 80%' }, opacity: 0, y: 20, duration: 0.5 });
    gsap.from(ref.current.querySelector('.section-title'), { scrollTrigger: { trigger: ref.current, start: 'top 80%' }, opacity: 0, y: 30, duration: 0.6, delay: 0.1 });
    gsap.from(ref.current.querySelector('.contact-info'), { scrollTrigger: { trigger: ref.current, start: 'top 75%' }, opacity: 0, x: -40, duration: 0.7, ease: 'power2.out', delay: 0.3 });
    gsap.from(ref.current.querySelector('form'), { scrollTrigger: { trigger: ref.current, start: 'top 75%' }, opacity: 0, x: 40, duration: 0.7, ease: 'power2.out', delay: 0.4 });
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} id="contact">
      <div className="container">
        <span className="section-label">Contact</span>
        <h2 className="section-title">Let's build something<br />together.</h2>
        <div className="contact-grid">
          <div className="contact-info">
            <h3>Get in touch</h3>
            <p>I'm currently open to freelance opportunities and interesting projects. Whether you have a question, a collaboration idea, or just want to say hi — I'll get back to you.</p>
            <div className="contact-socials">
              <a href="https://github.com/Hhhpraise" target="_blank" rel="noopener" className="contact-social"><i className="fab fa-github" /> GitHub</a>
              <a href="https://www.instagram.com/__praisee" target="_blank" rel="noopener" className="contact-social"><i className="fab fa-instagram" /> Instagram</a>
              <a href="mailto:hhhpraise33@gmail.com" className="contact-social"><i className="fas fa-envelope" /> Email</a>
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
