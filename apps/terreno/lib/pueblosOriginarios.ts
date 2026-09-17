import type { Ubicacion } from './entorno';
import { REGISTRO_AR } from './pueblosOriginariosAr';

/**
 * Pueblos originarios con comunidades registradas en el territorio del predio.
 * Argentina, por ahora.
 *
 * ── Qué pregunta contesta, que no es la que parece ──────────────────────────
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

/**
 * Las 24 jurisdicciones, en el nombre con que las escribe Nominatim.
 *
 * Es una lista cerrada y está acá para que un nombre que no reconocemos no se
 * lea como «no hay comunidades». Si el geocodificador cambia un rótulo, la
 * respuesta es `jurisdiccion_desconocida` —que el panel admite no saber— y no
 * un vacío que el usuario leería como un dato.
 *
 * Veintitrés salen del propio registro del INAI; la Ciudad Autónoma de Buenos
 * Aires es la única jurisdicción sin comunidades inscriptas, y se agrega a mano
 * para poder decirlo con esas palabras.
 */
const JURISDICCIONES_AR = [
  ...REGISTRO_AR.map(p => p.provincia),
  'Ciudad Autónoma de Buenos Aires',
];

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
    .filter(w => w.length > 1)
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
 * Qué dice el registro sobre el lugar donde está el predio.
 *
 * Función pura: recibe la ubicación administrativa que ya resolvió
 * `/api/entorno` con Nominatim y no consulta nada. El registro viaja en el
 * bundle porque es una foto de 1.878 filas agregadas, no un servicio.
 */
export function registroDelPunto(u: Ubicacion | null): RegistroDelPunto {
  if (!u || !u.pais) return { estado: 'sin_ubicacion' };
  if (!PAISES_AR.has(u.pais.trim().toLowerCase())) {
    return { estado: 'fuera_de_argentina', pais: u.pais };
  }
  if (!u.provincia) return { estado: 'sin_ubicacion' };

  const jurisdiccion = casarNombre(u.provincia, JURISDICCIONES_AR, x => x);
  if (!jurisdiccion) return { estado: 'jurisdiccion_desconocida', provincia: u.provincia };

  const provincia = REGISTRO_AR.find(p => p.provincia === jurisdiccion);
  if (!provincia) return { estado: 'sin_comunidades', jurisdiccion };

  const departamento = u.departamento
    ? casarNombre(u.departamento, provincia.departamentos, d => d.departamento)
    : null;

  return { estado: 'con_registro', provincia, departamento };
}
