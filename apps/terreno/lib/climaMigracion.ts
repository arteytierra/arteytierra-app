/**
 * Lo que hay que corregirle a un clima guardado antes de mostrarlo.
 *
 * Vive aparte de `clima.ts` porque la corrección se decide contra el techo
 * físico que calcula `solar.ts`, y `solar.ts` ya importa de `clima.ts`: ponerla
 * ahí sería un ciclo.
 *
 * El caso que la trajo: hasta el 09/10/2026 el camino de NASA POWER guardaba
 * `ALLSKY_SFC_SW_DWN` tal como viene —MJ/m²/día, lo declara el propio
 * `parameters.units` de la respuesta— en un campo que es kWh/m²/día. Arreglar
 * el camino de entrada no arregla lo ya guardado: el clima viaja dentro de
 * `metadatos` del proyecto y no se vuelve a pedir, así que un proyecto de
 * septiembre sigue imprimiendo 19,42 kWh/m²/día donde el lugar recibe 5,4, en
 * el panel y en el informe que se comparte por link.
 */
import type { DatosClima } from './clima';
import { MJ_POR_KWH } from './clima';
import { calcularSolar } from './solar';

/**
 * El criterio no es un umbral elegido a ojo sino el mismo con el que se testea
 * la conversión: **al suelo no puede llegar más radiación que la que hay arriba
 * de la atmósfera**. La extraterrestre de cada mes en ese punto la calcula
 * `solar.ts` en MJ/m²/día; pasada a kWh es el techo de lo que puede valer el
 * campo. Un mes por encima de ese techo no es un valor alto: es imposible, y la
 * única explicación es que el número esté en MJ.
 *
 * Se decide una vez para todo el registro y se convierte entero. Mezclar meses
 * convertidos con meses sin convertir sería peor que el error original.
 *
 * El margen de 1,02 es para no tocar un dato legítimo que roce el techo por el
 * redondeo de las dos cuentas: la diferencia real que se busca es de 3,6 veces.
 */
export function migrarRadiacionClima<T extends DatosClima | null | undefined>(datos: T): T {
  if (!datos || !Array.isArray(datos.meses)) return datos;

  const solar = calcularSolar(datos.lat, datos.lng);
  const enMJ = datos.meses.some((m, i) => {
    const rad = m?.rad_kwh;
    const techoMJ = solar.meses[i]?.radiacion_mj;
    if (typeof rad !== 'number' || !Number.isFinite(rad) || !techoMJ) return false;
    return rad > (techoMJ / MJ_POR_KWH) * 1.02;
  });
  if (!enMJ) return datos;

  const redondear = (v: number) => Math.round((v / MJ_POR_KWH) * 100) / 100;
  return {
    ...datos,
    meses: datos.meses.map(m => (
      typeof m?.rad_kwh === 'number' && Number.isFinite(m.rad_kwh)
        ? { ...m, rad_kwh: redondear(m.rad_kwh) }
        : m
    )),
    rad_anual_kwh: typeof datos.rad_anual_kwh === 'number' && Number.isFinite(datos.rad_anual_kwh)
      ? redondear(datos.rad_anual_kwh)
      : datos.rad_anual_kwh,
  };
}
