/**
 * Cálculos geodésicos del polígono del lote usando @turf/turf (elipsoide WGS84).
 * Aproximación basada en el elipsoide terrestre — precisión adecuada para
 * predios rurales; no reemplaza un relevamiento topográfico oficial.
 *
 * Portado de apps/terreno/lib/geometria.ts (Fase A1 del plan de dos pistas,
 * ver PLAN-DOS-PISTAS.md), generalizado sobre un `Mojon` propio en vez del
 * tipo de dominio de terreno.
 */
import * as turf from '@turf/turf';

export interface Mojon {
  numero: number;
  lat: number;
  lng: number;
}

export interface Lindero {
  desde: number;    // número del mojón de origen
  hasta: number;    // número del mojón de destino
  longitud_m: number;
  azimut_deg: number; // 0–360, norte = 0, este = 90 — misma convención que el contrato compartido
  rumbo: string;      // cuadrante: "N 45.0° E"
}

export interface MetricasPoligono {
  area_m2: number;
  area_ha: number;
  perimetro_m: number;
  linderos: Lindero[];
}

export function calcularMetricas(mojones: Mojon[]): MetricasPoligono | null {
  if (mojones.length < 3) return null;

  const coords: [number, number][] = mojones.map(m => [m.lng, m.lat]);
  const first = coords[0];
  if (!first) return null;
  coords.push(first); // cerrar polígono

  const polygon = turf.polygon([coords]);
  const area_m2 = turf.area(polygon);
  const area_ha = area_m2 / 10_000;

  let perimetro_m = 0;
  const linderos: Lindero[] = [];

  for (let i = 0; i < mojones.length; i++) {
    const j = (i + 1) % mojones.length;
    const mFrom = mojones[i];
    const mTo = mojones[j];
    if (!mFrom || !mTo) continue;

    const from = turf.point([mFrom.lng, mFrom.lat]);
    const to = turf.point([mTo.lng, mTo.lat]);

    const dist = turf.distance(from, to, { units: 'meters' });
    const bear = turf.bearing(from, to);
    const azimut_deg = (bear + 360) % 360;

    perimetro_m += dist;
    linderos.push({
      desde: mFrom.numero,
      hasta: mTo.numero,
      longitud_m: dist,
      azimut_deg,
      rumbo: azimutARumbo(azimut_deg),
    });
  }

  return { area_m2, area_ha, perimetro_m, linderos };
}

function azimutARumbo(az: number): string {
  const f = (n: number) => n.toFixed(1);
  if (az <= 90) return `N ${f(az)}° E`;
  if (az <= 180) return `S ${f(180 - az)}° E`;
  if (az <= 270) return `S ${f(az - 180)}° O`;
  return `N ${f(360 - az)}° O`;
}

/** Centroide geográfico simple (promedio de mojones) — origen candidato del SistemaLocal. */
export function centroide(mojones: Mojon[]): { lat: number; lng: number } | null {
  if (mojones.length === 0) return null;
  return {
    lat: mojones.reduce((s, m) => s + m.lat, 0) / mojones.length,
    lng: mojones.reduce((s, m) => s + m.lng, 0) / mojones.length,
  };
}
