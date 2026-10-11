/**
 * Tests del dominio "aguas" — hidráulica de la red de riego.
 * Hazen-Williams (pérdida de carga), velocidad media, selección de clase PN
 * y el análisis de línea piezométrica.
 */
import { describe, it, expect } from 'vitest';
import {
  perdidaHazenWilliams,
  velocidad,
  claseNecesaria,
  analizarLinea,
} from '@/lib/hidraulica';

describe('perdidaHazenWilliams', () => {
  it('entradas no positivas devuelven 0', () => {
    expect(perdidaHazenWilliams(0, 150, 0.1, 100)).toBe(0);
    expect(perdidaHazenWilliams(0.01, 150, 0, 100)).toBe(0);
    expect(perdidaHazenWilliams(0.01, 0, 0.1, 100)).toBe(0);
    expect(perdidaHazenWilliams(0.01, 150, 0.1, 0)).toBe(0);
  });

  it('valor de referencia: Q=10 L/s, C=150, D=100 mm, L=100 m → ~1.46 m', () => {
    expect(perdidaHazenWilliams(0.01, 150, 0.1, 100)).toBeCloseTo(1.46, 1);
  });

  it('la pérdida es lineal con la longitud', () => {
    const hf100 = perdidaHazenWilliams(0.01, 150, 0.1, 100);
    const hf200 = perdidaHazenWilliams(0.01, 150, 0.1, 200);
    expect(hf200 / hf100).toBeCloseTo(2, 5);
  });

  it('más caudal → más pérdida; más diámetro → mucha menos pérdida', () => {
    expect(perdidaHazenWilliams(0.02, 150, 0.1, 100)).toBeGreaterThan(perdidaHazenWilliams(0.01, 150, 0.1, 100));
    expect(perdidaHazenWilliams(0.01, 150, 0.15, 100)).toBeLessThan(perdidaHazenWilliams(0.01, 150, 0.1, 100));
  });
});

describe('velocidad', () => {
  it('D=0 devuelve 0', () => {
    expect(velocidad(0.01, 0)).toBe(0);
  });

  it('valor de referencia: Q=10 L/s en D=100 mm → ~1.273 m/s', () => {
    expect(velocidad(0.01, 0.1)).toBeCloseTo(1.273, 2);
  });
});

describe('claseNecesaria (selección de PN)', () => {
  /**
   * El margen por defecto cambió el 03/10/2026 y estos números cambiaron con él.
   *
   * Venía con un margen de 1,1 sin fuente —admitía usar el 91 % de la presión
   * nominal del caño— y ahora sale de la norma de cañerías de riego del NRCS
   * (CPS 430): *«As a safety factor against surge, keep the working pressure at
   * any point at or below 72 percent of the pressure rating of the pipe»*, o sea
   * un margen de 1/0,72 = 1,39.
   *
   * El test viejo fijaba el valor sin respaldo: 30 m.c.a. daban PN4 y ahora dan
   * PN6. Es más caro y es lo que dice la norma. Si alguien vuelve a bajar el
   * margen, este comentario explica qué se está perdiendo.
   */
  it('elige la primera clase que soporta la presión × el margen de la norma', () => {
    expect(claseNecesaria(30)).toBe(6);   // 30×1.389=41.7 → PN6 (61.2), antes PN4
    expect(claseNecesaria(50)).toBe(10);  // 69.4          → PN10 (101.9), antes PN6
    expect(claseNecesaria(100)).toBe(16); // 138.9         → PN16 (163.1), sin cambio
  });

  it('con el margen viejo explícito devuelve lo de antes, así que el cambio es sólo del default', () => {
    expect(claseNecesaria(30, 1.1)).toBe(4);
    expect(claseNecesaria(50, 1.1)).toBe(6);
  });

  it('si ninguna alcanza, devuelve la clase más alta disponible', () => {
    expect(claseNecesaria(300)).toBe(25); // 330 > 254.9 → PN25 (máxima)
  });
});

describe('analizarLinea (integración)', () => {
  it('perfil con menos de 2 puntos válidos devuelve null', () => {
    expect(analizarLinea({
      perfil: [{ distancia_m: 0, elevation: 100 }],
      cargaOrigen_m: 2, Q_m3s: 0.005, C: 150, D_interior_m: 0.05, perdidasLocal_pct: 10,
    })).toBeNull();
  });

  it('línea a favor de pendiente bien dimensionada: llega por gravedad', () => {
    // Caño de 110 mm (interior 0.1 m) a 5 L/s sobre 500 m: la fricción (~2 m)
    // no consume el desnivel de 20 m, así que la presión final es positiva.
    const r = analizarLinea({
      perfil: [
        { distancia_m: 0, elevation: 100 },
        { distancia_m: 500, elevation: 80 },
      ],
      cargaOrigen_m: 2, Q_m3s: 0.005, C: 150, D_interior_m: 0.1, perdidasLocal_pct: 10,
    })!;
    expect(r).not.toBeNull();
    expect(r.estaciones).toHaveLength(2);
    expect(r.desnivel_m).toBeCloseTo(20, 1);         // 100 − 80
    expect(r.velocidad_ms).toBeCloseTo(velocidad(0.005, 0.1), 3);
    expect(r.perdida_total_m).toBeGreaterThan(0);
    expect(r.pn_recomendado).toBeGreaterThanOrEqual(4);
    expect(r.presion_final_mca).toBeGreaterThan(0);
  });

  it('línea sub-dimensionada (caño fino y largo): la presión final es negativa', () => {
    // Mismo tramo pero 50 mm: la fricción supera el desnivel disponible → no llega.
    const r = analizarLinea({
      perfil: [
        { distancia_m: 0, elevation: 100 },
        { distancia_m: 500, elevation: 80 },
      ],
      cargaOrigen_m: 2, Q_m3s: 0.005, C: 150, D_interior_m: 0.05, perdidasLocal_pct: 10,
    })!;
    expect(r.presion_final_mca).toBeLessThan(0);
    expect(r.advertencias.some(a => a.toLowerCase().includes('negativa'))).toBe(true);
  });
});
