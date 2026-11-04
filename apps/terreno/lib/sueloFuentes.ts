/**
 * Ruteo de fuente de suelo por ubicación, con la misma regla que ya usa el DEM
 * (`lib/elevacion/router.ts`): donde hay un servicio nacional en vivo, con
 * licencia comercial clara y mejor resolución que la fuente global, se usa ése;
 * si no responde o no tiene dato en el punto, se cae a SoilGrids.
 *
 * Por qué importa. SoilGrids es un modelo global: interpola a partir de
 * perfiles dispersos y devuelve una estimación razonable en cualquier parte
 * del mundo, que es exactamente lo que necesitamos como piso. Pero donde existe
 * un relevamiento de campo —polígonos mapeados, perfiles descriptos por un
 * edafólogo, agua útil y conductividad medidas en laboratorio— la diferencia no
 * es de precisión sino de naturaleza: uno es un modelo y el otro es el dato.
 *
 * Cómo se agrega una fuente nueva:
 *   1. Agregar el id al tipo `FuenteNacionalSuelo`.
 *   2. Agregar su bbox acá (grueso está bien: si el servicio no tiene dato en el
 *      punto, el llamador cae a SoilGrids igual).
 *   3. Escribir la ruta `app/api/suelo/<id>/route.ts` que devuelva el perfil
 *      normalizado, y sumarla al `switch` de `obtenerSuelo` en `lib/suelos.ts`.
 *
 * Antes de agregar una: la licencia tiene que permitir uso comercial. LUCAS
 * Topsoil (Europa), por ejemplo, quedó afuera por eso mismo.
 */

/**
 * Paso de la grilla de cada camino de SoilGrids, en metros.
 *
 * Son dos y no uno. El principal desde el 26/09/2026 es el producto agregado a
 * 1 km que se lee de los rásters; los 250 m de la API de consulta quedaron de
 * respaldo porque el cupo por IP lo comparten todos los usuarios (ver
 * `lib/soilgridsCog.ts` y `app/api/suelo/route.ts`).
 *
 * Vive acá, y no en `soilgridsCog.ts`, porque quien tiene que decirlo es la
 * pantalla y ese módulo arrastra `geotiff`: importarlo desde la interfaz o
 * desde la guía se llevaría el lector de GeoTIFF entero adentro del bundle.
 *
 * Que estén acá los dos no es decorativo: la app decía «~250 m» para todo y
 * desde el cambio eso es falso en casi cualquier punto. Es la misma falla que
 * ya tuvimos con el relieve, que anunciaba «SRTM 30 m» mientras usaba un DEM
 * nacional.
 */
export const PASO_SUELO_M = { cog: 1000, rest: 250 } as const;

/** El paso dicho como lo lee una persona: «~1 km», «~250 m». */
export function pasoSueloTexto(m: number): string {
  return m >= 1000 ? `~${m / 1000} km` : `~${m} m`;
}

/**
 * Lo único que la pantalla puede afirmar ANTES de consultar, porque cuál de los
 * dos caminos contesta se sabe recién con la respuesta. Una vez que el dato
 * llegó manda `DatosSuelo.fuente`, que sí lo sabe.
 */
export const PASO_SUELO_HABITUAL = pasoSueloTexto(PASO_SUELO_M.cog);

export type FuenteNacionalSuelo = 'ssurgo';

interface Cobertura {
  fuente: FuenteNacionalSuelo;
  /** [oeste, sur, este, norte] */
  bbox: [number, number, number, number];
}

const COBERTURAS: Cobertura[] = [
  // SSURGO / Soil Data Access (USDA-NRCS). Cubre los 50 estados, Puerto Rico y
  // las Islas Vírgenes; el detalle real varía por survey area y hay condados sin
  // levantar, donde SDA devuelve vacío y caemos a SoilGrids.
  { fuente: 'ssurgo', bbox: [-125.0, 24.4, -66.9, 49.5] },   // EE.UU. contiguo
  { fuente: 'ssurgo', bbox: [-160.3, 18.9, -154.7, 22.3] },  // Hawái
  { fuente: 'ssurgo', bbox: [-168.2, 54.4, -129.9, 71.5] },  // Alaska
  { fuente: 'ssurgo', bbox: [-67.3, 17.6, -64.5, 18.6] },    // Puerto Rico e Islas Vírgenes
];

/** Fuentes nacionales cuyo bbox contiene el punto, en orden de preferencia. */
export function fuentesNacionalesSuelo(lat: number, lng: number): FuenteNacionalSuelo[] {
  return COBERTURAS
    .filter(c => lng >= c.bbox[0] && lng <= c.bbox[2] && lat >= c.bbox[1] && lat <= c.bbox[3])
    .map(c => c.fuente);
}
