/**
 * Renderiza y empaqueta la animación de la portada de acequia.app.
 *
 *   node scripts/portada.mjs            # entrega final
 *   node scripts/portada.mjs --prueba   # corte en baja, para aprobar el ritmo
 *
 * Deja en la carpeta de salida:
 *
 *   portada.webm            VP9, la fuente
 *   portada.mp4             H.264, el respaldo
 *   portada-poster.jpg      el ÚLTIMO cuadro, ≤ 150 KB
 *   portada-ultimo.png      el último cuadro sin comprimir
 *   portada-master.mp4      el maestro en 1080p, del que salen los otros
 *
 * La salida NO va al repo: cae en `C:\Arte y Tierra\Acequia\portada animacion\salida`.
 *
 * ── Por qué el póster es el último cuadro y no el primero ───────────────────
 * Porque el primero es gris y plano a propósito, y el póster es lo que ve
 * cualquiera con el autoplay bloqueado, con ahorro de datos, o en la vista
 * previa de un enlace compartido. La animación no es un loop: termina y se
 * queda quieta, así que lo que más se va a ver en la vida de esta página es el
 * último cuadro. Tiene que funcionar solo, como una foto.
 *
 * ── Los pesos ───────────────────────────────────────────────────────────────
 * El contrato de la portada dice ≤ 2,5 MB el archivo más pesado de la primera
 * pantalla. Son 14 s, así que el techo es ~1,4 Mbps contando todo. Por eso la
 * entrega sale a 1440×810 y no a 1080p: a ese caudal, 1080p se deshace en
 * bloques justo donde el video tiene que verse bien —el relieve, que es un
 * degradé grande y liso— y 1440 de ancho es más de lo que cualquier portada
 * muestra. El maestro sí queda en 1080p, que es de donde sale el póster.
 */
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');

const PRUEBA = process.argv.includes('--prueba');
const SALIDA = 'C:\\Arte y Tierra\\Acequia\\portada animacion\\salida';

/** El shim de ffmpeg de WinGet no siempre está en el PATH de quien corre esto. */
const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';
const ff = args => execFileSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'inherit'] });

const kb = f => (statSync(f).size / 1024).toFixed(0);
const mb = f => (statSync(f).size / 1024 / 1024).toFixed(2);

const principal = async () => {
  if (!existsSync(SALIDA)) mkdirSync(SALIDA, { recursive: true });

  process.stdout.write('Empaquetando…\n');
  const servidor = await bundle({
    entryPoint: path.join(RAIZ, 'src', 'index.ts'),
    publicDir: path.resolve(RAIZ, '..', '..', 'apps', 'terreno', 'public'),
  });

  const composicion = await selectComposition({ serveUrl: servidor, id: 'PortadaAcequia' });

  const comunes = {
    serveUrl: servidor,
    composition: composicion,
    // MapLibre es WebGL y el Chrome de Remotion arranca sin aceleración.
    chromiumOptions: { gl: 'angle' },
    // Una sola pestaña. Varias peleando por las mismas teselas devuelven
    // cuadros a medio cargar, que es el defecto más caro de encontrar porque
    // aparece en tres cuadros de cuatrocientos.
    concurrency: 1,
    timeoutInMilliseconds: 120_000,
  };

  if (PRUEBA) {
    const destino = path.join(SALIDA, 'prueba-ritmo.mp4');
    process.stdout.write('Corte de prueba (960×540)…\n');
    await renderMedia({ ...comunes, codec: 'h264', crf: 20, scale: 0.5, outputLocation: destino });
    process.stdout.write(`\n${destino}  ${mb(destino)} MB\n`);
    return;
  }

  const maestro = path.join(SALIDA, 'portada-master.mp4');
  process.stdout.write('Maestro (1920×1080)…\n');
  await renderMedia({ ...comunes, codec: 'h264', crf: 16, outputLocation: maestro });

  const ultimo = path.join(SALIDA, 'portada-ultimo.png');
  process.stdout.write('Último cuadro…\n');
  await renderStill({
    serveUrl: servidor,
    composition: composicion,
    chromiumOptions: { gl: 'angle' },
    timeoutInMilliseconds: 120_000,
    frame: composicion.durationInFrames - 1,
    imageFormat: 'png',
    output: ultimo,
  });

  const webm = path.join(SALIDA, 'portada.webm');
  const mp4 = path.join(SALIDA, 'portada.mp4');
  const poster = path.join(SALIDA, 'portada-poster.jpg');
  const ESCALA = 'scale=1440:-2';

  process.stdout.write('VP9, dos pasadas…\n');
  const vp9 = ['-row-mt', '1', '-b:v', '1150k', '-maxrate', '1500k', '-bufsize', '3000k',
    '-pix_fmt', 'yuv420p', '-an'];
  ff(['-v', 'error', '-y', '-i', maestro, '-vf', ESCALA, '-c:v', 'libvpx-vp9', ...vp9,
    '-pass', '1', '-passlogfile', path.join(SALIDA, 'vp9'), '-f', 'null', '-']);
  ff(['-v', 'error', '-y', '-i', maestro, '-vf', ESCALA, '-c:v', 'libvpx-vp9', ...vp9,
    '-pass', '2', '-passlogfile', path.join(SALIDA, 'vp9'), webm]);

  process.stdout.write('H.264 de respaldo…\n');
  ff(['-v', 'error', '-y', '-i', maestro, '-vf', ESCALA, '-c:v', 'libx264', '-preset', 'slow',
    '-b:v', '1250k', '-maxrate', '1600k', '-bufsize', '3200k', '-profile:v', 'high',
    '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', mp4]);

  process.stdout.write('Póster…\n');
  ff(['-v', 'error', '-y', '-i', ultimo, '-vf', 'scale=1440:-2', '-q:v', '6', poster]);

  process.stdout.write('\n');
  for (const f of [webm, mp4, poster, ultimo, maestro]) {
    const peso = statSync(f).size;
    const tope = f === poster ? 150 * 1024 : 2.5 * 1024 * 1024;
    const marca = f === maestro ? ' ' : peso <= tope ? '✓' : '✗';
    process.stdout.write(`${marca} ${path.basename(f).padEnd(22)} ${kb(f).padStart(6)} KB\n`);
  }
};

principal().catch(e => { console.error(e); process.exit(1); });
