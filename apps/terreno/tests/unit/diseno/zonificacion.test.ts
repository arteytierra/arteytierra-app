/**
 * Tests del dominio "diseño" — zonificación del predio.
 * Funciones puras de lib/zonificacion.ts: cálculo de área, creación de zonas
 * y resumen de usos del suelo. Sin mapa, sin React, sin red.
 */
import { describe, it, expect } from 'vitest';
import {
  CATEGORIAS_ZONA,
  ORDEN_CATEGORIAS_ZONA,
  calcularAreaZona,
  crearZona,
  actualizarAreaZona,
  calcularResumenZonificacion,
  type Zona,
  type CategoriaZona,
} from '@/lib/zonificacion';

// Un cuadrado ~pequeño cerca de -34°/-58° (Buenos Aires). Lado ≈ 0.001° ≈ 111 m.
function cuadrado(lat0 = -34, lng0 = -58, lado = 0.001) {
  return [
    { lat: lat0, lng: lng0 },
    { lat: lat0, lng: lng0 + lado },
    { lat: lat0 + lado, lng: lng0 + lado },
    { lat: lat0 + lado, lng: lng0 },
  ];
}

describe('calcularAreaZona', () => {
  it('devuelve 0 con menos de 3 vértices', () => {
    expect(calcularAreaZona([])).toEqual({ m2: 0, ha: 0 });
    expect(calcularAreaZona([{ lat: -34, lng: -58 }])).toEqual({ m2: 0, ha: 0 });
    expect(calcularAreaZona([{ lat: -34, lng: -58 }, { lat: -34, lng: -57.999 }])).toEqual({ m2: 0, ha: 0 });
  });

  it('calcula un área positiva y coherente ha = m2/10000', () => {
    const { m2, ha } = calcularAreaZona(cuadrado());
    expect(m2).toBeGreaterThan(0);
    // ~0.001° de lado a esa latitud ≈ 111 m × ~92 m ≈ 1 ha. Rango amplio y seguro.
    expect(ha).toBeGreaterThan(0.5);
    expect(ha).toBeLessThan(2);
    expect(ha).toBeCloseTo(m2 / 10000, 3);
  });

  it('un cuadrado de doble lado tiene ~4× el área', () => {
    const chico = calcularAreaZona(cuadrado(-34, -58, 0.001)).m2;
    const grande = calcularAreaZona(cuadrado(-34, -58, 0.002)).m2;
    expect(grande / chico).toBeGreaterThan(3.6);
    expect(grande / chico).toBeLessThan(4.4);
  });

  it('no explota con vértices inválidos (devuelve 0)', () => {
    // @ts-expect-error entrada deliberadamente malformada
    expect(calcularAreaZona([{ lat: 'x' }, {}, {}])).toEqual({ m2: 0, ha: 0 });
  });
});

describe('crearZona', () => {
  it('crea una zona con id, nombre de la categoría y área calculada', () => {
    const z = crearZona('huerta', cuadrado());
    expect(z.id).toMatch(/[0-9a-f-]{36}/);
    expect(z.categoria).toBe('huerta');
    expect(z.nombre).toBe(CATEGORIAS_ZONA.huerta.label);
    expect(z.area_m2).toBeGreaterThan(0);
    expect(z.area_ha).toBeCloseTo(z.area_m2 / 10000, 3);
    expect(z.notas).toBe('');
  });

  it('propaga el color personalizado si se pasa', () => {
    expect(crearZona('huerta', cuadrado(), '#123456').color).toBe('#123456');
    expect(crearZona('huerta', cuadrado()).color).toBeUndefined();
  });

  it('ids únicos entre zonas', () => {
    const a = crearZona('vivienda', cuadrado());
    const b = crearZona('vivienda', cuadrado());
    expect(a.id).not.toBe(b.id);
  });
});

describe('actualizarAreaZona', () => {
  it('recalcula el área cuando cambian los vértices', () => {
    const z = crearZona('pasturas', cuadrado(-34, -58, 0.001));
    const agrandada: Zona = { ...z, vertices: cuadrado(-34, -58, 0.002) };
    const rec = actualizarAreaZona(agrandada);
    expect(rec.area_m2).toBeGreaterThan(z.area_m2 * 3);
    expect(rec.id).toBe(z.id); // no toca identidad ni otros campos
    expect(rec.categoria).toBe('pasturas');
  });
});

describe('calcularResumenZonificacion', () => {
  it('con lista vacía devuelve total 0 y sin categorías', () => {
    const r = calcularResumenZonificacion([]);
    expect(r.area_total_zonificada_ha).toBe(0);
    expect(r.zonas_por_categoria).toEqual([]);
  });

  it('agrupa por categoría, suma áreas y ordena de mayor a menor', () => {
    const huertaChica = crearZona('huerta', cuadrado(-34, -58, 0.001));
    const huertaGrande = crearZona('huerta', cuadrado(-34, -57.9, 0.003));
    const vivienda = crearZona('vivienda', cuadrado(-34, -57.8, 0.0005));
    const r = calcularResumenZonificacion([huertaChica, huertaGrande, vivienda]);

    // Dos categorías (huerta agrupa 2 zonas)
    expect(r.zonas_por_categoria).toHaveLength(2);
    const huerta = r.zonas_por_categoria.find(c => c.categoria === 'huerta')!;
    expect(huerta.count).toBe(2);
    expect(huerta.area_ha).toBeCloseTo(huertaChica.area_ha + huertaGrande.area_ha, 3);

    // Orden descendente por área
    const areas = r.zonas_por_categoria.map(c => c.area_ha);
    expect(areas).toEqual([...areas].sort((a, b) => b - a));

    // Los porcentajes suman ~100
    const sumaPct = r.zonas_por_categoria.reduce((s, c) => s + c.porcentaje, 0);
    expect(sumaPct).toBeGreaterThan(99);
    expect(sumaPct).toBeLessThan(101);
  });
});

describe('ORDEN_CATEGORIAS_ZONA (invariante del selector "+ Nueva zona")', () => {
  it('empieza con zona_0 … zona_5 en orden', () => {
    expect(ORDEN_CATEGORIAS_ZONA.slice(0, 6)).toEqual([
      'zona_0', 'zona_1', 'zona_2', 'zona_3', 'zona_4', 'zona_5',
    ]);
  });

  it('incluye todas las categorías exactamente una vez (sin faltantes ni duplicados)', () => {
    const claves = Object.keys(CATEGORIAS_ZONA) as CategoriaZona[];
    expect([...ORDEN_CATEGORIAS_ZONA].sort()).toEqual([...claves].sort());
    expect(new Set(ORDEN_CATEGORIAS_ZONA).size).toBe(ORDEN_CATEGORIAS_ZONA.length);
  });
});
