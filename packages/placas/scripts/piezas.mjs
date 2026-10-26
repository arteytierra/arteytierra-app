/**
 * Renderiza, codifica y VERIFICA las cinco piezas del encargo 02.
 *
 *   node scripts/piezas.mjs                 # todo
 *   node scripts/piezas.mjs portada         # una sola
 *   node scripts/piezas.mjs --prueba        # cortes en baja de A y B, para el ritmo
 *   node scripts/piezas.mjs --verificar     # sólo medir lo que ya está escrito
 *
 * La salida NO va al repo: cae en
 * `C:\Arte y Tierra\Acequia\portada animacion\salida-encargo-02`.
 *
 * ── El espacio de color, que ya rompió una vez ─────────────────────────────
 * La WebM de la primera entrega salió en rango COMPLETO con matriz bt470bg.
 * ffmpeg la decodificaba entera sin una queja y Chromium moría en el primer
 * cuadro con PIPELINE_ERROR_DECODE. Y la lista de `<source>` no salva: el
 * navegador cambia de archivo cuando uno no CARGA, no cuando falla a mitad de
 * la decodificación. Por eso las banderas de color van explícitas en los dos
 * codecs y por eso se verifican después, sobre el archivo escrito.
 *
 * ── Por qué B lleva un fotograma clave cada cinco ──────────────────────────
 * Porque se recorre cambiando `currentTime` desde la página. Al buscar, el
 * decodificador tiene que volver al fotograma clave anterior y reconstruir
 * desde ahí: con claves cada dos segundos eso son sesenta cuadros de trabajo
 * por cada salto y se ve a los tirones. Cada cinco cuesta peso —por eso 720p y
 * ocho segundos— y se mide acá abajo, cuadro por cuadro.
 */
import { existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');
const SALIDA = 'C:\\Arte y Tierra\\Acequia\\portada animacion\\salida-encargo-02';

const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';
const FFPROBE = process.env.FFPROBE ?? 'ffprobe';
const ff = args => execFileSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'inherit'] });
const probe = args => execFileSync(FFPROBE, args, { encoding: 'utf8' }).trim();

const MiB = 1024 * 1024;

/**
 * `poster: 'ultimo'` en la portada y `'primero'` en las lecturas, y la
 * diferencia no es un detalle. La portada no hace loop: termina y se queda, así
 * que lo que más se va a ver en la vida de esa página es su último cuadro. Las
 * cuatro lecturas arrancan en el estado «Relieve», que es el que el visitante
 * tiene que ver antes de empezar a bajar.
 */
const PIEZAS = {
  portada: {
    id: 'PortadaPredio', archivo: 'portada', kbps: 1050, tope: 2.5 * MiB,
    poster: 'ultimo', cuadroSuelto: true,
  },
  lecturas: {
    id: 'CuatroLecturas', archivo: 'cuatro-lecturas', kbps: 2200, tope: 3 * MiB,
    poster: 'primero', gop: 5,
  },
  'lazo-perimetro': { id: 'LazoPerimetro', archivo: 'lazo-perimetro', kbps: 950, tope: 900 * 1024, lazo: true },
  'lazo-giro':      { id: 'LazoGiro',      archivo: 'lazo-giro',      kbps: 950, tope: 900 * 1024, lazo: true },
  'lazo-agua':      { id: 'LazoAgua',      archivo: 'lazo-agua',      kbps: 950, tope: 900 * 1024, lazo: true },
};

const PRUEBA = process.argv.includes('--prueba');
const SOLO_VERIFICAR = process.argv.includes('--verificar');
const pedidas = process.argv.slice(2).filter(a => !a.startsWith('--'));
const elegidas = pedidas.length ? pedidas : Object.keys(PIEZAS);

/** Las banderas de color, idénticas en los dos codecs. Ver la cabecera. */
const COLOR = [
  '-pix_fmt', 'yuv420p',
  '-color_range', 'tv',
  '-colorspace', 'bt709',
  '-color_primaries', 'bt709',
  '-color_trc', 'bt709',
];

const kb = f => Math.round(statSync(f).size / 1024);

function medir(archivo) {
  const campos = probe(['-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=width,height,pix_fmt,color_range,color_space,color_primaries',
    '-of', 'default=nw=1:nk=1', archivo]).split(/\r?\n/);
  const [width, height, pix, rango, matriz, primarios] = campos;
  const dur = Number(probe(['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=nw=1:nk=1', archivo]));
  const pistas = probe(['-v', 'error', '-show_entries', 'stream=codec_type',
    '-of', 'default=nw=1:nk=1', archivo]).split(/\r?\n/).filter(Boolean);
  const bytes = statSync(archivo).size;
  return {
    wh: `${width}x${height}`, dur, pix, rango, matriz, primarios,
    audio: pistas.includes('audio'), bytes,
    kbps: Math.round((bytes * 8) / dur / 1000),
  };
}

/** El hueco más largo entre fotogramas clave, en cuadros. */
function gopMaximo(archivo) {
  const claves = probe(['-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'frame=key_frame', '-of', 'csv=p=0', archivo]).split(/\r?\n/).filter(Boolean);
  let peor = 0, desde = -1;
  claves.forEach((k, i) => {
    if (k.trim() !== '1') return;
    if (desde >= 0) peor = Math.max(peor, i - desde);
    desde = i;
  });
  if (desde >= 0) peor = Math.max(peor, claves.length - desde);
  return { peor, cuadros: claves.length };
}

/**
 * Cuánto salta el bucle: la diferencia media de luminancia entre el último
 * cuadro y el primero.
 *
 * Es la única forma honesta de comprobar «cierra sin salto». El criterio decía
 * «primer y último fotograma idénticos», que si se cumple al pie de la letra
 * mete dos cuadros iguales seguidos y produce una trabita de 1/30 s en cada
 * vuelta. Lo que importa es que el cuadro siguiente al último sea el primero,
 * y eso se mide así: si la pieza es periódica, la diferencia entre las dos
 * puntas es la de un cuadro cualquiera con el que le sigue.
 */
function saltoDelBucle(archivo, tmp) {
  const primero = path.join(tmp, 'bucle-0.png');
  const ultimo = path.join(tmp, 'bucle-n.png');
  ff(['-v', 'error', '-y', '-i', archivo, '-vf', 'select=eq(n\\,0)', '-frames:v', '1', primero]);
  ff(['-v', 'error', '-y', '-sseof', '-0.05', '-i', archivo, '-frames:v', '1', '-update', '1', ultimo]);
  const salida = execFileSync(FFMPEG, [
    '-v', 'error', '-i', primero, '-i', ultimo,
    '-filter_complex', '[0:v][1:v]blend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG',
    '-f', 'null', '-',
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const texto = salida.toString();
  const m = /YAVG=([\d.]+)/.exec(texto);
  for (const f of [primero, ultimo]) if (existsSync(f)) unlinkSync(f);
  return m ? Number(m[1]) : NaN;
}

async function renderizar(clave, pieza, servidor) {
  const composicion = await selectComposition({ serveUrl: servidor, id: pieza.id });
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
    const destino = path.join(SALIDA, `prueba-${pieza.archivo}.mp4`);
    process.stdout.write(`  corte de prueba…\n`);
    await renderMedia({ ...comunes, codec: 'h264', crf: 24, scale: 0.5, outputLocation: destino });
    const v = medir(destino);
    process.stdout.write(`  ${path.basename(destino)}  ${v.wh}  ${v.dur.toFixed(1)} s  ${kb(destino)} KB\n`);
    return;
  }

  // El maestro sale casi sin pérdida: de él salen los dos formatos y el póster.
  // Comprimir dos veces desde un maestro ya comprimido se nota en el verde del
  // monte, que es casi todo el cuadro.
  const maestro = path.join(SALIDA, `${pieza.archivo}-master.mp4`);
  process.stdout.write(`  maestro…\n`);
  await renderMedia({ ...comunes, codec: 'h264', crf: 12, outputLocation: maestro });

  const cuadroPoster = pieza.poster === 'ultimo' ? composicion.durationInFrames - 1 : 0;
  const png = path.join(SALIDA, `${pieza.archivo}-poster.png`);
  if (pieza.poster) {
    process.stdout.write(`  cuadro del póster (${pieza.poster})…\n`);
    await renderStill({
      serveUrl: servidor, composition: composicion,
      chromiumOptions: { gl: 'angle' }, timeoutInMilliseconds: 120_000,
      frame: cuadroPoster, imageFormat: 'png', output: png,
    });
  }

  const webm = path.join(SALIDA, `${pieza.archivo}.webm`);
  const mp4 = path.join(SALIDA, `${pieza.archivo}.mp4`);
  const b = `${pieza.kbps}k`;
  const techo = `${Math.round(pieza.kbps * 1.35)}k`;
  const gop = pieza.gop ? ['-g', String(pieza.gop), '-keyint_min', String(pieza.gop)] : [];

  process.stdout.write(`  VP9, dos pasadas…\n`);
  const bitacora = path.join(SALIDA, `vp9-${pieza.archivo}`);
  const vp9 = ['-c:v', 'libvpx-vp9', '-row-mt', '1', '-b:v', b, '-maxrate', techo,
    '-bufsize', `${pieza.kbps * 2}k`, ...gop, ...COLOR, '-an'];
  ff(['-v', 'error', '-y', '-i', maestro, ...vp9, '-pass', '1', '-passlogfile', bitacora, '-f', 'null', '-']);
  ff(['-v', 'error', '-y', '-i', maestro, ...vp9, '-pass', '2', '-passlogfile', bitacora, webm]);

  process.stdout.write(`  H.264…\n`);
  ff(['-v', 'error', '-y', '-i', maestro, '-c:v', 'libx264', '-preset', 'veryslow',
    '-b:v', b, '-maxrate', techo, '-bufsize', `${pieza.kbps * 2}k`, '-profile:v', 'high',
    ...gop, ...(pieza.gop ? ['-x264-params', 'scenecut=0'] : []), ...COLOR,
    '-an', '-movflags', '+faststart', mp4]);

  if (pieza.poster) {
    // La calidad del JPEG SE BUSCA hasta entrar en el tope. Fijar una calidad y
    // esperar que entre es lo que hace que un día entre y otro no.
    const poster = path.join(SALIDA, `${pieza.archivo}-poster.jpg`);
    for (let q = 4; q <= 14; q++) {
      ff(['-v', 'error', '-y', '-i', png, '-q:v', String(q), poster]);
      if (statSync(poster).size <= 150 * 1024) break;
    }
  }
  if (!pieza.cuadroSuelto && existsSync(png)) unlinkSync(png);

  for (const log of [`${bitacora}-0.log`, `${bitacora}-0.log.mbtree`]) {
    if (existsSync(log)) unlinkSync(log);
  }
}

function informe() {
  let todoBien = true;
  const marca = ok => { if (!ok) todoBien = false; return ok ? '✓' : '✗'; };
  process.stdout.write('\n');

  for (const clave of elegidas) {
    const pieza = PIEZAS[clave];
    if (!pieza) continue;
    process.stdout.write(`${clave}\n`);
    for (const ext of ['webm', 'mp4']) {
      const f = path.join(SALIDA, `${pieza.archivo}.${ext}`);
      if (!existsSync(f)) { process.stdout.write(`  ${marca(false)} falta ${path.basename(f)}\n`); continue; }
      const v = medir(f);
      const colorOk = v.pix === 'yuv420p' && v.rango === 'tv' && v.matriz === 'bt709';
      const ok = v.bytes <= pieza.tope && !v.audio && v.wh === '1280x720' && colorOk;
      process.stdout.write(
        `  ${marca(ok)} ${path.basename(f).padEnd(22)} ${v.wh}  ${v.dur.toFixed(2)} s  ` +
        `${String(Math.round(v.bytes / 1024)).padStart(5)} KB / ${Math.round(pieza.tope / 1024)}  ` +
        `${String(v.kbps).padStart(5)} kbps  ${v.pix} ${v.rango} ${v.matriz}  ` +
        `${v.audio ? 'CON AUDIO' : 'sin audio'}\n`);
      if (pieza.gop) {
        const g = gopMaximo(f);
        process.stdout.write(`  ${marca(g.peor <= pieza.gop)} ${'fotograma clave'.padEnd(22)} ` +
          `el hueco más largo son ${g.peor} cuadros (tope ${pieza.gop}) sobre ${g.cuadros}\n`);
      }
      if (pieza.lazo && ext === 'mp4') {
        const salto = saltoDelBucle(f, SALIDA);
        process.stdout.write(`  ${marca(salto < 6)} ${'cierre del bucle'.padEnd(22)} ` +
          `${salto.toFixed(2)} de diferencia media entre la última punta y la primera (tope 6)\n`);
      }
    }
    const poster = path.join(SALIDA, `${pieza.archivo}-poster.jpg`);
    if (pieza.poster && existsSync(poster)) {
      process.stdout.write(`  ${marca(statSync(poster).size <= 150 * 1024)} ` +
        `${path.basename(poster).padEnd(22)} ${String(kb(poster)).padStart(5)} KB / 150  ` +
        `(el cuadro ${pieza.poster})\n`);
    }
  }
  process.stdout.write(`\n${todoBien ? 'Entra en todos los topes.' : 'HAY ALGO QUE NO ENTRA — ver arriba.'}\n`);
  if (!todoBien) process.exitCode = 1;
}

const principal = async () => {
  if (!existsSync(SALIDA)) mkdirSync(SALIDA, { recursive: true });
  if (SOLO_VERIFICAR) { informe(); return; }

  process.stdout.write('Empaquetando…\n');
  const servidor = await bundle({
    entryPoint: path.join(RAIZ, 'src', 'index.ts'),
    publicDir: path.resolve(RAIZ, '..', '..', 'apps', 'terreno', 'public'),
  });

  for (const clave of elegidas) {
    const pieza = PIEZAS[clave];
    if (!pieza) { process.stdout.write(`(no existe la pieza «${clave}»)\n`); continue; }
    if (PRUEBA && pieza.lazo) continue;   // el ritmo que hay que aprobar es el de A y B
    process.stdout.write(`\n${clave} · ${pieza.id}\n`);
    await renderizar(clave, pieza, servidor);
  }

  if (!PRUEBA) informe();
};

principal().catch(e => { console.error(e); process.exit(1); });
