import { describe, it, expect } from 'vitest';
import {
  agregarVertice, quitarUltimoVertice, tieneVertices, estaDibujando, etiquetaModo,
  type ModoMapa,
} from '@/lib/mapa/modoMapa';

const P = { lat: -26.7, lng: -65.3 };
const Q = { lat: -26.8, lng: -65.4 };

describe('tieneVertices', () => {
  it('reconoce los tres modos que se dibujan clic a clic', () => {
    expect(tieneVertices({ k: 'zona',   categoria: 'huerta', vertices: [] })).toBe(true);
    expect(tieneVertices({ k: 'sector', tipo: 'viento_ppal',     vertices: [] })).toBe(true);
    expect(tieneVertices({ k: 'camino', vertices: [] })).toBe(true);
  });

  it('no confunde con los modos de un solo clic ni con el reposo', () => {
    expect(tieneVertices(null)).toBe(false);
    expect(tieneVertices({ k: 'cuenca' })).toBe(false);
    expect(tieneVertices({ k: 'dibujo', tipo: 'poligono' })).toBe(false);
  });
});

describe('agregarVertice', () => {
  it('acumula en orden', () => {
    let m: ModoMapa = { k: 'camino', vertices: [] };
    m = agregarVertice(m, P);
    m = agregarVertice(m, Q);
    expect(tieneVertices(m) && m.vertices).toEqual([P, Q]);
  });

  it('no muta el modo anterior', () => {
    const antes: ModoMapa = { k: 'zona', categoria: 'huerta', vertices: [P] };
    const despues = agregarVertice(antes, Q);
    expect(tieneVertices(antes) && antes.vertices).toHaveLength(1);
    expect(despues).not.toBe(antes);
  });

  it('conserva el resto del modo, no sólo los vértices', () => {
    const m = agregarVertice({ k: 'camino', proposito: 'cortina', vertices: [] }, P);
    expect(m).toMatchObject({ k: 'camino', proposito: 'cortina' });
  });

  // Se llama sin preguntar antes: en un modo sin vértices tiene que ser inocuo.
  it('deja intacto un modo que no acumula', () => {
    const m: ModoMapa = { k: 'viewshed' };
    expect(agregarVertice(m, P)).toBe(m);
    expect(agregarVertice(null, P)).toBe(null);
  });
});

describe('quitarUltimoVertice', () => {
  it('deshace el último clic', () => {
    const m = quitarUltimoVertice({ k: 'sector', tipo: 'viento_ppal', vertices: [P, Q] });
    expect(tieneVertices(m) && m.vertices).toEqual([P]);
  });

  it('sobre un modo vacío no rompe ni deja vértices de más', () => {
    const m = quitarUltimoVertice({ k: 'zona', categoria: 'huerta', vertices: [] });
    expect(tieneVertices(m) && m.vertices).toEqual([]);
  });
});

describe('estaDibujando', () => {
  it('el reposo no dibuja', () => {
    expect(estaDibujando(null)).toBe(false);
  });

  // La flecha de selección mueve lo ya dibujado: el cursor no está armado.
  it('la herramienta de selección no cuenta como dibujar', () => {
    expect(estaDibujando({ k: 'dibujo', tipo: 'seleccion' })).toBe(false);
    expect(estaDibujando({ k: 'dibujo', tipo: 'poligono'  })).toBe(true);
    expect(estaDibujando({ k: 'dibujo', tipo: 'medir'     })).toBe(true);
  });

  // Agregar mojones convive con el mapa normal; no arma el cursor de dibujo.
  it('agregar mojones tampoco', () => {
    expect(estaDibujando({ k: 'mojon' })).toBe(false);
  });

  it('los demás modos sí', () => {
    for (const m of [
      { k: 'pin' }, { k: 'elemento' }, { k: 'zona0' }, { k: 'acceso' },
      { k: 'viewshed' }, { k: 'cuenca' }, { k: 'arbol' },
    ] as const) {
      expect(estaDibujando(m)).toBe(true);
    }
    expect(estaDibujando({ k: 'camino', vertices: [] })).toBe(true);
  });
});

describe('etiquetaModo', () => {
  it('distingue cortina de camino, que comparten modo', () => {
    expect(etiquetaModo({ k: 'camino', vertices: [] })).toBe('Trazando camino');
    expect(etiquetaModo({ k: 'camino', proposito: 'cortina', vertices: [] })).toBe('Trazando cortina');
  });

  it('calla en reposo y con la flecha de selección', () => {
    expect(etiquetaModo(null)).toBeNull();
    expect(etiquetaModo({ k: 'dibujo', tipo: 'seleccion' })).toBeNull();
  });

  it('anuncia todos los demás modos', () => {
    const modos: ModoMapa[] = [
      { k: 'mojon' }, { k: 'pin' }, { k: 'elemento' }, { k: 'zona0' }, { k: 'acceso' },
      { k: 'viewshed' }, { k: 'cuenca' }, { k: 'arbol' },
      { k: 'zona', categoria: 'huerta', vertices: [] },
      { k: 'sector', tipo: 'viento_ppal', vertices: [] },
      { k: 'dibujo', tipo: 'medir' },
    ];
    for (const m of modos) expect(etiquetaModo(m)).toBeTruthy();
  });
});
