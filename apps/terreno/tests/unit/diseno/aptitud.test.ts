/**
 * Tests del dominio "diseño" — agrupación de aptitud en polígonos contiguos.
 * Cubre `agruparAptitud`, la función que reemplazó a la caja-envolvente-por-tipo
 * (que cubría todo el predio y se superponía). Verifica que los polígonos que
 * salen son disjuntos y contiguos por construcción.
 */
import { describe, it, expect } from 'vitest';
import {
  agruparAptitud,
  type CeldaAptitud,
  type ResultadoAptitud,
  type TipoAptitud,
} from '@/lib/aptitud';

const SIZE = 0.001;

/** Fabrica una celda en (row,col) con un tipo dominante dado. */
function celda(row: number, col: number, dominante: TipoAptitud): CeldaAptitud {
  const lat = -34 + row * SIZE;
  const lng = -58 + col * SIZE;
  return {
    row, col, lat, lng,
    latMin: lat, latMax: lat + SIZE,
    lngMin: lng, lngMax: lng + SIZE,
    scores: { huerta: 0, frutales: 0, pasturas: 0, forestal: 0, reserva: 0 },
    dominante,
    score_dominante: 50,
  };
}

/** Envuelve una lista de celdas en un ResultadoAptitud (resumen mínimo real). */
function resultado(celdas: CeldaAptitud[]): ResultadoAptitud {
  const tipos: TipoAptitud[] = ['huerta', 'frutales', 'pasturas', 'forestal', 'reserva'];
  const resumen = Object.fromEntries(tipos.map(t => {
    const n = celdas.filter(c => c.dominante === t).length;
    return [t, { celdas: n, pct: celdas.length ? (n / celdas.length) * 100 : 0 }];
  })) as ResultadoAptitud['resumen'];
  return { celdas, resumen };
}

describe('agruparAptitud', () => {
  it('funde una tira contigua de un mismo tipo en un solo cluster', () => {
    const res = resultado([
      celda(0, 0, 'huerta'),
      celda(0, 1, 'huerta'),
      celda(0, 2, 'huerta'),
    ]);
    const clusters = agruparAptitud(res, 3);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]!.tipo).toBe('huerta');
    expect(clusters[0]!.celdas).toBe(3);
    // Tres rectángulos colineales → un rectángulo → 4 esquinas.
    expect(clusters[0]!.anillo.length).toBeGreaterThanOrEqual(4);
  });

  it('separa dos manchas del mismo tipo que no se tocan', () => {
    const res = resultado([
      // mancha A (cols 0-2)
      celda(0, 0, 'pasturas'), celda(0, 1, 'pasturas'), celda(0, 2, 'pasturas'),
      // hueco en col 3-4, mancha B (cols 5-7)
      celda(0, 5, 'pasturas'), celda(0, 6, 'pasturas'), celda(0, 7, 'pasturas'),
    ]);
    const clusters = agruparAptitud(res, 3);
    expect(clusters).toHaveLength(2);
    expect(clusters.every(c => c.tipo === 'pasturas')).toBe(true);
  });

  it('descarta grupos por debajo de minCeldas', () => {
    const res = resultado([
      celda(0, 0, 'frutales'),
      celda(0, 1, 'frutales'), // grupo de 2 < min 3
    ]);
    expect(agruparAptitud(res, 3)).toHaveLength(0);
  });

  it('tipos distintos no se mezclan y los polígonos teselan sin superponerse', () => {
    // Bloque 2×3: fila 0 huerta, fila 1 forestal — adyacentes pero distinto tipo.
    const celdas = [
      celda(0, 0, 'huerta'), celda(0, 1, 'huerta'), celda(0, 2, 'huerta'),
      celda(1, 0, 'forestal'), celda(1, 1, 'forestal'), celda(1, 2, 'forestal'),
    ];
    const clusters = agruparAptitud(resultado(celdas), 3);
    expect(clusters).toHaveLength(2);
    const tipos = clusters.map(c => c.tipo).sort();
    expect(tipos).toEqual(['forestal', 'huerta']);
    // Propiedad de teselado: la suma de celdas de los clusters == celdas de entrada
    // (cada celda pertenece a exactamente un cluster; no hay solapamiento).
    const suma = clusters.reduce((s, c) => s + c.celdas, 0);
    expect(suma).toBe(celdas.length);
  });

  it('celdas en L (4-conexas) forman un solo cluster', () => {
    const res = resultado([
      celda(0, 0, 'reserva'),
      celda(1, 0, 'reserva'),
      celda(2, 0, 'reserva'),
      celda(2, 1, 'reserva'),
    ]);
    const clusters = agruparAptitud(res, 3);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]!.celdas).toBe(4);
  });

  it('sin celdas devuelve lista vacía', () => {
    expect(agruparAptitud(resultado([]))).toEqual([]);
  });
});
