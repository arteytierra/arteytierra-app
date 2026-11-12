/**
 * ¿El predio está sobre un suelo expansivo?
 *
 * ## Por qué existe, y por qué el aviso va antes que el número
 *
 * El 23/10/2026, montando la ficha de la ecorregión 290 —el Decán central—,
 * apareció que para los suelos expansivos acequia calcula el escurrimiento **al
 * revés**. `suelos.ts` asigna el grupo hidrológico por la conductividad de la
 * capa más limitante del primer metro: debajo de 3,6 mm/h es grupo D, y de ahí
 * sale el coeficiente de escorrentía **anual** que alimenta el rendimiento de la
 * represa (`COEF_BASE_GRUPO` en `cuenca.ts`: 0,28 para D contra 0,13 para B).
 *
 * En las microcuencas del ICRISAT en Patancheru, al lado de Hyderabad, con
 * escurrimiento medido de 8 a 12 años y serie hidrológica de 1976 a 2010, lo
 * medido es esto:
 *
 *   vertisol arcilloso con cultivo, años normales de 600 a 900 mm ... 7 a 11 %
 *   alfisol arenoso, con Ksat saturada MÁS alta ....................  16 a 17 %
 *   vertisol profundo en barbecho .................................. 17 %
 *   años secos, menos de 500 mm ....................................  < 2 % en los dos
 *
 * **La arcilla escurre la mitad que la arena**, porque el alfisol se encostra y
 * se sella mientras el vertisol se agrieta al principio de la temporada y además
 * guarda mucha agua —unos 230 mm de agua útil en el perfil profundo—. Para un
 * vertisol con cultivo en línea la app daría 0,28 × 1,15 = **32 %** contra 7 a
 * 11 % medido, y en barbecho 42 % contra 17 %. En el alfisol da 15 % contra 16 a
 * 17 %, o sea **acierta ahí**. El error va para arriba, así que la represa se
 * dimensiona con un agua que no llega.
 *
 * Y un solo número de infiltración no puede describir este suelo. Virmani y
 * Swindale (1984) midieron en el mismo vertisol del ICRISAT:
 *
 *   primera media hora ....... 76 mm/h
 *   segunda media hora ....... 34 mm/h
 *   segunda hora .............  4 mm/h
 *   después de 144 horas ..... 0,21 ± 0,1 mm/h
 *
 * Factor **360** entre el suelo agrietado y el suelo sellado. Cualquier Ksat
 * única describe uno de los dos estados, nunca los dos, y la obra se diseña con
 * uno de los dos.
 *
 * Por eso este módulo **no cambia ningún coeficiente**: reconoce el suelo y deja
 * que `saludCalculo.ts` avise. Garg et al. es un sitio, un clima y un manejo, y
 * reemplazar una tabla global por un valor de Patancheru sería cambiar un número
 * general por uno local. El veredicto del lote está en
 * `_research/_encargos/RESPUESTAS_FICHAS_INDOMALAYA_DECAN.md`, sección «Lo
 * cuarto, que no estaba pedido».
 *
 * ## El criterio, y de dónde sale cada umbral
 *
 * Los tres salen del **WRB 2022**, leído del primario:
 *
 * - **Arcilla ≥ 30 %** — criterio 1 del *horizonte vértico* (§3.1.40) y del
 *   *protovértico* (§3.1.32). Es la cantidad mínima de arcilla para que el
 *   hinchamiento y la contracción del perfil importen.
 * - **Actividad de la arcilla ≥ 24 cmol(c)/kg de arcilla** — es el complemento
 *   exacto de las *propiedades siderálicas* (§3.2.13), que WRB define como
 *   «≥ 8 % de arcilla y una CEC (por NH4OAc 1 M, pH 7) de < 24 cmol(c)/kg de
 *   arcilla». O sea: debajo de 24 la arcilla es de baja actividad —caolinita,
 *   óxidos— y no se hincha; arriba hay arcillas 2:1.
 * - **LEP ≥ 6 %** — el horizonte vértico «usually» tiene un coeficiente de
 *   extensibilidad lineal (COLE) ≥ 0,06, y es además el criterio 2d del
 *   protovértico. LEP es ese mismo COLE en porcentaje, y es lo que mide SSURGO.
 *
 * La actividad se calcula como `CEC / arcilla × 100`, las dos del mismo tramo:
 * CEC en cmol(c)/kg de suelo y arcilla en %, así que el cociente queda en
 * cmol(c)/kg de arcilla, que es la unidad del umbral de WRB.
 *
 * ## El tramo de control, que es la mitad del asunto
 *
 * El cociente se calcula entre **30 y 100 cm**, no en superficie, y no es un
 * detalle: en el horizonte superficial una parte grande de la CEC la aporta el
 * humus, no la arcilla, y el cociente miente para arriba. Medido en Boone, Iowa
 * —un Mollisol de loess— la actividad baja de 94 en los primeros 5 cm a 60 a los
 * 100-200: es el mismo suelo, y lo que cambia es cuánto carbono hay arriba.
 * Entre 30 y 100 cm el aporte orgánico ya es chico y las dos capas de SoilGrids
 * caen enteras adentro del tramo, sin solapamientos parciales.
 *
 * ## Qué fuente puede responder cada cosa
 *
 * - **`medido`** — sólo donde hay un relevamiento de campo. Hoy eso es SSURGO
 *   (Estados Unidos): `taxorder = 'Vertisols'` es la clasificación del
 *   edafólogo, y `lep_r` es la extensibilidad lineal medida en el laboratorio,
 *   que USDA define como «el cambio de longitud de un terrón no confinado cuando
 *   el contenido de agua baja de húmedo a seco… informado como cambio porcentual
 *   para el suelo entero».
 * - **`posible`** — la inferencia desde SoilGrids, que es lo único que hay en el
 *   resto del mundo. Dice «puede ser», nunca «es», y el texto manda al campo:
 *   WRB confirma un horizonte vértico con grietas de contracción de ≥ 0,5 cm que
 *   abren y cierran con el agua, agregados en cuña inclinados entre 10° y 60°, y
 *   caras de deslizamiento (slickensides) en ≥ 10 % de las caras de los
 *   agregados. Eso se ve en una calicata y no en un ráster.
 *
 * ## Rango de validez, y el falso positivo que tiene adentro
 *
 * Medido el 12/11/2026 contra la API de consulta de SoilGrids a 250 m, y en los
 * puntos de Estados Unidos contra SSURGO en el mismo punto. Arcilla y actividad
 * son el promedio ponderado de 30 a 100 cm; LEP y taxorder son de SSURGO:
 *
 *   punto                              arcilla  actividad  medido en SSURGO
 *   Heiden, Riesel TX (-96,8767/31,4757)  49,1 %     68     Vertisols, LEP 12,0-12,2
 *   Capay, valle de Sacramento CA         36,0 %     70     Vertisols, LEP 7,8-9,9
 *   Vertisol de Gezira, Sudán             50,6 %     68     —
 *   Vertisol de Entre Ríos, AR            46,3 %     62     —
 *   Vertisol del ICRISAT, Patancheru       44,1 %     64     —
 *   Vertosol de Darling Downs, AU          61,9 %     56     —
 *   Argiudol de Pergamino, AR              32,1 %     86     —   ← falso positivo
 *   Latossolo del Cerrado, BR              47,1 %     16     —
 *   Turbera de Riau, Sumatra               50,4 %     18     —
 *   Wedowee (Cecil), Piedmont de GA        41,4 %     14     Ultisols, LEP 1,5
 *   Clarion, Boone IA                      24,8 %     77     Mollisols, LEP 2,5
 *   Llanura del Pilbara, AU                25,9 %    103     —
 *
 * Tres cosas de esa tabla:
 *
 * 1. **El corte de 24 cae en un hueco anchísimo.** Los cuatro suelos de arcilla
 *    de baja actividad miden de 14 a 18 y los demás de 56 para arriba. No hay
 *    nada entre 18 y 56, así que el umbral publicado no está decidiendo casos
 *    de borde: está separando dos poblaciones.
 * 2. **El piso de arcilla es el que hace el trabajo fino, y está validado contra
 *    una medición.** Clarion, en Iowa, tiene actividad 77 y sin embargo LEP
 *    **2,5 % medido**: no se hincha porque no tiene arcilla suficiente (24,8 %).
 *    El piso de 30 % de WRB lo deja afuera, y lo mismo al Pilbara. La actividad
 *    dice de qué está hecha la arcilla; la cantidad decide si eso se nota.
 * 3. **Y queda un falso positivo, declarado.** El Argiudol de Pergamino pasa los
 *    dos umbrales —32,1 % de arcilla, actividad 86— y no es un suelo expansivo:
 *    su arcilla es ilítica. Es exactamente el caso que la inferencia no puede
 *    resolver, porque «arcilla de alta actividad» incluye a la ilita y a la
 *    vermiculita, que tienen CEC alta y no se hinchan. Por eso el nivel se llama
 *    `posible` y el texto pide la verificación de campo. Un `posible` en la
 *    Pampa es un aviso que no cuesta nada: el coeficiente anual de la Pampa
 *    también está sobreestimado, por llanura en vez de por grietas.
 *
 * ## Por qué CEC y no otra variable
 *
 * No es una ocurrencia: lo dice la fuente del dato. Poggio et al. (2021), el
 * trabajo que publica SoilGrids 2.0, al evaluar sus propios mapas escribe que el
 * mapa de CEC «identifica claramente grandes regiones de arcillas muy
 * meteorizadas (p. ej. el sudeste de Estados Unidos y de China, el centro de
 * Brasil) y de arcillas 2:1 de CEC alta (p. ej. los vertisoles de *black cotton*
 * de la meseta del Decán y de Sudán)». Las cuatro regiones que nombran son
 * cuatro de los puntos de la tabla de arriba, y la medición reproduce en números
 * lo que el trabajo afirma en palabras.
 *
 * Lo que **no** sirve: la densidad aparente, por lo mismo que en
 * `sueloOrganico.ts`; y la clase textural sola, que es la que ya tiene el motor
 * y es justamente la que se equivoca —el Latossolo del Cerrado y el vertisol de
 * Gezira son los dos «arcilloso» y se comportan al revés—.
 *
 * ## La incertidumbre que hay que declarar
 *
 * La CEC de WoSIS, que es el dato con el que SoilGrids se entrena, está
 * «buffered at pH 7», igual que el umbral de WRB, así que los métodos coinciden.
 * Pero Batjes et al. (2020) miden la variabilidad entre laboratorios de esa
 * determinación en **18 %, con un rango de 13 a 25 %**, y eso se propaga entero
 * al cociente. Con la arcilla sumando su propia incertidumbre, una actividad de
 * 28 contra un umbral de 24 no es una respuesta: es un empate. La tabla de
 * arriba aguanta eso porque el hueco medido es de 18 a 56.
 *
 * Y el paso de la grilla: a 1 km la celda promedia, así que un vertisol chico en
 * un paisaje de otra cosa queda diluido. Igual que con la turba, **esta función
 * subestima antes que sobreestimar**, salvo por el falso positivo declarado.
 *
 * Fuentes:
 *   IUSS Working Group WRB 2022, World Reference Base for Soil Resources,
 *     4.ª ed. §3.1.32, §3.1.40, §3.2.13 y §3.2.12 (grietas)
 *     https://wrb.isric.org/files/WRB_fourth_edition_2022-12-18.pdf
 *   Poggio, de Sousa, Batjes, Heuvelink, Kempen, Ribeiro y Rossiter 2021,
 *     SoilGrids 2.0: producing soil information for the globe with quantified
 *     spatial uncertainty, SOIL 7:217-240, doi:10.5194/soil-7-217-2021
 *   Batjes, Ribeiro y van Oostrum 2020, Standardised soil profile data to
 *     support global mapping and modelling (WoSIS snapshot 2019),
 *     Earth System Science Data 12:299-320, doi:10.5194/essd-12-299-2020
 *   USDA-NRCS, Soil Data Access — definición de «Linear Extensibility»,
 *     consultada por `sdvattribute` el 12/11/2026 (dominio público)
 *   Pathak, Sudi, Wani y Sahrawat 2013, Hydrological behaviour of Alfisols and
 *     Vertisols in the semi-arid zone, Agricultural Water Management 118:12-21,
 *     doi:10.1016/j.agwat.2012.11.012 (leído el resumen)
 *   Garg et al. 2021, Catena 211:105972, doi:10.1016/j.catena.2021.105972
 *     (leído el resumen)
 *   Virmani y Swindale 1984, vía FAO https://www.fao.org/4/x5493e/x5493e03.htm
 *     tabla 2 (leída entera)
 */
import type { CapaSuelo } from './suelos';

/** Arcilla mínima del horizonte vértico y del protovértico (WRB 2022), en %. */
export const ARCILLA_VERTICA_PCT = 30;

/**
 * Límite de WRB entre arcilla de baja y de alta actividad, en cmol(c)/kg de
 * arcilla. Debajo de esto son propiedades siderálicas: caolinita y óxidos.
 */
export const ACTIVIDAD_ALTA_CMOL = 24;

/**
 * Extensibilidad lineal del horizonte vértico, en % (≡ COLE ≥ 0,06). Es el
 * criterio 2d del protovértico, así que alcanza solo.
 */
export const LEP_VERTICO_PCT = 6;

/** Tramo de control del cociente, en cm: abajo del humus y arriba del metro. */
export const CONTROL_TOP_CM = 30;
export const CONTROL_BOT_CM = 100;

export interface SueloExpansivo {
  /**
   * `medido` sale de un relevamiento de campo (hoy SSURGO); `posible` es la
   * inferencia desde SoilGrids, que no puede distinguir esmectita de ilita.
   */
  nivel: 'medido' | 'posible';
  criterio: 'vertisol_ssurgo' | 'lep_ssurgo' | 'actividad_arcilla';
  /**
   * Arcilla del tramo de control, en % (promedio ponderado por espesor), o
   * `null` si el perfil no llega hasta ahí. Puede faltar y el diagnóstico
   * valer igual: un `taxorder` de campo no necesita este número.
   */
  arcilla_pct: number | null;
  /** CEC del tramo, en cmol(c)/kg de suelo, o `null` si la fuente no la trae. */
  cec: number | null;
  /** Actividad de la arcilla, en cmol(c)/kg de arcilla. */
  actividad: number | null;
  /** Extensibilidad lineal máxima del primer metro, en %, si se mide. */
  lep_pct: number | null;
  /** Orden taxonómico del USDA, si la fuente lo trae. */
  taxorder: string | null;
  /** Qué es y qué hay que mirar en el campo, en una frase que se imprime. */
  cautela: string;
  /** El dato, su umbral y su límite, para que el número no salga solo. */
  detalle: string;
  /** Qué número de la app queda tocado. Lo lee `saludCalculo.ts`. */
  efecto_hidrologico: string;
}

/** Cuánto de la capa cae dentro del tramo de control, en cm. */
function solape(c: CapaSuelo): number {
  return Math.max(0, Math.min(CONTROL_BOT_CM, c.prof_bot) - Math.max(CONTROL_TOP_CM, c.prof_top));
}

/** Promedio ponderado por el espesor que cada capa aporta al tramo. */
function ponderado(capas: Array<{ peso: number; valor: number | null }>): number | null {
  const con = capas.filter((c): c is { peso: number; valor: number } => c.valor !== null && c.peso > 0);
  if (!con.length) return null;
  const peso = con.reduce((a, c) => a + c.peso, 0);
  if (peso <= 0) return null;
  return con.reduce((a, c) => a + c.valor * c.peso, 0) / peso;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** El tramo de control, dicho en texto, para los `detalle`. */
const TRAMO = `entre ${CONTROL_TOP_CM} y ${CONTROL_BOT_CM} cm`;

const LIMITE_INFERENCIA =
  'La actividad sale de la CEC y la arcilla de SoilGrids, que son dos valores '
  + 'modelados: la variabilidad entre laboratorios de la CEC a pH 7 ya es del '
  + '18 % (13 a 25 %) y se propaga entera al cociente, así que un valor pegado '
  + 'al umbral no decide nada. Y a 1 km la celda promedia, así que un vertisol '
  + 'chico en un paisaje de otra cosa queda diluido: esto subestima antes que '
  + 'sobreestimar.';

const VERIFICACION_DE_CAMPO =
  'Se confirma en una calicata, no en un mapa: grietas de contracción de 0,5 cm '
  + 'o más que abren y cierran con el agua, agregados en cuña inclinados entre '
  + '10° y 60°, y caras de deslizamiento lustrosas (slickensides). Si el suelo '
  + 'está húmedo puede no verse nada hasta que seque.';

const EFECTO =
  'Toca el coeficiente de escorrentía ANUAL, que es el que alimenta el '
  + 'rendimiento de la represa, y lo toca para arriba. En las microcuencas del '
  + 'ICRISAT en Patancheru, con escurrimiento medido de 8 a 12 años, un vertisol '
  + 'con cultivo escurrió 7 a 11 % de la lluvia en años normales y 17 % en '
  + 'barbecho, mientras el alfisol arenoso de al lado —con conductividad MÁS '
  + 'alta— escurrió 16 a 17 %: la arcilla escurrió la mitad que la arena, porque '
  + 'se agrieta al principio de la temporada y guarda mucha agua. La tabla de la '
  + 'app, por grupo hidrológico, daría 32 % para ese mismo vertisol con cultivo. '
  + 'Para la tormenta de diseño, en cambio, el grupo D es razonable: cuando el '
  + 'perfil está húmedo las grietas están cerradas, y ahí la infiltración medida '
  + 'cae a 0,21 mm/h contra 76 mm/h en la primera media hora, un factor 360.';

/** «Arcilla de 44,1 % entre 30 y 100 cm», o nada si el perfil no llega. */
function frase(arcilla: number | null): string {
  return arcilla === null
    ? `El perfil no llega al tramo de ${CONTROL_TOP_CM} a ${CONTROL_BOT_CM} cm, así que no hay cociente que calcular`
    : `Arcilla de ${r1(arcilla)} % ${TRAMO}`;
}

/**
 * Reconoce un suelo expansivo en el perfil. Devuelve `null` cuando no llega a
 * ningún criterio, cuando el perfil no cubre el tramo de control y cuando la
 * fuente no trae CEC ni extensibilidad: las tres cosas son distintas y en las
 * tres la respuesta honesta es no afirmar nada.
 *
 * `null` no dice «acá no hay un suelo expansivo». Dice «con este dato no se
 * puede afirmar que lo haya».
 *
 * El orden de los tres criterios es el orden de la calidad del dato: la
 * clasificación de campo primero, la extensibilidad medida después, y la
 * inferencia al final. Y los dos primeros **no dependen del tramo de control**:
 * una medición de campo no necesita que SoilGrids llegue a los 100 cm.
 */
export function detectarSueloExpansivo(
  perfil: CapaSuelo[],
  clasificacion?: { taxorder?: string | null },
): SueloExpansivo | null {
  if (!perfil.length) return null;

  // El tramo de control, para la inferencia.
  const capas = perfil.map(c => ({ c, peso: solape(c) })).filter(x => x.peso > 0);
  const arcillaCruda = ponderado(capas.map(x => ({ peso: x.peso, valor: x.c.arcilla })));
  // Una arcilla en cero es NoData río arriba, no un suelo sin arcilla.
  const arcilla = arcillaCruda !== null && arcillaCruda > 0 ? arcillaCruda : null;

  const cecCruda = ponderado(capas.map(x => ({ peso: x.peso, valor: x.c.cec ?? null })));
  const cec = cecCruda !== null && cecCruda > 0 ? cecCruda : null;
  const actividad = cec !== null && arcilla !== null ? (cec / arcilla) * 100 : null;

  // La extensibilidad se mira por capa y en todo el primer metro, porque WRB le
  // pide el valor a un horizonte y no al promedio de un tramo.
  const primerMetro = perfil.filter(c => c.prof_top < CONTROL_BOT_CM);
  const leps = primerMetro
    .map(c => c.lep)
    .filter((v): v is number => typeof v === 'number' && v >= 0);
  const lep = leps.length ? Math.max(...leps) : null;
  const capaVertica = primerMetro.find(
    c => typeof c.lep === 'number'
      && c.lep >= LEP_VERTICO_PCT
      && c.arcilla >= ARCILLA_VERTICA_PCT,
  );

  const taxorder = clasificacion?.taxorder?.trim() || null;
  const comun = {
    arcilla_pct: arcilla === null ? null : r1(arcilla),
    cec: cec === null ? null : r1(cec),
    actividad: actividad === null ? null : Math.round(actividad),
    lep_pct: lep,
    taxorder,
    efecto_hidrologico: EFECTO,
  };

  // 1. La clasificación del edafólogo. Es la única que dice «es», sin matices.
  if (taxorder && /^vertisols?$/i.test(taxorder)) {
    return {
      ...comun,
      nivel: 'medido',
      criterio: 'vertisol_ssurgo',
      cautela:
        'Suelo expansivo: el relevamiento de campo lo clasifica como Vertisol. '
        + 'Se agrieta al secarse y se cierra al mojarse, así que no tiene una '
        + 'infiltración, tiene dos. Lo que la app calcula de escurrimiento anual '
        + 'está sobreestimado, y lo que se funde o se cimienta encima se mueve '
        + 'con la humedad.',
      detalle:
        `SSURGO clasifica el componente dominante como Vertisol${
          lep !== null ? `, con extensibilidad lineal medida de hasta ${r1(lep)} %` : ''
        }. ${frase(arcilla)}`
        + `${actividad !== null ? `, actividad de arcilla ${Math.round(actividad)} cmol(c)/kg` : ''}.`,
    };
  }

  // 2. La extensibilidad medida. WRB la acepta sola para el protovértico, en su
  //    criterio 2d, siempre que el mismo horizonte tenga la arcilla.
  if (capaVertica && typeof capaVertica.lep === 'number') {
    return {
      ...comun,
      nivel: 'medido',
      criterio: 'lep_ssurgo',
      cautela:
        'Suelo expansivo: la extensibilidad lineal medida alcanza el valor que '
        + 'WRB le pide a un horizonte vértico. Se agrieta al secarse y se cierra '
        + 'al mojarse, así que no tiene una infiltración, tiene dos, y lo que la '
        + 'app calcula de escurrimiento anual está sobreestimado.',
      detalle:
        `Extensibilidad lineal de ${r1(capaVertica.lep)} % medida por SSURGO en `
        + `${capaVertica.label}, contra el ${LEP_VERTICO_PCT} % que equivale al `
        + `COLE ≥ 0,06 del horizonte vértico de WRB, y ${r1(capaVertica.arcilla)} % `
        + `de arcilla en ese mismo horizonte (WRB pide ≥ ${ARCILLA_VERTICA_PCT} %).`,
    };
  }

  // 3. La inferencia, que es lo único que hay fuera de Estados Unidos.
  if (
    arcilla !== null && actividad !== null && cec !== null
    && arcilla >= ARCILLA_VERTICA_PCT && actividad >= ACTIVIDAD_ALTA_CMOL
  ) {
    return {
      ...comun,
      nivel: 'posible',
      criterio: 'actividad_arcilla',
      cautela:
        'Puede ser un suelo expansivo, y conviene saberlo antes de dimensionar '
        + 'una represa o cimentar. Tiene la arcilla que pide WRB y esa arcilla es '
        + 'de alta actividad, o sea 2:1. Lo que el dato no puede separar es la '
        + 'esmectita, que se hincha, de la ilita y la vermiculita, que tienen CEC '
        + `alta y no. ${VERIFICACION_DE_CAMPO}`,
      detalle:
        `${frase(arcilla)} (WRB pide ≥ ${ARCILLA_VERTICA_PCT} % para el horizonte `
        + `vértico) y actividad de ${Math.round(actividad)} cmol(c)/kg de arcilla, `
        + `con CEC de ${r1(cec)} cmol(c)/kg de suelo (WRB llama baja actividad a `
        + `< ${ACTIVIDAD_ALTA_CMOL}). ${LIMITE_INFERENCIA}`,
    };
  }

  return null;
}
