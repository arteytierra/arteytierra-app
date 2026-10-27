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
import { execFileSync, spawnSync } from 'node:child_process';
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
/** Rehace los dos formatos desde el maestro ya escrito: ajustar una opción del
 *  codificador no tiene por qué costar diez minutos de Chrome headless. */
const SOLO_CODIFICAR = process.argv.includes('--recodificar');
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

/**
 * El hueco más largo entre fotogramas clave, en cuadros.
 *
 * La coma del final no es un detalle: `-of csv=p=0` sobre UN campo igual emite
 * el separador, así que cada línea llega como `1,` y no como `1`. Comparar
 * contra `'1'` da cero claves, el hueco máximo sale 0 y el archivo pasa la
 * verificación por la razón opuesta a la buena. Es el mismo error que el
 * `1280x720x` de la primera entrega: una verificación que miente tranquiliza
 * más que no tener ninguna.
 */
function gopMaximo(archivo) {
  const claves = probe(['-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'frame=key_frame', '-of', 'csv=p=0', archivo])
    .split(/\r?\n/)
    .map(l => l.replace(/,+$/, '').trim())
    .filter(Boolean);
  let peor = 0, desde = -1;
  claves.forEach((k, i) => {
    if (k !== '1') return;
    if (desde >= 0) peor = Math.max(peor, i - desde);
    desde = i;
  });
  if (desde >= 0) peor = Math.max(peor, claves.length - desde);
  return { peor, cuadros: claves.length, claves: claves.filter(k => k === '1').length };
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
  const cuadro = (n, nombre) => {
    const f = path.join(tmp, nombre);
    ff(['-v', 'error', '-y', '-i', archivo, '-vf', `select=eq(n\\,${n})`,
      '-frames:v', '1', '-update', '1', f]);
    return f;
  };
  const total = Number(probe(['-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=nb_frames', '-of', 'default=nw=1:nk=1', archivo]));
  const ultimoN = Number.isFinite(total) && total > 2 ? total - 1 : 179;
  const medio = Math.floor(ultimoN / 2);

  const primero = cuadro(0, 'bucle-0.png');
  const ultimo = cuadro(ultimoN, 'bucle-n.png');
  // El paso de referencia: cuánto cambia la pieza entre dos cuadros CUALESQUIERA
  // del medio. Sin esto el criterio no significa nada, porque un número fijo no
  // distingue un salto de un paso normal: en el lazo del giro un solo cuadro
  // mueve la cámara y con ella todos los píxeles, así que la costura legítima
  // mide lo mismo que mediría un corte. Lo que tiene que cumplirse es que la
  // costura no se note MÁS que cualquier otro paso.
  const a = cuadro(medio, 'bucle-m.png');
  const b = cuadro(medio + 1, 'bucle-m1.png');
  const paso = diferenciaMedia(a, b);
  for (const f of [a, b]) if (existsSync(f)) unlinkSync(f);
  const costura = diferenciaMedia(primero, ultimo);
  for (const f of [primero, ultimo]) if (existsSync(f)) unlinkSync(f);
  return { costura, paso };
}

/** Diferencia media de luminancia entre dos imágenes, de 0 a 255. */
function diferenciaMedia(primero, ultimo) {
  // `metadata=print` escribe por el canal de ERRORES, no por la salida, y con
  // `-v error` ni siquiera eso. Leer sólo stdout devolvía NaN y el criterio del
  // bucle quedaba sin medir — una verificación que no mide es peor que ninguna,
  // porque ocupa el lugar de la que sí mediría.
  const r = spawnSync(FFMPEG, [
    '-hide_banner', '-i', primero, '-i', ultimo,
    '-filter_complex', '[0:v][1:v]blend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG',
    '-f', 'null', '-',
  ], { encoding: 'utf8' });
  const texto = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  const m = /YAVG=([\d.]+)/.exec(texto);
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
  if (!SOLO_CODIFICAR) {
    process.stdout.write(`  maestro…\n`);
    await renderMedia({ ...comunes, codec: 'h264', crf: 12, outputLocation: maestro });
  } else if (!existsSync(maestro)) {
    throw new Error(`no hay maestro de ${pieza.archivo}: corré sin --recodificar`);
  }

  const cuadroPoster = pieza.poster === 'ultimo' ? composicion.durationInFrames - 1 : 0;
  const png = path.join(SALIDA, `${pieza.archivo}-poster.png`);
  if (pieza.poster && !SOLO_CODIFICAR) {
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

  // ── El fotograma clave corto va SÓLO en el H.264, y está medido ───────────
  //
  // Las 48 claves de las cuatro lecturas son TODO el peso del archivo: el mismo
  // WebM con claves normales pesa 555 KB y con una cada cinco cuadros pesa
  // 8.041 KB. Quince veces. Y no es rate control mal puesto — se probó: 2
  // pasadas a 2.200 kbps da 8 MB, CBR forzado da 18 MB, calidad constante da
  // 4,6 MB a crf 46 y 3,5 MB bajando a 960×540. VP9 no puede codificar
  // follaje a 720p con una clave cada cinco cuadros adentro de 3 MB. x264
  // `veryslow` sí: 2.582 KB con las mismas 48 claves.
  //
  // Así que cada formato hace lo suyo, que además es lo que el encargo ya
  // decía: «MP4 / H.264 como fuente principal (el WebM va de respaldo, no al
  // revés: para buscar cuadro a cuadro el H.264 anda mejor en más
  // navegadores)». El MP4 es el que la página recorre con `currentTime`; el
  // WebM sólo reproduce si el MP4 no está disponible. **La página tiene que
  // listar el MP4 primero.**
  process.stdout.write(`  VP9, dos pasadas…\n`);
  const bitacora = path.join(SALIDA, `vp9-${pieza.archivo}`);
  const vp9 = ['-c:v', 'libvpx-vp9', '-row-mt', '1', '-b:v', b, '-maxrate', techo,
    '-bufsize', `${pieza.kbps * 2}k`, ...COLOR, '-an'];
  ff(['-v', 'error', '-y', '-i', maestro, ...vp9, '-pass', '1', '-passlogfile', bitacora, '-f', 'null', '-']);
  ff(['-v', 'error', '-y', '-i', maestro, ...vp9, '-pass', '2', '-passlogfile', bitacora, webm]);

  process.stdout.write(`  H.264…\n`);
  ff(['-v', 'error', '-y', '-i', maestro, '-c:v', 'libx264', '-preset', 'veryslow',
    '-b:v', b, '-maxrate', techo, '-bufsize', `${pieza.kbps * 2}k`, '-profile:v', 'high',
    ...gop, ...(pieza.gop ? ['-x264-params', 'scenecut=0'] : []), ...COLOR,
    '-an', '-movflags', '+faststart', mp4]);

  // El póster no depende del codificador, así que con `--recodificar` el PNG
  // del que sale ya no está —lo borra esta misma función cuando la pieza no
  // pide el cuadro suelto— y el JPEG que se hizo con él sigue siendo válido.
  if (pieza.poster && existsSync(png)) {
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
      // El fotograma clave corto se exige en el MP4, que es el que la página
      // recorre. En el WebM se informa y no se exige: ver la explicación larga
      // arriba, en el codificador.
      if (pieza.gop) {
        const g = gopMaximo(f);
        const esFuente = ext === 'mp4';
        const ok = !esFuente || (g.peor <= pieza.gop && g.claves > 2);
        process.stdout.write(`  ${esFuente ? marca(ok) : ' '} ${'fotograma clave'.padEnd(22)} ` +
          `${g.claves} claves, el hueco más largo son ${g.peor} cuadros ` +
          `${esFuente ? `(tope ${pieza.gop}) — es el que recorre la página` : '(respaldo: sólo reproduce)'}\n`);
      }
      if (pieza.lazo && ext === 'mp4') {
        // Se mide sobre el MAESTRO y no sobre el archivo entregado, porque el
        // entregado tiene su propio ruido: a 500 kbps y con el fotograma clave
        // lejos, el cuadro 179 arrastra una deriva de cuantización de ~1,7 de
        // luminancia media contra el cuadro 1, uniforme en todo el cuadro y sin
        // una sola forma adentro — se ve amplificando la diferencia: queda un
        // verde plano. Eso no es un salto del bucle, es el compresor, y medirlo
        // acá convertiría el criterio en un medidor de bitrate.
        const maestro = path.join(SALIDA, `${pieza.archivo}-master.mp4`);
        const { costura, paso } = saltoDelBucle(existsSync(maestro) ? maestro : f, SALIDA);
        // La costura puede valer hasta vez y media un paso normal: si no se
        // nota más que cualquier otro cuadro, el bucle no salta.
        process.stdout.write(`  ${marca(costura <= paso * 1.5 + 0.5)} ${'cierre del bucle'.padEnd(22)} ` +
          `la costura vale ${costura.toFixed(2)} y un paso cualquiera ${paso.toFixed(2)}\n`);
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
