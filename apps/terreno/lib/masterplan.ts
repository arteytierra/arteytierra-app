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

// ─── Programa ─────────────────────────────────────────────────────────────────

export type TipoItemPrograma =
  | 'casa' | 'galpon' | 'cabana' | 'corral' | 'pastoreo'
  | 'huerta' | 'cultivo' | 'frutales' | 'reservorio' | 'personalizado';

export type EspecieGanado = 'bovino' | 'ovino' | 'caprino' | 'equino';

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

export const TIPOS_ITEM: Record<TipoItemPrograma, {
  label:           string;
  emoji:           string;
  color:           string;
  categoriaZona:   CategoriaZona;
  areaUnitariaM2?: number;   // construcciones: huella + entorno operativo
  esArea:          boolean;  // true = se asigna superficie contigua
}> = {
  casa:          { label: 'Casa / vivienda',     emoji: '🏠', color: '#8B7355', categoriaZona: 'vivienda',        areaUnitariaM2: 800,  esArea: false },
  galpon:        { label: 'Galpón',              emoji: '🏚️', color: '#90A4AE', categoriaZona: 'infraestructura', areaUnitariaM2: 600,  esArea: false },
  cabana:        { label: 'Cabaña de alquiler',  emoji: '🛖', color: '#E67E22', categoriaZona: 'vivienda',        areaUnitariaM2: 500,  esArea: false },
  corral:        { label: 'Corrales / manga',    emoji: '🐄', color: '#A1887F', categoriaZona: 'pasturas',        areaUnitariaM2: 1500, esArea: false },
  huerta:        { label: 'Huerta intensiva',    emoji: '🥬', color: '#5A8F3C', categoriaZona: 'huerta',          areaUnitariaM2: 1000, esArea: false },
  reservorio:    { label: 'Acopio de agua',      emoji: '💧', color: '#1E88E5', categoriaZona: 'agua',                                  esArea: false },
  personalizado: { label: 'Otro elemento',       emoji: '📦', color: '#9C27B0', categoriaZona: 'personalizado',   areaUnitariaM2: 500,  esArea: false },
  pastoreo:      { label: 'Pastoreo / ganadería',emoji: '🌾', color: '#9DC183', categoriaZona: 'pasturas',                              esArea: true },
  cultivo:       { label: 'Cultivo extensivo',   emoji: '🌽', color: '#F0C040', categoriaZona: 'cultivo',                               esArea: true },
  frutales:      { label: 'Monte frutal',        emoji: '🍎', color: '#E67E22', categoriaZona: 'frutales',                              esArea: true },
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
  acumRel:  number;
  elevRel:  number;
  distEntradaRel: number;   // 0 = junto a la entrada, 1 = lo más lejos
  distZona0Rel:   number;   // 0 = sobre zona 0, 1 = lo más lejos (si hay zona 0)
  orientacionNorte: number; // >0 ladera norte (HemSur)
}

/**
 * Zonas de permacultura: distancia relativa PREFERIDA a la zona 0 (casa/edificio
 * principal) para cada uso. 0 = pegado a la casa, 1 = lo más lejos del predio.
 * Lo de uso diario cerca; lo extensivo, lejos. Guía la coherencia del conjunto.
 */
const BANDA_ZONA0: Record<TipoItemPrograma, number> = {
  casa:          0.0,
  cabana:        0.15,
  huerta:        0.12,
  galpon:        0.2,
  reservorio:    0.3,
  corral:        0.38,
  personalizado: 0.35,
  frutales:      0.5,
  cultivo:       0.72,
  pastoreo:      0.78,
};

function scorePerfil(tipo: TipoItemPrograma, ctx: ContextoCelda, hayZona0 = false): { score: number; motivos: string[] } {
  const { c, acumRel, elevRel, distEntradaRel, distZona0Rel, orientacionNorte } = ctx;
  let s = 0;
  const motivos: string[] = [];

  // Anclaje a zona 0 (permacultura): premia las celdas a la distancia esperada de
  // la casa según el uso. Es el término que da coherencia al conjunto.
  if (hayZona0) {
    const target = BANDA_ZONA0[tipo];
    const match  = 1 - Math.min(1, Math.abs(distZona0Rel - target) / 0.5);
    s += 34 * match;
    if (match > 0.72)      motivos.push('a la distancia adecuada de la casa');
    else if (match < 0.35) motivos.push('lejos de su zona ideal respecto de la casa');
  }

  const pendienteSuave = () => {
    if      (c.pendiente_pct < 5)  { s += 30; motivos.push('terreno casi plano'); }
    else if (c.pendiente_pct < 10) { s += 20; motivos.push('pendiente suave'); }
    else if (c.pendiente_pct < 18) { s += 8; }
    else                            { s -= 15; motivos.push('pendiente alta'); }
  };
  const noInundable = (peso = 20) => {
    if      (acumRel < 0.07) { s += peso; motivos.push('fuera de drenajes'); }
    else if (acumRel < 0.25) { s += peso * 0.4; }
    else                      { s -= peso; motivos.push('zona de escorrentía'); }
  };

  switch (tipo) {
    case 'casa':
    case 'cabana':
      pendienteSuave();
      noInundable(20);
      if (orientacionNorte >  2) { s += 22; motivos.push('ladera con orientación norte'); }
      else if (orientacionNorte > 0) { s += 12; }
      else if (orientacionNorte < -2) { s -= 8; motivos.push('orientación sur'); }
      if (elevRel >= 0.35 && elevRel <= 0.8) { s += 18; motivos.push('posición elevada protegida'); }
      else if (elevRel < 0.2) { s -= 5; motivos.push('posición baja (humedad)'); }
      if (tipo === 'cabana' && distEntradaRel > 0.5) { s += 8; motivos.push('privacidad respecto del acceso'); }
      break;

    case 'galpon':
    case 'personalizado':
      pendienteSuave();
      noInundable(15);
      if (distEntradaRel < 0.25) { s += 25; motivos.push('cerca del acceso'); }
      else if (distEntradaRel < 0.5) { s += 12; }
      break;

    case 'corral':
      pendienteSuave();
      noInundable(18);
      if (distEntradaRel < 0.4) { s += 15; motivos.push('acceso para hacienda y camiones'); }
      if (elevRel >= 0.3 && elevRel <= 0.7) { s += 8; }
      break;

    case 'huerta':
      pendienteSuave();
      noInundable(12);
      if (orientacionNorte > 0) { s += 15; motivos.push('buena exposición solar'); }
      if (acumRel > 0.04 && acumRel < 0.2) { s += 10; motivos.push('agua cercana sin riesgo'); }
      break;

    case 'reservorio':
      if      (acumRel > 0.45) { s += 45; motivos.push('alta captación de flujos'); }
      else if (acumRel > 0.25) { s += 28; motivos.push('captación media'); }
      else if (acumRel > 0.10) { s += 12; }
      else                      { s -= 10; motivos.push('poca acumulación'); }
      if (c.pendiente_pct < 8) { s += 25; motivos.push('plano para excavar'); }
      else if (c.pendiente_pct < 15) { s += 12; }
      else { s -= 15; }
      if (elevRel < 0.35) { s += 18; motivos.push('punto bajo natural'); }
      else if (elevRel < 0.55) { s += 8; }
      break;

    case 'pastoreo':
      if (c.pendiente_pct < 12) s += 25; else if (c.pendiente_pct < 20) s += 15; else s += 5;
      noInundable(8);
      motivos.push('apto pastizal');
      break;

    case 'cultivo':
      if      (c.pendiente_pct < 3)  { s += 35; motivos.push('plano, apto maquinaria'); }
      else if (c.pendiente_pct < 6)  { s += 22; motivos.push('pendiente leve'); }
      else if (c.pendiente_pct < 10) { s += 5; }
      else                            { s -= 20; motivos.push('pendiente excesiva para cultivo'); }
      noInundable(12);
      break;

    case 'frutales':
      if (c.pendiente_pct < 12) s += 20; else s += 5;
      if (orientacionNorte > 0) { s += 18; motivos.push('ladera norte (heladas escurren)'); }
      noInundable(10);
      if (elevRel >= 0.3 && elevRel <= 0.75) { s += 10; motivos.push('a media ladera, sin heladas de fondo'); }
      break;
  }

  return { score: Math.max(0, Math.min(100, Math.round(s + 30))), motivos };
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

  // Área de celda en m²
  const c0 = celdas[0]!;
  const cellLatM = (c0.latMax - c0.latMin) * 111_320;
  const cellLngM = (c0.lngMax - c0.lngMin) * 111_320 * Math.cos(((c0.latMin + c0.latMax) / 2) * Math.PI / 180);
  const cellAreaM2 = Math.max(cellLatM * cellLngM, 1);

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
    return { c, acumRel, elevRel, distEntradaRel, distZona0Rel, orientacionNorte };
  }

  const contextos = new Map<string, ContextoCelda>();
  celdas.forEach(c => contextos.set(`${c.row},${c.col}`, contexto(c)));

  const usadas = new Set<string>();
  const resultado: ElementoMasterPlan[] = [];

  // Orden de asignación: puntuales primero (lo crítico), áreas grandes después
  const puntuales = programa.filter(i => !TIPOS_ITEM[i.tipo].esArea);
  const areales   = programa.filter(i =>  TIPOS_ITEM[i.tipo].esArea)
    .sort((a, b) => dimensionarItem(b).area_m2 - dimensionarItem(a).area_m2);

  // ── Elementos puntuales: mejor celda libre, polígono cuadrado del área requerida ──
  for (const item of puntuales) {
    const def = TIPOS_ITEM[item.tipo];
    const dim = dimensionarItem(item);
    const n = def.esArea ? 1 : Math.max(1, item.cantidad);
    const areaUnidad = dim.area_m2 / n;

    for (let k = 0; k < n; k++) {
      // La primera casa se planta EN la zona 0 marcada por el usuario.
      const forzarZona0 = hayZona0 && (item.tipo === 'casa') && k === 0
        && !usadas.has(`${anclaZ.row},${anclaZ.col}`);
      const candidatas = forzarZona0
        ? [{ c: anclaZ, ...scorePerfil(item.tipo, contextos.get(`${anclaZ.row},${anclaZ.col}`)!, hayZona0) }]
        : celdas
            .filter(c => !usadas.has(`${c.row},${c.col}`))
            .map(c => ({ c, ...scorePerfil(item.tipo, contextos.get(`${c.row},${c.col}`)!, hayZona0) }))
            .sort((a, b) => b.score - a.score);
      const mejor = candidatas[0];
      if (!mejor) break;

      const key = `${mejor.c.row},${mejor.c.col}`;
      usadas.add(key);
      // Bloquear vecinas inmediatas para no apilar construcciones
      usadas.add(`${mejor.c.row + 1},${mejor.c.col}`);
      usadas.add(`${mejor.c.row - 1},${mejor.c.col}`);

      const latC = (mejor.c.latMin + mejor.c.latMax) / 2;
      const lngC = (mejor.c.lngMin + mejor.c.lngMax) / 2;
      const lado = Math.sqrt(areaUnidad);
      const dLat = (lado / 2) / 111_320;
      const dLng = (lado / 2) / (111_320 * Math.cos(latC * Math.PI / 180));

      resultado.push({
        id:      crypto.randomUUID(),
        itemId:  item.id,
        tipo:    item.tipo,
        nombre:  `${item.tipo === 'personalizado' && item.nombre ? item.nombre : def.label}${n > 1 ? ` ${k + 1}` : ''}`,
        vertices: [
          { lat: latC - dLat, lng: lngC - dLng },
          { lat: latC - dLat, lng: lngC + dLng },
          { lat: latC + dLat, lng: lngC + dLng },
          { lat: latC + dLat, lng: lngC - dLng },
        ],
        area_m2: Math.round(areaUnidad),
        score:   mejor.score,
        motivos: [...mejor.motivos, dim.detalle],
      });
    }
  }

  // ── Elementos de área: crecimiento de región greedy desde la mejor semilla ──
  const DIRS = [
    { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
    { dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 },
  ];

  for (const item of areales) {
    const def = TIPOS_ITEM[item.tipo];
    const dim = dimensionarItem(item);
    const celdasNecesarias = Math.max(1, Math.ceil(dim.area_m2 / cellAreaM2));

    const candidatas = celdas
      .filter(c => !usadas.has(`${c.row},${c.col}`))
      .map(c => ({ c, ...scorePerfil(item.tipo, contextos.get(`${c.row},${c.col}`)!, hayZona0) }))
      .sort((a, b) => b.score - a.score);
    const semilla = candidatas[0];
    if (!semilla) continue;

    const region: CeldaShader[] = [semilla.c];
    const enRegion = new Set<string>([`${semilla.c.row},${semilla.c.col}`]);

    while (region.length < celdasNecesarias) {
      // Mejor vecino libre de cualquier celda de la región
      let mejorVecino: { c: CeldaShader; score: number } | null = null;
      for (const rc of region) {
        for (const { dr, dc } of DIRS) {
          const nKey = `${rc.row + dr},${rc.col + dc}`;
          if (enRegion.has(nKey) || usadas.has(nKey)) continue;
          const nc = byPos.get(nKey);
          if (!nc) continue;
          const sc = scorePerfil(item.tipo, contextos.get(nKey)!, hayZona0).score;
          if (!mejorVecino || sc > mejorVecino.score) mejorVecino = { c: nc, score: sc };
        }
      }
      if (!mejorVecino) break;
      region.push(mejorVecino.c);
      enRegion.add(`${mejorVecino.c.row},${mejorVecino.c.col}`);
    }

    enRegion.forEach(k => usadas.add(k));

    // Contorno rectilíneo real de las celdas (no hull convexo: así no invade las
    // celdas de otra zona y las zonas del master plan no se solapan).
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
 */
export function conectarMasterPlan(
  elementos: ElementoMasterPlan[],
  zona0?:    { lat: number; lng: number } | null,
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
    caminos.push({ vertices: [nodos[mejor.a]!, nodos[mejor.b]!], longitud_m: Math.round(mejor.d) });
    enArbol.add(mejor.b);
    fuera.splice(fuera.indexOf(mejor.b), 1);
  }
  return caminos;
}
