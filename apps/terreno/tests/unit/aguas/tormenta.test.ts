/**
 * Desagregación de la tormenta de diseño (H5) y método racional.
 *
 * Lo que se cuida acá no es tanto la fórmula —es una línea— como que los
 * órdenes de magnitud queden donde tienen que quedar: la relación P(1h)/P(24h)
 * dentro del rango que se observa en la realidad, y el piso de duración que
 * evita que una cuenca chiquita dispare una intensidad irreal.
 */
import { describe, it, expect } from 'vitest';
import {
  laminaDuracion, intensidadDuracion, duracionDeDiseno, caudalPicoRacional,
  EXP_DURACION, DUR_MIN_MIN,
} from '@/lib/tormenta';

describe('laminaDuracion', () => {
  it('a 24 h devuelve la lámina de partida', () => {
    expect(laminaDuracion(106.3, 24 * 60)).toBeCloseTo(106.3, 5);
  });

  it('P(1 h) cae en el rango 0.3–0.5 de P(24 h), que es lo que se observa', () => {
    const r = laminaDuracion(100, 60) / 100;
    expect(r).toBeGreaterThan(0.30);
    expect(r).toBeLessThan(0.50);
  });

  it('entradas no positivas devuelven 0', () => {
    expect(laminaDuracion(0, 60)).toBe(0);
    expect(laminaDuracion(100, 0)).toBe(0);
  });

  it('más duración acumula más lluvia, pero a menor intensidad', () => {
    expect(laminaDuracion(100, 120)).toBeGreaterThan(laminaDuracion(100, 30));
    expect(intensidadDuracion(100, 120)).toBeLessThan(intensidadDuracion(100, 30));
  });

  it('el exponente manda: más chico, más lámina en duraciones cortas', () => {
    expect(laminaDuracion(100, 30, 0.20)).toBeGreaterThan(laminaDuracion(100, 30, EXP_DURACION));
  });
});

describe('duracionDeDiseno', () => {
  it('usa el tiempo de concentración cuando es creíble', () => {
    expect(duracionDeDiseno(38.4)).toBe(38.4);
  });

  it('pero no baja del piso: abajo de ahí la ley potencia se dispara', () => {
    expect(duracionDeDiseno(3)).toBe(DUR_MIN_MIN);
    expect(duracionDeDiseno(0)).toBe(DUR_MIN_MIN);
  });
});

describe('caudalPicoRacional', () => {
  it('Q = C · i · A / 3.6', () => {
    // C=0.5, i=100 mm/h, A=1 km² → 13.89 m³/s
    expect(caudalPicoRacional(0.5, 100, 1)).toBeCloseTo(13.888, 2);
  });

  it('sin escurrimiento, sin lluvia o sin área no hay caudal', () => {
    expect(caudalPicoRacional(0, 100, 1)).toBe(0);
    expect(caudalPicoRacional(0.5, 0, 1)).toBe(0);
    expect(caudalPicoRacional(0.5, 100, 0)).toBe(0);
  });

  it('escala lineal con el área: el doble de cuenca, el doble de pico', () => {
    expect(caudalPicoRacional(0.4, 80, 0.2)).toBeCloseTo(caudalPicoRacional(0.4, 80, 0.1) * 2, 6);
  });
});
