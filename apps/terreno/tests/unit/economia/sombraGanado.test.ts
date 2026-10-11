import { describe, it, expect } from 'vitest';
import {
  PIE_M, PIE2_M2,
  SOMBRA_AEN99, SOMBRA_NRCS, SOMBRA_UA_AZ,
  OPTIMO_VACA_FT2, FRAC_PRACTICA, FRAC_RODEO, coherenciaDelOptimo,
  filaDeCategoria, sombraDelRodeo, SIN_FILA_OVINOS,
  estructurasPortatiles, arbolesEquivalentes,
  PORTATIL_AEN99_PIE, PORTATIL_NRCS_PIE, CORTE_LUZ_MIN_PCT,
  presionVaporSat_kPa, humedadRelativaEn, indiceTempHumedad,
  UMBRALES_THI, T_CONFORT_MAX_F, T_CONFORT_MIN_F,
  thiDelMes, mesesQuePidenSombra, umbralDelRodeo,
  sombraEnElPiso, ubicacionDeLaSombra, RETIROS, DISTANCIA_AGUA_PIE,
  ORIENTACION_A_CAMPO, ORIENTACION_ENCIERRE,
} from '@/lib/sombraGanado';
import type { Rodeo } from '@/lib/rodeo';
import type { MesDato } from '@/lib/clima';
import { MESES } from '@/lib/clima';

// ─── Ayudas ───────────────────────────────────────────────────────────────────

function unLote(categoriaId: string, cabezas: number): Rodeo {
  return { lotes: [{ id: 'l1', categoriaId, cabezas, litros_animal_dia: null }], riego_m3_mes: 0, origen: 'manual' };
}

function mes(i: number, tmax: number, extra: Partial<MesDato> = {}): MesDato {
  const tmin = tmax - 10;
  return {
    mes: MESES[i] ?? '', precip_mm: 80, tmax_c: tmax, tmin_c: tmin,
    tmean_c: (tmax + tmin) / 2, etp_mm: 100, balance_mm: -20, viento_ms: 3,
    ...extra,
  };
}

/** Un año subtropical del hemisferio sur: verano en diciembre–marzo. */
function anioSubtropical(): MesDato[] {
  const calor = { rh_pct: 70, rocio_c: 18 };
  const frio  = { rh_pct: 70, rocio_c: 8 };
  return [
    mes(0, 31, calor), mes(1, 31, calor), mes(2, 29, calor),
    mes(3, 25, calor), mes(4, 21, frio),  mes(5, 18, frio),
    mes(6, 18, frio),  mes(7, 19, frio),  mes(8, 22, frio),
    mes(9, 25, calor), mes(10, 28, calor), mes(11, 31, calor),
  ];
}

const FT2 = (m2: number) => m2 / PIE2_M2;

// ─── Las tablas publicadas ────────────────────────────────────────────────────

describe('sombraGanado · las tablas, tal como se publican', () => {
  it('el pie cuadrado se deriva del pie y no se escribe aparte', () => {
    expect(PIE_M).toBe(0.3048);
    expect(PIE2_M2).toBeCloseTo(0.09290304, 10);
  });

  it('AEN-99 da rangos; NRCS y Arizona, un solo valor por fila', () => {
    for (const f of SOMBRA_AEN99) expect(f.ft2[1]).toBeGreaterThan(f.ft2[0]);
    for (const f of [...SOMBRA_NRCS, ...SOMBRA_UA_AZ]) expect(f.ft2[0]).toBe(f.ft2[1]);
  });

  it('los números son los impresos', () => {
    const aen = (id: string) => SOMBRA_AEN99.find(f => f.id === id)!.ft2;
    expect(aen('ternero_400lb')).toEqual([15, 20]);
    expect(aen('novillo_800lb')).toEqual([20, 25]);
    expect(aen('vaca_carne')).toEqual([30, 40]);
    expect(aen('vaca_leche')).toEqual([40, 50]);

    const nrcs = (id: string) => SOMBRA_NRCS.find(f => f.id === id)!.ft2[0];
    expect(nrcs('ternero_400lb')).toBe(23);
    expect(nrcs('novillo_800lb')).toBe(32);
    expect(nrcs('vaca_carne')).toBe(40);
    expect(nrcs('vaca_leche')).toBe(50);
    expect(nrcs('cerdo_cabra')).toBe(20);
    expect(nrcs('equino')).toBe(60);

    const az = (id: string) => SOMBRA_UA_AZ.find(f => f.id === id)!.ft2[0];
    expect(az('vaca_leche')).toBe(40);
    expect(az('ternero_400lb')).toBe(15);
    expect(az('novillo_800lb')).toBe(20);
    expect(az('vaca_carne')).toBe(30);
    expect(az('equino')).toBe(50);
    expect(az('cerdo_cabra')).toBe(10);
    expect(az('ave')).toBe(3);
  });

  it('LAS TRES FUENTES NO COINCIDEN, Y LAS TRES SE PRESENTAN COMO MÍNIMO', () => {
    const aen = SOMBRA_AEN99.find(f => f.id === 'vaca_carne')!.ft2;
    const nrcs = SOMBRA_NRCS.find(f => f.id === 'vaca_carne')!.ft2[0];
    const az = SOMBRA_UA_AZ.find(f => f.id === 'vaca_carne')!.ft2[0];
    // Para la misma vaca: 30 (Arizona), 30–40 (Kentucky) y 40 (Virginia).
    expect(az).toBe(30);
    expect(nrcs).toBe(40);
    expect(nrcs / az).toBeCloseTo(1.3333, 3);
    // Y la banda de Kentucky es exactamente el tramo entre las otras dos.
    expect(aen[0]).toBe(az);
    expect(aen[1]).toBe(nrcs);
  });

  it('del piso más bajo al techo del óptimo hay un factor 2,3', () => {
    const az = SOMBRA_UA_AZ.find(f => f.id === 'vaca_carne')!.ft2[0];
    expect(OPTIMO_VACA_FT2[1] / az).toBeCloseTo(2.333, 2);
  });

  it('EL TECHO DE LA TABLA PRÁCTICA ES EL PISO DEL ÓPTIMO: el 75 % cierra abajo y no arriba', () => {
    const c = coherenciaDelOptimo();
    // 40 × 0,75 = 30 justo: el extremo de abajo de la tabla es el 75 % del óptimo.
    expect(c.piso_cierra).toBe(true);
    // 70 × 0,75 = 52,5, y la tabla dice 40. El 75 % NO describe el extremo de arriba.
    expect(c.techo_cierra).toBe(false);
    expect(c.techo_esperado_ft2).toBe(52.5);
    expect(c.techo_practico_ft2).toBe(40);
    // Y acá está lo que importa: el número más alto de la tabla ES el más bajo del óptimo.
    expect(c.techo_practico_ft2).toBe(OPTIMO_VACA_FT2[0]);
  });

  it('los dos 75 % son cosas distintas, y multiplicarlos deja el 56 % del óptimo', () => {
    expect(FRAC_PRACTICA).toBe(0.75);
    expect(FRAC_RODEO).toBe(0.75);
    expect(FRAC_PRACTICA * FRAC_RODEO).toBeCloseTo(0.5625, 4);
  });

  it('la altura mínima de techo la publica una sola de las tres', () => {
    expect(SOMBRA_UA_AZ.every(f => f.alturaMin_pie !== null)).toBe(true);
    expect(SOMBRA_AEN99.every(f => f.alturaMin_pie === null)).toBe(true);
    // El equino pide más alto que el bovino, y el cerdo menos. Las dos fuentes
    // que la dan coinciden en el 7 del cerdo.
    expect(SOMBRA_UA_AZ.find(f => f.id === 'equino')!.alturaMin_pie).toBe(12);
    expect(SOMBRA_UA_AZ.find(f => f.id === 'vaca_carne')!.alturaMin_pie).toBe(10);
    expect(SOMBRA_UA_AZ.find(f => f.id === 'cerdo_cabra')!.alturaMin_pie).toBe(7);
    expect(SOMBRA_NRCS.find(f => f.id === 'cerdo_cabra')!.alturaMin_pie).toBe(7);
  });

  it('la tabla NO es proporcional al peso, así que no hay regla de pies² por kilo', () => {
    // 23 pies² para 181 kg son 0,127 por kilo; 32 para 363 kg, 0,088. Una regla
    // lineal contradiría a la fuente en el primer renglón.
    const porKiloTernero = 23 / 181;
    const porKiloNovillo = 32 / 363;
    expect(porKiloTernero).toBeGreaterThan(porKiloNovillo * 1.3);
  });
});

// ─── De la categoría de acequia a la fila ─────────────────────────────────────

describe('sombraGanado · el mapeo de categorías', () => {
  it('lee las tres fuentes para la misma categoría', () => {
    const f = filaDeCategoria('bovino_vaca_prom');
    expect(f.filaId).toBe('vaca_carne');
    expect(f.aen99!.ft2).toEqual([30, 40]);
    expect(f.nrcs!.ft2[0]).toBe(40);
    expect(f.arizona!.ft2[0]).toBe(30);
  });

  it('el toro no tiene fila propia: se lee la de la vaca y se dice que es un piso', () => {
    const f = filaDeCategoria('bovino_toro');
    expect(f.filaId).toBe('vaca_carne');
    expect(f.nota).toContain('piso');
    expect(f.nota).toContain('700');
  });

  it('EL OVINO NO TIENE FILA PUBLICADA Y NO SE INVENTA UNA', () => {
    for (const id of ['ovino_oveja', 'ovino_borrego', 'ovino_carnero']) {
      expect(filaDeCategoria(id).filaId).toBeNull();
    }
    expect(SIN_FILA_OVINOS).toContain('no se inventa');
  });

  it('la cabra sale de Arizona, que es la única que la nombra, y avisa del factor 2', () => {
    const f = filaDeCategoria('caprino');
    expect(f.filaId).toBe('cerdo_cabra');
    expect(f.arizona!.ft2[0]).toBe(10);
    expect(f.nrcs!.ft2[0]).toBe(20);
    expect(f.nota).toContain('factor 2');
  });
});

// ─── El caso resuelto de la literatura ────────────────────────────────────────

describe('sombraGanado · el caso resuelto de AEN-99', () => {
  // «a 30-cow beef herd would require 900 to 1,200 square feet of shade, or five
  // to six portable shades (each 10 x 20 ft)».
  const r = sombraDelRodeo(unLote('bovino_vaca_prom', 30));

  it('30 vacas de carne piden 900 a 1.200 pies² de sombra', () => {
    expect(FT2(r.aen99_m2[0])).toBeCloseTo(900, 6);
    expect(FT2(r.aen99_m2[1])).toBeCloseTo(1200, 6);
    expect(r.aen99_m2[0]).toBeCloseTo(83.6127, 3);
    expect(r.aen99_m2[1]).toBeCloseTo(111.4836, 3);
    expect(r.cabezasConFila).toBe(30);
    expect(r.cabezasSinFila).toBe(0);
  });

  it('y se cubren con cinco a seis sombras portátiles de 10 × 20 pies', () => {
    const e = estructurasPortatiles(r.aen99_m2);
    // 200 pies² son 18,58 m²; el campo de pantalla viene redondeado a 18,6 y el
    // conteo usa el valor exacto, que es la razón del test de abajo.
    expect(e.unidad_aen99_m2).toBeCloseTo(18.6, 1);
    expect(e.n_aen99).toEqual([5, 6]);
  });

  it('UN MÚLTIPLO EXACTO NO PAGA UNA SOMBRA DE MÁS', () => {
    // 1.200 / 200 = 6 justo. Si el área se redondeara antes del `ceil`, acá
    // saldrían siete. Es la razón por la que el motor no redondea.
    const e = estructurasPortatiles([111.483648, 111.483648]);
    expect(e.n_aen99).toEqual([6, 6]);
    const redondeado = estructurasPortatiles([111.5, 111.5]);
    expect(redondeado.n_aen99[0]).toBe(7);   // lo que pasaría con el área de pantalla
  });

  it('las otras dos fuentes caen justo en los extremos de la banda de Kentucky', () => {
    expect(r.arizona_m2).toBeCloseTo(r.aen99_m2[0], 6);
    expect(r.nrcs_m2).toBeCloseTo(r.aen99_m2[1], 6);
    expect(r.advertencias.some(a => a.includes('no coinciden entre sí'))).toBe(true);
  });

  it('el óptimo publicado pide casi el doble que la tabla práctica', () => {
    expect(FT2(r.optimo_m2![0])).toBeCloseTo(1200, 6);
    expect(FT2(r.optimo_m2![1])).toBeCloseTo(2100, 6);
    expect(r.cabezasConOptimo).toBe(30);
    // El piso del óptimo es el techo de la tabla: el mismo número.
    expect(r.optimo_m2![0]).toBeCloseTo(r.aen99_m2[1], 6);
  });

  it('con sombra para el 75 % del rodeo la superficie baja a tres cuartos', () => {
    expect(r.parcial_m2[0]).toBeCloseTo(r.aen99_m2[0] * 0.75, 6);
    expect(r.parcial_m2[1]).toBeCloseTo(r.aen99_m2[1] * 0.75, 6);
  });

  it('la altura mínima de techo del bovino son 10 pies, o 3 m', () => {
    expect(r.alturaMin_m).toBeCloseTo(3.0, 1);
  });

  it('avisa que el techo de la tabla no es un techo', () => {
    expect(r.advertencias.some(a => a.includes('el piso del óptimo'))).toBe(true);
  });

  it('avisa que el número es por cabeza por el aire y no por que entren', () => {
    expect(r.advertencias.some(a => a.includes('movimiento de aire'))).toBe(true);
  });
});

describe('sombraGanado · el rodeo completo', () => {
  it('los ovinos se cuentan aparte en vez de entrar con la fila de otro', () => {
    const r = sombraDelRodeo({
      lotes: [
        { id: 'a', categoriaId: 'bovino_vaca_prom', cabezas: 30, litros_animal_dia: null },
        { id: 'b', categoriaId: 'ovino_oveja',      cabezas: 50, litros_animal_dia: null },
      ],
      riego_m3_mes: 0, origen: 'manual',
    });
    expect(r.cabezasConFila).toBe(30);
    expect(r.cabezasSinFila).toBe(50);
    // La superficie es la de las 30 vacas: las ovejas no suman ni restan.
    expect(FT2(r.aen99_m2[1])).toBeCloseTo(1200, 6);
    expect(r.advertencias).toContain(SIN_FILA_OVINOS);
    expect(r.lotes.find(l => l.loteId === 'b')!.aen99_m2).toBeNull();
  });

  it('suma lote por lote con la fila de cada categoría', () => {
    const r = sombraDelRodeo({
      lotes: [
        { id: 'a', categoriaId: 'bovino_vaca_cria',      cabezas: 40, litros_animal_dia: null },
        { id: 'b', categoriaId: 'bovino_vaquillona_1_2', cabezas: 12, litros_animal_dia: null },
        { id: 'c', categoriaId: 'bovino_toro',           cabezas: 2,  litros_animal_dia: null },
      ],
      riego_m3_mes: 0, origen: 'manual',
    });
    // 42 adultos a 30–40 + 12 de recría a 20–25
    expect(FT2(r.aen99_m2[0])).toBeCloseTo(42 * 30 + 12 * 20, 6);
    expect(FT2(r.aen99_m2[1])).toBeCloseTo(42 * 40 + 12 * 25, 6);
    expect(r.cabezasConFila).toBe(54);
    // El óptimo sólo corre para los adultos, que es la única fila que lo tiene.
    expect(r.cabezasConOptimo).toBe(42);
    expect(r.advertencias.some(a => a.includes('Toro'))).toBe(true);
  });

  it('un rodeo vacío no pide sombra ni inventa advertencias', () => {
    const r = sombraDelRodeo({ lotes: [], riego_m3_mes: 0, origen: 'manual' });
    expect(r.aen99_m2).toEqual([0, 0]);
    expect(r.optimo_m2).toBeNull();
    expect(r.advertencias).toHaveLength(0);
  });
});

describe('sombraGanado · con qué se hace la sombra', () => {
  it('los dos topes de unidad portátil difieren 5,25 veces', () => {
    const uA = PORTATIL_AEN99_PIE[0] * PORTATIL_AEN99_PIE[1];
    const uN = PORTATIL_NRCS_PIE[0] * PORTATIL_NRCS_PIE[1];
    expect(uA).toBe(200);
    expect(uN).toBe(1050);
    expect(uN / uA).toBeCloseTo(5.25, 4);
    const e = estructurasPortatiles([83.612736, 111.483648]);
    expect(e.n_aen99).toEqual([5, 6]);
    expect(e.n_nrcs).toEqual([1, 2]);
    expect(e.advertencias.some(a => a.includes('5,25'))).toBe(true);
    expect(e.advertencias.some(a => a.includes(String(CORTE_LUZ_MIN_PCT)))).toBe(true);
  });

  it('un árbol de copa 10 m da 78,5 m² de sombra', () => {
    const a = arbolesEquivalentes([83.612736, 111.483648], 10)!;
    expect(a.area_copa_m2).toBeCloseTo(78.5, 1);
    expect(a.n).toEqual([2, 2]);
    const chicos = arbolesEquivalentes([83.612736, 111.483648], 6)!;
    expect(chicos.n).toEqual([3, 4]);
  });

  it('avisa que poner de menos no da menos sombra: mata los árboles', () => {
    const a = arbolesEquivalentes([100, 100], 8)!;
    expect(a.advertencias.some(x => x.includes('se mueren'))).toBe(true);
    expect(a.advertencias.some(x => x.includes('copa madura'))).toBe(true);
  });

  it('una copa de cero o negativa no devuelve un número', () => {
    expect(arbolesEquivalentes([100, 100], 0)).toBeNull();
    expect(arbolesEquivalentes([100, 100], -3)).toBeNull();
  });
});

// ─── El índice, contra casos publicados ───────────────────────────────────────

describe('sombraGanado · presión de vapor, contra la tabla de FAO-56', () => {
  it('reproduce la tabla 2 del anexo: 0,611 · 2,338 · 4,243 kPa', () => {
    expect(presionVaporSat_kPa(0)).toBeCloseTo(0.611, 3);
    expect(presionVaporSat_kPa(20)).toBeCloseTo(2.338, 3);
    expect(presionVaporSat_kPa(30)).toBeCloseTo(4.243, 2);
  });

  it('a la temperatura del rocío la humedad es 100 %, por definición', () => {
    expect(humedadRelativaEn(18, 18)).toBeCloseTo(100, 6);
    expect(humedadRelativaEn(31, 31)).toBeCloseTo(100, 6);
  });

  it('nunca pasa de 100 ni baja de 0, aunque el dato venga mal', () => {
    expect(humedadRelativaEn(10, 25)).toBe(100);   // rocío arriba de la temperatura
    expect(humedadRelativaEn(40, -40)).toBeGreaterThanOrEqual(0);
    expect(humedadRelativaEn(40, -40)).toBeLessThan(1);
  });
});

describe('sombraGanado · el ITH y sus umbrales', () => {
  it('DOS FUENTES QUE NO SE CITAN DAN EL MISMO PUNTO: 77 °F con 50 % de humedad son ITH 72', () => {
    // AEN-99: «When temperatures are over 77° F, cattle may begin to experience
    // heat stress». El umbral publicado del bovino en terminación es 72. A 25 °C
    // —que son 77 °F justos— y 50 % de humedad, el índice NRC (1971) da 72.
    expect(1.8 * 25 + 32).toBe(T_CONFORT_MAX_F);
    expect(indiceTempHumedad(25, 50)).toBeCloseTo(UMBRALES_THI.bovino_carne_engorde, 1);
    expect(T_CONFORT_MIN_F).toBe(41);
  });

  it('30 °C con 50 % de humedad dan 78,5', () => {
    expect(indiceTempHumedad(30, 50)).toBeCloseTo(78.5, 1);
  });

  it('sube con la temperatura y con la humedad, y no al revés', () => {
    expect(indiceTempHumedad(30, 50)).toBeGreaterThan(indiceTempHumedad(25, 50));
    expect(indiceTempHumedad(30, 80)).toBeGreaterThan(indiceTempHumedad(30, 30));
  });

  it('LOS UMBRALES NO SIGUEN AL TAMAÑO NI A LA EDAD', () => {
    // La vaca de tambo en producción es la MÁS sensible de todas, y la
    // vaquillona de menos de un año la MÁS resistente. Quien ordene los
    // umbrales por tamaño va a elegir el equivocado.
    expect(UMBRALES_THI.bovino_leche).toBe(70);
    expect(UMBRALES_THI.bovino_leche_vaq_0_1).toBe(77);
    expect(UMBRALES_THI.bovino_leche_vaq_0_1).toBeGreaterThan(UMBRALES_THI.bovino_leche);
    expect(UMBRALES_THI.bovino_carne).toBe(75);
    expect(UMBRALES_THI.bovino_carne_engorde).toBe(72);
    expect(UMBRALES_THI.bovino_carne_engorde).toBeLessThan(UMBRALES_THI.bovino_carne);
  });
});

describe('sombraGanado · la humedad de la hora de calor', () => {
  const m = mes(0, 31, { rh_pct: 70, rocio_c: 18 });

  it('LA HUMEDAD MEDIA DEL DÍA PEGADA A LA MÁXIMA INFLA EL ÍNDICE', () => {
    const t = thiDelMes(m, 0)!;
    // Con el rocío, la humedad a los 31 °C es 46 %, no el 70 % medio del día.
    expect(t.rh_pico_pct).toBe(46);
    expect(t.rh_media_pct).toBe(70);
    expect(t.origenHumedad).toBe('rocio');
    expect(t.thi).toBeCloseTo(79.2, 1);
    expect(t.thi_humedad_media).toBeCloseTo(83.0, 1);
    // Casi cuatro puntos de índice de diferencia, del lado de pedir más sombra.
    expect(t.thi_humedad_media! - t.thi).toBeCloseTo(3.8, 1);
  });

  it('sin rocío usa la media y lo dice, en vez de devolver el número callado', () => {
    const t = thiDelMes(mes(0, 31, { rh_pct: 70 }), 0)!;
    expect(t.origenHumedad).toBe('media');
    expect(t.thi).toBeCloseTo(83.0, 1);
    expect(t.thi_humedad_media).toBeNull();
    expect(t.advertencias.some(a => a.includes('24 horas'))).toBe(true);
  });

  it('sin humedad de ninguna clase no hay índice', () => {
    expect(thiDelMes(mes(0, 31), 0)).toBeNull();
  });

  it('un rocío arriba de la máxima topea la humedad y lo avisa', () => {
    const t = thiDelMes(mes(0, 20, { rocio_c: 25 }), 0)!;
    expect(t.rh_pico_pct).toBe(100);
    expect(t.advertencias.some(a => a.includes('no puede ser'))).toBe(true);
  });
});

describe('sombraGanado · qué meses piden sombra', () => {
  const anio = anioSubtropical();

  it('marca el verano y deja afuera el invierno', () => {
    const r = mesesQuePidenSombra(anio, 'bovino_carne')!;
    expect(r.umbral).toBe(75);
    expect(r.meses).toHaveLength(12);
    expect(r.piden.map(m => m.mes)).toEqual(['Ene', 'Feb', 'Mar', 'Nov', 'Dic']);
    expect(r.pico!.thi).toBeCloseTo(79.2, 1);
    expect(r.margen_pico).toBeCloseTo(4.2, 1);
  });

  it('bajar el umbral agrega meses, nunca los quita', () => {
    const carne   = mesesQuePidenSombra(anio, 'bovino_carne')!;
    const engorde = mesesQuePidenSombra(anio, 'bovino_carne_engorde')!;
    expect(engorde.umbral).toBeLessThan(carne.umbral);
    expect(engorde.piden.length).toBeGreaterThanOrEqual(carne.piden.length);
    for (const m of carne.piden) expect(engorde.piden.map(x => x.mes)).toContain(m.mes);
  });

  it('INFORMA PUNTOS SOBRE EL UMBRAL Y NO UNA ESCALERA INVENTADA', () => {
    const r = mesesQuePidenSombra(anio, 'bovino_carne')!;
    // Lo que sale es cuánto pasa del umbral publicado. Las bandas de
    // alerta/peligro/emergencia aparecen con cortes distintos en cada
    // publicación, así que acá no hay ninguna.
    expect(typeof r.margen_pico).toBe('number');
    expect(r.advertencias.some(a => a.includes('ola de calor'))).toBe(true);
    expect(r.advertencias.some(a => a.includes('cebú'))).toBe(true);
  });

  it('cuando ningún mes pasa el umbral dice que la sombra igual sirve', () => {
    const frio = anio.map((m, i) => mes(i, 15, { rh_pct: 70, rocio_c: 5 }));
    const r = mesesQuePidenSombra(frio, 'bovino_carne')!;
    expect(r.piden).toHaveLength(0);
    expect(r.advertencias.some(a => a.includes('reparte el pastoreo'))).toBe(true);
  });

  it('cuando pasan los doce, lo nombra como infraestructura', () => {
    const tropico = anio.map((m, i) => mes(i, 33, { rh_pct: 80, rocio_c: 24 }));
    const r = mesesQuePidenSombra(tropico, 'bovino_carne')!;
    expect(r.piden).toHaveLength(12);
    expect(r.advertencias.some(a => a.includes('infraestructura'))).toBe(true);
  });

  it('sin meses no devuelve nada', () => {
    expect(mesesQuePidenSombra([], 'bovino_carne')).toBeNull();
  });

  it('el umbral del rodeo lo manda la categoría más sensible', () => {
    expect(umbralDelRodeo(unLote('bovino_vaca_prom', 30))!.tipo).toBe('bovino_carne');
    const conEngorde = umbralDelRodeo({
      lotes: [
        { id: 'a', categoriaId: 'bovino_vaca_prom',      cabezas: 30, litros_animal_dia: null },
        { id: 'b', categoriaId: 'bovino_novillo_engorde', cabezas: 5, litros_animal_dia: null },
      ],
      riego_m3_mes: 0, origen: 'manual',
    })!;
    expect(conEngorde.tipo).toBe('bovino_carne_engorde');
    expect(conEngorde.porque).toContain('más sensible');
    // Sin bovinos no hay umbral publicado que aplicar.
    expect(umbralDelRodeo(unLote('ovino_oveja', 100))).toBeNull();
  });
});

// ─── Dónde cae y dónde va ─────────────────────────────────────────────────────

describe('sombraGanado · dónde cae la sombra', () => {
  it('en el hemisferio sur el sol de enero está más alto que el de julio', () => {
    const enero = sombraEnElPiso(-30, 0, 3.05)!;
    const julio = sombraEnElPiso(-30, 6, 3.05)!;
    expect(enero.elevacion_mediodia).toBeGreaterThan(julio.elevacion_mediodia);
    expect(enero.elevacion_mediodia).toBeCloseTo(81.3, 0);
    expect(julio.elevacion_mediodia).toBeCloseTo(38.5, 0);
  });

  it('LA SOMBRA DEL MEDIODÍA NO ES LA QUE EL ANIMAL USA', () => {
    const enero = sombraEnElPiso(-30, 0, 3.05)!;
    // Al mediodía la sombra está medio metro de la estructura; tres horas
    // después, cuando el aire está más caliente, está a dos metros y medio.
    expect(enero.corrimiento_mediodia_m).toBeCloseTo(0.5, 1);
    expect(enero.corrimiento_tarde_m).toBeCloseTo(2.7, 1);
    expect(enero.corrimiento_tarde_m!).toBeGreaterThan(enero.corrimiento_mediodia_m! * 4);
    expect(enero.notas.some(n => n.includes('área del techo'))).toBe(true);
  });

  it('el espejo del norte da la misma geometría con los meses dados vuelta', () => {
    const sur   = sombraEnElPiso(-30, 0, 3)!;
    const norte = sombraEnElPiso(30, 6, 3)!;
    expect(norte.elevacion_mediodia).toBeCloseTo(sur.elevacion_mediodia, 0);
  });

  it('nombra las dos orientaciones publicadas y para qué es cada una', () => {
    const s = sombraEnElPiso(-30, 0, 3)!;
    expect(ORIENTACION_A_CAMPO).toBe('norte-sur');
    expect(ORIENTACION_ENCIERRE).toBe('este-oeste');
    expect(s.notas.some(n => n.includes(ORIENTACION_A_CAMPO) && n.includes('seque'))).toBe(true);
  });

  it('rechaza mes fuera de rango y altura no positiva', () => {
    expect(sombraEnElPiso(-30, 12, 3)).toBeNull();
    expect(sombraEnElPiso(-30, -1, 3)).toBeNull();
    expect(sombraEnElPiso(-30, 0, 0)).toBeNull();
  });
});

describe('sombraGanado · dónde va la sombra', () => {
  const u = ubicacionDeLaSombra();

  it('pasa los retiros publicados a metros', () => {
    expect(RETIROS.aguaSuperficial).toBe(200);
    expect(u.retiros_m.aguaSuperficial).toBeCloseTo(61.0, 1);
    expect(u.retiros_m.pozoAguasArriba).toBeCloseTo(45.7, 1);
    expect(u.retiros_m.pozoAguasAbajo).toBeCloseTo(91.4, 1);
    expect(u.retiros_m.obstruccionAire).toBeCloseTo(15.2, 1);
    expect(DISTANCIA_AGUA_PIE).toBe(800);
    expect(u.distancia_agua_m).toBeCloseTo(243.8, 1);
  });

  it('NO HAY RADIO DE USO DE LA SOMBRA PUBLICADO, Y ESO SE DICE', () => {
    expect(u.advertencias.some(a => a.includes('a qué distancia tiene que estar la sombra'))).toBe(true);
    expect(u.advertencias.some(a => a.includes('nadie publicó'))).toBe(true);
  });

  it('la regla publicada va al revés de la intuición: lejos del agua, no al lado', () => {
    expect(u.reglas.some(r => r.includes('no va al lado del agua'))).toBe(true);
    expect(u.reglas.some(r => r.includes('patrón de pastoreo'))).toBe(true);
    expect(u.reglas.some(r => r.includes('arroyo'))).toBe(true);
  });

  it('los árboles van del lado oeste, que es de donde viene el sol de la tarde', () => {
    expect(u.advertencias.some(a => a.includes('oeste'))).toBe(true);
  });
});
