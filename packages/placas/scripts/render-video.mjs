/**
 * Renderiza de una sola pasada todas las placas del video de presentación de
 * acequia: la horizontal de 90 s, el vertical de 30 s y el de 15 s.
 *
 * Por qué un script y no `remotion render` repetido: cada invocación de la CLI
 * vuelve a empaquetar el proyecto, y acá hay veinticinco placas. Empaquetando
 * una vez y renderizando en serie, lo que tardaba veinticinco empaquetados
 * tarda uno.
 *
 * El catálogo de abajo es, además, la lista de materiales del video: si un
 * titular cambia de texto o una placa cambia de duración, se cambia acá y no en
 * un comando suelto que quedó en el historial de alguna terminal.
 *
 *   node scripts/render-video.mjs [carpeta-de-salida]
 *
 * La salida **no va al repo**: por defecto cae junto al metraje, en
 * `C:\Arte y Tierra\Acequia\videoapp-1\placas`. Ver
 * `_research/video-acequia/MONTAJE.md` para en qué segundo entra cada una.
 */
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');

const SALIDA = process.argv[2] ?? 'C:\\Arte y Tierra\\Acequia\\videoapp-1\\placas';

/** Los textos en pantalla, todos juntos. Es el guión, no decoración. */
const TITULARES = {
  't01-terreno': { texto: 'Un terreno cualquiera.', segundo: '', cuadros: 153 },
  't02-ya-sabe': { texto: 'Todo lo que acequia ya sabe de él.', segundo: '', cuadros: 72 },
  't03-no-cargas': {
    texto: 'No cargás nada.',
    segundo: 'Marcás el perímetro.',
    cuadros: 93,
  },
  't04-agua': { texto: 'Dónde va el agua.', segundo: '', cuadros: 105 },
  't05-camino': { texto: 'Dónde va el camino.', segundo: '', cuadros: 90 },
  't06-arbol': { texto: 'Dónde va el árbol.', segundo: '', cuadros: 90 },
  't07-animal': { texto: 'Dónde entra el animal.', segundo: '', cuadros: 105 },
  't08-informe': {
    texto: 'Todo esto sale en un informe.',
    segundo: 'Con cada fuente y cada fecha.',
    cuadros: 105,
  },
  't09-honestidad': {
    texto: 'Y te dice cuándo no confiar en el número.',
    segundo: '',
    cuadros: 135,
  },
};

/**
 * Los pies de fuente del horizontal. En los verticales no van: ahí la banda la
 * ocupa el subtítulo quemado, y dos textos en la misma franja no entran.
 */
const FUENTES = {
  'pie-relieve': { capa: 'Relieve', fuente: 'Copernicus GLO-30 · © DLR e.V.' },
  'pie-clima': { capa: 'Clima', fuente: 'NASA POWER · Köppen Beck 1 km' },
  'pie-suelo': { capa: 'Suelo', fuente: 'ISRIC SoilGrids v2.0' },
  'pie-cobertura': { capa: 'Cobertura', fuente: 'ESA WorldCover 10 m' },
  'pie-ecorregion': { capa: 'Ecorregión', fuente: 'RESOLVE Ecoregions 2017' },
};

/**
 * El catálogo completo. `alfa: true` sale en ProRes 4444 para apoyar sobre el
 * metraje; el resto, en H.264, que va solo y a pantalla completa.
 */
const PLACAS = [
  // ── Fondo, una sola imagen que se estira toda la línea de tiempo ──────────
  { archivo: 'banda-h.png', id: 'BandaBase', quieta: true },
  { archivo: 'banda-v.png', id: 'BandaBaseVertical', quieta: true },

  // ── Horizontal, 90 s ──────────────────────────────────────────────────────
  { archivo: 'cruce-h.mp4', id: 'PlacaCruce', cuadros: 360, props: { ritmo: 1 } },
  { archivo: 'cierre-h.mp4', id: 'AperturaAppClara', cuadros: 150, props: { ritmo: 1 } },

  ...Object.entries(FUENTES).map(([archivo, props]) => ({
    archivo: `${archivo}.mov`,
    id: 'Fuente',
    cuadros: 84,
    alfa: true,
    props,
  })),

  ...Object.entries(TITULARES).map(([archivo, { texto, segundo, cuadros }]) => ({
    archivo: `${archivo}.mov`,
    id: 'Titular',
    cuadros,
    alfa: true,
    // Siempre a la derecha: el panel de acequia vive a la izquierda y está lleno
    // de números que son justo lo que el video quiere que se lea.
    props: { texto, segundo, anclaje: 'derecha' },
  })),

  // ── Vertical de 30 s ──────────────────────────────────────────────────────
  // El cruce corre a 1,8 para entrar en 6,5 s sin que el contador se apure.
  { archivo: 'cruce-v30.mp4', id: 'PlacaCruceVertical', cuadros: 195, props: { ritmo: 1.8 } },
  {
    archivo: 'cierre-v30.mp4',
    id: 'AperturaAppClaraVertical',
    cuadros: 105,
    props: { ritmo: 1.4 },
  },
  {
    archivo: 'v30-t01-terreno.mov',
    id: 'TitularVertical',
    cuadros: 84,
    alfa: true,
    props: { texto: 'Un terreno cualquiera.', segundo: '', anclaje: 'centro' },
  },
  {
    archivo: 'v30-t02-no-cargas.mov',
    id: 'TitularVertical',
    cuadros: 54,
    alfa: true,
    props: { texto: 'No cargás nada.', segundo: 'Marcás el perímetro.', anclaje: 'centro' },
  },
  {
    archivo: 'v30-t03-agua.mov',
    id: 'TitularVertical',
    cuadros: 54,
    alfa: true,
    props: { texto: 'Dónde va el agua.', segundo: '', anclaje: 'centro' },
  },
  {
    archivo: 'v30-t04-honestidad.mov',
    id: 'TitularVertical',
    cuadros: 84,
    alfa: true,
    props: { texto: 'Y te dice cuándo no confiar.', segundo: '', anclaje: 'centro' },
  },

  // ── Vertical de 15 s ──────────────────────────────────────────────────────
  { archivo: 'cruce-v15.mp4', id: 'PlacaCruceVertical', cuadros: 150, props: { ritmo: 2.4 } },
  {
    archivo: 'cierre-v15.mp4',
    id: 'AperturaAppClaraVertical',
    cuadros: 90,
    props: { ritmo: 1.67 },
  },
  {
    archivo: 'v15-t01-terreno.mov',
    id: 'TitularVertical',
    cuadros: 60,
    alfa: true,
    props: { texto: 'Un terreno cualquiera.', segundo: '', anclaje: 'centro' },
  },
  {
    archivo: 'v15-t02-honestidad.mov',
    id: 'TitularVertical',
    cuadros: 54,
    alfa: true,
    props: { texto: 'Y te dice cuándo no confiar.', segundo: '', anclaje: 'centro' },
  },
];

const principal = async () => {
  if (!existsSync(SALIDA)) mkdirSync(SALIDA, { recursive: true });

  process.stdout.write('Empaquetando…\n');
  const servidor = await bundle({
    entryPoint: path.join(RAIZ, 'src', 'index.ts'),
    // El bundler programático no lee `remotion.config.ts`, así que el publicDir
    // se repite acá. Es la carpeta de marca de terreno: la única copia.
    publicDir: path.resolve(RAIZ, '..', '..', 'apps', 'terreno', 'public'),
  });

  let hechas = 0;
  for (const placa of PLACAS) {
    const destino = path.join(SALIDA, placa.archivo);
    const composicion = await selectComposition({
      serveUrl: servidor,
      id: placa.id,
      inputProps: placa.props ?? {},
    });

    if (placa.quieta) {
      await renderStill({
        composition: composicion,
        serveUrl: servidor,
        output: destino,
        inputProps: placa.props ?? {},
        imageFormat: 'png',
      });
    } else {
      await renderMedia({
        composition: { ...composicion, durationInFrames: placa.cuadros },
        serveUrl: servidor,
        outputLocation: destino,
        inputProps: placa.props ?? {},
        ...(placa.alfa
          ? {
              codec: 'prores',
              proResProfile: '4444',
              pixelFormat: 'yuva444p10le',
              imageFormat: 'png',
            }
          : { codec: 'h264', crf: 16, imageFormat: 'jpeg' }),
      });
    }

    hechas += 1;
    process.stdout.write(`  ${String(hechas).padStart(2, ' ')}/${PLACAS.length}  ${placa.archivo}\n`);
  }

  process.stdout.write(`\nListo. ${PLACAS.length} placas en ${SALIDA}\n`);
};

principal().catch((error) => {
  process.stderr.write(`${String(error)}\n`);
  process.exit(1);
});
