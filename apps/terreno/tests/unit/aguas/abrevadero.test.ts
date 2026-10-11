/**
 * Caudal de pico y bebedero.
 *
 * Los dos casos que mandan son **los ejemplos resueltos de la propia nota
 * técnica** del NRCS de Dakota del Sur, que trae las cuentas hechas en galones.
 * Si el módulo no los reproduce, está mal el módulo.
 */
import { describe, it, expect } from 'vitest';
import {
  espaciosBebida, llegadaSegunDistancia, caudalPico_l_min, caudalPico_l_h,
  factorContraPromedio, reservaNecesaria_l, perimetroMinimo_m, abrevaEnLaVentana,
  CAUDAL_POR_ESPACIO_LMIN, UMBRAL_DISTANCIA_M, FRACCION_QUE_BEBE,
  GPM_LMIN,
} from '@/lib/abrevadero';

/** Galones → litros, para escribir los tests con los números de la fuente. */
const gal = (g: number) => g * 3.785411784;

describe('los ejemplos resueltos de la nota técnica SD2006-1', () => {
  /**
   * Textual de la fuente, criterio de densidad moderada:
   *
   *   «For example, a 100-head herd needs 1,800 GPD. One-half of that would need
   *   to be supplied each time they come to water = 900 gallons. The pipeline can
   *   supply four GPM. In one hour, the pipeline would supply 4 GPM x 60 minutes =
   *   240 gallons. The tank would have to supply the balance of the storage =
   *   900 gallons – 240 gallons = 660 gallons.»
   */
  it('densidad moderada: 100 cabezas, 1.800 GPD, cañería de 4 GPM → tanque de 660 galones', () => {
    const r = reservaNecesaria_l(gal(1800), 4 * GPM_LMIN, 'moderada');
    expect(r.aCubrir_l).toBeCloseTo(gal(900), 0);
    expect(r.aportaCañeria_l).toBeCloseTo(gal(240), 0);
    expect(r.litros).toBeCloseTo(gal(660), 0);
    expect(r.estrategia).toBe('moderada');
  });

  /**
   * Textual de la fuente, criterio de densidad baja:
   *
   *   «For example, a 500 head herd at 18 gal./hd./day needs 9,000 GPD. The
   *   pipeline can supply 10 GPM. In 12 hours, the pipeline would supply 10 GPM x
   *   12 hours x 60 minutes per hour = 7,200 gallons. The tank would have to
   *   supply the balance of the daily water requirement = 9,000 gallons – 7,200
   *   gallons = 1,800 gallons.»
   */
  it('densidad baja: 500 cabezas a 18 gal/día, cañería de 10 GPM → tanque de 1.800 galones', () => {
    const r = reservaNecesaria_l(gal(500 * 18), 10 * GPM_LMIN, 'baja');
    expect(r.aCubrir_l).toBeCloseTo(gal(9000), 0);
    expect(r.aportaCañeria_l).toBeCloseTo(gal(7200), 0);
    expect(r.litros).toBeCloseTo(gal(1800), 0);
  });

  it('si la cañería sola alcanza, la reserva es cero y no un número negativo', () => {
    const r = reservaNecesaria_l(gal(1000), 50 * GPM_LMIN, 'baja');
    expect(r.litros).toBe(0);
  });
});

describe('los caudales por espacio de bebida, del CPS 614', () => {
  it('2,0 GPM para ganado grande y 0,5 para el chico', () => {
    expect(CAUDAL_POR_ESPACIO_LMIN.grande).toBeCloseTo(2.0 * 3.785411784, 4);
    expect(CAUDAL_POR_ESPACIO_LMIN.chico).toBeCloseTo(0.5 * 3.785411784, 4);
    // El grande toma cuatro veces más rápido que el chico.
    expect(CAUDAL_POR_ESPACIO_LMIN.grande / CAUDAL_POR_ESPACIO_LMIN.chico).toBeCloseTo(4, 6);
  });
});

describe('cuántos beben a la vez', () => {
  it('5 % cuando llegan de a uno, 10 % cuando llega el rodeo junto', () => {
    expect(FRACCION_QUE_BEBE.individual).toBe(0.05);
    expect(FRACCION_QUE_BEBE.rodeo).toBe(0.10);
    expect(espaciosBebida(100, 'individual')).toBe(5);
    expect(espaciosBebida(100, 'rodeo')).toBe(10);
  });

  it('1 espacio cada 20 animales, y cada 10: los dos criterios de la fuente', () => {
    expect(espaciosBebida(200, 'individual')).toBe(10);
    expect(espaciosBebida(200, 'rodeo')).toBe(20);
  });

  it('un rodeo chico igual necesita un espacio: el 5 % de 5 no es cero', () => {
    expect(espaciosBebida(5, 'individual')).toBe(1);
    expect(espaciosBebida(1, 'rodeo')).toBe(1);
  });

  it('sin animales no hace falta ninguno', () => {
    expect(espaciosBebida(0, 'rodeo')).toBe(0);
    expect(espaciosBebida(-3, 'rodeo')).toBe(0);
  });
});

describe('la distancia al bebedero decide cómo llegan', () => {
  it('el umbral son los 1.980 pies de la fuente, 604 m', () => {
    expect(UMBRAL_DISTANCIA_M).toBe(604);
  });

  it('cerca llegan de a uno; lejos, todos juntos', () => {
    expect(llegadaSegunDistancia(300)).toBe('individual');
    expect(llegadaSegunDistancia(604)).toBe('individual');
    expect(llegadaSegunDistancia(605)).toBe('rodeo');
    expect(llegadaSegunDistancia(2000)).toBe('rodeo');
  });

  it('sin distancia no adivina: devuelve null', () => {
    // Adivinar acá duplica los espacios de bebida y cambia el diámetro del caño.
    expect(llegadaSegunDistancia(null)).toBeNull();
    expect(llegadaSegunDistancia(NaN)).toBeNull();
    expect(llegadaSegunDistancia(-10)).toBeNull();
  });
});

describe('el caudal de pico contra el reparto parejo en 24 horas', () => {
  it('100 vacas con bebedero centralizado piden 75,7 L/min', () => {
    // 10 espacios × 2 GPM = 20 GPM = 75,7 L/min.
    expect(caudalPico_l_min(100, 'rodeo')).toBeCloseTo(20 * GPM_LMIN, 1);
    expect(caudalPico_l_h(100, 'rodeo')).toBe(Math.round(20 * GPM_LMIN * 60));
  });

  it('el mismo rodeo con agua en cada potrero pide la mitad', () => {
    expect(caudalPico_l_min(100, 'individual')).toBeCloseTo(caudalPico_l_min(100, 'rodeo') / 2, 1);
  });

  it('dividir el consumo diario por 24 subdimensiona más de treinta veces', () => {
    // 100 vacas a 31 L/día = 3.100 L/día. Es la magnitud del error que la app
    // tenía: el promedio diario no es un caudal de diseño.
    const f = factorContraPromedio(3100, 100, 'rodeo');
    expect(f).not.toBeNull();
    expect(f!).toBeGreaterThan(30);
  });

  it('con ganado chico el caudal es la cuarta parte', () => {
    expect(caudalPico_l_min(100, 'rodeo', 'chico')).toBeCloseTo(caudalPico_l_min(100, 'rodeo', 'grande') / 4, 1);
  });

  it('sin rodeo o sin consumo no hay factor que calcular', () => {
    expect(factorContraPromedio(0, 100, 'rodeo')).toBeNull();
    expect(factorContraPromedio(3100, 0, 'rodeo')).toBeNull();
  });
});

describe('la ventana de dos horas del CPS 614', () => {
  it('un caudal que entrega la media jornada en dos horas cumple', () => {
    // 3.100 L/día → 1.550 por visita → hacen falta 12,9 L/min para dos horas.
    expect(abrevaEnLaVentana(3100, 13)).toBe(true);
    expect(abrevaEnLaVentana(3100, 12)).toBe(false);
  });
});

describe('el perímetro del bebedero', () => {
  it('12 pulgadas por espacio en circular, 18 en lados rectos', () => {
    // 100 cabezas llegando juntas = 10 espacios → 120 o 180 pulgadas.
    expect(perimetroMinimo_m(100, 'rodeo', 'circular')).toBeCloseTo(120 * 0.0254, 1);
    expect(perimetroMinimo_m(100, 'rodeo', 'recto')).toBeCloseTo(180 * 0.0254, 1);
  });

  it('en un rodeo grande manda el piso de 1 pulgada por cabeza del CPS 614', () => {
    // 1.000 cabezas de a uno = 50 espacios × 12 = 600 pulgadas, pero el piso por
    // rodeo es 1.000 pulgadas. Se toma el mayor de los dos criterios.
    expect(perimetroMinimo_m(1000, 'individual', 'circular')).toBeCloseTo(1000 * 0.0254, 1);
  });

  it('sin animales el perímetro es cero', () => {
    expect(perimetroMinimo_m(0, 'rodeo')).toBe(0);
  });
});
