/**
 * Diseño de aguadas: análisis de escurrimiento y sitios óptimos para cosecha de agua.
 * Basado en los datos de topografía (OpenTopoData SRTM).
 * Metodología: análisis de cuenca simplificado + keyline básico.
 */
import * as turf from '@turf/turf';
import type { DatosTopografia, PuntoElevacion } from './topografia';
import type { Mojon } from './types';

export interface PuntoAguada {
  lat:          number;
  lng:          number;
  elevation:    number;
  tipo:         'represa' | 'zanja' | 'keyline' | 'bajo';
  descripcion:  string;
  area_aporte_m2?: number;   // área estimada que aporta agua al punto
  volumen_est_m3?: number;   // volumen estimable con profundidad 1.5m
}

export interface LineaEscurrimiento {
  desde: PuntoElevacion;
  hacia: PuntoElevacion;
  longitud_m: number;
  desnivel_m: number;
  pendiente_pct: number;
}

export interface DatosAguadas {
  lineas_escurrimiento: LineaEscurrimiento[];
  puntos_bajos:         PuntoElevacion[];
  puntos_aguada:        PuntoAguada[];
  keyline:              Array<{ lat: number; lng: number }> | null;
  caudal_estimado:      { precip_mm: number; area_ha: number; volumen_m3_anual: number } | null;
  recomendaciones:      string[];
}

// ─── Análisis principal ───────────────────────────────────────────────────────

export function calcularAguadas(
  mojones:   Mojon[],
  topo:      DatosTopografia,
  precip_anual_mm?: number,
): DatosAguadas {
  const todosPuntos = [...topo.puntos, topo.centroide, ...topo.grilla]
    .filter(p => p.elevation > -500);

  // Ordenar por elevación
  const porElevacion = [...todosPuntos].sort((a, b) => a.elevation - b.elevation);

  // Puntos bajos: los 3 más bajos con separación mínima entre sí
  const puntos_bajos = encontrarBajos(porElevacion, 3);

  // Líneas de escurrimiento: conectar alto → bajo por sectores
  const lineas_escurrimiento = calcularLineasEscurrimiento(topo);

  // Puntos sugeridos para aguadas
  const puntos_aguada = sugerirAguadas(puntos_bajos, topo, mojones);

  // Keyline: contorno a la elevación media del punto más bajo que no es la base
  const keyline = calcularKeyline(todosPuntos, topo);

  // Caudal potencial
  let caudal_estimado = null;
  if (precip_anual_mm && mojones.length >= 3) {
    try {
      const coords = mojones.map(m => [m.lng, m.lat] as [number, number]);
      coords.push(coords[0]!);
      const area_ha = turf.area(turf.polygon([coords])) / 10000;
      const coef = 0.25; // escorrentía promedio suelo natural
      caudal_estimado = {
        precip_mm: precip_anual_mm,
        area_ha: Math.round(area_ha * 100) / 100,
        volumen_m3_anual: Math.round((precip_anual_mm / 1000) * (area_ha * 10000) * coef),
      };
    } catch { /* silently ignore */ }
  }

  const recomendaciones = generarRecomendaciones(topo, puntos_bajos, caudal_estimado);

  return {
    lineas_escurrimiento,
    puntos_bajos,
    puntos_aguada,
    keyline,
    caudal_estimado,
    recomendaciones,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function encontrarBajos(sorted: PuntoElevacion[], n: number): PuntoElevacion[] {
  const result: PuntoElevacion[] = [];
  for (const p of sorted) {
    if (result.length >= n) break;
    // Verificar separación mínima (~50m) de los puntos ya seleccionados
    const muyCerca = result.some(r => {
      const dist = turf.distance(
        turf.point([r.lng, r.lat]),
        turf.point([p.lng, p.lat]),
        { units: 'meters' },
      );
      return dist < 30;
    });
    if (!muyCerca) result.push(p);
  }
  return result;
}

function calcularLineasEscurrimiento(topo: DatosTopografia): LineaEscurrimiento[] {
  const lineas: LineaEscurrimiento[] = [];
  const { desde, hacia } = topo.escurrimiento;

  const dist = turf.distance(
    turf.point([desde.lng, desde.lat]),
    turf.point([hacia.lng, hacia.lat]),
    { units: 'meters' },
  );
  const desnivel = desde.elevation - hacia.elevation;

  lineas.push({
    desde,
    hacia,
    longitud_m:    Math.round(dist),
    desnivel_m:    Math.round(desnivel * 10) / 10,
    pendiente_pct: dist > 0 ? Math.round((desnivel / dist) * 1000) / 10 : 0,
  });

  // Líneas secundarias entre mojones adyacentes de alto → bajo
  const puntosPorElev = [...topo.puntos].sort((a, b) => b.elevation - a.elevation);
  for (let i = 0; i < Math.min(puntosPorElev.length - 1, 3); i++) {
    const a = puntosPorElev[i];
    const b = puntosPorElev[i + 1];
    if (!a || !b) continue;
    const d = turf.distance(turf.point([a.lng, a.lat]), turf.point([b.lng, b.lat]), { units: 'meters' });
    const dn = a.elevation - b.elevation;
    if (d > 5 && dn > 0) {
      lineas.push({
        desde: a, hacia: b,
        longitud_m:    Math.round(d),
        desnivel_m:    Math.round(dn * 10) / 10,
        pendiente_pct: Math.round((dn / d) * 1000) / 10,
      });
    }
  }

  return lineas;
}

function sugerirAguadas(
  bajos: PuntoElevacion[],
  topo: DatosTopografia,
  mojones: Mojon[],
): PuntoAguada[] {
  const aguadas: PuntoAguada[] = [];

  bajos.forEach((p, i) => {
    const area_est = mojones.length >= 3 ? estimarAreaAporte(p, topo) : undefined;
    const vol_est  = area_est ? Math.round((area_est / 10000) * 1000 * 0.25 / 3) : undefined; // 1m de lluvia, coef 0.25, represa 3m²/m³

    aguadas.push({
      lat: p.lat, lng: p.lng, elevation: p.elevation,
      tipo: 'represa',
      descripcion: `Bajo nº${i + 1} — sitio favorable para represa o jagüel`,
      area_aporte_m2: area_est,
      volumen_est_m3: vol_est,
    });
  });

  // Sugerir zanjas en la línea de escurrimiento principal
  if (topo.pendiente_pct > 5 && topo.pendiente_pct < 20) {
    aguadas.push({
      lat: (topo.escurrimiento.desde.lat + topo.escurrimiento.hacia.lat) / 2,
      lng: (topo.escurrimiento.desde.lng + topo.escurrimiento.hacia.lng) / 2,
      elevation: (topo.escurrimiento.desde.elevation + topo.escurrimiento.hacia.elevation) / 2,
      tipo: 'zanja',
      descripcion: 'Zona apta para zanjas en curva de nivel (swales)',
    });
  }

  return aguadas;
}

function estimarAreaAporte(bajo: PuntoElevacion, topo: DatosTopografia): number {
  // Estimar área que drenarías hacia este punto: puntos más altos en su sector
  const puntosAltos = [...topo.puntos, ...topo.grilla].filter(
    p => p.elevation > bajo.elevation,
  );
  if (puntosAltos.length < 3) return 0;
  try {
    const coords = puntosAltos.map(p => [p.lng, p.lat] as [number, number]);
    coords.push(coords[0]!);
    return turf.area(turf.convex(turf.featureCollection(puntosAltos.map(p => turf.point([p.lng, p.lat])))) ?? turf.polygon([coords]));
  } catch { return 0; }
}

function calcularKeyline(puntos: PuntoElevacion[], topo: DatosTopografia): Array<{ lat: number; lng: number }> | null {
  // Keyline: contorno a la elevación del punto más bajo externo (aprox. 1/3 desde abajo)
  if (puntos.length < 4) return null;
  const sorted = [...puntos].sort((a, b) => a.elevation - b.elevation);
  const targetElev = sorted[Math.floor(sorted.length * 0.25)]?.elevation;
  if (!targetElev) return null;

  // Puntos cercanos a la elevación objetivo (±2m)
  const keyPoints = puntos.filter(p => Math.abs(p.elevation - targetElev) <= 2);
  if (keyPoints.length < 2) return null;

  return keyPoints
    .sort((a, b) => {
      const angA = Math.atan2(a.lat - topo.centroide.lat, a.lng - topo.centroide.lng);
      const angB = Math.atan2(b.lat - topo.centroide.lat, b.lng - topo.centroide.lng);
      return angA - angB;
    });
}

function generarRecomendaciones(
  topo: DatosTopografia,
  bajos: PuntoElevacion[],
  caudal: DatosAguadas['caudal_estimado'],
): string[] {
  const recs: string[] = [];

  if (topo.pendiente_pct > 20) {
    recs.push('Pendiente elevada (>' + topo.pendiente_pct + '%). Zanjas de infiltración en curva de nivel para frenar escurrimiento.');
  } else if (topo.pendiente_pct > 5) {
    recs.push(`Pendiente ${topo.pendiente_pct}% ideal para keyline design. Trazar curvas de nivel para distribuir agua.`);
  } else {
    recs.push('Terreno con poca pendiente. Estudiar drenaje para evitar anegamientos.');
  }

  if (bajos.length > 0) {
    const bajo = bajos[0]!;
    recs.push(`Punto más bajo del predio (~${bajo.elevation.toFixed(0)} m s.n.m.). Evaluar represa o jagüel en ese sector.`);
  }

  if (topo.desnivel > 15) {
    recs.push(`Desnivel de ${topo.desnivel}m. Considerar represa de ladera (atajapastos) en la parte media del escurrimiento.`);
  }

  if (caudal) {
    recs.push(
      `Con ${caudal.precip_mm} mm/año y ${caudal.area_ha} ha, se estima un escurrimiento de ~${caudal.volumen_m3_anual.toLocaleString('es-AR')} m³/año (coef. 0.25 suelo natural).`,
    );
  }

  if (topo.orientacion.startsWith('N') || topo.orientacion.startsWith('NE')) {
    recs.push('Escurrimiento hacia el norte: ladera más expuesta al sol, suele ser más seca. Priorizar retención de agua.');
  }

  return recs;
}
