/**
 * Simulación de escorrentías superficiales por algoritmo D8 (eight-direction flow).
 * Calcula dirección de flujo, acumulación y traza cadenas de corrientes.
 * Requiere DatosShader con CeldaShader.row y CeldaShader.col.
 */
import type { DatosShader, CeldaShader } from './shaders';

export interface CadenaFlujo {
  puntos:      Array<{ lat: number; lng: number }>;
  acum_max:    number;   // máxima acumulación en la cadena
}

export interface DatosEscorrentia {
  cadenas:      CadenaFlujo[];
  acum_max:     number;
  acumulacion:  Map<string, number>;   // key = `${row},${col}`
  flowDir:      Map<string, string | null>;
}

const DIRS_8 = [
  { dr: -1, dc: -1 }, { dr: -1, dc:  0 }, { dr: -1, dc:  1 },
  { dr:  0, dc: -1 },                       { dr:  0, dc:  1 },
  { dr:  1, dc: -1 }, { dr:  1, dc:  0 }, { dr:  1, dc:  1 },
] as const;

export function calcularEscorrentias(datos: DatosShader): DatosEscorrentia {
  const { celdas } = datos;

  const byPos = new Map<string, CeldaShader>();
  celdas.forEach(c => byPos.set(`${c.row},${c.col}`, c));

  // Dimensiones de celda en metros para calcular pendiente real
  const c0 = celdas[0]!;
  const dLat_m = (c0.latMax - c0.latMin) * 111320;
  const lat0   = (c0.latMin + c0.latMax) / 2;
  const dLng_m = (c0.lngMax - c0.lngMin) * 111320 * Math.cos(lat0 * Math.PI / 180);
  const dDiag  = Math.sqrt(dLat_m * dLat_m + dLng_m * dLng_m);
  const distPorDir: number[] = [dDiag, dLat_m, dDiag, dLng_m, dLng_m, dDiag, dLat_m, dDiag];

  // ── D8: dirección de flujo ────────────────────────────────────────────────
  const flowDir = new Map<string, string | null>();

  for (const c of celdas) {
    const key = `${c.row},${c.col}`;
    let maxSlope = 0;
    let bestKey: string | null = null;

    DIRS_8.forEach(({ dr, dc }, i) => {
      const nKey = `${c.row + dr},${c.col + dc}`;
      const n = byPos.get(nKey);
      if (!n) return;
      const slope = (c.elevation - n.elevation) / distPorDir[i]!;
      if (slope > maxSlope) { maxSlope = slope; bestKey = nKey; }
    });

    flowDir.set(key, bestKey);
  }

  // ── Acumulación de flujo (orden topológico) ───────────────────────────────
  const inflow = new Map<string, string[]>();
  celdas.forEach(c => inflow.set(`${c.row},${c.col}`, []));
  flowDir.forEach((to, from) => {
    if (to && inflow.has(to)) inflow.get(to)!.push(from);
  });

  const inDeg = new Map<string, number>();
  celdas.forEach(c => inDeg.set(`${c.row},${c.col}`, inflow.get(`${c.row},${c.col}`)!.length));

  const queue: string[] = [];
  inDeg.forEach((d, k) => { if (d === 0) queue.push(k); });

  const orden: string[] = [];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    orden.push(cur);
    const to = flowDir.get(cur);
    if (to && inDeg.has(to)) {
      const nd = inDeg.get(to)! - 1;
      inDeg.set(to, nd);
      if (nd === 0) queue.push(to);
    }
  }

  const acumulacion = new Map<string, number>();
  celdas.forEach(c => acumulacion.set(`${c.row},${c.col}`, 1));
  for (const key of orden) {
    const to = flowDir.get(key);
    if (to && acumulacion.has(to))
      acumulacion.set(to, acumulacion.get(to)! + acumulacion.get(key)!);
  }

  const acum_max = Math.max(...Array.from(acumulacion.values()), 1);

  // ── Trazar cadenas de corrientes ──────────────────────────────────────────
  // Threshold: celdas que concentran >= 8% de la acumulación máxima
  const THRESHOLD = Math.max(3, acum_max * 0.08);

  const enStream = new Set<string>(
    Array.from(acumulacion.entries())
      .filter(([, a]) => a >= THRESHOLD)
      .map(([k]) => k)
  );

  // Fuentes: celdas en stream sin flujo entrante de otra celda en stream
  const tieneInflujoStream = new Set<string>();
  for (const key of enStream) {
    const to = flowDir.get(key);
    if (to && enStream.has(to)) tieneInflujoStream.add(to);
  }
  const fuentes = Array.from(enStream).filter(k => !tieneInflujoStream.has(k));

  const cadenas: CadenaFlujo[] = [];

  for (const fuenteKey of fuentes) {
    const puntos: Array<{ lat: number; lng: number }> = [];
    let cur: string = fuenteKey;
    let acumMax = 0;
    const visitados = new Set<string>();

    while (enStream.has(cur) && !visitados.has(cur)) {
      visitados.add(cur);
      const c = byPos.get(cur);
      if (!c) break;
      puntos.push({ lat: (c.latMin + c.latMax) / 2, lng: (c.lngMin + c.lngMax) / 2 });
      acumMax = Math.max(acumMax, acumulacion.get(cur) ?? 0);
      const to = flowDir.get(cur);
      if (!to || !enStream.has(to)) break;
      cur = to;
    }

    if (puntos.length >= 2) cadenas.push({ puntos, acum_max: acumMax });
  }

  return { cadenas, acum_max, acumulacion, flowDir };
}
