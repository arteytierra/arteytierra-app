/**
 * Los maestros de las piezas A LA RESOLUCION DEL VIDEO: 1920×1080.
 *
 *   node scripts/video-1080.mjs                  las ocho
 *   node scripts/video-1080.mjs informe mesa     sólo esas
 *   node scripts/video-1080.mjs --prueba         treinta cuadros de cada una
 *   node scripts/video-1080.mjs --verificar      sólo medir lo que ya está escrito
 *
 * ── Por qué existe este guion y no un argumento de `piezas.mjs` ───────────
 *
 * Porque son dos entregas distintas con dos criterios opuestos, y mezclarlas
 * rompe una de las dos.
 *
 * Las piezas de `piezas.mjs` son para la PAGINA: 1280×720 y un tope de peso
 * por pieza, porque las carga un visitante por la red. Su informe exige
 * literalmente `v.wh === '1280x720'`. Si este guion escribiera encima de esos
 * maestros, la próxima corrida de `--recodificar` escribiría los dos formatos
 * de la web a 1920 y la verificación fallaría — después de haber pisado
 * archivos aprobados.
 *
 * Las de acá son para el MONTAJE: 1920×1080, crf 12, sin tope de peso, y no
 * las ve nadie salvo ffmpeg. Van al lado de las otras con el sufijo `-1080`.
 *
 * ── Qué cambia `scale` de verdad ──────────────────────────────────────────
 *
 * Remotion renderiza en un navegador: `scale: 1.5` no agranda la imagen, sube
 * la densidad de píxeles del navegador. La maquetación en píxeles CSS es
 * idéntica —nada se mueve de lugar— y todo lo que se DIBUJA (las curvas de
 * nivel, los rótulos, los bordes del predio, la tipografía del informe) se
 * dibuja con tres puntos donde antes había dos. Lo que no gana nada es la
 * ortofoto, que son teselas y tienen el detalle que tienen.
 *
 * Por eso esto NO es «rendirlo más grande por las dudas»: hasta hoy el montaje
 * tomaba 1280×720 y lo estiraba a 1920×1080 con lanczos, que es inventar un
 * píxel de cada tres a partir de los vecinos. Las líneas finas son justo donde
 * eso se nota.
 *
 * ── La obra es distinta: no sale de datos, sale de metraje ────────────────
 *
 * `obra.mjs` arma la pieza en tres pasos —el metraje de la toma del dron
 * corregido y escalado, la capa de líneas de Remotion con canal alfa, y el
 * pegado— y acá se hacen los tres a 1920×1080. El metraje gana de verdad: la
 * fuente es 3840×2160, así que hoy se la achica a 720 para después estirarla a
 * 1080. Y encima lleva **el aterrizaje**, que es lo que la vuelve
 * `obra-master-aterrizado.mp4`: ver `aterrizar()`.
 */
import { existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');
const BASE = 'C:\\Arte y Tierra\\Acequia\\portada animacion';
const CARPETAS = {
  '02': `${BASE}\\salida-encargo-02\\encargo 2 entrega 2`,
  '03': `${BASE}\\salida-encargo-03`,
  '04': `${BASE}\\salida-encargo-04`,
};
const TOMA = 'C:\\Users\\Usuario\\Pictures\\biopiscina\\DJI_0010.MOV';

const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';
const FFPROBE = process.env.FFPROBE ?? 'ffprobe';
const ff = args => execFileSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'inherit'] });
const probe = args => execFileSync(FFPROBE, args, { encoding: 'utf8' }).trim();

const ANCHO = 1920, ALTO = 1080, FPS = 30;
/** 1280×720 × 1,5 = 1920×1080. La única escala que da el cuadro entero. */
const ESCALA = 1.5;

/** Las banderas de color. Las mismas que la entrega web, por la misma razón. */
const COLOR = [
  '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-colorspace', 'bt709',
  '-color_primaries', 'bt709', '-color_trc', 'bt709',
];

/**
 * Las siete que renderiza Remotion. `cuadros` es lo que tiene que salir, y se
 * verifica: un render que se cayó a la mitad escribe un archivo más corto y
 * sin este número nadie se entera hasta que la voz no cierra con la imagen.
 */
const PIEZAS = {
  portada:             { id: 'PortadaPredio',    archivo: 'portada',            carpeta: '02', cuadros: 390 },
  'portada-giro':      { id: 'PortadaGiro',      archivo: 'portada-giro',       carpeta: '02', cuadros: 810 },
  'lectura-secuencia': { id: 'LecturaSecuencia', archivo: 'lectura-secuencia',  carpeta: '02', cuadros: 360 },
  'lectura-agua':      { id: 'LecturaAgua',      archivo: 'lectura-agua',       carpeta: '02', cuadros: 360 },
  mesa:                { id: 'MesaDeTrabajo',    archivo: 'mesa-de-trabajo',    carpeta: '03', cuadros: 480 },
  informe:             { id: 'Informe',          archivo: 'informe',            carpeta: '04', cuadros: 300 },
  // La octava no es un video: es el cuadro del terreno crudo, y el montaje le
  // hace un empuje lentísimo. `seg_foto` lo lleva primero a 3200 de ancho y
  // recién ahí recorta a 1920, así que lo que hace falta es el cuadro A 3200,
  // no a 1920: con 1920 el empuje volvería a inventar píxeles. 1600×900 × 2 da
  // 3200×1800 exacto y el `scale` del montaje queda sin nada que hacer.
  crudo:               { id: 'ParCrudoLeido',    archivo: 'crudo',              carpeta: '03', escala: 2, cuadro: 0, still: true },
};

/** La obra va aparte: no se renderiza, se arma. Ver `obra()`. */
const OBRA = {
  archivo: 'obra', carpeta: '04', cuadros: 439,
  // La arma ffmpeg, no Remotion, y el montaje consumía la versión aterrizada.
  ffmpeg: true, viejo: 'obra-master-aterrizado.mp4',
};

// ── El metraje de la obra, tal cual lo define obra.mjs ─────────────────────
const GRADO = "eq=brightness=0.06:contrast=1.22:saturation=1.25,"
  + "curves=all='0/0 0.25/0.33 0.75/0.82 1/1'";
const ESCALA_Y_FILO = `scale=${ANCHO}:${ALTO}:flags=lanczos,unsharp=5:5:0.5`;
const VERTICE_S = 19.0;
const SUBIDA = { desde: 0.3, hasta: VERTICE_S, dura: 5.0 };
const QUIETO = { dura: 5.5 };
const BAJADA = { desde: VERTICE_S, hasta: 47.1, dura: 3.5 };

/**
 * El aterrizaje: los cuadros 379 a 420 se disuelven en el ULTIMO cuadro y de
 * ahí hasta el 438 se sostiene. 439 cuadros en total.
 *
 * No está inventado: está medido contra `obra-master-aterrizado.mp4`,
 * comparando cada cuadro del aterrizado contra los últimos del maestro en
 * escala de grises. Hasta el 378 la correspondencia es la identidad; del 379
 * al 399 el cuadro que más se le parece sigue siendo el del maestro pero la
 * distancia crece parejo; del 400 al 419 el que más se le parece pasa a ser el
 * ULTIMO cuadro y la distancia baja parejo hasta cero; del 420 al 438 es el
 * último cuadro exacto. El cruce cae en el 399,5, que es el punto medio justo
 * entre 379 y 420: un disolver lineal, no una curva.
 *
 * Es lo que el nombre dice. La toma venía bajando y el corte la agarraba en
 * movimiento; así la imagen se posa y se queda quieta, y el plano puede
 * terminar sin que parezca que se cortó la cinta.
 */
const ATERRIZAJE = { desde: 379, hasta: 420, total: 439 };

const PRUEBA = process.argv.includes('--prueba');
const SOLO_VERIFICAR = process.argv.includes('--verificar');
const pedidas = process.argv.slice(2).filter(a => !a.startsWith('--'));
const elegidas = pedidas.length ? pedidas : [...Object.keys(PIEZAS), 'obra'];

const destinoDe = p => path.join(CARPETAS[p.carpeta],
  p.still ? `${p.archivo}-3200.png` : `${p.archivo}-master-1080.mp4`);

function medir(archivo) {
  const [width, height, pix, rango, matriz] = probe(['-v', 'error',
    '-select_streams', 'v:0', '-show_entries',
    'stream=width,height,pix_fmt,color_range,color_space',
    '-of', 'default=nw=1:nk=1', archivo]).split(/\r?\n/);
  // `nb_frames` no siempre viene; si falta, se cuentan de verdad.
  let cuadros = Number(probe(['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=nb_frames', '-of', 'default=nw=1:nk=1', archivo])
    .replace(/[^0-9]/g, ''));
  if (!cuadros) {
    cuadros = Number(probe(['-v', 'error', '-count_frames', '-select_streams', 'v:0',
      '-show_entries', 'stream=nb_read_frames', '-of', 'default=nw=1:nk=1', archivo])
      .replace(/[^0-9]/g, ''));
  }
  const pistas = probe(['-v', 'error', '-show_entries', 'stream=codec_type',
    '-of', 'default=nw=1:nk=1', archivo]).split(/\r?\n/).filter(Boolean);
  return {
    wh: `${width}x${height}`, pix, rango, matriz, cuadros,
    audio: pistas.includes('audio'), bytes: statSync(archivo).size,
  };
}

async function renderizar(clave, pieza, servidor) {
  const destino = destinoDe(pieza);
  const escala = pieza.escala ?? ESCALA;
  const composicion = await selectComposition({ serveUrl: servidor, id: pieza.id });

  if (pieza.still) {
    process.stdout.write(`  cuadro ${pieza.cuadro} a ×${escala}…\n`);
    await renderStill({
      serveUrl: servidor, composition: composicion,
      chromiumOptions: { gl: 'angle' }, timeoutInMilliseconds: 180_000,
      scale: escala, frame: pieza.cuadro, imageFormat: 'png', output: destino,
    });
    return;
  }

  // El corte de prueba son los primeros treinta cuadros. No es para mirar la
  // pieza: es para ver que el cuadro sale 1920×1080 y que nada se corrió de
  // lugar al subir la densidad, ANTES de pagar la corrida entera.
  const rango = PRUEBA ? { frameRange: [0, 29] } : {};
  process.stdout.write(`  ${PRUEBA ? 'prueba de 30 cuadros' : `${pieza.cuadros} cuadros`} a ×${escala}…\n`);
  await renderMedia({
    serveUrl: servidor, composition: composicion,
    chromiumOptions: { gl: 'angle' },
    concurrency: 1,
    timeoutInMilliseconds: 180_000,
    scale: escala,
    codec: 'h264', crf: 12,
    outputLocation: PRUEBA ? destino.replace(/\.mp4$/, '-prueba.mp4') : destino,
    ...rango,
  });
}

/** El metraje de los tres tramos, ya corregido y a 1920×1080. */
function metraje(destino) {
  const congelado = path.join(CARPETAS['04'], '_vertice-1080.png');
  ff(['-v', 'error', '-y', '-ss', String(VERTICE_S), '-i', TOMA, '-frames:v', '1',
    '-vf', `${GRADO},${ESCALA_Y_FILO}`, congelado]);
  const velSubida = (SUBIDA.hasta - SUBIDA.desde) / SUBIDA.dura;
  const velBajada = (BAJADA.hasta - BAJADA.desde) / BAJADA.dura;
  ff([
    '-v', 'error', '-y',
    '-ss', String(SUBIDA.desde), '-to', String(SUBIDA.hasta), '-i', TOMA,
    '-loop', '1', '-t', String(QUIETO.dura), '-i', congelado,
    '-ss', String(BAJADA.desde), '-to', String(BAJADA.hasta), '-i', TOMA,
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

/**
 * El disolver hacia el último cuadro, y el último cuadro sostenido.
 *
 * `tpad=stop_mode=clone` alarga la pieza hasta los 439 cuadros clonando el
 * último; el `blend` mezcla eso con el último cuadro suelto. Después del 420
 * el peso vale 1 y los dos lados son la misma imagen, así que el sostenido
 * sale exacto en vez de «casi».
 */
function aterrizar(entrada, salida) {
  const { desde, hasta, total } = ATERRIZAJE;
  const ultimo = path.join(CARPETAS['04'], '_ultimo-1080.png');
  const n = medir(entrada).cuadros;
  ff(['-v', 'error', '-y', '-i', entrada, '-vf', `select=eq(n\\,${n - 1})`,
    '-frames:v', '1', '-update', '1', ultimo]);
  const w = `clip((N-${desde})/${hasta - desde},0,1)`;
  ff(['-v', 'error', '-y', '-i', entrada, '-loop', '1', '-i', ultimo,
    '-filter_complex',
    '[0:v]tpad=stop_mode=clone:stop_duration=2[v];'
    + `[1:v]fps=${FPS},format=yuv420p,scale=${ANCHO}:${ALTO}[q];`
    + `[v][q]blend=all_expr='A*(1-${w})+B*${w}'[z]`,
    '-map', '[z]', '-frames:v', String(total),
    '-c:v', 'libx264', '-crf', '12', '-preset', 'medium', ...COLOR, '-an', salida]);
  unlinkSync(ultimo);
}

async function obra(servidor) {
  const destino = destinoDe(OBRA);
  const base = path.join(CARPETAS['04'], '_obra-base-1080.mp4');
  const capa = path.join(CARPETAS['04'], '_obra-capa-1080.mov');
  const pegado = path.join(CARPETAS['04'], '_obra-pegado-1080.mp4');

  process.stdout.write('  metraje 3840×2160 → 1920×1080…\n');
  metraje(base);

  process.stdout.write(`  capa de líneas a ×${ESCALA} (ProRes 4444, con alfa)…\n`);
  const composicion = await selectComposition({ serveUrl: servidor, id: 'CapaObra' });
  await renderMedia({
    serveUrl: servidor, composition: composicion,
    codec: 'prores', proResProfile: '4444',
    pixelFormat: 'yuva444p10le', imageFormat: 'png',
    scale: ESCALA, concurrency: 1, timeoutInMilliseconds: 180_000,
    outputLocation: capa,
    ...(PRUEBA ? { frameRange: [0, 29] } : {}),
  });
  if (PRUEBA) { process.stdout.write(`  (prueba: queda en ${capa})\n`); return; }

  process.stdout.write('  pegado…\n');
  ff(['-v', 'error', '-y', '-i', base, '-i', capa, '-filter_complex',
    '[0:v][1:v]overlay=0:0:format=auto[v]', '-map', '[v]',
    '-c:v', 'libx264', '-crf', '12', '-preset', 'medium', ...COLOR, '-an', pegado]);

  process.stdout.write('  aterrizaje…\n');
  aterrizar(pegado, destino);
  for (const f of [base, capa, pegado]) if (existsSync(f)) unlinkSync(f);
}

/**
 * El etiquetado de color no se compara contra una constante: se compara contra
 * **el archivo que el montaje ya venía consumiendo**, que es el que dejó el
 * video aprobado. Esto importa porque hay dos caminos y producen dos cosas
 * distintas, las dos correctas:
 *
 *   · lo que encodea Remotion sale `yuvj420p pc bt470bg`
 *   · lo que armamos acá con ffmpeg sale `yuv420p tv bt709` (ver COLOR)
 *
 * Exigirles bt709 a las piezas de Remotion —como hacía la primera versión de
 * esta función— es pedirle al render un etiquetado que nunca produjo: marcaba
 * mal siete archivos que estaban bien. Lo que de verdad hay que garantizar es
 * que el camino de conversión del montaje no cambie, o sea que la pieza nueva
 * esté etiquetada igual que la vieja. Si la vieja no está, se cae a la pareja
 * declarada según quién encodeó.
 */
function colorEsperado(pieza, v) {
  const viejo = path.join(CARPETAS[pieza.carpeta], pieza.viejo ?? `${pieza.archivo}-master.mp4`);
  if (existsSync(viejo)) {
    const w = medir(viejo);
    return v.pix === w.pix && v.rango === w.rango && v.matriz === w.matriz;
  }
  return pieza.ffmpeg
    ? v.pix === 'yuv420p' && v.rango === 'tv' && v.matriz === 'bt709'
    : v.pix === 'yuvj420p' && v.rango === 'pc' && v.matriz === 'bt470bg';
}

function informe() {
  let todoBien = true;
  const marca = ok => { if (!ok) todoBien = false; return ok ? '\u2713' : '\u2717'; };
  process.stdout.write('\n');
  for (const clave of elegidas) {
    const pieza = clave === 'obra' ? OBRA : PIEZAS[clave];
    if (!pieza) continue;
    const f = destinoDe(pieza);
    if (!existsSync(f)) { process.stdout.write(`  ${marca(false)} falta ${path.basename(f)}\n`); continue; }
    const v = medir(f);
    if (pieza.still) {
      process.stdout.write(`  ${marca(v.wh === '3200x1800')} ${path.basename(f).padEnd(30)} ${v.wh}  `
        + `${String(Math.round(v.bytes / 1024)).padStart(6)} KB\n`);
      continue;
    }
    const colorOk = colorEsperado(pieza, v);
    const ok = v.wh === `${ANCHO}x${ALTO}` && v.cuadros === pieza.cuadros && !v.audio && colorOk;
    process.stdout.write(`  ${marca(ok)} ${path.basename(f).padEnd(30)} ${v.wh}  `
      + `${String(v.cuadros).padStart(4)}/${pieza.cuadros} cuadros  `
      + `${String(Math.round(v.bytes / 1024 / 1024)).padStart(4)} MB  `
      + `${v.pix} ${v.rango} ${v.matriz}  ${v.audio ? 'CON AUDIO' : 'sin audio'}\n`);
  }
  process.stdout.write(`\n${todoBien ? 'Las ocho están a la resolución del video.' : 'HAY ALGO MAL — ver arriba.'}\n`);
  if (!todoBien) process.exitCode = 1;
}

const principal = async () => {
  for (const d of Object.values(CARPETAS)) if (!existsSync(d)) mkdirSync(d, { recursive: true });
  if (SOLO_VERIFICAR) { informe(); return; }
  if (!existsSync(TOMA) && elegidas.includes('obra')) {
    throw new Error(`no está la toma de la obra: ${TOMA}`);
  }

  process.stdout.write('Empaquetando…\n');
  const servidor = await bundle({
    entryPoint: path.join(RAIZ, 'src', 'index.ts'),
    publicDir: path.resolve(RAIZ, '..', '..', 'apps', 'terreno', 'public'),
  });

  for (const clave of elegidas) {
    if (clave === 'obra') {
      process.stdout.write('\nobra · metraje + CapaObra\n');
      await obra(servidor);
      continue;
    }
    const pieza = PIEZAS[clave];
    if (!pieza) { process.stdout.write(`(no existe la pieza «${clave}»)\n`); continue; }
    process.stdout.write(`\n${clave} · ${pieza.id}\n`);
    await renderizar(clave, pieza, servidor);
  }

  if (!PRUEBA) informe();
};

principal().catch(e => { console.error(e); process.exit(1); });
