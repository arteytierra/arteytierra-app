/**
 * El master plan por etapas: en qué orden, y en qué meses.
 *
 * ── Qué había y qué le falta ─────────────────────────────────────────────────
 *
 * `masterplan.ts` es un motor de **emplazamiento**: recibe el programa del
 * predio y le busca a cada elemento el lugar que el terreno admite, con un
 * puntaje por celda. Contesta *dónde*. No contesta *cuándo*, y un diseño sin
 * cuándo no se puede empezar: el productor tiene el plano completo y la primera
 * pregunta del lunes es qué se hace primero.
 *
 * La bitácora de la escala de permanencia (`EscalaPermanenciaPanel`) ya trae los
 * ocho factores de Yeomans ordenados de lo más permanente a lo más cambiable
 * —clima, geografía, agua, accesos, sistemas, estructuras, subdivisiones,
 * suelo— y es la respuesta correcta a *en qué orden se decide*. Pero es una
 * lista de tildes: nada la lee, nada la cruza con las obras que la app diseñó, y
 * nada dice en qué mes se puede mover tierra.
 *
 * ── El orden no es una opinión: es un grafo ─────────────────────────────────
 *
 * La permanencia da el orden por defecto. Encima van las precedencias que las
 * especificaciones publican, que son duras y no se negocian:
 *
 * 1 · **El replanteo va antes de que entre la máquina.** AH-590: «Each job must
 *     be adequately and clearly staked **before construction is started**».
 *
 * 2 · **El destape se acopia y se devuelve.** AH-590: «Remove sod, boulders, and
 *     topsoil from the entire area over which the embankment is to be placed […]
 *     The topsoil should be **stockpiled temporarily for later use on the site**».
 *     Son dos operaciones en dos etapas distintas con el terraplén en el medio,
 *     y el acopio es un elemento del predio que ocupa lugar mientras dura.
 *
 * 3 · **Una obra de tierra no termina cuando se termina de mover la tierra.**
 *     Tres fuentes distintas dicen lo mismo desde tres lados. La norma de cauce
 *     empastado (CPS 412) pide establecer la vegetación **antes** de conducir
 *     agua por el cauce, y protegerla hasta que prenda con mulch, cultivo
 *     niñera, piedra o desviando el escurrimiento. AH-590, sobre la siembra:
 *     «Prepare a seedbed **as soon after construction as practicable**». Y
 *     AH-590 otra vez, que conviene leerlo entero: «**Construction of the pond
 *     is not complete until you have provided protection against erosion, wave
 *     action, trampling by livestock**, and any other source of damage. Ponds
 *     without this protection may be short lived, and the cost of maintenance is
 *     usually high.»
 *
 *     Con lo cual el cierre que saca la hacienda del muro y la cubierta del
 *     talud **son parte de la represa** y no una etapa posterior: un plan que
 *     construye la represa en la etapa 1 y pone el alambrado en la etapa 4 no
 *     terminó la represa, la dejó tres etapas expuesta. Y el empaste de un swale
 *     es parte del swale.
 *
 * 4 · **Y de ahí sale el resultado que no se ve venir: esas obras tienen una
 *     ventana más corta, y a veces vacía.** Si la obra incluye su cobertura,
 *     entonces no alcanza con un mes en que la tierra se pueda compactar: hace
 *     falta un mes en que la tierra se pueda compactar **y que esté seguido por
 *     un mes en que el pasto prenda**. Las dos ventanas no son la misma y en
 *     muchos climas apuntan a estaciones opuestas: la tierra se compacta en la
 *     seca y la semilla germina en la lluvia. Cuando la intersección sale
 *     vacía, el calendario no tiene solución —y la fuente ya la tenía: eso es
 *     exactamente para lo que CPS 412 lista el mulch, el cultivo niñera y el
 *     desvío del escurrimiento. La composición de las dos ventanas encuentra el
 *     problema; la norma ya traía la respuesta.
 *
 * ── Y el calendario tiene una asimetría que nadie espera ────────────────────
 *
 * La intuición dice que hay una «buena época» para mover tierra y que a los
 * costados está peor, simétricamente. Las fuentes dicen otra cosa, y lo dicen
 * tres veces con las mismas palabras.
 *
 * Especificación de terraplén, control de humedad: el material demasiado **seco**
 * «shall either be removed or **scarified and wetted by sprinkling** to an
 * acceptable moisture content»; el material demasiado **mojado** «shall be either
 * removed or **allowed to dry** to an acceptable moisture content before
 * compaction». AH-590, al sellar un vaso: «If the area is too wet, **postpone**
 * sealing until moisture conditions are satisfactory. If it is too dry, **add
 * water by sprinkling**.» Y al sembrar: «If construction is completed when the
 * soils are too dry for the seeds to germinate, **irrigate** the soils».
 *
 * **Las dos salidas no cuestan lo mismo.** Demasiado seco se arregla con agua:
 * es una partida de la lista de materiales y un camión. Demasiado mojado se
 * arregla esperando: es un mes perdido, y si el mes siguiente también está
 * mojado, son dos. Por eso el calendario de una etapa de movimiento de suelo no
 * es una banda de meses buenos: es un conjunto de meses **bloqueados** —esos no
 * se discuten— y un resto de meses posibles, de los cuales algunos **piden
 * agua**.
 *
 * Y acequia puede decir cuáles son, porque el balance hídrico de la etapa G ya
 * lo calcula mes a mes:
 *
 * - un mes con **excedente** es un mes en que el suelo pasó capacidad de campo y
 *   largó agua. Capacidad de campo está muy por encima de la humedad óptima de
 *   compactación, así que ese mes el relleno llega demasiado mojado: **bloqueado**;
 * - un mes que cierra con el almacenaje **por debajo del agua fácilmente
 *   aprovechable** —el umbral de FAO-56, que acequia ya usa para el riego— es un
 *   mes en que lo que queda en el suelo ya no sale solo: demasiado seco, **se
 *   puede trabajar pero hay que mojar**;
 * - el resto son los meses en que el suelo está entre los dos extremos, y son
 *   los que no piden nada.
 *
 * Esos tres estados no son umbrales de compactación —esos se miden con la mano,
 * y la prueba publicada está en la planilla— sino **estados del balance de agua
 * del suelo**, que es el dato que acequia tiene. La que decide en el terreno es
 * la mano; esto dice en qué mes ir a probar.
 *
 * ── Lo que este módulo NO hace ──────────────────────────────────────────────
 *
 * No pone fechas: pone meses, porque el dato climático son medias mensuales y
 * una fecha sería precisión inventada. No sabe de cosechas, de disponibilidad de
 * maquinaria ni de plata, que son las tres cosas que de verdad mueven un
 * cronograma de predio. No calcula la hidrología transitoria de la obra: la
 * fuente avisa que durante el movimiento de suelo la superficie desnuda escurre
 * distinto y pide medidas temporarias de control de erosión, y acequia lo dice
 * sin ponerle número porque no leyó la tabla de números de curva de construcción.
 * Y no reemplaza la bitácora de la escala de permanencia: la usa.
 *
 * Fuentes: AH-590 (NRCS, 1997), «Layout», «Preparing the foundation»,
 * «Establishing vegetation», «Protecting the pond», «Sealing the pond»;
 * Construction Specification «Earthfill», «Control of Moisture Content»;
 * CPS 412 «Grassed Waterway»; CPS 378 «Pond»; para la ventana de siembra, FAO
 * Soils Bulletin 52 §A.1.1 a través de `balanceHidrico.ts`.
 */
import {
  FRAC_AGOTAMIENTO_FAO56, FRAC_INICIO_FAO52, FUENTE_FAO52, FUENTE_FAO56, MESES_CORTOS,
  type BalanceCiclico,
} from './balanceHidrico';

// ─── 0 · Fuentes ──────────────────────────────────────────────────────────────

export const FUENTE_AH590_ETAPAS =
  'USDA NRCS, Agriculture Handbook 590, «Ponds — Planning, Design, Construction» (1997): «Layout», «Preparing the foundation», «Sealing the pond», «Establishing vegetation» y «Protecting the pond».';
export const FUENTE_CS_HUMEDAD =
  'USDA NRCS, Construction Specification «Earthfill», sección «Control of Moisture Content».';
export const FUENTE_CPS412 =
  'USDA NRCS, Conservation Practice Standard «Grassed Waterway» (Code 412), criterios de establecimiento de la vegetación.';
export const FUENTE_PERMANENCIA =
  'P. A. Yeomans, la escala de permanencia del plan Keyline: ocho factores de lo más permanente a lo más cambiable.';

// ─── 1 · La escala de permanencia ─────────────────────────────────────────────

/** Los ocho factores, en el orden de la escala. 1 es lo más permanente. */
export type Permanencia = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const FACTOR_PERMANENCIA: Record<Permanencia, string> = {
  1: 'Clima',
  2: 'Geografía',
  3: 'Agua',
  4: 'Accesos',
  5: 'Sistemas',
  6: 'Estructuras',
  7: 'Subdivisiones',
  8: 'Suelo',
};

// ─── 2 · La ventana climática ─────────────────────────────────────────────────

/** En qué estado está el suelo para trabajarlo, mes a mes. */
export type EstadoDelMes = 'bloqueado' | 'pide_agua' | 'bueno' | 'sin_dato';

export interface MesDeVentana {
  /** 0 = enero. */
  mesIndex: number;
  nombre:   string;
  estado:   EstadoDelMes;
  porque:   string;
}

export interface Ventana {
  clase:    ClaseDeTrabajo;
  meses:    MesDeVentana[];
  buenos:   number[];
  pidenAgua: number[];
  bloqueados: number[];
  /** Qué hacer con la ventana, en una línea. */
  lectura:  string;
  fuentes:  string[];
}

/**
 * Qué clase de trabajo es una obra, que es lo que decide qué ventana la limita.
 *
 * - `movimiento_de_suelo`: compactar, sellar, excavar. La limita la humedad.
 * - `siembra`: establecer vegetación. La limita el arranque del período de
 *   crecimiento.
 * - `seca`: alambrar, tender caño, montar. No la limita el agua del suelo.
 */
export type ClaseDeTrabajo = 'movimiento_de_suelo' | 'siembra' | 'seca';

export const CLASE_TEXTO: Record<ClaseDeTrabajo, string> = {
  movimiento_de_suelo: 'Movimiento de suelo',
  siembra:             'Siembra y cobertura',
  seca:                'Montaje en seco',
};

/**
 * La ventana de movimiento de suelo, con los tres estados del balance.
 *
 * Devuelve `null` sin balance: un calendario de obra inventado es peor que
 * ninguno, porque se cumple.
 */
export function ventanaDeMovimientoDeSuelo(balance: BalanceCiclico | null | undefined): Ventana | null {
  if (!balance || balance.meses.length !== 12) return null;

  // El piso del agua fácilmente aprovechable: FAO-56 ec. 83 escrita en agua
  // remanente, que es como `balanceHidrico.ts` ya la usa. Por debajo de eso, lo
  // que queda en el suelo no sale solo, y para compactar eso significa mojar.
  const p = balance.p ?? FRAC_AGOTAMIENTO_FAO56;
  const piso = (1 - p) * balance.awc_mm;

  const meses: MesDeVentana[] = balance.meses.map(m => {
    if (m.excedente_mm > 0) {
      return {
        mesIndex: m.mesIndex,
        nombre: MESES_CORTOS[m.mesIndex] ?? String(m.mesIndex + 1),
        estado: 'bloqueado' as const,
        porque: `El suelo pasó capacidad de campo y largó ${Math.round(m.excedente_mm)} mm: el relleno llega más mojado que la humedad óptima, y a eso la especificación le contesta esperar, no corregir.`,
      };
    }
    if (m.almacenaje_mm < piso) {
      return {
        mesIndex: m.mesIndex,
        nombre: MESES_CORTOS[m.mesIndex] ?? String(m.mesIndex + 1),
        estado: 'pide_agua' as const,
        porque: `El mes cierra con ${Math.round(m.almacenaje_mm)} mm almacenados, abajo de los ${Math.round(piso)} mm de agua fácilmente aprovechable: lo que queda no sale solo. Se puede trabajar, pero hay que mojar por aspersión, y eso es un renglón de la lista de materiales.`,
      };
    }
    return {
      mesIndex: m.mesIndex,
      nombre: MESES_CORTOS[m.mesIndex] ?? String(m.mesIndex + 1),
      estado: 'bueno' as const,
      porque: `El suelo cierra con ${Math.round(m.almacenaje_mm)} mm almacenados, sin excedente y arriba de los ${Math.round(piso)} mm del piso: entre los dos extremos.`,
    };
  });

  const buenos     = meses.filter(m => m.estado === 'bueno').map(m => m.mesIndex);
  const pidenAgua  = meses.filter(m => m.estado === 'pide_agua').map(m => m.mesIndex);
  const bloqueados = meses.filter(m => m.estado === 'bloqueado').map(m => m.mesIndex);

  const nombres = (ix: number[]) => ix.map(i => MESES_CORTOS[i] ?? String(i + 1)).join(', ');
  const lectura =
    bloqueados.length === 12
      ? 'Los doce meses cierran con excedente: no hay ventana de movimiento de suelo en el año promedio. El relleno se compacta con material traído o acondicionado, y eso cambia el presupuesto, no el calendario.'
      : buenos.length === 0
        ? `Sin meses entre los dos extremos. Los posibles son ${nombres(pidenAgua)} y todos piden mojar el relleno.`
        : `La ventana son ${nombres(buenos)}.${pidenAgua.length ? ` ${pidenAgua.length === 1 ? 'Se suma' : 'Se suman'} ${nombres(pidenAgua)}, con agua.` : ''}${bloqueados.length ? ` Bloqueados: ${nombres(bloqueados)}.` : ''}`;

  return {
    clase: 'movimiento_de_suelo',
    meses, buenos, pidenAgua, bloqueados,
    lectura,
    fuentes: [FUENTE_CS_HUMEDAD, FUENTE_AH590_ETAPAS, FUENTE_FAO56],
  };
}

/**
 * La ventana de siembra: arranca cuando la lluvia alcanza la mitad de la
 * demanda atmosférica, que es el criterio del boletín 52 de FAO que
 * `balanceHidrico.ts` ya declara (`FRAC_INICIO_FAO52`).
 *
 * Un mes con excedente no queda bloqueado acá: para una semilla, agua de más no
 * es el problema que es para un rodillo.
 */
export function ventanaDeSiembra(balance: BalanceCiclico | null | undefined): Ventana | null {
  if (!balance || balance.meses.length !== 12) return null;
  const meses: MesDeVentana[] = balance.meses.map(m => {
    const umbral = FRAC_INICIO_FAO52 * m.etp_mm;
    if (m.precip_mm >= umbral) {
      return {
        mesIndex: m.mesIndex,
        nombre: MESES_CORTOS[m.mesIndex] ?? String(m.mesIndex + 1),
        estado: 'bueno' as const,
        porque: `Llueven ${Math.round(m.precip_mm)} mm contra ${Math.round(umbral)} mm de umbral (media de la ETP): el período de crecimiento está abierto.`,
      };
    }
    return {
      mesIndex: m.mesIndex,
      nombre: MESES_CORTOS[m.mesIndex] ?? String(m.mesIndex + 1),
      estado: 'pide_agua' as const,
      porque: `Llueven ${Math.round(m.precip_mm)} mm y el umbral son ${Math.round(umbral)} mm: se puede sembrar con riego de implantación, que es lo que la fuente pide cuando la obra termina con el suelo seco.`,
    };
  });
  const buenos    = meses.filter(m => m.estado === 'bueno').map(m => m.mesIndex);
  const pidenAgua = meses.filter(m => m.estado === 'pide_agua').map(m => m.mesIndex);
  const nombres = (ix: number[]) => ix.map(i => MESES_CORTOS[i] ?? String(i + 1)).join(', ');
  return {
    clase: 'siembra',
    meses, buenos, pidenAgua, bloqueados: [],
    lectura: buenos.length === 0
      ? 'Ningún mes del año promedio alcanza el umbral de arranque del período de crecimiento: toda siembra va con riego de implantación.'
      : `Se siembra en ${nombres(buenos)}.${pidenAgua.length ? ' El resto del año, con riego de implantación.' : ''}`,
    fuentes: [FUENTE_FAO52, FUENTE_AH590_ETAPAS],
  };
}

// ─── 3 · Las obras y sus precedencias ─────────────────────────────────────────

export interface Obra {
  id:       string;
  nombre:   string;
  permanencia: Permanencia;
  clase:    ClaseDeTrabajo;
  /** Ids de obras que tienen que estar antes. Las publicadas se agregan solas. */
  requiere?: readonly string[];
  /** Marcas que disparan las precedencias publicadas. */
  rasgos?:  readonly RasgoDeObra[];
}

/**
 * Rasgos que hacen que una obra caiga bajo una regla publicada. Son marcas, no
 * tipos de obra: una misma zanja puede mover tierra y conducir agua.
 */
export type RasgoDeObra =
  | 'replanteo'          // es el replanteo mismo
  | 'mueve_tierra'       // AH-590: va replanteada antes de empezar
  | 'conduce_agua'       // CPS 412: la vegetación antes del agua
  | 'embalsa'            // AH-590: no está terminada sin su protección
  | 'establece_cobertura';// siembra o empaste que no es parte de otra obra

/**
 * Las obras que, por fuente, incluyen su propia cobertura o protección y por lo
 * tanto necesitan las dos ventanas. Ver el punto 3 del encabezado.
 */
export function noTerminaConLaTierra(o: Obra): boolean {
  const r = o.rasgos ?? [];
  return r.includes('conduce_agua') || r.includes('embalsa');
}

export interface Precedencia {
  antes:  string;
  despues: string;
  porque: string;
  fuente: string;
}

/**
 * Las precedencias que salen de las fuentes, no del criterio.
 *
 * Se agregan sobre las que el usuario declaró en `requiere`, y cada una viaja
 * con su motivo y su fuente para que el cronograma se pueda discutir mirando el
 * manual y no la opinión del programa.
 */
export function precedenciasPublicadas(obras: readonly Obra[]): Precedencia[] {
  const tiene = (o: Obra, r: RasgoDeObra) => (o.rasgos ?? []).includes(r);
  const out: Precedencia[] = [];

  const replanteos = obras.filter(o => tiene(o, 'replanteo'));
  const tierra     = obras.filter(o => tiene(o, 'mueve_tierra'));
  const coberturas = obras.filter(o => tiene(o, 'establece_cobertura'));

  for (const r of replanteos) for (const t of tierra) {
    if (r.id === t.id) continue;
    out.push({
      antes: r.id, despues: t.id,
      porque: 'El replanteo va antes de que entre la máquina: «Each job must be adequately and clearly staked before construction is started».',
      fuente: FUENTE_AH590_ETAPAS,
    });
  }

  // La cobertura que NO es parte de otra obra —una pastura, una banquina, un
  // talud de camino— va después del movimiento de suelo que la dejó desnuda:
  // «Prepare a seedbed as soon after construction as practicable». La cobertura
  // que sí es parte de la obra no genera precedencia entre obras: genera la
  // ventana compuesta de esa obra. Ver `noTerminaConLaTierra`.
  for (const t of tierra) for (const c of coberturas) {
    if (t.id === c.id) continue;
    out.push({
      antes: t.id, despues: c.id,
      porque: 'La cama de siembra se prepara «as soon after construction as practicable»: la siembra sigue al movimiento de suelo, no espera la temporada que viene.',
      fuente: FUENTE_AH590_ETAPAS,
    });
  }

  return out;
}

// ─── 3 bis · La ventana compuesta ─────────────────────────────────────────────

export interface VentanaCompuesta {
  tierra:  Ventana;
  siembra: Ventana;
  /**
   * Meses en que la obra se puede **cerrar**: se puede mover la tierra, y ese
   * mes o el siguiente sirve para que la cobertura prenda sin riego.
   */
  cierran: number[];
  lectura: string;
  fuentes: string[];
}

/**
 * La ventana de una obra que incluye su propia cobertura o protección.
 *
 * No es la ventana de movimiento de suelo ni la de siembra: es la intersección,
 * corrida un mes, porque la cobertura va «as soon after construction as
 * practicable» y no la temporada que viene. Ver el punto 4 del encabezado.
 */
export function ventanaCompuesta(balance: BalanceCiclico | null | undefined): VentanaCompuesta | null {
  const t = ventanaDeMovimientoDeSuelo(balance);
  const s = ventanaDeSiembra(balance);
  if (!t || !s) return null;

  const siembraBuena = new Set(s.buenos);
  const cierran: number[] = [];
  for (const m of t.meses) {
    if (m.estado === 'bloqueado') continue;
    if (siembraBuena.has(m.mesIndex) || siembraBuena.has((m.mesIndex + 1) % 12)) cierran.push(m.mesIndex);
  }

  const nombres = (ix: readonly number[]) => ix.map(i => MESES_CORTOS[i] ?? String(i + 1)).join(', ');
  const lectura = cierran.length === 0
    ? 'Las dos ventanas no se tocan: en este clima no hay mes en que se pueda compactar la tierra y además prenda la cobertura enseguida. No es un error del cronograma, es el clima, y la norma ya trae la salida: mulch, cultivo niñera, piedra o desviar el escurrimiento hasta que la cobertura esté establecida. Eso entra en la lista de materiales.'
    : cierran.length === t.meses.filter(m => m.estado !== 'bloqueado').length
      ? `La obra se puede cerrar en cualquiera de sus meses de movimiento de suelo (${nombres(cierran)}): la cobertura prende enseguida.`
      : `De los meses en que se puede mover tierra, la obra se puede CERRAR en ${nombres(cierran)}: son los que dejan la cobertura prendiendo sin riego. En los otros hay que proteger el cauce hasta la próxima lluvia.`;

  return { tierra: t, siembra: s, cierran, lectura, fuentes: [FUENTE_CPS412, FUENTE_AH590_ETAPAS, FUENTE_CS_HUMEDAD, FUENTE_FAO52] };
}

// ─── 4 · El ordenamiento ──────────────────────────────────────────────────────

export interface Etapa {
  numero:  number;
  obras:   Obra[];
  /** La clase que manda en la etapa: la más restrictiva de sus obras. */
  clase:   ClaseDeTrabajo;
  ventana: Ventana | null;
  /**
   * Presente cuando la etapa tiene al menos una obra que no termina con la
   * tierra: ahí la ventana que manda es la compuesta y no la de la clase.
   */
  compuesta: VentanaCompuesta | null;
  /** Obras de la etapa que incluyen su cobertura, con nombre. */
  conCobertura: string[];
  /** Por qué estas obras y no otras en esta etapa. */
  porque:  string;
  advertencias: string[];
}

export interface PlanPorEtapas {
  etapas:  Etapa[];
  precedencias: Precedencia[];
  /** Obras que no se pudieron ordenar porque sus dependencias forman un ciclo. */
  enCiclo: Obra[];
  fuentes: string[];
  advertencias: string[];
}

/**
 * Ordena las obras en etapas.
 *
 * Una etapa es un nivel del grafo de precedencias: todas las obras cuyas
 * dependencias ya quedaron en etapas anteriores. Dentro de una etapa el orden es
 * el de la escala de permanencia, que es la respuesta publicada a «qué se decide
 * primero» y por lo tanto a «qué se hace primero» cuando nada más lo obliga.
 *
 * Un ciclo de dependencias no se rompe por lo bajo: las obras involucradas salen
 * aparte, en `enCiclo`, con el aviso. Romperlo eligiendo una al azar produciría
 * un cronograma que se puede imprimir y no se puede ejecutar.
 *
 * Devuelve `null` sin obras.
 */
export function ordenarEtapas(
  obras: readonly Obra[],
  balance?: BalanceCiclico | null,
): PlanPorEtapas | null {
  if (obras.length === 0) return null;

  const porId = new Map(obras.map(o => [o.id, o]));
  const precedencias = precedenciasPublicadas(obras);

  // Dependencias: las declaradas más las publicadas, sin ids fantasma.
  const deps = new Map<string, Set<string>>();
  for (const o of obras) {
    const s = new Set<string>();
    for (const r of o.requiere ?? []) if (porId.has(r) && r !== o.id) s.add(r);
    deps.set(o.id, s);
  }
  for (const p of precedencias) {
    if (!porId.has(p.antes) || !porId.has(p.despues)) continue;
    deps.get(p.despues)!.add(p.antes);
  }

  const ventanaTierra  = ventanaDeMovimientoDeSuelo(balance);
  const ventanaSiembra = ventanaDeSiembra(balance);
  const compuesta      = ventanaCompuesta(balance);

  // La clase más restrictiva de una etapa: el movimiento de suelo manda sobre la
  // siembra, y la siembra sobre el montaje en seco. Si en una etapa hay que
  // compactar, el mes de la etapa es el que la compactación permite.
  const RANGO: Record<ClaseDeTrabajo, number> = { movimiento_de_suelo: 2, siembra: 1, seca: 0 };

  const etapas: Etapa[] = [];
  const hechas = new Set<string>();
  let pendientes = [...obras];
  let numero = 1;

  while (pendientes.length > 0) {
    const listas = pendientes.filter(o => [...deps.get(o.id)!].every(d => hechas.has(d)));
    if (listas.length === 0) break;   // ciclo

    listas.sort((a, b) => a.permanencia - b.permanencia || a.nombre.localeCompare(b.nombre, 'es'));

    const clase = listas.reduce<ClaseDeTrabajo>(
      (peor, o) => (RANGO[o.clase] > RANGO[peor] ? o.clase : peor), 'seca');
    const ventana = clase === 'movimiento_de_suelo' ? ventanaTierra
                  : clase === 'siembra'             ? ventanaSiembra
                  : null;

    const conCobertura = listas.filter(noTerminaConLaTierra);
    const advertencias: string[] = [];

    if (conCobertura.length > 0) {
      advertencias.push(
        `${conCobertura.length === 1 ? 'Esta obra incluye' : 'Estas obras incluyen'} su propia cobertura o protección y no está${conCobertura.length === 1 ? '' : 'n'} terminada${conCobertura.length === 1 ? '' : 's'} sin ella: ${conCobertura.map(o => o.nombre).join('; ')}. Por eso la ventana que manda acá no es la de mover tierra: es la compuesta.`,
      );
      if (compuesta && compuesta.cierran.length === 0) {
        advertencias.push(compuesta.lectura);
      }
    }

    if (clase === 'movimiento_de_suelo') {
      advertencias.push(
        'Mientras esta etapa dura, la superficie queda desnuda y escurre distinto de como va a escurrir la obra terminada. La fuente pide medidas temporarias de control de erosión y sedimentación durante la construcción; acequia no les pone número porque el escurrimiento de una superficie en obra se calcula con otra tabla.',
      );
      if (ventana && ventana.bloqueados.length > 0) {
        advertencias.push(
          `Hay ${ventana.bloqueados.length} ${ventana.bloqueados.length === 1 ? 'mes' : 'meses'} bloqueados en el año promedio. Un mes bloqueado no se compensa trabajando más: se espera, y si la etapa no entra en la ventana, se parte.`,
        );
      }
      if (!ventana) {
        advertencias.push('Sin balance hídrico del predio no hay ventana: falta correr el panel de clima y el de suelo.');
      }
    }

    const grupos = [...new Set(listas.map(o => FACTOR_PERMANENCIA[o.permanencia]))];
    etapas.push({
      numero,
      obras: listas,
      clase,
      ventana,
      compuesta: conCobertura.length > 0 ? compuesta : null,
      conCobertura: conCobertura.map(o => o.nombre),
      porque: numero === 1
        ? `Arranca con ${grupos.join(' y ').toLowerCase()}: no dependen de nada y son lo más permanente de la lista.`
        : `Entran cuando lo de la etapa ${numero - 1} está hecho. Orden interno por la escala de permanencia: ${grupos.join(' → ').toLowerCase()}.`,
      advertencias,
    });

    for (const o of listas) hechas.add(o.id);
    pendientes = pendientes.filter(o => !hechas.has(o.id));
    numero++;
  }

  const advertencias: string[] = [];
  if (pendientes.length > 0) {
    advertencias.push(
      `${pendientes.length} ${pendientes.length === 1 ? 'obra quedó' : 'obras quedaron'} fuera del orden porque sus dependencias forman un ciclo: ${pendientes.map(o => o.nombre).join(', ')}. Hay que cortar una dependencia a mano; elegirla al azar daría un cronograma imprimible e inejecutable.`,
    );
  }
  if (!balance) {
    advertencias.push('Sin balance hídrico el plan trae el orden y no los meses: el orden sale de las precedencias publicadas, los meses salen del clima del predio.');
  }

  return {
    etapas,
    precedencias,
    enCiclo: pendientes,
    fuentes: [FUENTE_AH590_ETAPAS, FUENTE_CS_HUMEDAD, FUENTE_CPS412, FUENTE_PERMANENCIA, FUENTE_FAO52],
    advertencias,
  };
}

// ─── 5 · Las obras que un proyecto de acequia tiene ───────────────────────────

/**
 * Traduce lo que el proyecto tiene a obras con su permanencia, su clase y sus
 * rasgos.
 *
 * Es la única parte del módulo con criterio de acequia y no de una fuente: qué
 * factor de la escala le toca a cada obra. El criterio es el enunciado de la
 * escala —el agua antes que los accesos, los accesos antes que los sistemas, las
 * estructuras antes que las subdivisiones— y está acá, en un solo lugar, para
 * que se pueda discutir.
 */
export interface QueHayEnElProyecto {
  represa?:   boolean;
  swales?:    boolean;
  keyline?:   boolean;
  caminos?:   boolean;
  redAgua?:   boolean;
  riego?:     boolean;
  estructuras?: boolean;
  cierrePerimetral?: boolean;
  potreros?:  boolean;
  cortinas?:  boolean;
  pasturas?:  boolean;
}

export function obrasDelProyecto(hay: QueHayEnElProyecto): Obra[] {
  const out: Obra[] = [];
  const mueveTierra = hay.represa || hay.swales || hay.keyline || hay.caminos;

  if (mueveTierra) {
    out.push({
      id: 'replanteo', nombre: 'Replanteo de las obras de tierra',
      permanencia: 2, clase: 'seca', rasgos: ['replanteo'],
    });
  }
  if (hay.represa) {
    // Una sola obra y no dos: la protección no es una etapa posterior, es parte
    // de la represa. «Construction of the pond is not complete until you have
    // provided protection against erosion, wave action, trampling by
    // livestock». El cierre del muro y la cubierta del talud van acá adentro.
    out.push({
      id: 'represa',
      nombre: 'Represa: destape, zanja de anclaje, terraplén, vertedero y su protección (cierre, cubierta del talud, escollera)',
      permanencia: 3, clase: 'movimiento_de_suelo', requiere: ['replanteo'],
      rasgos: ['mueve_tierra', 'embalsa'],
    });
  }
  if (hay.swales) {
    out.push({
      id: 'swales', nombre: 'Swales: excavación, camellón y empaste del cauce',
      permanencia: 3, clase: 'movimiento_de_suelo', requiere: ['replanteo'],
      rasgos: ['mueve_tierra', 'conduce_agua'],
    });
  }
  if (hay.keyline) {
    out.push({
      id: 'keyline', nombre: 'Patrón keyline: trazado y laboreo',
      permanencia: 3, clase: 'movimiento_de_suelo', requiere: ['replanteo'],
      rasgos: ['mueve_tierra'],
    });
  }
  if (hay.caminos) {
    out.push({
      id: 'caminos', nombre: 'Caminos y alcantarillas',
      permanencia: 4, clase: 'movimiento_de_suelo', requiere: ['replanteo'],
      rasgos: ['mueve_tierra', 'conduce_agua'],
    });
  }
  if (hay.pasturas || hay.swales || hay.caminos) {
    out.push({
      id: 'cobertura', nombre: 'Cobertura vegetal de taludes, cauces y banquinas',
      permanencia: 8, clase: 'siembra',
      rasgos: ['establece_cobertura'],
    });
  }
  if (hay.redAgua) {
    out.push({
      id: 'red_agua', nombre: 'Red de agua por tubería',
      permanencia: 3, clase: 'seca',
      requiere: [...(hay.represa ? ['represa'] : []), ...(hay.caminos ? ['caminos'] : [])],
    });
  }
  if (hay.riego) {
    out.push({
      id: 'riego', nombre: 'Riego por sector',
      permanencia: 5, clase: 'seca', requiere: hay.redAgua ? ['red_agua'] : [],
    });
  }
  if (hay.cortinas) {
    out.push({
      id: 'cortinas', nombre: 'Cortinas y montes de abrigo',
      permanencia: 5, clase: 'siembra', requiere: hay.caminos ? ['caminos'] : [],
      rasgos: ['establece_cobertura'],
    });
  }
  if (hay.estructuras) {
    out.push({
      id: 'estructuras', nombre: 'Estructuras: vivienda, galpón y servicios',
      permanencia: 6, clase: 'seca',
      requiere: [...(hay.caminos ? ['caminos'] : []), ...(hay.redAgua ? ['red_agua'] : [])],
    });
  }
  if (hay.cierrePerimetral) {
    out.push({
      id: 'cierre', nombre: 'Cierre perimetral',
      permanencia: 7, clase: 'seca',
    });
  }
  if (hay.potreros) {
    out.push({
      id: 'potreros', nombre: 'Subdivisión en potreros y bebederos',
      permanencia: 7, clase: 'seca',
      requiere: [...(hay.cierrePerimetral ? ['cierre'] : []), ...(hay.redAgua ? ['red_agua'] : [])],
    });
  }
  return out;
}
