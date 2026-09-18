import type { Ubicacion } from './entorno';
import { REGISTRO_AR } from './pueblosOriginariosAr';
import { CENSO_AR } from './censoIndigena2022Ar';

/**
 * Pueblos originarios en el territorio del predio. Argentina, por ahora.
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
