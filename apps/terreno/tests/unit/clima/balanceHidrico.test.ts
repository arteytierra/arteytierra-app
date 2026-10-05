import { describe, it, expect } from 'vitest';
import {
  balanceCiclico, costoDeNoIterar, compararReglas, mesInicioAnioHidrologico,
  balanceDeLosAnios, posicionHazen, lluviaConChance, lluviasDependientes,
  periodoDeCrecimiento, regimenDeHumedad, contrastarEtp, fechaDeDekada,
  AWC_POR_DEFECTO_MM, AWC_REFERENCIA_GAEZ_MM, FRAC_AGOTAMIENTO_FAO56, FRAC_AGOTAMIENTO_RANGO,
  FRAC_INICIO_FAO52, FRAC_LGP_GAEZ4, T_MIN_CRECIMIENTO_C, DEKADAS_ANIO, DIAS_DEKADA,
  type AnioMensual, type SerieDekadal,
} from '@/lib/balanceHidrico';

// ─── El caso resuelto ────────────────────────────────────────────────────────
//
// Dourado-Neto, van Lier, Metselaar, Reichardt y Nielsen (2010), «General
// procedure to initialize the cyclic soil water balance by the Thornthwaite and
// Mather method», Scientia Agricola 67(1):87-95, tablas 2 y 4. Petrolina-PE,
// Brasil, período 1975-2006, capacidad de agua útil Ac = 125 mm.

const PETROLINA_P   = [72, 90, 148, 82, 29, 10, 13, 4, 6, 21, 50, 84];
const PETROLINA_ET0 = [142.9, 142.9, 142.9, 124.4, 107.8, 107.8, 107.8, 107.8, 124.4, 163.3, 163.3, 142.9];
const PETROLINA_AWC = 125;

/** Almacenaje convergido de la tabla 2, columna A de la última iteración. */
const PETROLINA_A = [0.0032, 0.0021, 5.1016, 3.6328, 1.9343, 0.8847, 0.4145, 0.1807, 0.0700, 0.0224, 0.0091, 0.0057];
/** Déficit mensual de la tabla 4, columna D. */
const PETROLINA_D = [70.9, 52.9, 0.0, 41.0, 77.1, 96.7, 94.3, 103.5, 118.3, 142.2, 113.3, 58.9];

describe('balanceCiclico — el caso resuelto de Petrolina', () => {
  const b = balanceCiclico(PETROLINA_P, PETROLINA_ET0, PETROLINA_AWC)!;

  it('reproduce el almacenaje mes a mes de la tabla 2', () => {
    expect(b).not.toBeNull();
    for (let i = 0; i < 12; i++) {
      expect(b.meses[i]!.almacenaje_mm).toBeCloseTo(PETROLINA_A[i]!, 2);
    }
  });

  it('reproduce el déficit mes a mes de la tabla 4', () => {
    for (let i = 0; i < 12; i++) {
      expect(b.meses[i]!.deficit_mm).toBeCloseTo(PETROLINA_D[i]!, 0);
    }
  });

  it('reproduce los totales publicados: ETR 609,0 · déficit 969,2 · excedente 0', () => {
    expect(b.etr_mm).toBeCloseTo(609.0, 1);
    expect(b.deficit_mm).toBeCloseTo(969.2, 1);
    expect(b.excedente_mm).toBeCloseTo(0, 6);
  });

  it('cierra: sin excedente y con el ciclo cerrado, toda la lluvia se evapora', () => {
    // ΣETR = ΣP − Σexcedente. No es una coincidencia del caso: es el cierre.
    expect(b.etr_mm).toBeCloseTo(609, 1);
    expect(b.cierre_mm).toBeCloseTo(0, 3);
  });

  it('el déficit es ETP − ETR y NO precipitación − ETP', () => {
    // GAEZ v4: «WDe = ETm - ETa». En Petrolina los dos coinciden porque el suelo
    // está vacío todo el año, y por eso el caso NO sirve para distinguirlos: el
    // que los distingue es el de abajo.
    expect(b.deficit_mm).toBeCloseTo(b.etp_mm - b.etr_mm, 3);
  });

  it('converge, y el almacenaje convergido es CERO y no la capacidad', () => {
    expect(b.convergio).toBe(true);
    expect(b.ciclos).toBeGreaterThan(1);
    // El punto de la publicación: en Petrolina el suelo arranca enero con tres
    // milésimas de milímetro, no con los 125 mm que supone el procedimiento clásico.
    expect(b.meses[0]!.almacenaje_mm).toBeLessThan(0.01);
    expect(b.almacenaje_cierre_mm).toBeLessThan(0.01);
  });
});

describe('EL DÉFICIT NO ES PRECIPITACIÓN MENOS ETP, Y EL SUELO ES LA DIFERENCIA', () => {
  it('un mes muy deficitario sobre suelo lleno casi no tiene déficit', () => {
    // Un mes con P − ETP = −80 justo después de la temporada de lluvias, sobre
    // 300 mm de agua útil.
    const precip = [200, 200, 200, 200, 200, 200, 20, 200, 200, 200, 200, 200];
    const etp    = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100];

    const tm = balanceCiclico(precip, etp, 300)!.meses[6]!;
    expect(tm.p_menos_etp_mm).toBe(-80);        // lo que la app llamaba «balance»
    expect(tm.deficit_mm).toBeCloseTo(9.8, 1);  // el déficit de verdad, un octavo
    expect(tm.etr_mm).toBeCloseTo(90.2, 1);

    // Y con la regla de FAO-56 el déficit es CERO: el agotamiento de 80 mm no
    // llega a p·TAW = 150, así que la planta no se enteró. El mismo mes, el
    // mismo suelo, dos reglas publicadas, 9,8 mm contra 0.
    const fao = balanceCiclico(precip, etp, 300, { regla: 'fao56' })!.meses[6]!;
    expect(fao.deficit_mm).toBeCloseTo(0, 6);
    expect(fao.etr_mm).toBeCloseTo(100, 6);
  });

  it('y un mes poco deficitario sobre suelo vacío tiene todo el déficit', () => {
    const precip = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
    const etp    = [25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25];
    const b = balanceCiclico(precip, etp, 100)!;
    const m = b.meses[11]!;
    expect(m.p_menos_etp_mm).toBe(-20);
    expect(m.deficit_mm).toBeCloseTo(20, 1);    // el suelo ya no tiene nada que dar
  });

  it('la suma anual de p_menos_etp NO es el déficit anual ni el excedente anual', () => {
    // Clima mediterráneo: llueve en invierno y falta en verano, así que el mismo
    // año tiene excedente Y déficit, y la columna vieja no es ninguno de los dos.
    const precip = [110, 95, 80, 55, 30, 12, 5, 8, 40, 85, 105, 120];
    const etp    = [18, 24, 42, 65, 100, 135, 155, 140, 100, 62, 28, 17];
    const b = balanceCiclico(precip, etp, 125)!;
    const sumaPmenosEtp = b.meses.reduce((s, m) => s + m.p_menos_etp_mm, 0);
    // El número que la app mostraba sumado da la diferencia entre los OTROS dos,
    // y no es ninguno de los dos.
    expect(sumaPmenosEtp).toBeCloseTo(b.excedente_mm - b.deficit_mm, 3);
    expect(b.deficit_mm).toBeGreaterThan(0);
    expect(b.excedente_mm).toBeGreaterThan(0);
  });
});

describe('costoDeNoIterar — el suelo lleno que se regala', () => {
  it('EN PETROLINA LA PASADA ÚNICA INVENTA LA CAPACIDAD ENTERA DEL SUELO', () => {
    const c = costoDeNoIterar(PETROLINA_P, PETROLINA_ET0, PETROLINA_AWC)!;
    expect(c.etr_mm).toBeCloseTo(609.0, 1);
    expect(c.etr_sin_iterar_mm).toBeCloseTo(733.9, 1);
    // 124,9 mm de evapotranspiración que no ocurrieron, sobre una capacidad de 125.
    expect(c.agua_fantasma_mm).toBeCloseTo(124.9, 1);
    expect(c.agua_fantasma_mm).toBeLessThan(PETROLINA_AWC);
    expect(c.agua_fantasma_mm / PETROLINA_AWC).toBeGreaterThan(0.99);
  });

  it('y por eso subestima el déficit anual un 13 %', () => {
    const c = costoDeNoIterar(PETROLINA_P, PETROLINA_ET0, PETROLINA_AWC)!;
    expect(c.deficit_mm).toBeCloseTo(969.2, 1);
    expect(c.deficit_sin_iterar_mm).toBeCloseTo(844.3, 1);
    const subestima = (c.deficit_mm - c.deficit_sin_iterar_mm) / c.deficit_mm;
    expect(subestima).toBeGreaterThan(0.12);
    expect(subestima).toBeLessThan(0.14);
  });

  it('en un clima húmedo no cuesta nada, porque el suelo arranca lleno de verdad', () => {
    const precip = [120, 110, 115, 105, 100, 95, 90, 95, 100, 110, 115, 120];
    const etp    = [20, 26, 44, 66, 95, 115, 125, 115, 88, 58, 30, 20];
    const c = costoDeNoIterar(precip, etp, 150)!;
    expect(Math.abs(c.agua_fantasma_mm)).toBeLessThan(0.5);
    expect(c.ciclos).toBeLessThanOrEqual(2);
  });
});

describe('compararReglas — DOS REGLAS PUBLICADAS QUE NO COINCIDEN', () => {
  // Mismo clima templado húmedo con déficit estival suave; sólo cambia el suelo.
  const P = [95, 85, 90, 80, 75, 70, 60, 65, 75, 90, 95, 100];
  const E = [14, 20, 38, 62, 95, 120, 135, 122, 88, 55, 24, 14];

  it('con un suelo profundo el déficit difiere por un FACTOR 5', () => {
    const c = compararReglas(P, E, 300)!;
    expect(c.thornthwaite.deficit_mm).toBeCloseTo(61.5, 0);
    expect(c.fao56.deficit_mm).toBeCloseTo(12.3, 0);
    expect(c.factor_deficit).toBeGreaterThan(4.5);
    expect(c.factor_deficit).toBeLessThan(5.5);
    // Y el excedente también se mueve, que es lo que le entra a una represa.
    expect(Math.abs(c.dif_excedente_mm)).toBeGreaterThan(40);
  });

  it('con un suelo somero las dos coinciden, porque el agua se va igual', () => {
    const c = compararReglas(P, E, 60)!;
    expect(c.thornthwaite.deficit_mm).toBeCloseTo(156.7, 0);
    expect(c.fao56.deficit_mm).toBeCloseTo(155.1, 0);
    expect(Math.abs(c.dif_deficit_mm) / c.thornthwaite.deficit_mm).toBeLessThan(0.02);
    expect(c.porque).toContain('el suelo se vacía de todos modos');
  });

  it('LA SEPARACIÓN CRECE CON LA PROFUNDIDAD DEL SUELO, Y ESO ES EL MECANISMO', () => {
    const difs = [60, 150, 300].map(awc => {
      const c = compararReglas(P, E, awc)!;
      return Math.abs(c.dif_deficit_mm);
    });
    expect(difs[0]!).toBeLessThan(difs[1]!);
    expect(difs[1]!).toBeLessThan(difs[2]!);
  });

  it('en un clima árido las dos dan el mismo total anual', () => {
    const c = compararReglas(PETROLINA_P, PETROLINA_ET0, PETROLINA_AWC)!;
    expect(c.fao56.deficit_mm).toBeCloseTo(c.thornthwaite.deficit_mm, 0);
    // Pero no mes a mes: la regla cambia en qué mes sale el agua.
    expect(Math.abs(c.mes_mas_separado!.dif_mm)).toBeGreaterThan(0.2);
  });

  it('la p de FAO-56 está dentro del rango publicado 0,30–0,70', () => {
    expect(FRAC_AGOTAMIENTO_FAO56).toBeGreaterThanOrEqual(FRAC_AGOTAMIENTO_RANGO[0]);
    expect(FRAC_AGOTAMIENTO_FAO56).toBeLessThanOrEqual(FRAC_AGOTAMIENTO_RANGO[1]);
  });

  it('con p = 0 FAO-56 deja de tener meseta y se parece a Thornthwaite', () => {
    // Con p = 0 el umbral es TAW entero: no hay tramo sin estrés y la
    // exponencial tiene la misma constante. Es el mismo cálculo.
    const tm  = balanceCiclico(P, E, 150, { regla: 'thornthwaite' })!;
    const fao = balanceCiclico(P, E, 150, { regla: 'fao56', p: 0 })!;
    expect(fao.deficit_mm).toBeCloseTo(tm.deficit_mm, 3);
  });
});

describe('el año hidrológico', () => {
  it('en lluvia estival del hemisferio sur el año NO arranca en enero', () => {
    // Lluvia de verano austral (dic–mar), seca de invierno.
    const P = [150, 140, 110, 60, 25, 12, 8, 10, 30, 70, 110, 145];
    const E = [160, 135, 105, 70, 42, 28, 32, 48, 75, 105, 135, 158];
    const b = balanceCiclico(P, E, 150)!;
    const inicio = mesInicioAnioHidrologico(b);
    expect(inicio).not.toBe(0);
    // Arranca después del pico de almacenaje, que cae en el verano austral.
    const pico = b.meses.reduce((a, m) => (m.almacenaje_mm > a.almacenaje_mm ? m : a));
    expect(inicio).toBe((pico.mesIndex + 1) % 12);
  });

  it('el espejo del norte da el mismo arranque con los meses corridos seis', () => {
    const P = [150, 140, 110, 60, 25, 12, 8, 10, 30, 70, 110, 145];
    const E = [160, 135, 105, 70, 42, 28, 32, 48, 75, 105, 135, 158];
    const corre = <T,>(xs: readonly T[]) => [...xs.slice(6), ...xs.slice(0, 6)];
    const sur   = mesInicioAnioHidrologico(balanceCiclico(P, E, 150)!);
    const norte = mesInicioAnioHidrologico(balanceCiclico(corre(P), corre(E), 150)!);
    expect(norte).toBe((sur + 6) % 12);
  });
});

describe('balanceDeLosAnios — EL AÑO PROMEDIO ESCONDE EL DÉFICIT Y EL EXCEDENTE A LA VEZ', () => {
  // Clima de lluvia estival con variación interanual, construido con una semilla
  // fija para que el test sea determinista. La lluvia media anual es la misma
  // que la del año promedio: lo único que cambia es que acá los años existen.
  const Pm = [110, 100, 120, 85, 55, 35, 30, 35, 60, 95, 110, 115];
  const Em = [150, 125, 100, 65, 38, 25, 28, 45, 65, 95, 120, 145];

  function aniosSinteticos(n: number): AnioMensual[] {
    let s = 12345;
    const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    // Dos uniformes → una normal aproximada, sin dependencias.
    const normal = (mu: number, sd: number) => mu + sd * ((rnd() + rnd() + rnd() + rnd() + rnd() + rnd()) - 3) / Math.sqrt(0.5);
    const out: AnioMensual[] = [];
    for (let y = 0; y < n; y++) {
      const f = Math.max(0.15, normal(1, 0.28));
      out.push({
        anio: 1991 + y,
        precip: Pm.map(p => Math.max(0, p * f * Math.max(0.1, normal(1, 0.35)))),
        etp: [...Em],
      });
    }
    return out;
  }

  const anios = aniosSinteticos(60);
  const r = balanceDeLosAnios(anios, 150)!;

  it('la lluvia es LA MISMA y el balance no: eso es todo el hallazgo', () => {
    // La lluvia media de los años y la del año promedio difieren en menos del
    // 3 % —es el mismo clima—, y el déficit difiere en más del 80 %.
    const difLluvia = Math.abs(r.precip.media - r.anioPromedio.precip_mm) / r.anioPromedio.precip_mm;
    expect(difLluvia).toBeLessThan(0.03);
  });

  it('EL DÉFICIT PROMEDIO DE LOS AÑOS ES MUY MAYOR QUE EL DEL AÑO PROMEDIO', () => {
    expect(r.brecha_deficit_mm).toBeGreaterThan(40);
    expect(r.deficit.media).toBeGreaterThan(r.anioPromedio.deficit_mm * 1.8);
  });

  it('Y EL EXCEDENTE TAMBIÉN: el año promedio dice que no hay agua para cosechar', () => {
    expect(r.anioPromedio.excedente_mm).toBeLessThan(5);
    expect(r.excedente.media).toBeGreaterThan(40);
    expect(r.brecha_excedente_mm).toBeGreaterThan(40);
  });

  it('falla para los dos lados al mismo tiempo, que es lo contraintuitivo', () => {
    // No es un sesgo con signo: las dos magnitudes quedan subestimadas.
    expect(r.brecha_deficit_mm).toBeGreaterThan(0);
    expect(r.brecha_excedente_mm).toBeGreaterThan(0);
  });

  it('la banda entre el año bueno y el malo es enorme con la misma media', () => {
    expect(r.deficit.p90 / Math.max(r.deficit.p10, 1)).toBeGreaterThan(3);
  });

  it('descarta el año de calentamiento, y el año hidrológico corrido cuesta otro', () => {
    expect(r.calentamiento).toBe(1);
    // Si el año no arranca en enero, un registro de n años calendario contiene
    // n−1 años hidrológicos completos: el primer tramo y el último quedan
    // partidos. Uno más se va al calentamiento.
    expect(r.anios).toBe(r.mesInicio === 0 ? anios.length - 1 : anios.length - 2);
  });

  it('informa el CV de la lluvia anual', () => {
    expect(r.cv_pct).toBeGreaterThan(10);
    expect(r.cv_pct).toBeLessThan(80);
  });

  it('con menos de tres años no devuelve nada en vez de devolver cualquier cosa', () => {
    expect(balanceDeLosAnios(aniosSinteticos(2), 150)).toBeNull();
  });

  it('un año con once meses se descarta y no corre el balance con once', () => {
    const malo: AnioMensual[] = [...aniosSinteticos(5), { anio: 2000, precip: Pm.slice(0, 11), etp: Em }];
    const ok = balanceDeLosAnios(malo, 150)!;
    const sano = balanceDeLosAnios(aniosSinteticos(5), 150)!;
    expect(ok.anios).toBe(sano.anios);   // el año roto no suma ni resta
  });
});

describe('lluvia con chance de ocurrencia — FAO I&D 25 con la posición de Hazen', () => {
  it('la posición de Hazen es la publicada: Fa = 100 (2n − 1) / 2y', () => {
    expect(posicionHazen(1, 10)).toBeCloseTo(5, 6);
    expect(posicionHazen(10, 10)).toBeCloseTo(95, 6);
    expect(posicionHazen(5, 10)).toBeCloseTo(45, 6);
    // Con 35 años el registro sostiene de 1,43 % a 98,57 % y nada más.
    expect(posicionHazen(1, 35)).toBeCloseTo(100 / 70, 6);
    expect(posicionHazen(35, 35)).toBeCloseTo(100 - 100 / 70, 6);
  });

  it('NO ES LA DE WEIBULL NI LA INTERPOLACIÓN LINEAL DE LOS PERCENTILES', () => {
    // Weibull daría n/(y+1): 1/11 = 9,09 % donde Hazen da 5 %.
    expect(posicionHazen(1, 10)).not.toBeCloseTo(100 / 11, 1);
  });

  it('EL 80 % DE CHANCE ES UN NÚMERO CHICO, NO UNO GRANDE', () => {
    const totales = [400, 550, 600, 650, 700, 750, 800, 900, 1000, 1200];
    const p80 = lluviaConChance(totales, 80)!;
    const p20 = lluviaConChance(totales, 20)!;
    const mediaT = totales.reduce((a, b) => a + b, 0) / totales.length;
    expect(p80).toBeLessThan(mediaT);   // se supera en 8 de cada 10 años
    expect(p20).toBeGreaterThan(mediaT);
    expect(p80).toBeLessThan(p20);
  });

  it('la media se supera en menos de la mitad de los años, como dice la fuente', () => {
    // Distribución de lluvia con cola a la derecha, que es lo normal.
    const totales = [300, 380, 420, 460, 500, 540, 600, 700, 900, 1500];
    const mediaT = totales.reduce((a, b) => a + b, 0) / totales.length;
    const superan = totales.filter(t => t >= mediaT).length;
    expect(superan / totales.length).toBeLessThan(0.5);
    // Y la mediana queda por debajo de la media.
    expect(lluviaConChance(totales, 50)!).toBeLessThan(mediaT);
  });

  it('no extrapola: un nivel que el registro no sostiene devuelve null', () => {
    const totales = [400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300];
    expect(lluviaConChance(totales, 99)).toBeNull();   // fuera de 5–95 con 10 años
    expect(lluviaConChance(totales, 1)).toBeNull();
    expect(lluviaConChance(totales, 95)).not.toBeNull();
  });

  it('los cuatro niveles van ordenados y con para qué sirve cada uno', () => {
    const totales = Array.from({ length: 35 }, (_, i) => 500 + i * 20);
    const ls = lluviasDependientes(totales);
    expect(ls.map(l => l.chance_pct)).toEqual([90, 80, 50, 20]);
    const mms = ls.map(l => l.mm!);
    expect(mms[0]!).toBeLessThan(mms[1]!);
    expect(mms[1]!).toBeLessThan(mms[2]!);
    expect(mms[2]!).toBeLessThan(mms[3]!);
    expect(ls[0]!.para).toContain('nueve años de cada diez');
  });

  it('el nivel de 9 de cada 10 con 35 años cae en un orden exacto', () => {
    // Hazen: 90 = 100(2n−1)/70 → n = 32 justo. Es el 32º más grande de 35.
    const totales = Array.from({ length: 35 }, (_, i) => (i + 1) * 10);  // 10..350
    const desc = [...totales].sort((a, b) => b - a);
    expect(lluviaConChance(totales, 90)).toBeCloseTo(desc[31]!, 6);
  });
});

describe('periodoDeCrecimiento — los dos criterios publicados de FAO', () => {
  function dekadal(precip: number[], etp: number[], tmean: number[]): SerieDekadal {
    return { precip, etp, tmean };
  }
  const plano = (v: number) => new Array(DEKADAS_ANIO).fill(v) as number[];

  it('las 36 décadas suman 365 días', () => {
    expect(DIAS_DEKADA).toHaveLength(DEKADAS_ANIO);
    expect(DIAS_DEKADA.reduce((a, b) => a + b, 0)).toBe(365);
    // Las terceras décadas de cada mes no son de diez días.
    expect(DIAS_DEKADA[2]).toBe(11);   // 21–31 de enero
    expect(DIAS_DEKADA[5]).toBe(8);    // 21–28 de febrero
  });

  it('un clima húmedo todo el año da 365 días y régimen perhúmedo', () => {
    const d = dekadal(plano(60), plano(25), plano(20));
    const r = periodoDeCrecimiento(d, 150)!;
    expect(r.tipo).toBe('humedo-todo-el-anio');
    expect(r.dias).toBe(365);
    expect(r.regimen).toBe('Perhúmedo');
    expect(r.dekadas_humedas).toBe(DEKADAS_ANIO);
  });

  it('un clima seco todo el año no tiene período de crecimiento', () => {
    const d = dekadal(plano(2), plano(60), plano(25));
    const r = periodoDeCrecimiento(d, 100)!;
    expect(r.tipo).toBe('seco-todo-el-anio');
    expect(r.dias).toBe(0);
    expect(r.regimen).toBe('Hiperárido');
  });

  it('LOS DOS CRITERIOS DE FAO DAN FECHAS DISTINTAS SOBRE LA MISMA SERIE', () => {
    // Lluvia concentrada en diez décadas; el resto seco. Con suelo, el criterio
    // de GAEZ v4 (ETa ≥ 0,4 ETm) estira el período más allá del fin de las
    // lluvias, que es justo lo que el criterio de 1983 no ve.
    const precip = plano(3);
    for (let i = 6; i < 16; i++) precip[i] = 80;
    const d = dekadal(precip, plano(45), plano(22));
    const r = periodoDeCrecimiento(d, 200)!;
    expect(r.inicio_fao52).not.toBeNull();
    expect(r.inicio_gaez).not.toBeNull();
    expect(r.dias).toBeGreaterThan(100);     // diez décadas son 100 días
    expect(r.tipo).toBe('normal');
    // El período dura más que las lluvias: la reserva del suelo lo estira.
    const dekadasLluviosas = precip.filter((p, i) => p >= FRAC_INICIO_FAO52 * 45).length;
    expect(r.dias).toBeGreaterThan(dekadasLluviosas * 10);
  });

  it('EL SUELO DEL PREDIO CAMBIA EL LARGO CONTRA EL SUELO DE REFERENCIA DE LOS MAPAS', () => {
    const precip = plano(3);
    for (let i = 6; i < 16; i++) precip[i] = 80;
    const d = dekadal(precip, plano(45), plano(22));
    const ref  = periodoDeCrecimiento(d, AWC_REFERENCIA_GAEZ_MM)!;
    const real = periodoDeCrecimiento(d, 250)!;
    // Los mapas globales se calculan con 100 mm; un suelo más profundo estira la
    // temporada, y ésa es la diferencia que el mapa no puede mostrar.
    expect(real.dias).toBeGreaterThan(ref.dias);
    expect(AWC_REFERENCIA_GAEZ_MM).toBe(100);
  });

  it('EL FRÍO CORTA EL PERÍODO Y SE DICE QUE ES POR FRÍO Y NO POR SEQUÍA', () => {
    const tmean = plano(18);
    for (let i = 0; i < 6; i++) tmean[i] = 2;      // enero y febrero fríos
    for (let i = 33; i < 36; i++) tmean[i] = 1;    // diciembre frío
    const d = dekadal(plano(60), plano(25), tmean);
    const r = periodoDeCrecimiento(d, 150)!;
    expect(r.dekadas_frias).toBe(9);
    expect(r.dias).toBeLessThan(365);
    expect(r.advertencias.join(' ')).toContain('por frío y no por sequía');
    expect(T_MIN_CRECIMIENTO_C).toBe(5);
  });

  it('DOS TEMPORADAS DE LLUVIA DAN DOS PERÍODOS, Y NO UNO LARGO', () => {
    const precip = plano(2);
    for (let i = 3; i < 9; i++)  precip[i] = 90;
    for (let i = 21; i < 27; i++) precip[i] = 90;
    const d = dekadal(precip, plano(50), plano(22));
    const r = periodoDeCrecimiento(d, 80)!;
    expect(r.tramos.length).toBe(2);
    expect(r.advertencias.join(' ')).toContain('no significa que se pueda hacer un cultivo de ese largo');
  });

  it('un tramo que cruza el fin de año no se parte en dos', () => {
    const precip = plano(2);
    // Lluvias de noviembre a febrero: décadas 30..35 y 0..5.
    for (const i of [30, 31, 32, 33, 34, 35, 0, 1, 2, 3, 4, 5]) precip[i] = 90;
    const d = dekadal(precip, plano(50), plano(22));
    const r = periodoDeCrecimiento(d, 60)!;
    expect(r.tramos.length).toBe(1);
    expect(r.tramos[0]!.desde_dekada).toBeGreaterThan(r.tramos[0]!.hasta_dekada);
  });

  it('la tabla 3-5 de GAEZ v4 se reproduce entera', () => {
    expect(regimenDeHumedad(0)).toBe('Hiperárido');
    expect(regimenDeHumedad(59)).toBe('Árido');
    expect(regimenDeHumedad(60)).toBe('Semiárido seco');
    expect(regimenDeHumedad(119)).toBe('Semiárido seco');
    expect(regimenDeHumedad(120)).toBe('Semiárido húmedo');
    expect(regimenDeHumedad(179)).toBe('Semiárido húmedo');
    expect(regimenDeHumedad(180)).toBe('Subhúmedo');
    expect(regimenDeHumedad(269)).toBe('Subhúmedo');
    expect(regimenDeHumedad(270)).toBe('Húmedo');
    expect(regimenDeHumedad(364)).toBe('Húmedo');
    expect(regimenDeHumedad(365)).toBe('Perhúmedo');
  });

  it('el umbral de GAEZ v4 es 0,4 y el de FAO 52 es 0,5: son dos números distintos', () => {
    expect(FRAC_LGP_GAEZ4).toBe(0.4);
    expect(FRAC_INICIO_FAO52).toBe(0.5);
    expect(FRAC_LGP_GAEZ4).not.toBe(FRAC_INICIO_FAO52);
  });

  it('las fechas de las décadas son las del día 1, 11 y 21 de cada mes', () => {
    expect(fechaDeDekada(0)).toBe('1 enero');
    expect(fechaDeDekada(1)).toBe('11 enero');
    expect(fechaDeDekada(2)).toBe('21 enero');
    expect(fechaDeDekada(35)).toBe('21 diciembre');
  });

  it('una serie que no tiene 36 décadas no se calcula a medias', () => {
    expect(periodoDeCrecimiento({ precip: plano(10), etp: plano(10), tmean: plano(10).slice(0, 35) }, 100)).toBeNull();
  });
});

describe('contrastarEtp — la verificación que FAO-56 pide de su propia ecuación 52', () => {
  it('mide la diferencia entre las dos ETP que la app ya tiene', () => {
    const c = contrastarEtp(1200, 1000, 2, 60)!;
    expect(c.dif_mm).toBe(200);
    expect(c.dif_pct).toBeCloseTo(20, 6);
    expect(c.cociente).toBeCloseTo(1.2, 6);
    expect(c.advertencias.join(' ')).toContain('no como equivalente');
  });

  it('CON VIENTO ARRIBA DE 3 m/s LA FUENTE ANTICIPA QUE HARGREAVES SE QUEDA CORTA', () => {
    const c = contrastarEtp(900, 1100, 4.5, 55)!;
    expect(c.sesgo_esperado).toContain('corta');
    expect(c.coincide).toBe(true);   // midió menos, como anticipa la fuente
  });

  it('con humedad alta anticipa lo contrario, y el signo se verifica', () => {
    const c = contrastarEtp(1150, 1000, 1.5, 85)!;
    expect(c.sesgo_esperado).toContain('para arriba');
    expect(c.coincide).toBe(true);
  });

  it('cuando el sesgo medido va al revés del anticipado, lo dice y no lo tapa', () => {
    const c = contrastarEtp(1200, 1000, 5, 50)!;
    expect(c.sesgo_esperado).toContain('corta');
    expect(c.coincide).toBe(false);
  });

  it('sin viento ni humedad no inventa un sesgo esperado', () => {
    const c = contrastarEtp(1000, 1000, null, null)!;
    expect(c.sesgo_esperado).toBeNull();
    expect(c.coincide).toBeNull();
  });

  it('una ETP de Penman cero o negativa no produce un cociente', () => {
    expect(contrastarEtp(1000, 0, 2, 50)).toBeNull();
  });
});

describe('guardas y constantes', () => {
  it('el valor por defecto de capacidad es el publicado por el USGS', () => {
    expect(AWC_POR_DEFECTO_MM).toBe(150);
  });

  it('un arreglo que no es de doce meses devuelve null', () => {
    expect(balanceCiclico([1, 2, 3], new Array(12).fill(10), 100)).toBeNull();
    expect(balanceCiclico(new Array(12).fill(10), [1, 2], 100)).toBeNull();
  });

  it('capacidad cero no divide por cero: cada mes vive de su lluvia', () => {
    const b = balanceCiclico(new Array(12).fill(30), new Array(12).fill(50), 0)!;
    expect(b.etr_mm).toBeCloseTo(360, 6);        // 12 × 30
    expect(b.deficit_mm).toBeCloseTo(240, 6);    // 12 × 20
    expect(b.excedente_mm).toBeCloseTo(0, 6);
    expect(b.advertencias.join(' ')).toContain('no guarda nada');
  });

  it('capacidad cero con lluvia de sobra manda todo a excedente', () => {
    const b = balanceCiclico(new Array(12).fill(80), new Array(12).fill(50), 0)!;
    expect(b.etr_mm).toBeCloseTo(600, 6);
    expect(b.excedente_mm).toBeCloseTo(360, 6);
    expect(b.deficit_mm).toBeCloseTo(0, 6);
  });

  it('un balance que no converge lo declara en vez de mostrarse como firme', () => {
    const b = balanceCiclico(PETROLINA_P, PETROLINA_ET0, PETROLINA_AWC, { ciclosMax: 1 })!;
    expect(b.convergio).toBe(false);
    expect(b.advertencias.join(' ')).toContain('no se estabilizó');
  });

  it('el cierre del balance se publica y da cero en todos los climas probados', () => {
    const climas: Array<[number[], number[], number]> = [
      [PETROLINA_P, PETROLINA_ET0, 125],
      [[95, 85, 90, 80, 75, 70, 60, 65, 75, 90, 95, 100], [14, 20, 38, 62, 95, 120, 135, 122, 88, 55, 24, 14], 300],
      [[110, 95, 80, 55, 30, 12, 5, 8, 40, 85, 105, 120], [18, 24, 42, 65, 100, 135, 155, 140, 100, 62, 28, 17], 125],
    ];
    for (const [P, E, awc] of climas) {
      for (const regla of ['thornthwaite', 'fao56'] as const) {
        const b = balanceCiclico(P, E, awc, { regla })!;
        expect(b.cierre_mm).toBeCloseTo(0, 2);
      }
    }
  });
});
