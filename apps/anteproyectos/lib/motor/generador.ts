import type { DatosClima } from '../clima';
import {
  aleroPorLluvia,
  ALTURA_MURO_POR_ENFOQUE,
  CIMIENTOS,
  PHI,
  PROFUNDIDAD_MAX_CRUJIA_M,
  RATIO_VIDRIADO_POR_ENFOQUE,
  REFUERZO_SISMICO,
  TECNICAS_MURO,
  tecnicaRecomendada,
  type TecnicaMuro,
} from '../conocimiento/parametros';
import { PERFILES } from '../perfiles';
import type { ParametrosTransversales, PerfilId, ProgramaNecesidades } from '../tipos';
import {
  altitudSolsticioInvierno,
  altitudSolsticioVerano,
  calcularAleroPasivo,
  estrategiaClimatica,
  fachadaEcuador,
  hemisferioDe,
  rumboACardinal4,
  type EstrategiaClimatica,
} from './bioclimatica';
import { expandirAmbientes, type InstanciaAmbiente } from './areas';
import {
  anchoMinimoDe,
  dimensionesDe,
  empaquetarBalanceado,
  empaquetarEnBandas,
  esServidor,
  ordenDeclarado,
  ordenarPorAdyacencia,
  ordenarPorZonificacionTermica,
  repartirPorArea,
  type RectanguloAmbiente,
} from './layout';

/**
 * Cuánto defiende cada perfil su propio orden de ambientes frente al
 * optimizador. Alto frente a la proporción (unidades ~1–8), bajo frente a un
 * ambiente inutilizable (1000): el partido manda, la habitabilidad más.
 */
const PESO_ORDEN_DE_PARTIDO = 25;

/**
 * El perfil bioclimático defiende la proporción del edificio con fuerza: el
 * eje largo hacia el ecuador es su decisión de proyecto, no una preferencia.
 */
const PESO_ASPECTO_BIOCLIMATICO = 30;

const ALTURA_VENTANA_TIPICA_M = 1.4;
/** Altura usada cuando no hay datos de clima para elegir una por enfoque. */
export const ALTURA_MURO_FALLBACK_M = 2.6;

export interface AnteproyectoGenerado {
  perfil: PerfilId;
  titulo: string;
  fundamento: string[];
  /** ids de `REFERENTES` que respaldan las decisiones de este anteproyecto. */
  fuentes: string[];
  /** Problemas detectados en el esquema generado (ambientes sin luz natural, etc.). */
  advertencias: string[];
  ambientes: RectanguloAmbiente[];
  ancho_m: number;
  profundo_m: number;
  area_total_m2: number;
  alero_m: number;
  altura_muro_m: number;
  pendiente_techo_pct: number;
  /** Dirección de la cumbrera: corre siempre sobre el eje largo del edificio. */
  ejeCumbrera: 'E-O' | 'N-S';
  /** Altura de la cumbrera por encima del nivel superior del muro. */
  altura_cumbrera_m: number;
  /** Altura total del edificio sobre el nivel de piso terminado. */
  altura_total_m: number;
  fachadaPrincipal: string; // rumbo cardinal, ej. 'S'
  envolvente: 'rectangular' | 'organica';
  tecnicaMuro: TecnicaMuro;
  espesorMuro_m: number;
  etapas?: { nombre: string; ambientesIds: string[] }[];
  estrategiaClimatica?: EstrategiaClimatica;
  /** Latitud del sitio, si se conoce: define el sol de las vistas 3D. */
  lat?: number;
  koppen?: string;
}

/**
 * Cada perfil resuelve un PARTIDO distinto, no la misma planta con otra
 * proporción.
 *
 * Es la razón de ser de ofrecer tres opciones: si las tres se organizan igual,
 * la familia elige entre tres versiones de lo mismo y el método participativo
 * pierde sentido. La primera versión sólo cambiaba el aspecto del rectángulo
 * y las tres plantas salían idénticas salvo unos centímetros.
 *
 * - fiel-cliente: compacta y en tres bandas, con el orden en que la familia
 *   enumeró los ambientes respetado tal cual.
 * - organico: dos bandas por adyacencia —todo ambiente toca el exterior— con
 *   proporción áurea y envolvente curva.
 * - bioclimatico: zonificación térmica servidos/servidores. El núcleo de
 *   servicios se arrima al extremo opuesto al ecuador —de colchón— y los
 *   dormitorios se quedan con la buena orientación. No es una banda de
 *   servicios pura: con 8 m² de baño y hall en una casa de 90 m² una banda
 *   entera de servicios sería un disparate y el empaquetador la descarta.
 * - autoconstruccion: bandas simples por adyacencia, fáciles de fraccionar.
 *
 * Los cuatro pasan `pesoOrden` alto: el orden es la decisión de partido del
 * perfil y sólo se cede si no hay forma de que la planta sea habitable.
 */
/**
 * Partido de cada perfil: la organización de la planta, no su proporción.
 *
 * Los tres perfiles usaban el mismo empaquetador con otro orden y otro
 * aspecto, y por eso convergían: dado un programa, el óptimo del empaquetador
 * es uno solo, así que las tres plantas salían con las mismas bandas y los
 * mismos ambientes en el mismo lugar, estiradas de distinta manera. Comparar
 * las medidas no lo mostraba —daban tres rectángulos distintos—; comparar la
 * organización, sí.
 *
 * Ahora cada perfil compone sus bandas y sólo cede la proporción:
 *
 * - `compacta`: perímetro mínimo, bandas elegidas por el optimizador.
 * - `crujia-simple`: una sola crujía, todos los ambientes en fila. Cada uno
 *   con dos caras al exterior: ventilación cruzada y luz bilateral.
 * - `nucleo-central`: el espacio común como banda central y los dormitorios
 *   repartidos a ambos lados, girando alrededor de él.
 */
export type Partido = 'compacta' | 'crujia-simple' | 'nucleo-central';

/** Enfoques climáticos donde la casa pasante gana a la casa compacta. */
const ENFOQUES_DE_CRUJIA_SIMPLE = new Set(['sombra-ventilacion', 'mixto']);

/**
 * Hasta cuántos ambientes admite una crujía simple.
 *
 * Sin circulación propia, una casa de una sola crujía se recorre pasando por
 * un ambiente para llegar al siguiente. Con tres o cuatro ambientes eso es
 * una casa rural de toda la vida; con diez es una hilera de piezas de 1,7 m
 * a la que hay que atravesar entera para llegar al baño.
 */
const MAX_AMBIENTES_CRUJIA_SIMPLE = 7;

export function partidoDe(
  perfil: PerfilId,
  estrategia: EstrategiaClimatica | undefined,
  cantidadAmbientes: number,
): Partido {
  if (perfil === 'organico') return 'nucleo-central';
  if (perfil === 'bioclimatico') {
    // En trópico y clima mixto manda ventilar: una sola crujía, eje largo al
    // ecuador, todo ambiente pasante. En clima frío o árido manda conservar,
    // y la casa compacta con los servicios de colchón es la respuesta correcta
    // aunque se parezca más al perfil fiel al cliente.
    //
    // El eje norte-sur también la descarta: el motor arma las bandas siempre
    // en horizontal, así que una crujía simple es por construcción ancha y
    // poco profunda. Forzarla cuando el clima pide el eje largo norte-sur
    // daba una casa que contradecía su propio fundamento.
    const pasante =
      estrategia !== undefined &&
      ENFOQUES_DE_CRUJIA_SIMPLE.has(estrategia.enfoque) &&
      estrategia.ejeLargoPreferido !== 'N-S' &&
      cantidadAmbientes <= MAX_AMBIENTES_CRUJIA_SIMPLE;
    return pasante ? 'crujia-simple' : 'compacta';
  }
  return 'compacta';
}

/**
 * Bandas del partido de núcleo central: dormitorios / espacio común /
 * dormitorios + servicios.
 *
 * Si el programa no da para tres bandas —falta un espacio común claro o no hay
 * dormitorios suficientes para repartir a los lados— se resuelve con dos, que
 * sigue siendo una organización distinta de la compacta porque el común queda
 * en el medio de la casa y no en una punta.
 */
function bandasNucleoCentral(instancias: InstanciaAmbiente[]): InstanciaAmbiente[][] {
  const porAdyacencia = ordenarPorAdyacencia(instancias);
  const comunes = porAdyacencia.filter(i => i.tipo === 'estar-cocina-comedor' || i.tipo === 'galeria');
  const resto = porAdyacencia.filter(i => !esServidor(i) && !comunes.includes(i));

  // Sin un espacio común claro, o sin dormitorios suficientes para repartir a
  // ambos lados, se resuelve con dos bandas: sigue siendo distinto de la
  // compacta porque el común queda en el medio de la casa y no en una punta.
  if (!comunes.length || resto.length < 2) return [resto, comunes].filter(b => b.length > 0);

  const [alaA = [], alaB = []] = repartirPorArea(resto, 2);
  return [alaA, comunes, alaB].filter(b => b.length > 0);
}

function organizarPlanta(
  perfil: PerfilId,
  instancias: InstanciaAmbiente[],
  estrategiaReal: EstrategiaClimatica | undefined,
  parametros: ParametrosTransversales,
  lat: number,
): RectanguloAmbiente[] {
  const partido = partidoDe(perfil, perfil === 'bioclimatico' ? estrategiaReal : undefined, instancias.length);

  const servidores = ordenarPorAdyacencia(instancias).filter(esServidor);

  if (partido === 'nucleo-central') {
    // Φ es la aplicación literal de la geometría sagrada del manual.
    const aspecto = parametros.gradoGeometriaSagrada === 'marcado' ? PHI : 1.45;
    return empaquetarEnBandas(bandasNucleoCentral(instancias), servidores, aspecto);
  }

  if (partido === 'crujia-simple') {
    // Una sola banda: el ancho del edificio lo termina fijando la
    // habitabilidad de los ambientes y no el aspecto pedido, así que la casa
    // sale larga y angosta — que es justamente el partido.
    const servidosPrimero = hemisferioDe(lat) === 'sur';
    const habitables = ordenarPorZonificacionTermica(instancias, servidosPrimero).filter(i => !esServidor(i));
    return empaquetarEnBandas([habitables], servidores, 2.6, PESO_ASPECTO_BIOCLIMATICO);
  }

  if (perfil === 'bioclimatico' && estrategiaReal) {
    // Compacta con zonificación térmica: los servidos hacia el ecuador y los
    // servidores como colchón sobre la cara castigada. Las bandas las fija el
    // partido y no el optimizador, para que no vuelva a coincidir con el
    // perfil fiel al cliente.
    const servidosPrimero = hemisferioDe(lat) === 'sur';
    const servidos = ordenarPorZonificacionTermica(instancias, servidosPrimero).filter(i => !esServidor(i));
    const aspecto =
      estrategiaReal.ejeLargoPreferido === 'E-O' ? 1.9 : estrategiaReal.ejeLargoPreferido === 'N-S' ? 0.6 : 1.05;
    // Los servidos se reparten en dos bandas y el núcleo de servicios busca
    // dónde entrar: el resultado es el colchón térmico cuando el programa da
    // para una tira entera, y un núcleo contra un lateral cuando no da.
    return empaquetarEnBandas(repartirPorArea(servidos, 2), servidores, aspecto, PESO_ASPECTO_BIOCLIMATICO);
  }

  if (perfil === 'fiel-cliente') {
    return empaquetarBalanceado(ordenDeclarado(instancias), 3, PERFILES[perfil].aspectoDefault, {
      pesoOrden: PESO_ORDEN_DE_PARTIDO,
    });
  }

  return empaquetarBalanceado(ordenarPorAdyacencia(instancias), 2, 1.2, { pesoOrden: PESO_ORDEN_DE_PARTIDO });
}

function fundamentoPara(
  perfil: PerfilId,
  clima: DatosClima | null,
  estrategia: EstrategiaClimatica | undefined,
  alero_m: number,
  tecnica: TecnicaMuro,
  parametros: ParametrosTransversales,
): { notas: string[]; fuentes: string[] } {
  const notas: string[] = [];
  const fuentes = new Set<string>();

  const notaAleroGenerico = () => {
    if (clima?.koppen && estrategia) {
      notas.push(
        `Alero dimensionado con el clima real del sitio (Köppen ${clima.koppen.codigo}) — aunque la forma de este perfil no se optimiza por clima, la protección sí usa el clima real.`,
      );
      fuentes.add('moore-ecs');
    }
  };

  switch (perfil) {
    case 'fiel-cliente':
      notas.push(
        'Partido interpretado a partir del dibujo libre y el "día en la casa" del cuaderno, corregido con circulaciones y cotas reales.',
      );
      notas.push('Método Livingston: se respeta la intención espacial declarada por la familia por sobre una forma óptima abstracta.');
      fuentes.add('ayt-cuaderno-participativo');
      notaAleroGenerico();
      break;

    case 'organico':
      notas.push('Trazado regulador con proporción áurea (Φ ≈ 1,618) como partido organizador; envolvente curva sobre el núcleo de ambientes.');
      notas.push('Prioriza galerías y aberturas amplias hacia las vistas y la vegetación relevadas en la caminata interpretativa del cuaderno.');
      fuentes.add('modulor');
      fuentes.add('ayt-manual-bioconstruccion');
      fuentes.add('hundertwasser');
      fuentes.add('wright');
      if (parametros.pesoIntegracionProductiva !== 'bajo') {
        notas.push('Fuerte relación interior-exterior con los espacios productivos (huerta, invernadero) del programa.');
      }
      notaAleroGenerico();
      break;

    case 'bioclimatico':
      if (clima?.koppen && estrategia) {
        notas.push(`Sitio clasificado Köppen ${clima.koppen.codigo} (${clima.koppen.descripcion}). ${estrategia.descripcion}`);
        notas.push(
          `Geometría solar del sitio: altitud del sol al mediodía ${Math.round(altitudSolsticioVerano(clima.lat))}° en el solsticio de verano y ${Math.round(altitudSolsticioInvierno(clima.lat))}° en el de invierno, sobre la fachada orientada a ${fachadaEcuador(clima.lat)}. Por sombra pide un alero de ${alero_m.toFixed(2)} m.`,
        );
        notas.push(`Viento dominante relevado: ${clima.viento_dir_ppal}. Aberturas enfrentadas para ventilación cruzada.`);
        const ratio = RATIO_VIDRIADO_POR_ENFOQUE[estrategia.enfoque];
        notas.push(
          `Superficie vidriada objetivo ${Math.round(ratio.min * 100)}–${Math.round(ratio.max * 100)} % de la superficie de piso. ${ratio.nota}`,
        );
        fuentes.add('mahoney');
        fuentes.add('givoni');
        fuentes.add('olgyay');
        fuentes.add('moore-ecs');
      } else {
        notas.push('Análisis climático del sitio no disponible: perfil generado con parámetros genéricos, a recalcular con las coordenadas del terreno.');
      }
      notas.push('Principios Passive House adaptados al clima real del sitio (no hermeticidad de clima frío si el clima no lo pide).');
      fuentes.add('phi');
      break;

    case 'autoconstruccion':
      notas.push(
        `Programa fraccionado en etapas constructivas independientes, calibrado según el nivel de autoconstrucción declarado (${parametros.nivelAutoconstruccion}).`,
      );
      notas.push('Cada etapa es habitable por sí sola: núcleo húmedo + estar + primer dormitorio antes de ampliar.');
      fuentes.add('ayt-cuaderno-participativo');
      notaAleroGenerico();
      break;
  }

  // Técnica constructiva — común a todos los perfiles, del manual propio.
  const t = TECNICAS_MURO[tecnica];
  notas.push(`Técnica de muro sugerida: ${t.nombre} (espesor ${(t.espesor_tipico_m * 100).toFixed(0)} cm). ${t.nota}`);
  notas.push(CIMIENTOS.nota);
  fuentes.add('ayt-manual-bioconstruccion');
  fuentes.add('minke');

  return { notas, fuentes: [...fuentes] };
}

function etapasAutoconstruccion(rects: RectanguloAmbiente[]): { nombre: string; ambientesIds: string[] }[] {
  const nucleo = rects.filter(r => ['estar-cocina-comedor', 'bano', 'hall', 'lavadero'].includes(r.tipo));
  const primerDormitorio = rects.find(r => r.tipo === 'dormitorio');
  const etapa1 = [...nucleo, ...(primerDormitorio ? [primerDormitorio] : [])];
  const idsEtapa1 = new Set(etapa1.map(r => r.id));
  const etapa2 = rects.filter(r => !idsEtapa1.has(r.id));
  const etapas = [{ nombre: 'Etapa 1 — núcleo habitable', ambientesIds: etapa1.map(r => r.id) }];
  if (etapa2.length) etapas.push({ nombre: 'Etapa 2 — ampliación', ambientesIds: etapa2.map(r => r.id) });
  return etapas;
}

/** Ambientes habitables que quedaron sin ningún lado exterior no tienen luz ni ventilación natural. */
const TIPOS_QUE_EXIGEN_LUZ = new Set(['dormitorio', 'estar-cocina-comedor', 'estudio', 'taller', 'invernadero', 'galeria']);

function detectarAdvertencias(rects: RectanguloAmbiente[], profundo_m: number): string[] {
  const avisos: string[] = [];

  // El empaquetado penaliza fuerte los ambientes por debajo de su ancho
  // utilizable, pero a veces no hay disposición que los evite. Cuando pasa hay
  // que decirlo: un baño de 1,2 m se dibuja igual y no se puede usar.
  const angostos = rects.filter(r => Math.min(r.w_m, r.h_m) < anchoMinimoDe(r.tipo) - 0.01);
  if (angostos.length) {
    const detalle = angostos
      .map(r => r.nombre + " (" + Math.min(r.w_m, r.h_m).toFixed(2) + " m, mínimo " + anchoMinimoDe(r.tipo).toFixed(2) + " m)")
      .join(", ");
    avisos.push(
      "Por debajo del ancho utilizable: " + detalle +
        ". Hay que agrandar ese ambiente, quitar otro del programa o aceptar una planta más profunda.",
    );
  }

  const sinExterior = rects.filter(
    r => TIPOS_QUE_EXIGEN_LUZ.has(r.tipo) && !r.exteriorNorte && !r.exteriorSur && !r.exteriorEste && !r.exteriorOeste,
  );
  if (sinExterior.length) {
    avisos.push(
      `Sin luz natural directa: ${sinExterior.map(r => r.nombre).join(', ')}. Requiere patio, lucernario o reordenar la planta.`,
    );
  }

  const unSoloLado = rects.filter(r => {
    if (!TIPOS_QUE_EXIGEN_LUZ.has(r.tipo)) return false;
    const lados = [r.exteriorNorte, r.exteriorSur, r.exteriorEste, r.exteriorOeste].filter(Boolean).length;
    return lados === 1;
  });
  if (unSoloLado.length) {
    avisos.push(
      `Luz de un solo lado (patrón "Light on Two Sides", Alexander): ${unSoloLado.map(r => r.nombre).join(', ')}. Mejora con una abertura adicional en otra cara.`,
    );
  }

  if (profundo_m > PROFUNDIDAD_MAX_CRUJIA_M * 1.5) {
    avisos.push(
      `Profundidad de ${profundo_m.toFixed(1)} m: por encima de ~${(PROFUNDIDAD_MAX_CRUJIA_M * 1.5).toFixed(0)} m es difícil que todos los ambientes reciban luz natural. Considerar planta en L o U, o un patio.`,
    );
  }

  return avisos;
}

export function generarAnteproyecto(
  perfil: PerfilId,
  programa: ProgramaNecesidades,
  parametros: ParametrosTransversales,
  clima: DatosClima | null,
  opciones: { zonaSismica?: boolean } = {},
): AnteproyectoGenerado {
  const instancias: InstanciaAmbiente[] = expandirAmbientes(programa.ambientes);

  // La estrategia climática real del sitio se calcula siempre que haya datos
  // de clima, independientemente del perfil: el alero de los 4 perfiles debe
  // proteger del sol real del sitio. Solo el perfil bioclimático además usa
  // esta estrategia para definir la FORMA del edificio (ver organizarPlanta).
  const estrategiaReal = clima?.koppen ? estrategiaClimatica(clima.koppen) : undefined;
  const estrategia = perfil === 'bioclimatico' ? estrategiaReal : undefined;

  const rects = organizarPlanta(perfil, instancias, estrategiaReal, parametros, clima?.lat ?? 0);
  const { ancho_m, profundo_m, area_total_m2 } = dimensionesDe(rects);

  const lat = clima?.lat ?? 0;

  const fachadaPrincipal =
    clima && estrategiaReal
      ? estrategiaReal.fachadaPrioritaria === 'ecuador'
        ? fachadaEcuador(lat)
        : estrategiaReal.fachadaPrioritaria === 'viento-dominante'
          ? rumboACardinal4(clima.viento_dir_ppal)
          : 'N'
      : 'N';

  // Altura libre y técnica de muro salen de la base de conocimiento, según el
  // enfoque climático real del sitio (más altura en trópico para estratificar,
  // menos volumen a calentar en clima frío).
  const altura_muro_m = estrategiaReal ? ALTURA_MURO_POR_ENFOQUE[estrategiaReal.enfoque] : ALTURA_MURO_FALLBACK_M;
  const tecnicaMuro = tecnicaRecomendada(estrategiaReal?.enfoque ?? 'mixto', opciones.zonaSismica);
  const espesorMuro_m = TECNICAS_MURO[tecnicaMuro].espesor_tipico_m;

  // El alero se dimensiona por DOS criterios y manda el mayor: el sol y la
  // lluvia. Dimensionarlo sólo por sol da el resultado más peligroso justo en
  // el trópico húmedo —donde el sol de mediodía cae casi vertical y la sombra
  // se resuelve con 40 cm— dejando el muro de tierra a la intemperie.
  const aleroSolar =
    clima && estrategiaReal
      ? calcularAleroPasivo(lat, ALTURA_VENTANA_TIPICA_M, estrategiaReal.enfoque)
      : { profundidad_m: 0.6, altitudVeranoDeg: 0, altitudInviernoDeg: 0, nota: '' };
  const aleroLluvia = clima ? aleroPorLluvia(clima.precip_anual_mm, altura_muro_m, tecnicaMuro) : null;
  const alero_m = Math.max(aleroSolar.profundidad_m, aleroLluvia?.min_m ?? 0);
  const mandaLluvia = aleroLluvia !== null && aleroLluvia.min_m > aleroSolar.profundidad_m;

  const pendiente_techo_pct = estrategiaReal?.enfoque === 'ganancia-solar' ? 30 : estrategiaReal?.enfoque === 'sombra-ventilacion' ? 25 : 20;

  // El techo es a dos aguas con la cumbrera sobre el eje largo: las faldas
  // caen hacia los dos lados más largos, que son los que más muro tienen para
  // proteger. La altura de cumbrera sale de la luz que se cubre —la dimensión
  // PERPENDICULAR a la cumbrera— y se calcula una sola vez acá.
  //
  // Antes cada fachada la deducía de su propio ancho, así que la misma casa se
  // dibujaba con dos alturas totales distintas según el lado que se mirara.
  const ejeCumbrera: 'E-O' | 'N-S' = ancho_m >= profundo_m ? 'E-O' : 'N-S';
  const luzCubierta_m = ejeCumbrera === 'E-O' ? profundo_m : ancho_m;
  const altura_cumbrera_m =
    Math.round(Math.min(Math.max((luzCubierta_m / 2) * (pendiente_techo_pct / 100), 0.8), 4) * 100) / 100;
  const altura_total_m = Math.round((altura_muro_m + altura_cumbrera_m) * 100) / 100;

  // El fundamento recibe el alero SOLAR, no el adoptado: cada criterio declara
  // su propio número y después se dice cuál mandó. Pasarle el adoptado hacía
  // que la nota solar se atribuyera una medida que el sol no había pedido.
  const { notas, fuentes } = fundamentoPara(perfil, clima, estrategiaReal, aleroSolar.profundidad_m, tecnicaMuro, parametros);
  if (aleroLluvia) notas.push(aleroLluvia.nota);
  if (clima) {
    notas.push(
      `Alero adoptado: ${alero_m.toFixed(2)} m — manda el criterio de ${mandaLluvia ? 'lluvia' : 'sombra solar'}, que es el más exigente en este sitio.`,
    );
  }
  if (opciones.zonaSismica) notas.push(REFUERZO_SISMICO.descripcion);

  const etapas = perfil === 'autoconstruccion' && parametros.modularidadEtapas ? etapasAutoconstruccion(rects) : undefined;

  return {
    perfil,
    titulo: PERFILES[perfil].nombre,
    fundamento: notas,
    fuentes,
    advertencias: detectarAdvertencias(rects, profundo_m),
    ambientes: rects,
    ancho_m,
    profundo_m,
    area_total_m2,
    alero_m,
    altura_muro_m,
    pendiente_techo_pct,
    ejeCumbrera,
    altura_cumbrera_m,
    altura_total_m,
    fachadaPrincipal,
    envolvente: perfil === 'organico' ? 'organica' : 'rectangular',
    tecnicaMuro,
    espesorMuro_m,
    etapas,
    estrategiaClimatica: estrategia,
    lat: clima ? clima.lat : undefined,
    koppen: clima?.koppen?.codigo,
  };
}

export function hemisferioLegible(lat: number): string {
  return hemisferioDe(lat) === 'sur' ? 'Hemisferio Sur' : 'Hemisferio Norte';
}
