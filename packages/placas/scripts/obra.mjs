/**
 * ENCARGO 04 · B — «De la hoja al predio»: la obra que existe.
 *
 *   node scripts/obra.mjs --prueba     corte en baja, para aprobar el ritmo
 *   node scripts/obra.mjs              la pieza, sus dos formatos y el póster
 *   node scripts/obra.mjs --calce      un cuadro suelto con el trazado encima
 *
 * Es la única pieza del repertorio que parte de metraje y no de datos, así que
 * el reparto del trabajo es el de la skill: **FFmpeg hace lo mecánico con la
 * toma y Remotion dibuja**. Remotion rinde sólo la capa de líneas, con fondo
 * transparente (`CapaObra`, ProRes 4444), y acá se la pega encima de la toma ya
 * corregida de color.
 *
 * ── La toma, y de dónde sale cada tramo ───────────────────────────────────
 *
 * `DJI_0010.MOV` son 47,13 s: arranca pegada al agua de la cisterna, sube en
 * vertical hasta abrir sobre toda la escuela y vuelve a bajar. Los catorce
 * segundos de la pieza salen así:
 *
 *   0,0 – 5,0 s   la subida, de 0,3 a 19,0 s de la toma, a 3,74×
 *   5,0 – 10,5 s  el vértice, CONGELADO, con la lectura dibujándose encima
 *  10,5 – 14,0 s  la bajada, de 19,0 a 47,1 s de la toma, a 8,03×
 *
 * **Por qué el vértice va congelado.** Porque el trazado está hecho sobre UN
 * cuadro y tiene que calzar con lo que hay debajo. La toma en el vértice no
 * está quieta del todo —es su momento más quieto, medido: la diferencia media
 * entre cuadros consecutivos cae a 2,76 ahí contra 4,3 un segundo antes y 4,5
 * uno después, pero no es cero—, y cinco segundos y medio de deriva sacarían
 * las líneas de encima de los techos. Seguir la deriva pediría estimar una
 * transformación por cuadro sobre el metraje; congelar es la misma imagen sin
 * una sola suposición, y el movimiento lo ponen las líneas, que es de lo que
 * trata el tramo. El corte de entrada y el de salida caen los dos en el cuadro
 * 19,0, así que no hay salto: la imagen se detiene y vuelve a arrancar donde
 * estaba.
 *
 * ── El color, que ya viene bien y no hay que romper ───────────────────────
 *
 * La fuente es yuv420p, rango tv y bt709: la combinación segura, al revés que
 * los masters renderizados del encargo 02. La corrección es la que pidió el
 * encargo y no toca el espacio de color; las banderas van explícitas en los dos
 * codecs igual, y se verifican sobre el archivo escrito.
 *
 * ── Qué NO hace esta pieza ────────────────────────────────────────────────
 *
 * No muestra litros. No hay escala: el MOV no trae altura de vuelo —un solo
 * flujo, sin telemetría— y el único metadato espacial es su `©xyz`, cuyo tercer
 * campo (−2,0 m) no es la altura de la cámara. Un área trazada a ojo
 * multiplicada por una lluvia real da litros falsos con cara de medidos. Ver la
 * cabecera de `src/composiciones/obra/trazado.ts` y el documento de la entrega.
 */
import { existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');
const SALIDA = 'C:\\Arte y Tierra\\Acequia\\portada animacion\\salida-encargo-04';
const FUENTE = 'C:\\Users\\Usuario\\Pictures\\biopiscina\\DJI_0010.MOV';

const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';
const FFPROBE = process.env.FFPROBE ?? 'ffprobe';
const ff = args => execFileSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'inherit'] });
const probe = args => execFileSync(FFPROBE, args, { encoding: 'utf8' }).trim();

const MiB = 1024 * 1024;
const TOPE = 2.2 * MiB;
const KBPS = 1150;
const ANCHO = 1280, ALTO = 720, FPS = 30;

/** La corrección de color que pidió el encargo, tal cual. */
const GRADO = "eq=brightness=0.06:contrast=1.22:saturation=1.25,"
  + "curves=all='0/0 0.25/0.33 0.75/0.82 1/1'";
/** El enfoque va DESPUÉS de escalar: enfocar a 3840 y después achicar lo tira. */
const ESCALA_Y_FILO = `scale=${ANCHO}:${ALTO}:flags=lanczos,unsharp=5:5:0.5`;

/** El instante más quieto de la toma. Medido, no elegido: ver la cabecera. */
const VERTICE_S = 19.0;
const SUBIDA = { desde: 0.3, hasta: VERTICE_S, dura: 5.0 };
const QUIETO = { dura: 5.5 };
const BAJADA = { desde: VERTICE_S, hasta: 47.1, dura: 3.5 };

/** Las banderas de color, idénticas en los dos codecs. */
const COLOR = [
  '-pix_fmt', 'yuv420p',
  '-color_range', 'tv',
  '-colorspace', 'bt709',
  '-color_primaries', 'bt709',
  '-color_trc', 'bt709',
];

const PRUEBA = process.argv.includes('--prueba');
const CALCE = process.argv.includes('--calce');

function medir(archivo) {
  const campos = probe(['-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=width,height,pix_fmt,color_range,color_space',
    '-of', 'default=nw=1:nk=1', archivo]).split(/\r?\n/);
  const [width, height, pix, rango, matriz] = campos;
  const dur = Number(probe(['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=nw=1:nk=1', archivo]));
  const pistas = probe(['-v', 'error', '-show_entries', 'stream=codec_type',
    '-of', 'default=nw=1:nk=1', archivo]).split(/\r?\n/).filter(Boolean);
  const bytes = statSync(archivo).size;
  return {
    wh: `${width}x${height}`, dur, pix, rango, matriz,
    audio: pistas.includes('audio'), bytes,
    kbps: Math.round((bytes * 8) / dur / 1000),
  };
}

/**
 * El metraje de los tres tramos, ya corregido y a 1280×720, sin una línea
 * encima. `-an` desde el primer paso: la fuente no tiene audio y el encargo
 * tampoco lo quiere, así que no hay ningún momento en que pueda colarse.
 */
function metraje(destino) {
  const congelado = path.join(SALIDA, '_vertice.png');
  ff(['-v', 'error', '-y', '-ss', String(VERTICE_S), '-i', FUENTE, '-frames:v', '1',
    '-vf', `${GRADO},${ESCALA_Y_FILO}`, congelado]);

  const velSubida = (SUBIDA.hasta - SUBIDA.desde) / SUBIDA.dura;
  const velBajada = (BAJADA.hasta - BAJADA.desde) / BAJADA.dura;
  process.stdout.write(`  subida ×${velSubida.toFixed(2)} · bajada ×${velBajada.toFixed(2)}\n`);

  ff([
    '-v', 'error', '-y',
    '-ss', String(SUBIDA.desde), '-to', String(SUBIDA.hasta), '-i', FUENTE,
    '-loop', '1', '-t', String(QUIETO.dura), '-i', congelado,
    '-ss', String(BAJADA.desde), '-to', String(BAJADA.hasta), '-i', FUENTE,
    '-filter_complex',
    `[0:v]${GRADO},${ESCALA_Y_FILO},setpts=PTS/${velSubida},fps=${FPS}[a];`
    + `[1:v]fps=${FPS},format=yuv420p[b];`
    + `[2:v]${GRADO},${ESCALA_Y_FILO},setpts=PTS/${velBajada},fps=${FPS}[c];`
    + '[a][b][c]concat=n=3:v=1:a=0[v]',
    '-map', '[v]', '-c:v', 'libx264', '-crf', '12', '-preset', 'medium',
    ...COLOR, '-an', destino,
  ]);
  unlinkSync(congelado);
}

/** Pega la capa de líneas encima del metraje. */
function pegar(base, capa, destino, crf = 12) {
  ff([
    '-v', 'error', '-y', '-i', base, '-i', capa,
    '-filter_complex', '[0:v][1:v]overlay=0:0:format=auto[v]',
    '-map', '[v]', '-c:v', 'libx264', '-crf', String(crf), '-preset', 'medium',
    ...COLOR, '-an', destino,
  ]);
}

async function main() {
  if (!existsSync(SALIDA)) mkdirSync(SALIDA, { recursive: true });
  if (!existsSync(FUENTE)) throw new Error(`no está la toma: ${FUENTE}`);

  process.stdout.write('Empaquetando…\n');
  const servidor = await bundle({
    entryPoint: path.join(RAIZ, 'src', 'index.ts'),
    publicDir: path.resolve(RAIZ, '..', '..', 'apps', 'terreno', 'public'),
  });
  const composicion = await selectComposition({ serveUrl: servidor, id: 'CapaObra' });

  // ── El control de calce ────────────────────────────────────────────────
  //
  // Un cuadro del trazado encima del cuadro del vértice, para mirar si las
  // líneas caen sobre los techos. Es la verificación que no se puede saltear:
  // un trazado corrido tres metros no se nota en el JSON, se nota en la pieza
  // publicada.
  if (CALCE) {
    const png = path.join(SALIDA, '_calce-lineas.png');
    await renderStill({
      serveUrl: servidor, composition: composicion,
      frame: 300, imageFormat: 'png', output: png,
    });
    const fondo = path.join(SALIDA, '_calce-fondo.png');
    ff(['-v', 'error', '-y', '-ss', String(VERTICE_S), '-i', FUENTE, '-frames:v', '1',
      '-vf', `${GRADO},${ESCALA_Y_FILO}`, fondo]);
    const calce = path.join(SALIDA, 'control-calce.png');
    ff(['-v', 'error', '-y', '-i', fondo, '-i', png,
      '-filter_complex', '[0:v][1:v]overlay=0:0', '-frames:v', '1', calce]);
    for (const f of [png, fondo]) if (existsSync(f)) unlinkSync(f);
    process.stdout.write(`  ${calce}\n`);
    return;
  }

  process.stdout.write('Metraje…\n');
  const base = path.join(SALIDA, '_obra-base.mp4');
  metraje(base);

  process.stdout.write('Capa de líneas (ProRes 4444, con alfa)…\n');
  const capa = path.join(SALIDA, '_obra-capa.mov');
  await renderMedia({
    serveUrl: servidor, composition: composicion,
    codec: 'prores', proResProfile: '4444',
    // El alfa necesita las DOS cosas: el formato de pixel con canal y PNG como
    // formato de cuadro. Con JPEG —el default— Remotion rechaza el pixel
    // format y no renderiza nada.
    pixelFormat: 'yuva444p10le',
    imageFormat: 'png',
    outputLocation: capa,
  });

  if (PRUEBA) {
    const destino = path.join(SALIDA, 'prueba-obra.mp4');
    pegar(base, capa, destino, 26);
    const v = medir(destino);
    process.stdout.write(`  ${path.basename(destino)}  ${v.wh}  ${v.dur.toFixed(2)} s  `
      + `${Math.round(v.bytes / 1024)} KB\n`);
    return;
  }

  process.stdout.write('Maestro…\n');
  const maestro = path.join(SALIDA, 'obra-master.mp4');
  pegar(base, capa, maestro, 12);

  // El póster es el PRIMER cuadro ya corregido, como pide el encargo: la toma
  // cruda pegada al agua, que es con lo que la pieza abre.
  process.stdout.write('Póster…\n');
  const poster = path.join(SALIDA, 'obra-poster.jpg');
  for (let q = 3; q <= 14; q++) {
    ff(['-v', 'error', '-y', '-i', maestro, '-frames:v', '1', '-q:v', String(q), poster]);
    if (statSync(poster).size <= 150 * 1024) break;
  }

  const b = `${KBPS}k`, techo = `${Math.round(KBPS * 1.35)}k`, buf = `${KBPS * 2}k`;
  const webm = path.join(SALIDA, 'obra.webm');
  const mp4 = path.join(SALIDA, 'obra.mp4');

  process.stdout.write('VP9, dos pasadas…\n');
  const bitacora = path.join(SALIDA, 'vp9-obra');
  const vp9 = ['-c:v', 'libvpx-vp9', '-row-mt', '1', '-b:v', b, '-maxrate', techo,
    '-bufsize', buf, ...COLOR, '-an'];
  ff(['-v', 'error', '-y', '-i', maestro, ...vp9, '-pass', '1', '-passlogfile', bitacora, '-f', 'null', '-']);
  ff(['-v', 'error', '-y', '-i', maestro, ...vp9, '-pass', '2', '-passlogfile', bitacora, webm]);

  process.stdout.write('H.264…\n');
  ff(['-v', 'error', '-y', '-i', maestro, '-c:v', 'libx264', '-preset', 'veryslow',
    '-b:v', b, '-maxrate', techo, '-bufsize', buf, '-profile:v', 'high',
    ...COLOR, '-an', '-movflags', '+faststart', mp4]);

  for (const f of [`${bitacora}-0.log`, `${bitacora}-0.log.mbtree`, base, capa]) {
    if (existsSync(f)) unlinkSync(f);
  }

  process.stdout.write('\n');
  let todoBien = true;
  for (const f of [webm, mp4]) {
    const v = medir(f);
    const colorOk = v.pix === 'yuv420p' && v.rango === 'tv' && v.matriz === 'bt709';
    const ok = v.bytes <= TOPE && !v.audio && v.wh === `${ANCHO}x${ALTO}` && colorOk;
    if (!ok) todoBien = false;
    process.stdout.write(
      `  ${ok ? '✓' : '✗'} ${path.basename(f).padEnd(14)} ${v.wh}  ${v.dur.toFixed(2)} s  `
      + `${String(Math.round(v.bytes / 1024)).padStart(5)} KB / ${Math.round(TOPE / 1024)}  `
      + `${String(v.kbps).padStart(5)} kbps  ${v.pix} ${v.rango} ${v.matriz}  `
      + `${v.audio ? 'CON AUDIO' : 'sin audio'}\n`);
  }
  const pOk = statSync(poster).size <= 150 * 1024;
  if (!pOk) todoBien = false;
  process.stdout.write(`  ${pOk ? '✓' : '✗'} ${path.basename(poster).padEnd(14)} `
    + `${String(Math.round(statSync(poster).size / 1024)).padStart(5)} KB / 150  (el primer cuadro)\n`);
  process.stdout.write(`\n${todoBien ? 'Entra en todos los topes.' : 'HAY ALGO QUE NO ENTRA.'}\n`);
  if (!todoBien) process.exitCode = 1;
}
main().catch(e => { console.error(e); process.exit(1); });
