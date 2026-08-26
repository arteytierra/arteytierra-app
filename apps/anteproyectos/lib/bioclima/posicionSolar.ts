/**
 * Posición del sol (azimut/elevación) para una latitud, fecha y hora solar
 * dadas. Fórmulas de Cooper (1969) para declinación — error < 0.5°, mismas
 * que usa apps/terreno/lib/arco_solar.ts, con `posicionSolar` exportada acá
 * (era privada en terreno) porque es lo que necesita el motor de sombra
 * real (Fase A2, ver PLAN-DOS-PISTAS.md).
 *
 * Azimut: 0=N, 90=E, 180=S, 270=O, sentido horario — misma convención que
 * `azimut_deg` y `norte_deg` en @arteytierra/anteproyectos-contracts.
 */

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export interface PosicionSolar {
  elevacion_deg: number; // sobre el horizonte; negativa si el sol está bajo
  azimut_deg: number;    // 0=N, 90=E, 180=S, 270=O
}

/** Día del año (1–365/366) de una fecha UTC. */
export function diaDelAnio(fecha: Date): number {
  const inicio = Date.UTC(fecha.getUTCFullYear(), 0, 1);
  const dia = Math.floor((Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()) - inicio) / 86_400_000) + 1;
  return dia;
}

export function declinacion(doy: number): number {
  return 23.45 * DEG * Math.sin((2 * Math.PI * (284 + doy)) / 365);
}

/**
 * Posición solar para latitud, día del año y hora solar (0–24, decimal).
 * Devuelve elevación negativa si el sol está bajo el horizonte (no null,
 * a diferencia de terreno) para que el llamador decida qué hacer.
 */
export function posicionSolar(lat_deg: number, doy: number, hora_solar: number): PosicionSolar {
  const phi = lat_deg * DEG;
  const decl = declinacion(doy);
  const H = (hora_solar - 12) * 15 * DEG; // ángulo horario

  const sinAlt = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(H);
  const elev = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * RAD;

  const azRad = Math.atan2(
    -Math.cos(decl) * Math.sin(H),
    Math.sin(decl) * Math.cos(phi) - Math.cos(decl) * Math.cos(H) * Math.sin(phi),
  );

  return { elevacion_deg: elev, azimut_deg: ((azRad * RAD) + 360) % 360 };
}

export function horasSalidaPuesta(lat_deg: number, doy: number): { salida: number; puesta: number } {
  const phi = lat_deg * DEG;
  const decl = declinacion(doy);
  const cosWs = -Math.tan(phi) * Math.tan(decl);
  if (cosWs <= -1) return { salida: 0, puesta: 24 };  // día polar
  if (cosWs >= 1) return { salida: 12, puesta: 12 };  // noche polar
  const ws_h = (Math.acos(cosWs) * RAD) / 15;
  return { salida: 12 - ws_h, puesta: 12 + ws_h };
}
