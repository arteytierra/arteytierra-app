/**
 * Ninguna consulta nueva puede pedirle a PostgREST que embeba una tabla de
 * otro esquema, porque no sabe hacerlo.
 *
 * El 21/11/2026, buscando por qué `/cursos` nunca lee la base, apareció esto:
 *
 *     .schema('shop').from('products').select('..., courses(is_live)')
 *     → PGRST200: Could not find a relationship between 'products' and
 *       'courses' in the schema 'shop'
 *
 * **No falta ninguna foreign key.** `edu.courses.product_id` referencia
 * `shop.products(id)` desde la migración 0001, y la relación está viva en
 * Postgres. Lo que no existe es la capacidad de PostgREST de resolver un
 * recurso embebido que vive en otro esquema: el embed se busca sólo dentro del
 * esquema activo (el de `.schema()`). Probado contra la base real, falla en las
 * dos direcciones —`shop` → `edu` y `edu` → `shop`— y anda perfecto dentro de
 * un mismo esquema.
 *
 * Tampoco se arregla con vistas pass-through: eso se probó en la migración
 * 0033 y se revirtió en la 0034, porque una vista `select *` hace nullable toda
 * columna y rompía los tipos generados (>300 errores de TS). La estrategia
 * vigente es exponer los esquemas y usar `.schema()` por consulta.
 *
 * Así que la forma de pedir datos de otro esquema es **dos consultas y un
 * join en TypeScript**, o una relación computada (una función en el esquema
 * activo que devuelva `setof otro_esquema.tabla`).
 *
 * Este test no arregla las 23 consultas que ya están escritas así: las deja
 * **anotadas y contadas** en `YA_ESTABAN_ROTAS`. Lo que impide es que crezca la
 * lista. Si agregás una consulta cruzada, falla. Si arreglás una de las que
 * están, también falla, y lo que hay que hacer es borrarla de la lista.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MIGRACIONES = join(RAIZ, '..', '..', 'supabase', 'migrations');

/**
 * Las consultas cruzadas que ya existían el 21/11/2026, con lo que rompe cada
 * una. Todas devuelven PGRST200, así que la consulta entera vuelve vacía o con
 * error — no es que falte un campo, es que no hay fila.
 *
 * Hoy ninguna se nota desde afuera porque las cinco tablas de `edu` están en
 * cero filas y `shop.products` no tiene ningún producto de hospedaje, así que
 * todas las páginas que dependen de esto muestran "no hay nada" en vez de un
 * error. Se van a notar el día que se carguen datos.
 */
const YA_ESTABAN_ROTAS = [
  // `getCourseWithCurriculum`: la ficha de curso servida por la base y sus dos
  // páginas de Q&A. Hoy no se nota porque los diez cursos tienen ficha escrita
  // a mano en `app/cursos/<slug>/`, que gana sobre `[slug]`, y porque
  // `edu.courses` está en cero filas.
  'lib/commerce/products.ts | shop.products -> courses (edu)',
  'lib/commerce/products.ts | shop.products -> lessons (edu)',
  'lib/commerce/products.ts | shop.products -> modules (edu)',
  // El admin de cursos: muestra "Sin cursos cargados" aunque haya diez.
  'app/(admin)/admin/cursos/page.tsx | shop.products -> courses (edu)',
  // Certificados, del alumno y del admin.
  'app/(account)/certificados/page.tsx | edu.certificates -> products (shop)',
  'app/(admin)/admin/certificados/page.tsx | edu.certificates -> products (shop)',
  'app/(admin)/admin/certificados/page.tsx | edu.certificates -> profiles (app)',
  'lib/certificates/index.ts | edu.certificates -> products (shop)',
  'lib/certificates/index.ts | edu.certificates -> profiles (app)',
  // "Mis cursos" y el reproductor.
  'lib/edu/queries.ts | edu.enrollments -> products (shop)',
  'lib/edu/queries.ts | edu.lessons -> products (shop)',
  'lib/edu/queries.ts | shop.products -> courses (edu)',
  'lib/edu/queries.ts | shop.products -> lessons (edu)',
  'lib/edu/queries.ts | shop.products -> modules (edu)',
  'lib/edu/queries.ts | shop.products -> profiles (app)',
  // La comunidad de cada curso.
  'app/(player)/mis-cursos/[slug]/comunidad/[threadId]/page.tsx | edu.threads -> profiles (app)',
  'app/(player)/mis-cursos/[slug]/comunidad/page.tsx | edu.threads -> profiles (app)',
  // El portal del instructor.
  'lib/instructor/index.ts | edu.courses -> products (shop)',
  'lib/instructor/index.ts | edu.enrollments -> profiles (app)',
  // Reservas de hospedaje: la ficha por habitación y el iCal.
  'lib/book/queries.ts | book.reservations -> products (shop)',
  'lib/book/queries.ts | shop.products -> resources (book)',
  'app/api/n8n/reservations/route.ts | book.reservations -> products (shop)',
  'app/api/reservations/[id]/ical/route.ts | book.reservations -> products (shop)',
];

/**
 * En qué esquema vive cada tabla y cada vista, leído de las migraciones, que
 * son la fuente de verdad del esquema. Se guarda un conjunto por nombre porque
 * dos esquemas pueden tener una tabla con el mismo nombre.
 */
function esquemasPorTabla(): Map<string, Set<string>> {
  const mapa = new Map<string, Set<string>>();
  const anotar = (tabla: string, esquema: string) => {
    if (!mapa.has(tabla)) mapa.set(tabla, new Set());
    mapa.get(tabla)!.add(esquema);
  };

  for (const archivo of readdirSync(MIGRACIONES).filter(n => n.endsWith('.sql')).sort()) {
    const sql = readFileSync(join(MIGRACIONES, archivo), 'utf8');
    for (const m of sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?([a-z_]+)\.([a-z_]+)/gi)) {
      anotar(m[2]!, m[1]!);
    }
    for (const m of sql.matchAll(
      /create\s+(?:or\s+replace\s+)?(?:materialized\s+)?view\s+(?:if\s+not\s+exists\s+)?([a-z_]+)\.([a-z_]+)/gi,
    )) {
      anotar(m[2]!, m[1]!);
    }
    // La 0034 dropea las vistas pass-through que creó la 0033: si no se
    // descuentan, `public.courses` parecería existir todavía.
    for (const m of sql.matchAll(/drop\s+(?:materialized\s+)?view\s+(?:if\s+exists\s+)?([a-z_]+)\.([a-z_]+)/gi)) {
      mapa.get(m[2]!)?.delete(m[1]!);
    }
    for (const m of sql.matchAll(/alter\s+table\s+([a-z_]+)\.([a-z_]+)\s+set\s+schema\s+([a-z_]+)/gi)) {
      mapa.get(m[2]!)?.delete(m[1]!);
      anotar(m[2]!, m[3]!);
    }
  }
  for (const [tabla, donde] of [...mapa]) if (donde.size === 0) mapa.delete(tabla);
  return mapa;
}

function fuentes(carpeta: string): string[] {
  const salida: string[] = [];
  for (const entrada of readdirSync(carpeta)) {
    if (entrada === 'node_modules' || entrada === '.next' || entrada.startsWith('.')) continue;
    const camino = join(carpeta, entrada);
    if (statSync(camino).isDirectory()) salida.push(...fuentes(camino));
    else if (/\.tsx?$/.test(entrada)) salida.push(camino);
  }
  return salida;
}

const AGREGADOS = new Set(['count', 'sum', 'avg', 'min', 'max']);

/**
 * Los recursos embebidos de un `select` de PostgREST: todo identificador
 * seguido de un paréntesis, sacando las funciones de agregación. Soporta los
 * modificadores `!inner` y `!left`.
 *
 * Un identificador que no sea una tabla conocida se ignora: en
 * `profiles:user_id(...)` lo que queda antes del paréntesis es el nombre de la
 * columna FK, y sin el mapa de foreign keys no se puede decir a qué esquema
 * apunta. Preferimos no avisar de más antes que avisar en falso.
 */
function recursosEmbebidos(select: string): string[] {
  return [...select.matchAll(/([A-Za-z_]\w*)\s*(?:!\s*(?:inner|left))?\s*\(/g)]
    .map(m => m[1]!)
    .filter(nombre => !AGREGADOS.has(nombre));
}

/** `.schema('x')…from('y')…select('…')`, encadenado en la misma expresión. */
const CADENA =
  /\.schema\(\s*['"`]([a-z_]+)['"`]\s*\)[\s\S]{0,200}?\.from\(\s*['"`]([a-z_]+)['"`]\s*\)[\s\S]{0,900}?\.select\(\s*(['"`])([\s\S]*?)\3/g;

function consultasCruzadas(): string[] {
  const esquemas = esquemasPorTabla();
  const encontradas = new Set<string>();

  for (const archivo of ['app', 'lib', 'components'].flatMap(c => fuentes(join(RAIZ, c)))) {
    const relativo = archivo
      .slice(RAIZ.length + 1)
      .split(/[\\/]/)
      .join('/');
    const src = readFileSync(archivo, 'utf8');
    for (const m of src.matchAll(CADENA)) {
      const esquemaActivo = m[1]!;
      const tabla = m[2]!;
      for (const rel of recursosEmbebidos(m[4]!)) {
        const donde = esquemas.get(rel);
        if (!donde) continue; // no es una tabla: es una columna FK
        if (donde.has(esquemaActivo)) continue; // no cruza nada
        encontradas.add(`${relativo} | ${esquemaActivo}.${tabla} -> ${rel} (${[...donde].join('/')})`);
      }
    }
  }
  return [...encontradas].sort();
}

describe('el lector de esquemas mira donde tiene que mirar', () => {
  // Sin esto el test podría pasar en verde con el mapa vacío, que es la peor
  // forma de fallar: verde y ciego.
  const esquemas = esquemasPorTabla();

  it('resuelve las tablas que importan', () => {
    expect(esquemas.size).toBeGreaterThan(80);
    expect([...esquemas.get('courses') ?? []]).toEqual(['edu']);
    expect([...esquemas.get('products') ?? []]).toEqual(['shop']);
    expect([...esquemas.get('modules') ?? []]).toEqual(['edu']);
    expect([...esquemas.get('profiles') ?? []]).toEqual(['app']);
    expect([...esquemas.get('resources') ?? []]).toEqual(['book']);
  });

  it('no se cree las vistas pass-through que la 0034 dropeó', () => {
    // La 0033 creó `public.courses`; la 0034 la borró. Si el lector no
    // descontara los drops, `courses` parecería vivir también en `public` y
    // ningún embed cruzado se detectaría.
    expect([...esquemas.get('courses') ?? []]).not.toContain('public');
  });

  it('encuentra el embed cruzado del listado de cursos', () => {
    expect(consultasCruzadas()).toContain('lib/commerce/products.ts | shop.products -> courses (edu)');
  });
});

describe('no hay consultas cruzadas nuevas', () => {
  it('la lista de las que ya estaban no crece ni queda desactualizada', () => {
    const ahora = consultasCruzadas();
    const anotadas = [...YA_ESTABAN_ROTAS].sort();

    const nuevas = ahora.filter(c => !anotadas.includes(c));
    const arregladas = anotadas.filter(c => !ahora.includes(c));

    expect(
      nuevas,
      'PostgREST no embebe entre esquemas. Resolvelo con dos consultas y un join en TypeScript:\n  ' +
        nuevas.join('\n  '),
    ).toEqual([]);

    expect(
      arregladas,
      'estas ya no están cruzadas: sacalas de YA_ESTABAN_ROTAS para que la lista siga siendo cierta:\n  ' +
        arregladas.join('\n  '),
    ).toEqual([]);
  });
});
