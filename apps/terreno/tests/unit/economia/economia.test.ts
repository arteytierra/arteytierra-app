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
import type { RepresaResumen }   from '@/lib/represa';

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
  it('los postes salen de la separación publicada y no de los 8 m que había', () => {
    // Púa para bovinos sin varillas: 20 pies, 6,096 m (NRCS 382, Tabla 1).
    // Con 8 m el presupuesto pedía 100 postes para 800 m de cierre; el máximo
    // publicado pide 132 claros. Ver `materiales.ts`.
    const metricas = { perimetro_m: 800, linderos: [] } as unknown as MetricasPoligono;
    const rs = rubrosDesdeProyecto({ metricas });
    expect(rs.find(r => r.concepto === 'Alambrado perimetral')?.cantidad).toBe(800);
    const postes = rs.find(r => r.concepto.startsWith('Postes de línea'))!;
    expect(postes.cantidad).toBe(Math.ceil(800 / (20 * 0.3048)) + 1);
    expect(postes.cantidad).toBeGreaterThan(100);
  });

  it('y cada mojón suma un conjunto de esquina, que antes no existía', () => {
    const metricas = {
      perimetro_m: 800,
      linderos: Array.from({ length: 6 }, () => ({})),
    } as unknown as MetricasPoligono;
    const rs = rubrosDesdeProyecto({ metricas });
    expect(rs.find(r => r.concepto === 'Conjuntos de esquina')?.cantidad).toBe(6);
  });

  it('LA CAPACIDAD DE LA REPRESA YA NO SE COBRA COMO MOVIMIENTO DE SUELO', () => {
    // Era el agua cobrada como tierra. Sin el volumen calculado, el renglón no
    // sale: una cantidad equivocada en el renglón más caro es peor que faltar.
    const represa = { capacidad_m3: 12000 } as RepresaResumen;
    expect(rubrosDesdeProyecto({ represa })).toEqual([]);
    const conTierra = rubrosDesdeProyecto({ represa, movimientoTierra_m3: 2070 });
    expect(conTierra).toHaveLength(1);
    expect(conTierra[0]!.cantidad).toBe(2070);
    expect(conTierra[0]!.concepto).toMatch(/banco excavado/);
  });

  it('sin datos no sugiere nada', () => {
    expect(rubrosDesdeProyecto({})).toEqual([]);
  });
});
