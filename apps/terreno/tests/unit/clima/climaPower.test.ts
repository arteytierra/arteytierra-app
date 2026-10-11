/**
 * Lo que `obtenerClima` hace con la respuesta cruda de NASA POWER.
 *
 * Acá se fija la UNIDAD de la radiación, que es donde la app se equivocaba en
 * silencio: el endpoint de climatología publica `ALLSKY_SFC_SW_DWN` en
 * **MJ/m²/día** —lo dice el propio bloque `parameters.units` de la respuesta— y
 * el campo de `DatosClima` es kWh/m²/día. Sin el factor 3,6 el panel imprimía
 * 19,42 donde el lugar recibe 5,39, y el error es invisible porque las dos
 * unidades dan números de dos cifras.
 *
 * El test no compara contra un número elegido a mano: compara contra el techo
 * físico. Ninguna superficie puede recibir más radiación que la que entra arriba
 * de la atmósfera, y esa cota la calcula la propia app en `lib/solar.ts`. Con el
 * bug, diciembre daba 7,79 kWh/m²/día bien y 28,04 mal contra un tope de 11,7:
 * la cuenta mal no sólo era alta, era imposible.
 *
 * Los doce valores de POWER son los reales del punto (-31,79 · -65,03), Nono,
 * Córdoba, consultados el 09/10/2026.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { obtenerClima, MJ_POR_KWH } from '@/lib/clima';
import { calcularSolar } from '@/lib/solar';

const LAT = -31.79;
const LNG = -65.03;

/** ALLSKY_SFC_SW_DWN real de POWER para el punto, en MJ/m²/día. */
const RAD_MJ: Record<string, number> = {
  JAN: 27.21, FEB: 23.66, MAR: 19.61, APR: 14.68, MAY: 11.33, JUN: 10.46,
  JUL: 11.69, AUG: 15.58, SEP: 19.88, OCT: 23.77, NOV: 27.09, DEC: 28.04,
  ANN: 19.4,
};

const MESES_KEY = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'] as const;

/** Un parámetro mensual constante, con la clave ANN que POWER también manda. */
function plano(v: number): Record<string, number> {
  const o: Record<string, number> = { ANN: v };
  for (const k of MESES_KEY) o[k] = v;
  return o;
}

function respuestaPower() {
  return {
    geometry: { coordinates: [LNG, LAT, 1151.0] },
    properties: {
      parameter: {
        PRECTOTCORR:       plano(2),
        T2M:               plano(15),
        T2M_RANGE:         plano(14),
        WS10M:             plano(3),
        WD10M:             plano(45),
        RH2M:              plano(62),
        ALLSKY_SFC_SW_DWN: RAD_MJ,
      },
    },
  };
}

/** POWER contesta con el payload de arriba; el mapa de Köppen dice «sin dato». */
function mockearFetch() {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    if (String(url).includes('/api/clima/koppen')) {
      return new Response(JSON.stringify({ sinDatos: true }), { status: 200 });
    }
    return new Response(JSON.stringify(respuestaPower()), { status: 200 });
  }));
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('radiación de NASA POWER', () => {
  it('LLEGA EN MJ Y SE GUARDA EN kWh: SON 3,6 VECES Y NO SE NOTAN', async () => {
    mockearFetch();
    const d = await obtenerClima(LAT, LNG);

    // 19,4 MJ/m²/día son 5,39 kWh/m²/día. Lo que se imprimía era el 19,4.
    // El anual de acá es el promedio de los doce meses, no la clave ANN que
    // POWER manda aparte; coinciden en la primera decimal y eso es todo lo que
    // este número tiene de precisión.
    expect(d.rad_anual_kwh).toBeCloseTo(RAD_MJ['ANN']! / MJ_POR_KWH, 1);
    expect(d.rad_anual_kwh).toBeLessThan(10);

    const dic = d.meses[11]!;
    expect(dic.rad_kwh).toBeCloseTo(RAD_MJ['DEC']! / MJ_POR_KWH, 2);
  });

  it('NINGÚN MES PASA EL TECHO DE ARRIBA DE LA ATMÓSFERA', async () => {
    mockearFetch();
    const d = await obtenerClima(LAT, LNG);
    const solar = calcularSolar(LAT, LNG);

    // La radiación que llega al suelo no puede superar la extraterrestre del
    // mismo mes. Es la comprobación que delata una unidad cambiada sin tener
    // que saber cuánto «debería» dar el lugar.
    d.meses.forEach((m, i) => {
      const ra_mj = solar.meses[i]!.radiacion_mj;
      expect(m.rad_kwh! * MJ_POR_KWH).toBeLessThan(ra_mj);
    });
  });
});
