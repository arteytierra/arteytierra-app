/**
 * Que un precio del hostel o de la Inmersión Viva viva en un solo lugar.
 *
 * El 20/11/2026 Bianca mandó la lista nueva de tarifas y aparecieron tres
 * listas distintas publicadas al mismo tiempo:
 *
 *  1. `/hospedaje` y `/fr/hospedaje` cobraban la cama compartida a $17.000 y
 *     la privada de dos a $45.000.
 *  2. `/en/hospedaje` —la única tabla que lee un huésped extranjero— vendía
 *     «Shared dorm $15,000» y «Double room $35,000», más un camping por noche
 *     y dos tarifas semanales de productos que el hostel no ofrece.
 *  3. El precio semanal de la Inmersión Viva estaba tipeado ocho veces: en el
 *     catálogo, en las tres portadas de Tay Pichín, en la base del chatbot web
 *     y en los dos archivos de n8n.
 *
 * Ninguna de las tres se podía notar leyendo una sola página. Estos tests son
 * lo que lo impide: los importes viven en `lib/hospedaje/precios.ts` y en
 * `lib/courses/data.ts`, y acá se comprueba que nadie los vuelva a tipear.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { TARIFAS_HOSPEDAJE, importePorNoche } from '@/lib/hospedaje/precios';
import { semanaDeInmersion } from '@/lib/courses/inmersion';
import { COURSES, FICN_PRECIOS } from '@/lib/courses/data';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const REPO = join(RAIZ, '..', '..');
const fuente = (ruta: string) => readFileSync(join(RAIZ, ruta), 'utf8');

/**
 * Un importe en pesos escrito a mano: `$22.000`, `$22,000`, `$ 22 000`. No
 * matchea una interpolación (`${algo}`) porque después del peso viene una
 * llave, ni una clase de Tailwind, porque pide un dígito.
 */
const IMPORTE_TIPEADO = /\$\s?\d[\d.,]*/g;

/**
 * El archivo sin sus comentarios. Varios de estos archivos explican en un
 * comentario qué precio decían antes y por qué estaba mal: eso es memoria, no
 * un precio publicado, y no tiene que hacer fallar el test.
 */
function sinComentarios(codigo: string): string {
  return codigo
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter(linea => !/^\s*(\/\/|\*)/.test(linea))
    .join('\n');
}

const PAGINAS_DE_HOSPEDAJE = [
  'app/hospedaje/page.tsx',
  'app/en/hospedaje/page.tsx',
  'app/fr/hospedaje/page.tsx',
];

const PORTADAS_DE_TAY_PICHIN = [
  'app/tay-pichin/page.tsx',
  'app/en/tay-pichin/page.tsx',
  'app/fr/tay-pichin/page.tsx',
];

describe('las tarifas del hostel son una escala coherente', () => {
  const privadas = TARIFAS_HOSPEDAJE.filter(t => t.tipo === 'privada');
  const camas = TARIFAS_HOSPEDAJE.filter(t => t.tipo === 'cama');

  it('hay una habitación privada para cada tamaño de grupo, sin huecos', () => {
    expect(privadas.map(t => t.personas)).toEqual([1, 2, 3, 4, 5]);
    expect(camas).toHaveLength(1);
  });

  it('una habitación más grande nunca cuesta menos que una más chica', () => {
    const importes = privadas.map(t => t.porNoche);
    const ordenados = [...importes].sort((a, b) => a - b);
    expect(importes, 'la lista tiene que subir, para que se lea como una escala').toEqual(ordenados);
    expect(new Set(importes).size, 'dos tamaños al mismo precio son un error de tipeo').toBe(importes.length);
  });

  it('un grupo más grande nunca paga más por cabeza', () => {
    // Es la razón por la que a partir de tres personas la privada sale más
    // barata que las camas sueltas equivalentes: el descuento por grupo está
    // puesto a propósito y acá queda escrito.
    const porCabeza = privadas.map(t => t.porNoche / t.personas);
    for (let i = 1; i < porCabeza.length; i += 1) {
      expect(
        porCabeza[i]!,
        `la privada de ${privadas[i]!.personas} sale más por cabeza que la de ${privadas[i - 1]!.personas}`,
      ).toBeLessThan(porCabeza[i - 1]!);
    }
  });

  it('la cama en el compartido es más barata que cualquier privada', () => {
    const cama = camas[0]!;
    const masBarata = Math.min(...privadas.map(t => t.porNoche));
    expect(cama.porNoche).toBeLessThan(masBarata);
  });

  it('cada tarifa está escrita en los tres idiomas', () => {
    for (const t of TARIFAS_HOSPEDAJE) {
      for (const idioma of ['es', 'en', 'fr'] as const) {
        expect(t.nombre[idioma]?.trim(), `${t.id}: falta el nombre en ${idioma}`).toBeTruthy();
        expect(t.detalle[idioma]?.trim(), `${t.id}: falta el detalle en ${idioma}`).toBeTruthy();
      }
    }
  });

  it('sólo una tarjeta queda destacada', () => {
    expect(TARIFAS_HOSPEDAJE.filter(t => t.destacada)).toHaveLength(1);
  });

  it('el importe se formatea con los separadores de cada idioma', () => {
    const cama = TARIFAS_HOSPEDAJE.find(t => t.id === 'cama-compartida')!;
    expect(importePorNoche(cama, 'es')).toBe('$22.000');
    expect(importePorNoche(cama, 'en')).toBe('$22,000');
    // En francés el separador de miles es un espacio, no un punto. Es el mismo
    // criterio que ya usan las fichas de los cursos.
    expect(importePorNoche(cama, 'fr')).toMatch(/^\$22\s000$/);
  });
});

describe('ninguna página tipea un precio', () => {
  it.each(PAGINAS_DE_HOSPEDAJE)('%s lee las tarifas de lib/hospedaje/precios', ruta => {
    const tipeados = sinComentarios(fuente(ruta)).match(IMPORTE_TIPEADO) ?? [];
    expect(
      tipeados,
      `tiene importes escritos a mano. Van a lib/hospedaje/precios.ts:\n  ${tipeados.join('\n  ')}`,
    ).toEqual([]);
  });

  it.each(PORTADAS_DE_TAY_PICHIN)('%s lee el precio semanal del catálogo', ruta => {
    const tipeados = sinComentarios(fuente(ruta)).match(IMPORTE_TIPEADO) ?? [];
    expect(
      tipeados,
      `tiene importes escritos a mano. Van a lib/courses/data.ts:\n  ${tipeados.join('\n  ')}`,
    ).toEqual([]);
  });

  it('la base del chatbot web interpola el precio, no lo escribe', () => {
    const linea = /Precio: Camping ([^/]+)\/semana/.exec(fuente('lib/chatbot/knowledge-base.ts'));
    expect(linea, 'cambió el texto del precio de la Inmersión Viva en el prompt').not.toBeNull();
    expect(
      linea![1],
      'el precio está tipeado en el prompt del bot: tiene que salir de data.ts',
    ).toMatch(/^\$\{/);
  });
});

/*
 * Los dos archivos de n8n no son código y no pueden importar el catálogo: son
 * el prompt que corre en el servidor de n8n y la base que Jonatan edita a mano.
 * La única forma de atarlos es leerlos y comparar, que es la misma técnica del
 * test que ata el trigger de límite de proyectos de acequia a su migración.
 */
describe('el chatbot de n8n cotiza la Inmersión Viva igual que el sitio', () => {
  const sinPeso = (importe: string) => importe.replace('$', '');
  const camping = sinPeso(semanaDeInmersion('camping', 'es'));
  const habitacion = sinPeso(semanaDeInmersion('habitacion', 'es'));

  it('la base de conocimiento', () => {
    const texto = readFileSync(join(REPO, 'n8n', 'chatbot', 'base-conocimiento.md'), 'utf8');
    const m = /Camping \$([\d.]+)\/semana · Habitación compartida \$([\d.]+)\/semana/.exec(texto);
    expect(m, 'no encontré la línea del precio de la Inmersión Viva en base-conocimiento.md').not.toBeNull();
    expect(m![1], 'el camping de n8n no coincide con data.ts').toBe(camping);
    expect(m![2], 'la habitación de n8n no coincide con data.ts').toBe(habitacion);
  });

  it('el systemMessage del workflow', () => {
    const texto = readFileSync(join(REPO, 'n8n', 'workflows', '10-chatbot-omnicanal.json'), 'utf8');
    const m = /camping \$([\d.]+)\/sem, hab\. compartida \$([\d.]+)\/sem/.exec(texto);
    expect(m, 'no encontré el precio de la Inmersión Viva en el systemMessage').not.toBeNull();
    expect(m![1], 'el camping del workflow no coincide con data.ts').toBe(camping);
    expect(m![2], 'la habitación del workflow no coincide con data.ts').toBe(habitacion);
  });
});

/*
 * La Formación Integral es el curso más caro del catálogo y hasta el 21/11/2026
 * tenía dos precios publicados: el sitio y el chatbot de la web cobraban
 * $1.500.000 con seña del 10%, y los dos archivos de n8n $2.000.000 con seña
 * del 50%. Dos bots cotizando distinto lo mismo, y nadie de este lado lo veía.
 */
describe('el chatbot de n8n cotiza la Formación Integral igual que el sitio', () => {
  const total = FICN_PRECIOS.total.replace('$', '').replace(' ARS', '');
  const mitad = FICN_PRECIOS.mitad.replace('$', '');

  it('la base de conocimiento', () => {
    const texto = readFileSync(join(REPO, 'n8n', 'chatbot', 'base-conocimiento.md'), 'utf8');
    const precio = /\*\*\$([\d.]+) ARS \/ USD [\d.]+\*\*/.exec(texto);
    expect(precio, 'no encontré el precio de la FICN en base-conocimiento.md').not.toBeNull();
    expect(precio![1], 'el precio de n8n no coincide con data.ts').toBe(total);

    const cupo = /al 50%\*\* \(\*\*\$([\d.]+) ARS/.exec(texto);
    expect(cupo, 'no encontré el cupo con experiencia en base-conocimiento.md').not.toBeNull();
    expect(cupo![1], 'el cupo con 50% de descuento no es la mitad del precio').toBe(mitad);
  });

  it('el systemMessage del workflow', () => {
    const texto = readFileSync(join(REPO, 'n8n', 'workflows', '10-chatbot-omnicanal.json'), 'utf8');
    const m = /Construcción Natural: [^,]+, \$([\d.]+) ARS/.exec(texto);
    expect(m, 'no encontré el precio de la FICN en el systemMessage').not.toBeNull();
    expect(m![1], 'el precio del workflow no coincide con data.ts').toBe(total);
  });

  it('la seña dice 50% en todas las veces que aparece, no en alguna', () => {
    // `base-conocimiento.md` nombra la seña dos veces, en el precio y en la
    // inscripción. Comprobar que *alguna* diga 50% no alcanza: bajar una de
    // las dos al 10% pasaba el test. Se juntan todas y tienen que coincidir.
    const porcentajes = (texto: string) =>
      [...new Set([...texto.matchAll(/[Ss]eña (?:del )?(\d+)%/g)].map(m => m[1]!))];

    for (const [nombre, ruta] of [
      ['base-conocimiento.md', join(REPO, 'n8n', 'chatbot', 'base-conocimiento.md')],
      ['el workflow', join(REPO, 'n8n', 'workflows', '10-chatbot-omnicanal.json')],
    ] as const) {
      const vistos = porcentajes(readFileSync(ruta, 'utf8'));
      expect(vistos.length, `${nombre} nombra la seña y no coincide consigo mismo: ${vistos.join('% y ')}%`).toBe(1);
      expect(vistos[0], `${nombre} anuncia otra seña`).toBe('50');
    }

    // Y el sitio, que la deriva del mismo número.
    const ficn = COURSES['formacion-construccion-natural']!;
    const enElSitio = porcentajes(
      `${ficn.opcionesNota ?? ''} ${ficn.opciones.map(o => o.senaLabel ?? '').join(' ')}`,
    );
    expect(enElSitio, 'el sitio anuncia otra seña, o dos distintas').toEqual(['50']);
    expect(ficn.opcionesNota, 'el importe de la seña no es la mitad del precio').toContain(
      FICN_PRECIOS.mitad,
    );
  });
});
