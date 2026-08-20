/**
 * Tests del dominio "economía" — presupuesto de obras y retorno simple.
 * Subtotales, agrupación por categoría, payback y sugerencia de rubros desde
 * las cantidades ya calculadas del proyecto.
 */
import { describe, it, expect } from 'vitest';
import {
  nuevoRubro,
  calcularEconomia,
  formatearMoneda,
  rubrosDesdeProyecto,
  type RubroPresupuesto,
} from '@/lib/economia';
import type { MetricasPoligono } from '@/lib/geometria';

describe('nuevoRubro', () => {
  it('completa valores por defecto', () => {
    const r = nuevoRubro();
    expect(r.categoria).toBe('Otros');
    expect(r.cantidad).toBe(0);
    expect(r.unidad).toBe('u');
    expect(r.id).toBeTruthy();
  });

  it('genera ids únicos', () => {
    expect(nuevoRubro().id).not.toBe(nuevoRubro().id);
  });
});

describe('calcularEconomia', () => {
  const rubros: RubroPresupuesto[] = [
    { id: 'a', categoria: 'Agua',    concepto: 'Cañería', cantidad: 100, unidad: 'm', precioUnit: 6 }, // 600
    { id: 'b', categoria: 'Cierres', concepto: 'Alambre', cantidad: 200, unidad: 'm', precioUnit: 3 }, // 600
  ];

  it('suma subtotales y total', () => {
    const e = calcularEconomia(rubros, 'USD', 0, 0);
    expect(e.rubros[0]!.subtotal).toBe(600);
    expect(e.total).toBe(1200);
  });

  it('agrupa por categoría ordenado de mayor a menor', () => {
    const e = calcularEconomia([...rubros, { id: 'c', categoria: 'Agua', concepto: 'Bomba', cantidad: 1, unidad: 'u', precioUnit: 400 }], 'USD', 0, 0);
    expect(e.porCategoria[0]!.categoria).toBe('Agua'); // 1000 > 600
    expect(e.porCategoria[0]!.subtotal).toBe(1000);
  });

  it('payback = inversión / margen anual cuando el margen es positivo', () => {
    const e = calcularEconomia(rubros, 'USD', 500, 100); // margen 400
    expect(e.margenAnual).toBe(400);
    expect(e.payback_anios).toBeCloseTo(3, 5); // 1200 / 400
  });

  it('margen no positivo → payback null', () => {
    const e = calcularEconomia(rubros, 'USD', 100, 100);
    expect(e.margenAnual).toBe(0);
    expect(e.payback_anios).toBeNull();
  });
});

describe('formatearMoneda', () => {
  it('prefija según la moneda', () => {
    expect(formatearMoneda(1500, 'USD')).toContain('US$');
    expect(formatearMoneda(1500, 'ARS').startsWith('$')).toBe(true);
  });
});

describe('rubrosDesdeProyecto', () => {
  it('desde las métricas sugiere alambrado perimetral y postes', () => {
    const metricas = { perimetro_m: 800 } as MetricasPoligono;
    const rs = rubrosDesdeProyecto({ metricas });
    const perim = rs.find(r => r.concepto === 'Alambrado perimetral');
    const postes = rs.find(r => r.concepto === 'Postes');
    expect(perim?.cantidad).toBe(800);
    expect(postes?.cantidad).toBe(100); // ~1 poste cada 8 m
  });

  it('sin datos no sugiere nada', () => {
    expect(rubrosDesdeProyecto({})).toEqual([]);
  });
});
