import { describe, it, expect } from 'vitest';
import {
  CONCENTRACION_MINIMA,
  rosaDelViento,
  rumboDeAzimut,
  azimutDeRumbo,
  trimestreMasFrio,
  vientoDeLaEstacionFria,
  type MesViento,
} from '@/lib/viento';

/*
 * De dónde sopla, y contra qué se pone la cortina.
 *
 * Hasta el 30/10/2026 lo decidía una línea en `cortinas.ts`:
 *
 *     return latCentro < 0 ? 180 : 0;   // el aire frío viene del polo
 *
 * Los tres predios de abajo son climatologías reales de NASA POWER (WD10M,
 * WS10M y T2M; serie 2001–2025, celda de ~0,5°), consultadas el 30/10/2026, y
 * los tres contradicen esa línea: 51° de error en Chiapas, 136° en Córdoba y
 * 136° en Ámsterdam. No es un ajuste fino. Es la cortina del otro lado de la
 * casa.
 *
 * Lo que este archivo protege:
 *   - que una dirección se promedie por vectores y no sumando grados;
 *   - que el trimestre más frío se encuentre en los dos hemisferios y en el
 *     trópico, sin preguntar en qué hemisferio está el predio;
 *   - que una rosa partida se denuncie en vez de resolverse con un promedio
 *     que apunta a donde no sopla nada;
 *   - y que sin dato no haya respuesta.
 */

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/** Doce meses a partir de las tres tiras de POWER. */
function serie(dir: number[], vel: number[], t: number[]): MesViento[] {
  return MESES.map((mes, i) => ({
    mes,
    viento_dir_deg: dir[i]!,
    viento_ms: vel[i]!,
    tmean_c: t[i]!,
  }));
}

/**
 * 17,33° N · 92,19° O — Chiapas, el predio de los videos de la vidriera.
 * El viento entra por el cuadrante NE–E los doce meses: del norte, que es lo
 * que devolvía el modelo, no sopla nunca.
 */
const CHIAPAS = serie(
  [49.3, 49.1, 47.1, 36.5, 43.9, 67.4, 81.6, 71.1, 52.9, 36.8, 45.3, 54.9],
  [2.49, 2.46, 2.43, 2.27, 2.27, 2.37, 2.72, 2.40, 2.14, 2.28, 2.44, 2.38],
  [20.24, 21.73, 23.68, 26.82, 27.69, 26.16, 25.67, 25.64, 25.20, 23.91, 21.87, 20.97],
);

/**
 * 31,40° S · 64,20° O — Córdoba. La rosa del año está partida en dos: NE en
 * verano y NO en invierno. El modelo decía S; la serie dice NO.
 */
const CORDOBA = serie(
  [46.5, 48.8, 35.6, 13.2, 336.6, 305.2, 304.3, 334.6, 36.4, 59.1, 52.4, 51.7],
  [2.17, 2.03, 2.02, 2.05, 2.08, 2.28, 2.46, 2.74, 2.77, 2.74, 2.65, 2.36],
  [23.24, 21.86, 19.74, 16.45, 12.75, 10.27, 9.64, 11.93, 14.63, 18.04, 20.65, 22.50],
);

/**
 * 52,37° N · 4,90° E — Ámsterdam. El modelo decía N; la serie dice SO, y con
 * 6,5 m/s de media en el trimestre frío, el doble que en los otros dos.
 */
const AMSTERDAM = serie(
  [225.8, 224.1, 237.0, 274.6, 294.8, 278.7, 258.8, 247.9, 250.9, 208.3, 217.9, 223.0],
  [6.68, 6.37, 5.89, 5.09, 5.17, 4.82, 4.71, 4.77, 5.06, 5.83, 5.93, 6.37],
  [3.50, 3.47, 5.56, 9.15, 12.66, 15.80, 17.93, 17.97, 15.35, 11.59, 7.66, 4.61],
);

/** El modelo que había antes, para medir contra qué se compara. */
const modeloViejo = (lat: number) => (lat < 0 ? 180 : 0);

/** Separación angular entre dos azimuts, de 0 a 180. */
function separacion(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360 + 360) % 360);
  return Math.min(d, 360 - d);
}

describe('la rosa de 16 puntas', () => {
  it('cae en la punta más cercana y da la vuelta por el norte', () => {
    expect(rumboDeAzimut(0)).toBe('N');
    expect(rumboDeAzimut(45)).toBe('NE');
    expect(rumboDeAzimut(115.9)).toBe('ESE');
    expect(rumboDeAzimut(359)).toBe('N');
    expect(rumboDeAzimut(361)).toBe('N');
    expect(rumboDeAzimut(-90)).toBe('O');
  });

  it('va y vuelve de rumbo a azimut sin perder nada en las 16 puntas', () => {
    for (let i = 0; i < 16; i++) {
      const az = i * 22.5;
      expect(azimutDeRumbo(rumboDeAzimut(az))).toBe(az);
    }
  });

  it('un texto que no es un rumbo devuelve null y no el norte', () => {
    // El `?? 0` de antes convertía cualquier basura en «viento del norte».
    expect(azimutDeRumbo('NNN')).toBeNull();
    expect(azimutDeRumbo('')).toBeNull();
    expect(azimutDeRumbo('ne')).toBe(45);
  });
});

describe('promediar direcciones', () => {
  it('350° y 10° dan el norte, no el sur', () => {
    // El caso resuelto a mano: la media aritmética de 350 y 10 es 180, que es
    // la dirección exactamente opuesta a la verdadera. La vectorial da 0.
    const dos: MesViento[] = [
      { mes: 'uno', viento_dir_deg: 350, viento_ms: 3, tmean_c: 10 },
      { mes: 'dos', viento_dir_deg: 10, viento_ms: 3, tmean_c: 10 },
    ];
    const r = rosaDelViento(dos)!;
    expect(r.az_deg).toBe(0);
    expect(r.rumbo).toBe('N');
    // R̄ de dos direcciones a ±10° de la media es cos 10° = 0,985.
    expect(r.concentracion).toBeCloseTo(0.985, 3);
    expect(r.disperso).toBe(false);
    expect(r.estadistico).toBe('vectorial');
  });

  it('pesa por velocidad: el mes que sopla fuerte tira la media hacia su lado', () => {
    const r = rosaDelViento([
      { mes: 'calmo', viento_dir_deg: 0, viento_ms: 1, tmean_c: 10 },
      { mes: 'fuerte', viento_dir_deg: 90, viento_ms: 9, tmean_c: 10 },
    ])!;
    // Sin peso daría 45°. Con peso, atan2(9, 1) = 83,7°.
    expect(r.az_deg).toBeCloseTo(83.7, 1);
  });

  it('sin velocidades usables cada mes vota una vez', () => {
    const r = rosaDelViento([
      { mes: 'uno', viento_dir_deg: 0, viento_ms: 0, tmean_c: 10 },
      { mes: 'dos', viento_dir_deg: 90, viento_ms: 0, tmean_c: 10 },
    ])!;
    expect(r.az_deg).toBeCloseTo(45, 1);
  });

  it('sin ninguna dirección no hay rosa', () => {
    expect(rosaDelViento([])).toBeNull();
    expect(rosaDelViento([{ mes: 'uno', viento_ms: 4, tmean_c: 10 }])).toBeNull();
  });
});

describe('una rosa partida se denuncia', () => {
  const partida: MesViento[] = [
    ...Array.from({ length: 6 }, (_, i) => ({ mes: `e${i}`, viento_dir_deg: 90, viento_ms: 4, tmean_c: 10 })),
    ...Array.from({ length: 6 }, (_, i) => ({ mes: `o${i}`, viento_dir_deg: 270, viento_ms: 4, tmean_c: 10 })),
  ];

  it('seis meses del E y seis del O no promedian al norte', () => {
    const r = rosaDelViento(partida)!;
    // Los vectores se cancelan: R̄ = 0. `atan2(0, 0)` daría 0°, o sea el norte,
    // que es la única dirección por la que no sopló nunca.
    expect(r.concentracion).toBe(0);
    expect(r.disperso).toBe(true);
    expect(r.estadistico).toBe('modal');
    expect([90, 270]).toContain(r.az_deg);
  });

  it('el umbral corresponde a dos lados separados 97°', () => {
    const sep = (grados: number): number => rosaDelViento([
      { mes: 'uno', viento_dir_deg: -grados / 2, viento_ms: 4, tmean_c: 10 },
      { mes: 'dos', viento_dir_deg: grados / 2, viento_ms: 4, tmean_c: 10 },
    ])!.concentracion;
    expect(sep(96)).toBeGreaterThan(CONCENTRACION_MINIMA);
    expect(sep(98)).toBeLessThan(CONCENTRACION_MINIMA);
  });
});

describe('el trimestre más frío', () => {
  it('cruza el fin de año cuando hace falta', () => {
    // Chiapas y Ámsterdam: diciembre, enero, febrero. Los índices salen en ese
    // orden circular, empezando por diciembre.
    expect(trimestreMasFrio(CHIAPAS)).toEqual([11, 0, 1]);
    expect(trimestreMasFrio(AMSTERDAM)).toEqual([11, 0, 1]);
  });

  it('en el hemisferio sur cae en el medio del año, sin preguntar el hemisferio', () => {
    expect(trimestreMasFrio(CORDOBA)).toEqual([5, 6, 7]);
  });

  it('con menos de tres meses devuelve los que haya', () => {
    expect(trimestreMasFrio([{ tmean_c: 5 }, { tmean_c: 9 }])).toEqual([0, 1]);
    expect(trimestreMasFrio([])).toEqual([]);
  });
});

describe('el viento de la estación fría, en tres predios medidos', () => {
  it('Chiapas: NE, y el modelo por hemisferio apuntaba a donde no sopla nunca', () => {
    const r = vientoDeLaEstacionFria(CHIAPAS)!;
    expect(r.periodo).toBe('trimestre_frio');
    expect(r.meses).toEqual(['Dic', 'Ene', 'Feb']);
    expect(r.az_deg).toBeCloseTo(51.1, 1);
    expect(r.rumbo).toBe('NE');
    expect(r.disperso).toBe(false);
    // El modelo decía N (0°) y ningún mes del año se acerca: el más cercano al
    // norte está a 36,5°.
    expect(separacion(r.az_deg, modeloViejo(17.33))).toBeCloseTo(51.1, 1);
    const masCercaDelNorte = Math.min(
      ...CHIAPAS.map(m => separacion(m.viento_dir_deg!, 0)),
    );
    expect(masCercaDelNorte).toBeCloseTo(36.5, 1);
  });

  it('Córdoba: NO en el trimestre frío, 136° del S que decía el modelo', () => {
    const r = vientoDeLaEstacionFria(CORDOBA)!;
    expect(r.meses).toEqual(['Jun', 'Jul', 'Ago']);
    expect(r.az_deg).toBeCloseTo(315.6, 1);
    expect(r.rumbo).toBe('NO');
    expect(separacion(r.az_deg, modeloViejo(-31.4))).toBeCloseTo(135.6, 1);
  });

  it('Córdoba: el año no sirve para esta pregunta, y la concentración lo avisa', () => {
    // Dos regímenes en el mismo predio. El anual da NNE, que es el verano; la
    // cortina se diseña para el invierno, que entra del NO. 63° de diferencia.
    const anual = rosaDelViento(CORDOBA)!;
    const fria = vientoDeLaEstacionFria(CORDOBA)!;
    expect(anual.rumbo).toBe('NNE');
    expect(anual.concentracion).toBeCloseTo(0.754, 3);
    expect(anual.concentracion).toBeLessThan(
      rosaDelViento(CHIAPAS)!.concentracion,
    );
    expect(separacion(anual.az_deg, fria.az_deg)).toBeCloseTo(62.9, 1);
  });

  it('Ámsterdam: SO, 136° del N que decía el modelo, y el viento más fuerte de los tres', () => {
    const r = vientoDeLaEstacionFria(AMSTERDAM)!;
    expect(r.meses).toEqual(['Dic', 'Ene', 'Feb']);
    expect(r.az_deg).toBeCloseTo(224.3, 1);
    expect(r.rumbo).toBe('SO');
    expect(separacion(r.az_deg, modeloViejo(52.37))).toBeCloseTo(135.7, 1);
    const velFria = [11, 0, 1].reduce((s, i) => s + AMSTERDAM[i]!.viento_ms, 0) / 3;
    expect(velFria).toBeCloseTo(6.5, 1);
  });

  it('cae al año entero, y lo dice, cuando los meses fríos no traen dirección', () => {
    const sinFrios = CHIAPAS.map((m, i) =>
      [11, 0, 1].includes(i) ? { ...m, viento_dir_deg: undefined } : m);
    const r = vientoDeLaEstacionFria(sinFrios)!;
    expect(r.periodo).toBe('anual');
    expect(r.n).toBe(9);
  });

  it('sin ninguna dirección no contesta nada, en vez de contestar el polo', () => {
    const sinViento = CHIAPAS.map(m => ({ ...m, viento_dir_deg: undefined }));
    expect(vientoDeLaEstacionFria(sinViento)).toBeNull();
    expect(vientoDeLaEstacionFria([])).toBeNull();
  });
});
