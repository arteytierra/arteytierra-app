/**
 * Tipos y helpers para el informe de análisis de terreno.
 * Los datos del borrador se guardan en localStorage para pasarlos entre tabs.
 */
import type { DatosClima }       from './clima';
import type { DatosTopografia }  from './topografia';
import type { CaptacionSnapshot } from './captacion';
import type { DatosSuelo }       from './suelos';
import type { Extremos }         from './climaExtremos';
import type { RedAguaResumen }   from './hidraulica';
import type { RepresaResumen }   from './represa';
import type { RiegoResumen }     from './riego';
import type { CoberturaResumen } from './cobertura';
import type { EntornoResumen }   from './entorno';
import type { Zona }             from './zonificacion';
import type { Mojon }            from './types';
import type { MetricasPoligono } from './geometria';
import type { PerfilProfesional } from './profesional';
import type { EconomiaResumen }  from './economia';
import type { CarbonoResumen }   from './carbono';

export interface InformeData {
  nombre:     string;
  fecha:      string;           // ISO date string
  mojones:    Mojon[];
  metricas?:  MetricasPoligono;
  clima?:     DatosClima;
  extremos?:  Extremos;
  topo?:      DatosTopografia;
  captacion?: CaptacionSnapshot;
  suelo?:     DatosSuelo;
  redAgua?:   RedAguaResumen;
  represa?:   RepresaResumen;
  riego?:     RiegoResumen;
  cobertura?: CoberturaResumen;
  entorno?:   EntornoResumen;
  economia?:  EconomiaResumen;
  carbono?:   CarbonoResumen;
  zonas?:     Zona[];
  mapaDataUrl?: string;         // PNG del mapa capturado (base64)
  profesional?: PerfilProfesional; // white-label: marca del consultor que firma
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
  const base =
    (typeof window !== 'undefined' ? window.location.origin : null) ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'https://terreno.arteytierra.org';
  return `${base}/informe/${token}`;
}
