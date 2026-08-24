import type { DatosClima } from '../clima';
import {
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
  dimensionesDe,
  empaquetarBalanceado,
  ordenDeclarado,
  ordenarPorAdyacencia,
  type RectanguloAmbiente,
} from './layout';

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
  fachadaPrincipal: string; // rumbo cardinal, ej. 'S'
  envolvente: 'rectangular' | 'organica';
  tecnicaMuro: TecnicaMuro;
  espesorMuro_m: number;
  etapas?: { nombre: string; ambientesIds: string[] }[];
  estrategiaClimatica?: EstrategiaClimatica;
}

/**
 * Cada perfil organiza la planta con una lógica propia, no sólo con una
 * proporción distinta: si los tres perfiles usaran el mismo criterio y sólo
 * cambiara el ancho objetivo, el empaquetado convergía a la misma planta y
 * los "tres caminos" del método Livingston quedaban en uno solo repetido.
 *
 * - fiel-cliente: respeta el orden en que la familia enumeró los ambientes.
 * - organico: fuerza dos filas para que todo ambiente toque el exterior.
 * - bioclimatico: forma derivada del clima (eje largo según Köppen).
 * - autoconstruccion: agrupa por adyacencia, en módulos compactos ampliables.
 */
function organizarPlanta(
  perfil: PerfilId,
  instancias: InstanciaAmbiente[],
  estrategiaReal: EstrategiaClimatica | undefined,
  parametros: ParametrosTransversales,
): RectanguloAmbiente[] {
  if (perfil === 'fiel-cliente') {
    // Respeta el orden en que la familia enumeró los ambientes y arma tres
    // bandas: la casa recogida y convencional que suelen describir.
    return empaquetarBalanceado(ordenDeclarado(instancias), 3, PERFILES[perfil].aspectoDefault);
  }

  if (perfil === 'organico') {
    // Rectángulo áureo en dos bandas: con sólo dos filas cada ambiente da al
    // norte o al sur —ninguno queda encerrado, que es lo que este perfil
    // promete— y la proporción Φ es la aplicación literal de la geometría
    // sagrada que pide el manual (habitación de 3 m → largo armónico 4,85 m).
    const aspecto = parametros.gradoGeometriaSagrada === 'marcado' ? PHI : 1.45;
    return empaquetarBalanceado(ordenarPorAdyacencia(instancias), 2, aspecto);
  }

  if (perfil === 'bioclimatico' && estrategiaReal) {
    // La proporción sale del eje largo que pide el clima; tres bandas dejan
    // una franja de servicios al centro y las piezas habitables al perímetro.
    const aspecto =
      estrategiaReal.ejeLargoPreferido === 'E-O' ? 1.6 : estrategiaReal.ejeLargoPreferido === 'N-S' ? 0.7 : 1.05;
    return empaquetarBalanceado(ordenarPorAdyacencia(instancias), 3, aspecto);
  }

  // Autoconstrucción y respaldo: bandas simples, fáciles de ejecutar por etapas.
  return empaquetarBalanceado(ordenarPorAdyacencia(instancias), 2, 1.2);
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
        `Alero de ${alero_m} m dimensionado por geometría solar real del sitio (Köppen ${clima.koppen.codigo}) — aunque la forma de este perfil no se optimiza por clima, la protección solar sí usa el clima real.`,
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
          `Alero de ${alero_m} m calculado por geometría solar (altitud solsticio verano ${Math.round(altitudSolsticioVerano(clima.lat))}°, invierno ${Math.round(altitudSolsticioInvierno(clima.lat))}°) para la fachada orientada a ${fachadaEcuador(clima.lat)}.`,
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

  const rects = organizarPlanta(perfil, instancias, estrategiaReal, parametros);
  const { ancho_m, profundo_m, area_total_m2 } = dimensionesDe(rects);

  const lat = clima?.lat ?? 0;
  const alero =
    clima && estrategiaReal
      ? calcularAleroPasivo(lat, ALTURA_VENTANA_TIPICA_M, estrategiaReal.enfoque)
      : { profundidad_m: 0.6, altitudVeranoDeg: 0, altitudInviernoDeg: 0, nota: '' };

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

  const pendiente_techo_pct = estrategiaReal?.enfoque === 'ganancia-solar' ? 30 : estrategiaReal?.enfoque === 'sombra-ventilacion' ? 25 : 20;

  const { notas, fuentes } = fundamentoPara(perfil, clima, estrategiaReal, alero.profundidad_m, tecnicaMuro, parametros);
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
    alero_m: alero.profundidad_m,
    altura_muro_m,
    pendiente_techo_pct,
    fachadaPrincipal,
    envolvente: perfil === 'organico' ? 'organica' : 'rectangular',
    tecnicaMuro,
    espesorMuro_m,
    etapas,
    estrategiaClimatica: estrategia,
  };
}

export function hemisferioLegible(lat: number): string {
  return hemisferioDe(lat) === 'sur' ? 'Hemisferio Sur' : 'Hemisferio Norte';
}
