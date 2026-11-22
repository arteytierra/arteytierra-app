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

/**
 * Las obras de acequia que interceptan o concentran el escurrimiento.
 *
 * Son las que el aviso de flujo laminar desaconseja, y están nombradas una por
 * una a propósito: no es «todas las obras de agua». Una represa de cauce o un
 * tanque de techo no tocan la lámina; una zanja a nivel, un surco a pendiente o
 * una línea clave sí, porque su mecanismo ES interceptarla.
 */
export type ObraQueIntercepta = 'swales' | 'keyline' | 'camellon' | 'curvas';

/**
 * Paisaje donde el escurrimiento laminar no hay que interceptarlo.
 *
 * Es el caso que invierte la premisa de media familia de herramientas de
 * acequia. En una planicie árida con vegetación en bandas o en bosquetes el
 * agua y los nutrientes no viajan hasta un punto bajo: se retienen en montículos
 * de planta y en focos chicos de drenaje —el parche fértil de Tongway— y la
 * planta hace el montículo que retiene el agua que alimenta la planta.
 * Concentrar la lámina en un canal desarma ese circuito, y lo medido no es más
 * agua abajo: es menos.
 *
 * **No se infiere.** El campo lo declara la ficha de la ecorregión con su cita,
 * y por eso vive acá y no en una heurística de clima y pendiente: «planicie
 * árida y plana» describe también paisajes donde la zanja a nivel es la obra
 * correcta. Lo que habilita el aviso es que haya un relevamiento publicado que
 * registre el mecanismo en ESE paisaje.
 */
export interface FlujoLaminar {
  /** Qué hace el agua hoy y qué pasa si se la corta, en una frase que se imprime. */
  mecanismo: string;
  /** La cita publicada, textual donde se pueda. */
  cita: string;
  /** El relevamiento de donde sale, con la página si la tiene. */
  fuente: string;
  /** Las obras de acequia que este paisaje desaconseja. */
  obras: readonly ObraQueIntercepta[];
  /** Qué hacer en su lugar, cuando la fuente lo dice. `null` si no lo dice. */
  enCambio: string | null;
}

/**
 * Por qué esta ficha no lleva lista de cultivos.
 *
 * El campo `cultivos` es opcional, y la ausencia tenía una sola lectura: «la
 * ecorregión todavía no está curada». De ahí salían dos cosas que el usuario no
 * podía discutir. En el bloque «en esta ecorregión» se le ofrecía el catálogo
 * por clase Köppen con el aviso de que faltaba curar; y en el balance hídrico
 * del calendario se le ofrecía `CULTIVOS_KC`, que son diez del Cono Sur —soja,
 * girasol, olivo, alfalfa— sin ningún cartel. En un manglar del Caribe, en el
 * Rub al-Jali o en el desierto polar del Alto Ártico eso es exactamente el
 * número plausible y equivocado del que habla `lib/README.md`: la app
 * preguntaba cuánta agua le falta al olivo en la planicie de marea.
 *
 * Lo que vuelve el error evitable es que la propia ficha ya lo sabía por otra
 * vía: casi todas estas ecorregiones declaran en `aptitud` deltas de −30 a −40
 * en huerta, frutales, pasturas y forestal, y +25 o +30 en reserva. La aptitud
 * decía «acá no se produce» mientras el calendario ofrecía tomate. Este campo
 * es el que hace que los dos motores se hablen.
 *
 * **No se infiere de la aptitud**, y es a propósito. Un delta muy negativo
 * significa «este uso rinde mal acá», que no es lo mismo que «la pregunta
 * agrícola no corresponde acá»: el Decán sur tiene −10 en huerta y agricultura
 * plena, y Galápagos tiene −15 porque la zona alta produce y lo que limita es
 * la bioseguridad. Por eso el motivo lo declara la ficha, con la evidencia que
 * ya tiene escrita en `suelos`, en `resumen` o en las razones de `aptitud`.
 *
 * Y lo que **no** hace es sacarle la herramienta al usuario. El borde de un
 * polígono de RESOLVE no es el borde de un sistema productivo —es el mismo
 * motivo por el que existe `tambienPorClima`—, así que un predio puede caer en
 * el polígono del manglar y estar en el albardón de al lado. La lista genérica
 * se sigue ofreciendo; lo que cambia es que ahora dice de dónde salió.
 */
export type MotivoSinCultivos =
  /** El uso agrícola no es la pregunta acá: planicie de marea, arenal móvil,
   *  costra salina, desierto polar, turbera, afloramiento, isla santuario. */
  | 'no_corresponde'
  /** Hay sistema productivo documentado y no es de cultivos. El caso típico es
   *  el pastoril extensivo: la lista que corresponde es de forraje. */
  | 'otro_uso'
  /** Falta la lista y nada más. Es el único motivo que el tiempo arregla, y el
   *  aviso de «todavía no está curada» le sigue correspondiendo entero. */
  | 'sin_curar';

export interface SinCultivos {
  motivo: MotivoSinCultivos;
  /**
   * Qué se hace acá en vez de cultivar, o por qué no se cultiva. Se imprime tal
   * cual, así que va en una o dos oraciones y apoyado en lo que la ficha ya
   * tiene citado. Sin detalle no hay declaración: un motivo suelto es otra vez
   * una ausencia sin explicar.
   */
  detalle: string;
  /** Sólo con `otro_uso`: el uso documentado, corto («pastoril extensivo»). */
  uso: string | null;
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
  /**
   * Obligatorio cuando `cultivos` no viene. Es la razón de la ausencia, tipada,
   * y la leen el bloque «en esta ecorregión» y el balance hídrico del
   * calendario. Hay un test que lo exige: ver `tests/unit/contexto/`.
   */
  sinCultivos?: SinCultivos;
  /** Correcciones a la aptitud de uso del suelo que impone el ecosistema. */
  aptitud?: ModificadorAptitud[];
  /**
   * Declarado sólo donde un relevamiento publicado registra que interrumpir el
   * escurrimiento laminar degradó el paisaje. Lo lee `avisoFlujoLaminar` y lo
   * muestran los paneles de swales, líneas clave y camellón **antes** de que se
   * dibuje la obra.
   */
  flujoLaminar?: FlujoLaminar;
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
 * Es la respuesta a un problema concreto: 200 de las 222 fichas regionales
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
