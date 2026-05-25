/**
 * Sugerencias de ubicación basadas en principios de permacultura.
 * Analiza cada celda de la grilla de elevación y genera candidatos para:
 *   - Vivienda: orientación norte (HemSur), pendiente constructiva, lejos de escorrentías
 *   - Reservorio: alta acumulación hídrica, pendiente retenedora, posición baja
 *   - Camino de acceso: divisoria de aguas (ridgeline), bajo costo de pendiente
 */
import type { DatosShader, CeldaShader } from './shaders';
import type { DatosEscorrentia } from './escorrentias';

export interface CandidatoUbicacion {
  lat:     number;
  lng:     number;
  score:   number;   // 0-100
  label:   string;
  motivos: string[]; // razones del scoring
}

export interface ResultadoSugerencias {
  viviendas:   CandidatoUbicacion[];   // top 3 candidatos
  reservorios: CandidatoUbicacion[];   // top 3 candidatos
  camino:      Array<{ lat: number; lng: number }>;
  caminoInfo:  { longitud_m: number; pendiente_media_pct: number };
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function scoreVivienda(
  c: CeldaShader,
  byPos: Map<string, CeldaShader>,
  acum: number, acum_max: number,
  elev_min: number, elev_max: number,
): { score: number; motivos: string[] } {
  let s = 0;
  const motivos: string[] = [];
  const elevRel   = elev_max > elev_min ? (c.elevation - elev_min) / (elev_max - elev_min) : 0.5;
  const acumRel   = acum / Math.max(acum_max, 1);

  // Pendiente constructiva (max importancia)
  if      (c.pendiente_pct < 5)  { s += 35; motivos.push('terreno casi plano'); }
  else if (c.pendiente_pct < 10) { s += 25; motivos.push('pendiente suave (<10%)'); }
  else if (c.pendiente_pct < 18) { s += 10; motivos.push('pendiente moderada'); }
  else                            { s -= 15; motivos.push('pendiente alta (>18%)'); }

  // Orientación norte (HemSur): el sur debe estar más alto que el norte
  const sur   = byPos.get(`${c.row - 1},${c.col}`);   // row menor = más al sur
  const norte = byPos.get(`${c.row + 1},${c.col}`);
  if (sur && norte) {
    const dif = sur.elevation - norte.elevation;
    if      (dif >  2) { s += 22; motivos.push('ladera con orientación norte'); }
    else if (dif >  0) { s += 12; motivos.push('orientación levemente norte'); }
    else if (dif < -2) { s -= 10; motivos.push('orientación sur (menos sol)'); }
    else               { s +=  8; }
  } else {
    s += 8;  // borde del polígono — beneficio moderado
  }

  // Lejos de escorrentías (no inundable)
  if      (acumRel < 0.07) { s += 20; motivos.push('lejos de canales de drenaje'); }
  else if (acumRel < 0.25) { s += 8;  }
  else                      { s -= 20; motivos.push('en zona de escorrentía'); }

  // Posición media-alta en el relieve (no fondo de valle, no cima expuesta)
  if      (elevRel >= 0.35 && elevRel <= 0.80) { s += 20; motivos.push('posición elevada protegida'); }
  else if (elevRel > 0.80)                      { s +=  5; motivos.push('posición alta (vientos)'); }
  else                                           { s -=  5; motivos.push('posición baja (humedad)'); }

  // Bonus: vecindad con agua pero no en canal
  if (acumRel > 0.04 && acumRel < 0.15) { s += 5; motivos.push('acceso cercano a agua'); }

  return { score: Math.max(0, Math.min(100, s)), motivos };
}

function scoreReservorio(
  c: CeldaShader,
  byPos: Map<string, CeldaShader>,
  acum: number, acum_max: number,
  elev_min: number, elev_max: number,
): { score: number; motivos: string[] } {
  let s = 0;
  const motivos: string[] = [];
  const elevRel = elev_max > elev_min ? (c.elevation - elev_min) / (elev_max - elev_min) : 0.5;
  const acumRel = acum / Math.max(acum_max, 1);

  // Alta acumulación hídrica (criterio central)
  if      (acumRel > 0.45) { s += 45; motivos.push('alta captación de flujos'); }
  else if (acumRel > 0.25) { s += 28; motivos.push('captación de flujos media'); }
  else if (acumRel > 0.10) { s += 12; motivos.push('algo de captación'); }
  else                      { s -= 10; motivos.push('poca acumulación hídrica'); }

  // Pendiente constructible para retener agua
  if      (c.pendiente_pct < 8)  { s += 30; motivos.push('terreno plano constructible'); }
  else if (c.pendiente_pct < 15) { s += 15; motivos.push('pendiente suave'); }
  else if (c.pendiente_pct < 25) { s +=  5; }
  else                            { s -= 20; motivos.push('pendiente muy alta para excavar'); }

  // Posición baja-media (colecta agua por gravedad)
  if      (elevRel < 0.30) { s += 18; motivos.push('punto bajo natural'); }
  else if (elevRel < 0.55) { s += 10; motivos.push('posición media del relieve'); }
  else                      { s -=  5; motivos.push('posición alta, menos captación'); }

  // Concavidad (vaguada): vecinos más altos en al menos 3 lados
  const vecinos = ([
    byPos.get(`${c.row - 1},${c.col}`),
    byPos.get(`${c.row + 1},${c.col}`),
    byPos.get(`${c.row},${c.col - 1}`),
    byPos.get(`${c.row},${c.col + 1}`),
  ].filter(Boolean) as CeldaShader[]);
  const masAltos = vecinos.filter(n => n.elevation > c.elevation + 0.5).length;
  if      (masAltos >= 3) { s += 12; motivos.push('vaguada natural (captación óptima)'); }
  else if (masAltos >= 2) { s +=  5; }

  return { score: Math.max(0, Math.min(100, s)), motivos };
}

// ─── Dijkstra por divisoria de aguas (ridgeline) ─────────────────────────────
// Costo = acumulacion_relativa * 12 + pendiente * 2 + 1
// Favorece celdas con BAJA acumulación (crestas) y baja pendiente

function dijkstraRidgeline(
  byPos:        Map<string, CeldaShader>,
  celdas:       CeldaShader[],
  acumulacion:  Map<string, number>,
  acum_max:     number,
  srcKey:       string,
  dstKey:       string,
): CeldaShader[] {
  const DIRS = [
    { dr: -1, dc:  0 }, { dr:  1, dc:  0 },
    { dr:  0, dc: -1 }, { dr:  0, dc:  1 },
    { dr: -1, dc: -1 }, { dr: -1, dc:  1 },
    { dr:  1, dc: -1 }, { dr:  1, dc:  1 },
  ];

  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  celdas.forEach(c => dist.set(`${c.row},${c.col}`, Infinity));
  dist.set(srcKey, 0);

  // Simple min-heap (array ordenado — grilla pequeña, < 200 celdas)
  const pq: Array<{ key: string; cost: number }> = [{ key: srcKey, cost: 0 }];

  while (pq.length > 0) {
    pq.sort((a, b) => a.cost - b.cost);
    const { key, cost } = pq.shift()!;
    if (key === dstKey) break;
    if (cost > (dist.get(key) ?? Infinity)) continue;
    const c = byPos.get(key);
    if (!c) continue;

    for (const { dr, dc } of DIRS) {
      const nKey = `${c.row + dr},${c.col + dc}`;
      const n = byPos.get(nKey);
      if (!n) continue;

      const acumRel = (acumulacion.get(nKey) ?? 1) / acum_max;
      const newCost = cost + acumRel * 12 + n.pendiente_pct * 2 + 1;

      if (newCost < (dist.get(nKey) ?? Infinity)) {
        dist.set(nKey, newCost);
        prev.set(nKey, key);
        pq.push({ key: nKey, cost: newCost });
      }
    }
  }

  // Reconstruir camino
  const path: CeldaShader[] = [];
  let cur: string | undefined = dstKey;
  while (cur) {
    const c = byPos.get(cur);
    if (c) path.unshift(c);
    cur = prev.get(cur);
  }

  const firstKey = path.length > 0 ? `${path[0]!.row},${path[0]!.col}` : '';
  return firstKey === srcKey && path.length >= 2 ? path : [byPos.get(srcKey)!, byPos.get(dstKey)!].filter(Boolean) as CeldaShader[];
}

// ─── Deduplicar candidatos cercanos ──────────────────────────────────────────

function deduplicar(items: CandidatoUbicacion[], minSepGrados = 0.0015): CandidatoUbicacion[] {
  const result: CandidatoUbicacion[] = [];
  for (const item of items) {
    const tooClose = result.some(r =>
      Math.abs(r.lat - item.lat) < minSepGrados && Math.abs(r.lng - item.lng) < minSepGrados
    );
    if (!tooClose) result.push(item);
  }
  return result;
}

// ─── Función principal ────────────────────────────────────────────────────────

export function calcularSugerencias(
  datos:        DatosShader,
  escorrentias: DatosEscorrentia,
): ResultadoSugerencias {
  const { celdas, elev_min, elev_max } = datos;
  const { acumulacion, acum_max } = escorrentias;

  const byPos = new Map<string, CeldaShader>();
  celdas.forEach(c => byPos.set(`${c.row},${c.col}`, c));

  // Puntuar cada celda
  const vivCandidatos: CandidatoUbicacion[] = [];
  const resCandidatos: CandidatoUbicacion[] = [];

  for (const c of celdas) {
    const key  = `${c.row},${c.col}`;
    const acum = acumulacion.get(key) ?? 1;
    const lat  = (c.latMin + c.latMax) / 2;
    const lng  = (c.lngMin + c.lngMax) / 2;

    const sv = scoreVivienda(c, byPos, acum, acum_max, elev_min, elev_max);
    vivCandidatos.push({ lat, lng, score: sv.score, label: `Vivienda (${sv.score}%)`, motivos: sv.motivos });

    const sr = scoreReservorio(c, byPos, acum, acum_max, elev_min, elev_max);
    resCandidatos.push({ lat, lng, score: sr.score, label: `Reservorio (${sr.score}%)`, motivos: sr.motivos });
  }

  vivCandidatos.sort((a, b) => b.score - a.score);
  resCandidatos.sort((a, b) => b.score - a.score);

  const topViviendas   = deduplicar(vivCandidatos).slice(0, 3);
  const topReservorios = deduplicar(resCandidatos).slice(0, 3);

  // ── Camino de acceso por divisoria de aguas ───────────────────────────────
  // Punto de entrada: celda de borde con menor elevación
  const celdaBorde = celdas.filter(c => {
    return !byPos.has(`${c.row - 1},${c.col}`) || !byPos.has(`${c.row + 1},${c.col}`)
      || !byPos.has(`${c.row},${c.col - 1}`) || !byPos.has(`${c.row},${c.col + 1}`);
  });
  celdaBorde.sort((a, b) => a.elevation - b.elevation);
  const entrada = celdaBorde[0]!;

  let camino: Array<{ lat: number; lng: number }> = [];
  let longitudTotal = 0;
  let pendienteMedia = 0;

  const destinos = [topViviendas[0], topReservorios[0]].filter(Boolean) as CandidatoUbicacion[];

  if (destinos.length > 0) {
    let puntoActual = entrada;

    for (const dest of destinos) {
      const srcCell = celdas.reduce((best, c) => {
        const bl = puntoActual;
        const latC = (c.latMin + c.latMax) / 2;
        const lngC = (c.lngMin + c.lngMax) / 2;
        const d  = Math.hypot(latC - (bl.latMin + bl.latMax) / 2, lngC - (bl.lngMin + bl.lngMax) / 2);
        const bd = Math.hypot((best.latMin + best.latMax) / 2 - (bl.latMin + bl.latMax) / 2,
                              (best.lngMin + best.lngMax) / 2 - (bl.lngMin + bl.lngMax) / 2);
        return d < bd ? c : best;
      }, celdas[0]!);

      const dstCell = celdas.reduce((best, c) => {
        const d  = Math.hypot((c.latMin + c.latMax) / 2 - dest.lat, (c.lngMin + c.lngMax) / 2 - dest.lng);
        const bd = Math.hypot((best.latMin + best.latMax) / 2 - dest.lat, (best.lngMin + best.lngMax) / 2 - dest.lng);
        return d < bd ? c : best;
      }, celdas[0]!);

      const srcKey = `${srcCell.row},${srcCell.col}`;
      const dstKey = `${dstCell.row},${dstCell.col}`;

      if (srcKey !== dstKey) {
        const segmento = dijkstraRidgeline(byPos, celdas, acumulacion, acum_max, srcKey, dstKey);
        const pts = segmento.map(c => ({ lat: (c.latMin + c.latMax) / 2, lng: (c.lngMin + c.lngMax) / 2 }));
        if (camino.length === 0) camino.push(...pts);
        else camino.push(...pts.slice(1));

        // Calcular longitud y pendiente del segmento
        for (let i = 1; i < segmento.length; i++) {
          const a = segmento[i - 1]!;
          const b = segmento[i]!;
          const dLat = Math.abs((b.latMin + b.latMax) / 2 - (a.latMin + a.latMax) / 2) * 111320;
          const dLng = Math.abs((b.lngMin + b.lngMax) / 2 - (a.lngMin + a.lngMax) / 2)
            * 111320 * Math.cos((a.latMin + a.latMax) / 2 * Math.PI / 180);
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);
          const dElev = Math.abs(b.elevation - a.elevation);
          longitudTotal += dist;
          if (dist > 0) pendienteMedia += (dElev / dist);
        }
      }
      puntoActual = dstCell;
    }

    const nSegs = camino.length - 1;
    pendienteMedia = nSegs > 0 ? (pendienteMedia / nSegs) * 100 : 0;
  }

  return {
    viviendas:   topViviendas,
    reservorios: topReservorios,
    camino,
    caminoInfo: {
      longitud_m:          Math.round(longitudTotal),
      pendiente_media_pct: Math.round(pendienteMedia * 10) / 10,
    },
  };
}
