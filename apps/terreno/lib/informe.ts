/**
 * Tipos y helpers para el informe de análisis de terreno.
 * Los datos del borrador se guardan en localStorage para pasarlos entre tabs.
 */
import type { DatosClima }       from './clima';
import type { DatosTopografia }  from './topografia';
import type { CaptacionSnapshot } from './captacion';
import type { DatosSuelo }       from './suelos';
import type { Zona }             from './zonificacion';
import type { Mojon }            from './types';
import type { MetricasPoligono } from './geometria';

export interface InformeData {
  nombre:    string;
  fecha:     string;           // ISO date string
  mojones:   Mojon[];
  metricas?: MetricasPoligono;
  clima?:    DatosClima;
  topo?:     DatosTopografia;
  captacion?: CaptacionSnapshot;
  suelo?:    DatosSuelo;
  zonas?:    Zona[];
}

const LS_KEY = 'terreno_informe_borrador';

export function guardarInformeBorrador(data: InformeData): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch { /* sin soporte */ }
}

export function leerInformeBorrador(): InformeData | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as InformeData) : null;
  } catch { return null; }
}

export function urlInforme(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';
  return `${base}/informe/${token}`;
}
