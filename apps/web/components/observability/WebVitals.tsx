'use client';

import { useState } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

/**
 * Reporta Core Web Vitals (LCP, INP, CLS, TTFB, FCP) a /api/rum.
 *
 * Sampling en el cliente: solo 1 de cada N cargas de página reporta.
 * Esto evita invocar la función de servidor /api/rum en el ~95% de las
 * visitas (bajando el consumo de Fluid Active CPU en Vercel). Se decide
 * una única vez por carga, así todas las métricas de esa visita se
 * mandan juntas o ninguna. Ajustable con NEXT_PUBLIC_RUM_SAMPLE_RATE.
 * Usa navigator.sendBeacon para no afectar el unload.
 */
const SAMPLE_RATE = Number(process.env.NEXT_PUBLIC_RUM_SAMPLE_RATE ?? '20');

export function WebVitals() {
  const [report] = useState(() => SAMPLE_RATE <= 1 || Math.random() < 1 / SAMPLE_RATE);

  useReportWebVitals((metric) => {
    if (!report) return;

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
