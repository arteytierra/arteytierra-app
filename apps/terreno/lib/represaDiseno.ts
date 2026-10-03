/**
 * Criterios publicados de diseño de pequeñas represas de tierra, y la
 * evaporación del espejo de agua.
 *
 * POR QUÉ ESTE ARCHIVO
 *
 * acequia ya calculaba bien la geometría de una represa: integra la sección del
 * muro a lo largo del eje real del terreno, descuenta el destape, separa el
 * núcleo de los espaldones y cierra el balance de tierra contra el préstamo
 * interno. Lo que no tenía era de dónde salían los números con los que llena
 * esa geometría: el ancho de la corona, los taludes, la revancha y la zanja de
 * anclaje venían de «criterio corriente», sin tabla y sin fuente. Y todos ellos
 * caían del mismo lado: **por debajo del mínimo publicado**, con el error
 * creciendo con la altura del muro. Un muro más angosto y con taludes más
 * parados es un muro más barato en la pantalla y más frágil en el campo.
 *
 * La fuente es el manual clásico del rubro, que además es gratuito y de agencia
 * pública, así que cualquiera puede ir a verificar cada número:
 *
 *   USDA SCS (1997), «Ponds — Planning, Design, Construction»,
 *   Agriculture Handbook 590 (AH-590).
 *
 * Y para la evaporación del espejo, que no es la ETP de referencia:
 *
 *   Allen, R.G., Pereira, L.S., Raes, D. y Smith, M. (1998),
 *   «Crop evapotranspiration — Guidelines for computing crop water
 *   requirements», FAO Irrigation and Drainage Paper 56, cuadro 12,
 *   apartado «p. Special» y nota 25.
 *
 * LO QUE HAY QUE ENTENDER ANTES DE LOS NÚMEROS
 *
 * La revancha no se mide desde el pelo de agua normal. AH-590 la define como
 * «the vertical distance between the elevation of the water surface in the pond
 * when the spillway is discharging at designed depth and the elevation of the
 * top of the dam after all settlement». O sea que entre el nivel normal y la
 * corona hay **tres** cosas apiladas, no una: la carga sobre el vertedero
 * cuando pasa la crecida de diseño, la revancha propiamente dicha, y el
 * sobrealto por asentamiento. acequia sumaba sólo la del medio. En el ejemplo
 * del propio manual la carga sobre el vertedero (1,3 pies) es **mayor** que la
 * revancha (1,0 pie): faltaba más de la mitad de lo que hay que subir.
 *
 * Eso importa porque es la falla que no avisa. Un muro angosto se nota al
 * transitarlo; un muro corto se nota una sola vez, con la crecida encima, y el
 * modo de rotura de un terraplén desbordado es la brecha, no la filtración.
 */

// ─── Conversiones, explícitas porque la fuente es imperial ───────────────────

export const PIE_M      = 0.3048;
export const PULGADA_M  = 0.0254;
/** 1 yd³ = 27 ft³ = 0,3048³ × 27 m³. */
export const YARDA3_M3  = 0.764554857984;
export const MILLA_M    = 1609.344;

export const FUENTE_AH590 =
  'USDA SCS (1997) — Ponds: Planning, Design, Construction, Agriculture Handbook 590';
export const FUENTE_FAO56 =
  'Allen y otros (1998) — Crop evapotranspiration, FAO Irrigation and Drainage Paper 56, cuadro 12 («p. Special») y nota 25';

// ─── 1 · Ancho de coronamiento ───────────────────────────────────────────────

/**
 * Ancho mínimo de corona según la altura del muro. AH-590, «Top width and
 * alignment»: *«For dams less than 10 feet high, a conservative minimum top
 * width is 6 feet. As the height of the dam increases, increase the top
 * width»*, y después la tabla.
 *
 * La tabla del manual viene en pies enteros y salta de «Under 10» a «11 to 14»,
 * así que entre 10 y 11 pies no dice nada. Acá se lee de la forma conservadora
 * —hasta 10 pies el mínimo es 6, y de ahí a 14 ya es 8— y el salto queda
 * documentado en `nota`.
 */
export interface FilaCorona {
  /** Altura del muro hasta la que vale esta fila, en metros. */
  alto_max_m:  number;
  /** Mínimo publicado, en metros. */
  minimo_m:    number;
  /** Los dos valores del manual, en pies, para poder auditar la transcripción. */
  alto_max_ft: number;
  minimo_ft:   number;
}

export const TABLA_CORONA_AH590: readonly FilaCorona[] = [
  { alto_max_ft: 10, minimo_ft: 6,  alto_max_m: 10 * PIE_M, minimo_m: 6  * PIE_M },
  { alto_max_ft: 14, minimo_ft: 8,  alto_max_m: 14 * PIE_M, minimo_m: 8  * PIE_M },
  { alto_max_ft: 19, minimo_ft: 10, alto_max_m: 19 * PIE_M, minimo_m: 10 * PIE_M },
  { alto_max_ft: 24, minimo_ft: 12, alto_max_m: 24 * PIE_M, minimo_m: 12 * PIE_M },
  { alto_max_ft: 34, minimo_ft: 14, alto_max_m: 34 * PIE_M, minimo_m: 14 * PIE_M },
];

/**
 * *«If the top of the embankment is to be used for a roadway, provide for a
 * shoulder on each side of the roadway to prevent raveling. The top width
 * should be at least 16 feet.»* No es el ancho de la huella: es la huella más
 * las dos banquinas que evitan que el borde se desmorone.
 */
export const CORONA_TRANSITABLE_MIN_M = 16 * PIE_M;

/** Altura por encima de la cual AH-590 no da tabla y pide proyecto de ingeniero. */
export const ALTO_MAX_TABULADO_M = 34 * PIE_M;

export interface CoronaMinima {
  minimo_m: number;
  /** La fila de la tabla que se usó, o null si quedó fuera de tabla. */
  fila:     FilaCorona | null;
  fuente:   string;
  nota:     string;
  /** true cuando el muro supera la última fila de la tabla. */
  fueraDeTabla: boolean;
}

export function coronaMinima(alto_m: number, transitable = false): CoronaMinima {
  const porTransito = transitable ? CORONA_TRANSITABLE_MIN_M : 0;

  if (!(alto_m > 0)) {
    return {
      minimo_m: Math.max(TABLA_CORONA_AH590[0]!.minimo_m, porTransito),
      fila: TABLA_CORONA_AH590[0]!, fuente: FUENTE_AH590, fueraDeTabla: false,
      nota: 'Sin altura de muro se devuelve el mínimo de la primera fila, que es el piso absoluto del manual.',
    };
  }

  const fila = TABLA_CORONA_AH590.find(f => alto_m <= f.alto_max_m) ?? null;
  const base = fila ? fila.minimo_m : TABLA_CORONA_AH590[TABLA_CORONA_AH590.length - 1]!.minimo_m;
  const minimo = Math.max(base, porTransito);

  const partes: string[] = [];
  if (fila) {
    partes.push(
      `Para un muro de ${alto_m.toFixed(1)} m (${(alto_m / PIE_M).toFixed(0)} pies) ` +
      `la tabla de AH-590 pide como mínimo ${fila.minimo_ft} pies de corona, ` +
      `o sea ${fila.minimo_m.toFixed(2)} m.`);
  } else {
    partes.push(
      `Un muro de ${alto_m.toFixed(1)} m pasa los ${ALTO_MAX_TABULADO_M.toFixed(1)} m ` +
      '(34 pies) que cubre la tabla de AH-590: a esa altura el manual deja de dar ' +
      'mínimos y pide proyecto de ingeniero. Se usa el último valor tabulado, que ' +
      'es un piso y no una recomendación.');
  }
  if (transitable) {
    partes.push(
      `Corona transitable por vehículo: el mínimo pasa a ${CORONA_TRANSITABLE_MIN_M.toFixed(2)} m ` +
      '(16 pies), que es la huella más las dos banquinas que evitan que el borde se desmorone.');
  }
  if (alto_m > 10 * PIE_M && alto_m <= 11 * PIE_M) {
    partes.push(
      'Entre 10 y 11 pies la tabla del manual no dice nada —salta de «under 10» a ' +
      '«11 to 14»—, así que acá se aplica la fila de arriba, que es la conservadora.');
  }

  return { minimo_m: minimo, fila, fuente: FUENTE_AH590, fueraDeTabla: fila === null, nota: partes.join(' ') };
}

// ─── 2 · Taludes ─────────────────────────────────────────────────────────────

/**
 * AH-590, cuadro 16, «Recommended side slopes for earth dams». Son **dos filas
 * y nada más**, y el texto que las acompaña es lo que las vuelve un mínimo y no
 * una sugerencia: *«For stability, the slopes should not be steeper than those
 * shown in table 16, but they can be flatter as long as they provide surface
 * drainage»*.
 *
 * Lo que la tabla NO cubre es tan importante como lo que cubre. No hay fila
 * para arena limpia ni para arcilla muy plástica: para esos materiales el
 * manual no da taludes, manda a investigar la fundación y consultar a un
 * ingeniero. acequia no inventa la fila faltante; devuelve el talud de la fila
 * más tendida y dice que el material está fuera de tabla.
 */
export interface FilaTaludes {
  id:          string;
  /** Materiales de la fila, con las palabras del manual. */
  material:    string;
  /** Aguas arriba, H:1V. */
  interno:     number;
  /** Aguas abajo, H:1V. */
  externo:     number;
}

export const TABLA_TALUDES_AH590: readonly FilaTaludes[] = [
  {
    id: 'arenas_y_gravas_con_finos',
    material: 'arena arcillosa, grava arcillosa, arcilla arenosa, arena limosa, grava limosa',
    interno: 3, externo: 2,
  },
  {
    id: 'limos_y_arcillas',
    material: 'arcilla limosa, limo arcilloso',
    interno: 3, externo: 3,
  },
];

/**
 * El talud interno mínimo es 3:1 en las dos filas del cuadro 16. No es una
 * casualidad de la tabla: el lado de aguas arriba está saturado, lo golpea el
 * oleaje y sobre todo sufre el vaciado rápido, que es la condición que lo hace
 * deslizar. Por eso ninguna fila del manual lo deja más parado que 3:1.
 */
export const TALUD_INTERNO_MIN_AH590 = 3;
/** El externo más parado que admite el cuadro 16. */
export const TALUD_EXTERNO_MIN_AH590 = 2;

export interface TaludesMinimos {
  interno: number;
  externo: number;
  fila:    FilaTaludes | null;
  fuente:  string;
  nota:    string;
  /** true cuando el material no tiene fila en el cuadro 16. */
  fueraDeTabla: boolean;
}

/**
 * Taludes mínimos para un material de terraplén.
 *
 * `material` es una de las clases de suelo que acequia ya deduce de la textura
 * (ver `claseSueloSugerida` en `criterios.ts`). La correspondencia con las dos
 * filas del manual es de acequia y está escrita acá para que se pueda discutir:
 * las mezclas areno-arcillosas van a la primera fila, los limos y arcillas no
 * expansivas a la segunda, y la arena suelta y la arcilla expansiva quedan
 * declaradas fuera de tabla.
 */
export function taludesMinimos(material: string | null | undefined): TaludesMinimos {
  const fila0 = TABLA_TALUDES_AH590[0]!;
  const fila1 = TABLA_TALUDES_AH590[1]!;

  switch (material) {
    case 'areno_arcilloso':
      return { interno: fila0.interno, externo: fila0.externo, fila: fila0, fuente: FUENTE_AH590, fueraDeTabla: false,
        nota: `Mezcla areno-arcillosa: primera fila del cuadro 16 (${fila0.material}). Mínimos ${fila0.interno}:1 aguas arriba y ${fila0.externo}:1 aguas abajo.` };
    case 'arcilloso_inelastico':
      return { interno: fila1.interno, externo: fila1.externo, fila: fila1, fuente: FUENTE_AH590, fueraDeTabla: false,
        nota: `Arcilla no expansiva: segunda fila del cuadro 16 (${fila1.material}). El manual pide ${fila1.externo}:1 también aguas abajo, más tendido que en la fila de las arenas con finos.` };
    case 'arcilloso_elastico':
      return { interno: fila1.interno, externo: fila1.externo, fila: null, fuente: FUENTE_AH590, fueraDeTabla: true,
        nota: 'Arcilla expansiva: el cuadro 16 no tiene fila para arcillas de alta plasticidad, y el texto de fundaciones manda consultar a un ingeniero. Se devuelven los taludes de la fila más tendida como piso, no como recomendación: este material se agrieta al secarse y además pide proteger la superficie de la desecación.' };
    case 'arenoso_superficial':
      return { interno: fila1.interno, externo: fila1.externo, fila: null, fuente: FUENTE_AH590, fueraDeTabla: true,
        nota: 'Arena sin finos: el cuadro 16 sólo cubre arenas y gravas CON arcilla o limo. Para arena limpia el manual no da taludes: dice que la fundación y el cuerpo piden diseño de ingeniero y medidas contra la filtración y el sifonamiento. Se devuelve la fila más tendida como piso, y hace falta núcleo o pantalla impermeable.' };
    default:
      return { interno: fila1.interno, externo: fila1.externo, fila: null, fuente: FUENTE_AH590, fueraDeTabla: true,
        nota: 'Sin clase de suelo no se puede elegir fila del cuadro 16: se devuelve la más tendida de las dos, que es la conservadora.' };
  }
}

// ─── 3 · Revancha ────────────────────────────────────────────────────────────

/**
 * AH-590, «Freeboard»: la revancha mínima la fija **el largo del vaso**, no la
 * altura del muro. Y tiene sentido físico: la revancha está para que no lo pase
 * la ola, y la altura de la ola la da el fetch —cuánta agua libre tiene el
 * viento para empujar— no cuánta agua hay abajo.
 *
 *   *«If your pond is less than 660 feet long, provide a freeboard of no less
 *   than 1 foot. The minimum freeboard is 1.5 feet for ponds between 660 and
 *   1,320 feet long, and is 2 feet for ponds up to a half mile long. For longer
 *   ponds an engineer should determine the freeboard.»*
 */
export interface FilaRevancha {
  largo_max_m:  number;
  minimo_m:     number;
  largo_max_ft: number;
  minimo_ft:    number;
}

export const TABLA_REVANCHA_AH590: readonly FilaRevancha[] = [
  { largo_max_ft: 660,  minimo_ft: 1.0, largo_max_m: 660  * PIE_M, minimo_m: 1.0 * PIE_M },
  { largo_max_ft: 1320, minimo_ft: 1.5, largo_max_m: 1320 * PIE_M, minimo_m: 1.5 * PIE_M },
  { largo_max_ft: 2640, minimo_ft: 2.0, largo_max_m: 2640 * PIE_M, minimo_m: 2.0 * PIE_M },
];

/** Media milla: más largo que esto, el manual pide que lo determine un ingeniero. */
export const LARGO_VASO_MAX_TABULADO_M = MILLA_M / 2;

export interface RevanchaMinima {
  minimo_m: number;
  fila:     FilaRevancha | null;
  fuente:   string;
  nota:     string;
  /** true cuando el vaso pasa la media milla y la tabla ya no responde. */
  fueraDeTabla: boolean;
}

export function revanchaMinima(largoVaso_m: number | null | undefined): RevanchaMinima {
  const primera = TABLA_REVANCHA_AH590[0]!;
  const ultima  = TABLA_REVANCHA_AH590[TABLA_REVANCHA_AH590.length - 1]!;

  if (largoVaso_m == null || !Number.isFinite(largoVaso_m) || largoVaso_m <= 0) {
    return { minimo_m: primera.minimo_m, fila: primera, fuente: FUENTE_AH590, fueraDeTabla: false,
      nota: 'Sin el largo del vaso se usa la primera fila (1 pie), que es el piso absoluto del manual. Con el espejo dibujado el número se afina solo.' };
  }

  // El manual dice «less than 660 feet» para la primera fila y «between 660 and
  // 1,320» para la segunda, así que en los 660 exactos manda la segunda. La
  // última es «up to a half mile», o sea que incluye su propio extremo.
  const ultimoIdx = TABLA_REVANCHA_AH590.length - 1;
  const fila = TABLA_REVANCHA_AH590.find((f, i) =>
    i === ultimoIdx ? largoVaso_m <= f.largo_max_m : largoVaso_m < f.largo_max_m) ?? null;
  if (!fila) {
    return { minimo_m: ultima.minimo_m, fila: null, fuente: FUENTE_AH590, fueraDeTabla: true,
      nota: `El vaso mide ${Math.round(largoVaso_m)} m de punta a punta, más de la media milla (${Math.round(LARGO_VASO_MAX_TABULADO_M)} m) que cubre la tabla: ahí AH-590 pide que la revancha la determine un ingeniero, porque la ola ya no la acota una tabla. Se devuelven los 2 pies de la última fila como piso.` };
  }

  return { minimo_m: fila.minimo_m, fila, fuente: FUENTE_AH590, fueraDeTabla: false,
    nota: `El vaso mide ${Math.round(largoVaso_m)} m de punta a punta (${Math.round(largoVaso_m / PIE_M)} pies), así que la revancha mínima son ${fila.minimo_ft} pies, o sea ${fila.minimo_m.toFixed(2)} m. La fija el largo del vaso y no la altura del muro, porque lo que la revancha frena es la ola y la ola la arma el viento sobre el agua libre.` };
}

// ─── 4 · Asentamiento ────────────────────────────────────────────────────────

/**
 * AH-590, «Settlement allowance»: el muro se construye más alto que el de
 * proyecto, porque la fundación cede. *«Most foundations are yielding, and
 * settlement may range from 1 to 6 percent of the height of the dam, mainly
 * during construction. The settlement allowance for a rolled-fill dam should be
 * about 5 percent of the designed dam height. […] Most pond dams less than 20
 * feet high, however, are not rolled fill. For these dams the total settlement
 * allowance should be about 10 percent.»*
 *
 * El 10 % es el caso corriente de un predio: un muro de menos de 6 metros hecho
 * con pala y topadora, no compactado en capas con rodillo. Y el ejemplo de
 * cómputo del propio manual lo aplica al **volumen** del terraplén, no sólo a
 * la cota: 7.029 yd³ + 10 % = 7.732 yd³.
 */
export const ASENTAMIENTO_RODILLO_PCT    = 5;
export const ASENTAMIENTO_SIN_RODILLO_PCT = 10;
/** Altura por debajo de la cual el manual asume que el muro no es rolled fill. */
export const ALTO_SIN_RODILLO_M = 20 * PIE_M;

export interface Asentamiento {
  pct:    number;
  fuente: string;
  nota:   string;
}

/**
 * @param compactadoEnCapas true si el terraplén se compacta en capas delgadas
 *   con rodillo y control de humedad (rolled fill). Por defecto false, que es
 *   lo que pasa en la mayoría de las represas de predio.
 */
export function asentamientoPct(alto_m: number, compactadoEnCapas = false): Asentamiento {
  if (compactadoEnCapas) {
    return { pct: ASENTAMIENTO_RODILLO_PCT, fuente: FUENTE_AH590,
      nota: `Terraplén compactado en capas delgadas con control de humedad: el sobrealto por asentamiento es del ${ASENTAMIENTO_RODILLO_PCT} % de la altura de proyecto.` };
  }
  const chico = alto_m > 0 && alto_m < ALTO_SIN_RODILLO_M;
  return { pct: ASENTAMIENTO_SIN_RODILLO_PCT, fuente: FUENTE_AH590,
    nota: `Sin compactación en capas con rodillo el sobrealto es del ${ASENTAMIENTO_SIN_RODILLO_PCT} %` +
      (chico ? `, que es lo que AH-590 asume para casi toda represa de predio: los muros de menos de ${ALTO_SIN_RODILLO_M.toFixed(1)} m (20 pies) por lo general no son rolled fill.` : '. Para un muro de esta altura vale la pena compactar en capas y bajar el sobrealto al 5 %.') };
}

// ─── 5 · La cota del coronamiento: las tres cosas que se apilan ──────────────

export interface EntradaCotaCorona {
  /** Cota de la cresta del vertedero, que es el nivel normal del embalse (m). */
  cotaVertedero_m: number;
  /**
   * Carga sobre el vertedero cuando pasa la crecida de diseño (m). Es el `Hp`
   * de AH-590 y el `head_vertedero_m` que acequia ya calcula en la pestaña
   * Cuenca. Sin este número la cota de corona sale corta y no hay forma de
   * saberlo mirando la pantalla.
   */
  cargaVertedero_m: number;
  /** Largo del vaso de punta a punta (m), para la revancha. */
  largoVaso_m?: number | null;
  /** Revancha impuesta a mano. Si es menor que el mínimo publicado, se avisa. */
  revancha_m?: number | null;
  /** Cota del terreno natural en el punto más bajo del eje del muro (m). */
  cotaFundacion_m?: number | null;
  compactadoEnCapas?: boolean;
}

export interface CotaCorona {
  /** Cota del pelo de agua con la crecida de diseño pasando por el vertedero. */
  cotaCrecida_m:   number;
  /** Cota de corona que tiene que quedar DESPUÉS de todo el asentamiento. */
  cotaAsentada_m:  number;
  /** Cota a la que hay que construirla, con el sobrealto por asentamiento. */
  cotaConstruida_m:number;
  cargaVertedero_m:number;
  revancha_m:      number;
  revanchaMinima_m:number;
  /** Alto de proyecto sobre la fundación (m). null si no se dio la fundación. */
  altoDisenado_m:  number | null;
  altoConstruido_m:number | null;
  sobrealto_m:     number;
  asentamiento:    Asentamiento;
  /** Lo que hay que subir por encima del nivel normal, sin el asentamiento. */
  sobreVertedero_m:number;
  fuente:          string;
  advertencias:    string[];
  nota:            string;
}

/**
 * La cota del coronamiento, con sus tres términos a la vista.
 *
 * AH-590 define la revancha como la distancia entre el pelo de agua **con el
 * vertedero descargando a su carga de diseño** y la corona **después de todo el
 * asentamiento**. De ahí sale la pila:
 *
 *     corona construida = cresta del vertedero
 *                       + carga sobre el vertedero (Hp)
 *                       + revancha
 *                       + sobrealto por asentamiento
 *
 * El manual lo deja escrito en un ejemplo de una línea: con Hp = 1,3 pies y
 * revancha de 1 pie, *«the top of the dam should be constructed 2.3 feet higher
 * than the spillway crest»*. acequia subía sólo la revancha.
 */
export function cotaCoronamiento(e: EntradaCotaCorona): CotaCorona {
  const Hp = Math.max(0, e.cargaVertedero_m);
  const rMin = revanchaMinima(e.largoVaso_m);
  const revancha = e.revancha_m != null && Number.isFinite(e.revancha_m) && e.revancha_m > 0
    ? e.revancha_m
    : rMin.minimo_m;

  const cotaCrecida  = e.cotaVertedero_m + Hp;
  const cotaAsentada = cotaCrecida + revancha;

  const fundacion = e.cotaFundacion_m != null && Number.isFinite(e.cotaFundacion_m)
    ? e.cotaFundacion_m : null;
  const altoDisenado = fundacion !== null ? Math.max(0, cotaAsentada - fundacion) : null;

  const asent = asentamientoPct(altoDisenado ?? 0, e.compactadoEnCapas ?? false);
  const sobrealto = altoDisenado !== null ? altoDisenado * (asent.pct / 100) : 0;
  const altoConstruido = altoDisenado !== null ? altoDisenado + sobrealto : null;
  const cotaConstruida = cotaAsentada + sobrealto;

  const advertencias: string[] = [];
  if (Hp <= 0) {
    advertencias.push(
      'Falta la carga sobre el vertedero. La revancha de AH-590 se mide desde el ' +
      'pelo de agua CON la crecida de diseño pasando, no desde el nivel normal: ' +
      'sin ese número la cota de corona sale corta. En el ejemplo del manual la ' +
      'carga sobre el vertedero (1,3 pies) es mayor que la propia revancha (1 pie). ' +
      'acequia ya la calcula en la pestaña Cuenca.');
  }
  if (e.revancha_m != null && e.revancha_m > 0 && e.revancha_m < rMin.minimo_m - 1e-9) {
    advertencias.push(
      `La revancha puesta a mano (${e.revancha_m.toFixed(2)} m) es menor que el ` +
      `mínimo de AH-590 para un vaso de este largo (${rMin.minimo_m.toFixed(2)} m). ${rMin.nota}`);
  }
  if (rMin.fueraDeTabla) advertencias.push(rMin.nota);
  if (fundacion === null) {
    advertencias.push(
      'Sin la cota del terreno en el punto más bajo del eje no se puede calcular ' +
      'el sobrealto por asentamiento, que se aplica a la ALTURA del muro y no a ' +
      'la cota. Se informa la corona asentada, que es la que hay que tener al final.');
  }

  return {
    cotaCrecida_m:    +cotaCrecida.toFixed(3),
    cotaAsentada_m:   +cotaAsentada.toFixed(3),
    cotaConstruida_m: +cotaConstruida.toFixed(3),
    cargaVertedero_m: +Hp.toFixed(3),
    revancha_m:       +revancha.toFixed(3),
    revanchaMinima_m: +rMin.minimo_m.toFixed(3),
    altoDisenado_m:   altoDisenado !== null ? +altoDisenado.toFixed(3) : null,
    altoConstruido_m: altoConstruido !== null ? +altoConstruido.toFixed(3) : null,
    sobrealto_m:      +sobrealto.toFixed(3),
    asentamiento:     asent,
    sobreVertedero_m: +(Hp + revancha).toFixed(3),
    fuente:           FUENTE_AH590,
    advertencias,
    nota:
      `Sobre la cresta del vertedero hay que subir ${(Hp + revancha).toFixed(2)} m antes del ` +
      `asentamiento: ${Hp.toFixed(2)} m de carga de la crecida de diseño más ${revancha.toFixed(2)} m de ` +
      `revancha` +
      (altoDisenado !== null
        ? `. Con el ${asent.pct} % de sobrealto por asentamiento sobre una altura de proyecto de ${altoDisenado.toFixed(2)} m, el muro se construye a ${cotaConstruida.toFixed(2)} m y queda en ${cotaAsentada.toFixed(2)} m.`
        : '.'),
  };
}

// ─── 6 · Secciones y volumen por suma de áreas ───────────────────────────────

export interface EntradaSeccion {
  corona_m:      number;
  alto_m:        number;
  taludInterno:  number;
  taludExterno:  number;
}

/**
 * Área de la sección trapecial del terraplén, en m² por metro corrido de eje.
 *
 *     A = corona × h + h² × (ti + te) / 2
 *
 * Es la forma en que AH-590 arma su cuadro 17: una columna por el ancho de
 * corona (`corona × h`) y una por los taludes (`h² × (ti+te)/2`), y la nota del
 * cuadro dice que se suman. El ejemplo del manual: corona de 12 pies, 15 pies
 * de alto, taludes 3:1 y 3:1 → *«675 plus 180, or 855 square feet»*.
 */
export function areaSeccionTrapecio(e: EntradaSeccion): number {
  const h = e.alto_m;
  if (!(h > 0)) return 0;
  return e.corona_m * h + (h * h * (e.taludInterno + e.taludExterno)) / 2;
}

/**
 * Volumen por el método de la suma de áreas extremas, que es el que usa el
 * manual: *«The number of cubic yards of fill between two points on the
 * centerline of the dam is equal to the sum of the end areas at those two
 * points multiplied by the distance between these points and divided by 54»*.
 * Dividir por 54 es dividir por 2 (el promedio de las dos áreas) y por 27 (los
 * pies cúbicos de una yarda cúbica): en SI es la regla del trapecio y nada más.
 *
 * `areas_m2` son las secciones en estaciones equiespaciadas, `paso_m` la
 * distancia entre estaciones.
 */
export function volumenSumaDeAreas(areas_m2: readonly number[], paso_m: number): number {
  if (areas_m2.length < 2 || !(paso_m > 0)) return 0;
  let acc = 0;
  for (let k = 0; k < areas_m2.length - 1; k++) {
    acc += ((areas_m2[k]! + areas_m2[k + 1]!) / 2) * paso_m;
  }
  return acc;
}

// ─── 7 · Zanja de anclaje ────────────────────────────────────────────────────

/**
 * AH-590, «Cutoffs». La zanja se abre sobre el eje del muro y tiene que
 * meterse bien dentro del estrato impermeable; lo que el manual fija es la
 * geometría mínima:
 *
 *   *«The bottom of the trench should be no less than 8 feet wide (or the
 *   bulldozer blade width, whichever is greater), and the sides no steeper than
 *   1.5:1. Fill the trench with successive thin layers (9-inch maximum) of clay
 *   or sandy clay material.»*
 *
 * Los tres números tienen la misma razón: que entre la máquina. Ocho pies es
 * ancho de hoja de topadora, y nueve pulgadas es lo que un rodillo o un
 * compactador de plancha puede densificar de una pasada. Una zanja más angosta
 * no se puede compactar en el fondo, y una zanja sin compactar es un camino
 * para el agua: exactamente lo que vino a cortar.
 *
 * Y es trapecio, no rectángulo: con taludes 1,5:1 una zanja de 1 m de
 * profundidad abre 3 m más arriba que abajo.
 */
export const ZANJA_ANCHO_FONDO_MIN_M = 8 * PIE_M;
export const ZANJA_TALUD_MAX         = 1.5;
export const ZANJA_CAPA_MAX_M        = 9 * PULGADA_M;

export interface EntradaZanja {
  prof_m:  number;
  largo_m: number;
  /** Ancho de fondo. Si falta o es menor que el mínimo, se usa el mínimo. */
  anchoFondo_m?: number | null;
  /** Talud de las paredes, H:1V. Más parado que 1,5:1 se corrige y se avisa. */
  talud?: number | null;
}

export interface Zanja {
  anchoFondo_m:  number;
  anchoBoca_m:   number;
  talud:         number;
  prof_m:        number;
  seccion_m2:    number;
  volumen_m3:    number;
  /** Cuántas capas de relleno compactado, al máximo publicado. */
  capas:         number;
  fuente:        string;
  advertencias:  string[];
  nota:          string;
}

export function zanjaAnclaje(e: EntradaZanja): Zanja {
  const advertencias: string[] = [];
  const d = Math.max(0, e.prof_m);

  let fondo = e.anchoFondo_m != null && Number.isFinite(e.anchoFondo_m) ? e.anchoFondo_m : ZANJA_ANCHO_FONDO_MIN_M;
  if (fondo < ZANJA_ANCHO_FONDO_MIN_M - 1e-9) {
    advertencias.push(
      `El ancho de fondo pedido (${fondo.toFixed(2)} m) es menor que los ` +
      `${ZANJA_ANCHO_FONDO_MIN_M.toFixed(2)} m (8 pies) que exige AH-590, que es ancho de hoja de ` +
      'topadora: más angosto que eso no se puede compactar el fondo, y una zanja sin ' +
      'compactar es un camino para el agua. Se usa el mínimo.');
    fondo = ZANJA_ANCHO_FONDO_MIN_M;
  }

  let talud = e.talud != null && Number.isFinite(e.talud) ? e.talud : ZANJA_TALUD_MAX;
  if (talud < ZANJA_TALUD_MAX - 1e-9) {
    advertencias.push(
      `Taludes de ${talud.toFixed(2)}:1 son más parados que el 1,5:1 máximo de AH-590. Se usa 1,5:1.`);
    talud = ZANJA_TALUD_MAX;
  }

  // Trapecio: ancho medio = fondo + talud × profundidad.
  const seccion = d > 0 ? d * (fondo + talud * d) : 0;
  const volumen = seccion * Math.max(0, e.largo_m);
  const capas   = d > 0 ? Math.ceil(d / ZANJA_CAPA_MAX_M) : 0;

  return {
    anchoFondo_m: +fondo.toFixed(2),
    anchoBoca_m:  +(fondo + 2 * talud * d).toFixed(2),
    talud,
    prof_m:       +d.toFixed(2),
    seccion_m2:   +seccion.toFixed(2),
    volumen_m3:   Math.round(volumen),
    capas,
    fuente:       FUENTE_AH590,
    advertencias,
    nota: d > 0
      ? `Zanja trapecial de ${fondo.toFixed(2)} m de fondo, ${d.toFixed(2)} m de profundidad y taludes ${talud}:1, ` +
        `así que arriba abre ${(fondo + 2 * talud * d).toFixed(2)} m. Se rellena con arcilla compactada en ` +
        `${capas} capas de ${(ZANJA_CAPA_MAX_M * 100).toFixed(0)} cm como máximo, que es lo que una pasada de ` +
        'compactador densifica de verdad. La profundidad no la decide una tabla: la zanja tiene que entrar ' +
        'bien dentro del estrato impermeable, y eso se ve en la calicata.'
      : 'Sin profundidad de zanja no hay cómputo. Si el estrato impermeable está en la superficie, AH-590 dice que basta con retirar el suelo vegetal y escarificar para que el terraplén agarre.',
  };
}

/**
 * AH-590, cierre del ejemplo de cómputo: *«This […] represents the required
 * compacted volume. To account for shrinkage resulting from compaction, a
 * minimum of 1.5 times this amount is generally necessary to have available in
 * the borrow areas and required excavations»*.
 *
 * Ojo con confundirlo con el factor de contracción. El factor de contracción
 * dice cuánto banco hace falta mover para dejar un metro cúbico compactado;
 * este 1,5 dice cuánto material hay que tener **disponible** en el préstamo,
 * que es más, porque no todo lo que hay en un préstamo sirve ni se aprovecha.
 * Es un criterio de elección de sitio, no de cómputo de movimiento.
 */
export const PRESTAMO_DISPONIBLE_MIN = 1.5;

// ─── 8 · Profundidad útil del vaso ───────────────────────────────────────────

/**
 * AH-590, figura 12, «Recommended minimum depth of water for ponds in the
 * United States». El mapa es de Estados Unidos, pero **la leyenda no es
 * geográfica: es climática**. Son las seis bandas de humedad —de «wet» a
 * «arid»— y por eso la tabla se puede aplicar afuera, siempre que se diga que
 * la correspondencia la hace acequia.
 *
 * El criterio del manual es el que importa: *«To ensure a permanent water
 * supply, the water must be deep enough to meet the intended use requirements
 * and to offset probable seepage and evaporation losses»*, y la figura vale
 * *«if seepage and evaporation losses are normal»*. En el límite de la
 * normalidad el propio manual pone un número: *«Deeper ponds are needed where a
 * permanent or year-round water supply is essential or where seepage losses
 * exceed 3 inches per month»*.
 *
 * LA CORRESPONDENCIA ES DE ACEQUIA, NO DEL MANUAL. Los nombres de la leyenda y
 * los de las clases de aridez que acequia ya calcula (índice P/ETP de UNEP)
 * coinciden casi palabra por palabra, pero **las dos clasificaciones no se
 * definen igual**: la de la figura 12 viene de la nomenclatura de regímenes de
 * humedad y la de acequia de un cociente entre lluvia y ETP. Donde la
 * correspondencia es dudosa se toma el extremo profundo de la banda, porque un
 * vaso de más sobra una vez y uno de menos se seca cada verano.
 */
export interface FilaProfundidadUtil {
  /** Nombre de la banda, tal cual la leyenda de la figura 12. */
  banda:     string;
  min_m:     number;
  max_m:     number;
  min_ft:    number;
  max_ft:    number;
}

export const TABLA_PROFUNDIDAD_UTIL_AH590: readonly FilaProfundidadUtil[] = [
  { banda: 'Wet',            min_ft: 5,  max_ft: 5,  min_m: 5  * PIE_M, max_m: 5  * PIE_M },
  { banda: 'Humid',          min_ft: 6,  max_ft: 7,  min_m: 6  * PIE_M, max_m: 7  * PIE_M },
  { banda: 'Moist subhumid', min_ft: 7,  max_ft: 8,  min_m: 7  * PIE_M, max_m: 8  * PIE_M },
  { banda: 'Dry subhumid',   min_ft: 8,  max_ft: 10, min_m: 8  * PIE_M, max_m: 10 * PIE_M },
  { banda: 'Semiarid',       min_ft: 10, max_ft: 12, min_m: 10 * PIE_M, max_m: 12 * PIE_M },
  { banda: 'Arid',           min_ft: 12, max_ft: 14, min_m: 12 * PIE_M, max_m: 14 * PIE_M },
];

/** Tres pulgadas por mes: por encima de esto el manual pide un vaso más hondo. */
export const INFILTRACION_NORMAL_MAX_MM_MES = 3 * PULGADA_M * 1000;

export interface ProfundidadUtil {
  /** Lo que hay que tener de agua permanente, en el extremo conservador. */
  minimo_m:   number;
  /** El rango publicado de la banda. */
  rango_m:    readonly [number, number];
  banda:      string;
  /** Clase de aridez de acequia con la que se eligió la banda. */
  claseAridez:string;
  fuente:     string;
  advertencias: string[];
  nota:       string;
}

/**
 * @param claseAridez una de las clases que devuelve `clasificarAridez` de
 *   `clima.ts`: Hiperárido, Árido, Semiárido, Seco subhúmedo, Subhúmedo, Húmedo.
 * @param infiltracion_mm_mes pérdida por el vaso, si se la midió o estimó.
 */
export function profundidadUtilMinima(
  claseAridez: string | null | undefined,
  infiltracion_mm_mes?: number | null,
): ProfundidadUtil {
  const fila = (b: string) => TABLA_PROFUNDIDAD_UTIL_AH590.find(f => f.banda === b)!;
  const advertencias: string[] = [];

  let f: FilaProfundidadUtil;
  let comentario: string;
  switch (claseAridez) {
    case 'Hiperárido':
      f = fila('Arid');
      comentario = 'La figura 12 no llega al hiperárido: su banda más seca es «Arid». Se toma esa y el extremo profundo, y aun así el número queda del lado corto.';
      advertencias.push('Clima hiperárido: la tabla de AH-590 no cubre esta banda. La profundidad informada es la de la banda más seca que sí cubre, o sea un piso.');
      break;
    case 'Árido':          f = fila('Arid');           comentario = 'Banda «Arid» de la figura 12.'; break;
    case 'Semiárido':      f = fila('Semiarid');       comentario = 'Banda «Semiarid» de la figura 12.'; break;
    case 'Seco subhúmedo': f = fila('Dry subhumid');   comentario = 'Banda «Dry subhumid» de la figura 12.'; break;
    case 'Subhúmedo':      f = fila('Moist subhumid'); comentario = 'Banda «Moist subhumid» de la figura 12.'; break;
    case 'Húmedo':
      f = fila('Humid');
      comentario = 'La figura 12 separa «Humid» de «Wet» y acequia no: su clase Húmedo es todo P/ETP ≥ 1. Se usa «Humid», que es la más profunda de las dos.';
      break;
    default:
      f = fila('Dry subhumid');
      comentario = 'Sin clase de clima no se puede elegir banda: se usa «Dry subhumid», que está en el medio de la tabla. Cargá la pestaña Clima y el número se afina.';
      advertencias.push('Falta la clase de aridez del predio: la profundidad informada es la de la banda intermedia, no la del lugar.');
      break;
  }

  const minimo = f.max_m;   // extremo profundo de la banda
  if (infiltracion_mm_mes != null && Number.isFinite(infiltracion_mm_mes) && infiltracion_mm_mes > INFILTRACION_NORMAL_MAX_MM_MES) {
    advertencias.push(
      `La infiltración del vaso (${Math.round(infiltracion_mm_mes)} mm/mes) pasa las 3 pulgadas por mes ` +
      `(${Math.round(INFILTRACION_NORMAL_MAX_MM_MES)} mm/mes) que AH-590 considera normales: la figura 12 deja de valer y el ` +
      'vaso tiene que ser más hondo que esto, o impermeabilizarse. El manual no dice cuánto más, así que ' +
      'acequia tampoco: el camino es bajar la infiltración, no inventar una profundidad.');
  }

  return {
    minimo_m: +minimo.toFixed(2),
    rango_m: [+f.min_m.toFixed(2), +f.max_m.toFixed(2)],
    banda: f.banda,
    claseAridez: claseAridez ?? 'sin dato',
    fuente: FUENTE_AH590,
    advertencias,
    nota:
      `${comentario} Para un clima así AH-590 recomienda entre ${f.min_ft} y ${f.max_ft} pies de agua permanente ` +
      `(${f.min_m.toFixed(1)} a ${f.max_m.toFixed(1)} m); acequia informa el extremo profundo. No es la profundidad del vaso: es ` +
      'la lámina que tiene que seguir habiendo cuando la represa está en su mínimo, para que la evaporación ' +
      'y la infiltración no se la lleven. La correspondencia entre la banda del manual y la clase de aridez ' +
      'que calcula acequia es de acequia: los nombres coinciden, las definiciones no.',
  };
}

// ─── 9 · Evaporación del espejo ──────────────────────────────────────────────

/**
 * El espejo de agua no evapora la ETP de referencia. La ETP de referencia es la
 * de un pasto corto bien regado; el agua libre tiene otro albedo, otra
 * rugosidad y —si es honda— capacidad de guardar calor.
 *
 * FAO-56, cuadro 12, apartado «p. Special», da dos filas y nada entre ellas:
 *
 *   - Open Water, < 2 m depth or in subhumid climates or tropics:
 *       Kc mid = 1,05 · Kc end = 1,05
 *   - Open Water, > 5 m depth, clear of turbidity, temperate climate:
 *       Kc mid = 0,65 · Kc end = 1,25
 *
 * Y la nota 25 explica por qué la segunda fila tiene dos valores distintos:
 * *«These Kc's are for deep water in temperate latitudes where large temperature
 * changes in the water body occur during the year, and initial and peak period
 * evaporation is low as radiation energy is absorbed into the deep water body.
 * During fall and winter periods (Kc end), heat is released from the water body
 * that increases the evaporation above that for grass.»*
 *
 * De ahí tres consecuencias que acequia tiene que respetar:
 *
 * 1. El 1,05 que acequia venía usando está bien, pero **sólo para un vaso somero
 *    o para clima subhúmedo o tropical**, que es el caso de casi toda represa de
 *    predio. Tenía el número y no tenía la condición.
 * 2. Un embalse hondo en clima templado no se describe con un factor constante:
 *    evapora MENOS que el pasto mientras se calienta y MÁS cuando se enfría. Un
 *    promedio anual borra justo el mes que importa.
 * 3. Y como la nota habla de estaciones, **hace falta el hemisferio**. La mitad
 *    que se calienta en Córdoba es la que se enfría en Kansas.
 *
 * Entre 2 y 5 m la fuente no dice nada. acequia usa la fila somera —1,05
 * constante— y lo declara: es el valor más alto en la mitad cálida del año, que
 * es la mitad en la que una represa se queda sin agua.
 */
export const KC_ESPEJO_SOMERO              = 1.05;
export const KC_ESPEJO_PROFUNDO_CALENTANDO = 0.65;
export const KC_ESPEJO_PROFUNDO_ENFRIANDO  = 1.25;
export const PROF_ESPEJO_SOMERO_MAX_M      = 2;
export const PROF_ESPEJO_PROFUNDO_MIN_M    = 5;

export type RegimenEspejo = 'somero' | 'profundo_templado' | 'intermedio';

export interface EntradaEvaporacion {
  /** Profundidad media del vaso (m). */
  profMedia_m: number;
  /** Latitud del predio. Decide el hemisferio y si el clima es tropical. */
  lat?: number | null;
  /**
   * Clase de aridez de acequia. La fila somera de FAO-56 aplica también «in
   * subhumid climates or tropics», así que un clima subhúmedo o más húmedo cae
   * en 1,05 sin importar la profundidad.
   */
  claseAridez?: string | null;
  /**
   * Temperatura media de cada mes (12 valores, enero primero). Con ella la
   * mitad que se calienta y la que se enfría salen del dato del predio en vez
   * de del calendario. Sin ella se cae al hemisferio.
   */
  temp_mensual_c?: readonly number[] | null;
}

export interface FactorEvaporacion {
  /** Doce factores, enero primero. Multiplican la ETP de referencia del mes. */
  factor_mensual: number[];
  /** Promedio anual, sólo para mostrar. No se usa en el balance. */
  factor_medio:   number;
  regimen:        RegimenEspejo;
  fuente:         string;
  nota:           string;
  advertencias:   string[];
}

const LAT_TROPICO = 10;

/** Mitad del año que se calienta, por diferencia central de la temperatura. */
function mesesCalentando(temp: readonly number[]): boolean[] {
  return temp.map((_, m) => {
    const prev = temp[(m + 11) % 12]!;
    const next = temp[(m + 1) % 12]!;
    return next - prev >= 0;
  });
}

export function factorEvaporacionEspejo(e: EntradaEvaporacion): FactorEvaporacion {
  const advertencias: string[] = [];
  const lat = e.lat != null && Number.isFinite(e.lat) ? e.lat : null;
  const tropical = lat !== null && Math.abs(lat) <= LAT_TROPICO;
  const humedo = e.claseAridez === 'Húmedo' || e.claseAridez === 'Subhúmedo';
  const prof = Math.max(0, e.profMedia_m);

  // La fila somera gana por profundidad, por clima subhúmedo o por trópico:
  // la fuente las pone como tres condiciones alternativas en la misma fila.
  const porSomero   = prof <= PROF_ESPEJO_SOMERO_MAX_M;
  const porClima    = tropical || humedo;
  const porProfundo = prof >= PROF_ESPEJO_PROFUNDO_MIN_M && !porClima;

  if (porSomero || porClima) {
    const razones: string[] = [];
    if (porSomero) razones.push(`el vaso tiene ${prof.toFixed(1)} m de profundidad media, menos de los 2 m de la fila somera`);
    if (tropical)  razones.push('el predio está en el trópico');
    if (humedo && !tropical) razones.push('el clima es subhúmedo o más húmedo');
    return {
      factor_mensual: Array(12).fill(KC_ESPEJO_SOMERO),
      factor_medio: KC_ESPEJO_SOMERO,
      regimen: 'somero',
      fuente: FUENTE_FAO56,
      advertencias,
      nota:
        `Espejo somero: factor ${KC_ESPEJO_SOMERO} constante sobre la ETP de referencia, porque ` +
        `${razones.join(' y ')}. Es la primera fila de agua libre del cuadro 12 de FAO-56, que ` +
        'cubre «< 2 m depth or in subhumid climates or tropics». Un vaso de pocos metros no guarda ' +
        'calor de una estación a la otra, así que el factor no tiene por qué cambiar con el mes.',
    };
  }

  if (porProfundo) {
    const temp = e.temp_mensual_c && e.temp_mensual_c.length === 12 && e.temp_mensual_c.every(t => Number.isFinite(t))
      ? e.temp_mensual_c : null;

    let calentando: boolean[];
    let comoSeDecidio: string;
    if (temp) {
      calentando = mesesCalentando(temp);
      comoSeDecidio = 'La mitad que se calienta sale de la serie de temperatura media del predio, mes contra mes.';
    } else if (lat !== null) {
      const sur = lat < 0;
      // Hemisferio norte: marzo a agosto se calienta. Sur: septiembre a febrero.
      calentando = Array.from({ length: 12 }, (_, m) => sur ? (m >= 8 || m <= 1) : (m >= 2 && m <= 7));
      comoSeDecidio = `Sin serie de temperatura, la mitad que se calienta se toma del hemisferio ${sur ? 'sur' : 'norte'}.`;
      advertencias.push('Falta la temperatura mes a mes: la mitad del año que se calienta se dedujo del hemisferio. Cargá la pestaña Clima y sale del dato.');
    } else {
      return {
        factor_mensual: Array(12).fill(KC_ESPEJO_SOMERO),
        factor_medio: KC_ESPEJO_SOMERO,
        regimen: 'intermedio',
        fuente: FUENTE_FAO56,
        advertencias: ['Sin latitud ni temperatura no se puede saber qué mitad del año se calienta, y la fila de agua profunda de FAO-56 depende de eso. Se usa la fila somera (1,05), que en la mitad cálida es la más desfavorable.'],
        nota: `Vaso de ${prof.toFixed(1)} m sin ubicación: se usa el factor somero ${KC_ESPEJO_SOMERO}, que es el conservador en la mitad cálida del año.`,
      };
    }

    const factor_mensual = calentando.map(c => c ? KC_ESPEJO_PROFUNDO_CALENTANDO : KC_ESPEJO_PROFUNDO_ENFRIANDO);
    const medio = factor_mensual.reduce((a, b) => a + b, 0) / 12;
    return {
      factor_mensual,
      factor_medio: +medio.toFixed(3),
      regimen: 'profundo_templado',
      fuente: FUENTE_FAO56,
      advertencias,
      nota:
        `Embalse hondo (${prof.toFixed(1)} m de profundidad media) en clima templado: FAO-56 no le da un factor ` +
        `constante sino dos. Mientras el agua se calienta evapora ${KC_ESPEJO_PROFUNDO_CALENTANDO} veces la ETP de ` +
        `referencia, porque la radiación se va en calentar la masa de agua en vez de en evaporar; cuando se ` +
        `enfría devuelve ese calor y evapora ${KC_ESPEJO_PROFUNDO_ENFRIANDO} veces, más que el pasto. Un promedio anual ` +
        `(${medio.toFixed(2)}) borra las dos mitades. ${comoSeDecidio}`,
    };
  }

  // Entre 2 y 5 m la fuente no dice nada.
  advertencias.push(
    `El vaso tiene ${prof.toFixed(1)} m de profundidad media, entre los 2 m de la fila somera y los 5 m de la ` +
    'fila profunda de FAO-56: la fuente no cubre ese tramo. Se usa la fila somera, que en la mitad cálida del ' +
    'año es la más desfavorable, y es la mitad en la que una represa se queda sin agua. No se interpola entre ' +
    'las dos filas: nadie midió el medio.');
  return {
    factor_mensual: Array(12).fill(KC_ESPEJO_SOMERO),
    factor_medio: KC_ESPEJO_SOMERO,
    regimen: 'intermedio',
    fuente: FUENTE_FAO56,
    advertencias,
    nota:
      `Profundidad media de ${prof.toFixed(1)} m: queda en el hueco entre las dos filas de agua libre de FAO-56. ` +
      `Se aplica el factor somero ${KC_ESPEJO_SOMERO} y se avisa.`,
  };
}

// ─── 10 · Concentrar el vaso: el truco que la app puede cuantificar ──────────

export interface CandidatoCota {
  /** Rótulo para mostrar: «cota 412,5», «muro de 3 m»… */
  etiqueta:       string;
  nivel_m:        number;
  volumen_m3:     number;
  area_espejo_m2: number;
  /** Tierra a mover, en banco. Opcional: sin ella no se compara por costo. */
  banco_m3?:      number | null;
}

export interface CandidatoEvaluado extends CandidatoCota {
  /** Lámina evaporada en el año, en mm. */
  lamina_anual_mm:      number;
  evaporacion_anual_m3: number;
  /** Fracción del volumen embalsado que se evapora en un año. */
  perdida_anual_frac:   number;
  profMedia_m:          number;
  /** m³ de tierra en banco por m³ de agua. Es el costo en unidades de obra. */
  tierra_por_agua:      number | null;
  /** Costo por m³ de agua, si se dio un precio. */
  costo_por_m3_agua:    number | null;
}

export interface ComparacionCotas {
  candidatos:  CandidatoEvaluado[];
  /** El de menor pérdida relativa por evaporación. */
  mejorEvaporacion: CandidatoEvaluado | null;
  /** El de menor tierra por m³ de agua. */
  mejorMovimiento:  CandidatoEvaluado | null;
  fuente:      string;
  nota:        string;
}

/**
 * Comparar candidatos de embalse por cota.
 *
 * El truco de diseño que esto cuantifica es real y viejo: **para el mismo
 * volumen, conviene el vaso más concentrado**. La evaporación se cobra por
 * metro cuadrado de espejo y el almacenamiento se paga por metro cúbico, así
 * que subir la cota un metro sobre un vaso angosto guarda más agua por hectárea
 * de espejo que abrir el espejo sobre una loma. En un vaso somero de clima seco
 * la evaporación anual puede ser una fracción grande de lo embalsado, y es la
 * única pérdida que no se arregla después.
 *
 * Contra eso juega el movimiento de tierra, que crece con el cuadrado de la
 * altura del muro. Por eso se informan los dos números y no se elige por el
 * usuario: el mejor por evaporación y el mejor por tierra movida casi nunca son
 * el mismo, y cuál pesa depende de si lo escaso es el agua o la plata.
 */
export function compararCotas(p: {
  candidatos: readonly CandidatoCota[];
  /** ETP de referencia de cada mes (mm), enero primero. */
  etp_mensual_mm: readonly number[];
  lat?: number | null;
  claseAridez?: string | null;
  temp_mensual_c?: readonly number[] | null;
  /** Precio del m³ de tierra movida, en la moneda del usuario. */
  precio_m3_tierra?: number | null;
}): ComparacionCotas {
  const etpAnual = p.etp_mensual_mm.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);

  const candidatos: CandidatoEvaluado[] = p.candidatos.map(c => {
    const prof = c.area_espejo_m2 > 0 ? c.volumen_m3 / c.area_espejo_m2 : 0;
    const f = factorEvaporacionEspejo({
      profMedia_m: prof, lat: p.lat, claseAridez: p.claseAridez, temp_mensual_c: p.temp_mensual_c,
    });
    let lamina = 0;
    for (let m = 0; m < 12; m++) {
      const etp = p.etp_mensual_mm[m];
      if (Number.isFinite(etp)) lamina += (etp as number) * f.factor_mensual[m]!;
    }
    const evap = c.area_espejo_m2 * (lamina / 1000);
    const banco = c.banco_m3 != null && Number.isFinite(c.banco_m3) && c.banco_m3 > 0 ? c.banco_m3 : null;
    const tpa = banco !== null && c.volumen_m3 > 0 ? banco / c.volumen_m3 : null;
    const precio = p.precio_m3_tierra != null && Number.isFinite(p.precio_m3_tierra) ? p.precio_m3_tierra : null;
    return {
      ...c,
      lamina_anual_mm: Math.round(lamina),
      evaporacion_anual_m3: Math.round(evap),
      perdida_anual_frac: c.volumen_m3 > 0 ? +(evap / c.volumen_m3).toFixed(3) : 0,
      profMedia_m: +prof.toFixed(2),
      tierra_por_agua: tpa !== null ? +tpa.toFixed(2) : null,
      costo_por_m3_agua: tpa !== null && precio !== null ? +(tpa * precio).toFixed(2) : null,
    };
  });

  const conVolumen = candidatos.filter(c => c.volumen_m3 > 0);
  const mejorEvap = conVolumen.length
    ? conVolumen.reduce((a, b) => (b.perdida_anual_frac < a.perdida_anual_frac ? b : a))
    : null;
  const conTierra = candidatos.filter(c => c.tierra_por_agua !== null);
  const mejorMov = conTierra.length
    ? conTierra.reduce((a, b) => (b.tierra_por_agua! < a.tierra_por_agua! ? b : a))
    : null;

  const partes: string[] = [];
  if (mejorEvap && conVolumen.length > 1) {
    const peor = conVolumen.reduce((a, b) => (b.perdida_anual_frac > a.perdida_anual_frac ? b : a));
    if (peor !== mejorEvap) {
      partes.push(
        `Por evaporación conviene ${mejorEvap.etiqueta}: pierde el ${(mejorEvap.perdida_anual_frac * 100).toFixed(0)} % ` +
        `de lo embalsado en el año contra el ${(peor.perdida_anual_frac * 100).toFixed(0)} % de ${peor.etiqueta}. ` +
        'Es el mismo volumen concentrado en menos espejo: la evaporación se cobra por metro cuadrado.');
    }
  }
  if (mejorMov && conTierra.length > 1 && mejorEvap && mejorMov.etiqueta !== mejorEvap.etiqueta) {
    partes.push(
      `Por movimiento de tierra conviene ${mejorMov.etiqueta}, con ${mejorMov.tierra_por_agua} m³ de tierra por m³ de agua. ` +
      'No es el mismo candidato que gana por evaporación, y ahí la decisión deja de ser técnica: depende de si en ' +
      'este predio lo escaso es el agua o la plata.');
  }
  if (etpAnual <= 0) partes.push('Sin ETP mensual no hay evaporación que comparar: cargá la pestaña Clima.');

  return {
    candidatos,
    mejorEvaporacion: mejorEvap,
    mejorMovimiento: mejorMov,
    fuente: `${FUENTE_FAO56} · ${FUENTE_AH590}`,
    nota: partes.join(' '),
  };
}
