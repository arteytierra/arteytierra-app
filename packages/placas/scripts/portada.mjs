/**
 * Renderiza, empaqueta y VERIFICA la animación de la portada de acequia.app.
 *
 *   node scripts/portada.mjs              # entrega final + verificación
 *   node scripts/portada.mjs --prueba     # corte en baja, para aprobar el ritmo
 *   node scripts/portada.mjs --verificar  # sólo medir lo que ya está escrito
 *
 * Deja en la carpeta de salida:
 *
 *   portada.webm            VP9, la fuente
 *   portada.mp4             H.264, el respaldo
 *   portada-poster.jpg      el ÚLTIMO cuadro, ≤ 150 KB
 *   portada-ultimo.png      el último cuadro suelto, sin comprimir
 *
 * La salida NO va al repo: cae en `C:\Arte y Tierra\Acequia\portada animacion\salida`.
 *
 * ── Por qué el póster es el último cuadro y no el primero ───────────────────
 * Porque el primero es gris y plano a propósito, y el póster es lo que ve
 * cualquiera con el autoplay bloqueado, con ahorro de datos, o en la vista
 * previa de un enlace compartido. La animación no es un loop: termina y se
 * queda quieta, así que lo que más se va a ver en la vida de esa página es el
 * último cuadro.
 *
 * ── Los pesos, que son un criterio y no un gusto ────────────────────────────
 * El techo es 2,5 MB el más pesado de los dos formatos. Son 14 s, así que el
 * caudal máximo es ~1,4 Mbps contando todo. Por eso el render final es 1280×720
 * y no 1080p: a ese caudal, 1080p obliga a un bitrate que bandea los degradados
 * del shader de elevación, que es justo lo que hay que ver. La regla del
 * contrato es explícita — si el degradado bandea, baja la resolución antes que
 * el bitrate.
 *
 * ── La verificación ─────────────────────────────────────────────────────────
 * El script no termina diciendo «listo»: corre `ffprobe` sobre lo que acaba de
 * escribir y comprueba duración, peso, resolución y **que no haya pista de
 * audio** (el criterio no pide audio en silencio: pide que no haya pista). Si
 * algo no entra, lo dice con el número medido al lado del tope. Un entregable
 * que incumple y nadie mide es un entregable que incumple en producción.
 */
import { existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');

const PRUEBA = process.argv.includes('--prueba');
const SOLO_VERIFICAR = process.argv.includes('--verificar');
const SALIDA = 'C:\\Arte y Tierra\\Acequia\\portada animacion\\salida';

/** El shim de ffmpeg de WinGet no siempre está en el PATH de quien corre esto. */
const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';
const FFPROBE = process.env.FFPROBE ?? 'ffprobe';
const ff = args => execFileSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'inherit'] });
const probe = args => execFileSync(FFPROBE, args, { encoding: 'utf8' }).trim();

const TOPE_VIDEO = 2_621_440;   // 2,5 MiB
const TOPE_POSTER = 153_600;    // 150 KiB

const kb = f => Math.round(statSync(f).size / 1024);

/** Lo que el contrato pide comprobar, medido sobre el archivo que se entrega. */
function verificar(archivo) {
  const dur = Number(probe(['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=nw=1:nk=1', archivo]));
  const wh = probe(['-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=width,height', '-of', 'csv=p=0:s=x', archivo]).replace(/x$/, '');
  const pistas = probe(['-v', 'error', '-show_entries', 'stream=codec_type',
    '-of', 'default=nw=1:nk=1', archivo]).split(/\r?\n/).filter(Boolean);
  return {
    dur, wh,
    audio: pistas.includes('audio'),
    bytes: statSync(archivo).size,
    kbps: Math.round((statSync(archivo).size * 8) / dur / 1000),
  };
}

const principal = async () => {
  if (!existsSync(SALIDA)) mkdirSync(SALIDA, { recursive: true });
  if (SOLO_VERIFICAR) { informe(); return; }

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
    // Una sola pestaña. Varias peleando por las mismas teselas devuelven cuadros
    // a medio cargar, que es el defecto más caro de encontrar porque aparece en
    // tres cuadros de cuatrocientos.
    concurrency: 1,
    timeoutInMilliseconds: 120_000,
  };

  if (PRUEBA) {
    const destino = path.join(SALIDA, 'prueba-ritmo.mp4');
    process.stdout.write('Corte de prueba…\n');
    await renderMedia({ ...comunes, codec: 'h264', crf: 20, outputLocation: destino });
    const v = verificar(destino);
    process.stdout.write(`\n${path.basename(destino)}  ${v.wh}  ${v.dur.toFixed(1)} s  ${kb(destino)} KB\n`);
    return;
  }

  // El maestro sale casi sin pérdida: de él salen los dos formatos y el póster,
  // y comprimir dos veces desde un maestro ya comprimido se nota en el shader.
  const maestro = path.join(SALIDA, 'portada-master.mp4');
  process.stdout.write('Maestro 1280×720…\n');
  await renderMedia({ ...comunes, codec: 'h264', crf: 12, outputLocation: maestro });

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

  // 1.050 kbps deja ~1,84 MB de video en 14 s y dos tercios de margen contra el
  // techo de 2,5 MB. Subirlo hasta rozar el tope ahorraría nada visible y
  // dejaría la entrega sin aire para un predio con más detalle.
  process.stdout.write('VP9, dos pasadas…\n');
  const vp9 = ['-row-mt', '1', '-b:v', '1050k', '-maxrate', '1400k', '-bufsize', '2800k',
    '-pix_fmt', 'yuv420p', '-an'];
  const bitacora = path.join(SALIDA, 'vp9');
  ff(['-v', 'error', '-y', '-i', maestro, '-c:v', 'libvpx-vp9', ...vp9,
    '-pass', '1', '-passlogfile', bitacora, '-f', 'null', '-']);
  ff(['-v', 'error', '-y', '-i', maestro, '-c:v', 'libvpx-vp9', ...vp9,
    '-pass', '2', '-passlogfile', bitacora, webm]);

  process.stdout.write('H.264 de respaldo…\n');
  ff(['-v', 'error', '-y', '-i', maestro, '-c:v', 'libx264', '-preset', 'veryslow',
    '-b:v', '1050k', '-maxrate', '1400k', '-bufsize', '2800k', '-profile:v', 'high',
    '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', mp4]);

  // El póster se busca por calidad hasta entrar en 150 KB. Fijar una calidad y
  // esperar que entre es lo que hace que un día entre y otro no.
  process.stdout.write('Póster…\n');
  let q = 4;
  for (; q <= 12; q++) {
    ff(['-v', 'error', '-y', '-i', ultimo, '-q:v', String(q), poster]);
    if (statSync(poster).size <= TOPE_POSTER) break;
  }

  for (const log of [`${bitacora}-0.log`, `${bitacora}-0.log.mbtree`]) {
    if (existsSync(log)) unlinkSync(log);
  }

  informe(q);
};

/**
 * Mide lo que hay escrito contra los topes del contrato.
 *
 * Está aparte del render y se puede correr sola con `--verificar`: comprobar un
 * entregable no tiene por qué costar diez minutos de Chrome headless, y un
 * entregable que incumple y nadie vuelve a medir es un entregable que incumple
 * en producción.
 */
function informe(calidadPoster) {
  const webm = path.join(SALIDA, 'portada.webm');
  const mp4 = path.join(SALIDA, 'portada.mp4');
  const poster = path.join(SALIDA, 'portada-poster.jpg');
  const ultimo = path.join(SALIDA, 'portada-ultimo.png');

  process.stdout.write('\n');
  let todoBien = true;
  const marca = ok => { if (!ok) todoBien = false; return ok ? '✓' : '✗'; };

  for (const f of [webm, mp4]) {
    const v = verificar(f);
    process.stdout.write(
      `${marca(v.bytes <= TOPE_VIDEO && v.dur >= 12 && v.dur <= 16 && v.wh === '1280x720' && !v.audio)} `
      + `${path.basename(f).padEnd(14)} ${v.wh}  ${v.dur.toFixed(2)} s  `
      + `${String(Math.round(v.bytes / 1024)).padStart(5)} KB  ${String(v.kbps).padStart(5)} kbps  `
      + `${v.audio ? 'CON PISTA DE AUDIO' : 'sin audio'}\n`);
  }
  process.stdout.write(
    `${marca(statSync(poster).size <= TOPE_POSTER)} ${'portada-poster.jpg'.padEnd(14)} `
    + `${probe(['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', poster]).replace(/x$/, '')}  `
    + `${calidadPoster ? `calidad ${calidadPoster}  ` : ''}${String(kb(poster)).padStart(5)} KB  (tope 150)\n`);
  process.stdout.write(`  ${'portada-ultimo.png'.padEnd(14)} ${String(kb(ultimo)).padStart(5)} KB  (el cuadro final suelto)\n`);

  process.stdout.write(`\n${todoBien ? 'Entra en todos los topes.' : 'HAY ALGO QUE NO ENTRA — ver arriba.'}\n`);
  if (!todoBien) process.exitCode = 1;
}

principal().catch(e => { console.error(e); process.exit(1); });
