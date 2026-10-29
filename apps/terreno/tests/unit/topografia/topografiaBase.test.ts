/**
 * De dónde salen las estadísticas del panel de Topografía.
 *
 * El defecto, medido el 23/10/2026 sobre el proyecto Cuetiepa (Chiapas, 7
 * mojones, 417,8 ha) contra el GLO-30 leído en grilla densa:
 *
 * |                   | panel  | grilla densa |
 * |-------------------|--------|--------------|
 * | elevación máxima  | 391 m  | **441 m**    |
 * | desnivel          | 317,1  | **367,5**    |
 * | pendiente general | 20,2 % | **30,8 %**   |
 * | escurre hacia     | NNE    | **NE**       |
 *
 * Repetido a dos resoluciones (115×106 y 300×277) da 441 las dos veces, así que
 * no era la densidad de la grilla de control: el pico de 441 m está adentro del
 * polígono y la muestra lo salteaba. Y lo confirmaba la propia app en la misma
 * pantalla, con curvas de nivel rotuladas 420 y 440 m al lado de un panel que
 * decía 391.
 *
 * Lo que importa no es el rótulo: la pendiente general sale de esos dos mismos
 * puntos, y 20,2 % contra 30,8 % son dos decisiones distintas de terrazas,
 * keyline y caminos. Es el caso del CLAUDE.md: no se estrella, imprime un
 * número plausible y equivocado.
 *
 * Acá se prueban las dos mitades del arreglo: que la muestra use el presupuesto
 * de puntos que tiene, y que cuando el relieve denso está calculado sea él el
 * que manda.
 */
import { describe, it, expect } from 'vitest';
import {
  PUNTOS_POR_PEDIDO, divisionesMuestra, topografiaConGrillaDensa,
  type DatosTopografia,
} from '@/lib/topografia';
import { shaderDesdeGrilla } from '@/lib/shaders';
import { grillaMetrica, puntoMetrico } from './_grilla';

// ─────────────────────────────────────────────────────────────────────────────
// 1 · El presupuesto de puntos de la muestra
// ─────────────────────────────────────────────────────────────────────────────
describe('la muestra usa el pedido que tiene', () => {
  it('la grilla de 4 divisiones gastaba 9 de los 100 puntos disponibles', () => {
    // (4 − 1)² = 9. Con 7 mojones y el centroide, 17 puntos sobre 417 ha: un
    // paso de muestreo de más de un kilómetro.
    expect((4 - 1) ** 2).toBe(9);
    expect(PUNTOS_POR_PEDIDO).toBe(100);
  });

  it('ahora las divisiones salen del presupuesto y no de un número elegido', () => {
    // 7 mojones + centroide dejan 92 libres; la grilla más grande que entra es
    // de 9×9 = 81 puntos interiores, o sea 10 divisiones.
    expect(divisionesMuestra(7)).toBe(10);
    expect((divisionesMuestra(7) - 1) ** 2).toBe(81);
    expect(7 + 1 + (divisionesMuestra(7) - 1) ** 2).toBeLessThanOrEqual(PUNTOS_POR_PEDIDO);
  });

  it('nunca se pasa del tope, con los mojones que sean', () => {
    for (const m of [3, 4, 7, 12, 20, 40, 60, 80, 95, 99, 120]) {
      const total = m + 1 + (divisionesMuestra(m) - 1) ** 2;
      expect(total, `con ${m} mojones`).toBeLessThanOrEqual(PUNTOS_POR_PEDIDO + m);
      expect((divisionesMuestra(m) - 1) ** 2, `interior con ${m} mojones`)
        .toBeLessThanOrEqual(Math.max(0, PUNTOS_POR_PEDIDO - m - 1));
    }
  });

  it('con un predio de muchos mojones se repliega en vez de romperse', () => {
    expect(divisionesMuestra(99)).toBe(1);
    expect(divisionesMuestra(200)).toBe(1);
    expect((divisionesMuestra(99) - 1) ** 2).toBe(0);
  });

  it('densifica nueve veces y no cuesta un pedido más', () => {
    expect((divisionesMuestra(7) - 1) ** 2 / (4 - 1) ** 2).toBe(9);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2 · El pico que la muestra chica se saltea
// ─────────────────────────────────────────────────────────────────────────────
describe('el pico adentro del predio que una muestra de 4×4 no toca', () => {
  /*
   * Predio sintético de 200 × 200 m con celda de 2 m: un plano que baja al sur
   * más un pico agudo. El pico está a propósito en (105, 105) m, que es entre
   * los nodos de una grilla de 4 divisiones —ésos caen en 50, 100 y 150— y
   * tiene 6 m de radio, así que la muestra chica no lo puede ver.
   */
  const PASO = 2, N = 101, LADO = (N - 1) * PASO;          // 200 m
  const PICO_X = 105, PICO_Y = 105, PICO_R = 6, PICO_H = 60;
  const BASE_PENDIENTE = 0.10;                              // 10 % hacia el sur

  const g = grillaMetrica(N, N, PASO, (x, y) => {
    const base = y * BASE_PENDIENTE;
    const d = Math.hypot(x - PICO_X, y - PICO_Y);
    return d < PICO_R ? base + PICO_H * (1 - d / PICO_R) : base;
  });

  // Mojones: el cuadrado entero, así que todas las celdas caen adentro.
  const mojones = [
    puntoMetrico(g, 1, 1), puntoMetrico(g, LADO - 1, 1),
    puntoMetrico(g, LADO - 1, LADO - 1), puntoMetrico(g, 1, LADO - 1),
  ];
  const shader = shaderDesdeGrilla(g, mojones)!;

  /** La muestra que daría una grilla de `n` divisiones sobre este predio. */
  const muestraDe = (n: number): DatosTopografia => {
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 1; i < n; i++) {
      for (let j = 1; j < n; j++) pts.push({ x: (j / n) * LADO, y: (i / n) * LADO });
    }
    const conElev = pts.map(p => ({
      ...puntoMetrico(g, p.x, p.y),
      elevation: (() => {
        const d = Math.hypot(p.x - PICO_X, p.y - PICO_Y);
        return p.y * BASE_PENDIENTE + (d < PICO_R ? PICO_H * (1 - d / PICO_R) : 0);
      })(),
    }));
    const elevs = conElev.map(p => p.elevation);
    const alto = conElev.reduce((b, p) => (p.elevation > b.elevation ? p : b));
    const bajo = conElev.reduce((b, p) => (p.elevation < b.elevation ? p : b));
    return {
      puntos: [], centroide: conElev[0]!, grilla: conElev,
      elev_min: Math.min(...elevs), elev_max: Math.max(...elevs),
      elev_media: elevs.reduce((s, e) => s + e, 0) / elevs.length,
      desnivel: Math.max(...elevs) - Math.min(...elevs),
      pendiente_pct: 0, pendiente_grados: 0, orientacion: '—',
      escurrimiento: { desde: alto, hacia: bajo },
      resolucion: '~30 m/píxel', fuente: 'sintético',
      base: 'muestra', muestra_n: conElev.length,
    };
  };

  it('el pico existe y está adentro del predio', () => {
    // El ápice está entre nodos (105 m con celda de 2 m), así que el máximo
    // muestreado es menor que la altura del cono: 56,5 m contra los 70,5 del
    // vértice. Eso es correcto y es justamente de lo que habla la ficha del
    // paso efectivo; lo que importa acá es que el pico sobresale del plano.
    const planoEnElPico = PICO_Y * BASE_PENDIENTE;
    expect(g.elev_max).toBeGreaterThan(planoEnElPico + PICO_H * 0.7);
    expect(g.elev_max).toBeLessThan(planoEnElPico + PICO_H);
    expect(shader.elev_max).toBeCloseTo(g.elev_max, 6);
  });

  it('LA MUESTRA DE 4 DIVISIONES NO LO VE, Y ÉSE ES EL DEFECTO', () => {
    const m = muestraDe(4);
    expect(m.grilla).toHaveLength(9);
    // El máximo de la muestra es el borde sur del plano, no el pico.
    expect(m.elev_max).toBeLessThan(shader.elev_max - PICO_H / 2);
  });

  it('la grilla densa sí lo encuentra, y el máximo informado deja de perderlo', () => {
    const corregido = topografiaConGrillaDensa(muestraDe(4), shader);
    expect(corregido.base).toBe('grilla_densa');
    expect(corregido.elev_max).toBeCloseTo(shader.elev_max, 6);
    expect(corregido.elev_max).toBeGreaterThan(muestraDe(4).elev_max);
  });

  it('y el desnivel y la pendiente general se corrigen con él', () => {
    const m = muestraDe(4);
    const c = topografiaConGrillaDensa(m, shader);
    expect(c.desnivel).toBeGreaterThan(m.desnivel);
    // La pendiente general se recalcula entre los dos extremos nuevos, así que
    // deja de ser el 0 que traía la muestra sintética y pasa a ser medible.
    expect(c.pendiente_pct).toBeGreaterThan(0);
    expect(c.pendiente_grados).toBeGreaterThan(0);
    expect(c.orientacion).not.toBe('—');
  });

  it('el punto más alto que informa es el pico, no un borde', () => {
    const c = topografiaConGrillaDensa(muestraDe(4), shader);
    const x = ((c.escurrimiento.desde.lng - g.lngMin) / (g.lngMax - g.lngMin)) * (N - 1) * PASO;
    const y = ((c.escurrimiento.desde.lat - g.latMin) / (g.latMax - g.latMin)) * (N - 1) * PASO;
    expect(Math.hypot(x - PICO_X, y - PICO_Y)).toBeLessThan(PICO_R);
  });

  it('declara cuántas celdas midió, y son muchas más que los puntos', () => {
    const c = topografiaConGrillaDensa(muestraDe(4), shader);
    expect(c.celdas_densas).toBeGreaterThan(N * N * 0.9);
    expect(c.celdas_densas!).toBeGreaterThan(PUNTOS_POR_PEDIDO * 50);
  });

  it('la muestra de puntos NO se pisa: el perfil por mojón sigue siendo medido', () => {
    // `puntos`, `centroide` y `grilla` son elevaciones de un lugar concreto y el
    // panel las dibuja. Lo que se reemplaza son los resúmenes.
    const m = muestraDe(4);
    const c = topografiaConGrillaDensa(m, shader);
    expect(c.grilla).toBe(m.grilla);
    expect(c.centroide).toBe(m.centroide);
    expect(c.muestra_n).toBe(m.muestra_n);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3 · El halo no es el predio
// ─────────────────────────────────────────────────────────────────────────────
describe('la grilla densa cuenta el predio y no el halo', () => {
  /*
   * La grilla llega hasta 1,15× el polígono a propósito: la pendiente necesita
   * vecinos y el D8 necesita ver de dónde baja el agua. Si el máximo saliera de
   * ahí, la loma del vecino se informaría como el techo del predio. Es el mismo
   * criterio que `resumenEmplazamiento` ya aplicaba a las hectáreas.
   */
  const PASO = 2, N = 101, LADO = (N - 1) * PASO;
  const CENTRO = LADO / 2;

  // Terreno plano a 100 m, con una loma de 80 m en la esquina noreste.
  const g = grillaMetrica(N, N, PASO, (x, y) =>
    (x > LADO * 0.85 && y > LADO * 0.85 ? 180 : 100));

  // El predio es el cuadrado central: la loma queda afuera.
  const mojones = [
    puntoMetrico(g, CENTRO - 40, CENTRO - 40), puntoMetrico(g, CENTRO + 40, CENTRO - 40),
    puntoMetrico(g, CENTRO + 40, CENTRO + 40), puntoMetrico(g, CENTRO - 40, CENTRO + 40),
  ];
  const shader = shaderDesdeGrilla(g, mojones)!;

  const base: DatosTopografia = {
    puntos: [], centroide: { ...puntoMetrico(g, CENTRO, CENTRO), elevation: 100 }, grilla: [],
    elev_min: 100, elev_max: 100, elev_media: 100, desnivel: 0,
    pendiente_pct: 0, pendiente_grados: 0, orientacion: '—',
    escurrimiento: {
      desde: { ...puntoMetrico(g, CENTRO, CENTRO), elevation: 100 },
      hacia: { ...puntoMetrico(g, CENTRO, CENTRO), elevation: 100 },
    },
    resolucion: '~30 m/píxel', fuente: 'sintético', base: 'muestra', muestra_n: 1,
  };

  it('la loma está en la grilla pero no en el predio', () => {
    expect(g.elev_max).toBe(180);
    expect(shader.celdas.some(c => c.elevation === 180)).toBe(true);
    expect(shader.celdas.some(c => c.elevation === 180 && c.dentro)).toBe(false);
  });

  it('y el máximo informado es el del predio, no el de la loma del vecino', () => {
    const c = topografiaConGrillaDensa(base, shader);
    expect(c.elev_max).toBe(100);
    expect(c.desnivel).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4 · Cuando no hay con qué mejorar, no se miente
// ─────────────────────────────────────────────────────────────────────────────
describe('los bordes de la mejora', () => {
  const base: DatosTopografia = {
    puntos: [], centroide: { lat: 0, lng: 0, elevation: 10 }, grilla: [],
    elev_min: 10, elev_max: 20, elev_media: 15, desnivel: 10,
    pendiente_pct: 5, pendiente_grados: 2.9, orientacion: 'N',
    escurrimiento: { desde: { lat: 0, lng: 0, elevation: 20 }, hacia: { lat: 0, lng: 0, elevation: 10 } },
    resolucion: '~30 m/píxel', fuente: 'sintético', base: 'muestra', muestra_n: 17,
  };

  it('un shader sin celdas de adentro devuelve la muestra tal cual, y lo sigue diciendo', () => {
    const vacio = { celdas: [], fuente: undefined };
    const r = topografiaConGrillaDensa(base, vacio);
    expect(r).toBe(base);
    expect(r.base).toBe('muestra');
  });

  it('sin máscara cuentan todas las celdas: ausente es «contá todo», no «contá nada»', () => {
    // Un DEM propio importado suelto no trae polígono. `dentro === undefined` no
    // puede significar «afuera», o el panel se quedaría sin dato teniéndolo.
    const celdas = [10, 30].map((e, i) => ({
      row: i, col: 0, latMin: i, latMax: i + 1, lngMin: 0, lngMax: 1,
      elevation: e, pendiente_pct: 0,
    }));
    const r = topografiaConGrillaDensa(base, { celdas, fuente: undefined });
    expect(r.base).toBe('grilla_densa');
    expect(r.elev_max).toBe(30);
    expect(r.celdas_densas).toBe(2);
  });

  it('si el shader trae su fuente, la atribución y la resolución se actualizan', () => {
    const celdas = [10, 30].map((e, i) => ({
      row: i, col: 0, latMin: i, latMax: i + 1, lngMin: 0, lngMax: 1,
      elevation: e, pendiente_pct: 0, dentro: true,
    }));
    const r = topografiaConGrillaDensa(base, { celdas, fuente: 'glo30' });
    expect(r.fuenteRelieve).toBe('glo30');
    expect(r.resolucion).toContain('30 m');
    expect(r.fuente).not.toBe('sintético');
  });
});
