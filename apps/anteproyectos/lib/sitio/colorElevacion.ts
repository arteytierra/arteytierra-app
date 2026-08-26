/**
 * Rampa de color para la capa de elevación del mapa (Fase A4). Portado de
 * `apps/terreno/lib/shaders.ts` (`RAMP_ELEV` + `interpolarColor` +
 * `colorElevacion`) — mismos colores, para que el mapa de anteproyectos se
 * sienta consistente con el de terreno.
 */

interface ParadaRampa {
  t: number;
  r: number;
  g: number;
  b: number;
}

const RAMP_ELEV: ParadaRampa[] = [
  { t: 0.0, r: 21, g: 101, b: 192 }, // azul profundo
  { t: 0.15, r: 66, g: 165, b: 245 }, // azul claro
  { t: 0.3, r: 102, g: 187, b: 106 }, // verde
  { t: 0.5, r: 255, g: 238, b: 88 }, // amarillo
  { t: 0.65, r: 255, g: 167, b: 38 }, // naranja
  { t: 0.8, r: 141, g: 110, b: 99 }, // marrón
  { t: 1.0, r: 236, g: 239, b: 241 }, // casi blanco
];

function interpolarColor(t: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 0; i < RAMP_ELEV.length - 1; i++) {
    const a = RAMP_ELEV[i]!;
    const b = RAMP_ELEV[i + 1]!;
    if (clamped >= a.t && clamped <= b.t) {
      const factor = (clamped - a.t) / (b.t - a.t);
      return [Math.round(a.r + (b.r - a.r) * factor), Math.round(a.g + (b.g - a.g) * factor), Math.round(a.b + (b.b - a.b) * factor)];
    }
  }
  const last = RAMP_ELEV[RAMP_ELEV.length - 1]!;
  return [last.r, last.g, last.b];
}

export function colorElevacionRGB(elev: number, min: number, max: number): [number, number, number] {
  return interpolarColor(max > min ? (elev - min) / (max - min) : 0);
}
