/**
 * Tipos de las fichas de ecosistema.
 *
 * Viven separados de `lib/contexto.ts` porque los tres catálogos de fichas
 * (sudamericanas, regionales y globales) los necesitan, y contexto importa a
 * los tres. Acá no hay datos ni lógica: sólo formas.
 */

export interface SaberCultural {
  cultura: string;   // pueblo o tradición
  practicas: string; // descripción de prácticas y sistemas productivos
}

export interface Fuente { label: string; url: string }

/**
 * Un ajuste a la aptitud de uso del suelo, con nombre y motivo.
 *
 * La aptitud se calcula del relieve —pendiente, orientación, agua que junta la
 * celda— y el relieve no sabe en qué bioma está: una loma suave es igual de
 * suave en la Amazonia que en la Patagonia, pero abrir huerta intensiva no
 * significa lo mismo en las dos. Estos modificadores son el lugar donde eso se
 * dice.
 *
 * El `delta` se suma al score de 0 a 100 de ese uso en todas las celdas del
 * predio, y la `razon` viaja hasta la pantalla. Un puntaje que se mueve sin
 * decir por qué es peor que no moverlo, porque el usuario no puede discutirlo.
 */
export interface ModificadorAptitud {
  /** Id de `TipoAptitud` en `lib/aptitud.ts`. Va como unión literal y no
   *  importado para no arrastrar ese módulo —que trae turf— adentro de cada
   *  catálogo de fichas. */
  uso: 'huerta' | 'frutales' | 'pasturas' | 'forestal' | 'reserva';
  delta: number;
  razon: string;
}

export interface BiomaFicha {
  id: string;
  nombre: string;
  emoji: string;
  color: string;
  resumen: string;
  vegetacion: string;
  fauna: string;
  suelos: string;
  /** Puede venir vacío: las fichas de bioma global no atribuyen saberes a
   *  ninguna cultura en particular, porque a esa escala sería inventar. */
  saberes: SaberCultural[];
  /** Puede venir vacío por la misma razón: las especies son regionales.
   *  Esto es **flora nativa**: lo que crece ahí sin que nadie lo plante. Lo que
   *  se cultiva va en `cultivos`, que es otra lista y otro catálogo. */
  especies: string[];
  /** Ids del catálogo de `lib/especies.ts`: qué se cultiva acá y con qué rol
   *  dentro del sistema. Opcional — la ficha que no lo declara cae al catálogo
   *  por clase Köppen, que es más grueso pero nunca deja la sección vacía. */
  cultivos?: string[];
  /** Correcciones a la aptitud de uso del suelo que impone el ecosistema. */
  aptitud?: ModificadorAptitud[];
  /**
   * Prácticas documentadas en el territorio, fechadas y sin dueño declarado.
   *
   * No la escriben los catálogos generados: la inyecta `fichaPorId` desde
   * `lib/practicasHistoricas.ts`, que es una capa editorial escrita a mano y
   * que ningún montaje pisa. Ver ahí el porqué.
   */
  practicas?: PracticaHistorica[];
  fuentes: Fuente[];
}

/**
 * De qué tipo es la práctica. Sirve para ordenar la lista y para que el
 * diseñador encuentre rápido lo que le sirve: el que viene por agua no quiere
 * leer sobre caza.
 */
export type TipoPractica =
  | 'agua'        // cosecha, conducción, riego, drenaje
  | 'suelo'       // terraza, camellón, enmienda, construcción de perfil
  | 'cultivo'     // asociación, rotación, descanso, selección
  | 'ganaderia'   // pastoreo, trashumancia, corral
  | 'recoleccion' // recolección, caza, pesca, manejo de monte
  | 'fuego';      // quema prescripta, manejo de combustible

/** Si la práctica se sigue haciendo o quedó en el registro. */
export type VigenciaPractica =
  /** Se practica hoy, aunque sea en parte del territorio. */
  | 'en_uso'
  /** Queda gente haciéndola, pero se está perdiendo. */
  | 'en_retroceso'
  /** Documentada y abandonada. Puede seguir siendo legible en el paisaje. */
  | 'historica';

/**
 * Una práctica documentada en el territorio, fechada y sin dueño declarado.
 *
 * Es la respuesta a un problema concreto: 188 de las 210 fichas regionales
 * tienen `saberes: []` porque atribuirle una práctica a un pueblo a escala de
 * ecorregión sería inventar —una ecorregión abarca muchos pueblos y ninguno la
 * ocupa entera—, y el resultado era una sección vacía que se leía como "acá no
 * hay nada". Pero que no se pueda decir **de quién** es no significa que no se
 * pueda decir **qué se hizo acá y cuándo**: eso es justamente lo que el
 * registro arqueológico e histórico fecha.
 *
 * Por eso el ancla es el período y no la cultura. Lo que una excavación data es
 * el rasgo —el camellón, el muro, el canal—, no la identidad de quien lo
 * levantó, que muchas veces sigue en discusión entre especialistas.
 *
 * Cómo se escribe una entrada, que es donde esto se arruina:
 *
 * - **El sujeto es el registro, no el terreno.** "El registro arqueológico de
 *   la cuenca documenta camellones desde el 1000 a.C." y no "acá se hacían
 *   camellones". La diferencia importa cuando alguien lee el informe en voz
 *   alta delante de un vecino.
 * - **Si la fuente nombra al pueblo, se lo nombra como lo nombra la fuente**,
 *   dentro de `detalle` y en tercera persona —"la literatura lo atribuye a…"—.
 *   Callar una autoría documentada no es prudencia, es borrarla. Lo que no se
 *   hace nunca es deducir el pueblo del mapa.
 * - **Sin fuente no hay entrada.** No es un campo opcional que quedó vacío: una
 *   práctica sin referencia publicada es exactamente el número plausible y
 *   equivocado del que habla `lib/README.md`, con el agravante de que acá el
 *   error es sobre la historia de alguien.
 *
 * Los saberes que sí se afirman como propios de una comunidad son otra capa y
 * viven en `lib/saberes.ts`, con compuerta de ocho condiciones y activación por
 * polígono.
 */
export interface PracticaHistorica {
  /** El nombre del rasgo, corto. "Camellones (waru waru)", "Terraza de piedra seca". */
  practica: string;
  /**
   * Cuándo, en texto y no en números: el registro fecha con rangos abiertos,
   * con siglos y con "desde". Un campo numérico obligaría a inventar precisión.
   * Ej.: "Desde ~1000 a.C.; auge entre el 500 y el 1100 d.C."
   */
  periodo: string;
  tipo: TipoPractica;
  vigencia: VigenciaPractica;
  /**
   * Qué es, cómo funciona y por qué funciona acá. Dos a cuatro oraciones: tiene
   * que servirle a alguien que está diseñando, no ser una entrada de glosario.
   */
  detalle: string;
  /** Obligatoria y no vacía. Ver la nota de arriba. */
  fuentes: Fuente[];
}
