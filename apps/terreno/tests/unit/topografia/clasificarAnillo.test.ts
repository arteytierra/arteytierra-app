/**
 * El camino rápido de clasificación de anillos tiene que decir lo mismo que el
 * exhaustivo. Siempre.
 *
 * Por qué este test existe: `clasificarAnillo` sondea cuatro extremos en vez de
 * recorrer la grilla, y `clasificarAnilloExhaustivo` —el método original— quedó
 * como respaldo para los anillos sin consenso. Los tests de cono y cráter
 * pasarían igual aunque el camino rápido estuviera roto, porque el respaldo los
 * salvaría en silencio. Este compara los dos resultados anillo por anillo sobre
 * relieves variados, que es la única forma de que una regresión se note.
 *
 * Ver la medición en el encabezado de `clasificarAnillo`: el exhaustivo costaba
 * 14 ms por anillo y el 70% del tiempo total de calcular las curvas.
 */
import { describe, it, expect } from 'vitest';
import { calcularCurvas, clasificarAnilloExhaustivo } from '@/lib/curvasNivel';
import { grillaDesdeFn } from './_grilla';

/** Relieves con cimas, hoyas, sillas, crestas y formas cóncavas mezcladas. */
const RELIEVES: Array<[string, (r: number, c: number, n: number) => number]> = [
  ['ondulado', (r, c, n) => 120
    + 18 * Math.sin((r / n) * Math.PI * 3)
    + 14 * Math.cos((c / n) * Math.PI * 2.4)
    + 4  * Math.sin((r + c) / n * Math.PI * 7)],
  ['cono y crater juntos', (r, c, n) => {
    const d1 = Math.hypot(r / n - 0.3, c / n - 0.3);
    const d2 = Math.hypot(r / n - 0.7, c / n - 0.7);
    return 100 + Math.max(0, 25 * (1 - d1 / 0.25)) - Math.max(0, 25 * (1 - d2 / 0.25));
  }],
  // Anillo en herradura: el caso que el sondeo de extremos NO puede resolver
  // solo, y que tiene que caer al respaldo.
  ['herradura', (r, c, n) => {
    const x = c / n - 0.5, y = r / n - 0.5;
    const d = Math.abs(Math.hypot(x, y) - 0.3);
    return 100 + (y > 0.15 ? 0 : Math.max(0, 20 * (1 - d / 0.12)));
  }],
  ['crestas paralelas', (r, c, n) => 100 + 12 * Math.sin((r / n) * Math.PI * 5) * Math.cos((c / n) * Math.PI * 1.5)],
];

describe('clasificarAnillo rápido == exhaustivo', () => {
  for (const [nombre, fn] of RELIEVES) {
    it(nombre, () => {
      const n = 120;
      const g = grillaDesdeFn(n, n, (r, c) => fn(r, c, n));
      const curvas = calcularCurvas(g, 1);

      let anillos = 0;
      for (const cv of curvas) {
        for (const l of cv.lineas) {
          if (!l.cerrada) continue;
          anillos++;
          expect(
            l.tipo,
            nombre + ': anillo en la cota ' + cv.cota + ' con ' + l.puntos.length + ' vértices',
          ).toBe(clasificarAnilloExhaustivo(l.puntos, cv.cota, g));
        }
      }
      // Si un relieve deja de producir anillos, el test se vuelve vacío y no
      // avisa nada: eso también es una regresión.
      expect(anillos, nombre + ' no produjo ningún anillo cerrado').toBeGreaterThan(0);
    });
  }
});

/**
 * El relieve anidado —una hoya adentro de una loma— es el único donde los dos
 * métodos NO coinciden, y el rápido es el que acierta.
 *
 * Importa más de lo que parece: una hoya dentro de una loma es exactamente
 * donde se evalúa una represa, así que confundir el borde del cerro con el
 * borde del hoyo no es un detalle de dibujo.
 *
 * Por qué difieren. El exhaustivo promedia la elevación de TODO el interior del
 * anillo contra su cota. En un anillo anidado ese interior contiene dos formas
 * distintas —el anillo alto y el hoyo del centro— y el hoyo arrastra la media
 * hacia abajo, así que marca "depresión" un anillo que encierra terreno más
 * alto. El rápido sondea el terreno inmediatamente adentro del borde, que es
 * el criterio de las cartas topográficas: un anillo es cima si el terreno sube
 * al cruzarlo hacia adentro, sin importar qué haya más adentro todavía.
 *
 * Se deja documentado y no se "arregla" el exhaustivo: sigue siendo el respaldo
 * para los anillos sin consenso, donde el anidamiento no es lo que está en
 * juego, y cambiarlo tocaría un comportamiento que ya está en producción.
 */
describe('relieve anidado: hoya adentro de una loma', () => {
  // Loma de 30 m con un cuenco de 18 m cavado en el centro. El perfil radial
  // sube de 112 en el centro a 120 en d=0,15 y baja a 100 en d=0,45, así que
  // la cota 118 se cruza dos veces: el borde del cuenco y la ladera de la loma.
  const relieve = (r: number, c: number, n: number) => {
    const d = Math.hypot(r / n - 0.5, c / n - 0.5);
    return 100 + Math.max(0, 30 * (1 - d / 0.45)) - Math.max(0, 18 * (1 - d / 0.15));
  };

  it('el borde de la loma es cima aunque encierre el hoyo', () => {
    const n = 120;
    const g = grillaDesdeFn(n, n, (r, c) => relieve(r, c, n));
    const anillos = calcularCurvas(g, 1)
      .flatMap(cv => cv.lineas.filter(l => l.cerrada).map(l => ({ cota: cv.cota, l })));
    expect(anillos.length).toBeGreaterThan(0);

    // El anillo más grande de la cota 118 es el externo: el de la loma.
    const en118 = anillos.filter(a => a.cota === 118);
    expect(en118.length, 'la cota 118 tiene que cruzarse dos veces').toBeGreaterThan(1);
    const externo = en118.reduce((a, b) => (b.l.puntos.length > a.l.puntos.length ? b : a));

    expect(externo.l.tipo, 'el borde externo de la loma').toBe('cima');
    // Y acá queda anotado que el exhaustivo, en este caso, dice lo contrario.
    expect(clasificarAnilloExhaustivo(externo.l.puntos, 118, g)).toBe('depresion');
  });

  it('el borde del cuenco sigue siendo depresión', () => {
    const n = 120;
    const g = grillaDesdeFn(n, n, (r, c) => relieve(r, c, n));
    const en118 = calcularCurvas(g, 1)
      .filter(cv => cv.cota === 118)
      .flatMap(cv => cv.lineas.filter(l => l.cerrada));
    const interno = en118.reduce((a, b) => (b.puntos.length < a.puntos.length ? b : a));
    expect(interno.tipo).toBe('depresion');
  });
});
