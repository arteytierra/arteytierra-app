'use client';

import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
  className?: string;
}

/** Counter animado al entrar al viewport. Respeta prefers-reduced-motion. */
export function AnimatedNumber({
  value,
  duration = 1.2,
  decimals = 0,
  prefix = '',
  suffix = '',
  format,
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const prm = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prm) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  const formatted = format
    ? format(display)
    : `${prefix}${display.toFixed(decimals)}${suffix}`;

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${value.toFixed(decimals)}${suffix}`}>
      {formatted}
    </span>
  );
}
