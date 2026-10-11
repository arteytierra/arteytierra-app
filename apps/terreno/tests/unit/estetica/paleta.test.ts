/**
 * La paleta completa — ninguna clase de color puede apuntar a un tono que no
 * existe.
 *
 * Por qué existe este test. Tailwind no avisa cuando una clase no resuelve:
 * `text-water-900` sobre una paleta que llega hasta 800 no es un error de
 * compilación ni de lint, es CSS que simplemente no se emite. El elemento sale
 * sin color y nadie se entera hasta que alguien mira esa pantalla.
 *
 * Ya pasó dos veces. La primera fueron 19 clases en apps/terreno, que es de
 * donde salió el bloque `tonosFaltantes` de `tailwind.config.ts`; la segunda
 * fue el barrido de apps/web del 02/09/2026. Este test cierra el ciclo: si
 * alguien escribe un tono que no existe, o borra uno que se estaba usando, la
 * compuerta lo agarra.
 *
 * Alcance: sólo las familias propias del design system. Los colores que trae
 * Tailwind de fábrica (`slate`, `red`, `white`…) no se verifican, porque su
 * escala la define Tailwind y no este repo.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { colors } from '@arteytierra/config/tokens';

/** La raíz de la app, desde este archivo. */
const APP = join(__dirname, '..', '..', '..');

/**
 * Los tonos que la app agrega por encima de la paleta compartida. Se leen del
 * archivo y no se importan porque `tailwind.config.ts` importa el preset por
 * `require`, que vitest no resuelve en este contexto. Leer el texto es menos
 * elegante y más honesto: verifica lo que Tailwind va a ver de verdad.
 */
function tonosDeLaApp(): Record<string, Set<string>> {
  const s = readFileSync(join(APP, 'tailwind.config.ts'), 'utf8');
  const bloque = s.match(/const tonosFaltantes = \{([\s\S]*?)\n\};/);
  if (!bloque?.[1]) throw new Error('no se encontró `tonosFaltantes` en tailwind.config.ts');
  const salida: Record<string, Set<string>> = {};
  for (const linea of bloque[1].split('\n')) {
    const m = linea.match(/^\s*([a-z]+):\s*\{(.*)\},?\s*$/);
    if (!m?.[1] || !m[2]) continue;
    salida[m[1]] = new Set([...m[2].matchAll(/(\d+):/g)].map(x => x[1]!));
  }
  return salida;
}

/** La paleta que Tailwind realmente conoce: la compartida más la de la app. */
function paletaEfectiva(): Record<string, Set<string>> {
  const salida: Record<string, Set<string>> = {};
  for (const [familia, tonos] of Object.entries(colors)) {
    salida[familia] = new Set(Object.keys(tonos));
  }
  for (const [familia, tonos] of Object.entries(tonosDeLaApp())) {
    salida[familia] = new Set([...(salida[familia] ?? []), ...tonos]);
  }
  return salida;
}

/** Los archivos que Tailwind escanea, según `content` de la config. */
function fuentes(): string[] {
  const salida: string[] = [];
  const recorrer = (dir: string) => {
    for (const entrada of readdirSync(dir)) {
      if (entrada === 'node_modules' || entrada === '.next') continue;
      const p = join(dir, entrada);
      if (statSync(p).isDirectory()) recorrer(p);
      else if (/\.tsx?$/.test(p)) salida.push(p);
    }
  };
  for (const d of ['app', 'components', 'lib']) recorrer(join(APP, d));
  return salida;
}

/**
 * Las utilidades de Tailwind que llevan color. `border` incluye sus variantes
 * por lado (`border-t-`, `border-x-`…), que también aceptan color.
 */
const UTILIDADES = [
  'text', 'bg', 'border', 'border-[trblxyse]', 'ring', 'ring-offset', 'divide',
  'outline', 'decoration', 'accent', 'caret', 'fill', 'stroke', 'shadow',
  'placeholder', 'from', 'via', 'to',
].join('|');

describe('la paleta de acequia', () => {
  const paleta = paletaEfectiva();
  const familias = Object.keys(paleta).join('|');
  // Sin barras invertidas a propósito: `[0-9]` y `[A-Za-z0-9_-]` en vez de
  // las clases cortas de un carácter. La primera versión las usaba dentro de
  // un template literal, que se come la barra invertida y las deja como
  // letras sueltas: el regex no matcheaba nada y el test pasaba sin mirar
  // un solo archivo.
  //
  // Tampoco lleva anclaje por izquierda, para que las variantes de Tailwind
  // (`hover:text-water-700`, `md:bg-water-50`) entren igual. El lookahead de
  // la derecha sí hace falta: sin él, `water-50` matchearía adentro de
  // `water-500`, que fue el error de la primera medición a mano.
  const claseDeColor = new RegExp(
    `(?:${UTILIDADES})-(${familias})-([0-9]+)(?![0-9A-Za-z_-])`, 'g',
  );

  it('no hay ninguna clase que apunte a un tono inexistente', () => {
    const huerfanas: string[] = [];
    for (const archivo of fuentes()) {
      const texto = readFileSync(archivo, 'utf8');
      for (const m of texto.matchAll(claseDeColor)) {
        const [clase, familia, tono] = m;
        if (paleta[familia!]?.has(tono!)) continue;
        const linea = texto.slice(0, m.index).split('\n').length;
        huerfanas.push(`${relative(APP, archivo)}:${linea} — ${clase}`);
      }
    }
    expect(huerfanas, `clases sin tono en la paleta:\n${huerfanas.join('\n')}`).toEqual([]);
  });

  it('water tiene la rampa entera, que es la familia que se rompió', () => {
    // 50 a 800 sin huecos. Si alguien saca uno, esto lo dice antes que la pantalla.
    expect([...paleta.water!].sort((a, b) => +a - +b))
      .toEqual(['50', '100', '200', '300', '400', '500', '600', '700', '800']);
  });

  it('ningún tono de la app pisa uno de la paleta compartida', () => {
    // Si el preset compartido gana un tono que la app ya interpolaba, hay dos
    // valores para el mismo nombre y el que manda depende del orden del merge.
    const choques: string[] = [];
    for (const [familia, tonos] of Object.entries(tonosDeLaApp())) {
      const compartidos = colors[familia as keyof typeof colors];
      if (!compartidos) continue;
      for (const t of tonos) {
        if (t in compartidos) choques.push(`${familia}-${t}`);
      }
    }
    expect(choques, `tonos definidos dos veces: ${choques.join(', ')}`).toEqual([]);
  });
});
