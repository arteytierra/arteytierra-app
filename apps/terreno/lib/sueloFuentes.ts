/**
 * Ruteo de fuente de suelo por ubicación, con la misma regla que ya usa el DEM
 * (`lib/elevacion/router.ts`): donde hay un servicio nacional en vivo, con
 * licencia comercial clara y mejor resolución que la fuente global, se usa ése;
 * si no responde o no tiene dato en el punto, se cae a SoilGrids.
 *
 * Por qué importa. SoilGrids es un modelo global de ~250 m: interpola a partir
 * de perfiles dispersos y devuelve una estimación razonable en cualquier parte
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
