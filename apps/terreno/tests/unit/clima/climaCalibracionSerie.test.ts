/**
 * La calibración tiene que llegar a la serie diaria —y tiene que frenar justo
 * antes de la tormenta de diseño.
 *
 * El predio de prueba de Traslasierra es el caso que destapó esto: la
 * climatología da 595 mm/año y la serie diaria de ERA5 da 943 mm/año sobre el
 * mismo punto, un 58 % de diferencia. Hasta el 10/10/2026 cargar el total de un
 * pluviómetro corregía sólo la climatología, así que la discrepancia no se
 * cerraba por más dato local que se tuviera.
 *
 * Lo que estos tests fijan no es «se multiplica»: es el recorte. El escalado
 * lineal corrige la media y no la distribución (Teutschbein & Seibert, 2012),
 * así que la tormenta de diseño queda afuera. Un test que sólo verificara el
 * producto dejaría pasar justo el error que importa.
 */
import { describe, it, expect } from 'vitest';
import {
  FACTOR_MAX, calibrarExtremos, mediaMensualDeSerie, objetivoAnual,
} from '../../../lib/climaCalibracionSerie';
import type { Extremos, SerieDekadalPorAnio } from '../../../lib/climaExtremos';
import type { CalibracionPrecip } from '../../../lib/clima';

/** mm por mes del predio de Traslasierra, tal como los da la serie de ERA5. */
const MES_SERIE = [160, 140, 120, 55, 25, 12, 10, 12, 35, 95, 130, 149];
const SERIE_ANUAL = MES_SERIE.reduce((a, b) => a + b, 0);  // 943

/** Tres años iguales: lo que importa acá es el reparto, no la variabilidad. */
function dekadal(mesMm: number[] = MES_SERIE): SerieDekadalPorAnio {
  const fila = Array.from({ length: 36 }, (_, d) => (mesMm[Math.floor(d / 3)] ?? 0) / 3);
  return {
    anios:  [2021, 2022, 2023],
    precip: [fila, fila, fila],
    etp:    [fila.map(() => 4), fila.map(() => 4), fila.map(() => 4)],
    tmean:  [fila.map(() => 17), fila.map(() => 17), fila.map(() => 17)],
  };
}

function extremos(over: Partial<Extremos> = {}): Extremos {
  return {
    fuente:      'Open-Meteo / ERA5 (reanálisis, ~10 km)',
    periodo:     '1991–2025',
    anios:       35,
    elevacion_m: 920,
    heladas: {
      hay_heladas: true, umbral_c: 0, dias_helada_anio: 18,
      ultima_helada: null, primera_helada: null, periodo_libre_dias: null,
    },
    tormenta: {
      metodo:              'Gumbel (momentos) sobre máximos anuales de P24h',
      p24h_max_registrada: 118.4,
      recurrencias: [
        { periodo_retorno: 2,   mm: 62.1 },
        { periodo_retorno: 10,  mm: 98.7 },
        { periodo_retorno: 100, mm: 151.3 },
      ],
    },
    sequia:       { racha_max_dias: 97, racha_anual_p50: 41, racha_anual_p90: 68 },
    precip_anual: { media_mm: SERIE_ANUAL, min_mm: 540, max_mm: 1480, cv_pct: 24 },
    et0_anual_mm: 1327,
    calor:        { dias_ge_35: 12.4, dias_ge_40: 0.6 },
    dekadal:      dekadal(),
    ...over,
  };
}

const pluviometro = (mm: number): CalibracionPrecip =>
  ({ modo: 'anual', anual_mm: mm, fuente: 'Estación Nono (INTA)', origen: 'manual' });

describe('objetivoAnual', () => {
  it('toma el total anual tal cual cuando el modo es anual', () => {
    expect(objetivoAnual(pluviometro(700))).toBe(700);
  });

  it('suma los doce cuando el modo es mensual, que es donde no hay anual', () => {
    const cal: CalibracionPrecip = { modo: 'mensual', mensual_mm: MES_SERIE.map(m => m * 0.8) };
    expect(objetivoAnual(cal)).toBeCloseTo(SERIE_ANUAL * 0.8, 6);
  });

  it('sin calibración no hay objetivo', () => {
    expect(objetivoAnual(null)).toBeNull();
    expect(objetivoAnual({ modo: 'anual' })).toBeNull();
  });
});

describe('mediaMensualDeSerie', () => {
  it('reconstruye el mes sumando sus tres décadas', () => {
    const m = mediaMensualDeSerie(dekadal());
    expect(m).not.toBeNull();
    for (let i = 0; i < 12; i++) expect(m![i]!).toBeCloseTo(MES_SERIE[i]!, 6);
  });

  it('sin dekadal no hay mensual — un Extremos viejo no la trae', () => {
    expect(mediaMensualDeSerie(undefined)).toBeNull();
  });
});

describe('calibrarExtremos · el factor es contra ESTA serie', () => {
  it('lleva la media anual exactamente al dato del pluviómetro', () => {
    const out = calibrarExtremos(extremos(), pluviometro(700))!;
    expect(out.precip_anual.media_mm).toBe(700);
    expect(out.calibracion_serie!.antes_mm).toBe(943);
    expect(out.calibracion_serie!.despues_mm).toBe(700);
  });

  it('NO usa el factor de la climatología: 700/943 = 0,74 y no 700/595 = 1,18', () => {
    const out = calibrarExtremos(extremos(), pluviometro(700))!;
    // Si alguien pasara el factor de la climatología, la serie terminaría en
    // 1.113 mm: más lejos del pluviómetro que antes de calibrar.
    expect(out.calibracion_serie!.factor_anual).toBeCloseTo(700 / 943, 3);
    expect(out.precip_anual.media_mm).toBeLessThan(943);
  });

  it('la dekadal calibrada suma el total nuevo, que es lo que lee el balance', () => {
    const out = calibrarExtremos(extremos(), pluviometro(700))!;
    const anual = out.dekadal!.precip[0]!.reduce((a, b) => a + b, 0);
    // Cada década se guarda con un decimal, así que el año puede correrse hasta
    // 36 × 0,05 = 1,8 mm. Sobre 700 mm es un 0,26 %: menos que el redondeo con
    // el que la propia serie viene de Open-Meteo.
    expect(Math.abs(anual - 700)).toBeLessThanOrEqual(2);
  });

  it('con calibración mensual cada mes llega a SU objetivo, no al promedio', () => {
    // Un reanálisis puede acertar el total y repartirlo mal: acá el año cierra
    // en el mismo número y la estación seca se corre de mes.
    const objetivo = [...MES_SERIE];
    objetivo[0] = 60;    // enero llovió mucho menos de lo que el modelo cree
    objetivo[5] = 112;   // y junio mucho más
    const cal: CalibracionPrecip = { modo: 'mensual', mensual_mm: objetivo };

    const out = calibrarExtremos(extremos(), cal)!;
    expect(out.calibracion_serie!.modo).toBe('mensual');

    const fila = out.dekadal!.precip[0]!;
    const mes = (m: number) => fila[m * 3]! + fila[m * 3 + 1]! + fila[m * 3 + 2]!;
    expect(mes(0)).toBeCloseTo(60, 0);
    expect(mes(5)).toBeCloseTo(112, 0);
    expect(mes(2)).toBeCloseTo(MES_SERIE[2]!, 0);
  });

  it('una calibración que sólo corre la estación seca NO se descarta por neutra', () => {
    // Este caso cierra el año en los mismos 943 mm, así que el factor anual es
    // exactamente 1. Mirando sólo el anual, la corrección más fina que alguien
    // puede cargar —en qué meses llueve— se perdía entera.
    const objetivo = [...MES_SERIE];
    objetivo[0] = 60;
    objetivo[5] = 112;
    const out = calibrarExtremos(extremos(), { modo: 'mensual', mensual_mm: objetivo })!;

    expect(out.calibracion_serie).toBeDefined();
    expect(out.calibracion_serie!.factor_anual).toBeCloseTo(1, 3);
    expect(out.precip_anual.media_mm).toBe(943);

    const fila = out.dekadal!.precip[0]!;
    expect(fila[0]! + fila[1]! + fila[2]!).toBeCloseTo(60, 0);

    const texto = out.calibracion_serie!.advertencias.join(' ');
    expect(texto).toContain('en qué meses llueve');
    expect(texto).not.toContain('del lado corto');
  });
});

describe('calibrarExtremos · lo que NO toca', () => {
  it('deja la tormenta de diseño intacta, que es con lo que se dimensiona obra', () => {
    const ex = extremos();
    const out = calibrarExtremos(ex, pluviometro(700))!;
    expect(out.tormenta).toEqual(ex.tormenta);
  });

  it('deja la racha seca intacta: escalar milímetros no seca ningún día', () => {
    const ex = extremos();
    const out = calibrarExtremos(ex, pluviometro(700))!;
    expect(out.sequia).toEqual(ex.sequia);
  });

  it('no toca la ETP ni las heladas ni el calor: no son lluvia', () => {
    const ex = extremos();
    const out = calibrarExtremos(ex, pluviometro(1400))!;
    expect(out.et0_anual_mm).toBe(ex.et0_anual_mm);
    expect(out.heladas).toEqual(ex.heladas);
    expect(out.calor).toEqual(ex.calor);
    expect(out.dekadal!.etp).toEqual(ex.dekadal!.etp);
  });

  it('preserva el CV, que es lo que el escalado lineal hace por construcción', () => {
    const ex = extremos();
    const out = calibrarExtremos(ex, pluviometro(700))!;
    expect(out.precip_anual.cv_pct).toBe(ex.precip_anual.cv_pct);
  });

  it('siempre avisa de la tormenta y de la racha, no sólo a veces', () => {
    const texto = calibrarExtremos(extremos(), pluviometro(700))!
      .calibracion_serie!.advertencias.join(' ');
    expect(texto).toContain('tormenta de diseño no se calibró');
    expect(texto).toContain('racha seca');
  });
});

describe('calibrarExtremos · de qué lado queda la tormenta', () => {
  it('con el dato local más lluvioso, la tormenta cruda queda CORTA y lo dice', () => {
    const texto = calibrarExtremos(extremos(), pluviometro(1200))!
      .calibracion_serie!.advertencias.join(' ');
    expect(texto).toContain('del lado corto');
    expect(texto).toContain('período de retorno siguiente');
  });

  it('con el dato local menos lluvioso, queda del lado prudente', () => {
    const texto = calibrarExtremos(extremos(), pluviometro(700))!
      .calibracion_serie!.advertencias.join(' ');
    expect(texto).toContain('lado prudente');
    expect(texto).not.toContain('del lado corto');
  });

  it('un factor fuera de banda no es un sesgo: es otro régimen, y avisa', () => {
    const texto = calibrarExtremos(extremos(), pluviometro(Math.round(SERIE_ANUAL * (FACTOR_MAX + 0.5))))!
      .calibracion_serie!.advertencias.join(' ');
    expect(texto).toContain('fuera de la banda');
    expect(texto).toContain('mismo régimen');
  });
});

describe('calibrarExtremos · los casos en que se devuelve intacto', () => {
  it('sin calibración no cambia nada', () => {
    const ex = extremos();
    expect(calibrarExtremos(ex, null)).toBe(ex);
  });

  it('no calibra dos veces: encadenar duplicaría el factor en silencio', () => {
    const una = calibrarExtremos(extremos(), pluviometro(700))!;
    const dos = calibrarExtremos(una, pluviometro(700))!;
    expect(dos).toBe(una);
    expect(dos.precip_anual.media_mm).toBe(700);
  });

  it('una corrección del 1 % no cambia ninguna decisión y no se aplica', () => {
    const ex = extremos();
    expect(calibrarExtremos(ex, pluviometro(Math.round(SERIE_ANUAL * 1.01)))).toBe(ex);
  });

  it('sin dekadal todavía corrige el total, que es lo que se puede corregir', () => {
    const ex = extremos({ dekadal: undefined });
    const out = calibrarExtremos(ex, pluviometro(700))!;
    expect(out.precip_anual.media_mm).toBe(700);
    expect(out.dekadal).toBeUndefined();
    // Sin dekadal no hay mensual contra el que sacar doce cocientes.
    expect(out.calibracion_serie!.modo).toBe('anual');
  });

  it('una serie en cero no tiene cociente', () => {
    const ex = extremos({ precip_anual: { media_mm: 0, min_mm: 0, max_mm: 0, cv_pct: 0 } });
    expect(calibrarExtremos(ex, pluviometro(700))).toBe(ex);
  });
});
