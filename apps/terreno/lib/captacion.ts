/**
 * Captación pluvial y dimensionamiento del tanque.
 *
 * V (m³) = P (mm) × A (m²) × C / 1000, donde P es la precipitación del mes, A el
 * área de captación en planta y C el coeficiente de escurrimiento de la
 * superficie. La división por 1000 convierte mm·m² a m³: 1 mm sobre 1 m² es 1 L.
 *
 * El tanque se dimensiona por el método de la curva de masa (Rippl): la reserva
 * necesaria es el mayor déficit acumulado a lo largo del año, contando que el
 * tanque no guarda más de lo que se vació.
 *
 * FUENTES (trazadas el 23/09/2026; antes esto decía "sin fuente trazada"):
 *
 * - Consumo doméstico y de ganado: FAO, «Rural structures in the tropics:
 *   design and development» (2011), capítulo 19, tablas 19.1 y 19.2.
 * - Porcinos y equinos, que la tabla de FAO no trae: NDSU Extension AS1763,
 *   «Livestock Water Requirements» (rev. 02/2026).
 * - Aves: NSW Department of Education, «Fowls – food and water».
 * - Curva de masa: Rippl, W. (1883), «The capacity of storage reservoirs for
 *   water supply», Minutes of Proceedings ICE 71, 270–278.
 *
 * Cada entrada de CONSUMO_REFS lleva su `fuente` y su `rango`. El valor por
 * defecto es el centro de un animal adulto a temperatura templada; el rango es
 * lo que dice la fuente. Los dos se imprimen y los dos son editables.
 *
 * LA TRAMPA QUE ESTE MÓDULO TENÍA, Y QUE VALE RECORDAR. Las tres superficies de
 * suelo —pastizal, monte, cultivo— traían un coeficiente PLANO: 0,25, 0,15 y
 * 0,35 para cualquier predio del mundo. Pero la escorrentía de una ladera no
 * depende sólo de lo que crece arriba: depende del suelo. La app ya lo sabe
 * —`hidrologiaPredio.ts` deriva el coeficiente anual del grupo hidrológico de
 * SoilGrids y la cobertura de WorldCover— y captación era la única herramienta
 * de diseño que había quedado afuera de esa migración.
 *
 * Medido: sobre un suelo del grupo A (arenoso) la tabla plana sobreestimaba la
 * captación de una ladera de pastizal 3,1 veces, la de monte 2,5 y la de
 * cultivo 3,9. Sobre el grupo D (arcilloso) acertaba. Es decir: estaba
 * calibrada para suelo pesado y fallaba callada en el liviano, que es la
 * dirección peligrosa — el tanque sale chico y el año seco no cierra.
 *
 * Por eso `coefDeSuperficie` pide la hidrología del predio y sólo cae a la
 * tabla cuando no la hay, diciéndolo. Los techos y pavimentos no pasan por ahí:
 * WorldCover no ve tu techo, y para esos la tabla es la respuesta correcta.
 */

import { coefEscorrentiaAnual, type GrupoHidro } from './cuenca';
import {
  ETIQUETAS_TRIMESTRE,
  MESES_POR_TRIMESTRE,
  nombresDeTemporada,
} from './estaciones';

// ─── Superficies ──────────────────────────────────────────────────────────────

export type TipoSuperficie =
  | 'techo_metal'
  | 'techo_paja'
  | 'pavimento'
  | 'camino'
  | 'suelo_pasto'
  | 'suelo_bosque'
  | 'suelo_cultivo'
  | 'personalizado';

/**
 * Una superficie es OBRA o es LADERA, y eso decide de dónde sale su coeficiente.
 *
 * - `obra`: techos y pavimentos. El coeficiente es una propiedad del material y
 *   la tabla lo describe bien en cualquier parte del mundo.
 * - `ladera`: suelo con cobertura. El coeficiente depende del suelo de ESTE
 *   predio, así que la tabla es sólo el piso cuando no hay análisis.
 * - `libre`: lo escribe el usuario.
 */
export type NaturalezaSuperficie = 'obra' | 'ladera' | 'libre';

/**
 * El id de `COBERTURAS` (cuenca.ts) que le corresponde a cada superficie de
 * ladera. Es lo que permite preguntarle a la hidrología del predio en vez de
 * leer el número plano.
 */
export const COBERTURA_SCS_DE_SUPERFICIE: Partial<Record<TipoSuperficie, string>> = {
  suelo_pasto:   'pastura_regular',
  suelo_bosque:  'monte_regular',
  suelo_cultivo: 'cultivo_bueno',
};

export const TIPOS_SUPERFICIE: Record<TipoSuperficie, {
  label:       string;
  /** Coeficiente de escorrentía, adimensional (0–1). Para `ladera` es el respaldo. */
  coef:        number;
  descripcion: string;
  naturaleza:  NaturalezaSuperficie;
  /** Rango publicado por la fuente. `null` cuando lo escribe el usuario. */
  rango:       [number, number] | null;
  fuente:      string;
}> = {
  techo_metal: {
    label: 'Techo metálico / tejas', coef: 0.90, descripcion: 'Zinc, chapa, teja cerámica',
    naturaleza: 'obra', rango: [0.80, 0.95],
    fuente: 'chapa galvanizada, el material de mayor rendimiento del catálogo; la pérdida es humectación y evaporación del primer milímetro',
  },
  techo_paja: {
    label: 'Techo paja / orgánico', coef: 0.60, descripcion: 'Paja, quincho, palma',
    naturaleza: 'obra', rango: [0.20, 0.80],
    fuente: 'rango muy ancho y muy dependiente del espesor, la pendiente y la edad del quincho: acá el default es el que menos hay que creerle',
  },
  pavimento: {
    label: 'Pavimento / concreto', coef: 0.85, descripcion: 'Asfalto, hormigón, ladrillo',
    naturaleza: 'obra', rango: [0.60, 0.90],
    fuente: 'hormigón y asfalto en buen estado; el ladrillo con junta abierta baja al piso del rango',
  },
  camino: {
    label: 'Camino compactado', coef: 0.60, descripcion: 'Tosca, tierra apisonada',
    naturaleza: 'obra', rango: [0.30, 0.80],
    fuente: 'depende del grado de compactación y de si hay cuneta; un camino recién rastreado escurre la mitad que uno transitado',
  },
  suelo_pasto: {
    label: 'Suelo natural / pastizal', coef: 0.25, descripcion: 'Pastura, campo abierto',
    naturaleza: 'ladera', rango: [0.08, 0.28],
    fuente: 'el rango son los cuatro grupos hidrológicos: 0,08 en suelo arenoso y 0,28 en arcilloso',
  },
  suelo_bosque: {
    label: 'Suelo con cobertura arbórea', coef: 0.15, descripcion: 'Monte, bosque, jardín denso',
    naturaleza: 'ladera', rango: [0.06, 0.21],
    fuente: 'el rango son los cuatro grupos hidrológicos: 0,06 en suelo arenoso y 0,21 en arcilloso',
  },
  suelo_cultivo: {
    label: 'Suelo cultivado', coef: 0.35, descripcion: 'Huerta, cultivo anual',
    naturaleza: 'ladera', rango: [0.09, 0.32],
    fuente: 'el rango son los cuatro grupos hidrológicos: 0,09 en suelo arenoso y 0,32 en arcilloso',
  },
  personalizado: {
    label: 'Personalizado', coef: 0.50, descripcion: 'Ingresá el coeficiente manualmente',
    naturaleza: 'libre', rango: null,
    fuente: 'lo pone el usuario',
  },
};

/** De dónde salió el coeficiente que se está usando. Va al informe. */
export type OrigenCoef = 'predio' | 'tabla' | 'usuario';

export interface CoefResuelto {
  coef:   number;
  origen: OrigenCoef;
  /** Qué hay que saber del número. `null` cuando no hay nada que aclarar. */
  aviso:  string | null;
}

/**
 * El coeficiente que corresponde a una superficie, dada la hidrología del predio.
 *
 * `grupo` es el grupo hidrológico del suelo (A a D) que sale de SoilGrids por
 * Saxton-Rawls; `null` cuando el análisis de suelo todavía no corrió o no
 * llegó. Con él, cada superficie de ladera pregunta por SU cobertura, que no es
 * la misma que la cobertura compuesta del predio: un monte y una huerta sobre
 * el mismo suelo escurren distinto.
 *
 * Degrada avisando y nunca inventa: sin análisis de suelo devuelve la tabla y
 * dice que es la tabla. No rellena con un promedio regional.
 */
export function coefDeSuperficie(
  tipo: TipoSuperficie,
  grupo: GrupoHidro | null = null,
): CoefResuelto {
  const ref = TIPOS_SUPERFICIE[tipo];

  if (ref.naturaleza === 'libre') {
    return { coef: ref.coef, origen: 'usuario', aviso: null };
  }

  // Techos y pavimentos no dependen del suelo: WorldCover no ve un techo, y
  // preguntarle por uno daría la cobertura del terreno de alrededor.
  if (ref.naturaleza === 'obra') {
    return {
      coef: ref.coef, origen: 'tabla',
      aviso: `Coeficiente de material, no medido en este predio. Rango de trabajo ${ref.rango![0]}–${ref.rango![1]}: ${ref.fuente}.`,
    };
  }

  const cobertura = COBERTURA_SCS_DE_SUPERFICIE[tipo];
  if (grupo === null || !cobertura) {
    return {
      coef: ref.coef, origen: 'tabla',
      aviso: 'Sin análisis de suelo todavía: este coeficiente es el de un suelo pesado y puede sobreestimar lo que junta una ladera arenosa hasta tres veces. Corré el análisis de suelo antes de dimensionar el tanque con esto.',
    };
  }

  return {
    coef: coefEscorrentiaAnual(grupo, cobertura), origen: 'predio',
    aviso: null,
  };
}

export interface Superficie {
  id:      string;
  tipo:    TipoSuperficie;
  nombre:  string;
  area_m2: number;
  coef:    number;
}

// ─── Categorías de consumo ────────────────────────────────────────────────────

export type TipoConsumo =
  | 'domestico'
  | 'huerta'
  | 'cultivo_extensivo'
  | 'bovinos'
  | 'caprinos_ovinos'
  | 'porcinos'
  | 'aves'
  | 'equinos'
  | 'personalizado';

/** Las cuatro publicaciones que sostienen CONSUMO_REFS. Se imprimen en el informe. */
export const FUENTES_CONSUMO = {
  fao: {
    label: 'FAO — Rural structures in the tropics: design and development (2011), cap. 19, tablas 19.1 y 19.2',
    url: 'https://www.fao.org/4/i2433e/i2433e11.pdf',
  },
  ndsu: {
    label: 'NDSU Extension AS1763 — Livestock Water Requirements (rev. 02/2026)',
    url: 'https://www.ndsu.edu/agriculture/extension/publications/livestock-water-requirements',
  },
  nsw: {
    label: 'NSW Department of Education — Fowls: food and water',
    url: 'https://education.nsw.gov.au/teaching-and-learning/animals-in-schools/animals-in-schools-species/poultry-fowls/fowls-food-and-water',
  },
} as const;

export const CONSUMO_REFS: Record<TipoConsumo, {
  label:                 string;
  unidad:                string;
  litros_dia_por_unidad: number;
  descripcion:           string;
  /** Rango que publica la fuente, en la unidad de la fila. `null` si lo pone el usuario. */
  rango:                 [number, number] | null;
  /** Clave de `FUENTES_CONSUMO`, o `null` cuando el número no sale de una publicación. */
  fuente:                keyof typeof FUENTES_CONSUMO | null;
  /** Qué asume el valor por defecto. Es lo que hay que leer antes de creerle. */
  supuesto:              string;
}> = {
  domestico: {
    label: 'Uso doméstico', unidad: 'personas', litros_dia_por_unidad: 80,
    descripcion: 'Bebida, cocina, higiene (~80 L/p/día)',
    rango: [60, 100], fuente: 'fao',
    supuesto: 'Casa con agua adentro, inodoro, canilla y ducha. La misma tabla da 10–20 L/día si el agua está al lado de la casa pero no adentro, y 2–4 si hay que ir a buscarla a varios kilómetros: el consumo se adapta a la oferta, así que este número describe una instalación, no una necesidad.',
  },
  huerta: {
    label: 'Huerta / jardín', unidad: 'm²', litros_dia_por_unidad: 2,
    descripcion: 'Riego promedio anual (~2 L/m²/día)',
    rango: [1, 6], fuente: null,
    supuesto: 'Promedio anual grueso: 2 L/m²/día son 2 mm/día. La demanda real es la evapotranspiración del cultivo menos la lluvia efectiva, que acequia ya calcula mes a mes en el balance hídrico. Si el calendario está corrido, ese número manda sobre éste.',
  },
  cultivo_extensivo: {
    label: 'Cultivo extensivo', unidad: 'ha', litros_dia_por_unidad: 5000,
    descripcion: 'Riego suplementario (~5 mm/día, 5.000 L/ha)',
    rango: [2000, 8000], fuente: null,
    supuesto: 'Riego suplementario de verano: 5 mm/día sobre una hectárea son 50.000 L, y acá se toma la décima parte porque se riega una fracción del lote. Vale como orden de magnitud; un proyecto de riego se dimensiona con la ETc del cultivo, no con esto.',
  },
  bovinos: {
    label: 'Ganadería bovina', unidad: 'animales', litros_dia_por_unidad: 50,
    descripcion: '15–80 L/animal/día',
    rango: [15, 80], fuente: 'fao',
    supuesto: 'FAO da 50 L/día para una vaca de carne mejorada y 20 para ganado criollo; una lechera en producción llega a 70 y más. El rango ancho es de NDSU, que lo abre por peso, estado y temperatura: la misma vaca toma el doble a 32 °C que a 4 °C.',
  },
  caprinos_ovinos: {
    label: 'Ganadería caprina/ovina', unidad: 'animales', litros_dia_por_unidad: 6,
    descripcion: '3–11 L/animal/día',
    rango: [3, 11], fuente: 'fao',
    supuesto: 'FAO da 5 L para oveja y 3 para cabra; el techo de 11 es de NDSU para una oveja en lactancia con calor. El default de 6 es deliberadamente el lado alto de FAO: quedarse corto de agua para el rodeo es el error caro.',
  },
  porcinos: {
    label: 'Ganadería porcina', unidad: 'animales', litros_dia_por_unidad: 20,
    descripcion: '1–30 L/animal/día',
    rango: [1, 30], fuente: 'ndsu',
    supuesto: 'El rango cubre desde el lechón destetado hasta la cerda en lactancia, que es donde está el techo. 20 L corresponde a un capón de terminación; si el rodeo es de cría, el número real es más alto.',
  },
  aves: {
    label: 'Aves de corral', unidad: 'animales', litros_dia_por_unidad: 0.3,
    descripcion: '0,2–0,5 L/ave/día',
    rango: [0.2, 0.5], fuente: 'nsw',
    supuesto: 'Gallina ponedora adulta: 200 mL/día comiendo 100 g de alimento, y hasta 500 mL en verano. Los pollos jóvenes toman bastante menos, así que para un lote de recría esto sobreestima.',
  },
  equinos: {
    label: 'Equinos', unidad: 'animales', litros_dia_por_unidad: 50,
    descripcion: '18–82 L/animal/día',
    rango: [18, 82], fuente: 'ndsu',
    supuesto: 'Caballo adulto en mantenimiento a temperatura templada. El techo del rango es un animal en trabajo pesado con calor, que puede duplicar el default.',
  },
  personalizado: {
    label: 'Personalizado', unidad: 'unidades', litros_dia_por_unidad: 50,
    descripcion: 'Ingresá el consumo por unidad manualmente',
    rango: null, fuente: null,
    supuesto: 'Lo pone el usuario.',
  },
};

export interface ConsumoCategoria {
  id:                    string;
  tipo:                  TipoConsumo;
  nombre:                string;
  cantidad:              number;
  litros_dia_por_unidad: number;
}

// ─── Tipos de resultado ───────────────────────────────────────────────────────

export interface CaptacionPorSuperficie {
  id:           string;
  nombre:       string;
  anual_m3:     number;
  /**
   * El mismo número en litros, para leerlo sin hacer la cuenta. NO es más
   * preciso: sale de `anual_m3`, que viene redondeado a 0,1 m³, así que
   * siempre es un múltiplo de 100 L. Medido, la diferencia contra la suma sin
   * redondear es de 10 a 40 L sobre volúmenes de 8 a 210 m³ —entre 0,02 % y
   * 0,1 %—, que es ruido al lado de la incertidumbre del coeficiente. Se deja
   * así y se dice, en vez de imprimir dígitos que el método no tiene.
   */
  anual_litros: number;
  mensual_m3:   number[];
  porcentaje:   number;
}

export interface ConsumoPorCategoria {
  id:         string;
  nombre:     string;
  tipo:       TipoConsumo;
  litros_dia: number;
  anual_m3:   number;
  mensual_m3: number[];
  porcentaje: number;
}

export interface BalanceTrimestral {
  nombre:       string;
  meses_label:  string;
  captacion_m3: number;
  consumo_m3:   number;
  balance_m3:   number;
}

export interface ResultadoCaptacion {
  // Mensuales (índice 0=enero)
  captacion_mensual_m3:  number[];
  consumo_mensual_m3:    number[];
  balance_mensual_m3:    number[];

  // Anuales
  captacion_anual_m3:     number;
  captacion_anual_litros: number;
  consumo_anual_m3:       number;
  balance_anual_m3:       number;

  // Tanque
  tanque_recomendado_m3: number;
  cobertura_minima_dias: number;
  meses_deficit:         number;

  // Desglose
  consumo_total_litros_dia: number;
  captacion_por_superficie: CaptacionPorSuperficie[];
  consumo_por_categoria:    ConsumoPorCategoria[];
  balance_trimestral:       BalanceTrimestral[];
}

// ─── Días por mes (año no bisiesto) ──────────────────────────────────────────

const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

// ─── Cálculo principal ────────────────────────────────────────────────────────

export function calcularCaptacion(
  superficies: Superficie[],
  precipMensual: number[],          // mm por mes, 12 valores, índice 0 = enero
  consumoCategorias: ConsumoCategoria[],
  /** Latitud del predio, para nombrar las estaciones. Sin ella no se nombran. */
  lat?: number | null,
): ResultadoCaptacion {

  // --- Captación por superficie ---
  const captacion_por_superficie_raw = superficies.map(s => {
    const mensual_m3 = precipMensual.map(p =>
      Math.round((p * s.area_m2 * s.coef) / 1000 * 100) / 100,
    );
    const anual_m3 = Math.round(mensual_m3.reduce((sum, v) => sum + v, 0) * 10) / 10;
    return { id: s.id, nombre: s.nombre, anual_m3, anual_litros: Math.round(anual_m3 * 1000), mensual_m3 };
  });

  const captacion_mensual_m3 = Array.from({ length: 12 }, (_, i) =>
    Math.round(captacion_por_superficie_raw.reduce((sum, s) => sum + (s.mensual_m3[i] ?? 0), 0) * 10) / 10,
  );
  const captacion_anual_m3 = Math.round(captacion_mensual_m3.reduce((s, v) => s + v, 0) * 10) / 10;

  const captacion_por_superficie: CaptacionPorSuperficie[] = captacion_por_superficie_raw.map(s => ({
    ...s,
    porcentaje: captacion_anual_m3 > 0 ? Math.round((s.anual_m3 / captacion_anual_m3) * 1000) / 10 : 0,
  }));

  // --- Consumo por categoría ---
  const consumo_por_categoria_raw = consumoCategorias.map(c => {
    const litros_dia = c.cantidad * c.litros_dia_por_unidad;
    const mensual_m3 = DIAS_MES.map(dias => Math.round((litros_dia * dias) / 1000 * 100) / 100);
    const anual_m3   = Math.round(mensual_m3.reduce((sum, v) => sum + v, 0) * 10) / 10;
    return { id: c.id, nombre: c.nombre, tipo: c.tipo, litros_dia, anual_m3, mensual_m3 };
  });

  const consumo_mensual_m3 = Array.from({ length: 12 }, (_, i) =>
    Math.round(consumo_por_categoria_raw.reduce((sum, c) => sum + (c.mensual_m3[i] ?? 0), 0) * 10) / 10,
  );
  const consumo_anual_m3        = Math.round(consumo_mensual_m3.reduce((s, v) => s + v, 0) * 10) / 10;
  const consumo_total_litros_dia = consumoCategorias.reduce((sum, c) => sum + c.cantidad * c.litros_dia_por_unidad, 0);

  const consumo_por_categoria: ConsumoPorCategoria[] = consumo_por_categoria_raw.map(c => ({
    ...c,
    porcentaje: consumo_anual_m3 > 0 ? Math.round((c.anual_m3 / consumo_anual_m3) * 1000) / 10 : 0,
  }));

  // --- Balance mensual y anual ---
  const balance_mensual_m3 = captacion_mensual_m3.map((c, i) =>
    Math.round((c - (consumo_mensual_m3[i] ?? 0)) * 10) / 10,
  );
  const captacion_anual_litros = Math.round(captacion_anual_m3 * 1000);
  const balance_anual_m3       = Math.round((captacion_anual_m3 - consumo_anual_m3) * 10) / 10;
  const meses_deficit          = balance_mensual_m3.filter(b => b < 0).length;

  // --- Tanque recomendado (curva de masa) ---
  // El año se recorre dos veces. La seca puede empezar en noviembre y terminar
  // en marzo, y cortando el conteo el 31 de diciembre ese déficit se parte al
  // medio: el tanque salía chico justo en el caso más común de un clima con
  // estación seca de verano. Con el acumulado topado en cero —el tanque no
  // guarda más de lo que se vació— dos vueltas alcanzan para que el mes por el
  // que se arranca deje de importar, y se mide sobre la segunda.
  //
  // Con déficit anual la curva de masa no cierra: no hay excedente que guardar y
  // dos vueltas darían el doble sin significado. Ahí se dimensiona sobre un año,
  // y los que cuentan la verdad son meses_deficit y balance_anual_m3, que ya
  // dicen que con un tanque no se arregla.
  const vueltas = balance_anual_m3 >= 0 ? 2 : 1;
  let acumulado = 0;
  let maxDeficit = 0;
  for (let vuelta = 1; vuelta <= vueltas; vuelta++) {
    for (const b of balance_mensual_m3) {
      acumulado = Math.min(acumulado + b, 0);
      if (vuelta === vueltas) maxDeficit = Math.min(maxDeficit, acumulado);
    }
  }
  // El 1,2 es un margen sobre el déficit calculado: la serie mensual es un
  // promedio y un año más seco que la media no está en ella. El piso de medio
  // mes de consumo evita recomendar un tanque ridículo cuando el balance da
  // holgado todos los meses. Los dos son criterios de diseño de esta app, no
  // valores publicados, y por eso están con nombre y no escondidos en la cuenta.
  const MARGEN_SOBRE_DEFICIT = 1.2;
  const RESERVA_MINIMA_MESES = 0.5;
  const consumo_mes_promedio    = consumo_anual_m3 / 12;
  const tanque_recomendado_m3   = Math.round(
    Math.max(
      Math.abs(maxDeficit) * MARGEN_SOBRE_DEFICIT,
      consumo_mes_promedio * RESERVA_MINIMA_MESES,
    ) * 10,
  ) / 10;

  const captMinMes              = Math.max(Math.min(...captacion_mensual_m3), 0);
  const consumoDiario_m3        = consumo_total_litros_dia / 1000;
  const cobertura_minima_dias   = consumoDiario_m3 > 0 ? Math.round(captMinMes / consumoDiario_m3) : 0;

  // --- Balance trimestral ---
  const nombres = nombresDeTemporada(lat);
  const balance_trimestral: BalanceTrimestral[] = MESES_POR_TRIMESTRE.map((meses, i) => {
    const captacion_m3 = Math.round(meses.reduce((sum, mi) => sum + (captacion_mensual_m3[mi] ?? 0), 0) * 10) / 10;
    const consumo_m3   = Math.round(meses.reduce((sum, mi) => sum + (consumo_mensual_m3[mi] ?? 0), 0) * 10) / 10;
    return {
      nombre:       nombres[i] ?? ETIQUETAS_TRIMESTRE[i]!,
      meses_label:  ETIQUETAS_TRIMESTRE[i]!,
      captacion_m3,
      consumo_m3,
      balance_m3:   Math.round((captacion_m3 - consumo_m3) * 10) / 10,
    };
  });

  return {
    captacion_mensual_m3,
    consumo_mensual_m3,
    balance_mensual_m3,
    captacion_anual_m3,
    captacion_anual_litros,
    consumo_anual_m3,
    balance_anual_m3,
    tanque_recomendado_m3,
    cobertura_minima_dias,
    meses_deficit,
    consumo_total_litros_dia,
    captacion_por_superficie,
    consumo_por_categoria,
    balance_trimestral,
  };
}

// ─── Snapshot para informe / guardar ─────────────────────────────────────────

export interface CaptacionSnapshot {
  superficies:       Superficie[];
  consumoCategorias: ConsumoCategoria[];
  /**
   * El cálculo, cuando hay datos de clima cargados. Es nullable a propósito:
   * antes el snapshot se emitía sólo si el cálculo salía, así que quien cargaba
   * las superficies y los consumos *antes* de traer el clima perdía todo lo
   * tipeado al cambiar de pestaña. Ahora las superficies viajan siempre.
   */
  resultado:         ResultadoCaptacion | null;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function nuevaSuperficieDefault(): Superficie {
  return {
    id:      crypto.randomUUID(),
    tipo:    'techo_metal',
    nombre:  'Techo principal',
    area_m2: 50,
    coef:    TIPOS_SUPERFICIE.techo_metal.coef,
  };
}

export function nuevaConsumoDefault(): ConsumoCategoria {
  const ref = CONSUMO_REFS.domestico;
  return {
    id:                    crypto.randomUUID(),
    tipo:                  'domestico',
    nombre:                'Uso doméstico',
    cantidad:              4,
    litros_dia_por_unidad: ref.litros_dia_por_unidad,
  };
}
