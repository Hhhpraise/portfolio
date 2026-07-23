import { useEffect, useRef, useCallback } from 'react';

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  className?: string;
  separator?: string;
}

export default function CountUp({
  to,
  from = 0,
  duration = 2,
  delay = 0,
  className = '',
  separator = '',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  const formatValue = useCallback(
    (value: number) => {
      const formatted = Intl.NumberFormat('en-US', {
        useGrouping: !!separator,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Math.round(value));
      return separator ? formatted.replace(/,/g, separator) : formatted;
    },
    [separator],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || animated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animated.current) return;
        animated.current = true;
        observer.disconnect();

        const start = performance.now();
        const delayMs = delay * 1000;
        const durMs = duration * 1000;

        const tick = (now: number) => {
          const elapsed = now - start - delayMs;
          if (elapsed < 0) {
            requestAnimationFrame(tick);
            return;
          }
          const progress = Math.min(elapsed / durMs, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = formatValue(from + (to - from) * eased);
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [to, from, duration, delay, formatValue]);

  return <span ref={ref} className={className}>{formatValue(from)}</span>;
}
