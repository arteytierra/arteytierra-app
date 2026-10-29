/**
 * Un cuadro suelto de cualquier composición, para MIRARLO antes de renderizar.
 *
 *   node scripts/vistazo.mjs LecturaTodo 0 30 60 90
 *
 * Existe por una cuenta simple: la entrega entera son unos 1.650 cuadros y cada
 * uno espera a que el mapa termine de cargar, así que una corrida completa es
 * más de una hora. Equivocarse de encuadre o de color y enterarse al final
 * cuesta esa hora dos veces. Un cuadro suelto cuesta el mismo arranque de
 * Chrome y medio minuto, y contesta la única pregunta que importa antes de
 * largar: qué se ve.
 *
 * Los PNG caen en la carpeta de salida con el nombre `vistazo-<id>-<cuadro>`.
 * No son entregables: son para mirar y borrar.
 */
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');
// La carpeta la elige `--en=<ruta>`; por defecto, la del encargo en curso.
const SALIDA = (process.argv.find(a => a.startsWith('--en=')) ??
  '--en=C:/Arte y Tierra/Acequia/portada animacion/salida-encargo-04').slice(5);

const [id, ...cuadros] = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!id) {
  process.stdout.write('uso: node scripts/vistazo.mjs <Composicion> [cuadro…]\n');
  process.exit(1);
}

if (!existsSync(SALIDA)) mkdirSync(SALIDA, { recursive: true });

const servidor = await bundle({
  entryPoint: path.join(RAIZ, 'src', 'index.ts'),
  publicDir: path.resolve(RAIZ, '..', '..', 'apps', 'terreno', 'public'),
});
const composicion = await selectComposition({ serveUrl: servidor, id });

for (const c of cuadros.length ? cuadros : ['0']) {
  const frame = Math.min(composicion.durationInFrames - 1, Number(c));
  const salida = path.join(SALIDA, `vistazo-${id}-${frame}.png`);
  await renderStill({
    serveUrl: servidor, composition: composicion,
    chromiumOptions: { gl: 'angle' }, timeoutInMilliseconds: 180_000,
    frame, imageFormat: 'png', output: salida,
  });
  process.stdout.write(`${salida}\n`);
}
