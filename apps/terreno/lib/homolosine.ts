/**
 * Goode Homolosine interrumpida (`+proj=igh`): proyección → píxel.
 *
 * Hace falta porque SoilGrids 2.0 publica **todos** sus rásters en esta
 * proyección, no en lat/lon. El GeoTIFF lo dice en sus propias claves:
 *
 *   GTCitationGeoKey  = "Homolosine"
 *   PCSCitationGeoKey = PROJCS["Homolosine", … PROJECTION["Goode_Homolosine"],
 *                              PARAMETER["Option",1.0], UNIT["Meter",1.0]]
 *
 * y ISRIC documenta la cadena PROJ equivalente:
 *   `+proj=igh +lat_0=0 +lon_0=0 +datum=WGS84 +units=m +no_defs`
 *
 * `proj4` no trae `igh` ni `goode` (medido el 26/09/2026 con proj4 2.20.8: las
 * dos cadenas tiran error), pero sí trae `sinu` y `moll`, que es exactamente de
 * lo que está hecha la igh. Así que acá va sólo la parte que falta: en qué zona
 * cae el punto y con qué desplazamiento se pega esa zona al lienzo global.
 *
 * ## Fuente
 *
 * Las doce zonas, sus proyecciones, sus meridianos centrales y sus falsos
 * este/norte están copiados de la implementación de referencia:
 * PROJ, `src/projections/igh.cpp` (función `PJ_PROJECTION(igh)` y
 * `igh_s_forward`), consultada el 26/09/2026.
 * Referencia original: J. Paul Goode (1925), «The Homolosine Projection: a new
 * device for portraying the Earth's surface entire», Annals of the Association
 * of American Geographers 15:3, 119-125, DOI 10.1080/00045602509356949.
 *
 *     -180            -40                       180
 *       +--------------+-------------------------+   zonas 1, 2, 9, 10, 11 y 12:
 *       |1             |2                        |     Mollweide
 *       +--------------+-------------------------+
 *       |3             |4                        |   zonas 3, 4, 5, 6, 7 y 8:
 *       |              |                         |     sinusoidal
 *     0 +-------+------+-+-----------+-----------+
 *       |5      |6       |7          |8          |
 *       +-------+--------+-----------+-----------+
 *       |9      |10      |11         |12         |
 *       +-------+--------+-----------+-----------+
 *     -180    -100      -20         80          180
 *
 * ## Unidades y rango de validez
 *
 * Entra lat/lon en **grados** WGS84; sale x/y en **metros** sobre una esfera de
 * radio 6 378 137 m (la igh es esférica: PROJ le pone `es = 0`). Vale para todo
 * el planeta. No hay inversa acá porque no hace falta: se va de un punto del
 * mundo a un píxel, nunca al revés.
 *
 * Ojo con una cosa: la proyección es **interrumpida**, así que hay huecos del
 * lienzo que no corresponden a ningún punto del mundo. Este archivo hace la ida,
 * que siempre existe; los huecos se ven del otro lado, como NoData del ráster.
 */
import proj4 from 'proj4';

/** Radio de la esfera, en metros. WGS84 semieje mayor, que es lo que usa igh. */
const RADIO_M = 6_378_137;

const GRADOS_A_RAD = Math.PI / 180;

/**
 * Latitud donde la sinusoidal le pasa la posta a la Mollweide: 40° 44' 11,8".
 * Es la latitud en la que las dos tienen la misma escala de área, y por eso el
 * empalme no se nota. (`igh_phi_boundary` en igh.cpp.)
 */
const LAT_EMPALME = 40 + 44 / 60 + 11.8 / 3600;

/** Esfera, no elipsoide: la igh es esférica. */
const ESFERA = `+a=${RADIO_M} +b=${RADIO_M} +units=m +no_defs`;
const sinusoidal = (lon0: number) => `+proj=sinu +lon_0=${lon0} ${ESFERA}`;
const mollweide  = (lon0: number) => `+proj=moll +lon_0=${lon0} ${ESFERA}`;

/**
 * Corrimiento vertical de las zonas Mollweide para que el empalme sea continuo.
 *
 * En `LAT_EMPALME` la sinusoidal y la Mollweide no dan el mismo `y`; la
 * diferencia es constante y se le suma a las zonas Mollweide del norte y se le
 * resta a las del sur. igh.cpp lo calcula igual, proyectando la latitud de
 * empalme con las dos y restando (el bloque comentado «y0 ?»).
 *
 * Da −336 788 m. El test lo fija: si una versión nueva de proj4 cambiara su
 * Mollweide, el mundo entero se correría 337 km y eso tiene que romper un test,
 * no salir en un informe.
 */
const DESPLAZAMIENTO_MOLLWEIDE_M =
  proj4('EPSG:4326', sinusoidal(0), [0, LAT_EMPALME])[1]! -
  proj4('EPSG:4326', mollweide(0),  [0, LAT_EMPALME])[1]!;

interface Zona {
  /** Definición proj4 de la subproyección, ya con su meridiano central. */
  def: string;
  /**
   * Falso este, en grados de longitud sobre el ecuador. igh.cpp lo guarda en
   * radianes de esfera unitaria; acá se guarda en grados y se pasa a metros al
   * usarlo, que es lo mismo y se lee.
   */
  x0Grados: number;
  /** Falso norte, en metros. */
  y0M: number;
}

const D = DESPLAZAMIENTO_MOLLWEIDE_M;

/** Las doce zonas, en el orden de igh.cpp. */
const ZONAS: Record<number, Zona> = {
  1:  { def: mollweide(-100),  x0Grados: -100, y0M:  D },
  2:  { def: mollweide(  30),  x0Grados:   30, y0M:  D },
  3:  { def: sinusoidal(-100), x0Grados: -100, y0M:  0 },
  4:  { def: sinusoidal(  30), x0Grados:   30, y0M:  0 },
  5:  { def: sinusoidal(-160), x0Grados: -160, y0M:  0 },
  6:  { def: sinusoidal( -60), x0Grados:  -60, y0M:  0 },
  7:  { def: sinusoidal(  20), x0Grados:   20, y0M:  0 },
  8:  { def: sinusoidal( 140), x0Grados:  140, y0M:  0 },
  9:  { def: mollweide(-160),  x0Grados: -160, y0M: -D },
  10: { def: mollweide( -60),  x0Grados:  -60, y0M: -D },
  11: { def: mollweide(  20),  x0Grados:   20, y0M: -D },
  12: { def: mollweide( 140),  x0Grados:  140, y0M: -D },
};

/** Longitud llevada a (−180, 180]. */
function normalizarLon(lon: number): number {
  let l = ((lon + 180) % 360 + 360) % 360 - 180;
  if (l === -180) l = 180;
  return l;
}

/**
 * Zona de la igh que le toca al punto, 1 a 12.
 *
 * Los cortes son los de `igh_s_forward`: primero por latitud (empalme, ecuador,
 * empalme sur) y después por longitud, con `<=` en cada borde igual que allá.
 */
export function zonaHomolosine(lat: number, lon: number): number {
  const l = normalizarLon(lon);
  if (lat >=  LAT_EMPALME) return l <= -40 ? 1 : 2;
  if (lat >=  0)           return l <= -40 ? 3 : 4;
  if (lat >= -LAT_EMPALME) return l <= -100 ? 5 : l <= -20 ? 6 : l <= 80 ? 7 : 8;
  return l <= -100 ? 9 : l <= -20 ? 10 : l <= 80 ? 11 : 12;
}

/** Punto del mundo (grados WGS84) → coordenada Goode Homolosine interrumpida (metros). */
export function aHomolosine(lat: number, lon: number): { x: number; y: number; zona: number } {
  const l = normalizarLon(lon);
  const zona = zonaHomolosine(lat, l);
  const z = ZONAS[zona]!;
  const [x, y] = proj4('EPSG:4326', z.def, [l, lat]) as [number, number];
  return {
    x: x + z.x0Grados * GRADOS_A_RAD * RADIO_M,
    y: y + z.y0M,
    zona,
  };
}

/** Sólo para los tests: el corrimiento medido de las zonas Mollweide, en metros. */
export const _desplazamientoMollweideM = DESPLAZAMIENTO_MOLLWEIDE_M;
/** Sólo para los tests: la latitud de empalme sinusoidal/Mollweide, en grados. */
export const _latEmpalme = LAT_EMPALME;
