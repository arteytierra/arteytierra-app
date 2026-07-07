/**
 * Cobertura del suelo (C3) — ESA WorldCover 10 m (2021).
 * Composición de clases de uso/cobertura del predio a partir del histograma
 * calculado en el servidor (Microsoft Planetary Computer). Deriva el % de
 * vegetación y sugerencias para ajustar forraje (pastoreo) y CN (escorrentía).
 * Orientativo — resolución 10 m, clasificación satelital global.
 */
import type { Mojon } from './types';

export interface ClaseCobertura {
  valor:  number;
  nombre: string;
  color:  string;
  grupo:  'vegetacion' | 'agua' | 'suelo' | 'artificial';
}

// Paleta y nombres oficiales ESA WorldCover v200.
export const CLASES_WC: Record<number, ClaseCobertura> = {
  10:  { valor: 10,  nombre: 'Bosque / arbolado',   color: '#006400', grupo: 'vegetacion' },
  20:  { valor: 20,  nombre: 'Arbustal',            color: '#ffbb22', grupo: 'vegetacion' },
  30:  { valor: 30,  nombre: 'Pastizal',            color: '#ffff4c', grupo: 'vegetacion' },
  40:  { valor: 40,  nombre: 'Cultivo',             color: '#f096ff', grupo: 'vegetacion' },
  50:  { valor: 50,  nombre: 'Construido / urbano', color: '#fa0000', grupo: 'artificial' },
  60:  { valor: 60,  nombre: 'Suelo desnudo / ralo', color: '#b4b4b4', grupo: 'suelo' },
  70:  { valor: 70,  nombre: 'Nieve / hielo',       color: '#f0f0f0', grupo: 'suelo' },
  80:  { valor: 80,  nombre: 'Agua',                color: '#0064c8', grupo: 'agua' },
  90:  { valor: 90,  nombre: 'Humedal herbáceo',    color: '#0096a0', grupo: 'agua' },
  95:  { valor: 95,  nombre: 'Manglar',             color: '#00cf75', grupo: 'vegetacion' },
  100: { valor: 100, nombre: 'Musgo / liquen',      color: '#fae6a0', grupo: 'vegetacion' },
};

export interface ItemCobertura {
  clase: ClaseCobertura;
  pct:   number;   // % del predio
}

export interface DatosCobertura {
  items:        ItemCobertura[];   // ordenadas por % desc
  veg_pct:      number;            // % con vegetación (bosque+arbusto+pasto+cultivo…)
  arbolado_pct: number;            // % bosque/arbolado
  agua_pct:     number;
  artificial_pct: number;
  suelo_pct:    number;            // suelo desnudo
  dominante:    string;            // clase dominante
  forraje_sugerido: number | null; // kg MS/ha·año orientativo por composición
  cn_hint:      string;            // nota sobre escorrentía/CN
  interpretacion: string[];
  anio:         number;
  fuente:       string;
}

interface RespCobertura {
  counts?: number[];
  clases?: number[];
  year?:   number;
  error?:  string;
}

export async function obtenerCobertura(mojones: Mojon[]): Promise<DatosCobertura> {
  const res = await fetch('/api/cobertura', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mojones: mojones.map(m => ({ lat: m.lat, lng: m.lng })) }),
    signal: AbortSignal.timeout(50_000),
  });
  const json = await res.json() as RespCobertura;
  if (json.error) throw new Error(json.error);
  if (!res.ok) throw new Error(`El servicio de cobertura respondió ${res.status}.`);

  const counts = json.counts ?? [];
  const clases = json.clases ?? [];
  const total = counts.reduce((s, c) => s + c, 0);
  if (total === 0) throw new Error('No se obtuvieron píxeles de cobertura para el predio.');

  const items: ItemCobertura[] = clases
    .map((v, i) => ({
      clase: CLASES_WC[v] ?? { valor: v, nombre: `Clase ${v}`, color: '#999', grupo: 'suelo' as const },
      pct: Math.round(((counts[i] ?? 0) / total) * 1000) / 10,
    }))
    .filter(it => it.pct > 0)
    .sort((a, b) => b.pct - a.pct);

  const pctDe = (pred: (c: ClaseCobertura) => boolean) =>
    Math.round(items.filter(it => pred(it.clase)).reduce((s, it) => s + it.pct, 0) * 10) / 10;

  const veg_pct        = pctDe(c => c.grupo === 'vegetacion');
  const arbolado_pct   = pctDe(c => c.valor === 10);
  const arbustal_pct   = pctDe(c => c.valor === 20);
  const pastizal_pct   = pctDe(c => c.valor === 30);
  const cultivo_pct    = pctDe(c => c.valor === 40);
  const agua_pct       = pctDe(c => c.grupo === 'agua');
  const artificial_pct = pctDe(c => c.grupo === 'artificial');
  const suelo_pct      = pctDe(c => c.valor === 60);
  const dominante      = items[0]?.clase.nombre ?? '—';

  // Forraje orientativo por composición (kg MS/ha·año) — mezcla ponderada.
  const forraje_sugerido = veg_pct > 0
    ? Math.round((pastizal_pct * 3500 + arbustal_pct * 1800 + cultivo_pct * 4500 + arbolado_pct * 800) / Math.max(1, pastizal_pct + arbustal_pct + cultivo_pct + arbolado_pct))
    : null;

  // Nota de escorrentía/CN según impermeabilización y suelo desnudo.
  const cn_hint =
    artificial_pct + suelo_pct > 30 ? 'Alta proporción de suelo desnudo/impermeable: esperá más escorrentía (CN alto).'
    : arbolado_pct > 40 ? 'Buena cobertura arbórea: menor escorrentía y más infiltración (CN bajo).'
    : 'Cobertura mixta: escorrentía moderada.';

  const interpretacion: string[] = [];
  interpretacion.push(`Cobertura dominante: ${dominante} (${items[0]?.pct ?? 0} %).`);
  if (arbolado_pct >= 10) interpretacion.push(`${arbolado_pct} % de bosque/arbolado — valor para biodiversidad, sombra y captura de carbono.`);
  if (suelo_pct >= 15) interpretacion.push(`${suelo_pct} % de suelo desnudo/ralo: prioridad de restauración con cobertura vegetal.`);
  if (artificial_pct >= 10) interpretacion.push(`${artificial_pct} % construido/urbano dentro del polígono — revisá que el límite del predio sea correcto.`);
  if (cultivo_pct >= 20) interpretacion.push(`${cultivo_pct} % de cultivo: base para planificar rotaciones y riego por sector.`);
  if (interpretacion.length === 1) interpretacion.push('Predio mayormente natural. Usá el % de pastizal/arbusto para calibrar la carga de pastoreo.');

  return {
    items, veg_pct, arbolado_pct, agua_pct, artificial_pct, suelo_pct, dominante,
    forraje_sugerido, cn_hint, interpretacion,
    anio: json.year ?? 2021,
    fuente: 'ESA WorldCover 10 m (2021) vía Microsoft Planetary Computer — orientativo',
  };
}

// Resumen para el informe.
export interface CoberturaResumen {
  dominante:    string;
  veg_pct:      number;
  arbolado_pct: number;
  suelo_pct:    number;
  artificial_pct: number;
  anio:         number;
  top: Array<{ nombre: string; pct: number }>;
}

export function resumirCobertura(d: DatosCobertura): CoberturaResumen {
  return {
    dominante: d.dominante, veg_pct: d.veg_pct, arbolado_pct: d.arbolado_pct,
    suelo_pct: d.suelo_pct, artificial_pct: d.artificial_pct, anio: d.anio,
    top: d.items.slice(0, 5).map(it => ({ nombre: it.clase.nombre, pct: it.pct })),
  };
}
