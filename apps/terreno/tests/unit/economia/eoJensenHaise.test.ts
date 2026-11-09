/**
 * Los dos casos resueltos de la `Eo` de Jensen-Haise, y las degradaciones.
 *
 * El primero no necesita ninguna serie: el apéndice C del informe del USBR
 * publica altitud, `CsubT` y `TsubX` de setenta estaciones, y `CT` y `Tx` están
 * atados por `e2 − e1`, así que de la altitud y de `Tx` sale `CT` sin ningún
 * grado de libertad.
 *
 * El segundo son dos temporadas de la Tabla 1 de Wight y Hanks con la serie de
 * ERA5 del mismo sitio: la mejor de las doce y la peor, para que el test no se
 * lleve sólo la que le conviene.
 */
import { describe, it, expect } from 'vitest';
import {
  saturacionMb, coeficientesEo, eoJensenHaiseMm, normalesDelMesMasCalido,
  coeficientesDeLaSerie, serieDeEo,
  COEFICIENTES_DE_1963, MJ_POR_LANGLEY, RANGO_DE_ALTITUD, RANGO_DE_ARIDEZ, ANIOS_PARA_LAS_NORMALES,
  ADVERTENCIAS_EO, LAS_DOS_MITADES_DEL_ERROR_DE_LA_EO, AVISO_EO_JENSEN_HAISE, FUENTES_EO,
  type DiaConRadiacion,
} from '@/lib/eoJensenHaise';
import { B_PRADERA_MIXTA } from '@/lib/forrajeBalance';

/**
 * `CLIMAT.DAT`, apéndice C de «Computation of the 1982 Kimberly-Penman and the
 * Jensen-Haise Evapotranspiration Equations as Applied in the U.S. Bureau of
 * Reclamation's Pacific Northwest AgriMet Program» (Dockter 1994, rev. 2008).
 *
 * `[estación, altitud en m, CsubT, TsubX en °F]`. Las que traen `CsubT = 0` no
 * tenían Jensen-Haise configurado.
 */
const CLIMAT_DAT: Array<[string, number, number, number]> = [
  ['LIDW', 497.0, 0.0115, 19.3], ['HERO', 199.0, 0.0115, 19.2], ['MALI', 1345.0, 0.0139, 15.0],
  ['ODSW', 503.0, 0.0113, 19.8], ['MRSO', 744.0, 0.0114, 19.3], ['COVM', 1096.0, 0.0122, 17.9],
  ['OMAW', 376.0, 0.0114, 19.4], ['CHVO', 1329.0, 0.0121, 17.8], ['CEDC', 1402.0, 0.0124, 17.4],
  ['BANO', 24.0, 0.0061, 25.7], ['PMAI', 703.0, 0.0122, 18.0], ['GERW', 351.0, 0.0111, 20.2],
  ['GOLW', 512.0, 0.0113, 19.6], ['LEGW', 259.0, 0.0111, 20.2], ['HOXO', 171.0, 0.01, 22.2],
  ['HRHW', 274.0, 0.0115, 19.4], ['AHTI', 1615.0, 0.0131, 16.2], ['RXGI', 1486.0, 0.0131, 6.3],
  ['FAFI', 1536.0, 0.0139, 15.1], ['AFTY', 1893.0, 0.0147, 14.1], ['RPTI', 1266.0, 0.0137, 15.3],
  ['ECHO', 232.0, 0.0116, 19.0], ['HRMO', 203.0, 0.0116, 19.0], ['LAKO', 1436.0, 0.0135, 15.7],
  ['CRSM', 899.0, 0.0121, 18.2], ['RDBM', 927.0, 0.0121, 18.1], ['PCYO', 1144.0, 0.0121, 18.0],
  ['MDFO', 408.0, 0.0116, 19.0], ['CRVO', 70.0, 0.0105, 21.4], ['TWFI', 1194.0, 0.0129, 16.6],
  ['ABEI', 1332.0, 0.013, 16.5], ['SIGM', 895.5, 0.0121, 18.1], ['FOGO', 54.8, 0.0108, 21.0],
  ['ONTO', 688.0, 0.0122, 18.0], ['GDVI', 786.0, 0.0122, 18.0], ['FTHI', 1354.0, 0.013, 16.5],
  ['GFRI', 921.4, 0.0122, 18.0], ['PICI', 1485.0, 0.0139, 15.1], ['POBO', 974.7, 0.0125, 17.5],
  ['MASW', 600.6, 0.012, 18.3], ['IMBO', 837.6, 0.0124, 17.5], ['BOII', 828.5, 0.0122, 18.0],
  ['NMPI', 802.8, 0.0122, 18.0], ['HRFO', 1158.0, 0.0124, 17.5], ['DRLM', 1418.0, 0.0124, 17.5],
  ['ARAO', 42.4, 0.0108, 21.0], ['KFLO', 1249.7, 0.0135, 15.7], ['BRKO', 24.0, 0.0061, 25.7],
  ['WRDO', 1249.7, 0.0135, 15.7], ['AGKO', 1249.7, 0.0135, 15.7], ['LORO', 1268.0, 0.0135, 15.7],
  ['FALN', 1208.5, 0.0, 0.0], ['BKVO', 1042.4, 0.0, 0.0], ['EURN', 1797.4, 0.0, 0.0],
  ['BNDW', 24.1, 0.0, 0.0], ['CJDW', 304.0, 0.0, 0.0], ['GCDW', 404.0, 0.0, 0.0],
  ['SBMW', 419.0, 0.0, 0.0], ['KFLW', 407.0, 0.0, 0.0], ['LBRW', 192.0, 0.0, 0.0],
  ['DENI', 506.0, 0.0, 0.0], ['SILW', 251.0, 0.0, 0.0], ['DTRO', 502.9, 0.0, 0.0],
  ['HCKO', 438.9, 0.0, 0.0], ['LKPO', 283.5, 0.0, 0.0], ['BEWO', 1104.9, 0.0, 0.0],
  ['PNGO', 189.0, 0.0, 0.0], ['DEFO', 384.0, 0.0, 0.0], ['BATO', 1317.0, 0.0, 0.0],
  ['CHAW', 594.0, 0.0, 0.0],
];

/** 1969: 98 dias desde el 15 de abril. [Tmax, Tmin, Rs MJ/m2, ETo FAO-56] de ERA5. */
const TEMPORADA_1969: Array<[number, number, number, number]> = [
  [7.7, 1.0, 4.09, 0.48], [9.8, -0.8, 25.25, 2.91], [17.2, 1.1, 25.01, 4.26], [20.7, 4.7, 22.12, 4.6],
  [19.4, 6.8, 22.99, 4.75], [13.5, 2.8, 22.47, 3.75], [15.7, 0.7, 25.42, 4.06], [19.7, 4.8, 25.3, 5.18],
  [21.3, 7.0, 25.5, 6.09], [24.8, 11.0, 25.17, 5.96], [15.5, 9.7, 7.73, 1.59], [10.2, -2.1, 6.8, 1.07],
  [5.7, -3.8, 22.9, 2.51], [13.3, -4.3, 27.24, 3.72], [17.6, 1.8, 26.78, 4.32], [11.6, 2.5, 17.34, 2.63],
  [14.6, 2.5, 25.35, 4.08], [17.2, 0.7, 19.18, 3.25], [16.2, 9.5, 13.94, 2.77], [13.4, 8.3, 6.79, 1.22],
  [19.0, 7.7, 20.03, 3.58], [18.3, 4.9, 25.76, 4.63], [13.2, 3.5, 21.96, 3.68], [17.1, 3.8, 22.87, 4.32],
  [16.9, 5.6, 27.06, 5.08], [16.0, 3.7, 21.51, 4.12], [16.2, 0.4, 28.43, 4.38], [22.2, 6.4, 26.81, 5.05],
  [27.3, 7.7, 28.1, 6.22], [25.3, 14.4, 22.43, 5.35], [16.5, 2.5, 8.09, 1.5], [11.9, 1.7, 19.65, 2.95],
  [9.1, 4.9, 9.53, 1.65], [20.9, 3.5, 25.95, 4.45], [11.5, 3.3, 18.48, 3.01], [10.9, 0.8, 16.51, 2.71],
  [13.3, 2.5, 27.41, 3.94], [19.3, 2.8, 29.96, 4.97], [22.4, 7.1, 26.86, 5.15], [24.3, 9.2, 27.22, 5.94],
  [29.3, 11.4, 25.69, 5.88], [33.9, 15.1, 26.59, 7.12], [33.2, 16.0, 29.08, 7.15], [23.5, 13.1, 28.65, 6.75],
  [29.5, 10.3, 28.74, 7.42], [25.1, 11.8, 20.31, 5.44], [11.8, 5.2, 8.02, 1.81], [18.6, 4.8, 31.04, 5.35],
  [25.1, 9.1, 22.14, 5.39], [26.8, 10.9, 25.97, 6.2], [31.9, 10.9, 28.38, 6.94], [29.7, 15.4, 30.01, 7.28],
  [27.4, 13.5, 22.78, 5.29], [13.5, 10.6, 5.12, 1.67], [21.1, 9.1, 21.04, 4.3], [26.6, 13.6, 23.3, 5.55],
  [17.6, 7.7, 24.5, 4.42], [18.2, 4.4, 29.14, 5.76], [14.6, 2.7, 26.06, 4.66], [16.4, 4.0, 22.33, 4.31],
  [20.8, 7.5, 24.74, 5.02], [23.5, 10.8, 22.97, 6.23], [26.2, 8.8, 30.38, 6.9], [27.4, 11.9, 30.17, 6.92],
  [31.1, 11.3, 23.04, 7.4], [12.7, 6.3, 19.93, 3.51], [15.2, 4.6, 13.45, 3.31], [21.6, 9.0, 22.06, 4.36],
  [23.1, 9.9, 20.17, 3.79], [22.0, 12.7, 17.22, 3.33], [22.6, 12.5, 21.29, 4.28], [16.2, 12.8, 4.28, 0.97],
  [13.7, 11.4, 4.77, 0.93], [13.4, 9.3, 6.24, 1.39], [15.1, 8.9, 8.73, 1.48], [19.0, 9.4, 22.95, 3.77],
  [19.3, 7.8, 17.64, 3.41], [22.5, 10.3, 27.53, 5.06], [26.2, 11.2, 28.41, 5.73], [26.7, 15.8, 27.25, 5.78],
  [21.3, 13.0, 21.28, 4.53], [20.2, 12.6, 19.0, 3.34], [21.7, 12.9, 10.63, 2.43], [23.9, 15.1, 10.67, 2.37],
  [25.3, 12.8, 27.91, 5.35], [25.1, 13.4, 25.88, 4.97], [30.3, 14.5, 28.03, 6.24], [33.6, 17.3, 29.54, 7.21],
  [29.2, 16.6, 29.33, 6.62], [25.9, 16.9, 26.23, 5.46], [28.7, 17.5, 27.21, 5.95], [20.0, 14.1, 13.92, 3.02],
  [22.6, 12.9, 20.35, 4.22], [22.3, 15.9, 11.93, 2.5], [24.3, 14.6, 21.79, 4.22], [25.6, 12.0, 27.19, 5.4],
  [25.5, 16.2, 24.43, 5.25], [26.3, 17.6, 25.6, 5.03],
];

/** 1977: 68 dias desde el 15 de abril. [Tmax, Tmin, Rs MJ/m2, ETo FAO-56] de ERA5. */
const TEMPORADA_1977: Array<[number, number, number, number]> = [
  [18.5, 5.7, 23.85, 4.13], [22.0, 6.1, 23.5, 4.41], [15.3, 8.9, 21.24, 4.16], [13.7, 5.0, 17.35, 3.39],
  [11.3, 1.9, 12.77, 2.19], [10.8, -2.4, 15.87, 2.31], [15.6, -1.9, 20.61, 3.25], [20.2, 3.8, 22.34, 3.97],
  [16.1, 4.1, 26.18, 4.63], [18.6, 0.6, 26.74, 4.46], [24.6, 7.2, 26.05, 6.2], [27.5, 7.2, 26.45, 6.54],
  [20.2, 8.9, 16.66, 4.29], [22.2, 4.7, 26.31, 4.97], [27.2, 9.0, 25.53, 6.13], [26.7, 10.9, 26.19, 7.54],
  [15.7, 5.2, 27.22, 5.12], [20.9, 6.4, 17.73, 5.11], [27.7, 10.1, 25.74, 5.95], [20.6, 11.2, 19.21, 4.01],
  [18.4, 7.5, 26.45, 6.23], [17.2, 6.0, 23.4, 4.88], [21.5, 7.2, 24.74, 5.32], [28.0, 12.4, 24.53, 5.66],
  [30.0, 16.3, 24.26, 5.78], [30.1, 17.2, 24.87, 7.47], [25.9, 16.0, 25.01, 6.85], [30.7, 14.2, 26.6, 7.96],
  [31.8, 14.6, 22.68, 6.38], [28.9, 17.0, 18.8, 4.98], [26.3, 11.1, 25.17, 5.55], [21.0, 9.3, 25.24, 5.12],
  [22.7, 12.5, 19.1, 4.22], [15.8, 11.1, 8.32, 1.46], [15.3, 7.8, 11.87, 2.19], [19.2, 6.9, 26.25, 4.53],
  [22.3, 8.0, 28.17, 5.16], [23.3, 8.7, 27.85, 5.13], [26.6, 13.7, 26.2, 6.56], [32.0, 18.7, 26.0, 7.32],
  [28.2, 16.7, 21.31, 5.13], [23.9, 14.1, 25.17, 4.89], [22.3, 12.6, 19.12, 3.58], [19.1, 10.5, 29.22, 5.4],
  [18.1, 10.4, 20.6, 3.86], [19.4, 10.6, 26.45, 4.79], [25.2, 11.1, 29.65, 6.04], [27.3, 11.3, 30.09, 6.74],
  [29.5, 15.4, 26.86, 7.04], [23.7, 13.3, 24.14, 5.81], [30.3, 15.2, 25.99, 6.62], [26.6, 15.8, 30.24, 7.28],
  [29.7, 14.7, 29.6, 7.66], [33.3, 18.0, 29.47, 7.96], [27.4, 16.2, 27.66, 8.34], [30.4, 19.9, 25.77, 6.55],
  [24.3, 15.2, 18.26, 3.95], [18.6, 12.5, 17.43, 3.83], [20.0, 9.5, 9.07, 1.91], [16.6, 8.9, 13.12, 2.38],
  [20.5, 10.4, 12.46, 2.11], [22.8, 13.5, 18.49, 3.4], [22.3, 11.9, 23.32, 4.2], [21.6, 13.3, 25.77, 4.61],
  [22.5, 12.0, 26.15, 4.9], [20.1, 11.5, 30.22, 5.13], [22.1, 10.1, 30.96, 5.81], [22.8, 13.8, 17.07, 3.4],
];


/** Las normales del mes más cálido de la serie de ERA5 en Sidney, 1961-1990. */
const NORMALES_SIDNEY = { mes: 7, tmax_c: 28.6947, tmin_c: 16.3312 };
const ELEV_SIDNEY_M = 589;
const KC = 0.85;

function coefDeSidney() {
  const c = coeficientesEo({
    elevacion_m: ELEV_SIDNEY_M,
    tmax_normal_c: NORMALES_SIDNEY.tmax_c,
    tmin_normal_c: NORMALES_SIDNEY.tmin_c,
    mes_mas_calido: NORMALES_SIDNEY.mes,
    anios_de_las_normales: 30,
  });
  if (c === null) throw new Error('los coeficientes de Sidney no pueden salir null');
  return c;
}

function sumaDeEo(temporada: Array<[number, number, number, number]>): number {
  const c = coefDeSidney();
  let s = 0;
  for (const [tmax, tmin, rs] of temporada) {
    const e = eoJensenHaiseMm((tmax + tmin) / 2, rs, c);
    expect(e).not.toBeNull();
    s += e as number;
  }
  return s;
}

const sumaDeEto = (t: Array<[number, number, number, number]>) =>
  t.reduce((s, f) => s + f[3], 0);

describe('caso resuelto 1: las estaciones de CLIMAT.DAT del USBR', () => {
  /** Las normales que producen un `e2 − e1` dado, con la mínima en cero. */
  function normalesQueDan(de_mb: number): { tmax: number; tmin: number } | null {
    const e1 = saturacionMb(0);
    if (e1 === null) return null;
    let lo = 0;
    let hi = 90;
    for (let k = 0; k < 200; k++) {
      const mid = (lo + hi) / 2;
      const e2 = saturacionMb(mid);
      if (e2 === null) return null;
      if (e2 - e1 < de_mb) lo = mid;
      else hi = mid;
    }
    return { tmax: (lo + hi) / 2, tmin: 0 };
  }

  /**
   * De la altitud y del `Tx` publicados sale `e2 − e1`, de ahí las normales, y
   * de ahí el `CT` del módulo. No queda ningún grado de libertad, y de paso el
   * `Tx` que devuelve el módulo tiene que volver a ser el publicado.
   */
  function ctDe(elev_m: number, tx_f: number): number | null {
    const kft = elev_m * 3.28084 / 1000;
    const de = 4 * (27.5 - tx_f - kft);
    if (de <= 0) return null;
    const n = normalesQueDan(de);
    if (n === null) return null;
    const c = coeficientesEo({
      elevacion_m: elev_m, tmax_normal_c: n.tmax, tmin_normal_c: n.tmin,
    });
    if (c === null) return null;
    expect(c.e2_menos_e1_mb).toBeCloseTo(de, 3);
    expect(c.tx_f).toBeCloseTo(tx_f, 3);
    return c.ct;
  }

  const conJH = CLIMAT_DAT.filter(([, , ct]) => ct > 0);

  it('son 51 las estaciones con Jensen-Haise configurado, de 70 filas', () => {
    expect(CLIMAT_DAT).toHaveLength(70);
    expect(conJH).toHaveLength(51);
    expect(RANGO_DE_ALTITUD.estaciones).toBe(51);
  });

  it('49 de las 51 reproducen el CsubT publicado dentro del redondeo de Tx', () => {
    const fuera: string[] = [];
    for (const [stn, elev, ctPub, tx] of conJH) {
      const lo = ctDe(elev, tx + 0.05);
      const hi = ctDe(elev, tx - 0.05);
      if (lo === null || hi === null) { fuera.push(stn); continue; }
      const min = Math.min(lo, hi) - 5e-5;
      const max = Math.max(lo, hi) + 5e-5;
      if (!(ctPub >= min && ctPub <= max)) fuera.push(stn);
    }
    // Las dos que no cierran están identificadas, y una es un error de tipeo de
    // la propia tabla: ver el test siguiente.
    expect(fuera).toEqual(['RXGI', 'DRLM']);
    expect(conJH.length - fuera.length).toBe(49);
  });

  it('el Tx de RXGI es 16,3 con un dígito perdido, y con 16,3 cierra exacto', () => {
    const rxgi = CLIMAT_DAT.find(([s]) => s === 'RXGI');
    expect(rxgi).toBeDefined();
    const [, elev, ctPub, txPub] = rxgi!;
    expect(txPub).toBe(6.3);
    // Su estación gemela, a altitud parecida, publica 16,2.
    const ahti = CLIMAT_DAT.find(([s]) => s === 'AHTI')!;
    expect(ahti[3]).toBe(16.2);
    expect(Math.abs(ahti[1] - elev)).toBeLessThan(200);
    const ct = ctDe(elev, 16.3);
    expect(ct).not.toBeNull();
    expect(ct as number).toBeCloseTo(ctPub, 4);
  });

  it('el rango de altitud de la constante es el de la tabla', () => {
    const alturas = conJH.map(([, e]) => e);
    expect(Math.min(...alturas)).toBe(RANGO_DE_ALTITUD.minima_m);
    expect(Math.max(...alturas)).toBe(RANGO_DE_ALTITUD.maxima_m);
  });

  it('CT crece con la altitud y con la aridez, que es lo que dice el método', () => {
    const bajo = coeficientesEo({ elevacion_m: 100, tmax_normal_c: 30, tmin_normal_c: 15 })!;
    const alto = coeficientesEo({ elevacion_m: 1800, tmax_normal_c: 30, tmin_normal_c: 15 })!;
    expect(alto.ct).toBeGreaterThan(bajo.ct);
    const humedo = coeficientesEo({ elevacion_m: 100, tmax_normal_c: 30, tmin_normal_c: 26 })!;
    expect(bajo.ct).toBeGreaterThan(humedo.ct);
    // Y `Tx` baja cuando sube la aridez.
    expect(bajo.tx_f).toBeLessThan(humedo.tx_f);
  });
});

describe('caso resuelto 2: dos temporadas de la Tabla 1 de Wight y Hanks', () => {
  /** `Kc·Eo` publicado, los días de temporada y la `Tp` publicada. */
  const TABLA = {
    1969: { kc_eo: 309, dias: 98, tp: 130 },
    1977: { kc_eo: 243, dias: 68, tp: 97 },
  } as const;

  it('las dos series del fixture tienen los días que publica la tabla', () => {
    expect(TEMPORADA_1969).toHaveLength(TABLA[1969].dias);
    expect(TEMPORADA_1977).toHaveLength(TABLA[1977].dias);
  });

  it('1969, la mejor de las doce: la Eo queda a 0,3 % de la de la tabla', () => {
    const eo = sumaDeEo(TEMPORADA_1969);
    const tabla = TABLA[1969].kc_eo / KC;
    expect(eo / tabla).toBeCloseTo(1.002, 2);
  });

  it('1977, la peor: la Eo queda 3,6 % arriba, y es la temporada más corta y más seca', () => {
    const eo = sumaDeEo(TEMPORADA_1977);
    const tabla = TABLA[1977].kc_eo / KC;
    expect(eo / tabla).toBeCloseTo(1.036, 2);
    expect(TABLA[1977].dias).toBeLessThan(TABLA[1969].dias);
  });

  it('la ETo de FAO-56 de la misma serie lee 18 y 21 % arriba, que es lo que se venía usando', () => {
    expect(sumaDeEto(TEMPORADA_1969) / (TABLA[1969].kc_eo / KC)).toBeCloseTo(1.178, 2);
    expect(sumaDeEto(TEMPORADA_1977) / (TABLA[1977].kc_eo / KC)).toBeCloseTo(1.206, 2);
  });

  it('con el b publicado, la Eo de acá reproduce la Tp publicada y la ETo la infla al triple', () => {
    for (const anio of [1969, 1977] as const) {
      const serie = anio === 1969 ? TEMPORADA_1969 : TEMPORADA_1977;
      const { tp } = TABLA[anio];
      const conEo = B_PRADERA_MIXTA.valor * KC * sumaDeEo(serie);
      const conEto = B_PRADERA_MIXTA.valor * KC * sumaDeEto(serie);
      const errEo = Math.abs(conEo - tp) / tp;
      const errEto = Math.abs(conEto - tp) / tp;
      expect(errEo).toBeLessThan(0.13);
      expect(errEto).toBeGreaterThan(errEo * 2);
    }
  });

  it('los coeficientes de Sidney son los que dice la constante medida', () => {
    const c = coefDeSidney();
    expect(c.ct).toBeCloseTo(0.010855, 5);
    expect(c.tx_f).toBeCloseTo(20.34, 2);
    expect(c.e2_menos_e1_mb).toBeCloseTo(20.91, 2);
    expect(c.variante).toBe('modificada');
    // Sidney está adentro del rango de altitud, así que la única advertencia es
    // la de las normales de reanálisis.
    expect(c.advertencias).toEqual([ADVERTENCIAS_EO.normales_de_reanalisis]);
  });
});

describe('la ecuación, en las dos formas publicadas', () => {
  it('un langley es una caloría por centímetro cuadrado', () => {
    expect(MJ_POR_LANGLEY).toBeCloseTo(0.04184, 5);
    // 25 MJ/m2 son 597,5 langleys.
    expect(25 / MJ_POR_LANGLEY).toBeCloseTo(597.51, 1);
  });

  it('la forma de 1963 en °F y la forma en °C de la ILRI coinciden dentro del 1,6 %', () => {
    // ILRI, Drainage Principles and Applications, ecuación 5.7:
    // ETp = (0,025·Ta + 0,08)·Rs/28,6 con Rs en W/m2, que con Rs en MJ/m2/día
    // es (0,025·Ta + 0,08)·Rs/2,45. La diferencia que queda es el calor latente:
    // la ILRI lo fija y el USBR lo hace función de la temperatura del día.
    // La discrepancia máxima en ese tramo son 1,52 % y cae en 30 °C.
    for (let temp = 10; temp <= 30; temp += 2) {
      for (const rs of [10, 20, 30]) {
        const ilri = (0.025 * temp + 0.08) * rs / 2.45;
        const mia = eoJensenHaiseMm(temp, rs, COEFICIENTES_DE_1963);
        expect(mia).not.toBeNull();
        expect(Math.abs((ilri / (mia as number)) - 1)).toBeLessThan(0.016);
      }
    }
  });

  it('y se separan cerca del intercepto, donde las dos tienden a cero', () => {
    const ilri = (0.025 * 0 + 0.08) * 20 / 2.45;
    const mia = eoJensenHaiseMm(0, 20, COEFICIENTES_DE_1963) as number;
    expect(Math.abs(ilri / mia - 1)).toBeGreaterThan(0.03);
    expect(mia).toBeLessThan(1);
  });

  it('la variante modificada de Sidney lee más bajo que la original de 1963', () => {
    const c = coefDeSidney();
    const mod = eoJensenHaiseMm(20, 25, c) as number;
    const ori = eoJensenHaiseMm(20, 25, COEFICIENTES_DE_1963) as number;
    expect(mod).toBeLessThan(ori);
    expect(mod / ori).toBeCloseTo(0.888, 2);
  });

  it('por debajo del intercepto de temperatura devuelve cero, no un negativo', () => {
    const c = coefDeSidney();
    // Tx son 20,3 °F, o sea −6,5 °C.
    expect(eoJensenHaiseMm(-20, 10, c)).toBe(0);
    expect(eoJensenHaiseMm(-6.5, 10, c)).toBeCloseTo(0, 1);
    expect(eoJensenHaiseMm(0, 10, c) as number).toBeGreaterThan(0);
  });

  it('sin radiación no hay Eo, por más calor que haga', () => {
    expect(eoJensenHaiseMm(35, 0, coefDeSidney())).toBe(0);
  });

  it('crece con la radiación y con la temperatura', () => {
    const c = coefDeSidney();
    expect(eoJensenHaiseMm(20, 30, c) as number).toBeGreaterThan(eoJensenHaiseMm(20, 20, c) as number);
    expect(eoJensenHaiseMm(25, 25, c) as number).toBeGreaterThan(eoJensenHaiseMm(15, 25, c) as number);
  });

  it('rechaza lo que no es un número y la radiación negativa', () => {
    const c = coefDeSidney();
    expect(eoJensenHaiseMm(NaN, 20, c)).toBeNull();
    expect(eoJensenHaiseMm(20, NaN, c)).toBeNull();
    expect(eoJensenHaiseMm(20, Infinity, c)).toBeNull();
    expect(eoJensenHaiseMm(20, -1, c)).toBeNull();
    expect(eoJensenHaiseMm(20, 20, { ct: NaN, tx_f: 20 })).toBeNull();
    expect(eoJensenHaiseMm(20, 20, { ct: 0.01, tx_f: NaN })).toBeNull();
  });
});

describe('la saturación de vapor', () => {
  it('a 0 °C da 6,1 mb y crece con la temperatura', () => {
    expect(saturacionMb(0) as number).toBeCloseTo(6.1, 1);
    expect(saturacionMb(30) as number).toBeGreaterThan(saturacionMb(20) as number);
  });

  it('a 20 y a 30 °C queda a menos de 1 % de las tablas de FAO-56', () => {
    // FAO-56, cuadro 2.3: 23,39 mb a 20 °C y 42,43 a 30 °C.
    expect(saturacionMb(20) as number).toBeCloseTo(23.39, 0);
    expect(saturacionMb(30) as number).toBeCloseTo(42.43, 0);
    expect(Math.abs((saturacionMb(20) as number) / 23.39 - 1)).toBeLessThan(0.01);
    expect(Math.abs((saturacionMb(30) as number) / 42.43 - 1)).toBeLessThan(0.01);
  });

  it('rechaza lo que no es temperatura', () => {
    expect(saturacionMb(NaN)).toBeNull();
    expect(saturacionMb(-273)).toBeNull();
    expect(saturacionMb(-300)).toBeNull();
  });
});

describe('los coeficientes, y lo que rechazan', () => {
  it('sin oscilación diaria no hay coeficientes, porque e2 − e1 sería cero', () => {
    expect(coeficientesEo({ elevacion_m: 500, tmax_normal_c: 20, tmin_normal_c: 20 })).toBeNull();
    expect(coeficientesEo({ elevacion_m: 500, tmax_normal_c: 15, tmin_normal_c: 20 })).toBeNull();
  });

  it('rechaza altitudes imposibles y números que no son números', () => {
    expect(coeficientesEo({ elevacion_m: 9500, tmax_normal_c: 30, tmin_normal_c: 15 })).toBeNull();
    expect(coeficientesEo({ elevacion_m: -600, tmax_normal_c: 30, tmin_normal_c: 15 })).toBeNull();
    expect(coeficientesEo({ elevacion_m: NaN, tmax_normal_c: 30, tmin_normal_c: 15 })).toBeNull();
    expect(coeficientesEo({ elevacion_m: 500, tmax_normal_c: Infinity, tmin_normal_c: 15 })).toBeNull();
  });

  it('avisa fuera del rango de altitud de las estaciones publicadas', () => {
    const alto = coeficientesEo({ elevacion_m: 4000, tmax_normal_c: 25, tmin_normal_c: 5 })!;
    expect(alto.advertencias).toContain(ADVERTENCIAS_EO.altitud_fuera_de_rango);
    // Y el aviso no es decorativo: a 4.000 m el CT se va al doble del de Sidney.
    expect(alto.ct / coefDeSidney().ct).toBeGreaterThan(1.5);
  });

  it('avisa fuera del envolvente de aridez de las estaciones publicadas', () => {
    // Clima marítimo frío, de oscilación diaria chica: 10 y 4 °C dan 4,2 mb.
    const maritimo = coeficientesEo({ elevacion_m: 30, tmax_normal_c: 10, tmin_normal_c: 4 })!;
    expect(maritimo.e2_menos_e1_mb).toBeLessThan(RANGO_DE_ARIDEZ.minima_mb);
    expect(maritimo.advertencias).toContain(ADVERTENCIAS_EO.aridez_fuera_de_rango);
    expect(maritimo.ct).toBeLessThan(coefDeSidney().ct);
  });

  it('el trópico húmedo cae ADENTRO del envolvente y el aviso no lo atrapa, y está dicho', () => {
    const tropico = coeficientesEo({ elevacion_m: 50, tmax_normal_c: 31, tmin_normal_c: 25 })!;
    expect(tropico.e2_menos_e1_mb).toBeGreaterThan(RANGO_DE_ARIDEZ.minima_mb);
    expect(tropico.e2_menos_e1_mb).toBeLessThan(RANGO_DE_ARIDEZ.maxima_mb);
    expect(tropico.advertencias).not.toContain(ADVERTENCIAS_EO.aridez_fuera_de_rango);
    // Y el CT igual sale más chico que en Sidney, que es el problema de fondo.
    expect(tropico.ct).toBeLessThan(coefDeSidney().ct);
    expect(ADVERTENCIAS_EO.aridez_fuera_de_rango).toMatch(/trópico húmedo/);
  });

  it('el envolvente de aridez es el de las estaciones de CLIMAT.DAT', () => {
    // Despejado del TsubX publicado: BANO y BRKO, las dos a 24 m, dan 6,89 mb, y
    // MALI, a 1.345 m, da 32,35.
    expect(RANGO_DE_ARIDEZ.minima_mb).toBeCloseTo(6.9, 1);
    expect(RANGO_DE_ARIDEZ.maxima_mb).toBeCloseTo(32.4, 1);
    expect(RANGO_DE_ARIDEZ.mediana_mb).toBeGreaterThan(RANGO_DE_ARIDEZ.minima_mb);
    expect(RANGO_DE_ARIDEZ.mediana_mb).toBeLessThan(RANGO_DE_ARIDEZ.maxima_mb);
  });

  it('avisa cuando las normales salen de menos de treinta años', () => {
    const c = coeficientesEo({
      elevacion_m: 589, tmax_normal_c: 28, tmin_normal_c: 16, anios_de_las_normales: 12,
    })!;
    expect(c.advertencias).toContain(ADVERTENCIAS_EO.pocos_anios);
    expect(ANIOS_PARA_LAS_NORMALES.recomendado).toBe(30);
  });

  it('con normales de estación no avisa por reanálisis', () => {
    const c = coeficientesEo({
      elevacion_m: 589, tmax_normal_c: 29.65, tmin_normal_c: 12.72,
      anios_de_las_normales: 30, normales_de_reanalisis: false,
    })!;
    expect(c.advertencias).not.toContain(ADVERTENCIAS_EO.normales_de_reanalisis);
    // Y son los de la estación de Sidney, que dan la Eo 13 % arriba de la tabla.
    expect(c.e2_menos_e1_mb).toBeCloseTo(27.06, 1);
    expect(c.ct).toBeGreaterThan(coefDeSidney().ct);
  });
});

describe('las normales del mes más cálido', () => {
  /** Una serie sintética de `anios` años con una onda anual conocida. */
  function serieSintetica(anios: number, desdeAnio = 1990): DiaConRadiacion[] {
    const dias: DiaConRadiacion[] = [];
    for (let a = 0; a < anios; a++) {
      for (let m = 1; m <= 12; m++) {
        const largo = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]!;
        for (let d = 1; d <= largo; d++) {
          const onda = Math.cos((m - 7) / 12 * 2 * Math.PI);
          dias.push({
            fecha: `${desdeAnio + a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            t_max_c: 15 + 14 * onda,
            t_min_c: 1 + 14 * onda,
            rs_mj_m2: 12 + 10 * onda,
          });
        }
      }
    }
    return dias;
  }

  it('encuentra el mes más cálido y promedia sus máximas y mínimas', () => {
    const n = normalesDelMesMasCalido(serieSintetica(30));
    expect(n).not.toBeNull();
    expect(n!.mes).toBe(7);
    expect(n!.tmax_c).toBeCloseTo(29, 0);
    expect(n!.tmin_c).toBeCloseTo(15, 0);
    expect(n!.anios).toBe(30);
  });

  it('elige por el punto medio y no por la máxima sola', () => {
    // Enero tiene la máxima más alta pero mínimas muy bajas; julio es más cálido.
    const dias: DiaConRadiacion[] = [];
    for (let a = 1990; a < 2005; a++) {
      for (let d = 1; d <= 28; d++) {
        const dd = String(d).padStart(2, '0');
        dias.push({ fecha: `${a}-01-${dd}`, t_max_c: 34, t_min_c: -4, rs_mj_m2: 20 });
        dias.push({ fecha: `${a}-07-${dd}`, t_max_c: 30, t_min_c: 14, rs_mj_m2: 25 });
      }
    }
    const n = normalesDelMesMasCalido(dias);
    expect(n!.mes).toBe(7);
  });

  it('rechaza una serie de menos de diez años', () => {
    expect(normalesDelMesMasCalido(serieSintetica(9))).toBeNull();
    expect(normalesDelMesMasCalido(serieSintetica(10))).not.toBeNull();
  });

  it('rechaza si al mes más cálido le faltan la mitad de los días', () => {
    const dias = serieSintetica(12).filter(d => !(d.fecha.slice(5, 7) === '07' && Number(d.fecha.slice(8)) > 10));
    expect(normalesDelMesMasCalido(dias)).toBeNull();
  });

  it('saltea los días sin temperatura en vez de contarlos como cero', () => {
    const dias = serieSintetica(20).map((d, i) => (i % 97 === 0 ? { ...d, t_max_c: null } : d));
    const n = normalesDelMesMasCalido(dias);
    expect(n).not.toBeNull();
    expect(n!.mes).toBe(7);
    expect(n!.tmax_c).toBeCloseTo(29, 0);
  });

  it('ignora fechas que no son fechas', () => {
    const dias = [...serieSintetica(15), { fecha: 'julio', t_max_c: 90, t_min_c: 80, rs_mj_m2: 30 }];
    const n = normalesDelMesMasCalido(dias);
    expect(n!.tmax_c).toBeLessThan(40);
  });
});

describe('de la serie a la Eo diaria', () => {
  const diasDe = (n: number): DiaConRadiacion[] => {
    const out: DiaConRadiacion[] = [];
    for (let a = 1990; a < 1990 + n; a++) {
      for (let m = 1; m <= 12; m++) {
        for (let d = 1; d <= 28; d++) {
          const onda = Math.cos((m - 7) / 12 * 2 * Math.PI);
          out.push({
            fecha: `${a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            t_max_c: 15 + 14 * onda, t_min_c: 1 + 14 * onda, rs_mj_m2: 12 + 10 * onda,
          });
        }
      }
    }
    return out;
  };

  it('saca los coeficientes de la propia serie y avisa que son de reanálisis', () => {
    const c = coeficientesDeLaSerie(diasDe(30), 600);
    expect(c).not.toBeNull();
    expect(c!.mes_mas_calido).toBe(7);
    expect(c!.advertencias).toContain(ADVERTENCIAS_EO.normales_de_reanalisis);
  });

  it('devuelve null cuando la serie es corta, y ahí hay que caer a la ETo con aviso', () => {
    expect(coeficientesDeLaSerie(diasDe(5), 600)).toBeNull();
  });

  it('pasa los null tal cual: un día sin radiación no es un día sin demanda', () => {
    const dias = diasDe(12);
    const c = coeficientesDeLaSerie(dias, 600)!;
    const conHuecos = dias.map((d, i) => (i === 10 ? { ...d, rs_mj_m2: null } : d));
    const eo = serieDeEo(conHuecos, c);
    expect(eo[10]).toBeNull();
    expect(eo[9]).not.toBeNull();
    expect(eo).toHaveLength(dias.length);
  });
});

describe('las dos mitades del error, contra su propia prosa', () => {
  const M = LAS_DOS_MITADES_DEL_ERROR_DE_LA_EO;

  it('la Eo de acá se acerca a la Tabla 1 y la ETo de FAO-56 no', () => {
    expect(M.contra_la_tabla_1.jensen_haise_de_la_serie.media).toBeCloseTo(1.015, 2);
    expect(M.contra_la_tabla_1.eto_fao_56.media).toBeCloseTo(1.162, 2);
    expect(Math.abs(M.contra_la_tabla_1.jensen_haise_de_la_serie.media - 1))
      .toBeLessThan(Math.abs(M.contra_la_tabla_1.eto_fao_56.media - 1));
  });

  it('el error de la Tp con la ETo es diez veces el de la Eo de acá', () => {
    expect(M.tp_reproducida_pct.eto_fao_56.media / M.tp_reproducida_pct.jensen_haise.media)
      .toBeGreaterThan(9);
  });

  it('el sesgo de ERA5 es chico en el punto medio y grande en la amplitud', () => {
    expect(Math.abs(M.sesgo_de_era5.temperatura_punto_medio_c)).toBeLessThan(0.1);
    const { era5, estacion } = M.sesgo_de_era5.amplitud_diaria_c;
    expect(estacion - era5).toBeGreaterThan(3);
    // La máxima baja y la mínima alta, casi simétricas: eso deja el punto medio
    // en su lugar y achata la amplitud.
    expect(M.sesgo_de_era5.maxima_c).toBeLessThan(0);
    expect(M.sesgo_de_era5.minima_c).toBeGreaterThan(0);
    expect(Math.abs(M.sesgo_de_era5.maxima_c + M.sesgo_de_era5.minima_c)).toBeLessThan(0.2);
  });

  it('la radiación de ERA5 lee pocos puntos arriba de la satelital', () => {
    expect(M.sesgo_de_era5.radiacion_contra_power.cociente).toBeGreaterThan(1);
    expect(M.sesgo_de_era5.radiacion_contra_power.cociente).toBeLessThan(1.05);
  });

  it('el cociente entre las dos superficies cae en el rango publicado de ETr/ETo', () => {
    expect(M.eto_sobre_eo.media).toBeGreaterThan(1.1);
    expect(M.eto_sobre_eo.media).toBeLessThan(1.4);
    expect(M.eto_sobre_eo_publicado).toMatch(/1,1 a 1,4/);
  });

  it('dice que el acuerdo se apoya en parte en la amplitud achatada, y no lo esconde', () => {
    expect(M.queda_sin_explicar).toMatch(/achata/);
    expect(M.contra_la_tabla_1.jensen_haise_con_normales_de_estacion.media).toBeCloseTo(1.133, 2);
    expect(M.contra_la_tabla_1.original_1963.media).toBeCloseTo(1.098, 2);
  });

  it('el aviso nombra la superficie de alfalfa y las dos direcciones del error', () => {
    expect(AVISO_EO_JENSEN_HAISE.aviso).toMatch(/alfalfa/);
    expect(AVISO_EO_JENSEN_HAISE.aviso).toMatch(/ARRIBA/);
    expect(AVISO_EO_JENSEN_HAISE.aviso).toMatch(/ABAJO/);
    // La misma degradación con el signo dado vuelta: una Eo baja sube el índice
    // y por eso baja el Yp, que sale de dividir un corte por ese índice.
    expect(AVISO_EO_JENSEN_HAISE.sesgo_del_indice).toBe('alto');
    expect(AVISO_EO_JENSEN_HAISE.sesgo_del_yp).toBe('bajo');
  });

  it('las fuentes nombran el trabajo de 1963, la variante y la formulación', () => {
    expect(FUENTES_EO.original).toMatch(/1963/);
    expect(FUENTES_EO.modificada).toMatch(/1970/);
    expect(FUENTES_EO.formulacion).toMatch(/Reclamation/);
    expect(FUENTES_EO.superficie_de_referencia).toMatch(/alfalfa/);
  });
});
