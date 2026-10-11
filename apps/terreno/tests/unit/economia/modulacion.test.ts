/**
 * Modulación ganadera: superficie efectiva, uso admisible y módulos de manejo.
 *
 * Los casos que mandan son **los tres ejemplos resueltos de la guía B-829 de
 * NMSU** y **la situación 2 de Holechek (1988)**, que traen las cuentas hechas.
 * Si el módulo no los reproduce, está mal el módulo —con una excepción
 * documentada, que es el propio test de abajo: las dos publicaciones tienen
 * ecuaciones que contradicen a sus propias tablas en la banda de pendiente de 31
 * a 60 %, y acequia sigue la tabla.
 */
import { describe, it, expect } from 'vitest';
import {
  BANDAS_USO, USO_ANUALES, bandaUso, ajusteAnioPrevio,
  BANDAS_PENDIENTE, BANDAS_AGUA, PENDIENTE_LIMITE_MENOR_PCT,
  factorPendiente, factorAgua, distribucionPendiente,
  distanciaMaxima_m, areaMaxima_ha, rodeoMaximoPorAgua, distribucionAguaCuadrado,
  noPastoreable, superficieEfectiva, modulacion,
  MILLA_M, PULGADA_MM,
  type DistribucionPendiente,
} from '@/lib/modulacion';
import { abrevaEnLaVentana } from '@/lib/abrevadero';
import type { GrillaElevacion } from '@/lib/grillaElevacion';

/** La distribución de pendientes del ejemplo resuelto, en las cuatro bandas. */
const DIST_EJEMPLO: DistribucionPendiente = {
  fracciones: [0.40, 0.20, 0.30, 0.10],
  celdas: 1000, paso_m: 30, pendiente_media_pct: 25,
};

describe('el uso admisible sale de la banda de lluvia, y no es 0,50 para todos', () => {
  it('las tres bandas son las 12 y 25 pulgadas de la fuente', () => {
    expect(BANDAS_USO[0]!.hasta_mm).toBeCloseTo(12 * PULGADA_MM, 6);   // 304,8 mm
    expect(BANDAS_USO[1]!.hasta_mm).toBeCloseTo(25 * PULGADA_MM, 6);   // 635 mm
    expect(BANDAS_USO[2]!.hasta_mm).toBe(Infinity);
  });

  it('los valores para una carga inicial son 30, 40, 50 y 55 %', () => {
    expect(bandaUso(200).inicial).toBe(0.30);
    expect(bandaUso(450).inicial).toBe(0.40);
    expect(bandaUso(900).inicial).toBe(0.50);
    expect(bandaUso(450, true).inicial).toBe(0.55);
  });

  it('«take half, leave half» NO se aplica en el semiárido, que es lo que la app hacía', () => {
    // La frase de la fuente: esa regla «appears applicable only to humid and
    // annual grassland ranges». Un pastizal de 250 mm admite 30 %, no 50 %, así
    // que la receptividad que mostraba la app era 1,67 veces la correcta.
    const seco = bandaUso(250);
    expect(seco.id).toBe('desertico');
    expect(seco.inicial).toBe(0.30);
    expect(0.50 / seco.inicial).toBeCloseTo(1.67, 2);
    // Donde SÍ vale, el número no cambia: por eso un predio húmedo no se mueve.
    expect(bandaUso(900).inicial).toBe(0.50);
  });

  it('cada banda publica un rango y el inicial cae adentro', () => {
    for (const b of [...BANDAS_USO, USO_ANUALES]) {
      expect(b.min).toBeLessThanOrEqual(b.inicial);
      expect(b.inicial).toBeLessThanOrEqual(b.max);
    }
  });

  it('el pastizal de anuales aguanta más que el perenne con la misma lluvia', () => {
    expect(bandaUso(500, true).inicial).toBeGreaterThan(bandaUso(500).inicial);
  });

  it('los bordes caen en la banda de abajo, y una lluvia imposible no revienta', () => {
    expect(bandaUso(304).id).toBe('desertico');
    expect(bandaUso(305).id).toBe('arido');
    expect(bandaUso(634).id).toBe('arido');
    expect(bandaUso(636).id).toBe('humedo');
    expect(bandaUso(-5).id).toBe('desertico');
    expect(bandaUso(NaN).id).toBe('desertico');
  });
});

describe('la corrección por cómo vino el año previo', () => {
  it('un año húmedo (133 % de la media) baja el pasto medido un 30 %', () => {
    // Es el ajuste de la situación 2 de Holechek: 24 pulgadas sobre una media de
    // 18 son el 133 %, y de ahí sale el ×0,70 que lleva 346 novillos a 242.
    const a = ajusteAnioPrevio(610, 457);
    expect(a.factor).toBe(0.70);
    expect(a.desvio_pct).toBe(33);
  });

  it('un año seco sube la medición un 30 %', () => {
    expect(ajusteAnioPrevio(300, 500).factor).toBe(1.30);
  });

  it('un año normal no toca nada', () => {
    expect(ajusteAnioPrevio(520, 500).factor).toBe(1);
  });

  it('con más de 50 % de desvío la fuente dice que no se puede estimar: devuelve null', () => {
    // Es la cautela importante: acá la respuesta correcta no es un número.
    expect(ajusteAnioPrevio(1000, 500).factor).toBeNull();
    expect(ajusteAnioPrevio(200, 500).factor).toBeNull();
    expect(ajusteAnioPrevio(750, 500).factor).toBeNull();   // exactamente 150 %
    expect(ajusteAnioPrevio(250, 500).factor).toBeNull();   // exactamente 50 %
  });

  it('sin la lluvia de los doce meses no ajusta, y lo dice', () => {
    const a = ajusteAnioPrevio(null, 500);
    expect(a.factor).toBe(1);
    expect(a.desvio_pct).toBeNull();
  });
});

describe('las dos tablas de reducción, tal como están publicadas', () => {
  it('pendiente: sin reducción hasta 10 %, 30 %, 60 % y no pastoreable', () => {
    expect(BANDAS_PENDIENTE.map(b => b.factor)).toEqual([1.00, 0.70, 0.40, 0]);
    expect(BANDAS_PENDIENTE.map(b => b.hasta_pct)).toEqual([10, 30, 60, Infinity]);
  });

  it('agua: la milla y las dos millas de la Tabla 4', () => {
    expect(BANDAS_AGUA.map(b => b.factor)).toEqual([1.00, 0.50, 0]);
    expect(BANDAS_AGUA[0]!.hasta_m).toBeCloseTo(1609.344, 3);
    expect(BANDAS_AGUA[1]!.hasta_m).toBeCloseTo(3218.688, 3);
  });

  it('el ejemplo 2 de B-829: 60 / 30 / 10 % de superficie por banda da 0,75', () => {
    // «(0.60 × 1)+(0.30 × 0.5)+(0.10 × 0) × 527 AUY = 395 AUY»
    const f = factorAgua({ fracciones: [0.60, 0.30, 0.10] });
    expect(f).toBeCloseTo(0.75, 6);
    expect(Math.floor(527 * f)).toBe(395);
  });

  it('el ovino no se ajusta por distancia al agua, porque no bebe todos los días', () => {
    expect(factorAgua({ fracciones: [0, 0, 1] }, 'menor')).toBe(1);
    expect(factorAgua({ fracciones: [0, 0, 1] }, 'bovino')).toBe(0);
  });

  it('para el ovino el límite es la pendiente de 45 %, no la tabla de bovinos', () => {
    expect(PENDIENTE_LIMITE_MENOR_PCT).toBe(45);
    // Todo el campo entre 30 y 60 %: la vaca rinde 0,40 y la oveja la mitad del
    // área (lo que queda debajo de 45).
    const todoQuebrado: DistribucionPendiente = { fracciones: [0, 0, 1, 0], celdas: 10, paso_m: 30, pendiente_media_pct: 45 };
    expect(factorPendiente(todoQuebrado, 'bovino')).toBeCloseTo(0.40, 6);
    expect(factorPendiente(todoQuebrado, 'menor')).toBeCloseTo(0.50, 6);
    // Y lo suave lo usa entero, igual que la vaca.
    const suave: DistribucionPendiente = { fracciones: [1, 0, 0, 0], celdas: 10, paso_m: 30, pendiente_media_pct: 4 };
    expect(factorPendiente(suave, 'menor')).toBe(1);
  });
});

describe('la inconsistencia de las fuentes en la banda de 31 a 60 %', () => {
  /**
   * Las tablas de las dos publicaciones dicen 60 % de reducción (factor 0,40).
   * El ejemplo resuelto de Holechek usa 0,30 y la ecuación de B-829 usa 0,60 para
   * la banda de 11 a 30 y 0,30 para la de 31 a 60. Acequia sigue la tabla, y este
   * test existe para que la diferencia contra el número impreso esté explicada y
   * no parezca un error nuestro.
   */
  it('con la tabla, la distribución del ejemplo da 0,66', () => {
    expect(factorPendiente(DIST_EJEMPLO)).toBeCloseTo(0.66, 6);   // 0,40 + 0,14 + 0,12
  });

  it('acequia da 159 novillos donde Holechek imprime 152, y la diferencia es ese factor', () => {
    const conTabla = 242 * factorPendiente(DIST_EJEMPLO);
    expect(Math.floor(conTabla)).toBe(159);
    // Lo que imprime el artículo sale de usar 0,30 en la tercera banda:
    const conSuEcuacion = 242 * (0.40 * 1 + 0.20 * 0.70 + 0.30 * 0.30 + 0.10 * 0);
    expect(Math.floor(conSuEcuacion)).toBe(152);
    // Y la ecuación de B-829, que además cambia la segunda banda, da otra cosa:
    const conB829 = 527 * (0.40 * 1 + 0.20 * 0.60 + 0.30 * 0.30 + 0.10 * 0);
    expect(Math.floor(conB829)).toBe(321);
  });
});

describe('las dos reducciones NO se multiplican: manda la más grande', () => {
  it('con pendiente 0,66 y agua 0,75 el factor es 0,66, no 0,495', () => {
    // La regla textual de B-829: «these should be calculated separately with the
    // greatest reduction percent used. They should not be combined for a
    // cumulative reduction.» Multiplicar es lo que uno haría por sentido común y
    // es lo que la fuente prohíbe.
    const s = superficieEfectiva({
      ha_brutas: 1000,
      pendiente: DIST_EJEMPLO,
      agua: { fracciones: [0.60, 0.30, 0.10] },
    });
    expect(s.factor_pendiente).toBeCloseTo(0.66, 6);
    expect(s.factor_agua).toBeCloseTo(0.75, 6);
    expect(s.factor).toBeCloseTo(0.66, 6);
    expect(s.manda).toBe('pendiente');
    expect(s.factor).not.toBeCloseTo(0.66 * 0.75, 3);
  });

  it('si el agua castiga más, manda el agua', () => {
    const s = superficieEfectiva({
      ha_brutas: 1000,
      pendiente: { fracciones: [1, 0, 0, 0], celdas: 10, paso_m: 10, pendiente_media_pct: 3 },
      agua: { fracciones: [0.20, 0.30, 0.50] },
    });
    expect(s.manda).toBe('agua');
    expect(s.factor).toBeCloseTo(0.35, 6);
  });

  it('sin ninguno de los dos no inventa un ajuste, pero avisa', () => {
    const s = superficieEfectiva({ ha_brutas: 500 });
    expect(s.factor).toBe(1);
    expect(s.manda).toBe('ninguno');
    expect(s.factor_pendiente).toBeNull();
    expect(s.cautelas.length).toBeGreaterThanOrEqual(2);
  });

  it('con una sola aguada avisa que la tabla castiga de más', () => {
    const s = superficieEfectiva({
      ha_brutas: 2000, aguadas: 1,
      agua: { fracciones: [0.30, 0.40, 0.30] },
    });
    expect(s.manda).toBe('agua');
    expect(s.cautelas.join(' ')).toContain('GPS');
  });
});

describe('lo que no es tierra de pastoreo se resta en hectáreas', () => {
  const items = [
    { valor: 30, nombre: 'Pastizal', pct: 70 },
    { valor: 80, nombre: 'Agua', pct: 8 },
    { valor: 90, nombre: 'Humedal herbáceo', pct: 12 },
    { valor: 50, nombre: 'Construido / urbano', pct: 2 },
    { valor: 60, nombre: 'Suelo desnudo / ralo', pct: 8 },
  ];

  it('saca agua, humedal y construido; deja el suelo desnudo', () => {
    const np = noPastoreable(items);
    expect(np.fraccion).toBeCloseTo(0.22, 6);   // 8 + 12 + 2
    expect(np.exclusiones.map(e => e.nombre)).toEqual(['Humedal herbáceo', 'Agua', 'Construido / urbano']);
    // El suelo desnudo sigue siendo campo: lo que corresponde es que produzca
    // poco forraje, no que desaparezca del plano.
    expect(np.exclusiones.some(e => e.nombre.includes('desnudo'))).toBe(false);
  });

  it('la resta de superficie y el factor de distribución son cosas distintas', () => {
    const s = superficieEfectiva({
      ha_brutas: 1000,
      noPastoreable: noPastoreable(items),
      pendiente: DIST_EJEMPLO,
    });
    expect(s.ha_pastoreables).toBeCloseTo(780, 2);          // una resta de verdad
    expect(s.ha_equivalentes).toBeCloseTo(780 * 0.66, 1);   // una equivalencia, no superficie
    expect(s.ha_equivalentes).toBeLessThan(s.ha_pastoreables);
  });

  it('sin cobertura cargada no resta nada', () => {
    expect(noPastoreable(null).fraccion).toBe(0);
    expect(noPastoreable([]).exclusiones).toEqual([]);
  });
});

describe('la pendiente se mide sobre el DEM', () => {
  /** Grilla sintética: un plano inclinado de pendiente conocida en latitud. */
  function plano(rows: number, cols: number, pendiente_pct: number): GrillaElevacion {
    const latMin = -31.5, latMax = -31.49, lngMin = -64.2, lngMax = -64.19;
    const altoM = (latMax - latMin) * 111_320;
    const dy = altoM / (rows - 1);
    const elev = new Float64Array(rows * cols);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) elev[r * cols + c] = r * dy * (pendiente_pct / 100);
    }
    return { rows, cols, latMin, latMax, lngMin, lngMax, elev, elev_min: 0, elev_max: elev[rows * cols - 1]!, fuente: 'glo30' };
  }

  const cuadro = [
    { lat: -31.4999, lng: -64.1999 }, { lat: -31.4999, lng: -64.1901 },
    { lat: -31.4901, lng: -64.1901 }, { lat: -31.4901, lng: -64.1999 },
  ];

  it('un plano al 5 % cae entero en la primera banda', () => {
    const d = distribucionPendiente(plano(30, 30, 5), cuadro);
    expect(d).not.toBeNull();
    expect(d!.fracciones[0]).toBeCloseTo(1, 6);
    expect(d!.pendiente_media_pct).toBeCloseTo(5, 0);
    expect(factorPendiente(d!)).toBeCloseTo(1, 6);
  });

  it('un plano al 40 % cae en la tercera y el factor es 0,40', () => {
    const d = distribucionPendiente(plano(30, 30, 40), cuadro);
    expect(d!.fracciones[2]).toBeCloseTo(1, 6);
    expect(factorPendiente(d!)).toBeCloseTo(0.40, 6);
  });

  it('un barranco de más de 60 % queda fuera del área pastoreable', () => {
    const d = distribucionPendiente(plano(30, 30, 80), cuadro);
    expect(d!.fracciones[3]).toBeCloseTo(1, 6);
    expect(factorPendiente(d!)).toBe(0);
  });

  it('informa el paso con el que midió, porque un DEM grueso alisa', () => {
    const d = distribucionPendiente(plano(30, 30, 20), cuadro);
    expect(d!.paso_m).toBeGreaterThan(0);
    expect(d!.celdas).toBeGreaterThan(100);
  });

  it('sin grilla o sin celdas adentro devuelve null en vez de inventar', () => {
    expect(distribucionPendiente(null, cuadro)).toBeNull();
    expect(distribucionPendiente(plano(30, 30, 10), [])).toBeNull();
    // Un polígono en otra provincia: ninguna celda cae adentro.
    const lejos = [{ lat: -40, lng: -70 }, { lat: -40, lng: -69.9 }, { lat: -39.9, lng: -69.9 }];
    expect(distribucionPendiente(plano(30, 30, 10), lejos)).toBeNull();
  });
});

describe('el tamaño del módulo lo decide dónde va la aguada', () => {
  it('la aguada en el centro de un módulo de 518 ha deja la milla justa', () => {
    expect(areaMaxima_ha(MILLA_M, 'centro')).toBeCloseTo(518, 0);
    expect(distanciaMaxima_m(518, 'centro')).toBeCloseTo(MILLA_M, -1);
  });

  it('moverla a una esquina baja el tope a la cuarta parte', () => {
    const centro = areaMaxima_ha(MILLA_M, 'centro');
    const esquina = areaMaxima_ha(MILLA_M, 'esquina');
    expect(esquina).toBeCloseTo(129.5, 1);
    expect(centro / esquina).toBeCloseTo(4, 1);
  });

  it('el orden es centro > borde > esquina', () => {
    expect(areaMaxima_ha(MILLA_M, 'centro')).toBeGreaterThan(areaMaxima_ha(MILLA_M, 'borde'));
    expect(areaMaxima_ha(MILLA_M, 'borde')).toBeGreaterThan(areaMaxima_ha(MILLA_M, 'esquina'));
  });

  it('si el módulo entra en la milla, la tabla de agua no reduce nada', () => {
    // El caso que importa: un diseño que cumple la distancia no debería recibir
    // ninguna penalización. 500 ha con la aguada al medio entran enteras.
    const d = distribucionAguaCuadrado(500, 'centro');
    expect(d.fracciones[0]).toBe(1);
    expect(factorAgua(d)).toBe(1);
  });

  it('un módulo de 2.000 ha con una sola aguada al medio ya pierde superficie', () => {
    // Media diagonal de 2.000 ha = 3.162 m: pasa la milla y toca la segunda milla.
    expect(distanciaMaxima_m(2000, 'centro')).toBeCloseTo(3162, -1);
    const d = distribucionAguaCuadrado(2000, 'centro');
    expect(d.fracciones[0]!).toBeGreaterThan(0);
    expect(d.fracciones[0]!).toBeLessThan(1);
    expect(d.fracciones[1]!).toBeGreaterThan(0);
    expect(factorAgua(d)).toBeLessThan(1);
    expect(d.fracciones.reduce((s, f) => s + f, 0)).toBeCloseTo(1, 3);
  });

  it('la misma superficie castiga más con la aguada en la esquina', () => {
    expect(factorAgua(distribucionAguaCuadrado(2000, 'esquina')))
      .toBeLessThan(factorAgua(distribucionAguaCuadrado(2000, 'centro')));
  });

  it('sin superficie no inventa un reparto', () => {
    expect(distribucionAguaCuadrado(0).fracciones).toEqual([1, 0, 0]);
  });

  it('un radio o un área imposibles dan cero, no NaN', () => {
    expect(areaMaxima_ha(0)).toBe(0);
    expect(areaMaxima_ha(-1)).toBe(0);
    expect(distanciaMaxima_m(0)).toBe(0);
  });
});

describe('el rodeo máximo lo pone el agua, no el pasto', () => {
  it('coincide con la ventana de dos horas de abrevadero.ts', () => {
    // El test de `abrevadero.ts` fija que 3.100 L/día (100 vacas a 31 L) abrevan
    // con 13 L/min y no con 12. Visto al revés, tiene que dar 100 cabezas con 13
    // y menos de 100 con 12: son dos módulos que no se conocen y tienen que
    // cerrar igual.
    expect(abrevaEnLaVentana(3100, 13)).toBe(true);
    expect(abrevaEnLaVentana(3100, 12)).toBe(false);
    expect(rodeoMaximoPorAgua(13, 31)).toBeGreaterThanOrEqual(100);
    expect(rodeoMaximoPorAgua(12, 31)).toBeLessThan(100);
  });

  it('el doble de caudal abreva el doble de hacienda', () => {
    expect(rodeoMaximoPorAgua(40, 50)).toBe(rodeoMaximoPorAgua(20, 50) * 2);
  });

  it('un caudal o un consumo desconocidos no son infinito', () => {
    expect(rodeoMaximoPorAgua(0, 50)).toBe(0);
    expect(rodeoMaximoPorAgua(20, 0)).toBe(0);
    expect(rodeoMaximoPorAgua(-5, 50)).toBe(0);
  });
});

describe('cuántos módulos pide el campo, y cuál es la traba', () => {
  it('cuando lo que traba es el caudal, lo dice y sugiere la reserva antes del alambre', () => {
    // 300 vacas a 50 L/día con una aguada de 10 L/min. Esa aguada entrega
    // 10 × 60 × 2 h = 1.200 L por visita y dos visitas por día: 2.400 L, o sea
    // 48 cabezas. El pasto de 200 ha no traba nada; el caño, sí.
    const m = modulacion({ ha_pastoreables: 200, cabezas: 300, caudal_l_min: 10, litros_cabeza_dia: 50 });
    expect(rodeoMaximoPorAgua(10, 50)).toBe(48);
    expect(m.por_agua).toBe(7);          // ceil(300 / 48)
    expect(m.por_distancia).toBe(1);     // 200 ha entran en el tope de 518
    expect(m.modulos).toBe(7);
    expect(m.traba).toBe('agua');
    expect(m.avisos.join(' ')).toContain('reserva');
  });

  it('cuando lo que traba es la superficie, el número sale de la distancia al agua', () => {
    const m = modulacion({ ha_pastoreables: 2000, cabezas: 100, caudal_l_min: 200, litros_cabeza_dia: 50 });
    expect(m.por_distancia).toBe(4);     // ceil(2000 / 518)
    expect(m.modulos).toBe(4);
    expect(m.traba).toBe('distancia');
    expect(m.ha_modulo).toBeCloseTo(500, 0);
  });

  it('el tope de rodeo manejable que declara el productor también traba', () => {
    const m = modulacion({ ha_pastoreables: 300, cabezas: 400, rodeoManejable: 80 });
    expect(m.por_rodeo).toBe(5);
    expect(m.modulos).toBe(5);
    expect(m.traba).toBe('rodeo');
    expect(m.cabezas_modulo).toBe(80);
  });

  it('manda el mayor de los tres: es el mínimo que cumple todas', () => {
    const m = modulacion({
      ha_pastoreables: 2000, cabezas: 400,
      caudal_l_min: 20, litros_cabeza_dia: 50, rodeoManejable: 150,
    });
    expect(m.por_agua).toBe(5);
    expect(m.por_distancia).toBe(4);
    expect(m.por_rodeo).toBe(3);
    expect(m.modulos).toBe(5);
    expect(m.traba).toBe('agua');
  });

  it('sin restricciones no subdivide, y aclara que la rotación es otra cosa', () => {
    const m = modulacion({ ha_pastoreables: 100, cabezas: 50 });
    expect(m.modulos).toBe(1);
    expect(m.traba).toBe('ninguna');
    expect(m.avisos.join(' ')).toContain('rotación');
  });

  it('la aguada en la esquina avisa que moverla es más barato que alambrar', () => {
    const m = modulacion({ ha_pastoreables: 400, cabezas: 100, aguaEn: 'esquina' });
    expect(m.por_distancia).toBe(4);     // ceil(400 / 130)
    expect(m.avisos.join(' ')).toContain('centro');
  });

  it('un campo sin hacienda cargada no pide módulos ni divide por cero', () => {
    const m = modulacion({ ha_pastoreables: 0, cabezas: 0 });
    expect(m.modulos).toBe(1);
    expect(m.ha_modulo).toBe(0);
    expect(m.cabezas_modulo).toBe(0);
    expect(Number.isFinite(m.distancia_maxima_m)).toBe(true);
  });

  it('la distancia máxima del módulo resultante no pasa la milla', () => {
    const m = modulacion({ ha_pastoreables: 2000, cabezas: 200 });
    expect(m.distancia_maxima_m).toBeLessThanOrEqual(Math.round(MILLA_M));
  });
});
