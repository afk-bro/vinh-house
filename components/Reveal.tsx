'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Wraps content that should fade-and-rise into view on scroll.
 * No-JS safe (CSS only hides when the `js` class is on <html>) and respects
 * prefers-reduced-motion (handled in globals.css). One-shot per element.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Cap the stagger so larger grids still feel snappy.
  const capped = Math.min(delay, 280);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'reveal-in' : ''} ${className}`}
      style={{ transitionDelay: shown ? `${capped}ms` : '0ms' }}
    >
      {children}
    </div>
  );
}
