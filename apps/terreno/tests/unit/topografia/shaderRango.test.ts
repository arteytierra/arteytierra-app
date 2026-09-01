/**
 * Tests del rango del shader de elevación.
 *
 * El bug: `obtenerGrillaDensa` calcula con 8 % de margen y enmascara a 1,15× el
 * polígono para que las escorrentías vean de dónde viene el agua. Esas celdas de
 * afuera fijaban `elev_min`/`elev_max`, así que un predio llano al pie de una
 * loma se pintaba entero de un solo color: el desnivel del predio quedaba
 * aplastado contra el desnivel del vecindario. El mismo rango alimenta la
 * "posición relativa en la ladera" de aptitud y del master plan, así que el
 * arreglo no es sólo estético.
 */
import { describe, it, expect } from 'vitest';
import { shaderDesdeGrilla } from '@/lib/shaders';
import { grillaDesdeFn, poligonoQueEnvuelve, type BBoxLL } from './_grilla';

const BBOX: BBoxLL = { latMin: -30.010, latMax: -30.000, lngMin: -64.010, lngMax: -64.000 };

/**
 * Grilla 21×21 donde el predio es el cuadrante central (filas/cols 7–13, 800–806 m)
 * y todo lo de afuera trepa hasta 900 m: la loma vecina.
 */
function grillaConLomaAfuera() {
  return grillaDesdeFn(21, 21, (r, c) => {
    const dentro = r >= 7 && r <= 13 && c >= 7 && c <= 13;
    return dentro ? 800 + (r - 7) : 900;
  }, BBOX);
}

/** Cuadrado que cubre exactamente el cuadrante central de la grilla de arriba. */
function predioCentral() {
  const dLat = (BBOX.latMax - BBOX.latMin) / 20;
  const dLng = (BBOX.lngMax - BBOX.lngMin) / 20;
  const s = BBOX.latMin + 6.5 * dLat, n = BBOX.latMin + 13.5 * dLat;
  const o = BBOX.lngMin + 6.5 * dLng, e = BBOX.lngMin + 13.5 * dLng;
  return [{ lat: s, lng: o }, { lat: n, lng: o }, { lat: n, lng: e }, { lat: s, lng: e }];
}

describe('shaderDesdeGrilla — rango de color', () => {
  it('sin predio usa el rango de toda la grilla (comportamiento de siempre)', () => {
    const ds = shaderDesdeGrilla(grillaConLomaAfuera());
    expect(ds).not.toBeNull();
    expect(ds!.elev_min).toBe(800);
    expect(ds!.elev_max).toBe(900);
  });

  it('con predio, el rango sale de adentro y no de la loma vecina', () => {
    const ds = shaderDesdeGrilla(grillaConLomaAfuera(), predioCentral());
    expect(ds).not.toBeNull();
    expect(ds!.elev_min).toBe(800);
    expect(ds!.elev_max).toBe(806);   // antes: 900, y el predio salía de un color
  });

  it('las celdas de afuera se conservan: la hidrología las necesita', () => {
    const g  = grillaConLomaAfuera();
    const ds = shaderDesdeGrilla(g, predioCentral());
    const todas = shaderDesdeGrilla(g);
    expect(ds!.celdas.length).toBe(todas!.celdas.length);
    expect(ds!.celdas.some(c => c.elevation === 900)).toBe(true);
  });

  it('un polígono que envuelve todo deja el rango igual que sin polígono', () => {
    const g = grillaConLomaAfuera();
    const ds = shaderDesdeGrilla(g, poligonoQueEnvuelve(BBOX));
    expect(ds!.elev_min).toBe(800);
    expect(ds!.elev_max).toBe(900);
  });

  it('un polígono que no toca la grilla no rompe: cae al rango completo', () => {
    const lejos = [
      { lat: 10, lng: 10 }, { lat: 10.01, lng: 10 },
      { lat: 10.01, lng: 10.01 }, { lat: 10, lng: 10.01 },
    ];
    const ds = shaderDesdeGrilla(grillaConLomaAfuera(), lejos);
    expect(ds!.elev_min).toBe(800);
    expect(ds!.elev_max).toBe(900);
  });
});
