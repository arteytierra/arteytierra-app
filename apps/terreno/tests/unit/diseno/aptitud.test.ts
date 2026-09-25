/**
 * Tests del dominio "diseño" — agrupación de aptitud en polígonos contiguos.
 * Cubre `agruparAptitud`, la función que reemplazó a la caja-envolvente-por-tipo
 * (que cubría todo el predio y se superponía). Verifica que los polígonos que
 * salen son disjuntos y contiguos por construcción.
 */
import { describe, it, expect } from 'vitest';
import {
  agruparAptitud,
  calcularAptitud,
  type CeldaAptitud,
  type ResultadoAptitud,
  type TipoAptitud,
} from '@/lib/aptitud';
import type { DatosShader, CeldaShader } from '@/lib/shaders';
import type { ModificadorAptitud } from '@/lib/biomaTipos';

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
    return [t, { celdas: n, area_m2: 0, pct: celdas.length ? (n / celdas.length) * 100 : 0 }];
  })) as ResultadoAptitud['resumen'];
  return { celdas, area_celda_m2: 0, area_total_m2: 0, resumen, ajustes: [] };
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

// ─── Corrección de la aptitud por el ecosistema ──────────────────────────────
//
// El cálculo base es puro relieve, y el relieve no sabe en qué bioma está. Estos
// tests fijan que la corrección de la ficha se aplique ANTES de elegir el uso
// dominante —si sólo ajustara el número mostrado, el mapa seguiría pintando el
// uso equivocado— y que la razón viaje hasta el resultado.

/** Predio sintético llano: en llano, la huerta es el uso que más puntúa. */
function shaderLlano(n = 5): DatosShader {
  const celdas: CeldaShader[] = [];
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      celdas.push({
        row, col,
        latMin: -34 + row * 0.001, latMax: -34 + (row + 1) * 0.001,
        lngMin: -58 + col * 0.001, lngMax: -58 + (col + 1) * 0.001,
        elevation: 100 + row * 0.2,
        pendiente_pct: 2,
      });
    }
  }
  return { celdas, elev_min: 100, elev_max: 100 + (n - 1) * 0.2, pend_max: 2 };
}

// ─── Superficie: la pantalla cuenta metros cuadrados, no celdas ─────────────
//
// "5.031 celdas" no es una cantidad de tierra: es una cantidad de píxeles del
// DEM, y su tamaño cambia con la latitud y con la fuente del relieve. El panel
// habla en m², así que la conversión tiene que estar bien proyectada.

describe('calcularAptitud: superficie por categoría', () => {
  const shader = shaderLlano();   // 25 celdas de 0.001° a −34°

  /**
   * Caso resuelto a mano. Un grado de latitud son 111.320 m; uno de longitud,
   * eso por cos(lat). A −34°: 0.001° × 111.320 = 111,32 m de alto y
   * 111,32 × cos(34°) = 111,32 × 0,82904 = 92,29 m de ancho → 10.274 m².
   *
   * Sin el coseno daría 12.392 m², un 21 % de más. La tolerancia de 30 m² deja
   * pasar el redondeo pero no ese error.
   */
  it('proyecta la celda a metros con el coseno de la latitud', () => {
    const r = calcularAptitud(shader, null);
    expect(r.area_celda_m2).toBeGreaterThan(10_244);
    expect(r.area_celda_m2).toBeLessThan(10_304);   // 12.392 (sin coseno) no entra
  });

  it('el total es la suma de las categorías y coincide con celdas × área', () => {
    const r = calcularAptitud(shader, null);
    const tipos: TipoAptitud[] = ['huerta', 'frutales', 'pasturas', 'forestal', 'reserva'];
    const suma = tipos.reduce((a, t) => a + r.resumen[t].area_m2, 0);
    expect(r.area_total_m2).toBeCloseTo(25 * r.area_celda_m2, 3);
    expect(suma).toBeCloseTo(r.area_total_m2, -1);
  });

  it('la superficie de cada categoría guarda la misma proporción que su %', () => {
    const r = calcularAptitud(shader, null);
    for (const t of ['huerta', 'frutales', 'pasturas', 'forestal', 'reserva'] as TipoAptitud[]) {
      const pctDeArea = (r.resumen[t].area_m2 / r.area_total_m2) * 100;
      expect(pctDeArea).toBeCloseTo(r.resumen[t].pct, 1);
    }
  });
});

describe('calcularAptitud con modificadores del ecosistema', () => {
  const shader = shaderLlano();

  it('sin modificadores el resultado no cambia y la lista de ajustes va vacía', () => {
    const r = calcularAptitud(shader, null);
    expect(r.ajustes).toEqual([]);
    expect(r.celdas.length).toBe(25);
  });

  it('el ajuste se aplica al puntaje de cada celda, no sólo al resumen', () => {
    const base = calcularAptitud(shader, null);
    const mods: ModificadorAptitud[] = [
      { uso: 'huerta', delta: -25, razon: 'La fertilidad está en la biomasa, no en el suelo.' },
    ];
    const conMod = calcularAptitud(shader, null, mods);
    for (let i = 0; i < base.celdas.length; i++) {
      const antes = base.celdas[i]!.scores.huerta;
      const despues = conMod.celdas[i]!.scores.huerta;
      expect(despues).toBe(Math.max(0, antes - 25));
    }
  });

  it('un ajuste suficiente cambia el uso dominante, y con él lo que se pinta', () => {
    const base = calcularAptitud(shader, null);
    const dominanteBase = base.celdas[0]!.dominante;
    const conMod = calcularAptitud(shader, null, [
      { uso: dominanteBase, delta: -60, razon: 'prueba' },
    ]);
    expect(conMod.celdas[0]!.dominante).not.toBe(dominanteBase);
  });

  it('los puntajes siguen acotados a 0-100 por más grande que sea el delta', () => {
    const r = calcularAptitud(shader, null, [
      { uso: 'huerta',   delta: -500, razon: 'prueba' },
      { uso: 'forestal', delta:  500, razon: 'prueba' },
    ]);
    for (const c of r.celdas) {
      expect(c.scores.huerta).toBe(0);
      expect(c.scores.forestal).toBe(100);
    }
  });

  it('la razón viaja hasta el resultado: un puntaje corregido se puede discutir', () => {
    const mods: ModificadorAptitud[] = [
      { uso: 'forestal', delta: 20, razon: 'El sistema que sostiene este bioma es agroforestal.' },
    ];
    const r = calcularAptitud(shader, null, mods);
    expect(r.ajustes).toEqual(mods);
    expect(r.ajustes[0]!.razon).toContain('agroforestal');
  });
});

// ─── Las fichas globales traen esa corrección para todo el planeta ───────────

describe('modificadores de las fichas de bioma global', () => {
  it('los 15 biomas de respaldo declaran su corrección de uso del suelo', async () => {
    const { BIOMAS_GLOBALES } = await import('@/lib/biomasGlobales');
    const fichas = Object.values(BIOMAS_GLOBALES);
    expect(fichas.length).toBe(15);
    for (const f of fichas) {
      expect(f.aptitud, f.id).toBeDefined();
      expect(f.aptitud!.length, f.id).toBeGreaterThan(0);
      for (const m of f.aptitud!) {
        // Un delta sin razón es exactamente lo que estos modificadores existen
        // para evitar: el usuario tiene que poder discutir el ajuste.
        expect(m.razon.length, f.id + ' / ' + m.uso).toBeGreaterThan(20);
        expect(Math.abs(m.delta), f.id + ' / ' + m.uso).toBeLessThanOrEqual(40);
      }
    }
  });

  it('la selva húmeda desalienta la huerta abierta y favorece lo agroforestal', () => {
    return import('@/lib/biomasGlobales').then(({ BIOMAS_GLOBALES }) => {
      const m = BIOMAS_GLOBALES['resolve_bosque_tropical_humedo']!.aptitud!;
      expect(m.find(x => x.uso === 'huerta')!.delta).toBeLessThan(0);
      expect(m.find(x => x.uso === 'forestal')!.delta).toBeGreaterThan(0);
    });
  });
});
