/**
 * Cuencas archivadas.
 *
 * Hasta acá la pestaña Cuenca tenía una sola cuenca viva: marcabas otra salida
 * y la anterior desaparecía con todos sus números. Se podía volcar el contorno
 * a un polígono editable, pero eso guardaba el DIBUJO y perdía el cálculo —el
 * CN, la tormenta, el caudal pico, el vertedero—, que es justamente lo que
 * cuesta reconstruir.
 *
 * Un predio real tiene varias: la del sitio de represa, la del cruce de camino,
 * la de la vaguada que se lava. Compararlas es el trabajo. Así que cada cálculo
 * se puede archivar entero: geometría + con qué se calculó + qué dio.
 *
 * `celdas` NO se guarda. Es el interior del raster (miles de claves `row,col`),
 * sólo hace falta durante la delineación, y multiplicarlo por N cuencas
 * engordaría el proyecto sin que nadie lo use.
 */
import type { Cuenca, ResultadoCuenca, GrupoHidro } from './cuenca';

export interface ParamsCuenca {
  coberturaId: string;
  grupo:       GrupoHidro;
  precip_mm:   number;
  head_m:      number;
}

export interface CuencaGuardada {
  id:        string;
  nombre:    string;
  creada:    string;        // ISO
  color:     string;
  /** geometría, sin el interior del raster */
  cuenca:    Cuenca;
  expandida: boolean;
  /** con qué se calculó, para poder reproducirlo o discutirlo */
  params:    ParamsCuenca;
  /** qué dio */
  resultado: ResultadoCuenca;
  /** carpeta de la Escala de permanencia donde está archivada */
  capaId?:   string;
}

/**
 * Paleta de las cuencas archivadas. Azules y verdes-agua para que se lean como
 * familia y no compitan con el contorno de la cuenca activa (#1565C0 punteado).
 */
export const COLORES_CUENCA = ['#0288D1', '#00897B', '#5E35B1', '#00ACC1', '#3949AB', '#43A047'] as const;

export function crearCuencaGuardada(
  cuenca:    Cuenca,
  params:    ParamsCuenca,
  resultado: ResultadoCuenca,
  expandida: boolean,
  existentes: CuencaGuardada[],
): CuencaGuardada {
  return {
    id:     crypto.randomUUID(),
    nombre: nombreLibre(existentes),
    creada: new Date().toISOString(),
    color:  COLORES_CUENCA[existentes.length % COLORES_CUENCA.length]!,
    // sin celdas: ver el docstring del módulo
    cuenca: { ...cuenca, celdas: [] },
    expandida,
    params,
    resultado,
  };
}

/** "Cuenca 1", "Cuenca 2"… salteando los números que ya están tomados. */
function nombreLibre(existentes: CuencaGuardada[]): string {
  const usados = new Set(existentes.map(c => c.nombre));
  for (let n = 1; n <= existentes.length + 1; n++) {
    const nombre = `Cuenca ${n}`;
    if (!usados.has(nombre)) return nombre;
  }
  return `Cuenca ${existentes.length + 1}`;
}

/**
 * ¿Esta cuenca ya está archivada? Se compara por geometría y por parámetros:
 * la misma salida con otra tormenta es otro escenario y vale archivarlo aparte,
 * pero apretar "Guardar" dos veces seguidas no tiene que duplicar nada.
 */
export function yaArchivada(
  cuenca: Cuenca,
  params: ParamsCuenca,
  existentes: CuencaGuardada[],
): CuencaGuardada | null {
  return existentes.find(g =>
    Math.abs(g.cuenca.outlet.lat - cuenca.outlet.lat) < 1e-6 &&
    Math.abs(g.cuenca.outlet.lng - cuenca.outlet.lng) < 1e-6 &&
    g.cuenca.area_ha === cuenca.area_ha &&
    g.params.coberturaId === params.coberturaId &&
    g.params.grupo === params.grupo &&
    Math.abs(g.params.precip_mm - params.precip_mm) < 0.5 &&
    Math.abs(g.params.head_m - params.head_m) < 0.01
  ) ?? null;
}

/** Una línea con lo que distingue a esta cuenca de las otras, para listarla. */
export function resumenCuenca(g: CuencaGuardada): string {
  const { cuenca, resultado } = g;
  return `${cuenca.area_ha} ha · pico ${resultado.caudal_pico_m3s} m³/s · vertedero ${resultado.vertedero_m} m`;
}
