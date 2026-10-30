/**
 * viento.ts — De dónde sopla, con qué estadística, y con cuánta confianza.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUÉ EXISTE ESTE ARCHIVO
 *
 * Hasta el 30/10/2026 la dirección del viento a frenar la decidía
 * `azimutVientoFrio(lat)` en `cortinas.ts`, de una línea:
 *
 *     return latCentro < 0 ? 180 : 0;   // sur → frío del S; norte → del N
 *
 * El razonamiento era «el aire frío viene del polo», y como modelo de masas de
 * aire no está mal. Como respuesta a «contra qué viento se pone esta cortina»
 * está mal en los tres predios que la app tiene medidos, y mal de maneras
 * distintas. Los tres son climatologías de NASA POWER (WD10M, WS10M, T2M; serie
 * 2001–2025, celda de ~0,5°), consultadas el 30/10/2026 y guardadas en
 * `tests/unit/clima/viento.test.ts`:
 *
 *   • **17,33° N / 92,19° O (Chiapas).** El modelo decía N (0°). Los doce meses
 *     entran entre 36,5° y 81,6°: del norte no sopla NUNCA —el mes más cercano
 *     al norte está a 36,5°—. El trimestre más frío da 51,1° (NE). Error del
 *     modelo: 51°, y contra un viento que no existe.
 *   • **31,40° S / 64,20° O (Córdoba).** El modelo decía S (180°). El trimestre
 *     más frío —junio, julio, agosto— da 315,6° (NO). Error: 136°. De paso: el
 *     Pampero del SO que este módulo afirmaba antes tampoco es lo que mide la
 *     serie.
 *   • **52,37° N / 4,90° E (Ámsterdam).** El modelo decía N (0°). El trimestre
 *     más frío da 224,3° (SO), y con 6,5 m/s de media, que es el doble que en
 *     los otros dos. Error: 136°, y la cortina habría ido al lado de la casa
 *     por donde no pega el viento fuerte.
 *
 * Una cortina mal orientada no se nota: se planta, crece diez años y no repara
 * nada. «Windbreaks are most effective when they are oriented perpendicular to
 * the wind. As winds become more oblique to the windbreak, the extent of the
 * protected zone is reduced» (Brandle et al., 2009; ver la cita abajo).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * QUÉ PREGUNTA CONTESTA, Y QUÉ PREGUNTA NO
 *
 * Contesta: **cuál es el viento predominante de la estación fría**, medido.
 * Eso es lo que una cortina rompevientos tiene que frenar —el desecamiento, la
 * sensación térmica, la pérdida de calor de la casa son efectos del viento que
 * sopla, no del que sopla raro—.
 *
 * NO contesta de dónde entran las irrupciones de aire frío. No son lo mismo y
 * Ámsterdam lo muestra: el flujo dominante del invierno es el del SO, marítimo
 * y templado, mientras que las olas de frío llegan del E con el aire
 * continental. La media del trimestre dice SO porque el SO es el que sopla.
 * Si lo que se busca es la helada, la pregunta es otra y la contesta
 * `estaciones.ts` con las mínimas, no ésta con las direcciones.
 *
 * Por eso lo que se publica se llama «viento de la estación fría» y no «de
 * dónde viene el aire frío», y por eso viaja al lado la `concentracion`: es el
 * único número que avisa cuándo una sola flecha no alcanza para describir el
 * año.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LAS DOS FUENTES
 *
 * **La estadística.** Una dirección no se promedia con una suma dividida por n:
 * el promedio aritmético de 350° y 10° es 180°, que es el norte al revés. Se
 * promedia por vectores —media circular—, que es el método de Fisher,
 * *Statistical Analysis of Circular Data*, Cambridge University Press (1993), y
 * de Mardia y Jupp, *Directional Statistics*, Wiley (2000). De ahí sale también
 * la longitud resultante media R̄, que acá se publica como `concentracion`.
 *
 * **El diseño de la cortina.** Brandle, J.R., Hodges, L., Tyndall, J. y
 * Sudmeyer, R.A. (2009), «Windbreak Practices», en *North American
 * Agroforestry: An Integrated Science and Practice*, 2.ª ed., H.E. Garrett
 * (ed.), American Society of Agronomy, Madison, cap. 29. Tres frases de ahí
 * mandan en este archivo y en `cortinas.ts`:
 *
 *   1. «Field windbreaks should be oriented perpendicular to the prevailing or
 *      **problem** winds to maximize the protected zone.» El viento problema
 *      puede no ser el predominante del año, y por eso acá se mira el trimestre
 *      frío y no el promedio anual.
 *   2. «In many areas, problem winds will come from several directions. In these
 *      cases, additional windbreaks with different orientations may be required
 *      to achieve the desired level of protection.» Ésa es la salida honesta
 *      cuando la rosa está partida: no es una cortina mejor orientada, son dos
 *      cortinas. Lo avisa `disperso`.
 *   3. La zona de reparo a sotavento «typically extends for a distance of 10 to
 *      30 H». El factor de diseño vive en `cortinas.ts`, que es quien dibuja.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * QUIÉN LEE ESTO
 *
 * `cortinas.ts` (la orientación de la cortina y de su zona protegida),
 * `sectores.ts` (las dos cuñas de viento del análisis de sectores) y
 * `clima.ts` (la concentración que acompaña a `viento_dir_ppal`). Cambiar el
 * estadístico mueve los tres a la vez, que es justamente para lo que se juntó
 * acá: antes había tres rosas de los vientos distintas —una de 8 puntas en
 * `cortinas.ts`, dos de 16 en `clima.ts` y `sectores.ts`— y la misma dirección
 * salía rotulada de dos maneras según la pantalla.
 */

/** La rosa de 16 puntas, en español, en orden de azimut creciente. */
export const RUMBOS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO',
] as const;

export type Rumbo = typeof RUMBOS[number];

/** Azimut de cada punta, en grados desde el norte y hacia el este. */
export const AZIMUT_DE_RUMBO: Readonly<Record<Rumbo, number>> = Object.freeze(
  Object.fromEntries(RUMBOS.map((r, i) => [r, i * 22.5])) as Record<Rumbo, number>,
);

/** Normaliza un azimut al intervalo [0, 360). */
export function normalizarAzimut(az: number): number {
  return ((az % 360) + 360) % 360;
}

/** Azimut → la punta más cercana de la rosa de 16. Cada punta cubre 22,5°. */
export function rumboDeAzimut(az: number): Rumbo {
  const i = Math.round(normalizarAzimut(az) / 22.5) % 16;
  return RUMBOS[i] ?? 'N';
}

/** Rumbo → azimut. `null` si el texto no es una punta de la rosa: un rumbo que
 *  no se reconoce no es el norte, es un dato que no se entendió. */
export function azimutDeRumbo(rumbo: string): number | null {
  const r = rumbo.trim().toUpperCase();
  return Object.prototype.hasOwnProperty.call(AZIMUT_DE_RUMBO, r)
    ? AZIMUT_DE_RUMBO[r as Rumbo]
    : null;
}

/**
 * Lo que un mes aporta. Estructuralmente compatible con `MesDato` de
 * `clima.ts`, y declarado acá para no importar ese módulo: `clima.ts` importa
 * este archivo, y el ciclo lo rompe el tipo propio.
 *
 * `viento_dir_deg` es WD10M: el azimut DESDE el que sopla, en grados desde el
 * norte (convención meteorológica). `viento_ms` es WS10M, la media mensual a
 * 10 m de altura.
 */
export interface MesViento {
  mes:             string;
  viento_dir_deg?: number;
  viento_ms:       number;
  tmean_c:         number;
}

/** Con qué estadístico salió el azimut. Ver `rosaDelViento`. */
export type EstadisticoRosa = 'vectorial' | 'modal';

export interface Rosa {
  /** Azimut DESDE donde sopla, en grados desde el norte. */
  az_deg: number;
  /** El mismo azimut en la rosa de 16 puntas. */
  rumbo: Rumbo;
  /**
   * Longitud resultante media R̄, de 0 a 1: 1 es «todos los meses del mismo
   * lado», 0 es «repartido en todo el horizonte». Es la medida de concentración
   * de la estadística circular (Fisher, 1993).
   */
  concentracion: number;
  /** `concentracion` por debajo de `CONCENTRACION_MINIMA`. Ver esa constante. */
  disperso: boolean;
  estadistico: EstadisticoRosa;
  /** Los meses que entraron en la cuenta, por nombre y en orden. */
  meses: string[];
  /** Cuántos meses entraron. Menos de 12 significa que faltan direcciones. */
  n: number;
}

/**
 * Debajo de este R̄ la rosa deja de tener un lado y la media vectorial deja de
 * describirla.
 *
 * Es un umbral de diseño y no un valor publicado, así que va con la geometría
 * que le corresponde: R̄ = 0,66 es lo que da una rosa repartida en partes
 * iguales entre dos lados separados **97°** (R̄ = cos 48,5°), o un abanico
 * uniforme de **170° de abertura** (R̄ = sen α / α). Más ancho que eso, una sola
 * cortina perpendicular a la media no es la respuesta: son dos cortinas, que es
 * lo que dice Brandle et al. (2009) para el caso de «problem winds from several
 * directions».
 *
 * Córdoba está justo del lado bueno y por poco: su rosa anual da R̄ = 0,754,
 * repartida entre el NE del verano y el NO del invierno. Por eso el trimestre
 * frío se calcula aparte en vez de confiar en el año.
 */
export const CONCENTRACION_MINIMA = 0.66;

/**
 * El viento de un conjunto de meses: media vectorial pesada por velocidad.
 *
 * **El peso es una decisión de diseño, no del método.** Fisher y Mardia
 * promedian vectores unitarios —un mes, un voto—; acá cada mes vota con su
 * velocidad media, porque lo que una cortina tiene que frenar es la cantidad de
 * movimiento del aire y un mes de 6 m/s no pesa igual que uno de 1 m/s. En los
 * tres predios medidos el peso mueve el trimestre frío menos de 1° y el año
 * menos de 2,5°, porque las velocidades mensuales de una misma celda se parecen
 * entre sí; donde cambiaría es en un régimen con una estación ventosa y otra
 * calma, y ahí mover el resultado es lo correcto.
 *
 * Devuelve `null` si ningún mes trae dirección: sin dato no hay dirección, y
 * una dirección inventada acá sale dibujada como una cortina en el plano.
 *
 * Cuando R̄ cae por debajo de `CONCENTRACION_MINIMA` la media vectorial ya no
 * describe la rosa, así que el azimut pasa a salir del **sector modal** —la
 * punta de la rosa que junta más velocidad acumulada, promediada por vectores
 * dentro de esa punta— y `estadistico` lo dice. `concentracion` sigue siendo la
 * del conjunto entero: es la que avisa que hace falta más de una cortina.
 */
export function rosaDelViento(meses: readonly MesViento[]): Rosa | null {
  const con = meses.filter(
    (m): m is MesViento & { viento_dir_deg: number } => Number.isFinite(m.viento_dir_deg),
  );
  if (con.length === 0) return null;

  // Si la serie no trae velocidades usables, todos los meses votan igual: es
  // peor perder la dirección que perder el peso.
  const sumaVel = con.reduce((s, m) => s + Math.max(0, m.viento_ms), 0);
  const peso = (m: MesViento) => (sumaVel > 0 ? Math.max(0, m.viento_ms) : 1);

  const { az, r } = mediaVectorial(con, peso);
  const concentracion = Math.round(r * 1000) / 1000;
  const comunes = {
    concentracion,
    disperso: concentracion < CONCENTRACION_MINIMA,
    meses: con.map(m => m.mes),
    n: con.length,
  };

  if (!comunes.disperso) {
    return { az_deg: redondear1(az), rumbo: rumboDeAzimut(az), estadistico: 'vectorial', ...comunes };
  }

  // Rosa partida: manda el sector que junta más velocidad. El empate se resuelve
  // por el azimut más chico, para que el resultado no dependa del orden de los
  // meses.
  const porSector = new Map<Rumbo, Array<MesViento & { viento_dir_deg: number }>>();
  for (const m of con) {
    const r16 = rumboDeAzimut(m.viento_dir_deg);
    const ya = porSector.get(r16);
    if (ya) ya.push(m); else porSector.set(r16, [m]);
  }
  const sectores = [...porSector.entries()]
    .map(([rumbo, ms]) => ({ rumbo, ms, vel: ms.reduce((s, m) => s + Math.max(0, m.viento_ms), 0) }))
    .sort((a, b) => b.vel - a.vel || AZIMUT_DE_RUMBO[a.rumbo] - AZIMUT_DE_RUMBO[b.rumbo]);
  const modal = sectores[0]!;
  const dentro = mediaVectorial(modal.ms, peso);

  return {
    az_deg: redondear1(dentro.az),
    rumbo: rumboDeAzimut(dentro.az),
    estadistico: 'modal',
    ...comunes,
  };
}

/**
 * Los índices del trimestre más frío: los **tres meses consecutivos** de menor
 * temperatura media, buscados en círculo para que diciembre–enero–febrero sea
 * un trimestre y no dos pedazos.
 *
 * Es la definición de las variables bioclimáticas de WorldClim (BIO11, «Mean
 * Temperature of Coldest Quarter»), y se usa por eso: resuelve los dos
 * hemisferios y el trópico sin preguntar en qué hemisferio está el predio, que
 * es exactamente el error que este archivo vino a sacar.
 *
 * Con menos de tres meses devuelve todos los que haya: no hay trimestre, pero
 * tampoco hay por qué no contestar.
 */
export function trimestreMasFrio(meses: readonly { tmean_c: number }[]): number[] {
  const n = meses.length;
  if (n <= 3) return meses.map((_, i) => i);

  let mejor = 0;
  let mejorSuma = Infinity;
  for (let i = 0; i < n; i++) {
    const suma = meses[i]!.tmean_c
      + meses[(i + 1) % n]!.tmean_c
      + meses[(i + 2) % n]!.tmean_c;
    if (suma < mejorSuma) { mejorSuma = suma; mejor = i; }
  }
  return [mejor, (mejor + 1) % n, (mejor + 2) % n];
}

/** De qué período salió la rosa que se usa para orientar la cortina. */
export type PeriodoRosa = 'trimestre_frio' | 'anual';

export interface RosaFria extends Rosa {
  periodo: PeriodoRosa;
}

/**
 * El viento contra el que se orienta una cortina: el predominante del trimestre
 * más frío, medido.
 *
 * Si ninguno de esos tres meses trae dirección cae al año entero y lo dice en
 * `periodo`, que no es lo mismo y se ve en Córdoba: el año da 18,5° (NNE) y el
 * trimestre frío 315,6° (NO), 63° de diferencia en el mismo predio.
 *
 * Devuelve `null` cuando la serie no trae ninguna dirección. El que llama tiene
 * que pedirle el rumbo a quien vive ahí o no dibujar nada; lo que ya no hay es
 * un default por latitud.
 */
export function vientoDeLaEstacionFria(meses: readonly MesViento[]): RosaFria | null {
  if (meses.length === 0) return null;

  const frios = trimestreMasFrio(meses).map(i => meses[i]!);
  const delTrimestre = rosaDelViento(frios);
  if (delTrimestre) return { ...delTrimestre, periodo: 'trimestre_frio' };

  const delAnio = rosaDelViento(meses);
  return delAnio ? { ...delAnio, periodo: 'anual' } : null;
}

// ─── Internas ────────────────────────────────────────────────────────────────

/** Media vectorial de azimuts con pesos. Devuelve el azimut y R̄. */
function mediaVectorial(
  meses: readonly (MesViento & { viento_dir_deg: number })[],
  peso: (m: MesViento) => number,
): { az: number; r: number } {
  let este = 0, norte = 0, total = 0;
  for (const m of meses) {
    const w = peso(m);
    const rad = (m.viento_dir_deg * Math.PI) / 180;
    este  += w * Math.sin(rad);
    norte += w * Math.cos(rad);
    total += w;
  }
  if (total <= 0) return { az: 0, r: 0 };
  const largo = Math.hypot(este, norte);
  // Con R̄ = 0 el azimut no existe —los vectores se cancelaron—, y `atan2(0,0)`
  // devolvería 0, o sea el norte, que sería inventar. Se devuelve el primer mes,
  // que al menos es una dirección medida, y `disperso` ya avisó.
  const az = largo < 1e-9
    ? normalizarAzimut(meses[0]?.viento_dir_deg ?? 0)
    : normalizarAzimut((Math.atan2(este, norte) * 180) / Math.PI);
  return { az, r: largo / total };
}

const redondear1 = (x: number) => Math.round(x * 10) / 10;
