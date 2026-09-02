import { describe, it, expect } from 'vitest';
import {
  cerrarDibujo, puedeCerrar, motivoNoCierra, esTrazo, faltanVertices, VERTICES_MINIMOS,
  type ContextoCierre,
} from '@/lib/mapa/cerrarDibujo';
import type { DibujoEnCurso, TipoDibujo } from '@/lib/dibujos';

const P = { lat: -26.70, lng: -65.30 };
const Q = { lat: -26.71, lng: -65.30 };
const R = { lat: -26.71, lng: -65.31 };

const CTX: ContextoCierre = { id: 'x1', color: '#EF4444', capaId: 'capa-1' };

const enCurso = (tipo: TipoDibujo, vertices = [P, Q]): DibujoEnCurso => ({ tipo, vertices });

describe('puedeCerrar', () => {
  it('exige tres puntos para el polígono y dos para el resto', () => {
    expect(puedeCerrar(enCurso('poligono', [P, Q]))).toBe(false);
    expect(puedeCerrar(enCurso('poligono', [P, Q, R]))).toBe(true);
    expect(puedeCerrar(enCurso('linea', [P]))).toBe(false);
    expect(puedeCerrar(enCurso('linea', [P, Q]))).toBe(true);
  });

  // punto y texto se colocan de un clic: nunca hay trazo que cerrar.
  it('las formas de un clic no se cierran por esta vía', () => {
    expect(puedeCerrar(enCurso('punto', [P]))).toBe(false);
    expect(puedeCerrar(enCurso('texto', [P]))).toBe(false);
    expect(esTrazo('punto')).toBe(false);
    expect(esTrazo('poligono')).toBe(true);
  });
});

describe('motivoNoCierra', () => {
  // Este es el bug que motivó el módulo: antes el trazo se borraba mudo.
  it('dice cuánto falta en vez de callarse', () => {
    const m = motivoNoCierra(enCurso('poligono', [P, Q]));
    expect(m).toContain('3 puntos');
    expect(m).toContain('2');
  });

  it('distingue no haber marcado nada de haber marcado uno', () => {
    expect(motivoNoCierra(enCurso('linea', []))).toContain('ninguno');
    expect(motivoNoCierra(enCurso('linea', [P]))).toContain('marcaste 1');
  });

  it('calla cuando el trazo sí se puede cerrar', () => {
    expect(motivoNoCierra(enCurso('poligono', [P, Q, R]))).toBeNull();
    expect(motivoNoCierra(enCurso('cota', [P, Q]))).toBeNull();
  });

  it('cada tipo tiene un mínimo declarado', () => {
    const tipos: TipoDibujo[] = ['linea', 'curva', 'poligono', 'circulo', 'texto', 'cota', 'flecha', 'punto'];
    for (const t of tipos) expect(VERTICES_MINIMOS[t]).toBeGreaterThan(0);
  });
});

describe('faltanVertices', () => {
  // El banner del mapa promete "Enter finaliza" sólo cuando esto da cero.
  it('cuenta lo que falta y nunca baja de cero', () => {
    expect(faltanVertices(enCurso('poligono', []))).toBe(3);
    expect(faltanVertices(enCurso('poligono', [P, Q]))).toBe(1);
    expect(faltanVertices(enCurso('poligono', [P, Q, R]))).toBe(0);
    expect(faltanVertices(enCurso('linea', [P, Q, R]))).toBe(0);
  });

  it('da cero exactamente cuando el trazo se puede cerrar', () => {
    for (const v of [[], [P], [P, Q], [P, Q, R]]) {
      const d = enCurso('poligono', v);
      expect(faltanVertices(d) === 0).toBe(puedeCerrar(d));
    }
  });
});

describe('cerrarDibujo', () => {
  it('devuelve null en vez de un elemento a medias', () => {
    expect(cerrarDibujo(enCurso('poligono', [P, Q]), CTX)).toBeNull();
    expect(cerrarDibujo(enCurso('linea', [P]), CTX)).toBeNull();
  });

  it('arma la línea con el color y la capa activos', () => {
    const el = cerrarDibujo(enCurso('linea', [P, Q]), CTX);
    expect(el).toMatchObject({ id: 'x1', tipo: 'linea', color: '#EF4444', capaId: 'capa-1' });
  });

  it('el círculo mide el radio entre el centro y el borde', () => {
    const el = cerrarDibujo(enCurso('circulo', [P, Q]), CTX);
    expect(el).toMatchObject({ tipo: 'circulo', lat: P.lat, lng: P.lng });
    // ~0,01° de latitud ≈ 1,11 km
    expect(el && 'radio' in el ? el.radio : 0).toBeGreaterThan(1000);
  });

  // Antes exigían exactamente dos vértices y con tres se perdía todo el trazo.
  it('el círculo y la cota toleran vértices de más', () => {
    expect(cerrarDibujo(enCurso('circulo', [P, Q, R]), CTX)).toMatchObject({ tipo: 'circulo' });
    const cota = cerrarDibujo(enCurso('cota', [P, Q, R]), CTX);
    expect(cota && 'vertices' in cota ? cota.vertices : []).toEqual([P, Q]);
  });

  it('el sello de un elemento manda sobre la paleta de dibujo', () => {
    const el = cerrarDibujo(enCurso('poligono', [P, Q, R]), {
      ...CTX,
      elementoPoli: { color: '#123456', opacidad: 0.7, emoji: '🌳', nombre: 'Monte' },
    });
    expect(el).toMatchObject({ color: '#123456', opacidad: 0.7, simbolo: '🌳', nombre: 'Monte' });
  });

  it('el espejo de agua usa su propio azul y el nombre que le pasan', () => {
    const el = cerrarDibujo(enCurso('poligono', [P, Q, R]), { ...CTX, nombreEspejo: 'Espejo de agua 3' });
    expect(el).toMatchObject({ color: '#1E88E5', nombre: 'Espejo de agua 3' });
  });

  it('sin disfraz, el polígono sale con el color de la paleta', () => {
    const el = cerrarDibujo(enCurso('poligono', [P, Q, R]), CTX);
    expect(el).toMatchObject({ color: '#EF4444', opacidad: 0.22 });
    expect(el).not.toHaveProperty('nombre', expect.stringContaining('Espejo'));
  });
});
