import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export function useGSAP<T extends HTMLElement>(
  setup: (ref: React.RefObject<T | null>, ctx: gsap.Context) => void,
  deps: unknown[] = []
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const ctx = gsap.context((self) => {
      setup(ref, self);
    }, ref.current ?? undefined);

    return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps]);

  return ref;
}

export function splitChars(el: HTMLElement): HTMLSpanElement[] {
  const text = el.textContent || '';
  el.innerHTML = '';
  const chars: HTMLSpanElement[] = [];
  [...text].forEach((char) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = char;
    span.style.display = char === ' ' ? 'inline' : 'inline-block';
    el.appendChild(span);
    chars.push(span);
  });
  return chars;
}

export { gsap, ScrollTrigger, ScrollToPlugin };
