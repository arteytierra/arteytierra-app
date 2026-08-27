/**
 * Cuenca de aporte por clic (B2).
 *
 * Delimita la cuenca aguas-arriba de un punto de salida recorriendo en sentido
 * inverso el `flowDir` (D8) que ya calcula `escorrentias.ts` sobre la grilla
 * densa. Con la cuenca calcula: área, curva número (CN) según grupo hidrológico
 * (A4) y cobertura, escurrimiento por el método SCS para una tormenta de diseño
 * (A3), tiempo de concentración (Kirpich), caudal pico (método racional sobre
 * la ráfaga de diseño desagregada, `tormenta.ts`) y el ancho de vertedero
 * necesario. Valores orientativos de diseño preliminar.
 */
import type { DatosShader, CeldaShader } from './shaders';
import { duracionDeDiseno, laminaDuracion, intensidadDuracion, caudalPicoRacional } from './tormenta';

// ─── Delimitación de la cuenca ────────────────────────────────────────────────

export interface Cuenca {
  celdas:       string[];                              // keys `${row},${col}`
  poligono:     Array<{ lat: number; lng: number }>;   // contorno
  area_m2:      number;
  area_ha:      number;
  area_km2:     number;
  long_flujo_m: number;   // recorrido de flujo más largo hasta la salida
  pendiente_m_m:number;   // pendiente media del recorrido más largo
  elev_salida:  number;
  elev_max:     number;
  outlet:       { lat: number; lng: number };
}

/** Celda más cercana a un punto (para ubicar la salida desde un clic). */
export function celdaEnPunto(datos: DatosShader, lat: number, lng: number): CeldaShader | null {
  let best: CeldaShader | null = null;
  let bestD = Infinity;
  for (const c of datos.celdas) {
    const latC = (c.latMin + c.latMax) / 2;
    const lngC = (c.lngMin + c.lngMax) / 2;
    const d = (latC - lat) ** 2 + (lngC - lng) ** 2;
    if (d < bestD) { bestD = d; best = c; }
  }
  return best;
}

/**
 * Delimita la cuenca aguas-arriba de la celda de salida por BFS inverso del
 * flowDir. Reubica la salida a la celda de mayor acumulación en un radio chico
 * (snap-to-stream), para que un clic cercano al cauce tome toda la cuenca.
 */
export function delimitarCuenca(
  datos:   DatosShader,
  flowDir: Map<string, string | null>,
  acum:    Map<string, number>,
  outletRow: number,
  outletCol: number,
  snap = true,
): Cuenca | null {
  const byPos = new Map<string, CeldaShader>();
  datos.celdas.forEach(c => byPos.set(`${c.row},${c.col}`, c));

  // Snap-to-stream: buscar la celda de mayor acumulación en ±2 celdas.
  let orow = outletRow, ocol = outletCol;
  if (snap) {
    let bestA = acum.get(`${orow},${ocol}`) ?? 0;
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const a = acum.get(`${outletRow + dr},${outletCol + dc}`) ?? -1;
        if (a > bestA) { bestA = a; orow = outletRow + dr; ocol = outletCol + dc; }
      }
    }
  }
  const outletKey = `${orow},${ocol}`;
  if (!byPos.has(outletKey)) return null;

  // Adyacencia inversa: para cada celda, quiénes drenan hacia ella.
  const reverse = new Map<string, string[]>();
  flowDir.forEach((to, from) => {
    if (to) { (reverse.get(to) ?? reverse.set(to, []).get(to)!).push(from); }
  });

  // BFS aguas-arriba desde la salida.
  const enCuenca = new Set<string>([outletKey]);
  const cola = [outletKey];
  while (cola.length) {
    const cur = cola.pop()!;
    const ups = reverse.get(cur);
    if (!ups) continue;
    for (const u of ups) if (!enCuenca.has(u)) { enCuenca.add(u); cola.push(u); }
  }

  const c0 = byPos.get(outletKey)!;
  const dLat_m = (c0.latMax - c0.latMin) * 111320;
  const lat0   = (c0.latMin + c0.latMax) / 2;
  const dLng_m = (c0.lngMax - c0.lngMin) * 111320 * Math.cos(lat0 * Math.PI / 180);
  const areaCelda = dLat_m * dLng_m;

  // Recorrido de flujo más largo hasta la salida + cota máxima.
  const largo = longitudFlujoMax(enCuenca, byPos, flowDir, dLat_m, dLng_m);
  let elevMax = c0.elevation;
  enCuenca.forEach(k => { const c = byPos.get(k); if (c && c.elevation > elevMax) elevMax = c.elevation; });

  const area_m2 = enCuenca.size * areaCelda;
  const poligono = contornoCeldas(enCuenca, byPos);
  const L = Math.max(largo.long_m, Math.sqrt(area_m2)); // evita L=0 en cuencas de 1 celda
  const desnivel = Math.max(0.1, elevMax - c0.elevation);

  return {
    celdas:        Array.from(enCuenca),
    poligono,
    area_m2,
    area_ha:       Math.round(area_m2 / 1e4 * 100) / 100,
    area_km2:      area_m2 / 1e6,
    long_flujo_m:  Math.round(L),
    pendiente_m_m: L > 0 ? desnivel / L : 0.01,
    elev_salida:   Math.round(c0.elevation),
    elev_max:      Math.round(elevMax),
    outlet:        { lat: lat0, lng: (c0.lngMin + c0.lngMax) / 2 },
  };
}

// Longitud del camino de flujo más largo dentro de la cuenca hasta la salida.
function longitudFlujoMax(
  enCuenca: Set<string>,
  byPos:    Map<string, CeldaShader>,
  flowDir:  Map<string, string | null>,
  dLat_m:   number,
  dLng_m:   number,
): { long_m: number } {
  const dDiag = Math.sqrt(dLat_m * dLat_m + dLng_m * dLng_m);
  const memo = new Map<string, number>();

  // distancia entre dos celdas adyacentes según su desplazamiento row/col
  const paso = (a: string, b: string): number => {
    const [ar, ac] = a.split(',').map(Number) as [number, number];
    const [br, bc] = b.split(',').map(Number) as [number, number];
    const dr = Math.abs(ar - br), dc = Math.abs(ac - bc);
    if (dr && dc) return dDiag;
    return dr ? dLat_m : dLng_m;
  };

  // longitud desde una celda hasta la salida siguiendo flowDir (dentro de la cuenca)
  const distHasta = (start: string): number => {
    const cadena: string[] = [];
    let cur: string | null = start;
    let acc = 0;
    while (cur && enCuenca.has(cur)) {
      if (memo.has(cur)) { acc += memo.get(cur)!; break; }
      cadena.push(cur);
      const to: string | null = flowDir.get(cur) ?? null;
      if (!to || !enCuenca.has(to)) break;
      acc += paso(cur, to);
      cur = to;
    }
    // memoiza cada celda de la cadena con su distancia restante
    let restante = acc;
    for (let i = 0; i < cadena.length; i++) {
      memo.set(cadena[i]!, restante);
      if (i + 1 < cadena.length) restante -= paso(cadena[i]!, cadena[i + 1]!);
    }
    return acc;
  };

  let maxL = 0;
  enCuenca.forEach(k => { const d = distHasta(k); if (d > maxL) maxL = d; });
  return { long_m: maxL };
}

// Contorno de un conjunto de celdas raster: recolecta aristas de borde y las cose.
function contornoCeldas(
  enCuenca: Set<string>,
  byPos:    Map<string, CeldaShader>,
): Array<{ lat: number; lng: number }> {
  const r = (n: number) => Math.round(n * 1e7) / 1e7;
  const pk = (lat: number, lng: number) => `${r(lat)},${r(lng)}`;
  const edges = new Map<string, [[number, number], [number, number]]>();

  const toggle = (a: [number, number], b: [number, number]) => {
    const ka = pk(a[0], a[1]), kb = pk(b[0], b[1]);
    const key = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
    if (edges.has(key)) edges.delete(key); else edges.set(key, [a, b]);
  };

  for (const k of enCuenca) {
    const c = byPos.get(k);
    if (!c) continue;
    const TL: [number, number] = [c.latMax, c.lngMin];
    const TR: [number, number] = [c.latMax, c.lngMax];
    const BL: [number, number] = [c.latMin, c.lngMin];
    const BR: [number, number] = [c.latMin, c.lngMax];
    toggle(TL, TR); toggle(BL, BR); toggle(TL, BL); toggle(TR, BR);
  }

  if (edges.size === 0) return [];

  // Adyacencia punto → puntos conectados
  const adj = new Map<string, Array<[number, number]>>();
  const coord = new Map<string, [number, number]>();
  edges.forEach(([a, b]) => {
    const ka = pk(a[0], a[1]), kb = pk(b[0], b[1]);
    coord.set(ka, a); coord.set(kb, b);
    (adj.get(ka) ?? adj.set(ka, []).get(ka)!).push(b);
    (adj.get(kb) ?? adj.set(kb, []).get(kb)!).push(a);
  });

  // Camina el contorno desde un punto cualquiera
  const start = edges.values().next().value![0];
  const startK = pk(start[0], start[1]);
  const ring: Array<{ lat: number; lng: number }> = [];
  const visit = new Set<string>();
  let cur = start, curK = startK, prevK = '';

  for (let guard = 0; guard < edges.size * 2 + 4; guard++) {
    ring.push({ lat: cur[0], lng: cur[1] });
    visit.add(curK);
    const vecinos = adj.get(curK) ?? [];
    let next: [number, number] | null = null;
    for (const v of vecinos) {
      const vk = pk(v[0], v[1]);
      if (vk === prevK) continue;
      if (vk === startK && ring.length > 2) { next = v; break; }
      if (!visit.has(vk)) { next = v; break; }
    }
    if (!next) break;
    const nextK = pk(next[0], next[1]);
    if (nextK === startK) break;
    prevK = curK; cur = next; curK = nextK;
  }

  return ring;
}

// ─── Curva Número (SCS) ───────────────────────────────────────────────────────

export type GrupoHidro = 'A' | 'B' | 'C' | 'D';

export interface Cobertura { id: string; nombre: string; cn: Record<GrupoHidro, number>; }

// CN para condición de humedad antecedente media (AMC II).
export const COBERTURAS: Cobertura[] = [
  { id: 'pastura_buena',   nombre: 'Pastura / pastizal (buena)',  cn: { A: 39, B: 61, C: 74, D: 80 } },
  { id: 'pastura_regular', nombre: 'Pastura (regular)',           cn: { A: 49, B: 69, C: 79, D: 84 } },
  { id: 'pastura_pobre',   nombre: 'Pastura sobrepastoreada',     cn: { A: 68, B: 79, C: 86, D: 89 } },
  { id: 'monte_bueno',     nombre: 'Monte / bosque (bueno)',      cn: { A: 30, B: 55, C: 70, D: 77 } },
  { id: 'monte_regular',   nombre: 'Monte / bosque (regular)',    cn: { A: 36, B: 60, C: 73, D: 79 } },
  { id: 'matorral',        nombre: 'Matorral / arbustal',         cn: { A: 35, B: 56, C: 70, D: 77 } },
  { id: 'cultivo_bueno',   nombre: 'Cultivo en línea (bueno)',    cn: { A: 67, B: 78, C: 85, D: 89 } },
  { id: 'cultivo_pobre',   nombre: 'Cultivo (pobre)',             cn: { A: 72, B: 81, C: 88, D: 91 } },
  { id: 'barbecho',        nombre: 'Barbecho / suelo desnudo',    cn: { A: 77, B: 86, C: 91, D: 94 } },
  { id: 'urbano',          nombre: 'Superficie dura / camino',    cn: { A: 98, B: 98, C: 98, D: 98 } },
];

// ─── Coeficiente de escorrentía ANUAL (para rendimiento del embalse) ──────────
// Distinto del SCS-CN (que es por tormenta): acá una fracción media anual de la
// lluvia que llega a la represa. Base por grupo hidrológico modulada por la
// cobertura, unificando el criterio suelo+cobertura del análisis de cuenca.
const COEF_BASE_GRUPO: Record<GrupoHidro, number> = { A: 0.08, B: 0.13, C: 0.20, D: 0.28 };
const COEF_FACTOR_COBERTURA: Record<string, number> = {
  monte_bueno: 0.6, monte_regular: 0.75, matorral: 0.8,
  pastura_buena: 0.85, pastura_regular: 1.0, pastura_pobre: 1.2,
  cultivo_bueno: 1.15, cultivo_pobre: 1.3, barbecho: 1.5, urbano: 2.2,
};

/** Coef. de escorrentía anual orientativo (0–1) según grupo hidrológico y cobertura. */
export function coefEscorrentiaAnual(grupo: GrupoHidro, coberturaId: string): number {
  const base = COEF_BASE_GRUPO[grupo] ?? 0.15;
  const f = COEF_FACTOR_COBERTURA[coberturaId] ?? 1;
  return Math.round(Math.min(0.6, Math.max(0.03, base * f)) * 100) / 100;
}

// ─── Escurrimiento y caudal pico ──────────────────────────────────────────────

export interface ResultadoCuenca {
  cn:               number;
  precip_mm:        number;   // lámina del evento de diseño (mm en 24 h)
  escurrimiento_mm: number;   // lo que escurre de ese evento (mm)
  volumen_m3:       number;   // volumen del evento completo
  coef_evento:      number;   // Q/P del evento (0–1)
  tc_min:           number;   // tiempo de concentración
  duracion_min:     number;   // duración de la ráfaga que produce el pico
  lamina_rafaga_mm: number;   // lluvia de esa ráfaga (desagregada de la de 24 h)
  intensidad_mm_h:  number;   // intensidad media de la ráfaga
  caudal_pico_m3s:  number;
  vertedero_m:      number;   // ancho de vertedero recomendado
  head_vertedero_m: number;
}

/** Escurrimiento directo por el método SCS-CN (mm). */
export function escurrimientoSCS(precip_mm: number, cn: number): number {
  if (cn <= 0 || cn >= 100) return precip_mm;
  const S = 25400 / cn - 254;      // retención potencial (mm)
  const Ia = 0.2 * S;              // abstracción inicial
  if (precip_mm <= Ia) return 0;
  return (precip_mm - Ia) ** 2 / (precip_mm - Ia + S);
}

/** Tiempo de concentración de Kirpich (min). L en m, S en m/m. */
export function tcKirpich(L_m: number, S_m_m: number): number {
  if (L_m <= 0 || S_m_m <= 0) return 0;
  return 0.0195 * Math.pow(L_m, 0.77) * Math.pow(S_m_m, -0.385);
}

/**
 * Análisis hidrológico de la cuenca para una tormenta de diseño.
 *
 * VOLUMEN — evento completo de 24 h: escurrimiento SCS-CN × área.
 *
 * CAUDAL PICO — método racional sobre la ráfaga de diseño (H5):
 *   qp = C · i · A / 3.6,  con la duración = tc y la intensidad desagregada
 *   de la lámina de 24 h (`lib/tormenta.ts`).
 *
 * Antes el pico salía del hidrograma unitario triangular SCS
 * (qp = 0.208·A·Q/Tp, Tp = 0.667·tc) pero alimentado con el escurrimiento del
 * evento ENTERO. Esa fórmula pide el escurrimiento de la duración unitaria
 * —unos 0.133·tc, o sea un par de minutos—, así que meterle el acumulado del
 * día equivalía a hacer llover todo el día en dos minutos: el pico salía un
 * orden de magnitud arriba y el vertedero, absurdo (160 m de ancho para una
 * cuenca de 50 ha). El método racional necesita la intensidad de la ráfaga,
 * que es justamente lo que H5 sabe calcular.
 *
 * Vertedero por vertedero rectangular de cresta ancha: Q = C·L·H^1.5.
 */
export function analizarCuenca(
  cuenca: Cuenca,
  cn: number,
  precip_mm: number,
  headVertedero_m = 0.3,
  coefVertedero = 1.7,
): ResultadoCuenca {
  const Q_mm = escurrimientoSCS(precip_mm, cn);
  const volumen = (Q_mm / 1000) * cuenca.area_m2;
  const coefEvento = precip_mm > 0 ? Q_mm / precip_mm : 0;

  const tc_min = tcKirpich(cuenca.long_flujo_m, cuenca.pendiente_m_m);
  const dur_min = duracionDeDiseno(tc_min);
  const lamina = laminaDuracion(precip_mm, dur_min);
  const i_mm_h = intensidadDuracion(precip_mm, dur_min);
  const qp = caudalPicoRacional(coefEvento, i_mm_h, cuenca.area_km2);

  const H = Math.max(0.05, headVertedero_m);
  const L_vert = qp > 0 ? qp / (coefVertedero * Math.pow(H, 1.5)) : 0;

  return {
    cn,
    precip_mm,
    escurrimiento_mm: Math.round(Q_mm * 10) / 10,
    volumen_m3:       Math.round(volumen),
    coef_evento:      Math.round(coefEvento * 100) / 100,
    tc_min:           Math.round(tc_min * 10) / 10,
    duracion_min:     dur_min,
    lamina_rafaga_mm: Math.round(lamina * 10) / 10,
    intensidad_mm_h:  Math.round(i_mm_h),
    caudal_pico_m3s:  Math.round(qp * 100) / 100,
    vertedero_m:      Math.round(L_vert * 100) / 100,
    head_vertedero_m: H,
  };
}
