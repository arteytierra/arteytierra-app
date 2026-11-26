/**
 * Los maestros de las piezas EN 9:16, para los reels: 1080×1920.
 *
 *   node scripts/vertical.mjs                     las cinco
 *   node scripts/vertical.mjs portada-giro        sólo esa
 *   node scripts/vertical.mjs --prueba            treinta cuadros de cada una
 *   node scripts/vertical.mjs portada --cuadro=389   un PNG suelto, para mirar
 *                                                 el encuadre sin pagar el render
 *   node scripts/vertical.mjs --verificar         sólo medir lo que ya está
 *
 * ── Por qué se renderizan de nuevo y no se recortan ───────────────────────
 *
 * Porque el predio ocupa casi todo el ancho del cuadro de 16:9. Una ventana
 * vertical sacada de ahí —que es como se arman los verticales a partir de las
 * grabaciones de la app— le corta las dos puntas al polígono, y el polígono es
 * lo que la pieza tiene para mostrar. Lo medimos sobre la portada: el predio va
 * de x≈360 a x≈1580 de 1920, o sea 1220 px, y la ventana de 9:16 más grande que
 * entra en un cuadro de 1080 de alto son 607.
 *
 * No hace falta recortar nada porque la cámara del mapa **se calcula a partir
 * del tamaño del cuadro**: `zoomQueEncuadra(ancho, alto)` en
 * `composiciones/predio/mapa.tsx`. Con el cuadro parado, el mismo cálculo baja
 * el zoom hasta que el predio entra a lo ancho y lo que sobra arriba y abajo lo
 * llena la ortofoto que sigue. Es un encuadre nuevo, no un recorte del viejo.
 *
 * Y es la misma razón por la que el 25/11/2026 las piezas pasaron a rendirse a
 * 1920×1080 en vez de agrandarse: lo que se puede dibujar no se estira.
 *
 * ── Qué NO está acá ───────────────────────────────────────────────────────
 *
 * · `Informe` no tiene gemela vertical. El documento tiene las alturas de sus
 *   secciones escritas en píxeles (`altoPortada = 720`), así que en un cuadro
 *   de 1920 de alto no se reacomoda: se vería la misma página con una franja
 *   de papel vacío. Para ese momento los reels usan la grabación de la app,
 *   que sí recorta en columna como todas las demás.
 *
 * · `MesaDeTrabajo` y la obra no entran en los reels: la mesa porque la
 *   secuencia de capas ya la cuenta `lectura-secuencia` en la mitad del
 *   tiempo, y la obra porque es la historia de los quince años, que es
 *   justamente lo que un reel de 30 s no tiene tiempo de contar.
 */
import { existsSync, mkdirSync, statSync } from 'node:fs';
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
};

const FFPROBE = process.env.FFPROBE ?? 'ffprobe';
const probe = args => execFileSync(FFPROBE, args, { encoding: 'utf8' }).trim();

const ANCHO = 1080, ALTO = 1920;
/** 720×1280 × 1,5 = 1080×1920, igual que 1280×720 × 1,5 da 1920×1080. */
const ESCALA = 1.5;

/**
 * Las cuatro que son video, más el cuadro del terreno crudo.
 *
 * `cuadros` es lo que tiene que salir y se verifica: un render que se cayó a la
 * mitad escribe un archivo más corto, y sin este número nadie se entera hasta
 * que el reel no cierra con la voz.
 */
const PIEZAS = {
  portada:             { id: 'PortadaPredioVertical',     archivo: 'portada',           carpeta: '02', cuadros: 390 },
  'portada-giro':      { id: 'PortadaGiroVertical',       archivo: 'portada-giro',      carpeta: '02', cuadros: 810 },
  'lectura-secuencia': { id: 'LecturaSecuenciaVertical',  archivo: 'lectura-secuencia', carpeta: '02', cuadros: 360 },
  'lectura-agua':      { id: 'LecturaAguaVertical',       archivo: 'lectura-agua',      carpeta: '02', cuadros: 360 },
  // El crudo no es un video: es un cuadro, y el montaje le hace un empuje muy
  // lento. `seg_foto_v` recorta de una imagen MÁS GRANDE que el cuadro, así que
  // lo que hace falta es 1800×3200 y no 1080×1920. 900×1600 × 2 da eso exacto.
  crudo:               { id: 'ParCrudoLeidoVertical',     archivo: 'crudo',             carpeta: '03', escala: 2, cuadro: 0, still: true },
};

const PRUEBA = process.argv.includes('--prueba');
const SOLO_VERIFICAR = process.argv.includes('--verificar');
/**
 * Un cuadro suelto a PNG, al lado del maestro y con el número en el nombre.
 * Es para mirar el encuadre: en estas piezas el predio tarda trece segundos en
 * terminar de dibujarse, así que los treinta cuadros de `--prueba` muestran el
 * perímetro a medio trazar y no sirven para decidir nada.
 */
const CUADRO = (process.argv.find(a => a.startsWith('--cuadro=')) ?? '').split('=')[1];
const pedidas = process.argv.slice(2).filter(a => !a.startsWith('--'));
const elegidas = pedidas.length ? pedidas : Object.keys(PIEZAS);

const destinoDe = p => path.join(CARPETAS[p.carpeta],
  p.still ? `${p.archivo}-vertical-1800.png` : `${p.archivo}-master-vertical.mp4`);

function medir(archivo) {
  const [width, height, pix, rango, matriz] = probe(['-v', 'error',
    '-select_streams', 'v:0', '-show_entries',
    'stream=width,height,pix_fmt,color_range,color_space',
    '-of', 'default=nw=1:nk=1', archivo]).split(/\r?\n/);
  let cuadros = Number(probe(['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=nb_frames', '-of', 'default=nw=1:nk=1', archivo])
    .replace(/[^0-9]/g, ''));
  if (!cuadros) {
    cuadros = Number(probe(['-v', 'error', '-count_frames', '-select_streams', 'v:0',
      '-show_entries', 'stream=nb_read_frames', '-of', 'default=nw=1:nk=1', archivo])
      .replace(/[^0-9]/g, ''));
  }
  return {
    wh: `${width}x${height}`, pix, rango, matriz, cuadros,
    bytes: statSync(archivo).size,
  };
}

async function renderizar(clave, pieza, servidor) {
  const destino = destinoDe(pieza);
  const escala = pieza.escala ?? ESCALA;
  const composicion = await selectComposition({ serveUrl: servidor, id: pieza.id });

  if (CUADRO !== undefined) {
    const suelto = destino.replace(/\.(mp4|png)$/, `-c${CUADRO}.png`);
    process.stdout.write(`  cuadro ${CUADRO} a ×${escala} → ${path.basename(suelto)}\n`);
    await renderStill({
      serveUrl: servidor, composition: composicion,
      chromiumOptions: { gl: 'angle' }, timeoutInMilliseconds: 180_000,
      scale: escala, frame: Number(CUADRO), imageFormat: 'png', output: suelto,
    });
    return;
  }

  if (pieza.still) {
    process.stdout.write(`  cuadro ${pieza.cuadro} a ×${escala}…\n`);
    await renderStill({
      serveUrl: servidor, composition: composicion,
      chromiumOptions: { gl: 'angle' }, timeoutInMilliseconds: 180_000,
      scale: escala, frame: pieza.cuadro, imageFormat: 'png', output: destino,
    });
    return;
  }

  // La prueba son treinta cuadros. No es para mirar la pieza: es para ver que
  // el cuadro sale 1080×1920 y que el predio entra entero, ANTES de pagar la
  // corrida completa, que acá son teselas y va a concurrencia 1.
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

/**
 * El etiquetado de color esperado.
 *
 * Acá no hay archivo viejo contra el cual comparar —estas piezas nacen hoy—
 * así que se compara contra lo que Remotion produce, que está medido sobre los
 * maestros aprobados: `yuvj420p` / `pc` / `bt470bg`. Exigirle `bt709` es
 * pedirle un etiquetado que nunca produjo; el montaje lo convierte después, en
 * el único paso que escribe el átomo `colr` (ver `pegar_sonido`).
 */
function colorEsperado(v) {
  return v.pix === 'yuvj420p' && v.rango === 'pc' && v.matriz === 'bt470bg';
}

function informe() {
  let fallas = 0;
  process.stdout.write('\n');
  for (const clave of elegidas) {
    const pieza = PIEZAS[clave];
    const destino = destinoDe(pieza);
    if (!existsSync(destino)) {
      process.stdout.write(`  ✗ ${clave}: no está ${path.basename(destino)}\n`);
      fallas += 1;
      continue;
    }
    if (pieza.still) {
      const [w, h] = probe(['-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height', '-of', 'default=nw=1:nk=1', destino])
        .split(/\r?\n/).map(Number);
      const bien = w === 1800 && h === 3200;
      process.stdout.write(`  ${bien ? '✓' : '✗'} ${clave.padEnd(18)} ${w}x${h}  `
        + `${(statSync(destino).size / 1e6).toFixed(1)} MB\n`);
      if (!bien) fallas += 1;
      continue;
    }
    const v = medir(destino);
    const bien = v.wh === `${ANCHO}x${ALTO}` && v.cuadros === pieza.cuadros
      && colorEsperado(v);
    process.stdout.write(`  ${bien ? '✓' : '✗'} ${clave.padEnd(18)} ${v.wh}  `
      + `${String(v.cuadros).padStart(4)} cuadros  ${v.pix} ${v.rango} ${v.matriz}  `
      + `${(v.bytes / 1e6).toFixed(1)} MB\n`);
    if (!bien) fallas += 1;
  }
  return fallas;
}

async function main() {
  if (!SOLO_VERIFICAR) {
    for (const carpeta of Object.values(CARPETAS)) mkdirSync(carpeta, { recursive: true });
    process.stdout.write('empaquetando…\n');
    const servidor = await bundle({ entryPoint: path.join(RAIZ, 'src', 'index.ts') });
    for (const clave of elegidas) {
      const pieza = PIEZAS[clave];
      if (!pieza) throw new Error(`no existe la pieza «${clave}»`);
      process.stdout.write(`${clave}\n`);
      await renderizar(clave, pieza, servidor);
    }
  }
  if (PRUEBA || CUADRO !== undefined) {
    process.stdout.write('\nno se verifica nada: esto es un corte de prueba\n');
    return;
  }
  const fallas = informe();
  if (fallas) {
    process.stdout.write(`\n${fallas} pieza(s) mal\n`);
    process.exitCode = 1;
  }
}

main().catch(e => { console.error(e); process.exit(1); });
