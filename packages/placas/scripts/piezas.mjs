/**
 * Renderiza, codifica y VERIFICA las piezas de los encargos 02 y 03.
 *
 *   node scripts/piezas.mjs                 # las diez del 02 (están aprobadas)
 *   node scripts/piezas.mjs mesa par        # las dos del 03
 *   node scripts/piezas.mjs --prueba mesa   # corte en baja, para aprobar el ritmo
 *   node scripts/piezas.mjs --verificar     # sólo medir lo que ya está escrito
 *
 * La salida NO va al repo: cae en `…\portada animacion\salida-encargo-0X`, y
 * cada pieza sabe a cuál de las dos carpetas pertenece. Las diez del encargo 02
 * están APROBADAS y no se rehacen: si se las pide, se las rehace igual, pero no
 * entran en la corrida por defecto del encargo 03.
 *
 * ── El espacio de color, que ya rompió una vez ─────────────────────────────
 * La WebM de la primera entrega salió en rango COMPLETO con matriz bt470bg.
 * ffmpeg la decodificaba entera sin una queja y Chromium moría en el primer
 * cuadro con PIPELINE_ERROR_DECODE. Y la lista de `<source>` no salva: el
 * navegador cambia de archivo cuando uno no CARGA, no cuando falla a mitad de
 * la decodificación. Por eso las banderas de color van explícitas en los dos
 * codecs y por eso se verifican después, sobre el archivo escrito.
 *
 * ── Por qué la secuencia lleva un fotograma clave cada cinco ───────────────
 * Porque es la única que se recorre cambiando `currentTime` desde la página.
 * Al buscar, el decodificador tiene que volver al fotograma clave anterior y
 * reconstruir desde ahí: con claves cada dos segundos eso son ciento veinte
 * cuadros de trabajo por cada salto y se ve a los tirones. Cada cinco cuesta
 * peso, y se mide acá abajo, cuadro por cuadro.
 */
import { existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');
const BASE = 'C:\\Arte y Tierra\\Acequia\\portada animacion';
const SALIDA = `${BASE}\\salida-encargo-02`;
const SALIDA_03 = `${BASE}\\salida-encargo-03`;
const SALIDA_04 = `${BASE}\\salida-encargo-04`;
const CARPETAS = { 3: SALIDA_03, 4: SALIDA_04 };
/** Dónde cae cada pieza. El encargo 03 no se mezcla con el 02, que ya se entregó. */
const carpeta = pieza => CARPETAS[pieza.encargo] ?? SALIDA;

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
/**
 * Las seis lecturas cuestan más bits por segundo que todo lo demás y vale la
 * pena decir por qué: dan una vuelta entera en dos segundos, así que **no hay
 * un solo píxel que se repita entre un cuadro y el siguiente**. En una pieza de
 * cámara quieta el codificador paga el primer cuadro y después casi nada; acá
 * paga todos. Por eso van a 2.000 kbps contra los 950 de los lazos, y aun así
 * pesan menos de un cuarto de lo que pesaba la pieza de ocho segundos.
 */
const LECTURA = { kbps: 2000, tope: 1.1 * MiB, lazo: true };

const PIEZAS = {
  portada: {
    id: 'PortadaPredio', archivo: 'portada', kbps: 1050, tope: 2.5 * MiB,
    poster: 'ultimo', cuadroSuelto: true, prueba: true,
  },
  'lectura-relieve':  { id: 'LecturaRelieve',  archivo: 'lectura-relieve',  ...LECTURA, poster: 'primero' },
  'lectura-curvas':   { id: 'LecturaCurvas',   archivo: 'lectura-curvas',   ...LECTURA },
  'lectura-agua':     { id: 'LecturaAgua',     archivo: 'lectura-agua',     ...LECTURA },
  'lectura-represas': { id: 'LecturaRepresas', archivo: 'lectura-represas', ...LECTURA },
  'lectura-todo':     { id: 'LecturaTodo',     archivo: 'lectura-todo',     ...LECTURA, poster: 'primero', prueba: true },
  // La única que no es un bucle: acumula las cuatro capas, así que el último
  // cuadro no se parece al primero. Es la que la página puede recorrer con
  // `currentTime`, y por eso es la única con fotograma clave corto.
  'lectura-secuencia': {
    id: 'LecturaSecuencia', archivo: 'lectura-secuencia', kbps: 2000, tope: 1.1 * MiB,
    poster: 'primero', gop: 5, prueba: true,
  },
  'lazo-perimetro': { id: 'LazoPerimetro', archivo: 'lazo-perimetro', kbps: 950, tope: 900 * 1024, lazo: true },
  'lazo-giro':      { id: 'LazoGiro',      archivo: 'lazo-giro',      kbps: 950, tope: 900 * 1024, lazo: true },
  'lazo-agua':      { id: 'LazoAgua',      archivo: 'lazo-agua',      kbps: 950, tope: 900 * 1024, lazo: true, prueba: true },

  // ── Encargo 03 ──────────────────────────────────────────────────────────
  //
  // Dieciséis segundos con la cámara QUIETA, que es la diferencia que paga
  // el presupuesto: en las lecturas que giran no hay un solo píxel que se
  // repita entre un cuadro y el siguiente, y por eso cuestan 2.000 kbps por
  // dos segundos. Acá el codificador paga el primer cuadro de cada acto y
  // casi nada en el medio, así que 700 kbps alcanzan para entrar en el tope
  // de 1,5 MB que pide el encargo con margen. Y no lleva fotograma clave
  // corto: esta pieza corre sola y en bucle, la página no la recorre.
  mesa: {
    id: 'MesaDeTrabajo', archivo: 'mesa-de-trabajo', kbps: 700, tope: 1.5 * MiB,
    poster: 'primero', posterExtra: 435, lazo: true, prueba: true, encargo: 3,
  },

  // ── Encargo 04 ──────────────────────────────────────────────────────────
  //
  // Dieciocho segundos con la cámara quieta, igual que la mesa, así que el
  // presupuesto de bits se parece: 720 kbps por 18 s son 1,62 MB y el tope son
  // 1,8. El margen es más chico que el de la mesa a propósito —el acto 02
  // pinta 2.569 y 3.001 rectángulos de color sobre casi medio cuadro, que es
  // más superficie cambiando que cualquiera de los cuatro actos de la mesa—.
  // Si no entra, lo que baja es el caudal antes que la resolución, porque acá
  // no hay un degradado continuo que pueda bandear: son clases de color
  // planas.
  //
  // El póster es el cuadro 0 —la ortofoto desnuda— porque el encargo lo pide
  // así, y además es el primer cuadro del bucle. El `posterExtra` es el 430,
  // que cae en el acto del viento con los doce sectores, el mes encendido y la
  // cortina ya puesta: es el cuadro que más dice de la pieza si la página
  // necesita una imagen de reposo en vez del primer cuadro.
  sol: {
    id: 'SolYViento', archivo: 'sol-y-viento', kbps: 720, tope: 1.8 * MiB,
    poster: 'primero', posterExtra: 430, lazo: true, prueba: true, encargo: 4,
  },

  // La pieza C no hace bucle y es la única sin mapa: es tipografía sobre papel,
  // bajando. Que TODO el cuadro se mueva en todos los cuadros la pondría del
  // lado caro —es lo que hace que las lecturas que giran cuesten 2.000 kbps—,
  // pero el contenido es texto plano sobre un fondo liso: no hay follaje ni
  // degradado que el codificador tenga que seguir. 850 kbps por diez segundos
  // son 1,06 MB contra un tope de 1,2. Si no entrara, acá lo que NO se puede
  // bajar es la resolución: el tema de la pieza es que se lea la columna de
  // procedencia de cada fila, y a 960 de ancho ese texto desaparece.
  informe: {
    id: 'Informe', archivo: 'informe', kbps: 850, tope: 1.2 * MiB,
    poster: 'primero', prueba: true, encargo: 4,
  },
};

/**
 * Qué encargo corre cuando no se pide ninguna pieza por nombre. Está acá, con
 * nombre, porque es lo único que hay que mover cuando llega el encargo
 * siguiente: antes era un `=== 3` perdido en el medio de un filtro.
 */
const EN_CURSO = 4;

const PRUEBA = process.argv.includes('--prueba');
const SOLO_VERIFICAR = process.argv.includes('--verificar');
/** Rehace los dos formatos desde el maestro ya escrito: ajustar una opción del
 *  codificador no tiene por qué costar diez minutos de Chrome headless. */
const SOLO_CODIFICAR = process.argv.includes('--recodificar');
const pedidas = process.argv.slice(2).filter(a => !a.startsWith('--'));
// Sin argumentos se corren SÓLO las del encargo en curso. Las diez del 02
// están aprobadas y volver a renderizarlas es una hora de Chrome headless
// para escribir los mismos archivos.
const elegidas = pedidas.length
  ? pedidas
  : Object.keys(PIEZAS).filter(k => PIEZAS[k].encargo === EN_CURSO);

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
  const SALIDA = carpeta(pieza);
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
  // El segundo póster, el del estado leído. El encargo pide el cuadro 0, que
  // en esta pieza es la ortofoto DESNUDA: correcto como primer cuadro del
  // bucle y flojo como imagen de reposo, porque no se ve que haya una
  // lectura. Van los dos y la página elige.
  if (pieza.posterExtra != null && !SOLO_CODIFICAR) {
    process.stdout.write(`  cuadro del póster leído (${pieza.posterExtra})…\n`);
    const pngB = path.join(SALIDA, `${pieza.archivo}-poster-leido.png`);
    await renderStill({
      serveUrl: servidor, composition: composicion,
      chromiumOptions: { gl: 'angle' }, timeoutInMilliseconds: 120_000,
      frame: pieza.posterExtra, imageFormat: 'png', output: pngB,
    });
    const jpgB = path.join(SALIDA, `${pieza.archivo}-poster-leido.jpg`);
    for (let q = 4; q <= 14; q++) {
      ff(['-v', 'error', '-y', '-i', pngB, '-q:v', String(q), jpgB]);
      if (statSync(jpgB).size <= 150 * 1024) break;
    }
    unlinkSync(pngB);
  }

  if (pieza.poster && existsSync(png)) {
    // La calidad del JPEG SE BUSCA hasta entrar en el tope. Fijar una calidad y
    // esperar que entre es lo que hace que un día entre y otro no.
    const poster = path.join(carpeta(pieza), `${pieza.archivo}-poster.jpg`);
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
      const f = path.join(carpeta(pieza), `${pieza.archivo}.${ext}`);
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
        const maestro = path.join(carpeta(pieza), `${pieza.archivo}-master.mp4`);
        const { costura, paso } = saltoDelBucle(existsSync(maestro) ? maestro : f, carpeta(pieza));
        // La costura puede valer hasta vez y media un paso normal: si no se
        // nota más que cualquier otro cuadro, el bucle no salta.
        process.stdout.write(`  ${marca(costura <= paso * 1.5 + 0.5)} ${'cierre del bucle'.padEnd(22)} ` +
          `la costura vale ${costura.toFixed(2)} y un paso cualquiera ${paso.toFixed(2)}\n`);
      }
    }
    // `carpeta(pieza)` y no `SALIDA`: con la constante del encargo 02 el
    // informe buscaba el póster de las piezas nuevas en la carpeta vieja, no lo
    // encontraba y no decía nada. Una verificación que mira el lugar equivocado
    // no falla: se calla, que es peor.
    const poster = path.join(carpeta(pieza), `${pieza.archivo}-poster.jpg`);
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
  for (const d of [SALIDA, SALIDA_03, SALIDA_04]) if (!existsSync(d)) mkdirSync(d, { recursive: true });
  if (SOLO_VERIFICAR) { informe(); return; }

  process.stdout.write('Empaquetando…\n');
  const servidor = await bundle({
    entryPoint: path.join(RAIZ, 'src', 'index.ts'),
    publicDir: path.resolve(RAIZ, '..', '..', 'apps', 'terreno', 'public'),
  });

  for (const clave of elegidas) {
    const pieza = PIEZAS[clave];
    if (!pieza) { process.stdout.write(`(no existe la pieza «${clave}»)\n`); continue; }
    // El corte en baja es para aprobar el ritmo, no para ver las diez piezas:
    // van las que cambiaron de verdad —la portada, el bucle con todo, la
    // secuencia y el lazo del agua, que es el que se rehízo entero—.
    if (PRUEBA && !pieza.prueba) continue;
    process.stdout.write(`\n${clave} · ${pieza.id}\n`);
    await renderizar(clave, pieza, servidor);
  }

  if (!PRUEBA) informe();
};

principal().catch(e => { console.error(e); process.exit(1); });
