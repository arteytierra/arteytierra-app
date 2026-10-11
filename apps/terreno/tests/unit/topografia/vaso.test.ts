/**
 * Tests del vaso del embalse deducido del muro (`lib/vaso.ts`).
 *
 * El criterio de estos tests es el de `motor-de-calculo`: no alcanza con que la
 * función devuelva un número. Dos de los casos tienen **solución analítica
 * exacta** —un cono invertido y un valle en V con pendiente longitudinal— y uno
 * sale de un **caso resuelto publicado**: la pileta excavada del capítulo 11
 * del Engineering Field Manual del USDA SCS, que el manual calcula por la
 * fórmula prismoidal y cierra en 3.996 yd³.
 *
 * La tolerancia de cada caso está escrita y es la de la discretización de la
 * grilla: el motor integra celda por celda y una celda no sabe de bordes
 * curvos. Por eso las grillas de los casos analíticos son finas y las
 * tolerancias chicas; si alguien baja la resolución, estos tests se caen, que
 * es exactamente lo que tienen que hacer.
 */
import { describe, it, expect } from 'vitest';
import {
  vasoDesdeMuro, vasoDesdePunto, nivelVaso, compararConPoligono,
  CELDAS_MINIMAS_VASO,
} from '@/lib/vaso';
import { calcularEmbalse } from '@/lib/cutfill';
import { grillaMetrica, puntoMetrico } from './_grilla';

const PIE_M = 0.3048;
const YARDA3_M3 = 0.764554857984;

/** Error relativo, para que la tolerancia de cada caso quede escrita. */
const rel = (obtenido: number, esperado: number) => Math.abs(obtenido - esperado) / esperado;

// ─────────────────────────────────────────────────────────────────────────────
// 1 · Cono invertido: solución analítica
// ─────────────────────────────────────────────────────────────────────────────
describe('vasoDesdePunto — cono invertido con solución analítica', () => {
  // z = s·r con el vértice en el centro. El volumen a profundidad L es
  // π·L³/(3·s²) y el espejo π·(L/s)². Se deduce integrando (L − s·r) sobre el
  // disco de radio L/s, y no hay aproximación en el medio.
  const PASO = 0.5, S = 0.2, N = 121, CENTRO = (N - 1) / 2 * PASO;   // 30 m
  const g = grillaMetrica(N, N, PASO, (x, y) => S * Math.hypot(x - CENTRO, y - CENTRO));
  const v = vasoDesdePunto(g, puntoMetrico(g, CENTRO, CENTRO))!;

  it('encuentra el vaso y lo ordena por cota de llegada creciente', () => {
    expect(v).not.toBeNull();
    expect(v.celdas.length).toBeGreaterThan(CELDAS_MINIMAS_VASO);
    for (let i = 1; i < v.celdas.length; i++) {
      expect(v.celdas[i]!.cota_m).toBeGreaterThanOrEqual(v.celdas[i - 1]!.cota_m);
    }
  });

  it('el volumen a 4 m coincide con π·L³/(3·s²) dentro del 1 %', () => {
    const esperado = Math.PI * Math.pow(4, 3) / (3 * S * S);   // 1.675,5 m³
    const n = nivelVaso(v, 4);
    expect(rel(n.volumen_m3, esperado)).toBeLessThan(0.01);
  });

  it('el espejo a 4 m coincide con π·(L/s)² dentro del 3 %', () => {
    // La tolerancia del área es mayor que la del volumen a propósito: el borde
    // del espejo es una circunferencia y las celdas del borde entran o no
    // enteras, mientras que en el volumen esas mismas celdas aportan una
    // profundidad que tiende a cero.
    const esperado = Math.PI * Math.pow(4 / S, 2);   // 1.256,6 m²
    expect(rel(nivelVaso(v, 4).area_inundada_m2, esperado)).toBeLessThan(0.03);
  });

  it('la profundidad máxima es el nivel sobre el vértice', () => {
    expect(nivelVaso(v, 4).prof_max_m).toBeCloseTo(4, 1);
  });

  it('el volumen crece con el nivel y nunca baja', () => {
    let previo = -1;
    for (let nivel = 0.5; nivel <= 5; nivel += 0.5) {
      const vol = nivelVaso(v, nivel).volumen_m3;
      expect(vol).toBeGreaterThan(previo);
      previo = vol;
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2 · Valle en V cerrado por un muro: solución analítica, y aguas abajo no cuenta
// ─────────────────────────────────────────────────────────────────────────────
describe('vasoDesdeMuro — valle en V con pendiente longitudinal', () => {
  // z = p·(x − xMuro) + q·|y − yEje|, con el muro en xMuro cruzando todo el
  // valle. El pelo de agua a cota L ocupa un triángulo en (x, |y|) y el volumen
  // sale ∫∫(L − p·u − q·v) = L³/(3·p·q). Aguas abajo del muro el terreno baja
  // hasta −1,2 m: si esas celdas entraran al volumen, se notaría.
  const PASO = 1, P = 0.02, Q = 0.1;
  const X_MURO = 60, Y_EJE = 50, COLS = 221, ROWS = 101;
  const g = grillaMetrica(ROWS, COLS, PASO, (x, y) => P * (x - X_MURO) + Q * Math.abs(y - Y_EJE));
  const muro = { a: puntoMetrico(g, X_MURO, 0), b: puntoMetrico(g, X_MURO, (ROWS - 1) * PASO) };
  const v = vasoDesdeMuro(g, muro, { referenciaAguasArriba: puntoMetrico(g, 160, Y_EJE) })!;
  const NIVEL = 2;

  it('calcula el vaso y la profundidad contra el muro', () => {
    expect(v).not.toBeNull();
    // El terreno más bajo del eje está en el fondo del valle, a cota 0.
    expect(v.cotaEjeMin_m).toBeCloseTo(0, 6);
    expect(nivelVaso(v, NIVEL).profEnMuro_m).toBeCloseTo(NIVEL, 1);
  });

  it('el volumen coincide con L³/(3·p·q), un poco por debajo porque el eje del muro es obra', () => {
    // El continuo da 1.333,3 m³ integrando desde el muro. La grilla integra
    // desde media celda aguas arriba del eje —la columna del eje es terraplén,
    // no agua— así que el valor esperado es (L − p·paso/2)³/(3·p·q) = 1.313,4.
    const continuo = Math.pow(NIVEL, 3) / (3 * P * Q);
    const conObra  = Math.pow(NIVEL - P * PASO / 2, 3) / (3 * P * Q);
    const vol = nivelVaso(v, NIVEL).volumen_m3;
    expect(rel(vol, conObra)).toBeLessThan(0.02);
    expect(vol).toBeLessThan(continuo);
  });

  it('el espejo coincide con (L − p·paso/2)²/(p·q) dentro del 3 %', () => {
    const esperado = Math.pow(NIVEL - P * PASO / 2, 2) / (P * Q);   // 1.980 m²
    expect(rel(nivelVaso(v, NIVEL).area_inundada_m2, esperado)).toBeLessThan(0.03);
  });

  it('ninguna celda del vaso está aguas abajo del muro', () => {
    // Es la falla (a) del cálculo por polígono: una hondonada del lado seco
    // entraba al volumen porque el polígono la encerraba. Acá el muro es
    // frontera cerrada y no hay camino.
    const colMuro = Math.round(X_MURO / PASO);
    for (const c of v.celdas) expect(c.col).toBeGreaterThan(colMuro);
  });

  it('el valle sigue más allá de la ventana: el tope es el borde del DEM, no un derrame', () => {
    expect(v.tipoTope).toBe('borde_del_dem');
    expect(v.tocaBorde).toBe(true);
    expect(v.advertencias.join(' ')).toMatch(/mínimo, no una estimación/);
    // Y el nivel que se está evaluando está por debajo de ese tope, así que el
    // número de arriba sigue valiendo.
    expect(v.cotaDerrame_m).toBeGreaterThan(NIVEL);
    expect(nivelVaso(v, NIVEL).derrama).toBe(false);
  });

  it('sin punto de referencia, el lado del agua se deduce de la elevación', () => {
    const sinRef = vasoDesdeMuro(g, muro)!;
    expect(sinRef.ladoAguasArriba).toBe('elevacion');
    const colMuro = Math.round(X_MURO / PASO);
    for (const c of sinRef.celdas) expect(c.col).toBeGreaterThan(colMuro);
    expect(nivelVaso(sinRef, NIVEL).volumen_m3).toBe(nivelVaso(v, NIVEL).volumen_m3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3 · Muro corto: el agua se va por el estribo
// ─────────────────────────────────────────────────────────────────────────────
describe('vasoDesdeMuro — un muro que no cierra el valle', () => {
  const PASO = 1, P = 0.02, Q = 0.1;
  const X_MURO = 60, Y_EJE = 50, COLS = 221, ROWS = 101;
  const g = grillaMetrica(ROWS, COLS, PASO, (x, y) => P * (x - X_MURO) + Q * Math.abs(y - Y_EJE));
  // Sólo 10 m de muro sobre un valle cuyo fondo necesita 40 para cerrarse a 2 m.
  const corto = { a: puntoMetrico(g, X_MURO, Y_EJE - 5), b: puntoMetrico(g, X_MURO, Y_EJE + 5) };
  const v = vasoDesdeMuro(g, corto, { referenciaAguasArriba: puntoMetrico(g, 160, Y_EJE) })!;

  it('el derrame cae sobre el estribo y lo dice: no es un vertedero, es muro faltante', () => {
    expect(v.tipoTope).toBe('derrame');
    expect(v.derramePorEstribo).toBe(true);
    expect(v.advertencias.join(' ')).toMatch(/alargar el muro/);
  });

  it('el embalse se termina a la cota de la punta del muro', () => {
    // La punta está a q·5 = 0,50 m sobre el fondo; el camino de escape sube un
    // paso de valle más (p·1) antes de empezar a bajar.
    expect(v.cotaDerrame_m).toBeLessThan(0.7);
    expect(nivelVaso(v, 2).derrama).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4 · Dos sillas de montar: manda la más baja, y se dice dónde
// ─────────────────────────────────────────────────────────────────────────────
describe('vasoDesdeMuro — cota de derrame con dos sillas de distinta cota', () => {
  // Un vaso rectangular plano a cota 0, rodeado de un borde a 10 m, con dos
  // pasos hacia afuera: uno a 3,0 m al este y otro a 4,0 m al oeste. Detrás de
  // cada paso el terreno baja a 0,5 y sale de la grilla.
  const PASO = 1, N = 61;
  const g = grillaMetrica(N, N, PASO, (x, y) => {
    const enEje = Math.abs(y - 30) <= 1;
    if (enEje && x >= 53) return 0.5;                       // corredor este, aguas afuera
    if (enEje && x >= 50 && x <= 52) return 3.0;            // silla baja
    if (enEje && x <= 7) return 0.5;                        // corredor oeste, aguas afuera
    if (enEje && x >= 8 && x <= 9) return 4.0;              // silla alta
    if (y <= 10 && x >= 25 && x <= 35) return y <= 9 ? -0.1 * (10 - y) : 0;   // compuerta del muro
    if (x >= 10 && x <= 49 && y >= 11 && y <= 49) return 0; // el vaso
    return 10;                                              // el borde alto
  });
  const muro = { a: puntoMetrico(g, 24, 10), b: puntoMetrico(g, 36, 10) };
  const v = vasoDesdeMuro(g, muro, { referenciaAguasArriba: puntoMetrico(g, 30, 30) })!;

  it('el techo es la silla más baja, no la más alta ni el borde del DEM', () => {
    expect(v.tipoTope).toBe('derrame');
    expect(v.tocaBorde).toBe(false);
    expect(v.cotaDerrame_m).toBeCloseTo(3.0, 6);
  });

  it('el punto de derrame cae sobre la silla baja, que es donde va el vertedero', () => {
    const p = v.puntoDerrame!;
    expect(p).not.toBeNull();
    const dLat = (g.latMax - g.latMin) / (g.rows - 1);
    const dLng = (g.lngMax - g.lngMin) / (g.cols - 1);
    const y = Math.round((p.lat - g.latMin) / dLat);
    const x = Math.round((p.lng - g.lngMin) / dLng);
    expect(x).toBeGreaterThanOrEqual(50);
    expect(x).toBeLessThanOrEqual(52);
    expect(Math.abs(y - 30)).toBeLessThanOrEqual(1);
    expect(v.derramePorEstribo).toBe(false);
  });

  it('el volumen del vaso plano es exactamente el área por la lámina', () => {
    // 40 × 39 celdas de 1 m² a cota 0: a 1 m de agua, 1.560 m³. Las sillas y
    // los corredores están por encima, así que no entran a este nivel.
    const n = nivelVaso(v, 1);
    expect(n.celdas).toBe(40 * 39);
    expect(n.volumen_m3).toBe(40 * 39);
    expect(n.area_inundada_m2).toBe(40 * 39);
  });

  it('ninguna celda del vaso está del lado seco de la compuerta', () => {
    // El muro ocupa la fila 10; aguas abajo el terreno baja hasta −0,1 m y, si
    // el cálculo no respetara la obra, esas celdas entrarían como agua.
    for (const c of v.celdas) expect(c.row).toBeGreaterThan(10);
  });

  it('pedir un nivel por encima del derrame se marca como imposible', () => {
    expect(nivelVaso(v, 3.5).derrama).toBe(true);
    expect(nivelVaso(v, 2.9).derrama).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5 · El caso de Jonatan: una hoya preexistente aguas arriba de un cuello
// ─────────────────────────────────────────────────────────────────────────────
describe('vasoDesdeMuro — la hoya que el polígono no ve (regresión)', () => {
  // «A veces los muros pueden ser de un metro de alto pero contener mucha agua
  // debido a una depresión preexistente y no lo tiene en cuenta.» Esto es ese
  // terreno: un cuello de 6 m de ancho a cota 0, y detrás una hoya de 50 m de
  // ancho y 75 de largo hundida 1,2 m. Un muro de 1 m sobre el cuello la cierra
  // entera.
  const PASO = 1, COLS = 201, ROWS = 101, Y_EJE = 50;
  const anchoFondo = (x: number) => (x <= 55 ? 20 : x <= 65 ? 3 : 25);
  const fondo = (x: number) => {
    if (x <= 60) return -0.02 * (60 - x);            // aguas abajo, cae
    if (x <= 65) return -1.2 * ((x - 60) / 5);       // rampa hacia la hoya
    if (x <= 140) return -1.2;                        // la hoya
    return -1.2 + 0.1 * (x - 140);                    // remonta hacia la cabecera
  };
  const g = grillaMetrica(ROWS, COLS, PASO, (x, y) =>
    fondo(x) + 0.25 * Math.max(0, Math.abs(y - Y_EJE) - anchoFondo(x)));

  const muro = { a: puntoMetrico(g, 60, Y_EJE - 40), b: puntoMetrico(g, 60, Y_EJE + 40) };
  const v = vasoDesdeMuro(g, muro, { referenciaAguasArriba: puntoMetrico(g, 100, Y_EJE) })!;
  const NIVEL = 1;   // un muro de ~1 m sobre el fondo del cuello

  // El polígono que alguien dibujaría alrededor del pin sugerido: el cuello y
  // treinta metros aguas arriba. No llega a la hoya.
  const poligono = [
    puntoMetrico(g, 60, Y_EJE - 15), puntoMetrico(g, 90, Y_EJE - 15),
    puntoMetrico(g, 90, Y_EJE + 15), puntoMetrico(g, 60, Y_EJE + 15),
  ];

  it('el vaso real es mucho mayor que lo que entra en el polígono dibujado', () => {
    const real = nivelVaso(v, NIVEL);
    const porPoligono = calcularEmbalse(g, poligono, NIVEL)!;
    expect(porPoligono).not.toBeNull();
    // El número que documenta el error que vinimos a arreglar.
    expect(real.volumen_m3).toBeGreaterThan(porPoligono.volumen_m3 * 2);
    const cmp = compararConPoligono({
      nivelMuro: real,
      volumenPoligono_m3: porPoligono.volumen_m3,
      areaPoligono_m2: porPoligono.area_inundada_m2,
    });
    expect(cmp.razonVolumen).toBeGreaterThan(2);
    expect(cmp.lectura).toMatch(/más allá de lo que dibujaste/);
  });

  it('el muro es bajo y el agua es mucha: la hoya entra completa', () => {
    const real = nivelVaso(v, NIVEL);
    // Profundidad contra el muro ~1 m, pero profundidad máxima ~2,2 m en la
    // hoya. Son dos números distintos y el que manda la altura del muro es el
    // primero: pasarle el segundo a `dimensionarMuro` engorda el terraplén.
    expect(real.profEnMuro_m).toBeCloseTo(1, 1);
    expect(real.prof_max_m).toBeGreaterThan(2);
    expect(real.profEnMuro_m).toBeLessThan(real.prof_max_m);
    // Y el espejo llega hasta la hoya, muy por encima de las 0,9 ha del polígono.
    expect(real.area_inundada_m2).toBeGreaterThan(5_000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6 · Caso resuelto publicado: la pileta excavada del EFM cap. 11
// ─────────────────────────────────────────────────────────────────────────────
describe('vasoDesdePunto — pileta excavada del Engineering Field Manual, cap. 11', () => {
  // El manual resuelve esta pileta por la fórmula prismoidal:
  //   fondo de 40 × 100 pies, 12 pies de profundidad, taludes 2:1 y una rampa
  //   de acceso 4:1 en un extremo.
  //   Top length = 12(2) + 12(4) + 100 = 172 pies · Top width = 12(2)(2) + 40 = 88
  //   A = 15.136 · 4B = 34.816 · C = 4.000 → V = 12/6 · 53.952 / 27 = 3.996 yd³
  //
  // El DEM se arma como el máximo de los planos de los taludes, que es lo que
  // da la forma real de la excavación: a una altura h sobre el fondo el
  // rectángulo mide 30,48 + 6h de largo y 12,19 + 4h de ancho, o sea los 172 ×
  // 88 pies del manual al llegar al borde. Dos métodos distintos, un solo
  // número publicado.
  const PASO = 0.4;
  const PROF = 12 * PIE_M, LARGO = 100 * PIE_M, ANCHO = 40 * PIE_M;
  const COLS = 201, ROWS = 126;                       // 80 × 50 m
  const X0 = (80 - LARGO) / 2, Y0 = (50 - ANCHO) / 2;
  const g = grillaMetrica(ROWS, COLS, PASO, (x, y) => {
    const dxBajo = Math.max(0, X0 - x), dxAlto = Math.max(0, x - (X0 + LARGO));
    const dyBajo = Math.max(0, Y0 - y), dyAlto = Math.max(0, y - (Y0 + ANCHO));
    return -PROF + Math.max(dxBajo / 2, dxAlto / 4, dyBajo / 2, dyAlto / 2);
  });
  const v = vasoDesdePunto(g, puntoMetrico(g, X0 + LARGO / 2, Y0 + ANCHO / 2))!;

  it('el volumen a ras del terreno reproduce los 3.996 yd³ publicados dentro del 1 %', () => {
    const n = nivelVaso(v, 0);
    expect(rel(n.volumen_m3 / YARDA3_M3, 3_996)).toBeLessThan(0.01);
  });

  it('el espejo a ras del terreno reproduce los 88 × 172 pies del manual dentro del 2 %', () => {
    const esperado = (88 * PIE_M) * (172 * PIE_M);   // 15.136 pie² = 1.406,1 m²
    expect(rel(nivelVaso(v, 0).area_inundada_m2, esperado)).toBeLessThan(0.02);
  });

  it('la profundidad máxima son los 12 pies de excavación', () => {
    // 12 pies = 3,6576 m, que redondeado al decímetro que informa el motor son 3,7.
    expect(nivelVaso(v, 0).prof_max_m).toBe(3.7);
  });

  it('el borde de la pileta queda por debajo del tope del vaso', () => {
    // Los taludes siguen subiendo fuera de la excavación, así que el nivel 0
    // que se evalúa arriba está dentro del rango válido de la curva.
    expect(v.cotaDerrame_m).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7 · Degradación avisando
// ─────────────────────────────────────────────────────────────────────────────
describe('vaso — cuando la grilla no alcanza', () => {
  it('un muro fuera de la grilla no devuelve un vaso inventado', () => {
    const g = grillaMetrica(31, 31, 10, (x) => x * 0.05);
    const muro = { a: { lat: 10, lng: 10 }, b: { lat: 10.001, lng: 10.001 } };
    expect(vasoDesdeMuro(g, muro)).toBeNull();
  });

  it('una grilla gruesa avisa que la forma del vaso es la de la grilla', () => {
    // Celdas de 30 m: el mismo valle del caso 2, pero con el paso de un SRTM.
    const PASO = 30, P = 0.02, Q = 0.1, X_MURO = 60, Y_EJE = 150;
    const g = grillaMetrica(11, 11, PASO, (x, y) => P * (x - X_MURO) + Q * Math.abs(y - Y_EJE));
    const muro = { a: puntoMetrico(g, X_MURO, 0), b: puntoMetrico(g, X_MURO, 300) };
    const v = vasoDesdeMuro(g, muro, { referenciaAguasArriba: puntoMetrico(g, 240, Y_EJE) })!;
    expect(v.celdas.length).toBeLessThan(CELDAS_MINIMAS_VASO);
    expect(v.advertencias.join(' ')).toMatch(/celdas de 30 m/);
  });

  it('cuando los dos cálculos coinciden, la lectura lo dice en vez de alarmar', () => {
    const cmp = compararConPoligono({
      nivelMuro: {
        nivel_m: 1, volumen_m3: 1_000, area_inundada_m2: 2_000, prof_max_m: 1,
        prof_media_m: 0.5, profEnMuro_m: 1, celdas: 2_000, derrama: false,
      },
      volumenPoligono_m3: 1_020,
      areaPoligono_m2: 2_050,
    });
    expect(cmp.razonVolumen).toBeCloseTo(0.98, 2);
    expect(cmp.lectura).toMatch(/coinciden/);
  });
});
