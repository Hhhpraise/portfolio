import { useRef, useEffect, useMemo } from 'react';

interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  onAnimationComplete?: () => void;
}

export default function BlurText({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  onAnimationComplete,
}: BlurTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const animated = useRef(false);

  const segments = useMemo(
    () => (animateBy === 'words' ? text.split(' ') : text.split('')),
    [text, animateBy],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animated.current) return;
        animated.current = true;
        observer.disconnect();

        const spans = el.querySelectorAll<HTMLSpanElement>('.blur-char');

        spans.forEach((span, i) => {
          const d = (i * delay) / 1000;
          span.style.animation = `blurTextIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${d}s both`;
          span.style.setProperty(
            '--blur-from',
            direction === 'top' ? '-24px' : '24px',
          );
        });

        if (onAnimationComplete && spans.length > 0) {
          const totalDuration = ((segments.length - 1) * delay) / 1000 + 0.8;
          setTimeout(onAnimationComplete, totalDuration * 1000);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, direction, threshold, rootMargin, onAnimationComplete, segments.length]);

  return (
    <p ref={containerRef} className={`blur-text ${className} flex flex-wrap`}>
      {segments.map((segment, i) => (
        <span
          key={i}
          className="blur-char inline-block opacity-0"
          style={{ filter: 'blur(6px)', transform: `translateY(${direction === 'top' ? '-24px' : '24px'})` }}
        >
          {segment === ' ' ? ' ' : segment}
          {animateBy === 'words' && i < segments.length - 1 && ' '}
        </span>
      ))}
    </p>
  );
}
