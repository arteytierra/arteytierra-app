/**
 * Las piezas que la portada sirve desde `public/` tienen que existir.
 *
 * Un `src` roto en un `<Image>` o en un `<video>` **no rompe nada**: el build
 * sale en verde, la página se dibuja entera y lo único que queda es un hueco
 * gris donde iba la obra. Es la misma familia de falla que ya mordió en esta
 * casa —la imagen de compartir de acequia con el titular viejo— y se tapa igual:
 * leyendo el archivo que escribe la ruta y mirando si el archivo está.
 *
 * Por eso las rutas no se escriben acá a mano: se sacan del componente. Un test
 * que tipea `/video/cisterna-tay-pichin.mp4` por su cuenta sigue pasando el día
 * que alguien renombra el archivo Y la constante, que es justo el día en que la
 * franja se queda vacía.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PUBLICO = (ruta: string) => join(RAIZ, 'public', ruta.replace(/^\//, ''));

const franja = readFileSync(join(RAIZ, 'components', 'home', 'FranjaObra.tsx'), 'utf8');
const diseno = readFileSync(join(RAIZ, 'app', 'diseno', 'page.tsx'), 'utf8');

/** Las rutas de `public/` que un archivo nombra entre comillas. */
function rutas(fuente: string): string[] {
  return [...fuente.matchAll(/'(\/(?:video|img)\/[^']+)'/g)].map(m => m[1]!);
}

describe('la franja de obra de la portada', () => {
  it('nombra la pieza y su póster, y los dos archivos están', () => {
    const nombradas = rutas(franja);
    expect(nombradas.length).toBeGreaterThanOrEqual(2);
    for (const ruta of nombradas) {
      expect(existsSync(PUBLICO(ruta)), `falta apps/web/public${ruta}`).toBe(true);
    }
  });

  it('corre una sola vez: sin `loop` no es un bucle, es un recorrido', () => {
    // El primer cuadro y el último difieren: la toma sube, se detiene a leer y
    // vuelve a bajar. Con `loop` saltaría del espejo de agua al vértice.
    // Se miran las líneas de código, no los comentarios, que hablan del tema.
    const codigo = franja.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(codigo).not.toMatch(/\bloop\b/);
  });

  it('el video pesa menos de 2,5 MB, que es lo que se descarga al llegar a la franja', () => {
    const mp4 = rutas(franja).find(r => r.endsWith('.mp4'));
    expect(mp4, 'la franja dejó de nombrar un .mp4').toBeDefined();
    const mb = statSync(PUBLICO(mp4!)).size / (1024 * 1024);
    expect(mb, `la pieza pesa ${mb.toFixed(2)} MB`).toBeLessThan(2.5);
  });
});

describe('las fotos de las áreas de trabajo de /diseno', () => {
  it('todas existen en public/', () => {
    const nombradas = rutas(diseno).filter(r => r.startsWith('/img/'));
    expect(nombradas.length).toBeGreaterThanOrEqual(5);
    for (const ruta of nombradas) {
      expect(existsSync(PUBLICO(ruta)), `falta apps/web/public${ruta}`).toBe(true);
    }
  });

  it('`#hidrologia` es un ancla de verdad y la portada apunta ahí', () => {
    // El `id` vivía en los datos y no llegaba al HTML: el enlace de la portada
    // caía al principio de la página y parecía que no hacía nada.
    expect(diseno).toMatch(/id=\{d\.id\}/);
    const portada = readFileSync(join(RAIZ, 'app', 'page.tsx'), 'utf8');
    expect(portada).toContain("'/diseno#hidrologia'");
  });
});
