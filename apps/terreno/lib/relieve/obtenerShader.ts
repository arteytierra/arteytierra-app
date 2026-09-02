/**
 * Orquestador del relieve: la cascada de fuentes, sin React.
 *
 * Hasta acá la secuencia vivía adentro de `handleFetchShader`, mezclada con
 * cuatro `setState`. Eso la hacía imposible de probar: para saber si el
 * fallback funcionaba había que montar el componente entero y un mapa.
 *
 * Acá entra un predio y salen datos (o un motivo). Quién los guarda y qué capas
 * enciende es problema del componente, no de la cascada.
 *
 * El orden de las fuentes va de más a menos resolución:
 *   1. DEM propio (dron / estación total) — si el usuario cargó uno, manda.
 *   2. Grilla densa desde tiles Terrarium — cientos de celdas, sin API externa.
 *   3. Muestreo 10×10 vía OpenTopoData — el piso, siempre disponible.
 */
import {
  fetchShader,
  shaderDesdeGrilla,
  shaderDesdeDEM,
  type DatosShader,
} from '@/lib/shaders';
import { obtenerGrillaDensa } from '@/lib/grillaElevacion';
import type { DEMImportado } from '@/lib/demImport';

/** Punto mínimo que necesita la cascada. `Mojon` lo satisface. */
export interface PuntoLL { lat: number; lng: number }

/** De cuál de las tres fuentes salieron los datos. Sirve para telemetría y tests. */
export type ViaRelieve = 'dem_propio' | 'grilla_densa' | 'muestreo';

export type ResultadoRelieve =
  | { ok: true;  datos: DatosShader; via: ViaRelieve }
  | { ok: false; mensaje: string };

export interface OpcionesRelieve {
  /** MDE cargado por el usuario. Si está, se intenta primero. */
  demPropio?: DEMImportado | null;
  /** Modo detallado: probar la grilla densa antes de caer al muestreo 10×10. */
  detallado?: boolean;
  /** Celdas de lado para la grilla densa. */
  resolucion?: number;
}

/**
 * Dependencias inyectables. En producción son las funciones reales; en los tests
 * se reemplazan por dobles. No es ceremonia: `obtenerGrillaDensa` dibuja en un
 * `<canvas>` y devuelve `null` fuera del browser, así que sin esto la rama de la
 * grilla densa sería imposible de ejercitar bajo vitest.
 */
export interface DepsRelieve {
  shaderDesdeDEM:     typeof shaderDesdeDEM;
  obtenerGrillaDensa: typeof obtenerGrillaDensa;
  shaderDesdeGrilla:  typeof shaderDesdeGrilla;
  fetchShader:        typeof fetchShader;
}

export const DEPS_RELIEVE: DepsRelieve = {
  shaderDesdeDEM,
  obtenerGrillaDensa,
  shaderDesdeGrilla,
  fetchShader,
};

export const MIN_MOJONES = 3;

export async function obtenerShader(
  mojones: PuntoLL[],
  opciones: OpcionesRelieve = {},
  deps: DepsRelieve = DEPS_RELIEVE,
): Promise<ResultadoRelieve> {
  if (mojones.length < MIN_MOJONES) {
    return { ok: false, mensaje: 'Se necesitan al menos 3 mojones.' };
  }

  const { demPropio = null, detallado = true, resolucion = 100 } = opciones;

  // 1. DEM propio. Si no alcanza para armar el shader (grilla degenerada o
  //    predio fuera del archivo), se sigue con las fuentes satelitales.
  if (demPropio) {
    const ds = deps.shaderDesdeDEM(demPropio.grilla, mojones);
    if (ds) return { ok: true, datos: ds, via: 'dem_propio' };
  }

  // 2. Grilla densa. Es red: puede fallar entera, y eso no es un error del
  //    usuario sino una razón para bajar de resolución.
  if (detallado) {
    try {
      const grilla = await deps.obtenerGrillaDensa(mojones, resolucion);
      const ds = grilla ? deps.shaderDesdeGrilla(grilla, mojones) : null;
      if (ds) return { ok: true, datos: ds, via: 'grilla_densa' };
    } catch {
      /* cae al muestreo 10×10 */
    }
  }

  // 3. Muestreo 10×10. Acá sí, si falla, no hay relieve.
  const result = await deps.fetchShader(mojones);
  if ('error' in result) return { ok: false, mensaje: result.error };
  return { ok: true, datos: result, via: 'muestreo' };
}
