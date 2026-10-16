/**
 * El presupuesto de tiempo de TODAS las rutas de `/api`, no de una.
 *
 * ## Qué falla cuando esto falta
 *
 * El 15/10/2026 «contexto actual» dejó de contestar, y uno de los tres motivos
 * fue que la ruta no declaraba `maxDuration`: corría con el techo que da la
 * plataforma por defecto, **más corto que sus propios timeouts internos**. La
 * consecuencia no es un error prolijo. Es que Vercel mata la función antes de
 * que el `AbortSignal` propio alcance a disparar, así que el `catch` que sabe
 * decir «el servicio no contestó, reintentá» nunca corre y al usuario le llega
 * un 504 de la plataforma, sin mensaje y sin pista.
 *
 * Y se nota todavía menos de lo que parece: mientras el servicio de afuera
 * conteste rápido, la ruta anda bien. Rompe el día que el servicio se pone
 * lento, que es exactamente el día en que el aviso hacía falta.
 *
 * Por eso esto no mira un comentario: **lee los números del propio código de
 * cada ruta**. Si alguien estira un timeout, agrega un segundo pedido o crea
 * una ruta nueva que llame a un servicio de afuera, el que no cierra es este
 * test.
 *
 * ## El techo del plan
 *
 * La cuenta de Vercel es Hobby, y ahí el máximo es 60 segundos: declarar más no
 * da más tiempo. Si alguna vez se pasa a Pro hay que subir `TECHO_DEL_PLAN`
 * **a mano y a propósito**, no porque un test molestaba.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname, relative, sep } from 'node:path';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..', '..');
const API  = join(RAIZ, 'app', 'api');

/** Máximo que admite el plan Hobby de Vercel. Subirlo es una decisión, no un arreglo. */
const TECHO_DEL_PLAN = 60;

/**
 * El default más corto que puede regir si una ruta no declara nada.
 *
 * No se lee de ningún lado: es el piso histórico de la plataforma. Un timeout
 * interno por encima de esto es la zona donde el default mata a la función
 * antes de que el aviso salga.
 */
const DEFAULT_MAS_CORTO_MS = 10_000;

/** Margen para que el `catch`, el `cacheSet` y el armado del JSON entren. */
const MARGEN_MS = 2_000;

interface Ruta {
  id: string;
  fuente: string;
  maxDuration: number | null;
  /** Todos los `AbortSignal.timeout(N)` del archivo, en milisegundos. */
  timeouts: number[];
}

function rutas(dir: string, acc: Ruta[] = []): Ruta[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { rutas(p, acc); continue; }
    if (e.name !== 'route.ts') continue;
    const fuente = readFileSync(p, 'utf8');
    const md = /export const maxDuration = (\d+)/.exec(fuente);
    acc.push({
      id: relative(API, p).split(sep).join('/'),
      fuente,
      maxDuration: md ? Number(md[1]) : null,
      timeouts: [...fuente.matchAll(/AbortSignal\.timeout\(([\d_]+)\)/g)]
        .map(m => Number(m[1]!.replace(/_/g, ''))),
    });
  }
  return acc;
}

const TODAS = rutas(API);

/**
 * Las rutas que hacen varios pedidos SECUENCIALES en una misma invocación, con
 * el presupuesto que hay que sumar.
 *
 * No se puede deducir del texto: `precipitacion` tiene tres fetch pero en
 * caminos excluyentes, así que sumar los tres daría un presupuesto que nunca
 * ocurre. Esta tabla es a mano y a propósito, y dice qué se encadena de verdad.
 */
const CADENAS: Record<string, { pedidos: number; porque: string }> = {
  'cobertura/route.ts': {
    pedidos: 2,
    porque: 'buscar el ítem STAC y después pedirle el histograma del polígono',
  },
  'geologia/route.ts': {
    pedidos: 3,
    porque: 'las unidades del punto, la tabla de fuentes y la de litologías',
  },
  'precipitacion/route.ts': {
    pedidos: 2,
    porque: 'consultar el avance del job y, si está listo, bajar el resultado',
  },
};

describe('el presupuesto de tiempo de cada ruta de /api', () => {
  it('encontró las rutas, así que el test no está pasando en el aire', () => {
    expect(TODAS.length).toBeGreaterThanOrEqual(15);
    expect(TODAS.map(r => r.id)).toContain('entorno/route.ts');
  });

  it('toda ruta con un timeout interno largo declara su techo', () => {
    const descubiertas = TODAS.filter(r =>
      r.maxDuration === null && Math.max(0, ...r.timeouts) >= DEFAULT_MAS_CORTO_MS - MARGEN_MS,
    );
    // El mensaje nombra las rutas: el que lea el fallo tiene que saber dónde ir.
    expect(descubiertas.map(r => r.id), 'les falta `export const maxDuration`').toEqual([]);
  });

  it('ningún techo pasa el máximo del plan, porque declararlo no lo concede', () => {
    for (const r of TODAS) {
      if (r.maxDuration === null) continue;
      expect(r.maxDuration, r.id).toBeLessThanOrEqual(TECHO_DEL_PLAN);
      expect(r.maxDuration, r.id).toBeGreaterThan(0);
    }
  });

  it('el techo le gana al timeout interno más largo, con margen para contestar', () => {
    for (const r of TODAS) {
      if (r.maxDuration === null || r.timeouts.length === 0) continue;
      const masLargo = Math.max(...r.timeouts);
      expect(masLargo + MARGEN_MS, `${r.id}: el timeout interno no deja lugar al aviso`)
        .toBeLessThanOrEqual(r.maxDuration * 1000);
    }
  });

  it('y en las rutas que encadenan pedidos, le gana a la SUMA', () => {
    // Acá es donde `cobertura` estaba mal: 30 + 40 = 70 s secuenciales contra un
    // techo de 60 que es el máximo del plan. No se arreglaba con una línea:
    // había que recortar los timeouts internos a 25 + 30.
    for (const [id, { pedidos, porque }] of Object.entries(CADENAS)) {
      const r = TODAS.find(x => x.id === id);
      expect(r, `la ruta ${id} de la tabla de cadenas`).toBeDefined();
      expect(r!.maxDuration, id).not.toBeNull();
      // Los N timeouts más largos, que es el peor caso de la cadena.
      const peores = [...r!.timeouts].sort((a, b) => b - a).slice(0, pedidos);
      expect(peores.length, `${id}: ${porque}`).toBe(pedidos);
      const suma = peores.reduce((a, b) => a + b, 0);
      expect(suma + MARGEN_MS, `${id}: encadena ${porque}`)
        .toBeLessThanOrEqual(r!.maxDuration! * 1000);
    }
  });

  it('las rutas sin pedido externo no necesitan declarar nada', () => {
    // No es una excepción: una ruta que sólo lee la base o calcula no tiene de
    // dónde colgarse. Si alguna de estas crece y sale a la red, el primer test
    // de este bloque la agarra.
    const quietas = TODAS.filter(r => r.timeouts.length === 0 && r.maxDuration === null);
    for (const r of quietas) expect(r.fuente, r.id).not.toMatch(/\bfetch\(\s*['"`]https/);
  });
});
