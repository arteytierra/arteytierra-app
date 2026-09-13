import { describe, it, expect } from 'vitest';
import {
  calcularCaptacion,
  type ConsumoCategoria,
  type Superficie,
} from '@/lib/captacion';
import { nombresDeTemporada } from '@/lib/estaciones';

/*
 * Captación pluvial: lo que se junta, lo que se gasta y qué tanque hace falta.
 *
 * Es un cálculo con el que alguien compra un tanque. Los dos errores que tenía
 * no se veían: las estaciones estaban clavadas al hemisferio sur, y el déficit
 * acumulado se cortaba el 31 de diciembre, justo en el medio de la seca de
 * verano del sur.
 */

function techo(area_m2: number, coef: number): Superficie {
  return { id: 't1', tipo: 'personalizado', nombre: 'Techo', area_m2, coef };
}

function consumo(litrosDia: number): ConsumoCategoria {
  return {
    id: 'c1',
    tipo: 'personalizado',
    nombre: 'Casa',
    cantidad: 1,
    litros_dia_por_unidad: litrosDia,
  };
}

const SIN_LLUVIA = Array(12).fill(0) as number[];

function lluvia(mm: Partial<Record<number, number>>): number[] {
  return Array.from({ length: 12 }, (_, i) => mm[i] ?? 0);
}

describe('la fórmula de captación', () => {
  it('un milímetro sobre un metro cuadrado es un litro', () => {
    // V(m³) = P(mm) × A(m²) × C / 1000. Con C = 1 y 1 m², 1 mm tiene que dar
    // exactamente 1 L, o sea 0,001 m³. Es la conversión que hace o deshace todo
    // el resto del panel.
    const r = calcularCaptacion([techo(1, 1)], lluvia({ 0: 1000 }), [], -34);
    expect(r.captacion_anual_litros).toBe(1000);
    expect(r.captacion_anual_m3).toBeCloseTo(1, 3);
  });

  it('100 mm sobre 50 m² con coeficiente 0,9 son 4,5 m³', () => {
    const r = calcularCaptacion([techo(50, 0.9)], lluvia({ 0: 100 }), [], -34);
    expect(r.captacion_mensual_m3[0]).toBeCloseTo(4.5, 2);
    expect(r.captacion_anual_m3).toBeCloseTo(4.5, 2);
  });

  it('sin lluvia no se junta nada y el porcentaje no se va a NaN', () => {
    const r = calcularCaptacion([techo(50, 0.9)], SIN_LLUVIA, [consumo(100)], -34);
    expect(r.captacion_anual_m3).toBe(0);
    expect(r.captacion_por_superficie[0]?.porcentaje).toBe(0);
    expect(r.meses_deficit).toBe(12);
  });

  it('sin consumo cargado no divide por cero al repartir porcentajes', () => {
    const r = calcularCaptacion([techo(50, 0.9)], lluvia({ 0: 100 }), [], -34);
    expect(r.consumo_anual_m3).toBe(0);
    expect(r.cobertura_minima_dias).toBe(0);
    expect(Number.isFinite(r.tanque_recomendado_m3)).toBe(true);
  });
});

describe('las estaciones dependen del hemisferio', () => {
  it('en el sur, diciembre a febrero es verano', () => {
    expect(nombresDeTemporada(-34.6)).toEqual(['Verano', 'Otoño', 'Invierno', 'Primavera']);
  });

  it('en el norte, el mismo trimestre es invierno', () => {
    // Ámsterdam. Antes decía "Verano · Dic · Ene · Feb" y era exactamente el
    // revés: quien leía eso guardaba agua para la seca en el trimestre opuesto.
    expect(nombresDeTemporada(52.37)).toEqual(['Invierno', 'Primavera', 'Verano', 'Otoño']);
  });

  it('entre los trópicos no se nombra ninguna estación', () => {
    // En Quito o en Singapur hay seca y lluvias, y cuándo caen no lo decide la
    // latitud. Decir "verano" ahí es afirmar algo que no se sabe.
    for (const lat of [4.7, -1.2, 0, 9.9, -9.9]) {
      expect(nombresDeTemporada(lat), String(lat)).toEqual(['Dic–Feb', 'Mar–May', 'Jun–Ago', 'Sep–Nov']);
    }
  });

  it('sin latitud tampoco se inventa una estación', () => {
    expect(nombresDeTemporada(undefined)).toEqual(['Dic–Feb', 'Mar–May', 'Jun–Ago', 'Sep–Nov']);
    expect(nombresDeTemporada(null)).toEqual(['Dic–Feb', 'Mar–May', 'Jun–Ago', 'Sep–Nov']);
    expect(nombresDeTemporada(Number.NaN)).toEqual(['Dic–Feb', 'Mar–May', 'Jun–Ago', 'Sep–Nov']);
  });

  it('los meses del trimestre no se mueven: lo único que cambia es el nombre', () => {
    const sur   = calcularCaptacion([techo(50, 0.9)], lluvia({ 0: 100 }), [], -34);
    const norte = calcularCaptacion([techo(50, 0.9)], lluvia({ 0: 100 }), [], 52);
    expect(sur.balance_trimestral.map((t) => t.meses_label))
      .toEqual(norte.balance_trimestral.map((t) => t.meses_label));
    expect(sur.balance_trimestral.map((t) => t.captacion_m3))
      .toEqual(norte.balance_trimestral.map((t) => t.captacion_m3));
    expect(sur.balance_trimestral[0]?.nombre).toBe('Verano');
    expect(norte.balance_trimestral[0]?.nombre).toBe('Invierno');
  });
});

describe('el tanque cubre la seca aunque cruce el año', () => {
  /*
   * Caso armado a propósito para el corte de diciembre: llueve de marzo a
   * octubre y no llueve en noviembre, diciembre, enero ni febrero. La seca dura
   * cuatro meses seguidos y arranca antes de fin de año.
   *
   * Consumo 100 L/día = 36,5 m³ al año. Los cuatro meses secos consumen
   * 3,0 + 3,1 + 3,1 + 2,8 = 12,0 m³, y ésa es el agua que tiene que haber
   * guardada. Contando de enero a diciembre nada más, el déficit visible eran
   * los 5,9 m³ de enero y febrero: menos de la mitad.
   */
  const superficie = [techo(100, 1)];
  const consumos = [consumo(100)];
  const lluviaSecaDeVerano = lluvia({ 2: 60, 3: 60, 4: 60, 5: 60, 6: 60, 7: 60, 8: 60, 9: 60 });

  const r = calcularCaptacion(superficie, lluviaSecaDeVerano, consumos, -34);

  it('el año cierra con excedente: el problema es cuándo llega, no cuánto', () => {
    expect(r.captacion_anual_m3).toBeCloseTo(48, 1);
    expect(r.consumo_anual_m3).toBeCloseTo(36.5, 1);
    expect(r.balance_anual_m3).toBeGreaterThan(0);
    expect(r.meses_deficit).toBe(4);
  });

  it('la reserva alcanza para los cuatro meses secos, no para dos', () => {
    const secaCompleta = 12.0;
    const soloEneroYFebrero = 5.9;
    expect(r.tanque_recomendado_m3).toBeGreaterThanOrEqual(secaCompleta);
    expect(r.tanque_recomendado_m3).toBeGreaterThan(soloEneroYFebrero * 1.2);
    // El margen del 1,2 sobre el déficit, y nada más que eso.
    expect(r.tanque_recomendado_m3).toBeCloseTo(secaCompleta * 1.2, 1);
  });

  it('con déficit anual no duplica la cuenta: un tanque no arregla eso', () => {
    // Misma seca pero sin lluvia suficiente en el resto del año. Acá la curva de
    // masa no cierra, y recorrer el año dos veces daría una reserva del doble
    // que no significa nada.
    const seco = calcularCaptacion(superficie, lluvia({ 2: 10, 3: 10 }), consumos, -34);
    expect(seco.balance_anual_m3).toBeLessThan(0);
    // Una sola vuelta: la reserva no pasa del déficit de un año con su margen.
    // Con dos daría casi el doble, que sería una cifra sin sentido físico.
    expect(seco.tanque_recomendado_m3).toBeLessThan(seco.consumo_anual_m3 * 1.25);
    expect(seco.tanque_recomendado_m3).toBeGreaterThan(seco.consumo_anual_m3 * 0.8);
  });
});
