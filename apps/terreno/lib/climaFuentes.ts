/**
 * Ruteo de fuente de clima por ubicación, con la misma regla que ya usan el DEM
 * (`lib/elevacion/router.ts`) y el suelo (`lib/sueloFuentes.ts`): donde hay un
 * servicio regional en vivo, con licencia comercial clara y mejor resolución que
 * la fuente global, se usa ése; si no responde o no tiene dato, queda POWER.
 *
 * Acá la fuente regional no reemplaza a la global sino que la corrige. NASA
 * POWER trae una grilla de ~50 km pero es la única que da viento, y el viento
 * manda en cortinas, secado y confort. Daymet trae 1 km pero no mide viento. Así
 * que POWER arma la base y Daymet pisa lo que sí mide mejor: lluvia,
 * temperatura, radiación y humedad. Ver `fusionarDaymet` en `lib/clima.ts`.
 *
 * Cómo se agrega una fuente nueva:
 *   1. Agregar el id al tipo `FuenteRegionalClima`.
 *   2. Agregar su bbox acá (grueso está bien: si el servicio no tiene dato en el
 *      punto, el llamador se queda con POWER igual).
 *   3. Escribir `app/api/clima/<id>/route.ts` que devuelva `ClimaRegional`, y
 *      sumarla al bucle de `obtenerClima` en `lib/clima.ts`.
 *
 * Antes de agregar una: la licencia tiene que permitir uso comercial.
 */

export type FuenteRegionalClima = 'daymet';

interface Cobertura {
  fuente: FuenteRegionalClima;
  /** [oeste, sur, este, norte] */
  bbox: [number, number, number, number];
}

const COBERTURAS: Cobertura[] = [
  // Daymet V4 R1 (ORNL DAAC / NASA). Un solo rectángulo alcanza: va de las
  // Aleutianas a Terranova y del Ártico al sur de México, y de paso mete adentro
  // Hawái y Puerto Rico, que Daymet también cubre. Es grueso a propósito —hay
  // mucho océano ahí dentro— porque el costo de errarle es nulo: sobre agua el
  // servicio responde 400 ("Daymet Tile was not found") y el llamador se queda
  // con POWER. Probado: Iowa, Calgary, Oaxaca, Hawái, Alaska y Puerto Rico
  // devuelven dato; Mendoza queda afuera del bbox y ni se intenta.
  { fuente: 'daymet', bbox: [-179.0, 13.0, -52.0, 84.0] },
];

/**
 * Fuentes regionales cuyo bbox contiene el punto, en orden de preferencia y sin
 * repetir: una fuente con dos rectángulos que se solapan tiene que aparecer una
 * sola vez, porque el llamador la prueba en orden y reintentarla no da nada.
 */
export function fuentesRegionalesClima(lat: number, lng: number): FuenteRegionalClima[] {
  return [...new Set(
    COBERTURAS
      .filter(c => lng >= c.bbox[0] && lng <= c.bbox[2] && lat >= c.bbox[1] && lat <= c.bbox[3])
      .map(c => c.fuente),
  )];
}
