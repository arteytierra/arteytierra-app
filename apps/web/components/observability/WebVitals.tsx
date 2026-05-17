'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * Reporta Core Web Vitals (LCP, INP, CLS, TTFB, FCP) a /api/rum.
 * Sólo envía si está habilitado (cuando el endpoint existe).
 * Usa navigator.sendBeacon para no afectar el unload.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/rum', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/rum', {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {});
    }
  });
  return null;
}
