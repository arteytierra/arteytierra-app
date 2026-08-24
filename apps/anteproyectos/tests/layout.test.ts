import { describe, expect, it } from 'vitest';
import { expandirAmbientes } from '@/lib/motor/areas';
import {
  anchoObjetivoDesdeAspecto,
  dimensionesDe,
  empaquetarBalanceado,
  empaquetarEnFilas,
  ordenarPorAdyacencia,
} from '@/lib/motor/layout';
import type { AmbienteDeseado } from '@/lib/tipos';

const PROGRAMA: AmbienteDeseado[] = [
  { id: 'estar', tipo: 'estar-cocina-comedor', cantidad: 1, tamano: 'grande', adyacenciasDeseadas: [] },
  { id: 'd1', tipo: 'dormitorio', cantidad: 2, tamano: 'mediano', adyacenciasDeseadas: ['bano'] },
  { id: 'bano', tipo: 'bano', cantidad: 1, tamano: 'mediano', adyacenciasDeseadas: ['estar'] },
];

function empaquetar(ambientes: AmbienteDeseado[], aspecto = 1.2) {
  const instancias = expandirAmbientes(ambientes);
  const total = instancias.reduce((s, i) => s + i.area_m2, 0);
  const ancho = anchoObjetivoDesdeAspecto(total, aspecto);
  return { rects: empaquetarEnFilas(ordenarPorAdyacencia(instancias), ancho), instancias };
}

describe('expandirAmbientes', () => {
  it('expande la cantidad en instancias individuales numeradas', () => {
    const instancias = expandirAmbientes(PROGRAMA);
    const dormitorios = instancias.filter(i => i.tipo === 'dormitorio');
    expect(dormitorios).toHaveLength(2);
    expect(dormitorios.map(d => d.nombre)).toEqual(['Dormitorio 1', 'Dormitorio 2']);
    // Las instancias comparten origenId para poder resolver adyacencias.
    expect(new Set(dormitorios.map(d => d.origenId))).toEqual(new Set(['d1']));
  });

  it('prioriza m2Aprox sobre el tamaño cualitativo', () => {
    const [inst] = expandirAmbientes([
      { id: 'x', tipo: 'dormitorio', cantidad: 1, tamano: 'chico', m2Aprox: 22 },
    ]);
    expect(inst!.area_m2).toBe(22);
  });
});

describe('empaquetarEnFilas', () => {
  it('conserva exactamente el área de programa de cada ambiente', () => {
    const { rects } = empaquetar(PROGRAMA);
    for (const r of rects) {
      // El rectángulo dibujado debe tener el área que pidió el programa:
      // si no, las cotas del plano mentirían sobre la superficie.
      expect(r.w_m * r.h_m).toBeCloseTo(r.area_m2, 1);
    }
  });

  it('no superpone ambientes', () => {
    const { rects } = empaquetar(PROGRAMA);
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i]!;
        const b = rects[j]!;
        const solapaX = a.x_m < b.x_m + b.w_m - 0.01 && b.x_m < a.x_m + a.w_m - 0.01;
        const solapaY = a.y_m < b.y_m + b.h_m - 0.01 && b.y_m < a.y_m + a.h_m - 0.01;
        expect(solapaX && solapaY).toBe(false);
      }
    }
  });

  it('la suma de áreas coincide con el total del programa', () => {
    const { rects, instancias } = empaquetar(PROGRAMA);
    const totalPrograma = instancias.reduce((s, i) => s + i.area_m2, 0);
    expect(dimensionesDe(rects).area_total_m2).toBeCloseTo(totalPrograma, 1);
  });

  it('no produce ambientes más angostos que su mínimo utilizable', () => {
    // Un baño de 5 m² junto a un estar profundo tendía a salir de 0,9 m de
    // ancho: un pasillo, no un baño.
    const MINIMOS: Record<string, number> = { bano: 1.5, dormitorio: 2.4, 'estar-cocina-comedor': 2.6, hall: 1.0 };
    for (const aspecto of [0.7, 1, 1.4, 2]) {
      const { rects } = empaquetar(PROGRAMA, aspecto);
      for (const r of rects) {
        const min = MINIMOS[r.tipo];
        if (min) expect(Math.min(r.w_m, r.h_m)).toBeGreaterThanOrEqual(min - 0.01);
      }
    }
  });

  it('marca como exterior el borde real del edificio', () => {
    const { rects } = empaquetar(PROGRAMA);
    const { profundo_m } = dimensionesDe(rects);
    for (const r of rects) {
      // Un ambiente que toca el borde superior del edificio da al exterior.
      if (r.y_m < 0.01) expect(r.exteriorNorte).toBe(true);
      if (Math.abs(r.y_m + r.h_m - profundo_m) < 0.01) expect(r.exteriorSur).toBe(true);
      if (r.x_m < 0.01) expect(r.exteriorOeste).toBe(true);
    }
  });
});

describe('empaquetarBalanceado', () => {
  function anchosDeFila(rects: ReturnType<typeof empaquetarBalanceado>): number[] {
    const porFila = new Map<number, number>();
    for (const r of rects) porFila.set(r.fila, Math.max(porFila.get(r.fila) ?? 0, r.x_m + r.w_m));
    return [...porFila.values()];
  }

  it('da una huella rectangular exacta: todas las filas miden lo mismo', () => {
    // Es la razón de ser de este empaquetador: si las filas no coinciden en
    // ancho, la planta de techos y las fachadas —que se dibujan sobre el
    // rectángulo envolvente— muestran superficie que la planta no tiene.
    const orden = ordenarPorAdyacencia(expandirAmbientes(PROGRAMA));
    for (const filas of [2, 3]) {
      const anchos = anchosDeFila(empaquetarBalanceado(orden, filas));
      expect(Math.max(...anchos) - Math.min(...anchos)).toBeLessThan(0.05);
    }
  });

  it('la huella coincide con el área del programa, sin sobrante techado', () => {
    const instancias = expandirAmbientes(PROGRAMA);
    const total = instancias.reduce((s, i) => s + i.area_m2, 0);
    const rects = empaquetarBalanceado(ordenarPorAdyacencia(instancias), 2);
    const { ancho_m, profundo_m } = dimensionesDe(rects);
    expect(ancho_m * profundo_m).toBeCloseTo(total, 0);
  });

  it('respeta la proporción ancho/profundo pedida', () => {
    const orden = ordenarPorAdyacencia(expandirAmbientes(PROGRAMA));
    for (const aspecto of [0.7, 1.2, 1.618]) {
      const { ancho_m, profundo_m } = dimensionesDe(empaquetarBalanceado(orden, 2, aspecto));
      expect(ancho_m / profundo_m).toBeCloseTo(aspecto, 1);
    }
  });

  it('usa menos bandas antes que dejar un ambiente inutilizable', () => {
    // Pedir 3 bandas para este programa obliga a una franja de servicios muy
    // aplastada; el empaquetador prefiere bajar a 2 bandas correctas.
    const orden = ordenarPorAdyacencia(expandirAmbientes(PROGRAMA));
    expect(anchosDeFila(empaquetarBalanceado(orden, 3, 1.6)).length).toBeLessThanOrEqual(3);
    for (const r of empaquetarBalanceado(orden, 3, 1.6)) {
      expect(Math.min(r.w_m, r.h_m)).toBeGreaterThan(1.0);
    }
  });

  it('ningún ambiente queda con una dimensión aplastada', () => {
    const orden = ordenarPorAdyacencia(expandirAmbientes(PROGRAMA));
    for (const [filas, aspecto] of [
      [2, 1.45],
      [3, 1.6],
      [2, 1.618],
      [3, 0.7],
    ] as const) {
      for (const r of empaquetarBalanceado(orden, filas, aspecto)) {
        // Una banda de 0,70 m de fondo no es una habitación.
        expect(Math.min(r.w_m, r.h_m)).toBeGreaterThan(1.0);
      }
    }
  });

  it('sigue conservando el área exacta de cada ambiente', () => {
    const orden = ordenarPorAdyacencia(expandirAmbientes(PROGRAMA));
    for (const r of empaquetarBalanceado(orden, 2)) {
      expect(r.w_m * r.h_m).toBeCloseTo(r.area_m2, 1);
    }
  });

  it('evita anchos por debajo del mínimo utilizable cuando es posible', () => {
    const orden = ordenarPorAdyacencia(expandirAmbientes(PROGRAMA));
    const rects = empaquetarBalanceado(orden, 2);
    const bano = rects.find(r => r.tipo === 'bano')!;
    expect(Math.min(bano.w_m, bano.h_m)).toBeGreaterThanOrEqual(1.5 - 0.01);
  });
});

describe('ordenarPorAdyacencia', () => {
  it('deja contiguos los ambientes que pidieron estar cerca', () => {
    const instancias = expandirAmbientes(PROGRAMA);
    const orden = ordenarPorAdyacencia(instancias);
    expect(orden).toHaveLength(instancias.length);
    // Arranca por el estar-cocina-comedor, que es la semilla del recorrido.
    expect(orden[0]!.tipo).toBe('estar-cocina-comedor');
    // El baño pidió estar junto al estar: debe salir inmediatamente después.
    expect(orden[1]!.tipo).toBe('bano');
  });

  it('no pierde ambientes sin adyacencias declaradas', () => {
    const sueltos: AmbienteDeseado[] = [
      { id: 'a', tipo: 'dormitorio', cantidad: 1 },
      { id: 'b', tipo: 'taller', cantidad: 1 },
    ];
    const orden = ordenarPorAdyacencia(expandirAmbientes(sueltos));
    expect(orden.map(o => o.id).sort()).toEqual(['a', 'b']);
  });
});
