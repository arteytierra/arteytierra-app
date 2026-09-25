import type { Ubicacion } from './entorno';
import { REGISTRO_AR } from './pueblosOriginariosAr';
import { CENSO_AR } from './censoIndigena2022Ar';
import { CENSO_CL, CENSO_CL_PAIS, type CensoClComuna, type CensoClRegion } from './censoIndigena2024Cl';
import {
  CENSO_PY, CENSO_PY_PAIS, PUEBLOS_PY,
  type CensoPyDepartamento, type CensoPyDistrito, type CensoPyLocalidad, type CensoPyPueblo,
} from './censoIndigena2022Py';
import {
  CENSO_PE, CENSO_PE_PAIS, LENGUAS_PE, LENGUAS_ORIGINARIAS_PE, type CensoPeDepartamento,
} from './censoIndigena2017Pe';
import {
  CENSO_BR, CENSO_BR_PAIS, type CensoBrEstado, type CensoBrMunicipio,
} from './censoIndigena2022Br';

/**
 * Pueblos originarios en el territorio del predio. Argentina, Chile, Paraguay,
 * Perú y Brasil.
 *
 * Cada país entra con las fuentes que tiene y con una licencia que las
 * permita, y no con un promedio de los cuatro. La Argentina tiene registro y
 * censo. Los otros tres entran con el censo solo, y en cada uno el registro
 * falta por un motivo distinto: el de CONADI tiene una copia abierta que no
 * declara licencia, el del INDI directamente no está publicado, y el del
 * Ministerio de Cultura del Perú se baja entero y tampoco dice qué se puede
 * hacer con él. Lo que no está se dice en la pantalla: el relevamiento país por
 * país vive en `_research/pueblos-originarios-paises/`. Los bloques chileno,
 * paraguayo y peruano están más abajo.
 *
 * **Los cuatro no se suman ni se comparan entre sí.** Cada censo tiene su
 * pregunta, su universo y su lista de pueblos —abierta en la Argentina, cerrada
 * en Chile, cerrada y en un operativo aparte en Paraguay, y en el Perú ni
 * siquiera hay lista de pueblos sino dos grandes grupos—, así que los
 * porcentajes de un país no se leen contra los del otro. Cada bloque explica el
 * suyo.
 *
 * ── Dos fuentes que no dicen lo mismo, y está bien ──────────────────────────
 *
 * El **registro del INAI** cuenta comunidades con trámite ante el Estado. El
 * **Censo 2022** cuenta personas que se reconocen indígenas o descendientes,
 * donde viven. No hay que elegir una: se muestran las dos y se dice qué mide
 * cada una, porque donde discrepan está lo interesante. En la Ciudad de Buenos
 * Aires el registro no tiene ninguna comunidad inscripta y el censo cuenta
 * 74.724 personas. Ninguno de los dos números está mal; miden cosas distintas.
 *
 * Por eso tampoco se cruzan los nombres de pueblo entre una lista y la otra:
 * el censo escribe «Qom/Toba» donde el INAI escribe «Qom (Toba)», y emparejar
 * las grafías daría a entender que una fuente confirma a la otra.
 *
 * ── Qué pregunta contesta el registro, que no es la que parece ──────────────
 *
 * No contesta «qué pueblos habitaron esta zona». Eso sería historia, y a la
 * escala de un predio la historia no se resuelve con un registro: se resuelve
 * con arqueología y con bibliografía, y eso ya vive en otra capa
 * —`practicasHistoricas.ts`, que fecha la obra y no la identidad—.
 *
 * Lo que contesta es una pregunta administrativa y verificable: **qué pueblos
 * tienen hoy comunidades inscriptas o relevadas por el Estado en esta
 * provincia y en este departamento**. Es un dato del presente, sale de un
 * registro público, y es el que le sirve a alguien que va a intervenir un
 * campo: si hay comunidades relevadas al lado, hay territorio en discusión,
 * hay interlocutores y hay una ley que los ampara.
 *
 * ── La fuente ───────────────────────────────────────────────────────────────
 *
 * INAI — «Listado de comunidades indígenas», distribución del 23/02/2024,
 * publicada en el portal de datos abiertos del Ministerio de Justicia
 * (datos.jus.gob.ar) con licencia CC BY 4.0. Junta dos registros: el
 * Re.Na.C.I., que inscribe la personería jurídica, y el Re.Te.C.I., que es el
 * relevamiento territorial de la **Ley 26.160**.
 *
 * La tabla la genera `_research/pueblos-originarios-argentina/build-pueblos-argentina.mjs`
 * y el CSV queda congelado al lado del script. Es una foto, no un servicio: el
 * registro se mueve, y la fecha de la foto se muestra siempre.
 *
 * ── El límite del dato, que es lo más importante de este archivo ────────────
 *
 * **Que un departamento no figure no significa que no haya pueblos
 * originarios.** Significa que no hay comunidades *registradas*, y el registro
 * depende de que una comunidad haya iniciado y sostenido un trámite ante el
 * Estado. Su ausencia habla del trámite, no de la gente. Es el mismo criterio
 * que rige `contextoActual.ts` con OpenStreetMap —vacío es «no mapeado», nunca
 * «no hay»— y acá importa todavía más, porque el vacío es sobre personas.
 *
 * Por eso ninguna rama de `registroDelPunto` devuelve «no hay»: devuelve qué
 * dice el registro, o por qué no pudo decirlo.
 *
 * ── Por qué provincia y departamento, y no un radio en kilómetros ──────────
 *
 * Porque 858 de las 1.878 comunidades del listado no tienen coordenada. Una
 * respuesta por distancia dejaría afuera al 46% del registro sin avisar, que es
 * exactamente la falla que describe `lib/README.md`: no se estrella, imprime un
 * número plausible y equivocado. Provincia y departamento están en las 1.878
 * filas.
 *
 * ── Los nombres ─────────────────────────────────────────────────────────────
 *
 * Los pueblos se escriben como los escribe el registro, incluidas sus
 * variantes. El script de armado corrige tildes y mayúsculas y nada más: no
 * unifica denominaciones ni traduce exónimos. Que una app decida cómo se llama
 * un pueblo es peor que mostrar dos grafías.
 */

/** Un pueblo en una jurisdicción, tal como lo escribe el registro del INAI. */
export interface PuebloRegistrado {
  pueblo: string;
  /**
   * Comunidades registradas **en las que el registro anota a este pueblo**, y
   * no comunidades de este pueblo. La diferencia no es cosmética: hay
   * comunidades que el INAI anota con más de un pueblo («Wichí - Guaraní»), así
   * que la suma de esta columna puede pasar el total de comunidades de la
   * jurisdicción. Nunca se muestra como un total.
   */
  comunidades: number;
}

export interface RegistroDepartamento {
  departamento: string;
  comunidades: number;
  pueblos: PuebloRegistrado[];
}

/** Estado del relevamiento territorial de la Ley 26.160, comunidad por comunidad. */
export interface RelevamientoLey26160 {
  culminado: number;
  iniciado: number;
  en_tramite: number;
  sin_relevar: number;
  /** El registro no consigna estado. Cuatro filas en todo el país. */
  sin_dato: number;
}

export interface RegistroProvincia {
  provincia: string;
  comunidades: number;
  /** Comunidades con personería jurídica inscripta (nacional o provincial). */
  conPersoneria: number;
  relevamiento: RelevamientoLey26160;
  pueblos: PuebloRegistrado[];
  departamentos: RegistroDepartamento[];
}

/**
 * Qué se puede decir del punto. Es una unión y no un objeto con campos
 * opcionales a propósito: cada rama obliga al panel a escribir una frase
 * distinta, y ninguna de las frases es «acá no hay pueblos originarios».
 */
export type RegistroDelPunto =
  /** Todavía no sabemos dónde está el predio. */
  | { estado: 'sin_ubicacion' }
  /** Fuera de Argentina: esta capa todavía no releva otros países. */
  | { estado: 'fuera_de_argentina'; pais: string }
  /** Argentina, pero el nombre de la provincia no es ninguno de los 24. */
  | { estado: 'jurisdiccion_desconocida'; provincia: string }
  /** Jurisdicción argentina reconocida y sin comunidades en el registro. */
  | { estado: 'sin_comunidades'; jurisdiccion: string }
  /**
   * Hay registro. `departamento` en `null` significa que el departamento que
   * devolvió el geocodificador no se pudo casar con ninguno del registro: se
   * muestra la provincia y se dice que la precisión es provincial. No se
   * adivina un departamento parecido.
   */
  | {
      estado: 'con_registro';
      provincia: RegistroProvincia;
      departamento: RegistroDepartamento | null;
    };

// ── Censo 2022: personas, no comunidades ────────────────────────────────────

/**
 * Personas que declararon pertenecer o descender de este pueblo, en esta
 * jurisdicción. No es el padrón del pueblo: un tercio de quienes se reconocen
 * indígenas no declaró a cuál, y esa cifra viaja al lado en `sinInformacion`.
 */
export interface CensoPueblo {
  pueblo: string;
  personas: number;
}

export interface CensoDepartamento {
  departamento: string;
  /** En viviendas particulares, que es el universo del censo para esta pregunta. */
  poblacion: number;
  indigena: number;
}

export interface CensoProvincia {
  provincia: string;
  poblacion: number;
  indigena: number;
  /** Se reconocen indígenas y no declararon pueblo. */
  sinInformacion: number;
  pueblos: CensoPueblo[];
  departamentos: CensoDepartamento[];
}

/**
 * Qué dice el censo del punto. Mismas tres formas de no saber que el registro
 * —para que el panel escriba la misma frase honesta— y una sola de saber: las
 * 24 jurisdicciones tienen dato, así que acá no existe el «no hay».
 */
export type CensoDelPunto =
  | { estado: 'sin_ubicacion' }
  | { estado: 'fuera_de_argentina'; pais: string }
  | { estado: 'jurisdiccion_desconocida'; provincia: string }
  | {
      estado: 'con_censo';
      provincia: CensoProvincia;
      /** `null` si el departamento del geocodificador no casó con ninguno. */
      departamento: CensoDepartamento | null;
    };

/** Fecha de la foto del registro. Se muestra siempre que se muestre un número. */
export const FECHA_REGISTRO_AR = '23 de febrero de 2024';

export const FUENTE_REGISTRO_AR = {
  label: 'INAI — Listado de comunidades indígenas (Re.Na.C.I. y Re.Te.C.I.), 23/02/2024',
  url: 'https://datos.jus.gob.ar/dataset/listado-de-comunidades-indigenas',
  licencia: 'CC BY 4.0',
} as const;

export const MAPA_INAI = {
  label: 'INAI — Mapa de pueblos originarios',
  url: 'https://www.argentina.gob.ar/derechoshumanos/inai/mapa',
} as const;

export const FUENTE_CENSO_2022 = {
  label: 'INDEC — Censo Nacional de Población, Hogares y Viviendas 2022, resultados definitivos',
  url: 'https://www.indec.gob.ar/ftp/cuadros/poblacion/censo2022_poblacion_indigena.pdf',
} as const;

/**
 * Las 24 jurisdicciones, en el nombre con que las escribe Nominatim.
 *
 * Es una lista cerrada y está acá para que un nombre que no reconocemos no se
 * lea como «no hay comunidades». Si el geocodificador cambia un rótulo, la
 * respuesta es `jurisdiccion_desconocida` —que el panel admite no saber— y no
 * un vacío que el usuario leería como un dato.
 *
 * Salen de la tabla del censo, que es la que tiene las 24: el registro del INAI
 * tiene 23 porque la Ciudad Autónoma de Buenos Aires no tiene comunidades
 * inscriptas, y esa ausencia se contesta con su propia frase y no con un vacío.
 */
const JURISDICCIONES_AR = CENSO_AR.map(p => p.provincia);

const PAISES_AR = new Set(['argentina', 'argentine republic', 'república argentina']);

/**
 * Deja un nombre administrativo comparable: sin tildes, sin puntuación, sin el
 * sustantivo del tipo de división y sin las abreviaturas con que el registro
 * escribe seis departamentos.
 *
 * Nominatim devuelve «Departamento Iruya», «Partido de Tandil» o «Rivadavia»
 * pelado para el mismo campo, y el INAI escribe «Grl. José de San Martín»
 * donde Nominatim pone «General San Martín». Todo eso se resuelve acá.
 */
export function normalizarNombreAdmin(s: string): string {
  const base = s
    .normalize('NFD')
    // Le saca los diacríticos que dejó NFD, así los dos lados terminan en la
    // misma cadena aunque uno venga con tilde y el otro no.
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ');

  const ABREVIATURAS: Record<string, string> = {
    grl: 'general',
    gral: 'general',
    gob: 'gobernador',
    dr: 'doctor',
    pdte: 'presidente',
    pte: 'presidente',
    cnel: 'coronel',
    cmte: 'comandante',
    alte: 'almirante',
    tte: 'teniente',
    ing: 'ingeniero',
  };
  // Palabras que nombran la división y no el lugar: si quedan, «Iruya» nunca
  // casaría con «Departamento Iruya».
  const RUIDO = new Set([
    'departamento', 'depto', 'dpto', 'partido', 'comuna', 'municipio',
    'provincia', 'pedania', 'distrito', 'de', 'del', 'la', 'las', 'el', 'los',
    // Chile: Nominatim escribe «Región de la Araucanía» y el INE «La
    // Araucanía»; sin esto no casaba ninguna de las dieciséis.
    'region',
  ]);

  return base
    .split(/\s+/)
    .map(w => ABREVIATURAS[w] ?? w)
    // Iniciales sueltas: «Juan F. Ibarra» en el registro es «Juan Felipe
    // Ibarra» en el geocodificador. Se van las dos veces y el resto casa.
    // Los números de una cifra se quedan: sacarlos dejaba a «Comuna 7» en la
    // cadena vacía, y las quince comunas de la Ciudad de Buenos Aires no
    // casaban con nada.
    .filter(w => w.length > 1 || /\d/.test(w))
    .filter(w => !RUIDO.has(w))
    .join(' ')
    .trim();
}

function tokens(s: string): Set<string> {
  return new Set(normalizarNombreAdmin(s).split(' ').filter(Boolean));
}

function subconjunto(a: Set<string>, b: Set<string>): boolean {
  if (a.size === 0) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

/**
 * Busca un nombre administrativo entre candidatos.
 *
 * Tres pasos, y el tercero es no contestar. Primero el nombre normalizado
 * exacto. Si no, se acepta que uno sea subconjunto de palabras del otro —así
 * «General San Martín» encuentra a «Grl. José de San Martín»— pero **sólo si
 * el candidato es único**: «Rosario» es subconjunto de «Rosario de Lerma» y de
 * «Rosario de la Frontera» a la vez, y entre las dos no se elige, se devuelve
 * `null`. Un departamento equivocado es peor que ninguno.
 */
export function casarNombre<T>(buscado: string, candidatos: T[], nombreDe: (t: T) => string): T | null {
  const objetivo = normalizarNombreAdmin(buscado);
  if (!objetivo) return null;

  const exactos = candidatos.filter(c => normalizarNombreAdmin(nombreDe(c)) === objetivo);
  if (exactos.length === 1) return exactos[0] ?? null;
  if (exactos.length > 1) return null;

  const tb = tokens(buscado);
  const parciales = candidatos.filter(c => {
    const tc = tokens(nombreDe(c));
    return subconjunto(tb, tc) || subconjunto(tc, tb);
  });
  return parciales.length === 1 ? parciales[0] ?? null : null;
}

/**
 * Cuántos de cada cien. Una décima y no más: el censo publica enteros y el
 * denominador es de cientos de miles, así que el segundo decimal sería ruido.
 */
export function porcentaje(parte: number, total: number): string {
  if (!total) return '—';
  return (parte / total * 100).toFixed(1).replace('.', ',');
}

/**
 * Parte la lista de pueblos en los que se muestran y una cola resumida.
 *
 * La cola existe porque el censo tiene cola larga: en Salta hay pueblos con
 * una sola persona, y quince fichitas de «· 1» tapan a los cuatro pueblos que
 * explican el 90% del total. No se esconde: se dice cuántos pueblos quedaron
 * afuera y cuánta gente suman entre todos, que es lo que hace falta para saber
 * que no había nada grande escondido ahí.
 */
export function pueblosDestacados(pueblos: CensoPueblo[], cuantos = 12): {
  visibles: CensoPueblo[];
  resto: { pueblos: number; personas: number };
} {
  const visibles = pueblos.slice(0, cuantos);
  const cola = pueblos.slice(cuantos);
  return {
    visibles,
    resto: { pueblos: cola.length, personas: cola.reduce((s, p) => s + p.personas, 0) },
  };
}

/**
 * En qué jurisdicción argentina cae el punto, o por qué no se puede decir.
 *
 * Es la parte que comparten las dos capas: lo que cambia entre el registro y el
 * censo es la tabla que se consulta después, no cómo se ubica el predio. Las
 * tres maneras de no saber son las mismas y tienen que sonar igual en la
 * pantalla, porque son la misma ignorancia.
 */
type JurisdiccionDelPunto =
  | { estado: 'sin_ubicacion' }
  | { estado: 'fuera_de_argentina'; pais: string }
  | { estado: 'jurisdiccion_desconocida'; provincia: string }
  | { estado: 'ok'; jurisdiccion: string };

function jurisdiccionDelPunto(u: Ubicacion | null): JurisdiccionDelPunto {
  if (!u || !u.pais) return { estado: 'sin_ubicacion' };
  if (!PAISES_AR.has(u.pais.trim().toLowerCase())) {
    return { estado: 'fuera_de_argentina', pais: u.pais };
  }
  if (!u.provincia) return { estado: 'sin_ubicacion' };

  const jurisdiccion = casarNombre(u.provincia, JURISDICCIONES_AR, x => x);
  if (!jurisdiccion) return { estado: 'jurisdiccion_desconocida', provincia: u.provincia };
  return { estado: 'ok', jurisdiccion };
}

/**
 * Qué dice el registro sobre el lugar donde está el predio.
 *
 * Función pura: recibe la ubicación administrativa que ya resolvió
 * `/api/entorno` con Nominatim y no consulta nada. El registro viaja en el
 * bundle porque es una foto de 1.878 filas agregadas, no un servicio.
 */
export function registroDelPunto(u: Ubicacion | null): RegistroDelPunto {
  const j = jurisdiccionDelPunto(u);
  if (j.estado !== 'ok') return j;

  const provincia = REGISTRO_AR.find(p => p.provincia === j.jurisdiccion);
  if (!provincia) return { estado: 'sin_comunidades', jurisdiccion: j.jurisdiccion };

  const departamento = u?.departamento
    ? casarNombre(u.departamento, provincia.departamentos, d => d.departamento)
    : null;

  return { estado: 'con_registro', provincia, departamento };
}

/**
 * Cuánta gente se reconoce indígena o descendiente donde está el predio, según
 * el Censo 2022.
 *
 * Es la misma resolución geográfica que `registroDelPunto` —la comparten— con
 * otra tabla adentro. Las dos capas pueden contestar distinto sobre el
 * departamento y eso no es un error: el INAI y el INDEC no escriben todos los
 * departamentos igual, y cada una dice hasta dónde llegó.
 */
export function censoDelPunto(u: Ubicacion | null): CensoDelPunto {
  const j = jurisdiccionDelPunto(u);
  if (j.estado !== 'ok') return j;

  const provincia = CENSO_AR.find(p => p.provincia === j.jurisdiccion);
  // No puede pasar: la lista de jurisdicciones sale de esta misma tabla. Si
  // alguna vez pasa, la respuesta es «no sé» y nunca «cero personas».
  if (!provincia) return { estado: 'jurisdiccion_desconocida', provincia: j.jurisdiccion };

  const departamento = u?.departamento
    ? casarNombre(u.departamento, provincia.departamentos, d => d.departamento)
    : null;

  return { estado: 'con_censo', provincia, departamento };
}

// ── Chile: el Censo 2024, y una sola fuente ─────────────────────────────────

/**
 * Chile tiene las mismas dos fuentes que la Argentina, y acá hay una sola.
 *
 * El censo está: el INE publica la tabla de pueblos indígenas u originarios
 * por región y por comuna, con licencia CC BY-SA 4.0 de sus datos abiertos,
 * que permite uso comercial con atribución y obliga a que las adaptaciones
 * lleven la misma licencia.
 *
 * **El registro no.** El equivalente del INAI es el Registro Nacional de
 * Agrupaciones Indígenas de CONADI, y su sistema de consulta pide RUN y
 * contraseña. La única copia pública que se encontró es una capa derivada que
 * publica la Superintendencia del Medio Ambiente en un servicio ArcGIS —4.311
 * comunidades vigentes, todas con coordenada— que **no declara ninguna
 * licencia de reutilización**. Con eso no se escribe código: acequia cobra, y
 * una fuente sin licencia declarada no es una fuente disponible. Además mezcla
 * años de georreferenciación y repite claves de registro, así que tampoco
 * estaría lista.
 *
 * Por eso el panel dice que falta el registro, en vez de mostrar el censo solo
 * como si fuera todo lo que hay. El relevamiento completo está en
 * `_research/pueblos-originarios-paises/chile.json`.
 *
 * ── Los números, y el denominador ──────────────────────────────────────────
 *
 * El INE publica 11,5% dividiendo por las 18.370.540 personas que
 * respondieron la pregunta. Acá se divide por las 18.480.432 censadas, que es
 * el único denominador publicado por comuna, y entonces el país da 11,4%. Es
 * el mismo criterio en los cuatro niveles, así que comuna, provincia, región y
 * país se pueden comparar entre sí. `CENSO_CL_PAIS.porcentajeIne` guarda la
 * cifra oficial para poder citarla como la publica el INE.
 *
 * ── Las dos listas de pueblos no se comparan ───────────────────────────────
 *
 * La chilena es **cerrada**: once alternativas para marcar, las de la ley
 * 19.253 y sus modificaciones. La argentina es **abierta**: 58 rótulos que
 * escribió quien respondía. Por eso «Quechua» no es el mismo dato en las dos
 * —en Chile es una casilla y en la Argentina una respuesta—, y por eso en
 * Chile sólo 2.395 personas quedaron sin declarar pueblo contra 431.703 en la
 * Argentina: con lista cerrada casi nadie deja el casillero vacío. Lo que en
 * Chile queda afuera de la lista son las 20.631 personas de «Otro».
 */

/** Una provincia chilena, sumada de sus comunas. El INE no la publica sola. */
export interface CensoClProvincia {
  provincia: string;
  poblacion: number;
  indigena: number;
  comunas: number;
}

/**
 * Qué dice el censo chileno del punto. Tres formas de no saber, iguales a las
 * de la Argentina, y una de saber con tres niveles de precisión: la comuna si
 * se pudo fijar, la provincia si no, y la región siempre.
 */
export type CensoClDelPunto =
  | { estado: 'sin_ubicacion' }
  | { estado: 'fuera_de_chile'; pais: string }
  | { estado: 'region_desconocida'; region: string }
  | {
      estado: 'con_censo';
      region: CensoClRegion;
      /** `null` si no se pudo fijar ni la comuna ni la provincia. */
      provincia: CensoClProvincia | null;
      /** `null` si el geocodificador no dio una comuna reconocible. */
      comuna: CensoClComuna | null;
    };

export const FUENTE_CENSO_2024_CL = {
  label: 'INE Chile — Censo de Población y Vivienda 2024, pueblos indígenas u originarios',
  url: 'https://censo2024.ine.gob.cl/estadisticas/',
  licencia: 'CC BY-SA 4.0',
} as const;

/** Por qué no está la segunda fuente. Va en la pantalla, no sólo acá. */
export const REGISTRO_CL_FALTANTE = {
  organismo: 'CONADI — Registro Nacional de Agrupaciones Indígenas',
  motivo: 'la consulta pública pide clave y la única copia abierta no declara licencia de reutilización',
} as const;

const PAISES_CL = new Set(['chile', 'república de chile', 'republic of chile']);

const REGIONES_CL = CENSO_CL.map(r => r.region);

/** Suma las comunas de una provincia. El INE publica región y comuna, no el medio. */
export function provinciaChilena(region: CensoClRegion, nombre: string): CensoClProvincia | null {
  const suyas = region.comunas.filter(c => c.provincia === nombre);
  if (!suyas.length) return null;
  return {
    provincia: nombre,
    poblacion: suyas.reduce((s, c) => s + c.poblacion, 0),
    indigena: suyas.reduce((s, c) => s + c.indigena, 0),
    comunas: suyas.length,
  };
}

/**
 * Cuánta gente es o se considera perteneciente a un pueblo indígena u
 * originario donde está el predio, según el Censo 2024.
 *
 * Función pura, como la argentina. La diferencia está en de dónde sale la
 * unidad chica: en Chile la comuna no viene en un campo administrativo propio.
 * Nominatim la pone en `suburb` cuando el punto cae en una conurbación —Ñuñoa
 * y Maipú devuelven `city: "Santiago"`— y en `city`/`town`/`village` cuando la
 * comuna es una sola localidad. Se prueban en ese orden, del más específico al
 * menos, y **sólo dentro de la región ya resuelta**: los 346 nombres de comuna
 * son únicos en el país, así que ahí no hay ambigüedad posible.
 *
 * Si la comuna no casa se contesta la provincia, que Nominatim sí da como
 * campo propio (`county` = «Provincia de Cautín»). Si tampoco, la región. Una
 * comuna equivocada es peor que una región cierta.
 */
export function censoChilenoDelPunto(u: Ubicacion | null): CensoClDelPunto {
  if (!u || !u.pais) return { estado: 'sin_ubicacion' };
  if (!PAISES_CL.has(u.pais.trim().toLowerCase())) {
    return { estado: 'fuera_de_chile', pais: u.pais };
  }
  if (!u.provincia) return { estado: 'sin_ubicacion' };

  const rotulo = casarNombre(u.provincia, REGIONES_CL, x => x);
  if (!rotulo) return { estado: 'region_desconocida', region: u.provincia };

  const region = CENSO_CL.find(r => r.region === rotulo);
  // No puede pasar: la lista sale de esta misma tabla. Si pasa, «no sé».
  if (!region) return { estado: 'region_desconocida', region: u.provincia };

  let comuna: CensoClComuna | null = null;
  for (const candidato of [u.comuna, u.localidad]) {
    if (!candidato) continue;
    comuna = casarNombre(candidato, region.comunas, c => c.comuna);
    if (comuna) break;
  }

  const nombreProvincia = comuna?.provincia
    ?? (u.departamento ? casarNombre(u.departamento, [...new Set(region.comunas.map(c => c.provincia))], x => x) : null);
  const provincia = nombreProvincia ? provinciaChilena(region, nombreProvincia) : null;

  return { estado: 'con_censo', region, provincia, comuna };
}

/** El porcentaje del país con el mismo denominador que usa la app. */
export const PORCENTAJE_PAIS_CL = porcentaje(CENSO_CL_PAIS.indigena, CENSO_CL_PAIS.poblacion);

// ── Paraguay: el censo indígena, que es un operativo aparte ────────────────

/**
 * Paraguay es el tercer país y el primero donde el censo indígena **no vive
 * adentro del censo nacional**.
 *
 * En la Argentina y en Chile la pregunta por la pertenencia viaja en el
 * cuestionario que se le hace a todo el mundo, así que el numerador y el
 * denominador salen del mismo operativo y el porcentaje se puede calcular a
 * cualquier escala. Acá no: el INE monta un **IV Censo Nacional de Población y
 * Viviendas para Pueblos Indígenas**, que sale a censar comunidades, aldeas,
 * barrios, núcleos de familias e individualidades, con cuestionario propio,
 * censistas indígenas y capacitación en doce lenguas indígenas. Empezó el 9 de
 * noviembre de 2022 y duró quince días.
 *
 * Eso tiene tres consecuencias que se ven en la pantalla:
 *
 *   1. **No hay porcentaje por departamento.** El numerador es de un operativo
 *      y el único denominador disponible es del otro, con otro universo.
 *      Dividirlos daría un número creíble que no significa lo que parece —la
 *      falla que describe `lib/README.md`—, así que acá se muestran personas y
 *      no proporciones. El país sí lleva porcentaje, porque el INE publica las
 *      dos puntas: 140.049 de 6.109.903.
 *
 *   2. **El total oficial y el de las tablas no son el mismo número.** Las
 *      tablas por departamento suman 137.547, que es lo que levantó el operativo
 *      indígena; las 2.502 personas que el Censo Nacional captó aparte, por
 *      declarar que tienen carnet indígena, no están abiertas por departamento
 *      en ningún cuadro. La resta se dice, no se esconde.
 *
 *   3. **Abajo del departamento no se puede separar quién es indígena.** El
 *      operativo censó comunidades enteras, y adentro vive gente que el censo
 *      rotula «No indigena» —1.245 personas en todo el país—. El cuadro por
 *      departamento las separa; el cuadro por localidad publica una sola
 *      población. Por eso los distritos y las localidades hablan de «personas
 *      censadas» y los departamentos de «personas indígenas».
 *
 * ── La segunda fuente tampoco está, y por otro motivo que en Chile ─────────
 *
 * El equivalente del INAI es el registro del **INDI**, creado por la Ley 904/81
 * y el Decreto 8545/2006, que inscribe liderazgos reconocidos, personerías
 * jurídicas de comunidades, títulos de inmuebles con plano georreferenciado y
 * organizaciones indígenas e indigenistas. La norma existe y dice qué tiene que
 * contener. La base no está publicada: no hay tabla, consulta ni descarga, ni en
 * el INDI ni en Datos.gov.py. En Chile la copia existe y le falta licencia; acá
 * directamente no hay copia.
 *
 * El Cuadro C1 del censo **no lo reemplaza**: le pregunta a cada comunidad si
 * tiene personería jurídica y 494 de 557 contestan que sí, pero eso es una
 * declaración censal, no un padrón de inscripciones vigentes.
 *
 * ── Los dos nombres con barra ──────────────────────────────────────────────
 *
 * «Guarani Occidental / Pueblo Guarani» y «Toba Maskoy / Toba Enenlhet» son un
 * pueblo cada uno. La barra no es una lista: es el registro de que un pueblo se
 * cambió el nombre y el INE conserva las dos formas para no perder
 * comparabilidad con los censos anteriores. Las comunidades de Casanillo y
 * Pesempo-o se autodenominaron Toba Enenlhet en este censo; la Organización
 * Pueblo Guaraní acordó en un congreso de julio de 2022 llamarse Pueblo Guaraní
 * en todas sus comunidades. El INE lo resuelve diciendo que «el censo es por
 * declaración» y conservando las dos. Partir esas barras inventa cuatro pueblos
 * y borra dos decisiones.
 *
 * ── Las tildes que faltan ──────────────────────────────────────────────────
 *
 * Los cuatro CSV del INE son ASCII puro. Su propia publicación escribe Nivaclé,
 * Angaité, Guaraní y Tavyterã; el archivo que se puede bajar, no. Los nombres
 * quedan como los escribe el cuadro y la pantalla lo aclara, porque reponer las
 * tildes de los que pudimos leer y no las del resto haría creer que el INE
 * escribe unos con tilde y otros sin.
 */

/**
 * Qué dice el censo paraguayo del punto. Las mismas tres formas de no saber que
 * en los otros dos países, y una de saber con dos niveles: el distrito si se
 * pudo fijar, el departamento siempre.
 */
export type CensoPyDelPunto =
  | { estado: 'sin_ubicacion' }
  | { estado: 'fuera_de_paraguay'; pais: string }
  | { estado: 'departamento_desconocido'; departamento: string }
  /**
   * Departamento paraguayo reconocido donde el operativo no censó comunidades.
   * Son tres —Cordillera, Misiones y Ñeembucú— y tienen su propia frase: decir
   * que no reconocemos el rótulo sería falso, y dejar el vacío sería peor.
   */
  | { estado: 'sin_comunidades'; departamento: string }
  | {
      estado: 'con_censo';
      departamento: CensoPyDepartamento;
      /** `null` si el geocodificador no dio un distrito reconocible. */
      distrito: CensoPyDistrito | null;
    };

export const FUENTE_CENSO_2022_PY = {
  label: 'INE Paraguay — IV Censo Nacional de Población y Viviendas para Pueblos Indígenas 2022',
  url: 'https://www.datos.gov.py/dataset/iv-censo-nacional-ind%C3%ADgena-2022-resultados-finales-de-poblaci%C3%B3n-y-viviendas',
  licencia: 'Licencia de Uso de la Información Pública del Gobierno Paraguayo (Decreto 4064/2015)',
} as const;

/** Por qué no está la segunda fuente. Va en la pantalla, no sólo acá. */
export const REGISTRO_PY_FALTANTE = {
  organismo: 'INDI — Registro Nacional de Comunidades Indígenas',
  motivo: 'la ley y el decreto que lo crean están publicados, pero la base no: no hay tabla, consulta ni descarga',
} as const;

/** El rótulo con que el censo cuenta a quienes viven en la comunidad sin ser indígenas. */
export const NO_INDIGENA_PY = 'No indigena';

/**
 * Nominatim devuelve el país bilingüe: «Paraguay / Paraguái». Se parte por la
 * barra y alcanza con que una de las dos mitades sea el país, así que si mañana
 * cambia el orden o desaparece una, sigue casando.
 */
function esParaguay(pais: string): boolean {
  const NOMBRES = new Set(['paraguay', 'paraguai', 'republica del paraguay']);
  return pais.split('/').some(parte => NOMBRES.has(normalizarNombreAdmin(parte)));
}

const DEPARTAMENTOS_PY = CENSO_PY.map(d => d.departamento);

/**
 * Los tres departamentos donde el operativo no salió a censar comunidades.
 *
 * Paraguay tiene diecisiete departamentos más Asunción, y el censo indígena
 * cubrió catorce y la capital. Sin esta lista, un predio en Pilar leería que no
 * reconocemos «Ñeembucú», que es falso: lo reconocemos perfecto, y lo que hay
 * que decir es que el operativo no fue para allá. Es la misma distinción que
 * hace la capa argentina entre `jurisdiccion_desconocida` y `sin_comunidades`.
 */
const SIN_COMUNIDADES_PY = ['Cordillera', 'Misiones', 'Ñeembucú'];

/**
 * En qué departamento paraguayo cae el punto, y en qué distrito.
 *
 * Función pura, como las otras dos. Lo propio de Paraguay está en de dónde sale
 * cada nivel:
 *
 * **El departamento** viene en `state`, salvo en Asunción. Asunción no es un
 * departamento sino el Distrito Capital, y OSM la modela como ciudad: devuelve
 * `city: "Asunción"` y ningún `state`. Como el censo la cuenta entre las quince
 * jurisdicciones, hay una rama que la busca por nombre de localidad —y sólo a
 * ella, para que ningún distrito homónimo se haga pasar por departamento—.
 *
 * **El distrito** viene en `city`/`town`, que es donde `/api/entorno` pone la
 * localidad; Paraguay no usa `county`, así que el campo `departamento` de la
 * ubicación llega vacío y no se mira. Si el distrito no casa se contesta el
 * departamento: un distrito equivocado es peor que un departamento cierto.
 */
export function censoParaguayoDelPunto(u: Ubicacion | null): CensoPyDelPunto {
  if (!u || !u.pais) return { estado: 'sin_ubicacion' };
  if (!esParaguay(u.pais)) return { estado: 'fuera_de_paraguay', pais: u.pais };

  const rotulo = u.provincia ? casarNombre(u.provincia, DEPARTAMENTOS_PY, x => x) : null;
  let departamento = rotulo ? CENSO_PY.find(d => d.departamento === rotulo) ?? null : null;

  if (!departamento && !u.provincia) {
    // Sólo Asunción. Ver el comentario de arriba.
    const capital = [u.localidad, u.comuna].some(n => n && casarNombre(n, ['Asuncion'], x => x));
    if (capital) departamento = CENSO_PY.find(d => d.departamento === 'Asuncion') ?? null;
  }

  if (!departamento) {
    const dicho = u.provincia ?? u.localidad;
    if (!dicho) return { estado: 'sin_ubicacion' };
    const vacio = casarNombre(dicho, SIN_COMUNIDADES_PY, x => x);
    return vacio
      ? { estado: 'sin_comunidades', departamento: vacio }
      : { estado: 'departamento_desconocido', departamento: dicho };
  }

  let distrito: CensoPyDistrito | null = null;
  for (const candidato of [u.localidad, u.comuna]) {
    if (!candidato) continue;
    distrito = casarNombre(candidato, departamento.distritos, d => d.distrito);
    if (distrito) break;
  }

  return { estado: 'con_censo', departamento, distrito };
}

/**
 * Los pueblos del departamento, aplanados de sus familias y ordenados de mayor
 * a menor. El cuadro los publica agrupados por familia lingüística, que sirve
 * para leer la composición pero no para contestar «quiénes viven acá».
 */
export function pueblosDelDepartamentoPy(d: CensoPyDepartamento): CensoPyPueblo[] {
  return d.familias.flatMap(f => f.pueblos).sort((a, b) => b.personas - a.personas);
}

/**
 * Los pueblos de una localidad, con sus nombres en vez de sus índices.
 *
 * «No indigena» sale de la lista y vuelve como bandera: es un rótulo del censo
 * sobre quién más vive en la comunidad, no un pueblo, y mezclarlo entre los
 * otros lo haría leer como uno.
 */
export function pueblosDeLocalidadPy(l: CensoPyLocalidad): { pueblos: string[]; conNoIndigenas: boolean } {
  const rotulos = l.pueblos.map(i => PUEBLOS_PY[i] ?? '').filter(Boolean);
  return {
    pueblos: rotulos.filter(p => p !== NO_INDIGENA_PY),
    conNoIndigenas: rotulos.includes(NO_INDIGENA_PY),
  };
}

/**
 * Las localidades del distrito, de mayor a menor, con una cola resumida.
 *
 * Mismo criterio que `pueblosDestacados`: el distrito de Mariscal Estigarribia
 * tiene decenas de localidades y una lista entera tapa a las tres donde vive
 * casi toda la gente. Lo que queda afuera se cuenta, no se esconde.
 */
export function localidadesDestacadas(d: CensoPyDistrito, cuantas = 6): {
  visibles: CensoPyLocalidad[];
  resto: { localidades: number; personas: number };
} {
  const ordenadas = [...d.localidades].sort((a, b) => b.censadas - a.censadas);
  const visibles = ordenadas.slice(0, cuantas);
  const cola = ordenadas.slice(cuantas);
  return {
    visibles,
    resto: { localidades: cola.length, personas: cola.reduce((s, l) => s + l.censadas, 0) },
  };
}

/** El porcentaje del país, el único que se puede calcular con las dos puntas publicadas. */
export const PORCENTAJE_PAIS_PY = porcentaje(CENSO_PY_PAIS.total, CENSO_PY_PAIS.poblacionPais);

// ── Perú: un censo que sólo llega al departamento ──────────────────────────

/**
 * Perú es el cuarto país, y el que contesta más grueso.
 *
 * El Censo 2017 pregunta por la autoidentificación —la pregunta 25, «por sus
 * costumbres y sus antepasados, ¿usted se siente o considera…»— dentro del
 * cuestionario nacional, así que el numerador y el denominador salen del mismo
 * operativo y el porcentaje se puede calcular, como en la Argentina y en Chile.
 * Lo que no hay es escala: **los anexos del INEI llegan al departamento y no
 * bajan a provincia ni a distrito.** Un predio en Perú se contesta con su
 * departamento y nada más, y la pantalla lo dice en vez de fingir precisión.
 *
 * ── El universo, que acá no es todo el mundo ───────────────────────────────
 *
 * La pregunta se le hizo sólo a las personas de **12 y más años**: 23.196.391
 * de las censadas. De ellas, 5.984.708 se declararon indígenas u originarias.
 * Dividir esas 5.984.708 por la población total del país daría un número más
 * chico y sin sentido, así que el denominador viaja en la tabla y la pantalla
 * aclara la edad cada vez que muestra el porcentaje.
 *
 * ── Dos grupos que el INEI publica separados ───────────────────────────────
 *
 * «Indígena u originaria de los Andes» —quechua, aimara y otro pueblo andino,
 * 5.771.885— e «indígena u originaria de la Amazonía» —212.823—. El total de
 * 5.984.708 no es una fila de ningún cuadro: es la suma de esas dos, y por eso
 * el panel las muestra por separado. En Amazonas o en Ucayali el grupo grande
 * es el amazónico y en Puno o en Cusco el andino; sumarlos sin abrirlos
 * escondería justamente eso.
 *
 * ── La segunda fuente tampoco está, y por un tercer motivo ─────────────────
 *
 * El equivalente del INAI es la **Base de Datos Oficial de Pueblos Indígenas u
 * Originarios (BDPI)** del Ministerio de Cultura, y acá el problema no es que
 * no exista ni que esté cerrada: existe, se baja, tiene 9.332 localidades con
 * departamento, provincia y distrito, y **no declara ninguna licencia** —ni la
 * página, ni el XLSX, ni el manual, ni el geoportal—. Acceso público no es
 * permiso de reutilización, y acequia cobra. Tampoco trae geometría: marca
 * 4.589 localidades como georreferenciadas pero no publica una sola coordenada,
 * y el visor responde por un servicio JSON que el Ministerio no documenta como
 * API estable.
 *
 * Son tres formas distintas de faltar, una por país: en Chile la copia existe y
 * no declara licencia, en Paraguay la base directamente no está publicada, y
 * acá el archivo se baja entero y nadie dice qué se puede hacer con él.
 *
 * ── La lengua materna no es el pueblo ──────────────────────────────────────
 *
 * El censo no publica un conteo comparable para cada uno de los 55 pueblos
 * oficiales. Lo más cerca que llega es el cuadro de **lengua o idioma materna
 * aprendida en la niñez**, que sí viene por departamento, y es lo que muestra
 * el panel. No es lo mismo y no se presenta como si lo fuera: 2.473.986 de los
 * 5.771.885 indígenas de los Andes declaran castellano como lengua materna, y
 * ese dato habla de la historia de la lengua, no de quién es quién.
 */

/**
 * Qué dice el censo peruano del punto. Las mismas tres formas de no saber que
 * en los otros tres países, y una sola de saber: el departamento. Los
 * veinticinco tienen población indígena censada —el más chico es Tumbes, con
 * 3.660 personas—, así que acá no existe la rama del «no hay».
 */
export type CensoPeDelPunto =
  | { estado: 'sin_ubicacion' }
  | { estado: 'fuera_de_peru'; pais: string }
  | { estado: 'departamento_desconocido'; departamento: string }
  | { estado: 'con_censo'; departamento: CensoPeDepartamento };

export const FUENTE_CENSO_2017_PE = {
  label: 'INEI Perú — Censos Nacionales 2017, autoidentificación étnica (resultados finales)',
  url: 'https://www.inei.gob.pe/media/MenuRecursivo/publicaciones_digitales/Est/Lib1642/',
  licencia: 'uso comercial contemplado por el INEI, citando la fuente',
} as const;

/** Por qué no está la segunda fuente. Va en la pantalla, no sólo acá. */
export const REGISTRO_PE_FALTANTE = {
  organismo: 'Ministerio de Cultura — Base de Datos Oficial de Pueblos Indígenas u Originarios (BDPI)',
  motivo: 'el archivo de 9.332 localidades se baja entero, pero no declara ninguna licencia de reutilización',
} as const;

/**
 * Nominatim devuelve «Perú», con tilde. Se parte por la barra igual que en
 * Paraguay: el rótulo de OSM puede pasar a ser bilingüe —el quechua y el aimara
 * son oficiales donde predominan— y ese día la capa tiene que seguir
 * disparando.
 */
function esPeru(pais: string): boolean {
  const NOMBRES = new Set(['peru', 'republica del peru', 'piruw', 'piruw suyu']);
  return pais.split('/').some(parte => NOMBRES.has(normalizarNombreAdmin(parte)));
}

const DEPARTAMENTOS_PE = CENSO_PE.map(d => d.departamento);

/**
 * En qué departamento peruano cae el punto.
 *
 * Función pura, como las otras tres. Lo propio de Perú es que **los nombres de
 * los niveles están corridos respecto de la Argentina**: lo que en la ubicación
 * se llama `provincia` sale de `state` y en Perú es el *departamento*, y lo que
 * se llama `departamento` sale de `county`, que en Perú es la *provincia*. Como
 * el censo sólo llega al departamento, esta función mira `provincia` y nada
 * más; el otro campo no se toca, justamente para que nadie lo confunda.
 *
 * Callao entra por su nombre corto: el censo lo escribe «Provincia
 * Constitucional del Callao» y el geocodificador contesta «Callao», que es
 * subconjunto de palabras y único entre los veinticinco.
 */
export function censoPeruanoDelPunto(u: Ubicacion | null): CensoPeDelPunto {
  if (!u || !u.pais) return { estado: 'sin_ubicacion' };
  if (!esPeru(u.pais)) return { estado: 'fuera_de_peru', pais: u.pais };
  if (!u.provincia) return { estado: 'sin_ubicacion' };

  const rotulo = casarNombre(u.provincia, DEPARTAMENTOS_PE, x => x);
  if (!rotulo) return { estado: 'departamento_desconocido', departamento: u.provincia };

  const departamento = CENSO_PE.find(d => d.departamento === rotulo);
  // No puede pasar: la lista sale de esta misma tabla. Si pasa, «no sé».
  if (!departamento) return { estado: 'departamento_desconocido', departamento: u.provincia };

  return { estado: 'con_censo', departamento };
}

/** Una lengua materna declarada en el departamento, con su gente. */
export interface LenguaPe {
  lengua: string;
  personas: number;
}

/**
 * Las lenguas maternas del departamento, partidas en tres.
 *
 * `originarias` son las nueve categorías de lengua originaria del cuadro, de
 * mayor a menor y sin las que dieron cero. `castellano` va aparte porque no es
 * un resto: es la lengua materna de la mayoría de la población indígena andina,
 * y mezclarlo entre las otras taparía ese hecho. `resto` junta portugués, otra
 * lengua extranjera, lengua de señas, quien no escucha ni habla y quien no
 * contestó; son pocos y no se esconden, se cuentan.
 */
export function lenguasDelDepartamentoPe(d: CensoPeDepartamento): {
  originarias: LenguaPe[];
  castellano: number;
  resto: number;
} {
  const originarias = d.lenguas
    .slice(0, LENGUAS_ORIGINARIAS_PE)
    .map((personas, i) => ({ lengua: LENGUAS_PE[i] ?? '', personas }))
    .filter(l => l.personas > 0)
    .sort((a, b) => b.personas - a.personas);

  const castellano = d.lenguas[LENGUAS_ORIGINARIAS_PE] ?? 0;
  const resto = d.lenguas.slice(LENGUAS_ORIGINARIAS_PE + 1).reduce((s, n) => s + n, 0);

  return { originarias, castellano, resto };
}

/** El porcentaje del país, sobre las personas de 12 y más años. */
export const PORCENTAJE_PAIS_PE = porcentaje(CENSO_PE_PAIS.indigena, CENSO_PE_PAIS.censada12);


/* ═══════════════════════════════════════════════════════════════════════════
 * Brasil — Censo Demográfico 2022 (IBGE)
 *
 * El quinto país, y el primero que contesta a escala de municipio.
 *
 * Los otros cuatro contestan en la división grande: departamento en la
 * Argentina y en el Perú, comuna en Chile, localidad en el Paraguay. Brasil
 * obliga a bajar un nivel porque el estado no dice nada útil de un predio:
 * Amazonas tiene 490.935 personas indígenas repartidas en un territorio más
 * grande que toda la Argentina al norte del Colorado. El municipio brasileño,
 * en cambio, incluye la ciudad sede y toda su zona rural, así que es la unidad
 * que le corresponde a un campo.
 *
 * **Por qué el municipio se busca DENTRO del estado y no en la lista entera.**
 * Medido sobre los 5.570: hay 240 nombres que se repiten en más de un estado
 * —«Bom Jesus», «Santa Luzia», «Boa Vista»— y ninguno que se repita dentro del
 * mismo. Buscar en la lista global dejaría esos 240 sin respuesta, porque
 * `casarNombre` no contesta cuando hay empate; buscar dentro del estado es
 * unívoco para los 5.570.
 *
 * **Dos maneras de acertar, no una.** El geocodificador devuelve el estado en
 * `provincia` y el municipio en `localidad`, pero en zonas rurales profundas
 * puede contestar con el nombre de un poblado que no es el municipio. Cuando
 * eso pasa no se inventa: se contesta con el estado y se dice que el municipio
 * no se pudo identificar. Es peor dar el municipio equivocado que dar el
 * estado y aclararlo.
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Qué dice el censo brasileño del punto.
 *
 * A diferencia de los otros cuatro países hay **dos** formas de acertar, porque
 * hay dos niveles: `con_estado` cuando se supo el estado pero no el municipio,
 * y `con_censo` cuando se supieron los dos. La primera no es un error: es una
 * respuesta más gruesa, y la pantalla la dice como tal.
 */
export type CensoBrDelPunto =
  | { estado: 'sin_ubicacion' }
  | { estado: 'fuera_de_brasil'; pais: string }
  | { estado: 'estado_desconocido'; nombre: string }
  | { estado: 'con_estado'; uf: CensoBrEstado; municipioBuscado: string | null }
  | { estado: 'con_censo'; uf: CensoBrEstado; municipio: CensoBrMunicipio };

export const FUENTE_CENSO_2022_BR = {
  label: 'IBGE — Censo Demográfico 2022, população indígena (tabelas SIDRA 9718 e 4709)',
  url: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html',
  licencia: 'política de datos abiertos del IBGE, citando la fuente',
} as const;

/** Por qué no está la segunda fuente. Va en la pantalla, no sólo acá. */
export const REGISTRO_BR_FALTANTE = {
  organismo: 'FUNAI — Fundação Nacional dos Povos Indígenas (tierras indígenas y aldeas)',
  motivo: 'el sitio se publica bajo CC BY-ND 3.0, que prohíbe las obras derivadas: montar la capa sería una',
} as const;

/**
 * Nominatim contesta «Brasil» en portugués y «Brazil» en inglés. Se parte por
 * la barra igual que en el Paraguay y el Perú, por si el rótulo pasa a ser
 * bilingüe.
 */
function esBrasil(pais: string): boolean {
  const NOMBRES = new Set(['brasil', 'brazil', 'republica federativa do brasil', 'republica federativa del brasil']);
  return pais.split('/').some(parte => NOMBRES.has(normalizarNombreAdmin(parte)));
}

const ESTADOS_BR = CENSO_BR.map(e => e.estado);

/**
 * En qué estado y municipio brasileño cae el punto.
 *
 * Función pura, como las otras cuatro. El estado sale de `provincia` (el
 * `state` de Nominatim) y el municipio de `localidad` (su `city` o `town`,
 * que en Brasil es el municipio entero y no sólo la mancha urbana).
 *
 * El estado se intenta primero por nombre y después por sigla: el
 * geocodificador puede contestar «SP» o «São Paulo», y las siglas de dos letras
 * no sobreviven a `normalizarNombreAdmin`, que descarta las palabras de una
 * sola letra pero conserva las de dos.
 */
export function censoBrasilenoDelPunto(u: Ubicacion | null): CensoBrDelPunto {
  if (!u || !u.pais) return { estado: 'sin_ubicacion' };
  if (!esBrasil(u.pais)) return { estado: 'fuera_de_brasil', pais: u.pais };
  if (!u.provincia) return { estado: 'sin_ubicacion' };

  const rotulo = casarNombre(u.provincia, ESTADOS_BR, x => x);
  const uf = rotulo
    ? CENSO_BR.find(e => e.estado === rotulo) ?? null
    : CENSO_BR.find(e => normalizarNombreAdmin(e.sigla) === normalizarNombreAdmin(u.provincia!)) ?? null;

  if (!uf) return { estado: 'estado_desconocido', nombre: u.provincia };

  // El municipio, buscado sólo entre los de ESTE estado: ver el encabezado.
  const buscado = u.localidad ?? null;
  if (!buscado) return { estado: 'con_estado', uf, municipioBuscado: null };

  const municipio = casarNombre(buscado, uf.municipios, m => m.municipio);
  if (!municipio) return { estado: 'con_estado', uf, municipioBuscado: buscado };

  return { estado: 'con_censo', uf, municipio };
}

/**
 * Los municipios del estado con más población indígena, para dar contexto.
 *
 * Se devuelven sólo los que tienen gente: un estado como Río de Janeiro tiene
 * 65 de sus 92 municipios en cero, y llenar la lista con ceros no informa. Si
 * el estado entero está en cero —no pasa hoy, los 27 tienen— la lista vuelve
 * vacía y la pantalla lo dice.
 */
export function municipiosDestacadosBr(uf: CensoBrEstado, cuantos = 6): CensoBrMunicipio[] {
  return uf.municipios
    .filter(m => m.indigena > 0)
    .sort((a, b) => b.indigena - a.indigena)
    .slice(0, cuantos);
}

/** El porcentaje del país, sobre la población residente del Censo 2022. */
export const PORCENTAJE_PAIS_BR = porcentaje(CENSO_BR_PAIS.indigena, CENSO_BR_PAIS.poblacion);
