/**
 * Prompts de render fotorrealista, derivados de la geometría real.
 *
 * Reparto de tareas, que es la regla que ordena toda la app:
 *  - las MEDIDAS salen del motor paramétrico (planta, fachadas, DXF, vistas 3D);
 *  - la IMAGEN fotorrealista sólo ilustra materialidad y atmósfera.
 *
 * Por eso el prompt no se escribe a mano: se arma con las dimensiones, la
 * técnica de muro, el alero y el clima que ya calculó el motor, y lleva
 * pegada la advertencia de que la imagen no se cota. Si el render y el plano
 * discrepan, manda el plano.
 *
 * Los prompts salen en inglés porque los generadores de imagen responden
 * bastante mejor en ese idioma; el título y la descripción de cada vista van
 * en español para leerlos en pantalla.
 */
import { TECNICAS_MURO } from '../conocimiento/parametros';
import type { AnteproyectoGenerado } from '../motor/generador';
import { aberturasExteriores } from '../motor/aberturas';
import { direccionSol, VISTAS_3D, type Vista3D } from '../motor/volumen';

export interface PromptRender {
  vistaId: string;
  titulo: string;
  descripcion: string;
  /** Texto listo para pegar en el generador de imágenes. */
  prompt: string;
  /** Lo que hay que pedirle que NO haga. */
  negativo: string;
}

/** Cómo se llama en inglés el punto de vista, para que la cámara quede clara. */
function encuadreDe(v: Vista3D): string {
  const rumbo =
    v.azimut < 22.5 || v.azimut >= 337.5
      ? 'north'
      : v.azimut < 67.5
        ? 'north-east'
        : v.azimut < 112.5
          ? 'east'
          : v.azimut < 157.5
            ? 'south-east'
            : v.azimut < 202.5
              ? 'south'
              : v.azimut < 247.5
                ? 'south-west'
                : v.azimut < 292.5
                  ? 'west'
                  : 'north-west';
  if (v.elevacion > 45) return `high aerial view looking down from the ${rumbo}, drone at about 25 m`;
  if (v.elevacion > 20) return `three-quarter elevated view from the ${rumbo}, camera about 8 m high`;
  return `eye-level view from the ${rumbo}, camera at 1.6 m, standing about 12 m from the house`;
}

/**
 * Paisaje y vegetación que corresponden al clima del sitio. Un render con
 * pinos en el Caribe delata que la imagen no tiene nada que ver con el terreno.
 */
function paisajeDe(koppen: string | undefined): string {
  const grupo = koppen?.[0];
  switch (grupo) {
    case 'A':
      return 'humid tropical setting: banana and plantain leaves, palms, tree ferns, dense green undergrowth, warm humid air, tall cumulus clouds';
    case 'B':
      return 'dry setting: stony ground, dry bunch grasses, agaves and cacti, sparse thorny shrubs, deep blue cloudless sky';
    case 'C':
      return 'temperate setting: meadow grass, broadleaf deciduous trees, kitchen garden beds, soft scattered clouds';
    case 'D':
      return 'cold continental setting: conifers and birches, short grass, crisp clear light, low sun';
    case 'E':
      return 'cold high-altitude setting: rock outcrops, mosses and low tundra shrubs, bare ground, hard clear light';
    default:
      return 'natural rural setting with grass, native shrubs and a few trees';
  }
}

/** Cómo se ve un muro de esa técnica, en términos de textura y color. */
const MATERIAL_EN: Record<string, string> = {
  adobe: 'load-bearing adobe walls finished in earth plaster, warm ochre, slightly irregular hand-floated surface',
  tapial: 'rammed earth walls with visible horizontal lift lines, sandy beige, dense matte surface',
  quincha: 'timber-frame quincha walls with earth plaster over cane, pale sand colour, visible timber posts',
  'paja-encofrada': 'light straw-clay walls in earth plaster, pale straw colour, soft rounded corners',
  fardos: 'straw bale walls in thick earth plaster, deep window reveals, soft rounded edges',
  cordwood: 'cordwood masonry wall with log ends set in earth mortar, strong circular pattern',
  'cana-trenzada': 'woven cane walls with earth plaster, light warm tone, fine texture',
};

function aberturasResumidas(ap: AnteproyectoGenerado): string {
  const porLado = { N: 0, S: 0, E: 0, O: 0 } as Record<string, number>;
  let puertas = 0;
  for (const a of aberturasExteriores(ap)) {
    if (a.clase === 'puerta') puertas++;
    else porLado[a.lado] = (porLado[a.lado] ?? 0) + 1;
  }
  const EN: Record<string, string> = { N: 'north', S: 'south', E: 'east', O: 'west' };
  const partes = Object.entries(porLado)
    .filter(([, n]) => n > 0)
    .map(([lado, n]) => `${n} window${n > 1 ? 's' : ''} on the ${EN[lado]} facade`);
  if (puertas) partes.push(`${puertas} entrance door on the ${EN[ap.fachadaPrincipal] ?? 'main'} facade`);
  return partes.join(', ');
}

export function promptsDeRender(ap: AnteproyectoGenerado, nombreProyecto?: string): PromptRender[] {
  const tecnica = TECNICAS_MURO[ap.tecnicaMuro];
  const material = MATERIAL_EN[ap.tecnicaMuro] ?? 'earthen walls with earth plaster';
  const sol = direccionSol(ap.lat);
  const paisaje = paisajeDe(ap.koppen);
  const aberturas = aberturasResumidas(ap);

  // Un único bloque de hechos geométricos, idéntico en las cinco vistas: si
  // cambiara entre vistas, las cinco imágenes serían de casas distintas.
  const volumen = [
    `single-storey house, rectangular plan ${ap.ancho_m.toFixed(1)} m (east-west) by ${ap.profundo_m.toFixed(1)} m (north-south), ${ap.area_total_m2} m² covered`,
    `wall height ${ap.altura_muro_m.toFixed(2)} m, total height to ridge ${ap.altura_total_m.toFixed(2)} m`,
    `gable roof, ridge running ${ap.ejeCumbrera === 'E-O' ? 'east-west' : 'north-south'}, ${ap.pendiente_techo_pct}% slope, timber structure with clay tiles`,
    `deep overhanging eaves of ${ap.alero_m.toFixed(2)} m on all sides, casting a clear shadow band on the walls`,
    `${(ap.espesorMuro_m * 100).toFixed(0)} cm thick ${tecnica.nombre.toLowerCase()} walls — ${material}`,
    aberturas || 'timber-framed windows on the exterior facades',
  ].join('; ');

  const luz = `sunlight from the ${sol.azimutDeg === 45 ? 'north-east' : 'south-east'} at about ${Math.round(sol.altitudDeg)}° above the horizon (mid-morning at latitude ${ap.lat !== undefined ? ap.lat.toFixed(2) + '°' : 'the site'}), long soft shadows`;

  const encabezado = nombreProyecto ? `Architectural visualization of "${nombreProyecto}". ` : 'Architectural visualization. ';

  return VISTAS_3D.map(v => ({
    vistaId: v.id,
    titulo: v.nombre,
    descripcion: v.descripcion,
    prompt: [
      `${encabezado}Photorealistic exterior render of a natural-building house.`,
      `Camera: ${encuadreDe(v)}.`,
      `Building: ${volumen}.`,
      `Setting: ${paisaje}.`,
      `Light: ${luz}.`,
      'Style: architectural photography, 35 mm lens, no distortion, vertical lines kept vertical, natural colours, no people, no text, no watermark.',
      'The geometry above is fixed and must be respected exactly — do not add floors, wings, balconies or extra volumes.',
    ].join(' '),
    negativo:
      'second storey, extra wings, balconies, glass curtain wall, concrete brutalism, distorted perspective, fisheye, text, watermark, logos, people, cars, furniture outdoors, snow (unless the climate calls for it), tropical palms in a cold climate',
  }));
}

/**
 * Advertencia que acompaña a los renders en pantalla y en cualquier entrega.
 * No es decorativa: un render leído como plano lleva a construir mal.
 */
export const ADVERTENCIA_RENDER =
  'Las imágenes fotorrealistas son ilustrativas: no se cotan ni se miden. ' +
  'Toda medida sale de la planta, las fachadas y el DXF. Si el render y el plano no coinciden, manda el plano.';
