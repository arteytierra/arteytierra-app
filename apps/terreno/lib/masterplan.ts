/**
 * Master Plan: el usuario declara el programa del predio (casas, galpón, ganado,
 * cultivo, acopio de agua…) y el motor dimensiona cada elemento y le busca
 * ubicación sobre la grilla topográfica (shader + escorrentías), con los mismos
 * criterios permaculturales del módulo de sugerencias.
 *
 * ⚠️ Resultados orientativos (SRTM 30m). Verificar en campo.
 */
import * as turf from '@turf/turf';
import type { DatosShader, CeldaShader } from './shaders';
import type { DatosEscorrentia } from './escorrentias';
import type { CategoriaZona } from './zonificacion';
import { trazarCaminoRelieve, type AnalisisRelieve } from './cuencaHidro';

// ─── Programa ─────────────────────────────────────────────────────────────────

export type TipoItemPrograma =
  | 'casa' | 'cabana' | 'galpon' | 'garage' | 'quincho' | 'sum'
  | 'gallinero' | 'colmenas' | 'invernadero' | 'compostera'
  | 'corral' | 'pastoreo' | 'huerta' | 'cultivo' | 'frutales'
  | 'reservorio' | 'personalizado';

export type EspecieGanado = 'bovino' | 'ovino' | 'caprino' | 'equino';

/**
 * Perfil de aptitud: qué busca cada elemento EN EL TERRENO (pendiente, agua,
 * orientación, acceso). Varios tipos comparten perfil, así sumar elementos
 * nuevos no exige tocar el scoring.
 */
export type PerfilAptitud =
  | 'vivienda' | 'servicio' | 'social' | 'granja' | 'huerta'
  | 'corral' | 'apiario' | 'agua' | 'pastoreo' | 'cultivo' | 'frutal' | 'generico';

export interface ItemPrograma {
  id:            string;
  tipo:          TipoItemPrograma;
  cantidad:      number;          // construcciones
  cabezas?:      number;          // pastoreo
  especie?:      EspecieGanado;
  receptividad?: number;          // EV/ha (default 0.7)
  hectareas?:    number;          // cultivo/frutales/huerta, o ha a regar (reservorio)
  nombre?:       string;          // para personalizado
}

export interface DefItemPrograma {
  label:           string;
  emoji:           string;
  color:           string;
  categoriaZona:   CategoriaZona;
  areaUnitariaM2?: number;              // construcciones: huella + entorno operativo
  esArea:          boolean;             // true = se asigna superficie contigua
  perfil:          PerfilAptitud;       // qué busca en el terreno
  banda:           number;              // distancia relativa preferida a la zona 0 (0..1)
  afines:          TipoItemPrograma[];  // quiere estar cerca de estos (grafo de vecindad)
}

export const TIPOS_ITEM: Record<TipoItemPrograma, DefItemPrograma> = {
  casa:          { label: 'Casa / vivienda',      emoji: '🏠', color: '#8B7355', categoriaZona: 'vivienda',        areaUnitariaM2: 800,  esArea: false, perfil: 'vivienda', banda: 0.00, afines: [] },
  cabana:        { label: 'Cabaña de alquiler',   emoji: '🛖', color: '#E67E22', categoriaZona: 'vivienda',        areaUnitariaM2: 500,  esArea: false, perfil: 'vivienda', banda: 0.24, afines: ['casa'] },
  galpon:        { label: 'Galpón',               emoji: '🏚️', color: '#90A4AE', categoriaZona: 'infraestructura', areaUnitariaM2: 600,  esArea: false, perfil: 'servicio', banda: 0.20, afines: ['casa', 'corral'] },
  garage:        { label: 'Garage / cochera',     emoji: '🚗', color: '#78909C', categoriaZona: 'infraestructura', areaUnitariaM2: 300,  esArea: false, perfil: 'servicio', banda: 0.08, afines: ['casa'] },
  quincho:       { label: 'Quincho / fogón',      emoji: '🍖', color: '#BF6B3A', categoriaZona: 'recreacion',      areaUnitariaM2: 250,  esArea: false, perfil: 'social',   banda: 0.12, afines: ['casa'] },
  sum:           { label: 'SUM / salón',          emoji: '🏛️', color: '#8D6E63', categoriaZona: 'recreacion',      areaUnitariaM2: 350,  esArea: false, perfil: 'social',   banda: 0.14, afines: ['casa'] },
  gallinero:     { label: 'Gallinero',            emoji: '🐔', color: '#C9A227', categoriaZona: 'infraestructura', areaUnitariaM2: 200,  esArea: false, perfil: 'granja',   banda: 0.16, afines: ['huerta', 'galpon'] },
  colmenas:      { label: 'Colmenas / apiario',   emoji: '🐝', color: '#F5A623', categoriaZona: 'apiario',         areaUnitariaM2: 150,  esArea: false, perfil: 'apiario',  banda: 0.45, afines: ['frutales', 'huerta'] },
  invernadero:   { label: 'Invernadero / vivero', emoji: '🪴', color: '#66BB6A', categoriaZona: 'huerta',          areaUnitariaM2: 300,  esArea: false, perfil: 'huerta',   banda: 0.14, afines: ['huerta', 'casa'] },
  compostera:    { label: 'Compostera',           emoji: '♻️', color: '#6D4C41', categoriaZona: 'compost_vivero',  areaUnitariaM2: 120,  esArea: false, perfil: 'granja',   banda: 0.18, afines: ['huerta', 'galpon'] },
  corral:        { label: 'Corrales / manga',     emoji: '🐄', color: '#A1887F', categoriaZona: 'pasturas',        areaUnitariaM2: 1500, esArea: false, perfil: 'corral',   banda: 0.38, afines: ['galpon', 'pastoreo'] },
  reservorio:    { label: 'Acopio de agua',       emoji: '💧', color: '#1E88E5', categoriaZona: 'agua',                                  esArea: false, perfil: 'agua',     banda: 0.30, afines: [] },
  personalizado: { label: 'Otro elemento',        emoji: '📦', color: '#9C27B0', categoriaZona: 'personalizado',   areaUnitariaM2: 500,  esArea: false, perfil: 'generico', banda: 0.35, afines: [] },
  huerta:        { label: 'Huerta intensiva',     emoji: '🥬', color: '#5A8F3C', categoriaZona: 'huerta',          areaUnitariaM2: 1000, esArea: false, perfil: 'huerta',   banda: 0.10, afines: ['casa', 'reservorio'] },
  pastoreo:      { label: 'Pastoreo / ganadería', emoji: '🌾', color: '#9DC183', categoriaZona: 'pasturas',                              esArea: true,  perfil: 'pastoreo', banda: 0.78, afines: ['corral'] },
  cultivo:       { label: 'Cultivo extensivo',    emoji: '🌽', color: '#F0C040', categoriaZona: 'cultivo',                               esArea: true,  perfil: 'cultivo',  banda: 0.72, afines: [] },
  frutales:      { label: 'Monte frutal',         emoji: '🍎', color: '#E67E22', categoriaZona: 'frutales',                              esArea: true,  perfil: 'frutal',   banda: 0.50, afines: ['huerta'] },
};

/** Orden de colocación: anclas primero, luego lo que depende de ellas. */
const PRIORIDAD: Record<TipoItemPrograma, number> = {
  casa: 0, reservorio: 1, huerta: 2, galpon: 3, garage: 3, invernadero: 3,
  gallinero: 4, compostera: 4, quincho: 5, sum: 5, corral: 6, cabana: 6,
  colmenas: 7, personalizado: 8,
  frutales: 20, pastoreo: 21, cultivo: 22,
};

/** Peso del anclaje a la zona 0 (banda de permacultura) según perfil. */
const BANDA_PESO: Record<PerfilAptitud, number> = {
  vivienda: 46, servicio: 48, social: 46, granja: 48, huerta: 50,
  corral: 44, apiario: 40, frutal: 34, agua: 22, pastoreo: 28, cultivo: 28, generico: 40,
};

/** Equivalente vaca (EV) por cabeza según especie */
export const EQUIV_EV: Record<EspecieGanado, { factor: number; label: string }> = {
  bovino:  { factor: 1.0,  label: 'Bovino'  },
  ovino:   { factor: 0.17, label: 'Ovino'   },
  caprino: { factor: 0.17, label: 'Caprino' },
  equino:  { factor: 1.2,  label: 'Equino'  },
};

const RECEPTIVIDAD_DEFAULT = 0.7;   // EV/ha — pastizal natural semiárido; ajustable
const LAMINA_RIEGO_M3_HA   = 1500;  // m³/ha·año de riego complementario
const PROFUNDIDAD_RESERVORIO_M = 2.5;

// ─── Dimensionado ─────────────────────────────────────────────────────────────

export interface Dimensionado {
  area_m2: number;
  detalle: string;
}

export function dimensionarItem(item: ItemPrograma): Dimensionado {
  const def = TIPOS_ITEM[item.tipo];

  if (item.tipo === 'pastoreo') {
    const cabezas = item.cabezas ?? 10;
    const especie = item.especie ?? 'bovino';
    const recept  = item.receptividad ?? RECEPTIVIDAD_DEFAULT;
    const ev      = cabezas * EQUIV_EV[especie].factor;
    const ha      = ev / Math.max(recept, 0.05);
    return {
      area_m2: ha * 10_000,
      detalle: `${cabezas} cab. ${EQUIV_EV[especie].label.toLowerCase()} ≈ ${ev.toFixed(1)} EV ÷ ${recept} EV/ha = ${ha.toFixed(1)} ha`,
    };
  }

  if (item.tipo === 'cultivo' || item.tipo === 'frutales') {
    const ha = item.hectareas ?? 1;
    return { area_m2: ha * 10_000, detalle: `${ha} ha declaradas` };
  }

  if (item.tipo === 'reservorio') {
    const haRiego = item.hectareas ?? 1;
    const volumen = haRiego * LAMINA_RIEGO_M3_HA;
    const espejo  = volumen / PROFUNDIDAD_RESERVORIO_M;
    return {
      area_m2: espejo,
      detalle: `riego de ${haRiego} ha ≈ ${volumen.toLocaleString('es-AR')} m³ → espejo ${(espejo / 10_000).toFixed(2)} ha (prof. ${PROFUNDIDAD_RESERVORIO_M} m)`,
    };
  }

  if (item.tipo === 'huerta' && item.hectareas) {
    return { area_m2: item.hectareas * 10_000, detalle: `${item.hectareas} ha declaradas` };
  }

  const unidad = def.areaUnitariaM2 ?? 500;
  const n = Math.max(1, item.cantidad);
  return {
    area_m2: unidad * n,
    detalle: `${n} × ${unidad} m² (huella + entorno)`,
  };
}

// ─── Resultado ────────────────────────────────────────────────────────────────

export interface ElementoMasterPlan {
  id:       string;
  itemId:   string;
  tipo:     TipoItemPrograma;
  nombre:   string;
  vertices: Array<{ lat: number; lng: number }>;
  area_m2:  number;
  score:    number;
  motivos:  string[];
}

// ─── Scoring por perfil ───────────────────────────────────────────────────────

interface ContextoCelda {
  c:        CeldaShader;
  lat:      number;
  lng:      number;
  acumRel:  number;
  elevRel:  number;
  distEntradaRel: number;   // 0 = junto a la entrada, 1 = lo más lejos
  distZona0Rel:   number;   // 0 = sobre zona 0, 1 = lo más lejos (si hay zona 0)
  orientacionNorte: number; // >0 ladera norte (HemSur)
}

/** Elemento ya ubicado, para el término de afinidad (grafo de vecindad). */
interface Colocado { tipo: TipoItemPrograma; lat: number; lng: number }

/**
 * Aptitud del TERRENO para un perfil (pendiente, agua, orientación, acceso).
 * Devuelve puntos crudos (~0..35) + motivos. La coherencia del conjunto (dónde
 * respecto de la casa, junto a qué) la aportan la banda y la afinidad aparte.
 */
function terrenoScore(perfil: PerfilAptitud, ctx: ContextoCelda): { s: number; motivos: string[] } {
  const { c, acumRel, elevRel, orientacionNorte, distEntradaRel } = ctx;
  const pend = c.pendiente_pct;
  let s = 0;
  const m: string[] = [];

  const plano = (hi: number) => {
    if      (pend < 3)  { s += hi;        m.push('terreno casi plano'); }
    else if (pend < 7)  { s += hi * 0.7;  m.push('pendiente suave'); }
    else if (pend < 12) { s += hi * 0.4; }
    else if (pend < 18) { s += hi * 0.1; }
    else                { s -= hi * 0.4;  m.push('pendiente alta'); }
  };
  const seco = (hi: number) => {
    if      (acumRel < 0.07) { s += hi;       m.push('fuera de drenajes'); }
    else if (acumRel < 0.22) { s += hi * 0.4; }
    else                     { s -= hi * 0.8; m.push('zona de escorrentía'); }
  };
  const norte = (hi: number) => {
    if      (orientacionNorte >  2) { s += hi;       m.push('orientación norte'); }
    else if (orientacionNorte >  0) { s += hi * 0.5; }
    else if (orientacionNorte < -2) { s -= hi * 0.4; m.push('orientación sur'); }
  };
  const cercaAcceso = (hi: number) => {
    if      (distEntradaRel < 0.25) { s += hi;       m.push('cerca del acceso'); }
    else if (distEntradaRel < 0.50) { s += hi * 0.5; }
  };

  switch (perfil) {
    case 'vivienda':
      plano(14); seco(8); norte(8);
      if (elevRel >= 0.35 && elevRel <= 0.82) { s += 6; m.push('posición elevada protegida'); }
      else if (elevRel < 0.18) { s -= 3; m.push('posición baja (humedad)'); }
      break;
    case 'servicio':
      plano(13); seco(6); cercaAcceso(10);
      break;
    case 'social':
      plano(11); seco(6); norte(6);
      if (elevRel >= 0.40 && elevRel <= 0.85) { s += 6; m.push('con vistas'); }
      break;
    case 'granja':
      plano(11); seco(10); norte(6);
      break;
    case 'huerta':
      plano(12); norte(10); seco(6);
      if (acumRel > 0.04 && acumRel < 0.20) { s += 6; m.push('agua cercana sin riesgo'); }
      break;
    case 'corral':
      plano(12); seco(10); cercaAcceso(8);
      break;
    case 'apiario':
      norte(10); seco(6);
      if (pend < 15) s += 5;
      if (elevRel > 0.20 && elevRel < 0.70) { s += 5; m.push('reparo del viento'); }
      break;
    case 'agua':
      if      (acumRel > 0.45) { s += 22; m.push('alta captación de flujos'); }
      else if (acumRel > 0.25) { s += 14; m.push('captación media'); }
      else if (acumRel > 0.10) { s += 6; }
      else                     { s -= 8;  m.push('poca acumulación'); }
      if      (pend < 8)  { s += 10; m.push('plano para excavar'); }
      else if (pend < 15) { s += 5; }
      else                { s -= 8; }
      if (elevRel < 0.35) { s += 8; m.push('punto bajo natural'); }
      break;
    case 'pastoreo':
      if (pend < 12) s += 20; else if (pend < 20) s += 12; else s += 4;
      seco(6); m.push('apto pastizal');
      break;
    case 'cultivo':
      if      (pend < 3)  { s += 25; m.push('plano, apto maquinaria'); }
      else if (pend < 6)  { s += 16; m.push('pendiente leve'); }
      else if (pend < 10) { s += 5; }
      else                { s -= 16; m.push('pendiente excesiva para cultivo'); }
      seco(8);
      break;
    case 'frutal':
      if (pend < 12) s += 14; else s += 4;
      norte(10); seco(6);
      if (elevRel >= 0.30 && elevRel <= 0.75) { s += 6; m.push('a media ladera, sin heladas de fondo'); }
      break;
    case 'generico':
      plano(12); seco(8); cercaAcceso(6);
      break;
  }
  return { s, motivos: m };
}

/** Bonus por estar cerca de un elemento afín ya colocado (0..25). */
function afinidadScore(
  afines: TipoItemPrograma[], lat: number, lng: number,
  colocados: Colocado[], rangoM: number, kx: number, ky: number,
): { s: number; motivos: string[] } {
  if (afines.length === 0 || colocados.length === 0) return { s: 0, motivos: [] };
  let mejorD = Infinity;
  let mejorTipo: TipoItemPrograma | null = null;
  for (const p of colocados) {
    if (!afines.includes(p.tipo)) continue;
    const d = Math.hypot((lng - p.lng) * kx, (lat - p.lat) * ky);
    if (d < mejorD) { mejorD = d; mejorTipo = p.tipo; }
  }
  if (!mejorTipo || !isFinite(mejorD)) return { s: 0, motivos: [] };
  const prox = 1 - Math.min(1, mejorD / rangoM);
  const motivos = prox > 0.55 ? [`junto a ${TIPOS_ITEM[mejorTipo].label.toLowerCase()}`] : [];
  return { s: 25 * prox, motivos };
}

/**
 * Puntaje combinado de una celda para un elemento: TERRENO + BANDA (permacultura,
 * distancia a la casa) + AFINIDAD (vecindad) − penalización por amontonar puntuales.
 * La banda domina la ubicación gruesa; el terreno decide la posición fina.
 */
function puntuarCelda(
  def: DefItemPrograma, ctx: ContextoCelda, hayZona0: boolean,
  colocados: Colocado[], rangoM: number, sepMinM: number, kx: number, ky: number,
): { score: number; motivos: string[] } {
  const t = terrenoScore(def.perfil, ctx);
  let raw = t.s;
  const motivos = [...t.motivos];

  if (hayZona0) {
    const ventana = def.esArea ? 0.42 : 0.26;
    const match = 1 - Math.min(1, Math.abs(ctx.distZona0Rel - def.banda) / ventana);
    raw += BANDA_PESO[def.perfil] * match;
    if      (match > 0.70) motivos.push('a la distancia adecuada de la casa');
    else if (match < 0.30) motivos.push('lejos de su zona ideal respecto de la casa');
  }

  const af = afinidadScore(def.afines, ctx.lat, ctx.lng, colocados, rangoM, kx, ky);
  raw += af.s;
  motivos.push(...af.motivos);

  // Colmenas: lejos de puertas y circulación de la casa.
  if (def.perfil === 'apiario') {
    for (const p of colocados) {
      if (p.tipo !== 'casa' && p.tipo !== 'cabana' && p.tipo !== 'quincho' && p.tipo !== 'sum') continue;
      const d = Math.hypot((ctx.lng - p.lng) * kx, (ctx.lat - p.lat) * ky);
      if (d < 60) { raw -= 18; motivos.push('demasiado cerca de la casa'); break; }
    }
  }

  // Puntuales: no amontonar construcciones que no son afines entre sí. Penalización
  // proporcional a la cercanía (más fuerte cuanto más pegadas) y acumulativa entre
  // vecinos, acotada — separa de verdad en vez de castigar todo por igual (antes era
  // un −14 plano al primer vecino cercano, indiferente a la distancia real).
  if (!def.esArea) {
    let pen = 0;
    for (const p of colocados) {
      if (def.afines.includes(p.tipo)) continue;
      const d = Math.hypot((ctx.lng - p.lng) * kx, (ctx.lat - p.lat) * ky);
      if (d < sepMinM) pen += 16 * (1 - d / sepMinM);
    }
    raw -= Math.min(pen, 30);
  }

  return { score: Math.max(0, Math.min(100, Math.round(raw))), motivos };
}

/**
 * Contorno rectilíneo real del conjunto de celdas (sigue el borde de las celdas,
 * sin abombarse como el hull convexo). Como las celdas de cada zona son disjuntas
 * (Set `usadas` compartido), así las zonas del master plan NO se pisan entre sí.
 */
function contornoCeldas(region: CeldaShader[]): Array<{ lat: number; lng: number }> {
  const inReg = new Set(region.map(c => `${c.row},${c.col}`));
  const segs: Array<[[number, number], [number, number]]> = [];  // [[lat,lng],[lat,lng]]
  for (const c of region) {
    const { row, col, latMin, latMax, lngMin, lngMax } = c;
    if (!inReg.has(`${row + 1},${col}`)) segs.push([[latMax, lngMin], [latMax, lngMax]]);
    if (!inReg.has(`${row - 1},${col}`)) segs.push([[latMin, lngMin], [latMin, lngMax]]);
    if (!inReg.has(`${row},${col + 1}`)) segs.push([[latMin, lngMax], [latMax, lngMax]]);
    if (!inReg.has(`${row},${col - 1}`)) segs.push([[latMin, lngMin], [latMax, lngMin]]);
  }
  if (segs.length < 3) return [];
  const key = (p: [number, number]) => `${p[0].toFixed(7)},${p[1].toFixed(7)}`;
  const adj = new Map<string, [number, number][]>();
  const push = (k: string, v: [number, number]) => { const l = adj.get(k); if (l) l.push(v); else adj.set(k, [v]); };
  for (const [a, b] of segs) { push(key(a), b); push(key(b), a); }

  const start = segs[0]![0];
  const anillo: Array<{ lat: number; lng: number }> = [];
  let cur = start, curK = key(start), prevK = '';
  for (let i = 0; i < segs.length * 2 + 8; i++) {
    anillo.push({ lat: cur[0], lng: cur[1] });
    const nbrs = adj.get(curK);
    if (!nbrs || nbrs.length === 0) break;
    const next = nbrs.find(nb => key(nb) !== prevK) ?? nbrs[0]!;
    prevK = curK; curK = key(next); cur = next;
    if (curK === key(start)) break;
  }
  if (anillo.length < 3) return [];

  // Colapsar vértices colineales (los bordes son axis-aligned → runs largos).
  const simple: Array<{ lat: number; lng: number }> = [];
  const nA = anillo.length;
  for (let i = 0; i < nA; i++) {
    const a = anillo[(i - 1 + nA) % nA]!, b = anillo[i]!, c = anillo[(i + 1) % nA]!;
    const colineal = (Math.abs(a.lat - b.lat) < 1e-9 && Math.abs(b.lat - c.lat) < 1e-9)
                  || (Math.abs(a.lng - b.lng) < 1e-9 && Math.abs(b.lng - c.lng) < 1e-9);
    if (!colineal) simple.push(b);
  }
  return simple.length >= 3 ? simple : anillo;
}

// ─── Cálculo principal ────────────────────────────────────────────────────────

export function calcularMasterPlan(
  programa:     ItemPrograma[],
  shader:       DatosShader,
  escorrentias: DatosEscorrentia,
  mojones?:     Array<{ lat: number; lng: number }>,
  zona0?:       { lat: number; lng: number } | null,
): ElementoMasterPlan[] {
  const { elev_min, elev_max } = shader;
  const { acumulacion, acum_max } = escorrentias;
  if (shader.celdas.length === 0 || programa.length === 0) return [];

  // Recortar al polígono del predio: el master plan SOLO ubica dentro de los
  // mojones. En modo topográfico detallado la grilla abarca todo el bounding box
  // (no solo el predio), por eso sin este filtro las zonas caían afuera.
  let celdas = shader.celdas;
  if (mojones && mojones.length >= 3) {
    const anillo = mojones.map(m => [m.lng, m.lat] as [number, number]);
    anillo.push(anillo[0]!);
    const poly = turf.polygon([anillo]);
    const dentro = celdas.filter(c =>
      turf.booleanPointInPolygon(turf.point([(c.lngMin + c.lngMax) / 2, (c.latMin + c.latMax) / 2]), poly));
    if (dentro.length >= 4) celdas = dentro;
  }

  const byPos = new Map<string, CeldaShader>();
  celdas.forEach(c => byPos.set(`${c.row},${c.col}`, c));

  // Área de celda + proyección local (metros) para distancias reales
  const c0 = celdas[0]!;
  let latMinP = Infinity, latMaxP = -Infinity, lngMinP = Infinity, lngMaxP = -Infinity;
  for (const c of celdas) {
    if (c.latMin < latMinP) latMinP = c.latMin; if (c.latMax > latMaxP) latMaxP = c.latMax;
    if (c.lngMin < lngMinP) lngMinP = c.lngMin; if (c.lngMax > lngMaxP) lngMaxP = c.lngMax;
  }
  const latRef = (latMinP + latMaxP) / 2;
  const kx = 111_320 * Math.cos(latRef * Math.PI / 180);
  const ky = 111_320;
  const cellLatM = (c0.latMax - c0.latMin) * ky;
  const cellLngM = (c0.lngMax - c0.lngMin) * kx;
  const cellAreaM2 = Math.max(cellLatM * cellLngM, 1);
  const cellSizeM  = Math.sqrt(cellAreaM2);
  const predioDiagM = Math.hypot((lngMaxP - lngMinP) * kx, (latMaxP - latMinP) * ky);
  const rangoM  = Math.min(550, Math.max(150, predioDiagM * 0.28));  // escala de "cercanía" (afinidad)
  const sepMinM = Math.max(cellSizeM * 1.4, 40);                     // separación mínima entre construcciones

  // Entrada del predio: celda de borde más baja (igual criterio que sugerencias)
  const borde = celdas.filter(c =>
    !byPos.has(`${c.row - 1},${c.col}`) || !byPos.has(`${c.row + 1},${c.col}`) ||
    !byPos.has(`${c.row},${c.col - 1}`) || !byPos.has(`${c.row},${c.col + 1}`));
  const entrada = [...borde].sort((a, b) => a.elevation - b.elevation)[0] ?? c0;
  const maxDist = Math.max(...celdas.map(c =>
    Math.hypot(c.row - entrada.row, c.col - entrada.col)), 1);

  // Zona 0: celda más cercana al punto marcado por el usuario (casa/edificio
  // principal). Todo se ubica en relación a ella (zonas de permacultura).
  const hayZona0 = !!zona0;
  const anclaZ = zona0
    ? celdas.reduce((best, c) => {
        const d  = Math.hypot((c.latMin + c.latMax) / 2 - zona0.lat, (c.lngMin + c.lngMax) / 2 - zona0.lng);
        const bd = Math.hypot((best.latMin + best.latMax) / 2 - zona0.lat, (best.lngMin + best.lngMax) / 2 - zona0.lng);
        return d < bd ? c : best;
      }, celdas[0]!)
    : entrada;
  const maxDistZ = Math.max(...celdas.map(c =>
    Math.hypot(c.row - anclaZ.row, c.col - anclaZ.col)), 1);

  function contexto(c: CeldaShader): ContextoCelda {
    const key = `${c.row},${c.col}`;
    const acumRel = (acumulacion.get(key) ?? 1) / Math.max(acum_max, 1);
    const elevRel = elev_max > elev_min ? (c.elevation - elev_min) / (elev_max - elev_min) : 0.5;
    const sur   = byPos.get(`${c.row - 1},${c.col}`);
    const norte = byPos.get(`${c.row + 1},${c.col}`);
    const orientacionNorte = sur && norte ? sur.elevation - norte.elevation : 0;
    const distEntradaRel = Math.hypot(c.row - entrada.row, c.col - entrada.col) / maxDist;
    const distZona0Rel   = Math.hypot(c.row - anclaZ.row, c.col - anclaZ.col) / maxDistZ;
    return {
      c, lat: (c.latMin + c.latMax) / 2, lng: (c.lngMin + c.lngMax) / 2,
      acumRel, elevRel, distEntradaRel, distZona0Rel, orientacionNorte,
    };
  }

  const contextos = new Map<string, ContextoCelda>();
  celdas.forEach(c => contextos.set(`${c.row},${c.col}`, contexto(c)));

  const usadas = new Set<string>();
  // Elementos ya ubicados (para afinidad). La zona 0 cuenta como casa desde el arranque.
  const colocados: Colocado[] = [];
  if (zona0) colocados.push({ tipo: 'casa', lat: zona0.lat, lng: zona0.lng });

  // ── Elementos puntuales, en orden de dependencia (anclas primero) ──
  interface PuntColoc {
    el: ElementoMasterPlan; cellKey: string; def: DefItemPrograma;
    item: ItemPrograma; areaUnidad: number; coloc: Colocado; fijo: boolean;
  }
  const unidades: Array<{ item: ItemPrograma; def: DefItemPrograma; idx: number; total: number }> = [];
  for (const item of programa.filter(i => !TIPOS_ITEM[i.tipo].esArea)) {
    const def = TIPOS_ITEM[item.tipo];
    const n = Math.max(1, item.cantidad);
    for (let k = 0; k < n; k++) unidades.push({ item, def, idx: k, total: n });
  }
  unidades.sort((a, b) => PRIORIDAD[a.item.tipo] - PRIORIDAD[b.item.tipo]);

  const cuadrado = (latC: number, lngC: number, areaUnidad: number) => {
    const lado = Math.sqrt(areaUnidad);
    const dLat = (lado / 2) / ky;
    const dLng = (lado / 2) / kx;
    return [
      { lat: latC - dLat, lng: lngC - dLng }, { lat: latC - dLat, lng: lngC + dLng },
      { lat: latC + dLat, lng: lngC + dLng }, { lat: latC + dLat, lng: lngC - dLng },
    ];
  };

  const puntColoc: PuntColoc[] = [];
  for (const { item, def, idx, total } of unidades) {
    const dim = dimensionarItem(item);
    const areaUnidad = dim.area_m2 / Math.max(1, total);

    const forzarZona0 = hayZona0 && item.tipo === 'casa' && idx === 0
      && !usadas.has(`${anclaZ.row},${anclaZ.col}`);

    let mejor: { c: CeldaShader; score: number; motivos: string[] } | null = null;
    if (forzarZona0) {
      const p = puntuarCelda(def, contextos.get(`${anclaZ.row},${anclaZ.col}`)!, hayZona0, colocados, rangoM, sepMinM, kx, ky);
      mejor = { c: anclaZ, score: p.score, motivos: p.motivos };
    } else {
      for (const c of celdas) {
        const key = `${c.row},${c.col}`;
        if (usadas.has(key)) continue;
        const p = puntuarCelda(def, contextos.get(key)!, hayZona0, colocados, rangoM, sepMinM, kx, ky);
        if (!mejor || p.score > mejor.score) mejor = { c, score: p.score, motivos: p.motivos };
      }
    }
    if (!mejor) continue;

    const key = `${mejor.c.row},${mejor.c.col}`;
    usadas.add(key);
    const latC = (mejor.c.latMin + mejor.c.latMax) / 2;
    const lngC = (mejor.c.lngMin + mejor.c.lngMax) / 2;
    const coloc: Colocado = { tipo: item.tipo, lat: latC, lng: lngC };
    colocados.push(coloc);

    puntColoc.push({
      el: {
        id:      crypto.randomUUID(),
        itemId:  item.id,
        tipo:    item.tipo,
        nombre:  `${item.tipo === 'personalizado' && item.nombre ? item.nombre : def.label}${total > 1 ? ` ${idx + 1}` : ''}`,
        vertices: cuadrado(latC, lngC, areaUnidad),
        area_m2: Math.round(areaUnidad),
        score:   mejor.score,
        motivos: [...mejor.motivos, dim.detalle],
      },
      cellKey: key, def, item, areaUnidad, coloc, fijo: forzarZona0,
    });
  }

  // ── Optimización global: coordinate-descent. Cada puntual reconsidera su celda
  //    viendo la posición FINAL de los demás (afinidad mutua completa). Se mueve
  //    solo si mejora estrictamente. Pocas pasadas → converge y queda acotado. ──
  for (let iter = 0; iter < 4; iter++) {
    let cambios = 0;
    for (const pc of puntColoc) {
      if (pc.fijo) continue;
      const otros = colocados.filter(x => x !== pc.coloc);
      const ctxActual = contextos.get(pc.cellKey)!;
      const actual = puntuarCelda(pc.def, ctxActual, hayZona0, otros, rangoM, sepMinM, kx, ky);
      let mejor: { c: CeldaShader; score: number; motivos: string[] } = { c: ctxActual.c, score: actual.score, motivos: actual.motivos };
      for (const c of celdas) {
        const key = `${c.row},${c.col}`;
        if (key !== pc.cellKey && usadas.has(key)) continue;   // libre o su propia celda
        const p = puntuarCelda(pc.def, contextos.get(key)!, hayZona0, otros, rangoM, sepMinM, kx, ky);
        if (p.score > mejor.score) mejor = { c, score: p.score, motivos: p.motivos };
      }
      const nuevaKey = `${mejor.c.row},${mejor.c.col}`;
      if (nuevaKey !== pc.cellKey) {
        usadas.delete(pc.cellKey);
        usadas.add(nuevaKey);
        const latC = (mejor.c.latMin + mejor.c.latMax) / 2;
        const lngC = (mejor.c.lngMin + mejor.c.lngMax) / 2;
        pc.cellKey = nuevaKey;
        pc.coloc.lat = latC; pc.coloc.lng = lngC;
        pc.el.vertices = cuadrado(latC, lngC, pc.areaUnidad);
        pc.el.score = mejor.score;
        pc.el.motivos = [...mejor.motivos, dimensionarItem(pc.item).detalle];
        cambios++;
      }
    }
    if (cambios === 0) break;
  }

  const resultado: ElementoMasterPlan[] = puntColoc.map(p => p.el);

  // ── Elementos de área: crecen desde la mejor semilla hacia sus afines ──
  const DIRS = [
    { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
    { dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 },
  ];
  const areales = programa.filter(i => TIPOS_ITEM[i.tipo].esArea)
    .sort((a, b) => (PRIORIDAD[a.tipo] - PRIORIDAD[b.tipo])
                 || (dimensionarItem(b).area_m2 - dimensionarItem(a).area_m2));

  for (const item of areales) {
    const def = TIPOS_ITEM[item.tipo];
    const dim = dimensionarItem(item);
    const celdasNecesarias = Math.max(1, Math.ceil(dim.area_m2 / cellAreaM2));

    let semilla: { c: CeldaShader; score: number; motivos: string[] } | null = null;
    for (const c of celdas) {
      const key = `${c.row},${c.col}`;
      if (usadas.has(key)) continue;
      const p = puntuarCelda(def, contextos.get(key)!, hayZona0, colocados, rangoM, sepMinM, kx, ky);
      if (!semilla || p.score > semilla.score) semilla = { c, score: p.score, motivos: p.motivos };
    }
    if (!semilla) continue;

    const region: CeldaShader[] = [semilla.c];
    const enRegion = new Set<string>([`${semilla.c.row},${semilla.c.col}`]);

    while (region.length < celdasNecesarias) {
      let mejorVecino: { c: CeldaShader; score: number } | null = null;
      for (const rc of region) {
        for (const { dr, dc } of DIRS) {
          const nKey = `${rc.row + dr},${rc.col + dc}`;
          if (enRegion.has(nKey) || usadas.has(nKey)) continue;
          const nc = byPos.get(nKey);
          if (!nc) continue;
          const sc = puntuarCelda(def, contextos.get(nKey)!, hayZona0, colocados, rangoM, sepMinM, kx, ky).score;
          if (!mejorVecino || sc > mejorVecino.score) mejorVecino = { c: nc, score: sc };
        }
      }
      if (!mejorVecino) break;
      region.push(mejorVecino.c);
      enRegion.add(`${mejorVecino.c.row},${mejorVecino.c.col}`);
    }

    enRegion.forEach(k => usadas.add(k));

    let vertices = contornoCeldas(region);
    if (vertices.length < 3) {
      const c = region[0]!;
      vertices = [
        { lat: c.latMin, lng: c.lngMin }, { lat: c.latMin, lng: c.lngMax },
        { lat: c.latMax, lng: c.lngMax }, { lat: c.latMax, lng: c.lngMin },
      ];
    }

    const areaReal = region.length * cellAreaM2;
    const cobertura = areaReal / dim.area_m2;
    const motivos = [...semilla.motivos, dim.detalle];
    if (cobertura < 0.95) {
      motivos.push(`⚠ solo entró el ${Math.round(cobertura * 100)}% de la superficie requerida`);
    }

    // Centroide de la región (para que áreas posteriores vean esta como afín)
    const cx = region.reduce((s, c) => s + (c.lngMin + c.lngMax) / 2, 0) / region.length;
    const cy = region.reduce((s, c) => s + (c.latMin + c.latMax) / 2, 0) / region.length;
    colocados.push({ tipo: item.tipo, lat: cy, lng: cx });

    resultado.push({
      id:      crypto.randomUUID(),
      itemId:  item.id,
      tipo:    item.tipo,
      nombre:  `${def.label} (${(areaReal / 10_000).toFixed(1)} ha)`,
      vertices,
      area_m2: Math.round(areaReal),
      score:   semilla.score,
      motivos,
    });
  }

  return resultado;
}

// ─── Caminos conectores (árbol de conexión mínima) ─────────────────────────────

export interface CaminoMasterPlan { vertices: Array<{ lat: number; lng: number }>; longitud_m: number }

/**
 * Red de caminos que interconecta la zona 0 (casa) con cada elemento del master
 * plan. Árbol de conexión mínima (Prim) por distancia: todo queda conectado con
 * el menor recorrido total, sin ir de cada cosa hasta la casa por separado.
 *
 * Si se pasa un `analisis` de relieve, cada tramo del árbol se rutea por el
 * terreno (crestas, evita pendiente fuerte, cruza vertientes en un punto) en vez
 * de trazarse como segmento recto; sin análisis, cae al tramo recto de siempre.
 */
export function conectarMasterPlan(
  elementos: ElementoMasterPlan[],
  zona0?:    { lat: number; lng: number } | null,
  analisis?: AnalisisRelieve | null,
  limite?:   Array<{ lat: number; lng: number }>,
): CaminoMasterPlan[] {
  const centro = (el: ElementoMasterPlan) => ({
    lat: el.vertices.reduce((s, v) => s + v.lat, 0) / el.vertices.length,
    lng: el.vertices.reduce((s, v) => s + v.lng, 0) / el.vertices.length,
  });
  const nodos: Array<{ lat: number; lng: number }> = [];
  if (zona0) nodos.push(zona0);
  for (const el of elementos) nodos.push(centro(el));
  if (nodos.length < 2) return [];

  const kx = 111_320 * Math.cos(nodos[0]!.lat * Math.PI / 180), ky = 111_320;
  const distM = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) =>
    Math.hypot((a.lng - b.lng) * kx, (a.lat - b.lat) * ky);

  const enArbol = new Set<number>([0]);
  const fuera = nodos.map((_, i) => i).filter(i => i !== 0);
  const caminos: CaminoMasterPlan[] = [];

  while (fuera.length > 0) {
    let mejor: { a: number; b: number; d: number } | null = null;
    for (const a of enArbol) {
      for (const b of fuera) {
        const d = distM(nodos[a]!, nodos[b]!);
        if (!mejor || d < mejor.d) mejor = { a, b, d };
      }
    }
    if (!mejor) break;
    const a = nodos[mejor.a]!, b = nodos[mejor.b]!;
    let tramo: CaminoMasterPlan = { vertices: [a, b], longitud_m: Math.round(mejor.d) };
    if (analisis) {
      const rel = trazarCaminoRelieve(analisis, a, b, { pendMaxPct: 14 }, limite);
      if (rel && rel.vertices.length >= 2) tramo = { vertices: rel.vertices, longitud_m: Math.round(rel.longitud_m) };
    }
    caminos.push(tramo);
    enArbol.add(mejor.b);
    fuera.splice(fuera.indexOf(mejor.b), 1);
  }
  return caminos;
}
