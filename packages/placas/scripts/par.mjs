/**
 * ENTREGA C · El par crudo contra leído, y la prueba de que están alineados.
 *
 *   node scripts/par.mjs
 *
 * Renderiza los DOS cuadros de `ParCrudoLeido` como secuencia de PNG —una sola
 * corrida, un solo mapa, las mismas teselas— y escribe el par en PNG y en WebP
 * a 1600 px de ancho.
 *
 * ── La verificación, que es la mitad del trabajo ───────────────────────────
 *
 * «Alineadas al píxel» no se consigue pidiendo dos veces la misma cámara: dos
 * `renderStill` separados son dos navegadores, dos mapas y dos cargas de
 * teselas, y la cámara sale idéntica mientras la ORTOFOTO puede no salirlo. Por
 * eso el par sale de dos cuadros de la misma corrida.
 *
 * Y por eso además se MIDE, en vez de confiar. La medida que manda es **cuántos
 * píxeles son exactamente iguales en las dos imágenes**: la ortofoto es textura
 * de alta frecuencia, así que si la cámara se movió un píxel no coincide casi
 * ninguno, y si lo único que cambió es lo que se dibuja encima, coincide todo lo
 * que queda fuera del predio —que acá es más de la mitad del cuadro—.
 *
 * Las franjas del borde son el control de respaldo y se exige cero exacto en
 * ellas. La de ABAJO se sacó: el predio llega hasta el 97 % del alto del cuadro,
 * así que ahí sí se dibuja. Una franja mal elegida no mide un desalineo, mide
 * el encuadre, y daba 1,52 con las tres otras en cero —que es justo el caso en
 * que una verificación miente en contra—.
 */
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');
const SALIDA = 'C:\\Arte y Tierra\\Acequia\\portada animacion\\salida-encargo-03';

const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';
const ff = args => execFileSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'inherit'] });
const kb = f => Math.round(statSync(f).size / 1024);

/**
 * Las cuatro franjas del borde del cuadro, donde NO se dibuja nada.
 *
 * Salen de mirar el encuadre: con la inclinación de 44° el predio ocupa la
 * banda central y deja cielo arriba, monte abajo y ladera a los dos costados.
 * `crop=ancho:alto:x:y` en fracciones del cuadro.
 */
const FRANJAS = [
  { nombre: 'arriba',    crop: 'iw:ih*0.07:0:0' },
  { nombre: 'izquierda', crop: 'iw*0.10:ih:0:0' },
  { nombre: 'derecha',   crop: 'iw*0.10:ih:iw*0.90:0' },
];

/**
 * Qué parte del cuadro es EXACTAMENTE igual en las dos imágenes, de 0 a 1.
 *
 * Se resta una de la otra, se marca con 255 todo píxel cuya diferencia pase de
 * 1 —el 1 absorbe el redondeo del espacio de color, no un movimiento— y se
 * promedia. Lo que sale es la fracción que cambió; lo que se informa es la que
 * no.
 */
function fraccionIgual(a, b) {
  const r = spawnSync(FFMPEG, [
    '-hide_banner', '-i', a, '-i', b, '-filter_complex',
    // `format=gray` deja una sola componente y entonces `signalstats` no emite
    // YAVG: el medidor devolvía NaN y el control daba FALLA con las tres
    // franjas en cero. `lutyuv` marca sobre el plano Y y deja U y V neutros.
    '[0:v][1:v]blend=all_mode=difference,' +
    "lutyuv=y='if(gt(val,1),255,0)':u=128:v=128," +
    'signalstats,metadata=print:key=lavfi.signalstats.YAVG',
    '-f', 'null', '-',
  ], { encoding: 'utf8' });
  const texto = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  const m = /YAVG=([\d.]+)/.exec(texto);
  return m ? 1 - Number(m[1]) / 255 : NaN;
}

/** Diferencia media de luminancia entre dos imágenes dentro de una franja. */
function diferencia(a, b, crop) {
  const filtro = crop
    ? `[0:v]crop=${crop}[a];[1:v]crop=${crop}[b];[a][b]blend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG`
    : '[0:v][1:v]blend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG';
  // `metadata=print` escribe por el canal de ERRORES, no por la salida. Leer
  // sólo stdout devuelve NaN, y una verificación que no mide es peor que
  // ninguna porque ocupa el lugar de la que sí mediría.
  const r = spawnSync(FFMPEG, [
    '-hide_banner', '-i', a, '-i', b, '-filter_complex', filtro, '-f', 'null', '-',
  ], { encoding: 'utf8' });
  const texto = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  const m = /YAVG=([\d.]+)/.exec(texto);
  return m ? Number(m[1]) : NaN;
}

async function main() {
  if (!existsSync(SALIDA)) mkdirSync(SALIDA, { recursive: true });

  process.stdout.write('Empaquetando…\n');
  const servidor = await bundle({
    entryPoint: path.join(RAIZ, 'src', 'index.ts'),
    publicDir: path.resolve(RAIZ, '..', '..', 'apps', 'terreno', 'public'),
  });
  const composicion = await selectComposition({ serveUrl: servidor, id: 'ParCrudoLeido' });

  const crudo = path.join(SALIDA, 'crudo.png');
  const leido = path.join(SALIDA, 'leido.png');

  // Un `renderStill` por cuadro, y no `renderFrames` con los dos.
  //
  // `renderFrames` parecía lo correcto —una sola corrida, un solo mapa— y
  // devolvió un segundo cuadro a medio formar: el terreno plano, la cámara
  // sin asentar y sólo una de las once capas dibujada. Dos corridas de
  // `renderStill` son dos mapas distintos, que es justo lo que había que
  // evitar, PERO cada una respeta el calentamiento de cuatro segundos y las
  // dos esperas por cuadro, y por eso salen enteras.
  //
  // Que eso alcance no se supone: se mide abajo. Si las dos imágenes no
  // coinciden píxel a píxel fuera del predio, este guion falla y no entrega.
  // La lección es la misma de toda esta carpeta: lo que decide no es el
  // mecanismo que uno creyó más prolijo, es la medición sobre el archivo
  // escrito.
  for (const [cuadro, destino] of [[0, crudo], [1, leido]]) {
    process.stdout.write(`  cuadro ${cuadro}…
`);
    await renderStill({
      serveUrl: servidor, composition: composicion,
      chromiumOptions: { gl: 'angle' }, timeoutInMilliseconds: 180_000,
      frame: cuadro, imageFormat: 'png', output: destino,
    });
  }
  // WebP para la página: una cortina carga las DOS imágenes siempre, así que
  // acá el peso se paga dos veces.
  const crudoW = path.join(SALIDA, 'crudo.webp');
  const leidoW = path.join(SALIDA, 'leido.webp');
  for (const [src, dst] of [[crudo, crudoW], [leido, leidoW]]) {
    ff(['-v', 'error', '-y', '-i', src, '-c:v', 'libwebp', '-quality', '88', '-compression_level', '6', dst]);
  }

  process.stdout.write('\n');
  for (const [n, f] of [['crudo.png', crudo], ['leido.png', leido],
                        ['crudo.webp', crudoW], ['leido.webp', leidoW]]) {
    process.stdout.write(`  ${n.padEnd(12)} ${String(kb(f)).padStart(5)} KB\n`);
  }

  process.stdout.write('\nALINEACIÓN\n');
  let mal = false;
  const igual = fraccionIgual(crudo, leido);
  // Más de la mitad del cuadro es monte de afuera del predio, donde no se
  // dibuja nada. Si la cámara se hubiera movido un solo píxel, sobre textura
  // de alta frecuencia no coincidiría casi ninguno.
  const okIgual = Number.isFinite(igual) && igual > 0.4;
  if (!okIgual) mal = true;
  process.stdout.write(`  ${okIgual ? '\u2713' : '\u2717'} ${(igual * 100).toFixed(1)} % del cuadro es EXACTAMENTE el mismo pixel\n`);
  process.stdout.write('    fuera del predio no se dibuja nada, asi que las franjas del borde van en cero:\n');
  for (const { nombre, crop } of FRANJAS) {
    const d = diferencia(crudo, leido, crop);
    const ok = Number.isFinite(d) && d < 0.5;
    if (!ok) mal = true;
    process.stdout.write(`  ${ok ? '✓' : '✗'} franja ${nombre.padEnd(10)} diferencia media ${d.toFixed(3)}\n`);
  }
  const total = diferencia(crudo, leido, null);
  process.stdout.write(`    (sobre el cuadro entero, donde SÍ se dibuja: ${total.toFixed(3)})\n`);


  if (mal) {
    process.stdout.write('\nLAS DOS IMÁGENES NO ESTÁN ALINEADAS: la cortina no sirve.\n');
    process.exitCode = 1;
  } else {
    process.stdout.write('\nAlineadas: el terreno no se movió entre una y otra.\n');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
