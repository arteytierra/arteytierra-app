/**
 * Cálculos geodésicos del polígono usando @turf/turf (elipsoide WGS84).
 * Los resultados son aproximaciones basadas en el elipsoide terrestre — precisión
 * adecuada para predios rurales; no reemplaza un relevamiento topográfico oficial.
 */
import * as turf from '@turf/turf';
import type { Mojon } from './types';

export interface Lindero {
  desde: number;   // número del mojón de origen
  hasta: number;   // número del mojón de destino
  longitud: number; // metros
  azimut: number;   // grados 0–360 (norte = 0, este = 90)
  rumbo: string;    // cuadrante: "N 45.0° E"
}

export interface MetricasPoligono {
  area_m2: number;
  area_ha: number;
  perimetro_m: number;
  linderos: Lindero[];
}

export function calcularMetricas(mojones: Mojon[]): MetricasPoligono | null {
  if (mojones.length < 3) return null;

  // Turf espera [lng, lat]
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
    const mTo   = mojones[j];
    if (!mFrom || !mTo) continue;

    const from = turf.point([mFrom.lng, mFrom.lat]);
    const to   = turf.point([mTo.lng, mTo.lat]);

    const dist   = turf.distance(from, to, { units: 'meters' });
    const bear   = turf.bearing(from, to);
    const azimut = (bear + 360) % 360;

    perimetro_m += dist;
    linderos.push({
      desde: mFrom.numero,
      hasta: mTo.numero,
      longitud: dist,
      azimut,
      rumbo: azimutARumbo(azimut),
    });
  }

  return { area_m2, area_ha, perimetro_m, linderos };
}

function azimutARumbo(az: number): string {
  const f = (n: number) => n.toFixed(1);
  if (az <= 90)  return `N ${f(az)}° E`;
  if (az <= 180) return `S ${f(180 - az)}° E`;
  if (az <= 270) return `S ${f(az - 180)}° O`;
  return `N ${f(360 - az)}° O`;
}

export function formatearDistancia(metros: number): string {
  if (metros >= 1000) return `${(metros / 1000).toFixed(3)} km`;
  return `${metros.toFixed(1)} m`;
}
