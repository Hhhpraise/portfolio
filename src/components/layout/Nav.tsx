import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../hooks/useGSAP';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  // Close mobile menu on anchor click (Lenis handles the actual scroll)
  useEffect(() => {
    const handler = (e: Event) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!anchor) return;
      const menu = document.getElementById('mobile-menu');
      if (menu) {
        menu.classList.remove('open');
        menu.style.display = '';
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Nav background scrub
  useEffect(() => {
    if (!navRef.current || reducedMotion) return;
    const nav = navRef.current;
    ScrollTrigger.create({
      trigger: document.body, start: 'top top', end: '+=80', scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress;
        (nav.style as any).background = `rgba(10, 10, 10, ${0.85 * p})`;
        nav.style.backdropFilter = `blur(${20 * p}px)`;
        (nav.style as any).WebkitBackdropFilter = `blur(${20 * p}px)`;
        nav.style.padding = `${20 - 8 * p}px 0`;
        nav.style.borderBottom = p > 0.01 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none';
      },
    });
    return () => { ScrollTrigger.getAll().forEach((st) => st.kill()); };
  }, [reducedMotion]);

  // Nav underline hover
  useEffect(() => {
    const navLinks = document.getElementById('nav-links');
    const links = navLinks?.querySelectorAll('.nav-link') as NodeListOf<HTMLElement> | undefined;
    const underline = underlineRef.current;
    if (!navLinks || !links || !underline) return;
    const moveUnderline = (link: HTMLElement) => {
      const linkRect = link.getBoundingClientRect();
      const navRect = navLinks.getBoundingClientRect();
      gsap.to(underline, { left: linkRect.left - navRect.left, width: linkRect.width, opacity: 1, duration: 0.35, ease: 'power2.out' });
    };
    const hide = () => { gsap.to(underline, { opacity: 0, duration: 0.2 }); };
    links.forEach((link) => link.addEventListener('mouseenter', () => moveUnderline(link)));
    navLinks.addEventListener('mouseleave', hide);
    return () => {
      links.forEach((link) => link.removeEventListener('mouseenter', () => moveUnderline(link)));
      navLinks.removeEventListener('mouseleave', hide);
    };
  }, []);

  // Mobile menu toggle
  useEffect(() => {
    const mobileBtn = document.getElementById('nav-mobile-btn');
    const mobileClose = document.getElementById('mobile-close');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileBtn || !mobileClose || !mobileMenu) return;

    const menuItems = mobileMenu.querySelectorAll('a');
    const closeBtn = mobileMenu.querySelector('button');

    let isOpen = false;

    const openMenu = () => {
      if (isOpen) return;
      isOpen = true;
      mobileMenu.style.display = 'flex';
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(mobileMenu, { opacity: 0 }, { opacity: 1, duration: 0.3 })
        .fromTo(closeBtn, { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.4 }, '-=0.15')
        .fromTo(menuItems, { opacity: 0, x: 60, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, duration: 0.5, stagger: { each: 0.06, from: 'start' }, ease: 'back.out(1.7)' }, '-=0.25');
      mobileMenu.classList.add('open');
    };

    const closeMenu = () => {
      if (!isOpen) return;
      isOpen = false;
      const tl = gsap.timeline({ defaults: { ease: 'power2.in' }, onComplete: () => { mobileMenu.classList.remove('open'); mobileMenu.style.display = ''; } });
      tl.to(menuItems, { opacity: 0, x: -40, duration: 0.25, stagger: { each: 0.04, from: 'end' } }).to(mobileMenu, { opacity: 0, duration: 0.2 }, '-=0.15');
    };

    const toggle = () => {
      if (isOpen) { closeMenu(); }
      else { openMenu(); }
    };

    mobileBtn.addEventListener('click', toggle);
    mobileClose.addEventListener('click', closeMenu);
    menuItems.forEach((a) => a.addEventListener('click', closeMenu));

    return () => {
      mobileBtn.removeEventListener('click', toggle);
      mobileClose.removeEventListener('click', closeMenu);
      menuItems.forEach((a) => a.removeEventListener('click', closeMenu));
    };
  }, []);

  return (
    <nav ref={navRef} className="nav" id="nav">
      <div className="container nav-inner">
        <a href="#" className="nav-logo" aria-label="Praise home">
          <img src="https://github.com/Hhhpraise.png" alt="Praise" width={36} height={36} />
          <span>Praise</span>
        </a>
        <div className="nav-links" id="nav-links">
          <a href="#live-pages" className="nav-link">Live</a>
          <a href="#work" className="nav-link">Work</a>
          <a href="#publications" className="nav-link">Papers</a>
          <a href="#activity" className="nav-link">Activity</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
          <a href="https://github.com/Hhhpraise" target="_blank" rel="noopener" className="nav-cta">GitHub</a>
          <span ref={underlineRef} className="nav-underline" style={{ width: 0 }} />
        </div>
        <button className="nav-mobile-btn" id="nav-mobile-btn" aria-label="Menu"><i className="fas fa-bars" /></button>
      </div>
    </nav>
  );
}
