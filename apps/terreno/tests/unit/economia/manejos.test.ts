/**
 * El menú de manejos de pastoreo.
 *
 * Los casos que mandan son **los dos ejemplos resueltos de A3529** —la
 * aritmética de parcelas—, **los dos anclajes de rebrote de la misma
 * publicación** y **la comparación de trazados de Gerrish**, que es la que da el
 * resultado que nadie cree: dieciséis parcelas cuadradas gastan menos alambre
 * que doce en tiras.
 *
 * Y hay tests de dirección, no de valor, para las dos cosas contraintuitivas de
 * este módulo: que el tope de días en la parcela es **más corto** cuando el pasto
 * crece más rápido, y que las pasturas templadas y tropicales piden descansos
 * **opuestos** con el calor.
 */
import { describe, it, expect } from 'vitest';
import {
  parcelasNecesarias, descansoLogrado,
  topeRebrote, REBROTE_RAPIDO_D, REBROTE_LENTO_D, TOPE_CONDUCTA_D,
  DESCANSO_ANCLA_RAPIDO_D, DESCANSO_ANCLA_LENTO_D, RANGO_OCUPACION_GERRISH_D,
  DESCANSO_PUBLICADO, pastura, descansoObjetivo, RANGO_CHO_D,
  diagnosticoPastura, CRUCE_C3_C4_C, PRECIP_MES_CRECIMIENTO_MM,
  alambreGrilla, grillaSubdivision, RELACION_MAX,
  AGUA_INTENSIVA_M, AGUA_INTENSIVA_GERRISH_M, bebederosNecesarios, puntosDeAgua,
  ALTURAS_PASTOREO, remanente_cm, PULGADA_CM, PIE_M,
  menuDeManejos, etapasIntensificacion, fusibleSequia, calendarioRotacion,
  haEquivalente, USO_CONSERVADOR_PCT, RESIGNA_PCT, GANA_EN_SEQUIA_PCT,
} from '@/lib/manejos';

describe('la aritmética de parcelas, contra los ejemplos de A3529', () => {
  it('ejemplo 1: 30 días de descanso, 3 de ocupación, un grupo → 11 parcelas', () => {
    expect(parcelasNecesarias(30, 3, 1)).toBe(11);
  });

  it('ejemplo 2: 32 días de descanso, 2 de ocupación, un grupo → 17 parcelas', () => {
    expect(parcelasNecesarias(32, 2, 1)).toBe(17);
  });

  it('la inversa devuelve el descanso de los dos ejemplos', () => {
    expect(descansoLogrado(11, 3, 1)).toBe(30);
    expect(descansoLogrado(17, 2, 1)).toBe(32);
  });

  it('el término de grupos son las parcelas ocupadas a la vez, no un 1 cableado', () => {
    // Dos rodeos pasando uno detrás del otro ocupan dos parcelas: hacen falta dos más.
    expect(parcelasNecesarias(30, 3, 2)).toBe(12);
    expect(parcelasNecesarias(30, 3, 3)).toBe(13);
    expect(descansoLogrado(12, 3, 2)).toBe(30);
  });

  it('redondea para arriba, que es el lado seguro: una parcela de más alarga el descanso', () => {
    // 30 / 4 = 7,5 → 8 parcelas de rotación, que dan 32 días y no 30.
    expect(parcelasNecesarias(30, 4, 1)).toBe(9);
    expect(descansoLogrado(9, 4, 1)).toBeGreaterThanOrEqual(30);
  });

  it('sin parcelas libres no hay descanso', () => {
    expect(descansoLogrado(1, 3, 1)).toBe(0);
    expect(descansoLogrado(2, 3, 2)).toBe(0);
  });

  it('con datos imposibles no explota', () => {
    expect(parcelasNecesarias(0, 3, 1)).toBe(1);
    expect(parcelasNecesarias(30, 0, 1)).toBe(1);
  });
});

describe('el tope de ocupación por rebrote, y su dirección contraintuitiva', () => {
  it('reproduce los dos anclajes de A3529: 4 días en crecimiento rápido, 10 en lento', () => {
    expect(topeRebrote(DESCANSO_ANCLA_RAPIDO_D)).toBeCloseTo(REBROTE_RAPIDO_D, 5);
    expect(topeRebrote(DESCANSO_ANCLA_LENTO_D)).toBeCloseTo(REBROTE_LENTO_D, 5);
  });

  it('el punto medio cae en 7 días, que es el techo de la banda de Gerrish', () => {
    const medio = (DESCANSO_ANCLA_RAPIDO_D + DESCANSO_ANCLA_LENTO_D) / 2;
    expect(topeRebrote(medio)).toBeCloseTo(RANGO_OCUPACION_GERRISH_D[1], 5);
  });

  it('cuanto más rápido crece el pasto, MENOS días se puede dejar el rodeo', () => {
    // Es lo contrario de lo que dice el sentido común y es el hallazgo del módulo:
    // en primavera la planta rebrota a los cuatro días y el animal se la come
    // dos veces si todavía está ahí.
    expect(topeRebrote(14)).toBeLessThan(topeRebrote(42));
    expect(topeRebrote(20)).toBeLessThan(topeRebrote(35));
  });

  it('no extrapola fuera de los anclajes', () => {
    expect(topeRebrote(5)).toBe(REBROTE_RAPIDO_D);
    expect(topeRebrote(120)).toBe(REBROTE_LENTO_D);
  });

  it('el tope de conducta es otro y es más bajo que casi todos los de rebrote', () => {
    // Gerrish: a los tres días el rodeo ya armó querencia. No mata la planta,
    // deja la parcela desparejo, y tiene memoria para las vueltas siguientes.
    expect(TOPE_CONDUCTA_D).toBe(3);
    expect(TOPE_CONDUCTA_D).toBe(RANGO_OCUPACION_GERRISH_D[0]);
    expect(TOPE_CONDUCTA_D).toBeLessThan(topeRebrote(30));
  });
});

describe('el descanso según qué pastura es', () => {
  it('la templada pide MÁS descanso con calor y la tropical MENOS', () => {
    // El calendario copiado de un campo con pastura templada a uno con pastura
    // tropical queda exactamente al revés. Es el motivo de que el tipo exista.
    const templada = pastura('templada');
    const tropical = pastura('tropical');
    expect(descansoObjetivo('templada', true)).toBeGreaterThan(descansoObjetivo('templada', false));
    expect(descansoObjetivo('tropical', true)).toBeLessThan(descansoObjetivo('tropical', false));
    expect(templada.caluroso_d[0]).toBeGreaterThan(templada.fresco_d[1]);
    expect(tropical.caluroso_d[1]).toBeLessThan(tropical.fresco_d[0]);
  });

  it('la leguminosa no cambia con la temporada, como dice su fuente', () => {
    expect(descansoObjetivo('leguminosa', true)).toBe(descansoObjetivo('leguminosa', false));
  });

  it('los rangos son los publicados, en días', () => {
    expect(pastura('templada').fresco_d).toEqual([14, 14]);       // «as little as 2 weeks»
    expect(pastura('templada').caluroso_d).toEqual([35, 49]);     // «5 to 7 weeks»
    expect(pastura('tropical').fresco_d).toEqual([35, 42]);       // «5 to 6 weeks»
    expect(pastura('tropical').caluroso_d).toEqual([21, 21]);     // «about 3 weeks»
    expect(pastura('leguminosa').fresco_d).toEqual([21, 28]);     // «3 to 4 weeks»
  });

  it('cada tipo trae la frase de la fuente para poder auditarlo sin abrir el PDF', () => {
    for (const p of DESCANSO_PUBLICADO) {
      expect(p.textual.length).toBeGreaterThan(40);
      expect(p.ejemplos.length).toBeGreaterThan(5);
    }
  });

  it('la banda de reposición de reservas es la de Gerrish', () => {
    expect(RANGO_CHO_D).toEqual([20, 40]);
  });
});

describe('qué pastura sugiere el clima (criterio de Collatz)', () => {
  const mes = (tmean_c: number, precip_mm: number) => ({ tmean_c, precip_mm });

  it('un clima templado húmedo no llega a la temperatura de cruce: pastura templada', () => {
    // Wisconsin: ningún mes de crecimiento pasa de 22 °C de media.
    const meses = [
      mes(-8, 30), mes(-6, 30), mes(1, 50), mes(8, 80), mes(14, 90), mes(19, 110),
      mes(21, 100), mes(20, 100), mes(16, 85), mes(9, 60), mes(1, 50), mes(-6, 35),
    ];
    const d = diagnosticoPastura(meses);
    expect(d?.sugerencia).toBe('templada');
    expect(d?.meses_c4).toBe(0);
  });

  it('un clima subtropical cálido y lluvioso en verano: pastura tropical', () => {
    const meses = [
      mes(27, 140), mes(26, 130), mes(24, 120), mes(23, 100), mes(23, 60), mes(22, 40),
      mes(22, 30), mes(24, 30), mes(25, 60), mes(26, 110), mes(27, 130), mes(27, 150),
    ];
    const d = diagnosticoPastura(meses);
    expect(d?.sugerencia).toBe('tropical');
    expect(d?.meses_c4).toBe(d?.meses_crecimiento);
  });

  it('cuando el clima no decide, dice mixta y no elige por el usuario', () => {
    // Un clima de transición: la mitad de los meses de crecimiento favorece a
    // cada pathway, que es exactamente donde el criterio no alcanza para decidir.
    const meses = [
      mes(25, 110), mes(25, 110), mes(23, 100), mes(19, 80), mes(15, 70), mes(12, 60),
      mes(12, 50), mes(14, 50), mes(18, 70), mes(22, 90), mes(24, 100), mes(25, 110),
    ];
    const d = diagnosticoPastura(meses);
    expect(d?.meses_c4).toBe(6);
    expect(d?.meses_crecimiento).toBe(12);
    expect(d?.sugerencia).toBe('mixta');
    expect(d?.cautelas.some(c => c.includes('El clima no decide'))).toBe(true);
  });

  it('el filtro de lluvia deja afuera los meses que no son de crecimiento', () => {
    // Un mes de 24 °C con 5 mm es calor sin pasto: no cuenta para nada.
    const d = diagnosticoPastura([mes(24, 5), mes(24, 5), mes(10, 100), mes(10, 100)]);
    expect(d?.meses_crecimiento).toBe(2);
    expect(d?.meses_c4).toBe(0);
    expect(d?.sugerencia).toBe('templada');
  });

  it('sin ningún mes de 25 mm no hay criterio, y lo dice', () => {
    const d = diagnosticoPastura([mes(24, 5), mes(26, 10), mes(28, 8)]);
    expect(d?.meses_crecimiento).toBe(0);
    expect(d?.fraccion).toBeNull();
    expect(d?.cautelas.some(c => c.includes('25 mm'))).toBe(true);
  });

  it('avisa de los meses que caen en la franja donde las dos parametrizaciones discrepan', () => {
    const d = diagnosticoPastura([mes(21, 80), mes(21, 80), mes(10, 80), mes(10, 80)]);
    expect(d?.cautelas.some(c => c.includes('20 y 22'))).toBe(true);
  });

  it('siempre avisa que el criterio predice clima y no lo que hay sembrado', () => {
    const d = diagnosticoPastura([mes(25, 100), mes(25, 100)]);
    expect(d?.cautelas.some(c => c.includes('implantada'))).toBe(true);
  });

  it('los umbrales son los publicados', () => {
    expect(CRUCE_C3_C4_C).toBe(22);
    expect(PRECIP_MES_CRECIMIENTO_MM).toBe(25);
  });

  it('sin clima devuelve null en vez de inventar una pastura', () => {
    expect(diagnosticoPastura(null)).toBeNull();
    expect(diagnosticoPastura([])).toBeNull();
  });
});

describe('la grilla y el alambre: el resultado que nadie cree', () => {
  const HA = 100;

  it('12 parcelas en tiras gastan más alambre que 16 en grilla cuadrada', () => {
    // La comparación de Gerrish: «the total linear footage of fence required for
    // the 16 paddock system is actually less than for the 12 paddock system»,
    // porque «a square area always has less perimeter than a rectangle of
    // comparable area». Más parcelas con menos alambre.
    const tiras12   = alambreGrilla(HA, 1, 12);
    const cuadro16  = alambreGrilla(HA, 4, 4);
    expect(cuadro16).toBeLessThan(tiras12);
    // En hilos de largo del bloque: 11 contra 6.
    const lado = Math.sqrt(HA * 10000);
    expect(tiras12 / lado).toBeCloseTo(11, 1);
    expect(cuadro16 / lado).toBeCloseTo(6, 1);
  });

  it('elige la factorización más cuadrada, que es la que gasta menos', () => {
    const g = grillaSubdivision(HA, 16);
    expect(g.filas).toBe(4);
    expect(g.columnas).toBe(4);
    expect(g.relacion).toBe(1);
    expect(g.alambre_m).toBe(alambreGrilla(HA, 4, 4));
  });

  it('con un número que no factoriza usa celdas de más y lo dice', () => {
    const g = grillaSubdivision(HA, 11);
    expect(g.celdas).toBeGreaterThanOrEqual(11);
    expect(g.filas * g.columnas).toBe(g.celdas);
    // Nunca peor que la tira: 1 × 11.
    expect(g.alambre_m).toBeLessThanOrEqual(alambreGrilla(HA, 1, 11));
  });

  it('una sola parcela no necesita alambre interno', () => {
    expect(grillaSubdivision(HA, 1).alambre_m).toBe(0);
    expect(alambreGrilla(HA, 1, 1)).toBe(0);
  });

  it('la relación largo/ancho es siempre ≥ 1 y el tope publicado es 4', () => {
    expect(RELACION_MAX).toBe(4);
    for (const n of [2, 3, 5, 7, 9, 12, 16, 25, 37]) {
      expect(grillaSubdivision(HA, n).relacion).toBeGreaterThanOrEqual(1);
    }
  });

  it('a igual cantidad de parcelas, más superficie es más alambre', () => {
    expect(grillaSubdivision(400, 16).alambre_m).toBeGreaterThan(grillaSubdivision(100, 16).alambre_m);
  });

  it('con superficie cero no devuelve NaN', () => {
    const g = grillaSubdivision(0, 9);
    expect(g.alambre_m).toBe(0);
    expect(Number.isFinite(g.relacion)).toBe(true);
  });
});

describe('el agua dentro de la parcela, que es otra pregunta que la de la etapa A', () => {
  it('el radio es los 800 pies de la guía de Illinois', () => {
    expect(AGUA_INTENSIVA_M).toBe(Math.round(800 * PIE_M));
    expect(AGUA_INTENSIVA_M).toBe(244);
  });

  it('la banda de Gerrish son 600 a 800 pies', () => {
    expect(AGUA_INTENSIVA_GERRISH_M).toEqual([183, 244]);
    expect(AGUA_INTENSIVA_GERRISH_M[1]).toBe(AGUA_INTENSIVA_M);
  });

  it('es un orden de magnitud más estricto que el límite extensivo de la etapa A', () => {
    // 244 m para que la parcela se coma pareja; 1.609 m para que la hectárea
    // cuente en la capacidad de carga. No se contradicen: contestan distinto.
    expect(AGUA_INTENSIVA_M * 6).toBeLessThan(1609.344 * 1.1);
  });

  it('una parcela que entra en el radio se sirve con un punto compartido entre cuatro', () => {
    const p = puntosDeAgua({ parcelas: 12, ha_parcela: 5 });
    expect(p.por_parcela).toBe(1);
    expect(p.compartido).toBe(true);
    expect(p.total).toBe(3);
  });

  it('una parcela más grande que el radio necesita más de un punto, y ya no se comparte', () => {
    // El radio de 244 m cubre unas 18,7 ha.
    expect(bebederosNecesarios(18, AGUA_INTENSIVA_M)).toBe(1);
    const p = puntosDeAgua({ parcelas: 4, ha_parcela: 100 });
    expect(p.por_parcela).toBeGreaterThan(1);
    expect(p.compartido).toBe(false);
    expect(p.total).toBe(4 * p.por_parcela);
  });
});

describe('las alturas, que es lo único que se mide con una regla', () => {
  it('son la tabla 7 de A3529 pasada a centímetros', () => {
    const alta = ALTURAS_PASTOREO[0]!;
    expect(alta.entrar_cm[0]).toBeCloseTo(8 * PULGADA_CM, 0);   // 8 pulgadas ≈ 20 cm
    expect(alta.entrar_cm[1]).toBeCloseTo(10 * PULGADA_CM, 0);  // 10 ≈ 25
    expect(alta.salir_cm[0]).toBeCloseTo(4 * PULGADA_CM, 0);    // 4 ≈ 10
    const tropical = ALTURAS_PASTOREO.find(a => a.grupo.includes('tropicales'))!;
    expect(tropical.entrar_cm[0]).toBeCloseTo(12 * PULGADA_CM, 0); // 12 ≈ 30
    expect(tropical.entrar_cm[1]).toBeCloseTo(14 * PULGADA_CM, 0); // 14 ≈ 35
  });

  it('siempre se entra más alto de lo que se sale', () => {
    for (const a of ALTURAS_PASTOREO) {
      expect(a.entrar_cm[0]).toBeGreaterThan(a.salir_cm[1]);
      expect(a.entrar_cm[0]).toBeLessThanOrEqual(a.entrar_cm[1]);
    }
  });

  it('la tropical deja más hoja en pie que la templada', () => {
    expect(remanente_cm('tropical')[1]).toBeGreaterThan(remanente_cm('templada')[1]);
  });
});

describe('el menú', () => {
  const base = { ha_pastoreables: 120, descanso_objetivo_d: 30, grupos: 1 };

  it('nunca ofrece una ocupación que pase el tope de rebrote', () => {
    const menu = menuDeManejos(base);
    const tope = topeRebrote(base.descanso_objetivo_d);
    expect(menu.length).toBeGreaterThan(0);
    for (const m of menu) expect(m.ocupacion_d).toBeLessThanOrEqual(tope);
  });

  it('más días en la parcela, menos parcelas y menos alambre', () => {
    const menu = menuDeManejos(base);
    for (let i = 1; i < menu.length; i++) {
      expect(menu[i]!.parcelas).toBeLessThanOrEqual(menu[i - 1]!.parcelas);
      expect(menu[i]!.alambre_m).toBeLessThanOrEqual(menu[i - 1]!.alambre_m);
    }
  });

  it('todas las opciones cumplen el descanso pedido', () => {
    for (const m of menuDeManejos(base)) {
      expect(m.descanso_d).toBeGreaterThanOrEqual(base.descanso_objetivo_d);
    }
  });

  it('marca las opciones que pasan el tope de conducta', () => {
    const menu = menuDeManejos(base);
    const larga = menu.find(m => m.ocupacion_d > TOPE_CONDUCTA_D);
    expect(larga?.avisos.some(a => a.includes('querencia'))).toBe(true);
    const corta = menu.find(m => m.ocupacion_d <= TOPE_CONDUCTA_D);
    expect(corta?.avisos.some(a => a.includes('querencia'))).toBe(false);
  });

  it('la exigencia es cuántas veces hay que ir al campo', () => {
    const menu = menuDeManejos(base);
    const diaria = menu.find(m => m.ocupacion_d === 1)!;
    expect(diaria.exigencia).toBe('alta');
    expect(diaria.movidas_anio).toBe(365);
  });

  it('avisa cuando las parcelas quedan demasiado chicas', () => {
    const menu = menuDeManejos({ ha_pastoreables: 1, descanso_objetivo_d: 40, grupos: 1 });
    expect(menu.some(m => m.avisos.some(a => a.includes('1.000 m²')))).toBe(true);
  });

  it('sin superficie o sin descanso no hay menú', () => {
    expect(menuDeManejos({ ha_pastoreables: 0, descanso_objetivo_d: 30 })).toEqual([]);
    expect(menuDeManejos({ ha_pastoreables: 100, descanso_objetivo_d: 0 })).toEqual([]);
  });
});

describe('las etapas de intensificación', () => {
  it('son 4, 8 y el objetivo, en ese orden', () => {
    const e = etapasIntensificacion({ ha_pastoreables: 200, parcelas_objetivo: 16, ocupacion_d: 2 });
    expect(e.map(x => x.parcelas)).toEqual([4, 8, 16]);
  });

  it('cada etapa consigue más descanso que la anterior, que es lo que la pastura siente', () => {
    const e = etapasIntensificacion({ ha_pastoreables: 200, parcelas_objetivo: 16, ocupacion_d: 2 });
    for (let i = 1; i < e.length; i++) {
      expect(e[i]!.descanso_d).toBeGreaterThan(e[i - 1]!.descanso_d);
    }
  });

  it('no inventa etapas por encima del objetivo', () => {
    const e = etapasIntensificacion({ ha_pastoreables: 50, parcelas_objetivo: 6, ocupacion_d: 3 });
    expect(e.map(x => x.parcelas)).toEqual([4, 6]);
    for (const x of e) expect(x.parcelas).toBeLessThanOrEqual(6);
  });

  it('la primera etapa trae la nota de que se hace con los alambres que ya están', () => {
    const e = etapasIntensificacion({ ha_pastoreables: 200, parcelas_objetivo: 16, ocupacion_d: 2 });
    expect(e[0]!.nota).toContain('ya están');
  });
});

describe('el fusible del año seco', () => {
  it('las parcelas que sobran en la temporada rápida salen de la misma fórmula', () => {
    // 16 parcelas dimensionadas para 30 días de descanso. En la temporada rápida
    // el descanso es de 14, que con 2 días de ocupación pide 8 parcelas: sobran 8.
    const f = fusibleSequia({
      parcelas_total: 16, descanso_rapido_d: 14, ocupacion_d: 2,
      ha_pastoreables: 160, grupos: 1,
    });
    expect(f.parcelas_en_uso).toBe(8);
    expect(f.parcelas_sobrantes).toBe(8);
    expect(f.ha_sobrantes).toBe(80);
    expect(f.pct_sobrante).toBe(50);
  });

  it('si la temporada rápida pide todas las parcelas, no sobra nada', () => {
    const f = fusibleSequia({
      parcelas_total: 8, descanso_rapido_d: 40, ocupacion_d: 2,
      ha_pastoreables: 80, grupos: 1,
    });
    expect(f.parcelas_sobrantes).toBe(0);
    expect(f.pct_sobrante).toBe(0);
  });

  it('trae la asimetría publicada del uso conservador', () => {
    const f = fusibleSequia({
      parcelas_total: 12, descanso_rapido_d: 14, ocupacion_d: 2, ha_pastoreables: 120,
    });
    expect(f.uso_conservador_pct).toBe(USO_CONSERVADOR_PCT);
    expect(USO_CONSERVADOR_PCT).toBe(35);
    expect(f.resigna_pct).toEqual(RESIGNA_PCT);
    expect(f.gana_en_sequia_pct).toEqual(GANA_EN_SEQUIA_PCT);
    // Se paga poco todos los años y se cobra mucho el año que importa.
    expect(GANA_EN_SEQUIA_PCT[0]).toBeGreaterThan(RESIGNA_PCT[1]);
  });
});

describe('el calendario, con las estaciones del hemisferio del predio', () => {
  const meses = (t: number[]) => t.map(tmean_c => ({ tmean_c }));
  // Un predio pampeano: verano de 24 °C, invierno de 10.
  const PAMPA = meses([24, 23, 21, 17, 13, 10, 10, 11, 14, 18, 21, 24]);

  it('en el sur el trimestre de diciembre a febrero es Verano', () => {
    const cal = calendarioRotacion({ meses: PAMPA, lat: -34, tipo: 'templada', parcelas: 12 });
    expect(cal[0]!.nombre).toBe('Verano');
    expect(cal[2]!.nombre).toBe('Invierno');
  });

  it('en el norte, con los mismos meses, el nombre se da vuelta', () => {
    const cal = calendarioRotacion({ meses: PAMPA, lat: 41, tipo: 'templada', parcelas: 12 });
    expect(cal[0]!.nombre).toBe('Invierno');
    expect(cal[2]!.nombre).toBe('Verano');
  });

  it('una pastura templada y una tropical dan calendarios opuestos en el mismo predio', () => {
    const t = calendarioRotacion({ meses: PAMPA, lat: -34, tipo: 'templada', parcelas: 12 });
    const r = calendarioRotacion({ meses: PAMPA, lat: -34, tipo: 'tropical', parcelas: 12 });
    const verano = 0, invierno = 2;
    // La templada pide más descanso en verano; la tropical, menos.
    expect(t[verano]!.descanso_objetivo_d).toBeGreaterThan(t[invierno]!.descanso_objetivo_d);
    expect(r[verano]!.descanso_objetivo_d).toBeLessThan(r[invierno]!.descanso_objetivo_d);
  });

  it('la temporada calurosa es la que llega a la temperatura de cruce', () => {
    const cal = calendarioRotacion({ meses: PAMPA, lat: -34, tipo: 'templada', parcelas: 12 });
    for (const t of cal) expect(t.caluroso).toBe(t.tmean_c >= CRUCE_C3_C4_C);
  });

  it('un predio sin ningún trimestre de 22 °C nunca entra en el régimen caluroso', () => {
    const frio = meses([14, 14, 11, 8, 5, 2, 2, 3, 6, 9, 12, 14]);
    const cal = calendarioRotacion({ meses: frio, lat: -41, tipo: 'templada', parcelas: 12 });
    expect(cal.every(t => !t.caluroso)).toBe(true);
    expect(cal.every(t => t.descanso_objetivo_d === descansoObjetivo('templada', false))).toBe(true);
  });

  it('marca la temporada en la que la ocupación resultante pasa el tope de rebrote', () => {
    // Con pocas parcelas la ocupación se estira y en la temporada de crecimiento
    // rápido el rebrote no da tiempo.
    const cal = calendarioRotacion({ meses: PAMPA, lat: -34, tipo: 'tropical', parcelas: 4 });
    expect(cal.some(t => t.excede_rebrote)).toBe(true);
    for (const t of cal) expect(t.excede_rebrote).toBe(t.ocupacion_d > t.tope_rebrote_d);
  });

  it('el ciclo es descanso más ocupación', () => {
    const cal = calendarioRotacion({ meses: PAMPA, lat: -34, tipo: 'templada', parcelas: 16 });
    for (const t of cal) {
      expect(t.ciclo_d).toBe(Math.round(t.descanso_objetivo_d + t.ocupacion_d));
    }
  });

  it('con meses faltantes no devuelve NaN', () => {
    const cal = calendarioRotacion({ meses: [], lat: -34, tipo: 'templada', parcelas: 12 });
    expect(cal).toHaveLength(4);
    for (const t of cal) expect(Number.isFinite(t.ocupacion_d)).toBe(true);
  });
});

describe('igualar por comida y no por superficie', () => {
  it('la parcela que produce más lleva menos hectáreas', () => {
    // A3529: «It is more important that the paddocks yield roughly equal amounts
    // of forage than that they have equal areas.»
    expect(haEquivalente(10, 1.25)).toBeLessThan(10);
    expect(haEquivalente(10, 0.8)).toBeGreaterThan(10);
    expect(haEquivalente(10, 1)).toBe(10);
  });

  it('una parcela que produce un 10 % más lleva alrededor de un 9 % menos de superficie', () => {
    expect(haEquivalente(100, 1.1)).toBeCloseTo(90.91, 1);
  });

  it('con producción relativa cero no divide por cero', () => {
    expect(haEquivalente(10, 0)).toBe(10);
  });
});
