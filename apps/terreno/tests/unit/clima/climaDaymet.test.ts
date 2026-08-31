import { describe, it, expect, vi, afterEach } from 'vitest';
import { obtenerClima, fusionarDaymet, type MesDato, type MesDaymet } from '@/lib/clima';
import { fuentesRegionalesClima } from '@/lib/climaFuentes';

const MESES_KEY = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'] as const;

/**
 * Respuesta de NASA POWER con la forma real del endpoint de climatología.
 *
 * Los valores de enero son los que devuelve POWER de verdad para un punto en
 * Iowa: T2M −6,44 con T2M_MAX 12,92 y T2M_MIN −35,47. Esos dos últimos son los
 * récords históricos del mes, no la máxima y la mínima medias — el error que
 * este test existe para evitar que vuelva.
 */
function respuestaPower(over: Partial<Record<string, number>> = {}) {
  const porMes = <T,>(v: T) => Object.fromEntries(MESES_KEY.map(k => [k, v]));
  return {
    properties: {
      parameter: {
        PRECTOTCORR: porMes(2),          // mm/día
        T2M:         { ...porMes(10), JAN: over.T2M         ?? -6.44 },
        T2M_MAX:     { ...porMes(40), JAN: over.T2M_MAX     ?? 12.92 },
        T2M_MIN:     { ...porMes(-25), JAN: over.T2M_MIN    ?? -35.47 },
        T2M_RANGE:   { ...porMes(12), JAN: over.T2M_RANGE   ?? 9.12 },
        WS10M:       porMes(3),
        WD10M:       { ...porMes(180), ANN: 180 },
        RH2M:        porMes(70),
      },
    },
  };
}

function stubFetch(power: unknown, daymet?: unknown) {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => ({
    ok: true,
    status: 200,
    json: async () => (String(url).includes('/daymet') ? daymet ?? { sinDatos: true } : power),
  })));
}

afterEach(() => vi.unstubAllGlobals());

describe('temperaturas de NASA POWER', () => {
  it('deriva la máxima y la mínima medias de T2M y la amplitud, no de los récords', async () => {
    stubFetch(respuestaPower());
    const d = await obtenerClima(-32.9, -68.8);   // Mendoza: fuera de Daymet
    const ene = d.meses[0]!;
    // −6,44 ± 9,12/2 → −1,9 / −11,0, que es la realidad de un enero en Iowa.
    expect(ene.tmax_c).toBeCloseTo(-1.9, 1);
    expect(ene.tmin_c).toBeCloseTo(-11.0, 1);
    expect(ene.tmax_c).not.toBeCloseTo(12.92, 1);
    expect(ene.tmin_c).not.toBeCloseTo(-35.47, 1);
  });

  it('sin amplitud media se queda con los récords antes que quedarse sin dato', async () => {
    const p = respuestaPower();
    delete (p.properties.parameter as Record<string, unknown>).T2M_RANGE;
    stubFetch(p);
    const ene = (await obtenerClima(-32.9, -68.8)).meses[0]!;
    expect(ene.tmax_c).toBeCloseTo(12.9, 1);
  });

  it('la ETP baja al usar la amplitud media: los récords la inflaban ~1,7x', async () => {
    stubFetch(respuestaPower());
    const conRango = await obtenerClima(-32.9, -68.8);
    const p = respuestaPower();
    delete (p.properties.parameter as Record<string, unknown>).T2M_RANGE;
    stubFetch(p);
    const conRecords = await obtenerClima(-32.9, -68.8);
    expect(conRecords.etp_anual_mm / conRango.etp_anual_mm).toBeGreaterThan(1.5);
  });
});

describe('fuentesRegionalesClima', () => {
  it('Norteamérica continental, Hawái y Puerto Rico van a Daymet', () => {
    expect(fuentesRegionalesClima(41.9, -93.6)).toEqual(['daymet']);    // Iowa
    expect(fuentesRegionalesClima(51.05, -114.07)).toEqual(['daymet']); // Calgary
    expect(fuentesRegionalesClima(17.06, -96.72)).toEqual(['daymet']);  // Oaxaca
    expect(fuentesRegionalesClima(20.8, -156.3)).toEqual(['daymet']);   // Hawái
    expect(fuentesRegionalesClima(18.2, -66.5)).toEqual(['daymet']);    // Puerto Rico
  });

  it('fuera de Norteamérica no hay fuente regional y queda POWER', () => {
    expect(fuentesRegionalesClima(-32.9, -68.8)).toEqual([]);   // Mendoza
    expect(fuentesRegionalesClima(40.4, -3.7)).toEqual([]);     // Madrid
    expect(fuentesRegionalesClima(-3.1, -60.0)).toEqual([]);    // Manaos
  });
});

describe('fusionarDaymet', () => {
  const base: MesDato = {
    mes: 'Ene', precip_mm: 22, tmax_c: 13, tmin_c: -35, tmean_c: -6.4,
    etp_mm: 40, balance_mm: -18, viento_ms: 4.2,
    viento_dir: 'NO', viento_dir_deg: 315, viento_max_ms: 11,
    rh_pct: 70, rad_kwh: 2.1, t_range_c: 9.1,
  };
  const power = Array.from({ length: 12 }, () => ({ ...base }));
  const dm: MesDaymet = {
    precip_mm: 28.8, tmax_c: -1.6, tmin_c: -11.2, tmean_c: -6.4,
    t_range_c: 9.6, rad_kwh: 1.85, rh_pct: 74, rocio_c: -10.1,
  };
  const daymet = Array.from({ length: 12 }, () => ({ ...dm }));

  it('pisa lo que Daymet mide mejor', () => {
    const m = fusionarDaymet(41.9, power, daymet)[0]!;
    expect(m.precip_mm).toBe(28.8);
    expect(m.tmax_c).toBe(-1.6);
    expect(m.rad_kwh).toBe(1.85);
    expect(m.rh_pct).toBe(74);
  });

  it('deja intacto el viento, que Daymet no trae', () => {
    const m = fusionarDaymet(41.9, power, daymet)[0]!;
    expect(m.viento_ms).toBe(4.2);
    expect(m.viento_dir).toBe('NO');
    expect(m.viento_max_ms).toBe(11);
  });

  it('recalcula la ETP y el balance con las temperaturas nuevas', () => {
    const m = fusionarDaymet(41.9, power, daymet)[0]!;
    expect(m.etp_mm).not.toBe(40);
    expect(m.balance_mm).toBeCloseTo(m.precip_mm - m.etp_mm, 1);
  });

  it('vuelve a evaluar el riesgo de helada con la mínima media', () => {
    const templado = daymet.map(d => ({ ...d, tmin_c: 14 }));
    expect(fusionarDaymet(41.9, power, daymet)[0]!.helada_riesgo).toBe(true);
    expect(fusionarDaymet(41.9, power, templado)[0]!.helada_riesgo).toBe(false);
  });

  it('un mes que Daymet no devolvió queda como estaba', () => {
    const m = fusionarDaymet(41.9, power, daymet.slice(0, 6))[8]!;
    expect(m.precip_mm).toBe(22);
  });
});

describe('obtenerClima con Daymet disponible', () => {
  it('usa los meses de Daymet y lo declara en la fuente', async () => {
    const meses: MesDaymet[] = Array.from({ length: 12 }, () => ({
      precip_mm: 90, tmax_c: 20, tmin_c: 8, tmean_c: 14,
      t_range_c: 12, rad_kwh: 4.4, rh_pct: 68, rocio_c: 8.1,
    }));
    stubFetch(respuestaPower(), { meses, años: 30, fuente: 'Daymet V4 R1, celda de 1 km (promedio 1995–2024)' });
    const d = await obtenerClima(41.9, -93.6);
    expect(d.precip_anual_mm).toBe(1080);
    expect(d.fuente).toContain('Daymet');
    expect(d.fuente).toContain('viento de NASA POWER');
    expect(d.meses[0]!.viento_ms).toBe(3);   // sigue viniendo de POWER
  });

  it('si Daymet no tiene dato en el punto, se queda con POWER sin romperse', async () => {
    stubFetch(respuestaPower(), { sinDatos: true });
    const d = await obtenerClima(41.9, -93.6);
    expect(d.fuente).toContain('NASA POWER');
    expect(d.fuente).not.toContain('Daymet');
  });
});
