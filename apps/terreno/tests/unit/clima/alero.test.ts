import { describe, it, expect } from 'vitest';
import {
  ADAPTATIVO_CONSTANTE_C,
  ADAPTATIVO_PENDIENTE,
  BANDA_80_C,
  INCLINACION_MIN_LLUVIA,
  ORIENTACIONES,
  aleroDeUnaPared,
  aleroPorOrientacion,
  anchoAleta,
  angulosDeSombra,
  controlSolar,
  costoDeLaSimetria,
  desempenoAlero,
  desfaseSolarMin,
  ecuacionDelTiempoMin,
  factorProyeccion,
  fechaDeDoy,
  gemeloSolar,
  gemeloSolarDoy,
  hhmm,
  horaSolarDeReloj,
  inclinacionPanel,
  mesDeDoy,
  meridianoNominal,
  periodoSobrecalentado,
  profundidadAlero,
  relojDeHoraSolar,
  solDeLosDosLados,
} from '@/lib/alero';
import { posicionSolar } from '@/lib/arco_solar';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * EL CASO RESUELTO
 *
 * UN-Habitat, «Sun shading catalogue», 2018, publica para seis localidades de
 * África oriental el ángulo de corte (VSA) y el factor de proyección (PF) de un
 * alero que sombrea la abertura **todos los meses, de 9 a 16**. Las seis están
 * en el huso de África oriental, meridiano estándar 45° E.
 *
 * El catálogo dice «9 AM to 4 PM» sin aclarar de qué hora habla, y ahí está la
 * mitad del hallazgo: esos números sólo se reproducen si la ventana se lee como
 * hora de RELOJ y se corrige por la longitud. Mbeya es la prueba: está 11,5° al
 * oeste de su meridiano y su pared al este pide un alero 28 % más profundo que
 * la de Mtwara, que está a la misma latitud.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const MERIDIANO_EAT = 45;

/** Los mismos centros de mes que usa el módulo. */
const DOY_MEDIO_TEST = [17, 47, 75, 105, 135, 162, 198, 228, 259, 289, 319, 345] as const;

interface SitioPublicado {
  nombre: string;
  lat: number;
  lng: number;
  /** VSA y PF publicados para norte, este, sur y oeste. */
  pub: Record<number, readonly [number, number]>;
}

const PUBLICADOS: readonly SitioPublicado[] = [
  {
    nombre: 'Garissa, Kenia',
    lat: -(27 / 60 + 25 / 3600), lng: 39 + 39 / 60 + 30 / 3600,
    pub: { 0: [55, 0.70], 90: [39, 1.23], 180: [56, 0.67], 270: [36, 1.40] },
  },
  {
    nombre: 'Makindu, Kenia',
    lat: -(2 + 16.5 / 60), lng: 37 + 49 / 60 + 12 / 3600,
    pub: { 0: [52, 0.78], 90: [37, 1.35], 180: [57, 0.65], 270: [37, 1.34] },
  },
  {
    nombre: 'Mombasa, Kenia',
    lat: -(4 + 3 / 60), lng: 39 + 40 / 60,
    pub: { 0: [52, 0.80], 90: [38, 1.29], 180: [60, 0.58], 270: [34, 1.47] },
  },
  {
    nombre: 'Dar es Salaam, Tanzania',
    lat: -(6 + 48 / 60), lng: 39 + 17 / 60,
    pub: { 0: [49, 0.88], 90: [36, 1.36], 180: [62, 0.52], 270: [33, 1.51] },
  },
  {
    nombre: 'Mbeya, Tanzania',
    lat: -(8 + 54 / 60), lng: 33 + 27 / 60,
    pub: { 0: [43, 1.09], 90: [29, 1.78], 180: [66, 0.45], 270: [39, 1.25] },
  },
  {
    nombre: 'Mtwara, Tanzania',
    lat: -(10 + 16 / 60 + 25 / 3600), lng: 40 + 10 / 60 + 58 / 3600,
    pub: { 0: [46, 0.98], 90: [36, 1.39], 180: [66, 0.44], 270: [31, 1.67] },
  },
];

const OPC_PUBLICADO = { meridiano: MERIDIANO_EAT, ventana: [9, 16] as const };

/** 1 m de abertura para que la profundidad en metros sea el PF. */
function corte(s: SitioPublicado, az: number) {
  return aleroDeUnaPared(s.lat, s.lng, az, 1, OPC_PUBLICADO)!;
}

// ── Series climáticas de prueba ───────────────────────────────────────────────

/** Buenos Aires (Servicio Meteorológico Nacional, normales 1991-2020, redondeadas). */
const BA_TMEAN = [24.9, 23.6, 21.9, 17.7, 14.4, 11.6, 11.0, 12.6, 14.8, 17.9, 20.9, 23.3];
const BA_TMAX = [30.4, 28.9, 26.9, 22.9, 19.4, 16.3, 15.6, 17.8, 19.9, 23.0, 26.1, 28.7];

/** Garissa, Kenia: equatorial y caliente los doce meses. */
const GAR_TMEAN = [28.4, 29.3, 30.1, 29.3, 28.1, 26.8, 26.0, 26.3, 27.4, 28.6, 28.3, 28.1];
const GAR_TMAX = [35.1, 36.2, 37.0, 35.8, 34.1, 32.6, 31.7, 32.1, 33.6, 35.0, 34.6, 34.4];

/** Bariloche: ningún mes pasa el techo de confort. */
const BAR_TMEAN = [15.0, 14.6, 12.3, 8.7, 5.3, 2.9, 2.4, 3.6, 6.1, 9.3, 11.8, 13.9];
const BAR_TMAX = [22.6, 22.1, 19.3, 14.7, 10.2, 7.1, 6.8, 8.6, 11.8, 15.6, 18.7, 21.2];

// ─────────────────────────────────────────────────────────────────────────────

describe('los dos ángulos de sombra (CBD-59)', () => {
  it('con el sol en el eje de la pared el VSA ES la elevación', () => {
    const a = angulosDeSombra(50, 0, 0)!;
    expect(a.hsa).toBeCloseTo(0, 10);
    expect(a.vsa).toBeCloseTo(50, 8);
  });

  it('EL VSA NO ES LA ELEVACIÓN, Y ESO ES TODA LA DIFERENCIA CON EL ENUNCIADO', () => {
    // Misma elevación, pared girada 60°: el ángulo que tapa el alero sube 20°.
    const eje = angulosDeSombra(50, 0, 0)!;
    const girada = angulosDeSombra(50, 60, 0)!;
    expect(girada.hsa).toBeCloseTo(60, 8);
    expect(girada.vsa).toBeGreaterThan(eje.vsa);
    expect(girada.vsa).toBeCloseTo(67.24, 1);
    // Y el alero que hace falta es MENOS profundo, no más: 1/tan crece al revés.
    expect(factorProyeccion(girada.vsa)).toBeLessThan(factorProyeccion(eje.vsa));
  });

  it('reproduce la ecuación publicada tan VSA = tan ALT / cos HSA', () => {
    for (const alt of [10, 35, 70]) {
      for (const hsa of [0, 25, 55, 85]) {
        const a = angulosDeSombra(alt, hsa, 0)!;
        const esperado = Math.atan(Math.tan(alt * Math.PI / 180) / Math.cos(hsa * Math.PI / 180)) * 180 / Math.PI;
        expect(a.vsa).toBeCloseTo(esperado, 10);
      }
    }
  });

  it('el sol detrás de la pared no pide alero y devuelve null', () => {
    expect(angulosDeSombra(50, 90, 0)).toBeNull();     // exactamente de costado
    expect(angulosDeSombra(50, 180, 0)).toBeNull();    // a la espalda
    expect(angulosDeSombra(-5, 0, 0)).toBeNull();      // bajo el horizonte
  });

  it('el factor de proyección es 1/tan del corte, y la profundidad lo escala', () => {
    expect(factorProyeccion(45)).toBeCloseTo(1, 10);
    expect(factorProyeccion(63.43)).toBeCloseTo(0.5, 3);
    expect(profundidadAlero(2.4, 45)).toBeCloseTo(2.4, 10);
    expect(anchoAleta(1.2, 45)).toBeCloseTo(1.2, 10);
  });
});

describe('el caso resuelto: las seis localidades de UN-Habitat', () => {
  it('REPRODUCE LOS 12 VALORES DE ESTE Y OESTE CON MENOS DE 1° DE ERROR', () => {
    // Este y oeste son los que el método fija en un instante franco, no rasante,
    // y ahí el cálculo coincide con la tabla casi exactamente.
    const errores: number[] = [];
    for (const s of PUBLICADOS) {
      for (const az of [90, 270]) {
        const [vsaPub] = s.pub[az]!;
        errores.push(Math.abs(corte(s, az).vsa_corte - vsaPub));
      }
    }
    expect(errores).toHaveLength(12);
    expect(Math.max(...errores)).toBeLessThan(1);
  });

  it('reproduce los 24 valores con 5,5° de error máximo y 1,4° medio', () => {
    const errores: number[] = [];
    for (const s of PUBLICADOS) {
      for (const az of [0, 90, 180, 270]) {
        errores.push(Math.abs(corte(s, az).vsa_corte - s.pub[az]![0]));
      }
    }
    expect(errores).toHaveLength(24);
    const medio = errores.reduce((a, b) => a + b, 0) / errores.length;
    expect(Math.max(...errores)).toBeLessThan(5.5);
    expect(medio).toBeLessThan(1.4);
  });

  it('en norte y sur el cálculo pide SIEMPRE un alero igual o más profundo que la tabla', () => {
    // La diferencia tiene una sola dirección, y conviene que sea esta: el
    // mínimo real cae en un instante rasante que una lectura a mano sobre la
    // carta no alcanza. El cálculo queda del lado de más sombra.
    for (const s of PUBLICADOS) {
      for (const az of [0, 180]) {
        expect(corte(s, az).vsa_corte).toBeLessThanOrEqual(s.pub[az]![0] + 0.2);
      }
    }
  });

  it('el PF publicado es 1/tan del VSA publicado, que es la identidad de la fuente', () => {
    for (const s of PUBLICADOS) {
      for (const az of [0, 90, 180, 270]) {
        const [vsa, pf] = s.pub[az]!;
        expect(factorProyeccion(vsa)).toBeCloseTo(pf, 1);
      }
    }
  });
});

describe('la longitud dentro del huso, que el enunciado no tenía', () => {
  it('MBEYA Y MTWARA ESTÁN A LA MISMA LATITUD Y PIDEN ALEROS MUY DISTINTOS', () => {
    const mbeya = PUBLICADOS[4]!;
    const mtwara = PUBLICADOS[5]!;
    expect(Math.abs(mbeya.lat - mtwara.lat)).toBeLessThan(1.4);   // 1,4° de latitud
    // Y sin embargo la pared al este pide 1,78 contra 1,39: un 28 % más.
    expect(mbeya.pub[90]![1] / mtwara.pub[90]![1]).toBeGreaterThan(1.25);
    const cMbeya = corte(mbeya, 90);
    const cMtwara = corte(mtwara, 90);
    expect(cMbeya.pf / cMtwara.pf).toBeGreaterThan(1.2);
  });

  it('y la razón es el desfase solar, no la latitud', () => {
    const mbeya = PUBLICADOS[4]!;
    const mtwara = PUBLICADOS[5]!;
    expect(desfaseSolarMin(mbeya.lng, MERIDIANO_EAT)).toBeCloseTo(-46.2, 0);
    expect(desfaseSolarMin(mtwara.lng, MERIDIANO_EAT)).toBeCloseTo(-19.3, 0);
  });

  it('leer la ventana como hora solar en vez de reloj cambia el alero un 20 %', () => {
    const mbeya = PUBLICADOS[4]!;
    const comoReloj = corte(mbeya, 90);
    // Misma ventana numérica, pero tomada como hora solar: desfase cero.
    const comoSolar = aleroDeUnaPared(mbeya.lat, mbeya.lng, 90, 1, {
      meridiano: mbeya.lng, ventana: [9, 16],
    })!;
    expect(Math.abs(comoReloj.pf - comoSolar.pf) / comoSolar.pf).toBeGreaterThan(0.2);
  });

  it('en Mendoza el mediodía solar cae pasadas las 13:30 del huso nominal', () => {
    // Argentina usa por ley el huso de 45° O y llega a 73° O: el caso extremo
    // de lo que el catálogo deja implícito.
    const lngMendoza = -68.85;
    expect(meridianoNominal(lngMendoza)).toBe(-75);
    expect(relojDeHoraSolar(12, lngMendoza, -45)).toBeGreaterThan(13.5);
    expect(hhmm(relojDeHoraSolar(12, lngMendoza, -45))).toBe('13:35');
  });

  it('ida y vuelta de hora de reloj a hora solar', () => {
    expect(horaSolarDeReloj(relojDeHoraSolar(14.25, 30, 45), 30, 45)).toBeCloseTo(14.25, 10);
    expect(desfaseSolarMin(45, 45)).toBeCloseTo(0, 10);
  });

  it('la ecuación del tiempo existe, vale hasta un cuarto de hora y queda afuera a propósito', () => {
    let maxAbs = 0;
    for (let doy = 1; doy <= 365; doy++) maxAbs = Math.max(maxAbs, Math.abs(ecuacionDelTiempoMin(doy)));
    expect(maxAbs).toBeGreaterThan(14);
    expect(maxAbs).toBeLessThan(17);
  });

  it('hhmm escribe la hora del campo y no un decimal', () => {
    expect(hhmm(13.5833)).toBe('13:35');
    expect(hhmm(9)).toBe('09:00');
    expect(hhmm(16.999)).toBe('17:00');
  });
});

describe('la pared al este y al oeste no se arregla con un alero', () => {
  it('EL PEOR RUMBO PIDE EL DOBLE QUE EL MEJOR, EN EL MISMO LUGAR', () => {
    for (const s of PUBLICADOS) {
      const t = aleroPorOrientacion(s.lat, s.lng, 1, OPC_PUBLICADO)!;
      expect(t.factor).toBeGreaterThan(1.8);
    }
  });

  it('y el peor nunca es la pared que mira al ecuador', () => {
    for (const s of PUBLICADOS) {
      const t = aleroPorOrientacion(s.lat, s.lng, 1, OPC_PUBLICADO)!;
      expect(['N', 'S']).not.toContain(t.peor.corto);
    }
  });

  it('en Buenos Aires la pared al oeste pide un alero más profundo que el alto de la ventana', () => {
    const p = periodoSobrecalentado(BA_TMEAN, BA_TMAX)!;
    const oeste = aleroDeUnaPared(-34.6, -58.5, 270, 1.5, { meses: p.indices, meridiano: -45 })!;
    expect(oeste.pf).toBeGreaterThan(1);
    expect(oeste.mas_profundo_que_alto).toBe(true);
    expect(oeste.advertencias.some(a => a.includes('celosías'))).toBe(true);
  });

  it('la tabla trae las dieciséis orientaciones y ninguna se repite', () => {
    const t = aleroPorOrientacion(-34.6, -58.5, 1.5, { meridiano: -45 })!;
    expect(t.filas).toHaveLength(ORIENTACIONES.length);
    expect(new Set(t.filas.map(f => f.az)).size).toBe(16);
  });
});

describe('el período sobrecalentado sale del clima, no del solsticio', () => {
  it('en Garissa marca los doce meses, que es el período que eligió la fuente', () => {
    const p = periodoSobrecalentado(GAR_TMEAN, GAR_TMAX)!;
    expect(p.indices).toHaveLength(12);
  });

  it('en Buenos Aires marca el verano y no el año entero', () => {
    const p = periodoSobrecalentado(BA_TMEAN, BA_TMAX)!;
    expect(p.indices.length).toBeGreaterThan(0);
    expect(p.indices.length).toBeLessThan(7);
    expect(p.indices).toContain(0);    // enero
    expect(p.indices).not.toContain(6); // julio
  });

  it('en Bariloche NINGÚN mes pide sombra, y entonces el alero es para otra cosa', () => {
    const p = periodoSobrecalentado(BAR_TMEAN, BAR_TMAX)!;
    expect(p.indices).toHaveLength(0);
    expect(p.mes_pico).toBeNull();
    expect(p.advertencias.some(a => a.includes('sol de invierno'))).toBe(true);
  });

  it('el umbral es la banda del 80 % centrada en Tcomf, y se puede recalcular a mano', () => {
    const p = periodoSobrecalentado(BA_TMEAN, BA_TMAX)!;
    const enero = p.meses[0]!;
    expect(enero.limite_c).toBeCloseTo(
      ADAPTATIVO_PENDIENTE * BA_TMEAN[0]! + ADAPTATIVO_CONSTANTE_C + BANDA_80_C / 2, 10,
    );
  });

  it('COMPARAR LA MEDIA EN VEZ DE LA MÁXIMA DEJARÍA AL MUNDO ENTERO SIN SOMBRA', () => {
    // Despejando Tmedia = 0,31·Tmedia + 21,3 sale un umbral de 30,9 °C de media
    // MENSUAL, que casi ningún predio habitado alcanza: ni Garissa.
    const umbral = (ADAPTATIVO_CONSTANTE_C + BANDA_80_C / 2) / (1 - ADAPTATIVO_PENDIENTE);
    expect(umbral).toBeCloseTo(30.9, 1);
    expect(Math.max(...GAR_TMEAN)).toBeLessThan(umbral);
    // Y con la máxima, Garissa pide sombra los doce meses, como dice la fuente.
    expect(periodoSobrecalentado(GAR_TMEAN, GAR_TMAX)!.indices).toHaveLength(12);
  });

  it('avisa cuando la media mensual se sale del rango calibrado', () => {
    const frio = BAR_TMEAN.map(t => t - 10);
    const p = periodoSobrecalentado(frio, BAR_TMAX)!;
    expect(p.advertencias.some(a => a.includes('calibrado'))).toBe(true);
  });

  it('una serie incompleta devuelve null en vez de un período inventado', () => {
    expect(periodoSobrecalentado([1, 2, 3], BA_TMAX)).toBeNull();
    expect(periodoSobrecalentado(BA_TMEAN.map(() => NaN), BA_TMAX)).toBeNull();
  });

  it('el período recorta el alero: menos meses, corte más alto', () => {
    const p = periodoSobrecalentado(BA_TMEAN, BA_TMAX)!;
    const conPeriodo = aleroDeUnaPared(-34.6, -58.5, 0, 1.5, { meses: p.indices, meridiano: -45 })!;
    const todoElAnio = aleroDeUnaPared(-34.6, -58.5, 0, 1.5, { meridiano: -45 })!;
    expect(conPeriodo.vsa_corte).toBeGreaterThan(todoElAnio.vsa_corte);
    expect(conPeriodo.profundidad_m).toBeLessThan(todoElAnio.profundidad_m);
  });
});

describe('la simetría del alero contra la asimetría del clima', () => {
  it('EL GEMELO DE FEBRERO ES OCTUBRE, NO NOVIEMBRE: se espeja la declinación', () => {
    // El centro de febrero cae 57 días después del solsticio de diciembre, así
    // que su espejo es el 25 de octubre, que está en octubre y no en noviembre.
    // Contar meses de calendario hacia atrás da el mes equivocado.
    expect(gemeloSolarDoy(1)).toBe(298);
    expect(fechaDeDoy(298)).toBe('25 de octubre');
    expect(gemeloSolar(1)).toBe(9);
    expect(gemeloSolar(2)).toBe(8);     // marzo ↔ septiembre
    expect(gemeloSolar(4)).toBe(6);     // mayo ↔ julio
  });

  it('el gemelo del gemelo vuelve al mes de partida', () => {
    for (const m of [0, 1, 2, 3, 4, 6, 7, 8, 9, 10]) {
      expect(gemeloSolar(gemeloSolar(m))).toBe(m);
    }
  });

  it('y los meses que CONTIENEN un solsticio son la excepción, por el centro del mes', () => {
    // Diciembre se refleja en sí mismo: el solsticio cae dentro del mes.
    expect(gemeloSolar(11)).toBe(11);
    // Junio tiene su centro diez días antes del solsticio, así que cae en julio.
    expect(gemeloSolar(5)).toBe(6);
  });

  it('la declinación de un mes y de su gemelo coincide, que es la definición', () => {
    for (const m of [0, 1, 2, 3, 4, 7, 8, 9, 10]) {
      const a = posicionSolar(0, DOY_MEDIO_TEST[m]!, 12)!;
      const b = posicionSolar(0, DOY_MEDIO_TEST[gemeloSolar(m)]!, 12)!;
      expect(Math.abs(a.elevacion - b.elevacion)).toBeLessThan(6);
    }
  });

  it('EL ALERO NO DISTINGUE FEBRERO DE NOVIEMBRE Y HAY GRADOS DE DIFERENCIA', () => {
    const p = periodoSobrecalentado(BA_TMEAN, BA_TMAX)!;
    const c = costoDeLaSimetria(p)!;
    expect(c.gemelo).toBe(gemeloSolar(c.mes));
    expect(c.gemelo_sobrecalentado).toBe(false);
    expect(c.dif_c).toBeGreaterThan(2);
    expect(c.nota).toContain('el alero no puede distinguir');
  });

  it('Y LA RAZÓN ES EXACTA: DOS DÍAS ESPEJADOS TIENEN EL MISMO SOL', () => {
    // Acá está el límite duro del dispositivo, y es geometría pura: el sol de
    // dos días espejados respecto del solsticio hace el mismo recorrido dentro
    // de dos décimas de grado. Ningún alero fijo puede tratarlos distinto, por
    // más profundo que sea.
    for (const [a, b] of [[47, 298], [75, 270], [135, 209]] as const) {
      for (const hora of [9, 12, 15]) {
        const pa = posicionSolar(-34.6, a, hora)!;
        const pb = posicionSolar(-34.6, b, hora)!;
        expect(Math.abs(pa.elevacion - pb.elevacion)).toBeLessThan(0.3);
        expect(Math.abs(pa.azimut - pb.azimut)).toBeLessThan(0.5);
      }
    }
  });

  it('el costo publica la FECHA del gemelo y no sólo el mes', () => {
    const c = costoDeLaSimetria(periodoSobrecalentado(BA_TMEAN, BA_TMAX)!)!;
    expect(c.gemelo_fecha).toMatch(/^\d{1,2} de [a-zé]+$/);
    expect(c.nota).toContain(c.gemelo_fecha);
  });

  it('donde los doce meses piden sombra el problema no existe, y se dice', () => {
    const p = periodoSobrecalentado(GAR_TMEAN, GAR_TMAX)!;
    expect(costoDeLaSimetria(p)).toBeNull();
  });

  it('sin período sobrecalentado no hay costo de simetría', () => {
    expect(costoDeLaSimetria(periodoSobrecalentado(BAR_TMEAN, BAR_TMAX)!)).toBeNull();
  });

  it('mesDeDoy ubica los bordes del calendario', () => {
    expect(mesDeDoy(1)).toBe(0);
    expect(mesDeDoy(32)).toBe(1);
    expect(mesDeDoy(365)).toBe(11);
    expect(mesDeDoy(172)).toBe(5);     // solsticio de junio
    expect(mesDeDoy(355)).toBe(11);    // solsticio de diciembre
  });
});

describe('los trópicos: el sol pasa por los dos lados', () => {
  it('EN BOGOTÁ EL SOL DEL MEDIODÍA ESTÁ MÁS DE CIEN DÍAS DEL OTRO LADO', () => {
    const s = solDeLosDosLados(4.7)!;
    expect(s.tropico).toBe(true);
    expect(s.dias_hacia_polo).toBeGreaterThan(100);
    expect(s.pared_ecuador).toBe('sur');
  });

  it('en Buenos Aires nunca, y la pared del sur no recibe sol al mediodía', () => {
    const s = solDeLosDosLados(-34.6)!;
    expect(s.tropico).toBe(false);
    expect(s.dias_hacia_polo).toBe(0);
    expect(s.pared_ecuador).toBe('norte');
  });

  it('EN GARISSA LAS DOS PAREDES PIDEN CASI EL MISMO ALERO, Y LA TABLA LO PUBLICA', () => {
    const g = PUBLICADOS[0]!;
    const [, pfN] = g.pub[0]!;
    const [, pfS] = g.pub[180]!;
    expect(Math.abs(pfN - pfS)).toBeLessThan(0.05);   // 0,70 contra 0,67
    // El cálculo llega a lo mismo: la regla templada de "no te preocupes por la
    // pared del polo" no vale acá.
    const calcN = corte(g, 0).pf;
    const calcS = corte(g, 180).pf;
    expect(Math.abs(calcN - calcS)).toBeLessThan(0.1);
  });

  it('y a 10° de latitud la asimetría ya aparece, pero el alero del polo no desaparece', () => {
    const m = PUBLICADOS[5]!;
    expect(m.pub[0]![1]).toBeGreaterThan(m.pub[180]![1] * 2);   // 0,98 contra 0,44
    expect(m.pub[180]![1]).toBeGreaterThan(0.4);                 // y sigue siendo un alero real
  });

  it('el espejo del hemisferio norte da el mismo conteo', () => {
    const sur = solDeLosDosLados(-15)!;
    const norte = solDeLosDosLados(15)!;
    expect(Math.abs(sur.dias_hacia_polo - norte.dias_hacia_polo)).toBeLessThanOrEqual(2);
    expect(sur.pared_ecuador).toBe('norte');
    expect(norte.pared_ecuador).toBe('sur');
  });
});

describe('el instante crítico y el sol rasante', () => {
  it('publica el instante que fija el corte, con mes, hora e intensidad', () => {
    const a = aleroDeUnaPared(-34.6, -58.5, 0, 1.5, { meses: [0], meridiano: -45 })!;
    expect(a.critico.mes).toBe(0);
    expect(a.critico.hora_reloj).toBeGreaterThanOrEqual(9);
    expect(a.critico.hora_reloj).toBeLessThanOrEqual(16);
    expect(a.critico.vsa).toBeCloseTo(a.vsa_corte, 10);
    expect(a.critico.cos_incidencia).toBeGreaterThan(0);
    expect(a.muestras).toBeGreaterThan(100);
  });

  it('EN LATITUD MEDIA LA PARED DEL ECUADOR SE DECIDE EN EL MEDIODÍA SOLAR', () => {
    // Es el único caso en que «la latitud y la altura del mediodía» alcanzan,
    // y es el que el enunciado de la etapa generalizó. El crítico cae a las
    // 12:55 del reloj, que es el mediodía solar de Buenos Aires en el huso
    // de 45° O, con el sol de frente.
    const p = periodoSobrecalentado(BA_TMEAN, BA_TMAX)!;
    const a = aleroDeUnaPared(-34.6, -58.5, 0, 1.5, { meses: p.indices, meridiano: -45 })!;
    expect(Math.abs(a.critico.hsa)).toBeLessThan(5);
    expect(a.decidido_al_mediodia).toBe(true);
    expect(hhmm(a.critico.hora_reloj)).toBe('12:55');
  });

  it('Y EN LATITUD BAJA NO: AHÍ MANDA UN SOL DE LAS 16 DE COSTADO', () => {
    // A 10° de latitud el sol sube casi vertical, así que a media tarde sigue
    // alto mientras el azimut ya se fue lejos del eje de la pared. El mediodía
    // deja de ser el momento que manda, y con él se cae la receta del enunciado.
    const m = PUBLICADOS[5]!;
    const a = aleroDeUnaPared(m.lat, m.lng, 0, 1.5, OPC_PUBLICADO)!;
    expect(Math.abs(a.critico.hsa)).toBeGreaterThan(50);
    expect(a.decidido_al_mediodia).toBe(false);
    expect(hhmm(a.critico.hora_reloj)).toBe('16:00');
    expect(a.advertencias.some(x => x.includes('no lo decide el mediodía'))).toBe(true);
  });

  it('EN BOGOTÁ LA PARED DEL SUR PIDE MÁS ALERO QUE LA DEL NORTE', () => {
    // La receta templada —ventana al ecuador con alero, pared del polo sin
    // nada— deja justo descubierta la peor de las dos. A 4,7° N el sol del
    // mediodía está al sur 240 días del año.
    const norte = aleroDeUnaPared(4.7, -74.13, 0, 1.5, { meridiano: -75 })!;
    const sur = aleroDeUnaPared(4.7, -74.13, 180, 1.5, { meridiano: -75 })!;
    expect(sur.pf).toBeGreaterThan(norte.pf);
    // A 4,7° N el sol del mediodía queda al sur 206 días del año y al norte 159.
    const d = solDeLosDosLados(4.7)!;
    expect(d.dias_hacia_ecuador).toBe(206);
    expect(d.dias_hacia_polo).toBe(159);
  });

  it('en la pared al este el corte nunca es del mediodía, en ninguna latitud', () => {
    // Obvio y vale escribirlo: al mediodía el sol no está al este. Es la razón
    // por la que esas paredes reproducen la tabla publicada sin error: su
    // instante crítico es franco y no depende de una lectura al borde.
    for (const s of PUBLICADOS) {
      expect(corte(s, 90).decidido_al_mediodia).toBe(false);
      expect(corte(s, 270).decidido_al_mediodia).toBe(false);
    }
  });

  it('datos imposibles devuelven null en vez de un alero', () => {
    expect(aleroDeUnaPared(NaN, -58, 0, 1.5)).toBeNull();
    expect(aleroDeUnaPared(-34.6, -58.5, 0, 0)).toBeNull();
    expect(aleroDeUnaPared(-34.6, -58.5, 0, 1.5, { ventana: [16, 9] })).toBeNull();
    expect(aleroDeUnaPared(-34.6, -58.5, 0, 1.5, { meses: [99] })).toBeNull();
  });
});

describe('qué hace el alero que ya está construido', () => {
  it('el alero justo tapa la abertura entera, y el doble no tapa más', () => {
    const p = periodoSobrecalentado(BA_TMEAN, BA_TMAX)!;
    const opc = { meses: p.indices, meridiano: -45 };
    const pedido = aleroDeUnaPared(-34.6, -58.5, 0, 1.5, opc)!;
    const justo = desempenoAlero(-34.6, -58.5, 0, 1.5, pedido.profundidad_m, opc)!;
    const doble = desempenoAlero(-34.6, -58.5, 0, 1.5, pedido.profundidad_m * 2, opc)!;
    expect(justo.sombra_media_pct).toBeGreaterThan(99.5);
    expect(doble.sombra_media_pct).toBeCloseTo(100, 1);
  });

  it('SIN ALERO LA SOMBRA ES CERO Y CON MEDIO ALERO NO ES MEDIA SOMBRA', () => {
    const p = periodoSobrecalentado(BA_TMEAN, BA_TMAX)!;
    const opc = { meses: p.indices, meridiano: -45 };
    const pedido = aleroDeUnaPared(-34.6, -58.5, 0, 1.5, opc)!;
    expect(desempenoAlero(-34.6, -58.5, 0, 1.5, 0, opc)!.sombra_media_pct).toBe(0);
    const mitad = desempenoAlero(-34.6, -58.5, 0, 1.5, pedido.profundidad_m / 2, opc)!;
    // La mitad de la profundidad tapa mucho más de la mitad: el último tramo de
    // alero es el que menos rinde, y es el que paga el sol rasante.
    expect(mitad.sombra_media_pct).toBeGreaterThan(80);
  });

  it('pesar por la intensidad del sol da un número distinto, y es el que vale', () => {
    const p = periodoSobrecalentado(BA_TMEAN, BA_TMAX)!;
    const opc = { meses: p.indices, meridiano: -45 };
    const pedido = aleroDeUnaPared(-34.6, -58.5, 0, 1.5, opc)!;
    const d = desempenoAlero(-34.6, -58.5, 0, 1.5, pedido.profundidad_m / 2, opc)!;
    expect(Math.abs(d.sombra_pesada_pct - d.sombra_media_pct)).toBeGreaterThan(1);
    expect(d.nota).toContain('sol rasante');
  });
});

describe('la inclinación del panel: lo que había no tenía fuente', () => {
  const casos: readonly { ciudad: string; lat: number; pub: number }[] = [
    { ciudad: 'Buenos Aires', lat: -34.82, pub: 30 },
    { ciudad: 'Río de Janeiro', lat: -22.9, pub: 22 },
    { ciudad: 'Antofagasta', lat: -23.43, pub: 22 },
    { ciudad: 'Argel', lat: 36.72, pub: 31 },
    { ciudad: 'Reikiavik', lat: 64.13, pub: 43 },
  ];

  it('EL |lat| + 12 QUE HABÍA SOBREESTIMA EN TODAS LAS CIUDADES PUBLICADAS', () => {
    for (const c of casos) {
      const i = inclinacionPanel(c.lat)!;
      expect(i.grados_regla_vieja).toBeGreaterThan(c.pub);
      // Y no por poco: en Buenos Aires son 47° contra 30° publicados.
      if (c.ciudad === 'Buenos Aires') {
        expect(i.grados_regla_vieja).toBeCloseTo(46.8, 1);
      }
    }
  });

  it('el polinomio publicado cae a menos de 8° de PVWatts en las cinco', () => {
    for (const c of casos) {
      const i = inclinacionPanel(c.lat)!;
      expect(Math.abs(i.grados - c.pub)).toBeLessThan(8);
    }
  });

  it('y le gana a la regla vieja en todas', () => {
    for (const c of casos) {
      const i = inclinacionPanel(c.lat)!;
      expect(Math.abs(i.grados - c.pub)).toBeLessThan(Math.abs(i.grados_regla_vieja - c.pub));
    }
  });

  it('CALGARY Y BEEK ESTÁN A LA MISMA LATITUD Y TIENEN ÓPTIMOS SEPARADOS 11°', () => {
    // 45° contra 34°, por nubosidad. Ninguna función de la latitud puede dar las
    // dos, así que el módulo entrega una estimación y lo declara.
    const calgary = inclinacionPanel(51.12)!;
    const beek = inclinacionPanel(50.92)!;
    expect(Math.abs(calgary.grados - beek.grados)).toBeLessThan(0.5);
    expect(Math.abs(45 - 34)).toBe(11);
    expect(calgary.advertencias.some(a => a.includes('Calgary'))).toBe(true);
  });

  it('en los trópicos el óptimo es casi plano y se levanta para que lo lave la lluvia', () => {
    const bogota = inclinacionPanel(4.7)!;
    expect(bogota.grados_crudos).toBeLessThan(INCLINACION_MIN_LLUVIA);
    expect(bogota.grados).toBe(INCLINACION_MIN_LLUVIA);
    expect(bogota.piso_de_lluvia).toBe(true);
    expect(bogota.advertencias.some(a => a.includes('lluvia'))).toBe(true);
    // PVWatts publica 5° para Bogotá: el óptimo crudo va en la misma dirección.
    expect(bogota.grados_crudos).toBeLessThan(15);
  });

  it('el panel apunta al ecuador en los dos hemisferios', () => {
    expect(inclinacionPanel(-34.6)!.orientacion).toBe('norte');
    expect(inclinacionPanel(40)!.orientacion).toBe('sur');
  });

  it('la recta de Chang va en la misma dirección que el polinomio', () => {
    for (const lat of [-40, -20, 20, 40]) {
      const i = inclinacionPanel(lat)!;
      expect(Math.abs(i.grados_lineal - i.grados_crudos)).toBeLessThan(6);
      expect(i.grados_lineal).toBeLessThan(i.grados_regla_vieja);
    }
  });

  it('una latitud imposible devuelve null', () => {
    expect(inclinacionPanel(120)).toBeNull();
    expect(inclinacionPanel(NaN)).toBeNull();
  });
});

describe('el control solar completo', () => {
  it('arma el paquete de Buenos Aires con todas las piezas', () => {
    const c = controlSolar(-34.6, -58.5, BA_TMEAN, BA_TMAX, 1.5, { meridiano: -45 })!;
    expect(c.periodo.indices.length).toBeGreaterThan(0);
    expect(c.simetria).not.toBeNull();
    expect(c.dosLados.tropico).toBe(false);
    expect(c.tabla.filas).toHaveLength(16);
    expect(c.tabla_todo_el_anio).not.toBeNull();
    expect(c.panel.grados).toBeLessThan(c.panel.grados_regla_vieja);
    expect(c.fuentes.length).toBeGreaterThanOrEqual(7);
  });

  it('DIMENSIONAR PARA EL AÑO ENTERO PIDE UN ALERO 7 VECES MÁS PROFUNDO', () => {
    // Es la medida del hallazgo 2: el año entero incluye el sol rasante de
    // junio, que es justamente el que se quiere dejar entrar. En Buenos Aires
    // la pared al norte pasa de 0,49 de factor de proyección a 3,56.
    const c = controlSolar(-34.6, -58.5, BA_TMEAN, BA_TMAX, 1.5, { meridiano: -45 })!;
    const k = c.costo_del_anio_entero!;
    expect(k.pf_periodo).toBeCloseTo(0.49, 1);
    expect(k.pf_anio).toBeCloseTo(3.56, 1);
    expect(k.factor).toBeGreaterThan(7);
  });

  it('avisa del corrimiento del mediodía cuando pasa de media hora', () => {
    const c = controlSolar(-32.89, -68.85, BA_TMEAN, BA_TMAX, 1.5, { meridiano: -45 })!;
    expect(c.advertencias.some(a => a.includes('mediodía solar'))).toBe(true);
    expect(c.tabla.mediodia_reloj).toBe('13:35');
  });

  it('en Garissa no hay tabla de contraste porque el período ya es el año entero', () => {
    const g = PUBLICADOS[0]!;
    const c = controlSolar(g.lat, g.lng, GAR_TMEAN, GAR_TMAX, 1.5, { meridiano: MERIDIANO_EAT })!;
    expect(c.periodo.indices).toHaveLength(12);
    expect(c.tabla_todo_el_anio).toBeNull();
    expect(c.simetria).toBeNull();
  });

  it('sin clima no devuelve un control solar a medias', () => {
    expect(controlSolar(-34.6, -58.5, [1, 2], BA_TMAX)).toBeNull();
  });
});
