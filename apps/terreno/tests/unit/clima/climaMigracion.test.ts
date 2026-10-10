/**
 * Lo ya guardado también tiene que salir bien.
 *
 * El 09/10/2026 se arregló el camino de entrada de NASA POWER, que guardaba
 * `ALLSKY_SFC_SW_DWN` tal como viene —MJ/m²/día— en un campo que es kWh/m²/día.
 * Arreglar la entrada no arregla lo guardado: el clima viaja dentro de
 * `metadatos` del proyecto y no se vuelve a pedir nunca. El informe del predio
 * de prueba seguía imprimiendo 19,42 kWh/m²/día después del arreglo.
 *
 * El criterio para decidir que un número está en MJ no es un umbral a ojo: es
 * el mismo techo físico con el que se testea la conversión. Al suelo no le
 * puede llegar más radiación que la que hay arriba de la atmósfera.
 */
import { describe, it, expect } from 'vitest';
import { migrarRadiacionClima } from '../../../lib/climaMigracion';
import { MESES, MJ_POR_KWH, type DatosClima, type MesDato } from '../../../lib/clima';
import { calcularSolar } from '../../../lib/solar';

const LAT = -31.789;
const LNG = -65.030;

/** Los doce ALLSKY_SFC_SW_DWN que POWER devuelve para ese punto, en MJ/m²/día. */
const ALLSKY_MJ = [27.21, 24.53, 20.86, 16.22, 12.69, 11.11, 11.9, 15.31, 19.61, 23.43, 26.48, 28.04];

function clima(radPorMes: number[]): DatosClima {
  const meses: MesDato[] = MESES.map((mes, i) => ({
    mes,
    precip_mm: 50,
    etp_mm:    100,
    balance_mm: -50,
    tmean_c:   16,
    tmax_c:    24,
    tmin_c:     8,
    rad_kwh:   radPorMes[i],
  } as MesDato));
  return {
    lat: LAT, lng: LNG,
    precip_anual_mm: 600, etp_anual_mm: 1200, tmean_anual_c: 16,
    viento_dir_ppal: 'NE',
    meses,
    fuente: 'NASA POWER',
    weather_spark_url: '',
    rad_anual_kwh: Math.round((radPorMes.reduce((a, b) => a + b, 0) / 12) * 100) / 100,
  };
}

describe('la radiación de un proyecto guardado antes del arreglo', () => {
  it('SE CONVIERTE, PORQUE NINGÚN MES PUEDE SUPERAR LA RADIACIÓN DE ARRIBA DE LA ATMÓSFERA', () => {
    const guardado = clima(ALLSKY_MJ);
    const solar = calcularSolar(LAT, LNG);
    // Diciembre: 28,04 contra un techo extraterrestre de ~11,7 kWh/m²/día. No
    // era un valor alto, era imposible.
    expect(guardado.meses[11]!.rad_kwh!).toBeGreaterThan(solar.meses[11]!.radiacion_mj / MJ_POR_KWH);

    const migrado = migrarRadiacionClima(guardado);
    expect(migrado.meses[11]!.rad_kwh!).toBeCloseTo(28.04 / MJ_POR_KWH, 2);
    expect(migrado.rad_anual_kwh!).toBeCloseTo(guardado.rad_anual_kwh! / MJ_POR_KWH, 2);
    // Y ahora todos los meses caben debajo del techo.
    for (const [i, m] of migrado.meses.entries()) {
      expect(m.rad_kwh!).toBeLessThan(solar.meses[i]!.radiacion_mj / MJ_POR_KWH);
    }
  });

  it('Y UNO QUE YA ESTÁ EN kWh NO SE TOCA: DIVIDIRLO DE NUEVO SERÍA EL MISMO ERROR AL REVÉS', () => {
    const bueno = clima(ALLSKY_MJ.map(v => v / MJ_POR_KWH));
    const migrado = migrarRadiacionClima(bueno);
    expect(migrado).toBe(bueno);
  });

  it('SIN CLIMA NO HAY NADA QUE MIGRAR', () => {
    expect(migrarRadiacionClima(null)).toBeNull();
    expect(migrarRadiacionClima(undefined)).toBeUndefined();
  });
});
