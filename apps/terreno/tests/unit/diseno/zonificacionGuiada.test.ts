/**
 * Tests de `lib/zonificacionGuiada.ts`.
 *
 * Los casos resueltos son los que la literatura afirma sobre la función de
 * caminata de Tobler —5 km/h en el llano, máximo de 6 km/h en una bajada de
 * 2,86°, factor 3/5 fuera de sendero—, las frecuencias textuales de las zonas de
 * Mollison de NC State Extension, y la identidad del factor LS de la USLE, que
 * se verifica contra su propia parcela unitaria.
 */
import { describe, it, expect } from 'vitest';
import * as turf from '@turf/turf';
import {
  CATEGORIAS_MOLLISON, FACTOR_FUERA_DE_SENDERO, FRECUENCIA_ZONA,
  PENDIENTE_MAS_RAPIDA, VELOCIDAD_MAXIMA_KMH,
  areaUnion_m2, balanceDeZonificacion, costoDeCaminata, geometriaDeZona,
  girarLaZona, numeroDeZona, poligonoDePredio, poligonoDeZona, recorteAlPredio, revisarZonificacion,
  solapamientos, velocidadTobler, verificarZona, viajeIdaYVuelta,
} from '@/lib/zonificacionGuiada';
import { prepararEmplazamiento } from '@/lib/emplazamiento';
import { TOLERANCIA_T_HA, factorLS } from '@/lib/usle';
import type { CategoriaZona, Zona } from '@/lib/zonificacion';
import type { GrillaElevacion } from '@/lib/grillaElevacion';
import type { Mojon } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Una zona cuadrada de `lado` grados, con esquina inferior izquierda dada. */
function zonaCuadrada(
  id: string,
  categoria: CategoriaZona,
  lat0: number, lng0: number,
  dLat: number, dLng = dLat,
): Zona {
  return {
    id, categoria, nombre: id,
    vertices: [
      { lat: lat0,        lng: lng0 },
      { lat: lat0,        lng: lng0 + dLng },
      { lat: lat0 + dLat, lng: lng0 + dLng },
      { lat: lat0 + dLat, lng: lng0 },
    ],
    area_m2: 0, area_ha: 0, notas: '',
  };
}

function mojonesCuadrado(lat0: number, lng0: number, d: number): Mojon[] {
  const pts = [[lat0, lng0], [lat0, lng0 + d], [lat0 + d, lng0 + d], [lat0 + d, lng0]];
  return pts.map(([lat, lng], i) => ({ id: `m${i}`, numero: i + 1, lat: lat!, lng: lng! }));
}

/**
 * Grilla sintética. `z(r, c)` da la elevación. row 0 = latMin = sur, igual que
 * `GrillaElevacion` de verdad.
 */
function grilla(
  rows: number, cols: number, paso_m: number,
  z: (r: number, c: number) => number,
  opciones?: { lat0?: number; lng0?: number },
): GrillaElevacion {
  const lat0 = opciones?.lat0 ?? -34;
  const lng0 = opciones?.lng0 ?? -58;
  const dLat = paso_m / 111_132;
  const dLng = paso_m / (111_320 * Math.cos((lat0 * Math.PI) / 180));
  const elev = new Float64Array(rows * cols);
  let min = Infinity;
  let max = -Infinity;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = z(r, c);
      elev[r * cols + c] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  return {
    rows, cols,
    latMin: lat0, latMax: lat0 + dLat * (rows - 1),
    lngMin: lng0, lngMax: lng0 + dLng * (cols - 1),
    elev, elev_min: min, elev_max: max,
  };
}

/** Plano inclinado: sube hacia el norte (r creciente) con pendiente `s`. */
function planoInclinado(rows: number, cols: number, paso_m: number, s: number): GrillaElevacion {
  return grilla(rows, cols, paso_m, r => 100 + r * paso_m * s);
}

// ══════════════════════════════════════════════════════════════════════════════
describe('la función de caminata de Tobler', () => {
  it('EL MÁXIMO NO ESTÁ EN EL LLANO: ESTÁ EN UNA BAJADA DEL 5 %', () => {
    // Es la cifra que publica la bibliografía: 6 km/h exactos en −2,86°.
    expect(velocidadTobler(PENDIENTE_MAS_RAPIDA)).toBeCloseTo(VELOCIDAD_MAXIMA_KMH, 10);
    expect((Math.atan(-PENDIENTE_MAS_RAPIDA) * 180) / Math.PI).toBeCloseTo(2.862, 3);
    // Y el llano es más lento que ese máximo.
    expect(velocidadTobler(0)).toBeLessThan(velocidadTobler(PENDIENTE_MAS_RAPIDA));
  });

  it('y en el llano da los 5 km/h que afirma la fuente', () => {
    expect(velocidadTobler(0)).toBeCloseTo(5.037, 3);
    expect(velocidadTobler(0)).toBeCloseTo(6 * Math.exp(-0.175), 10);
  });

  it('fuera de sendero multiplica por 3/5, que es el factor de la fuente', () => {
    expect(FACTOR_FUERA_DE_SENDERO).toBeCloseTo(3 / 5, 10);
    expect(velocidadTobler(0, { fuera_de_sendero: true }))
      .toBeCloseTo(velocidadTobler(0) * 0.6, 10);
  });

  it('SUBIR Y BAJAR LA MISMA LADERA NO SE HACEN A LA MISMA VELOCIDAD', () => {
    // 20 % de pendiente. Subiendo, |0,20 + 0,05| = 0,25: 6·e^−0,875 = 2,5012.
    // Bajando, |−0,20 + 0,05| = 0,15: 6·e^−0,525 = 3,5493.
    expect(velocidadTobler(0.2)).toBeCloseTo(6 * Math.exp(-0.875), 10);
    expect(velocidadTobler(-0.2)).toBeCloseTo(6 * Math.exp(-0.525), 10);
    expect(velocidadTobler(0.2)).toBeCloseTo(2.5012, 4);
    expect(velocidadTobler(-0.2)).toBeCloseTo(3.5493, 4);
    // La bajada es un 42 % más rápida que la subida en la misma ladera, y el
    // factor es exactamente e^0,35: la diferencia de pendiente por el 3,5.
    expect(velocidadTobler(-0.2) / velocidadTobler(0.2)).toBeCloseTo(Math.exp(0.35), 10);
    expect(velocidadTobler(-0.2) / velocidadTobler(0.2)).toBeCloseTo(1.4191, 4);
  });

  it('es simétrica alrededor del 5 % de bajada y no alrededor del cero', () => {
    // A 5 puntos a cada lado del máximo, la velocidad es la misma.
    expect(velocidadTobler(0)).toBeCloseTo(velocidadTobler(-0.1), 10);
    // Y el cero NO es un eje de simetría.
    expect(velocidadTobler(0.1)).not.toBeCloseTo(velocidadTobler(-0.1), 3);
  });

  it('no devuelve una velocidad para una pendiente que no es un número', () => {
    expect(velocidadTobler(Number.NaN)).toBe(0);
    expect(velocidadTobler(Infinity)).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('la ida y vuelta', () => {
  it('LA IDA Y VUELTA NO ES EL DOBLE DE LA IDA, Y ESO ES TODO EL PUNTO', () => {
    // 500 m de distancia horizontal subiendo 100 m: pendiente del 20 %.
    const v = viajeIdaYVuelta([{ largo_m: 500, desnivel_m: 100 }])!;
    expect(v.kmh_ida).toBeCloseTo(2.5, 1);
    expect(v.kmh_vuelta).toBeCloseTo(3.55, 1);
    // La vuelta es más rápida, así que el redondo es menos que el doble de la ida.
    expect(v.horas_vuelta).toBeLessThan(v.horas_ida);
    expect(v.horas_total).toBeLessThan(2 * v.horas_ida);
    expect(v.horas_total).toBeGreaterThan(2 * v.horas_vuelta);
    expect(v.asimetria_pct).toBeCloseTo(-29.5, 0);
  });

  it('en el llano la asimetría existe igual, porque el máximo no está en el cero', () => {
    const v = viajeIdaYVuelta([{ largo_m: 1000, desnivel_m: 0 }])!;
    // Con desnivel cero las dos velocidades son la misma: 0 y −0 son la misma
    // pendiente. Acá la asimetría es exactamente cero y el doble sí vale, salvo
    // por el redondeo a tres decimales con el que se publican las horas.
    expect(v.asimetria_pct).toBe(0);
    expect(v.horas_ida).toBe(v.horas_vuelta);
    expect(v.horas_total).toBeCloseTo(2 * v.horas_ida, 2);
  });

  it('UNA PENDIENTE MEDIA NO SE CAMINA COMO SUS TRAMOS, PORQUE LA FUNCIÓN ES CONVEXA', () => {
    // Mismo desnivel y misma distancia, repartidos de dos formas.
    const uniforme = viajeIdaYVuelta([
      { largo_m: 500, desnivel_m: 50 },
      { largo_m: 500, desnivel_m: 50 },
    ])!;
    const quebrado = viajeIdaYVuelta([
      { largo_m: 500, desnivel_m: 0 },
      { largo_m: 500, desnivel_m: 100 },
    ])!;
    expect(quebrado.dist_ida_m).toBe(uniforme.dist_ida_m);
    expect(quebrado.desnivel_m).toBe(uniforme.desnivel_m);
    // El tramo empinado cuesta más de lo que el llano compensa.
    expect(quebrado.horas_total).toBeGreaterThan(uniforme.horas_total);
  });

  it('sin tramos no hay viaje', () => {
    expect(viajeIdaYVuelta([])).toBeNull();
    expect(viajeIdaYVuelta([{ largo_m: 0, desnivel_m: 10 }])).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('la zona de Mollison es una frecuencia, no un radio', () => {
  it('las seis categorías de Mollison están en orden y el número es el índice', () => {
    expect(CATEGORIAS_MOLLISON).toEqual(['zona_0', 'zona_1', 'zona_2', 'zona_3', 'zona_4', 'zona_5']);
    expect(numeroDeZona('zona_0')).toBe(0);
    expect(numeroDeZona('zona_4')).toBe(4);
    expect(numeroDeZona('huerta')).toBeNull();
  });

  it('las frecuencias son las palabras de la fuente, y la 0 y la 5 no tienen viajes', () => {
    expect(FRECUENCIA_ZONA[0]!.viajes_anio).toBeNull();
    expect(FRECUENCIA_ZONA[5]!.viajes_anio).toBeNull();
    expect(FRECUENCIA_ZONA[2]!.textual).toBe('about once a day');
    // La única que la fuente da como número exacto: una vez al día.
    expect(FRECUENCIA_ZONA[2]!.viajes_anio).toEqual([365, 365]);
    // Y las bandas son monótonas: más cerca, más seguido.
    for (const z of [1, 2, 3, 4]) {
      const a = FRECUENCIA_ZONA[z]!.viajes_anio!;
      expect(a[0]).toBeLessThanOrEqual(a[1]);
    }
    expect(FRECUENCIA_ZONA[1]!.viajes_anio![0]).toBeGreaterThan(FRECUENCIA_ZONA[2]!.viajes_anio![0]);
    expect(FRECUENCIA_ZONA[3]!.viajes_anio![1]).toBeLessThan(FRECUENCIA_ZONA[2]!.viajes_anio![0]);
  });

  it('LA DISTANCIA NO ORDENA EL COSTO: UNA ZONA 1 CERCA CUESTA MÁS QUE UNA ZONA 3 LEJOS', () => {
    const z1 = costoDeCaminata(1, [{ largo_m: 150, desnivel_m: 0 }])!;
    const z3 = costoDeCaminata(3, [{ largo_m: 500, desnivel_m: 0 }])!;
    // La zona 1 está a menos de un tercio de la distancia y camina más.
    expect(z1.km_anio[0]).toBeGreaterThan(z3.km_anio[1]);
    // Que es exactamente lo que los anillos concéntricos dicen al revés.
    expect(z1.km_anio[0]).toBeCloseTo(219, 0);   // 2 × 150 m × 730
    expect(z3.km_anio[1]).toBeCloseTo(208, 0);   // 2 × 500 m × 208
  });

  it('Y EL FACTOR ENTRE LA ZONA 1 Y LA ZONA 4 A IGUAL DISTANCIA ES DE 61 A 365 VECES', () => {
    const tramos = [{ largo_m: 300, desnivel_m: 0 }];
    const z1 = costoDeCaminata(1, tramos)!;
    const z4 = costoDeCaminata(4, tramos)!;
    // El mejor caso de la 1 contra el peor de la 4, y al revés.
    expect(z1.km_anio[0] / z4.km_anio[1]).toBeCloseTo(730 / 12, 1);   // 60,8
    expect(z1.km_anio[1] / z4.km_anio[0]).toBeCloseTo(1461 / 4, 1);   // 365,3
  });

  it('la zona 0 y la zona 5 no tienen presupuesto de caminata, y eso no es un error', () => {
    expect(costoDeCaminata(0, [{ largo_m: 100, desnivel_m: 0 }])).toBeNull();
    expect(costoDeCaminata(5, [{ largo_m: 100, desnivel_m: 0 }])).toBeNull();
  });

  it('declara que la conversión de las palabras a números es propia y no de la fuente', () => {
    expect(FRECUENCIA_ZONA[1]!.nota).toContain('La fuente no da el número');
    expect(FRECUENCIA_ZONA[3]!.nota).toContain('se lee acá');
    const c = costoDeCaminata(1, [{ largo_m: 200, desnivel_m: 0 }])!;
    expect(c.advertencias.some(a => a.includes('sin carga'))).toBe(true);
  });

  it('fuera de sendero el costo sube un 67 %, que es el inverso del 3/5', () => {
    const tramos = [{ largo_m: 400, desnivel_m: 0 }];
    const conSenda = costoDeCaminata(2, tramos)!;
    const sinSenda = costoDeCaminata(2, tramos, { fuera_de_sendero: true })!;
    // Los kilómetros son los mismos: lo que cambia son las horas.
    expect(sinSenda.km_anio).toEqual(conSenda.km_anio);
    expect(sinSenda.horas_anio[0] / conSenda.horas_anio[0]).toBeCloseTo(1 / 0.6, 2);
    expect(sinSenda.advertencias.some(a => a.includes('3/5'))).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('la geometría del dibujo: suma, unión y recorte', () => {
  it('LA SUMA DE LAS ÁREAS NO ES LA SUPERFICIE ZONIFICADA SI LAS ZONAS SE PISAN', () => {
    const a = zonaCuadrada('a', 'huerta', -34, -58, 0.002);
    const b = zonaCuadrada('b', 'frutales', -34.001, -58.001, 0.002);
    const suma = [a, b].reduce((s, z) => {
      const p = poligonoDeZona(z);
      return s + (p ? turf.area(p) : 0);
    }, 0);
    const union = areaUnion_m2([a, b]);
    expect(union).toBeLessThan(suma);
    // Dos cuadrados iguales desplazados media diagonal: se pisan en un cuarto.
    const sol = solapamientos([a, b]);
    expect(sol).toHaveLength(1);
    expect(sol[0]!.frac_de_la_menor).toBeCloseTo(0.25, 2);
  });

  it('y el balance publica las tres cifras juntas, que es la única forma de verlo', () => {
    const mojones = mojonesCuadrado(-34, -58, 0.01);
    const a = zonaCuadrada('a', 'huerta', -34.001, -58.001, 0.002);
    const b = zonaCuadrada('b', 'frutales', -34.002, -58.002, 0.002);
    const bal = balanceDeZonificacion([a, b], mojones);
    expect(bal.suma_ha).toBeGreaterThan(bal.union_ha);
    expect(bal.doble_conteo_ha).toBeGreaterThan(0);
    expect(bal.advertencias.some(x => x.includes('contadas dos veces'))).toBe(true);
    expect(bal.advertencias.some(x => x.includes('porcentajes'))).toBe(true);
  });

  it('sin solapes las tres cifras coinciden, y entonces el resumen de siempre estaba bien', () => {
    const mojones = mojonesCuadrado(-34, -58, 0.01);
    const a = zonaCuadrada('a', 'huerta', -34.001, -58.001, 0.002);
    const b = zonaCuadrada('b', 'frutales', -34.006, -58.006, 0.002);
    const bal = balanceDeZonificacion([a, b], mojones);
    expect(bal.suma_ha).toBeCloseTo(bal.union_ha, 1);
    expect(bal.doble_conteo_ha).toBe(0);
    expect(bal.solapes).toHaveLength(0);
    expect(bal.advertencias.some(x => x.includes('contadas dos veces'))).toBe(false);
  });

  it('UNA ZONA DIBUJADA AFUERA DEL PREDIO ENTRABA AL RESUMEN COMO SI ESTUVIERA ADENTRO', () => {
    const mojones = mojonesCuadrado(-34, -58, 0.01);
    const predio = poligonoDePredio(mojones);
    // El predio va de lat −34 a −33,99 y de lng −58 a −57,99. Esta zona arranca
    // 0,001° abajo del borde norte y mide 0,002°: la mitad queda afuera.
    const cruza = zonaCuadrada('x', 'cultivo', -33.991, -57.996, 0.002);
    const rec = recorteAlPredio(cruza, predio)!;
    expect(rec.area_afuera_m2).toBeGreaterThan(0);
    expect(rec.frac_afuera).toBeCloseTo(0.5, 1);
    expect(rec.area_dentro_m2 + rec.area_afuera_m2).toBeCloseTo(rec.area_dibujada_m2, 0);

    const bal = balanceDeZonificacion([cruza], mojones);
    expect(bal.afuera_ha).toBeGreaterThan(0);
    expect(bal.advertencias.some(x => x.includes('afuera del perímetro'))).toBe(true);
  });

  it('sin predio lo dice en vez de suponer que todo está adentro', () => {
    const bal = balanceDeZonificacion([zonaCuadrada('a', 'huerta', -34, -58, 0.002)], []);
    expect(bal.predio_ha).toBe(0);
    expect(bal.advertencias.some(x => x.includes('Sin el perímetro del predio'))).toBe(true);
  });

  it('un polígono de menos de tres vértices no es un polígono y no rompe el balance', () => {
    const degenerada: Zona = {
      id: 'd', categoria: 'huerta', nombre: 'd',
      vertices: [{ lat: -34, lng: -58 }, { lat: -34.001, lng: -58 }],
      area_m2: 0, area_ha: 0, notas: '',
    };
    const bal = balanceDeZonificacion([degenerada], mojonesCuadrado(-34, -58, 0.01));
    expect(bal.suma_ha).toBe(0);
    expect(bal.union_ha).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('la zona medida sobre el terreno', () => {
  const g = planoInclinado(40, 40, 10, 0.1);   // 400 × 400 m al 10 %
  const ctx = prepararEmplazamiento(g)!;

  it('la pendiente de una zona es la de sus celdas y no la del predio', () => {
    const z = zonaCuadrada('z', 'cultivo', g.latMin + (g.latMax - g.latMin) * 0.3,
      g.lngMin + (g.lngMax - g.lngMin) * 0.3,
      (g.latMax - g.latMin) * 0.3, (g.lngMax - g.lngMin) * 0.3);
    const geo = geometriaDeZona(z, ctx)!;
    expect(geo.celdas).toBeGreaterThan(50);
    expect(geo.pend_mediana_pct).toBeCloseTo(10, 0);
  });

  it('EL RUMBO DE BAJADA SALE DEL RELIEVE: ACÁ EL PLANO SUBE AL NORTE, ASÍ QUE BAJA AL SUR', () => {
    const z = zonaCuadrada('z', 'cultivo', g.latMin + (g.latMax - g.latMin) * 0.3,
      g.lngMin + (g.lngMax - g.lngMin) * 0.3,
      (g.latMax - g.latMin) * 0.4, (g.lngMax - g.lngMin) * 0.4);
    const geo = geometriaDeZona(z, ctx)!;
    // Rumbo 180° = hacia el sur.
    expect(geo.rumbo_bajada_deg).toBeCloseTo(180, -1);
  });

  it('LA LONGITUD DE LADERA DE UNA ZONA ES SU PROPIA DIMENSIÓN PENDIENTE ABAJO', () => {
    const dLat = g.latMax - g.latMin;
    const dLng = g.lngMax - g.lngMin;
    const lat0 = g.latMin + dLat * 0.2;
    const lng0 = g.lngMin + dLng * 0.2;
    // Franja tendida sobre la curva de nivel: ancha en longitud, corta en latitud.
    const tendida = zonaCuadrada('t', 'cultivo', lat0, lng0, dLat * 0.12, dLng * 0.5);
    // La misma franja girada: larga en latitud, angosta en longitud.
    const cruzada = zonaCuadrada('c', 'cultivo', lat0, lng0, dLat * 0.5, dLng * 0.12);

    const gt = geometriaDeZona(tendida, ctx)!;
    const gc = geometriaDeZona(cruzada, ctx)!;
    // La bajada es norte-sur, así que λ es la dimensión en latitud.
    expect(gc.lambda_m).toBeGreaterThan(gt.lambda_m * 2.5);
    expect(gt.ancho_m).toBeGreaterThan(gt.lambda_m * 2.5);
  });

  it('Y GIRAR LA MISMA HECTÁREA CAMBIA LA PÉRDIDA DE SUELO POR LA RAÍZ DE LA RELACIÓN DE LADOS', () => {
    // El resultado es exacto y no depende de la grilla: LS ∝ λ^0,5 arriba del 5 %.
    const geo = { lambda_m: 200, ancho_m: 50 } as ReturnType<typeof geometriaDeZona> & { lambda_m: number; ancho_m: number };
    const giro = girarLaZona(geo as never, 10);
    expect(giro.factor).toBeCloseTo(Math.sqrt(200 / 50), 2);   // 2,00
    expect(giro.mejor).toBe('girada');
    // Y la cuenta coincide con el factor LS de usle.ts, que es la fuente.
    expect(factorLS(10, 200) / factorLS(10, 50)).toBeCloseTo(2, 2);
  });

  it('en un cuadrado da lo mismo girarlo, porque los dos lados son iguales', () => {
    const giro = girarLaZona({ lambda_m: 100, ancho_m: 100 } as never, 10);
    expect(giro.factor).toBeCloseTo(1, 2);
    expect(giro.mejor).toBe('da_lo_mismo');
  });

  it('ABAJO DEL 5 % EL EXPONENTE ES OTRO, ASÍ QUE EL MISMO GIRO PESA MENOS', () => {
    // m = 0,5 arriba del 5 %; 0,3 entre 1 y 3,5 %. El mismo par de lados.
    const empinada = girarLaZona({ lambda_m: 200, ancho_m: 50 } as never, 10);
    const suave    = girarLaZona({ lambda_m: 200, ancho_m: 50 } as never, 2);
    expect(empinada.factor).toBeCloseTo(Math.pow(4, 0.5), 2);   // 2,00
    expect(suave.factor).toBeCloseTo(Math.pow(4, 0.3), 2);      // 1,52
    expect(suave.factor).toBeLessThan(empinada.factor);
  });

  it('una zona que no pisa ninguna celda de la grilla no se puede medir, y lo dice', () => {
    const lejos = zonaCuadrada('l', 'cultivo', g.latMax + 0.05, g.lngMax + 0.05, 0.002);
    expect(geometriaDeZona(lejos, ctx)).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('la verificación de una zona', () => {
  const g = planoInclinado(40, 40, 10, 0.1);
  const ctx = prepararEmplazamiento(g)!;
  const mojones = [
    { id: 'a', numero: 1, lat: g.latMin, lng: g.lngMin },
    { id: 'b', numero: 2, lat: g.latMin, lng: g.lngMax },
    { id: 'c', numero: 3, lat: g.latMax, lng: g.lngMax },
    { id: 'd', numero: 4, lat: g.latMax, lng: g.lngMin },
  ];
  const predio = poligonoDePredio(mojones);
  const dLat = g.latMax - g.latMin;
  const dLng = g.lngMax - g.lngMin;

  const usle = { precipAnual_mm: 1000, clase_textura: 'Franco', carbonoOrg_g_kg: 20, usle_c: 0.3 };

  it('DEVUELVE LAS MISMAS TRES LISTAS QUE EMPLAZAMIENTO, Y ESO NO ES CASUALIDAD', () => {
    const z = zonaCuadrada('z', 'cultivo', g.latMin + dLat * 0.3, g.lngMin + dLng * 0.3, dLat * 0.3, dLng * 0.3);
    const v = verificarZona(z, ctx, predio, { usle })!;
    expect(Array.isArray(v.exclusiones)).toBe(true);
    expect(Array.isArray(v.requisitos)).toBe(true);
    expect(Array.isArray(v.advertencias)).toBe(true);
    // Un retiro de curso de agua no se compensa con nada: por eso es lista aparte.
    expect(v.exclusiones.every(e => typeof e.regla === 'string')).toBe(true);
  });

  it('la pérdida de suelo se calcula con la pendiente y el λ DE LA ZONA', () => {
    const z = zonaCuadrada('z', 'cultivo', g.latMin + dLat * 0.2, g.lngMin + dLng * 0.2, dLat * 0.5, dLng * 0.2);
    const v = verificarZona(z, ctx, predio, { usle })!;
    expect(v.erosion).not.toBeNull();
    // El mismo número que sale de llamar a la USLE con los parámetros de la zona.
    expect(v.erosion!.LS).toBeCloseTo(factorLS(v.geometria.pend_mediana_pct, v.geometria.lambda_m), 1);
  });

  it('SIN COBERTURA NI SUELO NO INVENTA UNA PÉRDIDA: PIDE LOS PANELES', () => {
    const z = zonaCuadrada('z', 'cultivo', g.latMin + dLat * 0.3, g.lngMin + dLng * 0.3, dLat * 0.2, dLng * 0.2);
    const v = verificarZona(z, ctx, predio, {})!;
    expect(v.erosion).toBeNull();
    expect(v.advertencias.some(a => a.includes('no se rellena'))).toBe(true);
  });

  it('una pérdida arriba de la tolerancia es un requisito y no una exclusión', () => {
    // Pendiente alta y ladera larga para pasarse de la tolerancia.
    const gEmp = planoInclinado(40, 40, 10, 0.35);
    const ctxEmp = prepararEmplazamiento(gEmp)!;
    const dL = gEmp.latMax - gEmp.latMin;
    const dG = gEmp.lngMax - gEmp.lngMin;
    const z = zonaCuadrada('z', 'cultivo', gEmp.latMin + dL * 0.1, gEmp.lngMin + dG * 0.3, dL * 0.8, dG * 0.3);
    const v = verificarZona(z, ctxEmp, null, { usle })!;
    expect(v.erosion!.veces_tolerancia).toBeGreaterThan(1);
    expect(v.erosion!.t_ha_anio).toBeGreaterThan(TOLERANCIA_T_HA);
    expect(v.requisitos.some(r => r.titulo.includes('Pérdida de suelo'))).toBe(true);
    expect(v.exclusiones.some(e => e.regla === 'cauce')).toBe(false);
  });

  it('UNA CATEGORÍA SIN CIFRA PUBLICADA NO RECIBE UNA CIFRA INVENTADA', () => {
    const z = zonaCuadrada('z', 'apiario', g.latMin + dLat * 0.3, g.lngMin + dLng * 0.3, dLat * 0.2, dLng * 0.2);
    const v = verificarZona(z, ctx, predio, { usle })!;
    expect(v.erosion).toBeNull();
    expect(v.requisitos).toHaveLength(0);
    expect(v.advertencias.some(a => a.includes('no le pone ninguna'))).toBe(true);
  });

  it('una zona de Mollison sin centro definido pide el centro en vez de suponerlo', () => {
    const z = zonaCuadrada('z', 'zona_1', g.latMin + dLat * 0.6, g.lngMin + dLng * 0.6, dLat * 0.15, dLng * 0.15);
    const v = verificarZona(z, ctx, predio, { usle })!;
    expect(v.caminata).toBeNull();
    expect(v.advertencias.some(a => a.includes('zona 0'))).toBe(true);
  });

  it('y con el centro definido calcula el presupuesto de caminata de esa zona', () => {
    const z = zonaCuadrada('z', 'zona_1', g.latMin + dLat * 0.6, g.lngMin + dLng * 0.6, dLat * 0.15, dLng * 0.15);
    const centro = { lat: g.latMin + dLat * 0.05, lng: g.lngMin + dLng * 0.05 };
    const v = verificarZona(z, ctx, predio, { usle, centro })!;
    expect(v.caminata).not.toBeNull();
    expect(v.caminata!.zona).toBe(1);
    expect(v.caminata!.km_anio[0]).toBeGreaterThan(0);
    // Y la subida pesa: la zona está más arriba que el centro.
    expect(v.caminata!.viaje.desnivel_m).toBeGreaterThan(0);
    expect(v.caminata!.viaje.horas_ida).toBeGreaterThan(v.caminata!.viaje.horas_vuelta);
  });

  it('una zona que cruza el borde del predio avisa qué fracción quedó afuera', () => {
    const z = zonaCuadrada('z', 'cultivo', g.latMax - dLat * 0.05, g.lngMin + dLng * 0.4, dLat * 0.2, dLng * 0.2);
    const v = verificarZona(z, ctx, predio, { usle })!;
    expect(v.recorte!.frac_afuera).toBeGreaterThan(0.1);
    expect(v.advertencias.some(a => a.includes('afuera del perímetro'))).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('el relevamiento completo', () => {
  const g = planoInclinado(40, 40, 10, 0.12);
  const ctx = prepararEmplazamiento(g)!;
  const dLat = g.latMax - g.latMin;
  const dLng = g.lngMax - g.lngMin;
  const mojones = [
    { id: 'a', numero: 1, lat: g.latMin, lng: g.lngMin },
    { id: 'b', numero: 2, lat: g.latMin, lng: g.lngMax },
    { id: 'c', numero: 3, lat: g.latMax, lng: g.lngMax },
    { id: 'd', numero: 4, lat: g.latMax, lng: g.lngMin },
  ];

  it('revisa todas las zonas y separa las que no se pudieron medir', () => {
    const dentro = zonaCuadrada('a', 'cultivo', g.latMin + dLat * 0.2, g.lngMin + dLng * 0.2, dLat * 0.3, dLng * 0.3);
    const lejos  = zonaCuadrada('b', 'huerta', g.latMax + 0.05, g.lngMax + 0.05, 0.002);
    const r = revisarZonificacion([dentro, lejos], mojones, ctx, {});
    expect(r.zonas).toHaveLength(1);
    expect(r.sin_medir).toHaveLength(1);
    expect(r.sin_medir[0]!.id).toBe('b');
  });

  it('SIN LA GRILLA DENSA NO MIDE NADA, Y LO DICE EN VEZ DE DEVOLVER CEROS', () => {
    const z = zonaCuadrada('a', 'cultivo', g.latMin + dLat * 0.2, g.lngMin + dLng * 0.2, dLat * 0.3, dLng * 0.3);
    const r = revisarZonificacion([z], mojones, null, {});
    expect(r.zonas).toHaveLength(0);
    expect(r.advertencias.some(a => a.includes('Sin la grilla densa'))).toBe(true);
    // Pero el balance de superficies sí se puede calcular sin relieve.
    expect(r.balance.union_ha).toBeGreaterThan(0);
  });

  it('con zonas de Mollison y sin zona 0 recuerda que el anillo no es la zona', () => {
    const z = zonaCuadrada('a', 'zona_2', g.latMin + dLat * 0.5, g.lngMin + dLng * 0.5, dLat * 0.2, dLng * 0.2);
    const r = revisarZonificacion([z], mojones, ctx, {});
    expect(r.advertencias.some(a => a.includes('concentric circles'))).toBe(true);
  });

  it('y con una zona 0 dibujada ya no lo recuerda', () => {
    const z0 = zonaCuadrada('c', 'zona_0', g.latMin + dLat * 0.05, g.lngMin + dLng * 0.05, dLat * 0.08, dLng * 0.08);
    const z2 = zonaCuadrada('a', 'zona_2', g.latMin + dLat * 0.5, g.lngMin + dLng * 0.5, dLat * 0.2, dLng * 0.2);
    const r = revisarZonificacion([z0, z2], mojones, ctx, {});
    expect(r.advertencias.some(a => a.includes('concentric circles'))).toBe(false);
  });

  it('sin zonas dibujadas no hay nada que revisar y no se rompe', () => {
    const r = revisarZonificacion([], mojones, ctx, {});
    expect(r.zonas).toHaveLength(0);
    expect(r.balance.suma_ha).toBe(0);
    expect(r.con_exclusion).toBe(0);
  });
});
