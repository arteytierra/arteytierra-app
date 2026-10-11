/**
 * Tests de los criterios publicados de la geometría Keyline.
 *
 * Los números no son de criterio: salen de cuatro fuentes y están todos acá con
 * el caso que las cita. Yeomans y Pavlov para la geometría y los límites de
 * máquina, y los dos estándares del NRCS para la banda en la que la pendiente
 * del surco puede moverse y para el borde de lote.
 *
 * El test que más importa es el último del bloque del veredicto: **un patrón que
 * corre exactamente a nivel NO es un patrón Keyline**. Si alguien vuelve a
 * puntuar esta herramienta premiando la deriva cerca de cero —que es lo que
 * hacía hasta el 04/10/2026— ése es el test que se cae.
 */
import { describe, it, expect } from 'vitest';
import {
  bandaDeriva, aptitudKeyline, headland, simplificarDirectriz, verticesCerrados,
  resumirPatron, leerVeredicto, pctAGrados,
  DERIVA_MAX_PCT, DERIVA_MAX_FRACCION_PENDIENTE, DERIVA_MIN_DRENAJE_PCT,
  GIRO_MAX_TRACTOR_DEG, GIRO_MAX_TRACTOR_DEG_PERMISIVO, ANGULO_INTERIOR_MIN_DEG,
  DERIVA_POR_ANGULO_PAVLOV, HEADLAND_VECES_MIN, HEADLAND_VECES_MAX,
  BORDE_LOTE_MIN_M, LARGO_LADERA_MIN_M, LARGO_LADERA_MAX_M, LLUVIA_10A_24H_LIMITE_MM,
  PENDIENTE_EFECTIVA_MIN_PCT, PENDIENTE_EFECTIVA_MAX_PCT, PENDIENTE_OTRO_PATRON_DEG,
  redondearVertices,
  type TramoPatron,
} from '@/lib/keylineGeometria';
import { generarPatronCultivo, derivaDelTramo } from '@/lib/keyline';
import { grillaMetrica, puntoMetrico } from '../topografia/_grilla';

const PIE_M = 0.3048;
const PULGADA_M = 0.0254;

// ─────────────────────────────────────────────────────────────────────────────
// Las constantes, contra lo impreso
// ─────────────────────────────────────────────────────────────────────────────
describe('las constantes publicadas', () => {
  it('la banda de deriva es la del estándar 330: mitad de la pendiente, tope 4 %, piso 0,2 %', () => {
    expect(DERIVA_MAX_PCT).toBe(4);
    expect(DERIVA_MAX_FRACCION_PENDIENTE).toBe(0.5);
    expect(DERIVA_MIN_DRENAJE_PCT).toBe(0.2);
  });

  it('el giro del tractor es el rango 50–55° de Pavlov, tomando el extremo exigente', () => {
    expect(GIRO_MAX_TRACTOR_DEG).toBe(50);
    expect(GIRO_MAX_TRACTOR_DEG_PERMISIVO).toBe(55);
    expect(ANGULO_INTERIOR_MIN_DEG).toBe(130);
    // «Por cada 10 grados de cambio en el ángulo de la geometría, la pendiente
    // de los rayos cambia 5 grados.»
    expect(10 * DERIVA_POR_ANGULO_PAVLOV).toBe(5);
  });

  it('el headland es 2 a 4 veces el implemento y el borde de lote son 30 pies', () => {
    expect(HEADLAND_VECES_MIN).toBe(2);
    expect(HEADLAND_VECES_MAX).toBe(4);
    expect(BORDE_LOTE_MIN_M).toBeCloseTo(30 * PIE_M, 6);
    expect(BORDE_LOTE_MIN_M).toBeCloseTo(9.14, 2);
  });

  it('los límites de efectividad son los del estándar: 2–10 %, 100–400 pies, 6,5 pulgadas', () => {
    expect(PENDIENTE_EFECTIVA_MIN_PCT).toBe(2);
    expect(PENDIENTE_EFECTIVA_MAX_PCT).toBe(10);
    expect(PENDIENTE_OTRO_PATRON_DEG).toBe(20);
    expect(LARGO_LADERA_MIN_M).toBeCloseTo(100 * PIE_M, 6);   // 30,48 m
    expect(LARGO_LADERA_MAX_M).toBeCloseTo(400 * PIE_M, 6);   // 121,92 m
    expect(LLUVIA_10A_24H_LIMITE_MM).toBeCloseTo(6.5 * PULGADA_M * 1000, 6);
    expect(LLUVIA_10A_24H_LIMITE_MM).toBeCloseTo(165.1, 1);
  });

  it('la conversión de pendiente a grados: 100 % son 45°', () => {
    expect(pctAGrados(100)).toBeCloseTo(45, 6);
    expect(pctAGrados(0)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// La banda de deriva
// ─────────────────────────────────────────────────────────────────────────────
describe('bandaDeriva', () => {
  it('el techo es la mitad de la pendiente del terreno', () => {
    expect(bandaDeriva({ pendienteTerreno_pct: 6 }).max_pct).toBeCloseTo(3, 6);
    expect(bandaDeriva({ pendienteTerreno_pct: 4 }).max_pct).toBeCloseTo(2, 6);
  });

  it('pero nunca pasa del 4 %, aunque el terreno sea empinado', () => {
    // «with a maximum 4-percent row grade»: a 20 % de pendiente la mitad serían
    // 10 %, y el tope publicado manda.
    expect(bandaDeriva({ pendienteTerreno_pct: 20 }).max_pct).toBe(4);
    expect(bandaDeriva({ pendienteTerreno_pct: 8 }).max_pct).toBeCloseTo(4, 6);
  });

  it('un suelo de infiltración lenta le pone piso al surco; uno rápido no', () => {
    expect(bandaDeriva({ pendienteTerreno_pct: 6, grupoHidro: 'C' }).min_pct).toBe(0.2);
    expect(bandaDeriva({ pendienteTerreno_pct: 6, grupoHidro: 'D' }).pideDrenaje).toBe(true);
    expect(bandaDeriva({ pendienteTerreno_pct: 6, grupoHidro: 'B' }).min_pct).toBe(0);
    expect(bandaDeriva({ pendienteTerreno_pct: 6, grupoHidro: 'A' }).pideDrenaje).toBe(false);
  });

  it('un cultivo sensible al agua parada le pone el mismo piso que un suelo C', () => {
    const b = bandaDeriva({ pendienteTerreno_pct: 6, grupoHidro: 'A', cultivoSensibleAlAgua: true });
    expect(b.min_pct).toBe(0.2);
  });

  it('el 0,5 % que la app llamaba «excelente» puede quedar por debajo del mínimo publicado', () => {
    // Éste es el hallazgo: con 0,8 % de pendiente del terreno el techo son
    // 0,4 %, así que en un suelo C la banda admisible es 0,2–0,4 % y el 0,5 %
    // que la app premiaba como encaje excelente está FUERA, por arriba.
    const b = bandaDeriva({ pendienteTerreno_pct: 0.8, grupoHidro: 'C' });
    expect(b.min_pct).toBe(0.2);
    expect(b.max_pct).toBeCloseTo(0.4, 6);
    expect(0.5).toBeGreaterThan(b.max_pct);
    expect(b.bandaVacia).toBe(false);
  });

  it('en terreno demasiado plano la banda queda vacía y se dice, en vez de invertirse', () => {
    const b = bandaDeriva({ pendienteTerreno_pct: 0.3, grupoHidro: 'D' });
    expect(b.bandaVacia).toBe(true);
    expect(b.min_pct).toBeGreaterThan(b.max_pct);
    expect(b.nota).toMatch(/entre 2 y 10/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Aptitud de la pendiente, del largo de ladera y de la tormenta
// ─────────────────────────────────────────────────────────────────────────────
describe('aptitudKeyline', () => {
  it('dentro del 2–10 % de pendiente es apto y no hace falta decir nada', () => {
    const a = aptitudKeyline({ pendiente_pct: 5 });
    expect(a.grado).toBe('apto');
    expect(a.motivos).toHaveLength(0);
  });

  it('arriba del 10 % es menos efectivo y se avisa', () => {
    const a = aptitudKeyline({ pendiente_pct: 12 });
    expect(a.grado).toBe('con_reservas');
    expect(a.motivos.join(' ')).toMatch(/10 %/);
  });

  it('arriba de 20° manda otro patrón: surcos a 90° de las curvas', () => {
    // 20° son 36,4 % de pendiente. Justo abajo sigue siendo "con reservas"
    // (por pasar el 10 %) y justo arriba cambia de recomendación.
    const justoAbajo = aptitudKeyline({ pendiente_pct: 36 });
    expect(justoAbajo.grado).toBe('con_reservas');
    const justoArriba = aptitudKeyline({ pendiente_pct: 37 });
    expect(justoArriba.grado).toBe('otro_patron');
    expect(justoArriba.motivos.join(' ')).toMatch(/90°/);
  });

  it('debajo del 2 % la práctica pierde sentido', () => {
    const a = aptitudKeyline({ pendiente_pct: 1 });
    expect(a.grado).toBe('con_reservas');
    expect(a.motivos.join(' ')).toMatch(/2 %/);
  });

  it('una ladera de más de 400 pies desborda la capacidad de los surcos', () => {
    const a = aptitudKeyline({ pendiente_pct: 5, largoLadera_m: 150 });
    expect(a.grado).toBe('con_reservas');
    expect(a.motivos.join(' ')).toMatch(/122 m/);
  });

  it('una ladera de menos de 100 pies no invalida el patrón: lo vuelve poco relevante', () => {
    const a = aptitudKeyline({ pendiente_pct: 5, largoLadera_m: 20 });
    expect(a.grado).toBe('apto');
    expect(a.motivos).toHaveLength(1);
    expect(a.motivos[0]).toMatch(/poco relevante/);
  });

  it('con una tormenta de 10 años por encima de 165 mm pierde efectividad', () => {
    expect(aptitudKeyline({ pendiente_pct: 5, lluvia10a24h_mm: 160 }).grado).toBe('apto');
    const a = aptitudKeyline({ pendiente_pct: 5, lluvia10a24h_mm: 180 });
    expect(a.grado).toBe('con_reservas');
    expect(a.motivos.join(' ')).toMatch(/165 mm/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// El giro del tractor
// ─────────────────────────────────────────────────────────────────────────────
describe('verticesCerrados', () => {
  it('una recta no tiene vértices que girar', () => {
    const recta = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 0 }];
    expect(verticesCerrados(recta)).toHaveLength(0);
  });

  it('un codo de 90° pasa el giro máximo y se marca', () => {
    const codo = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
    const v = verticesCerrados(codo);
    expect(v).toHaveLength(1);
    expect(v[0]!.i).toBe(1);
    expect(v[0]!.giro_deg).toBeCloseTo(90, 1);
  });

  /**
   * Polilínea de dos tramos que gira `giro_deg` en el vértice del medio. El
   * ángulo interior es 180° menos ese giro: un vértice de 30° de ángulo
   * interior —el ejemplo que la fuente nombra como indibujable— es un giro de
   * 150°.
   */
  const conGiro = (giro_deg: number) => {
    const rad = giro_deg * Math.PI / 180;
    return [{ x: -10, y: 0 }, { x: 0, y: 0 }, { x: Math.cos(rad) * 10, y: Math.sin(rad) * 10 }];
  };

  it('un vértice de 30° de ángulo interior pide 150° de giro: indibujable a campo', () => {
    const v = verticesCerrados(conGiro(180 - 30));
    expect(v).toHaveLength(1);
    expect(v[0]!.i).toBe(1);
    expect(v[0]!.giro_deg).toBeCloseTo(150, 1);
  });

  it('un giro de 45° entra en lo que puede un tractor y no se marca', () => {
    expect(verticesCerrados(conGiro(45))).toHaveLength(0);
  });

  it('el ángulo interior mínimo publicado es el límite exacto', () => {
    // 130° de ángulo interior son 50° de giro, justo el máximo: no se marca.
    expect(verticesCerrados(conGiro(180 - ANGULO_INTERIOR_MIN_DEG))).toHaveLength(0);
    expect(verticesCerrados(conGiro(180 - ANGULO_INTERIOR_MIN_DEG + 2))).toHaveLength(1);
  });

  it('con el extremo permisivo del rango publicado se marcan menos vértices', () => {
    const l = conGiro(53);   // entra en los 55° y no en los 50°
    expect(verticesCerrados(l, GIRO_MAX_TRACTOR_DEG)).toHaveLength(1);
    expect(verticesCerrados(l, GIRO_MAX_TRACTOR_DEG_PERMISIVO)).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// El headland
// ─────────────────────────────────────────────────────────────────────────────
describe('headland', () => {
  it('reproduce el ejemplo de la fuente: máquina de 5 m, franja de 10 a 20 m', () => {
    const h = headland({ anchoImplemento_m: 5 });
    expect(h.min_m).toBeCloseTo(10, 6);
    expect(h.max_m).toBeCloseTo(20, 6);
    expect(h.sugerido_m).toBe(10);
  });

  it('si la franja además hace de borde de lote, manda el mínimo de 30 pies', () => {
    const h = headland({ anchoImplemento_m: 3, tambienBordeDeLote: true });
    expect(h.min_m).toBeCloseTo(6, 6);
    expect(h.sugerido_m).toBe(9);        // 30 pies = 9,14 m
    expect(h.nota).toMatch(/30 pies/);
  });

  it('con un implemento grande manda el implemento y no el borde de lote', () => {
    const h = headland({ anchoImplemento_m: 6, tambienBordeDeLote: true });
    expect(h.sugerido_m).toBe(12);
    expect(h.nota).not.toMatch(/30 pies/);
  });

  it('un ancho inválido cae a 3 m en vez de devolver NaN', () => {
    expect(headland({ anchoImplemento_m: 0 }).sugerido_m).toBe(6);
    expect(headland({ anchoImplemento_m: Number.NaN }).sugerido_m).toBe(6);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// La directriz simplificada
// ─────────────────────────────────────────────────────────────────────────────
describe('simplificarDirectriz', () => {
  it('una recta con diez puntos colineales queda en dos', () => {
    const recta = Array.from({ length: 10 }, (_, i) => ({ x: i * 5, y: 0 }));
    expect(simplificarDirectriz(recta, 1)).toHaveLength(2);
  });

  it('conserva siempre los extremos', () => {
    const l = [{ x: 0, y: 0 }, { x: 5, y: 0.1 }, { x: 10, y: 0 }];
    const s = simplificarDirectriz(l, 5);
    expect(s[0]).toEqual(l[0]);
    expect(s[s.length - 1]).toEqual(l[l.length - 1]);
  });

  it('una forma del terreno de 5 m sobrevive a 1 m de tolerancia y no a 10', () => {
    const l = [{ x: 0, y: 0 }, { x: 10, y: 5 }, { x: 20, y: 0 }];
    expect(simplificarDirectriz(l, 1)).toHaveLength(3);
    expect(simplificarDirectriz(l, 10)).toHaveLength(2);
  });

  it('más tolerancia nunca deja más vértices', () => {
    const l = Array.from({ length: 40 }, (_, i) => ({ x: i, y: Math.sin(i / 3) * 4 }));
    let previo = Infinity;
    for (const tol of [0.5, 1, 2, 4, 8]) {
      const n = simplificarDirectriz(l, tol).length;
      expect(n).toBeLessThanOrEqual(previo);
      previo = n;
    }
  });

  it('con tolerancia 0 devuelve la curva cruda, que es lo que hacía la app', () => {
    const l = Array.from({ length: 12 }, (_, i) => ({ x: i, y: Math.sin(i) }));
    expect(simplificarDirectriz(l, 0)).toHaveLength(12);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// El veredicto del patrón
// ─────────────────────────────────────────────────────────────────────────────
describe('resumirPatron', () => {
  const banda = bandaDeriva({ pendienteTerreno_pct: 6, grupoHidro: 'C' });   // 0,2 – 3 %

  const tramos = (n: number, deriva: number, haciaLadera: boolean | null): TramoPatron[] =>
    Array.from({ length: n }, () => ({ largo_m: 10, deriva_pct: deriva, haciaLadera }));

  it('deriva dentro de la banda y hacia la ladera: es patrón Keyline', () => {
    const r = resumirPatron(tramos(10, 1.5, true), banda);
    expect(r.veredicto).toBe('keyline');
    expect(r.fraccionHaciaLadera).toBe(1);
    expect(r.fraccionEnBanda).toBe(1);
    expect(r.deriva_media_pct).toBeCloseTo(1.5, 2);
    expect(leerVeredicto(r, banda)).toMatch(/hacia la ladera/);
  });

  it('CORRER A NIVEL NO ES PATRÓN KEYLINE: es laboreo en contorno', () => {
    // El test que protege el hallazgo. La app puntuaba «excelente» la pendiente
    // residual cerca de cero, o sea premiaba el patrón que NO mueve el agua de
    // lugar. Si alguien vuelve a esa métrica, acá se cae.
    const r = resumirPatron(tramos(10, 0.02, true), banda);
    expect(r.veredicto).toBe('contorno');
    expect(r.fraccionEnBanda).toBe(0);
    expect(leerVeredicto(r, banda)).toMatch(/no mueve el agua de lugar/);
  });

  it('si el agua va hacia la vertiente, el patrón está invertido', () => {
    const r = resumirPatron(tramos(10, 1.5, false), banda);
    expect(r.veredicto).toBe('reversa');
    expect(r.fraccionHaciaLadera).toBe(0);
    expect(leerVeredicto(r, banda)).toMatch(/lo contrario/);
  });

  it('si la deriva se pasa del techo, eso manda sobre cualquier otra cosa', () => {
    // Mitad del largo excedido y mitad invertido: gana «excede», porque un surco
    // que erosiona es un problema de obra y no de reparto de agua.
    const r = resumirPatron([...tramos(5, 6, false), ...tramos(5, 1.5, false)], banda);
    expect(r.veredicto).toBe('excede');
    expect(r.fraccionExcedida).toBe(0.5);
    expect(leerVeredicto(r, banda)).toMatch(/directriz nueva/);
  });

  it('un excedido chico no cambia el veredicto: la obra tolera un retoque', () => {
    const r = resumirPatron([...tramos(1, 6, true), ...tramos(19, 1.5, true)], banda);
    expect(r.veredicto).toBe('keyline');
    expect(r.fraccionExcedida).toBeCloseTo(0.05, 3);
  });

  it('pondera por largo y no por cantidad de tramos', () => {
    const r = resumirPatron([
      { largo_m: 90, deriva_pct: 1, haciaLadera: true },
      { largo_m: 10, deriva_pct: 2, haciaLadera: true },
    ], banda);
    expect(r.deriva_media_pct).toBeCloseTo(1.1, 2);
    expect(r.largoTotal_m).toBe(100);
  });

  it('sin tramos no inventa un veredicto bueno', () => {
    const r = resumirPatron([], banda);
    expect(r.largoTotal_m).toBe(0);
    expect(r.veredicto).toBe('contorno');
  });

  it('los tramos sin lado decidido no cuentan como si fueran correctos', () => {
    const r = resumirPatron(tramos(10, 1.5, null), banda);
    expect(r.fraccionHaciaLadera).toBe(0);
    expect(r.veredicto).toBe('reversa');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Redondear sin destruir la forma
// ─────────────────────────────────────────────────────────────────────────────
describe('redondearVertices', () => {
  it('con radio 0 no toca nada', () => {
    const v = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
    expect(redondearVertices(v, 0)).toEqual(v);
  });

  it('conserva los extremos y mete puntos sólo en el vértice', () => {
    const v = [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 50 }];
    const r = redondearVertices(v, 5);
    expect(r[0]).toEqual(v[0]);
    expect(r[r.length - 1]).toEqual(v[v.length - 1]);
    expect(r.length).toBeGreaterThan(3);
  });

  it('el radio acota el recorte: con 5 m no se come 25 m de tramo', () => {
    // Es el defecto que tenía el suavizado anterior. Un corte de esquina
    // proporcional al tramo reemplazaba el vértice por una cuerda a 25 m; con un
    // radio de 5 m en un codo de 90° la tangente son 5 m y nada más.
    const v = [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 50 }];
    const r = redondearVertices(v, 5);
    const masCerca = Math.min(...r.map(q => Math.hypot(q.x - 50, q.y - 0)));
    expect(masCerca).toBeLessThan(5);        // el arco pasa cerca del vértice
    const dentroDe10 = r.filter(q => Math.hypot(q.x - 50, q.y) < 10).length;
    expect(dentroDe10).toBeGreaterThan(3);   // el arco vive en los 10 m del codo
  });

  it('dos vértices pegados no se pisan: la tangente se limita al tramo', () => {
    // Tramos de 4 m y un radio de 50: sin el tope, las tangentes se cruzarían.
    const v = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 8, y: 4 }, { x: 12, y: 4 }];
    const r = redondearVertices(v, 50);
    for (const q of r) {
      expect(q.x).toBeGreaterThanOrEqual(-0.01);
      expect(q.x).toBeLessThanOrEqual(12.01);
    }
    expect(r[0]).toEqual(v[0]);
  });

  it('un vértice casi recto se deja como está', () => {
    const v = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0.001 }];
    expect(redondearVertices(v, 3)).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// La deriva de un tramo, a mano
// ─────────────────────────────────────────────────────────────────────────────
describe('derivaDelTramo', () => {
  // Terreno que sube al norte al 10 %. La curva de nivel va este-oeste y su
  // dirección (perpendicular al gradiente, girada 90° antihorario) apunta al
  // OESTE, así que `accLateral` positivo significa «la vertiente está al oeste».
  const gradiente = { gx: 0, gy: 0.1 };

  it('un tramo exactamente sobre la curva de nivel no deriva ni lleva agua a ningún lado', () => {
    const d = derivaDelTramo({ gradiente, tramo: { ex: 10, ey: 0 }, accLateral: 5 });
    expect(d.deriva_pct).toBeCloseTo(0, 9);
    expect(d.haciaLadera).toBeNull();
  });

  it('la deriva es la componente de la pendiente a lo largo del tramo', () => {
    // Tramo (10, 1): la pendiente a lo largo es 0,1·1/√101 = 0,995 %.
    const d = derivaDelTramo({ gradiente, tramo: { ex: 10, ey: 1 }, accLateral: 1 });
    expect(d.deriva_pct).toBeCloseTo(0.995, 3);
  });

  it('si el agua corre hacia la vertiente, lo dice', () => {
    // El tramo sube hacia el este, así que el agua corre hacia el oeste; con la
    // vertiente al oeste (accLateral > 0) el surco la está concentrando.
    const d = derivaDelTramo({ gradiente, tramo: { ex: 10, ey: 1 }, accLateral: 1 });
    expect(d.haciaLadera).toBe(false);
  });

  it('y si corre hacia la ladera, también', () => {
    const d = derivaDelTramo({ gradiente, tramo: { ex: 10, ey: 1 }, accLateral: -1 });
    expect(d.haciaLadera).toBe(true);
  });

  it('dar vuelta el tramo no cambia nada: el agua corre por donde baja', () => {
    const ida   = derivaDelTramo({ gradiente, tramo: { ex: 10, ey: 1 }, accLateral: 1 });
    const vuelta = derivaDelTramo({ gradiente, tramo: { ex: -10, ey: -1 }, accLateral: 1 });
    expect(vuelta.deriva_pct).toBeCloseTo(ida.deriva_pct, 9);
    expect(vuelta.haciaLadera).toBe(ida.haciaLadera);
  });

  it('sin señal lateral de acumulación no se inventa un lado', () => {
    expect(derivaDelTramo({ gradiente, tramo: { ex: 10, ey: 1 }, accLateral: 0 }).haciaLadera).toBeNull();
    expect(derivaDelTramo({ gradiente, tramo: { ex: 10, ey: 1 }, accLateral: Number.NaN }).haciaLadera).toBeNull();
  });

  it('en terreno plano no hay deriva ni lado', () => {
    const d = derivaDelTramo({ gradiente: { gx: 0, gy: 0 }, tramo: { ex: 10, ey: 1 }, accLateral: 3 });
    expect(d.deriva_pct).toBeCloseTo(0, 9);
    expect(d.haciaLadera).toBeNull();
  });

  it('un tramo de largo cero no produce un número', () => {
    const d = derivaDelTramo({ gradiente, tramo: { ex: 0, ey: 0 }, accLateral: 3 });
    expect(d.deriva_pct).toBe(0);
    expect(d.haciaLadera).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// El patrón completo: las dos reglas opuestas de Yeomans, sobre dos terrenos
// ─────────────────────────────────────────────────────────────────────────────
const PASO = 2, Y_EJE = 50;
const parcelaDe = (g: Parameters<typeof puntoMetrico>[0]) => [
  puntoMetrico(g, 40, 14), puntoMetrico(g, 130, 14),
  puntoMetrico(g, 130, 86), puntoMetrico(g, 40, 86),
];

describe('generarPatronCultivo — una cuña, donde la fuente predice efecto neutro', () => {
  // z = p·x + q·|y − eje| es una cuña: todas sus curvas de nivel son la MISMA V
  // trasladada, o sea perfectamente paralelas entre sí. Yeomans nombra ese caso:
  // «The only circumstances where the selection of the correct side of the
  // contour […] is not significant is where the contours form perfectly
  // parallel lines on the land surface. In these limited circumstances
  // cultivation done, on either side yet parallel to the contour guide line,
  // will have a neutral effect on the sideways drift of run off water.»
  //
  // Así que acá la predicción publicada es deriva nula, y es lo que tiene que
  // dar. Este test es además el que atrapó el defecto del suavizado: cortando la
  // esquina del vértice en proporción al tramo, la cuña daba 2,8 % de deriva
  // media y el 20 % del patrón por encima del grado máximo.
  const g = grillaMetrica(51, 81, PASO, (x, y) => 0.04 * x + 0.12 * Math.abs(y - Y_EJE));
  const parcela = parcelaDe(g);

  it('la deriva es nula y el veredicto es «sólo en contorno», no «invertida»', () => {
    const p = generarPatronCultivo(g, parcela, { espaciado_m: 10, anchoImplemento_m: 3, grupoHidro: 'C' })!;
    expect(p).not.toBeNull();
    expect(p.resumen.deriva_media_pct).toBeLessThan(0.05);
    expect(p.resumen.fraccionExcedida).toBe(0);
    expect(p.resumen.veredicto).toBe('contorno');
  });

  it('el redondeo de la directriz no se come la forma: la tolerancia no cambia la deriva', () => {
    const cruda  = generarPatronCultivo(g, parcela, { espaciado_m: 10, toleranciaDirectriz_m: 0 })!;
    const simple = generarPatronCultivo(g, parcela, { espaciado_m: 10, toleranciaDirectriz_m: 20 })!;
    expect(cruda.verticesDirectriz).toBeGreaterThan(simple.verticesDirectriz);
    // Simplificar la directriz de 187 vértices a 3 tiene que dar el mismo
    // resultado físico, porque la curva de nivel de una cuña ES una V de 3
    // vértices. Si no coincide, el redondeo está deformando la directriz.
    expect(Math.abs(cruda.resumen.deriva_media_pct - simple.resumen.deriva_media_pct)).toBeLessThan(0.1);
  });
});

describe('generarPatronCultivo — las dos reglas opuestas, cada una en su forma', () => {
  // Valle parabólico: el eje es lo más plano y los flancos lo más empinado. Es
  // la forma de una vertiente POR DEBAJO de la keyline —«the longer flatter
  // slope of the valley which is below the Keyline»— y ahí Yeomans manda parear
  // HACIA ABAJO: «Below the Keypoint and Keyline of a valley the cultivation
  // should be done parallel to and on the lower side of the near contour guide
  // line.»
  const valle = grillaMetrica(51, 81, PASO, (x, y) => 0.05 * x + 0.0008 * Math.pow(y - Y_EJE, 2));
  // Lomo parabólico: el eje es lo más alto. «The general pattern of primary
  // ridge cultivation is parallel upwards from a selected contour.»
  const lomo = grillaMetrica(51, 81, PASO, (x, y) => 0.05 * x - 0.0008 * Math.pow(y - Y_EJE, 2) + 4);

  const correr = (g: typeof valle, lado: 'arriba' | 'abajo' | 'ambos') =>
    generarPatronCultivo(g, parcelaDe(g), { espaciado_m: 10, anchoImplemento_m: 3, grupoHidro: 'C', lado })!;

  it('en la vertiente, pareando hacia abajo el agua va a la ladera; hacia arriba se invierte', () => {
    const abajo = correr(valle, 'abajo');
    const arriba = correr(valle, 'arriba');
    expect(abajo.resumen.fraccionHaciaLadera).toBeGreaterThan(0.7);
    expect(abajo.resumen.veredicto).toBe('keyline');
    expect(arriba.resumen.fraccionHaciaLadera).toBeLessThan(0.4);
    expect(arriba.resumen.veredicto).toBe('reversa');
  });

  it('en el lomo es exactamente al revés, que es lo que dice la fuente', () => {
    const arriba = correr(lomo, 'arriba');
    const abajo = correr(lomo, 'abajo');
    expect(arriba.resumen.fraccionHaciaLadera).toBeGreaterThan(0.7);
    expect(arriba.resumen.veredicto).toBe('keyline');
    expect(abajo.resumen.fraccionHaciaLadera).toBeLessThan(0.4);
    expect(abajo.resumen.veredicto).toBe('reversa');
  });

  it('la deriva que produce cae dentro de la banda publicada, no por encima', () => {
    const p = correr(valle, 'abajo');
    expect(p.banda.min_pct).toBe(0.2);
    expect(p.banda.max_pct).toBeCloseTo(Math.min(4, p.pendiente_media_pct / 2), 2);
    expect(p.resumen.deriva_media_pct).toBeGreaterThan(p.banda.min_pct);
    expect(p.resumen.deriva_media_pct).toBeLessThan(p.banda.max_pct);
    expect(p.resumen.fraccionEnBanda).toBeGreaterThan(0.7);
  });

  it('pareando de los dos lados —la relajación de Pavlov— sale una mezcla de las dos', () => {
    const ambos = correr(valle, 'ambos');
    const abajo = correr(valle, 'abajo');
    expect(ambos.lineas.length).toBeGreaterThan(abajo.lineas.length);
    expect(ambos.resumen.fraccionHaciaLadera).toBeLessThan(abajo.resumen.fraccionHaciaLadera);
    expect(ambos.resumen.fraccionHaciaLadera).toBeGreaterThan(0.4);
  });

  it('devuelve un patrón versionado, con las fuentes y la directriz simplificada', () => {
    const p = correr(valle, 'ambos');
    expect(p.version).toBe(2);
    expect(p.verticesDirectriz).toBeGreaterThanOrEqual(2);
    expect(p.verticesDirectriz).toBeLessThan(15);
    expect(p.lectura.length).toBeGreaterThan(40);
    expect(p.fuentes.join(' ')).toMatch(/Yeomans/);
    expect(p.fuentes.join(' ')).toMatch(/Pavlov/);
    expect(p.fuentes.join(' ')).toMatch(/330/);
  });

  it('respeta la franja de maniobra: ninguna línea llega al alambrado', () => {
    const p = correr(valle, 'ambos');
    expect(p.headland_m).toBeCloseTo(6, 1);     // 3 m de implemento × 2
    const R = 111_320;
    const parcela = parcelaDe(valle);
    const lat0 = parcela.reduce((s, q) => s + q.lat, 0) / parcela.length;
    const mLng = R * Math.cos(lat0 * Math.PI / 180);
    const xy = (q: { lat: number; lng: number }) => ({ x: q.lng * mLng, y: q.lat * R });
    const poly = parcela.map(xy);
    const distBorde = (q: { x: number; y: number }) => {
      let d = Infinity;
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i]!, b = poly[(i + 1) % poly.length]!;
        const abx = b.x - a.x, aby = b.y - a.y;
        const L2 = abx * abx + aby * aby || 1e-9;
        let t = ((q.x - a.x) * abx + (q.y - a.y) * aby) / L2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        d = Math.min(d, Math.hypot(q.x - (a.x + t * abx), q.y - (a.y + t * aby)));
      }
      return d;
    };
    for (const ln of p.lineas) {
      for (const q of ln) expect(distBorde(xy(q))).toBeGreaterThan(p.headland_m - 1.5);
    }
  });
});
