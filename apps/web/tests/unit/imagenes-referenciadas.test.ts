/**
 * Ninguna página puede nombrar una imagen que no está.
 *
 * Una ruta rota en un `<Image>` **no rompe nada visible desde adentro**: el
 * typecheck pasa, el build sale en verde, la página se dibuja entera y lo único
 * que queda es un rectángulo gris. Por fuera sí se nota: `/_next/image`
 * contesta 400 y, si la imagen era el hero —con `priority`—, la foto más
 * grande de la página es un error.
 *
 * El 15/11/2026 había seis rutas así, nueve veces, **todas en las páginas en
 * inglés y en francés**: `/img/nosotros/1.jpg` y `/img/nosotros/jonatan.jpg`
 * (el hero y el retrato de `/en/nosotros`), `/img/asesorias/1.jpg` (el hero de
 * `/fr/asesorias`), `/img/servicios/principal/1.jpg` (el hero de
 * `/fr/diseno`), `/img/cursos/girgolas/1.jpg` —la carpeta se llama
 * `cultivo-girgolas`— y `/img/cursos/alquimia/1.jpg`, que nunca existió. Son
 * páginas traducidas a partir de las castellanas donde la ruta de la foto se
 * escribió de nuevo, a ojo, y nadie volvió a mirar: se descubrieron recién al
 * abrir `/fr/diseno` en un navegador y ver el 400 en la consola.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname, relative } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PUBLICO = join(RAIZ, 'public');

/** Todo archivo de código bajo una carpeta, sin entrar en node_modules ni .next. */
function fuentes(carpeta: string): string[] {
  const salida: string[] = [];
  for (const entrada of readdirSync(carpeta)) {
    if (entrada === 'node_modules' || entrada.startsWith('.')) continue;
    const camino = join(carpeta, entrada);
    if (statSync(camino).isDirectory()) salida.push(...fuentes(camino));
    else if (/\.(ts|tsx)$/.test(entrada)) salida.push(camino);
  }
  return salida;
}

// Una ruta de `public/` escrita entera, con su extensión. Lo que se arma por
// interpolación no se puede verificar acá y no se intenta.
const RUTA = /["'`](\/img\/[A-Za-z0-9_./()-]+\.(?:jpg|jpeg|JPG|png|webp|svg|avif))["'`]/g;

describe('las imágenes que nombra el código están en public/', () => {
  it('ninguna ruta de /img apunta a un archivo que no existe', () => {
    const faltan: string[] = [];
    for (const archivo of [...fuentes(join(RAIZ, 'app')), ...fuentes(join(RAIZ, 'components'))]) {
      const texto = readFileSync(archivo, 'utf8');
      for (const [, ruta] of texto.matchAll(RUTA)) {
        if (!existsSync(join(PUBLICO, ruta!.slice(1)))) {
          faltan.push(`${relative(RAIZ, archivo).replace(/\\/g, '/')} → ${ruta}`);
        }
      }
    }
    expect(faltan, `rutas de imagen rotas:\n  ${faltan.join('\n  ')}`).toEqual([]);
  });
});
