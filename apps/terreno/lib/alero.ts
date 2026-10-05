/**
 * alero.ts — El control solar de una abertura: cuánto alero necesita cada
 * pared, en qué período hay que dar sombra, y a qué hora se decide.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TRES COSAS QUE EL ENUNCIADO DE LA ETAPA NO TENÍA
 *
 * El plan decía que «los aleros salen de la latitud y de la altura solar que la
 * app ya calcula». No salen de ahí, y cada una de las tres razones cambia el
 * número:
 *
 * 1. **La altura del sol no alcanza: manda el ángulo de la pared.** Lo que tapa
 *    un alero horizontal no es la elevación del sol sino el **ángulo de sombra
 *    vertical** (VSA), que es la elevación proyectada sobre el plano
 *    perpendicular a la fachada. Para una pared que no mira exactamente al
 *    ecuador el VSA y la elevación son números distintos, y para una pared al
 *    este o al oeste el alero que haría falta es más profundo que el alto de la
 *    ventana. En las seis localidades publicadas por UN-Habitat la pared que
 *    mira al ecuador pide un alero de 0,70 a 1,09 veces el alto de la abertura,
 *    y la pared al oeste de 1,25 a 1,67: el doble, en el mismo lugar y el mismo
 *    día. Un alero dimensionado con la elevación del mediodía no es el alero de
 *    esa pared.
 *
 * 2. **El período a sombrear no es el solsticio: es el período sobrecalentado.**
 *    El método de UN-Habitat arranca por determinar «the overheated period i.e.
 *    the dates and times when shading is desired», y eso es un dato de clima,
 *    no de astronomía. Y acá aparece la trampa: la geometría del sol es
 *    **simétrica** alrededor del solsticio y el clima **no lo es**. Un alero
 *    fijo da exactamente la misma sombra en dos fechas espejadas respecto del
 *    solsticio, y esas dos fechas no tienen la misma temperatura. El alero que
 *    tapa febrero tapa también fines de octubre, cuando el sol se quería.
 *    `costoDeLaSimetria` mide esa diferencia con la serie del predio.
 *
 * 3. **La hora del corte es hora solar, y nadie lo dice.** Las tablas
 *    publicadas se dibujan sobre cartas solares en **hora media local**: el
 *    reloj corregido por la diferencia entre la longitud del predio y el
 *    meridiano de su huso. En Mbeya (33,45° E, huso de 45° E) ese desfase es de
 *    46 minutos, y es la razón por la que su pared al este pide un alero de
 *    1,78 contra 1,39 en Mtwara —misma latitud, 28 % más de profundidad—. En la
 *    Argentina el desfase es mucho mayor: el huso legal es el de 45° O y el país
 *    llega a 73° O, así que en Mendoza el mediodía solar cae cerca de las 13:35
 *    del reloj y una ventana «de 9 a 16» no es simétrica alrededor del sol.
 *    Verificado al revés: agregarle la ecuación del tiempo al cálculo EMPEORA la
 *    coincidencia con las tablas (error medio 1,29° contra 0,61°), lo que
 *    confirma que la carta está en hora media y no en hora verdadera.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FUENTES
 *
 * · **Stephenson, D.G., «Principles of Solar Shading», Canadian Building Digest
 *   CBD-59, National Research Council Canada, noviembre de 1964.** Define los
 *   dos ángulos y da la ecuación. Textual: *«The vertical shadow angle (V.S.A.)
 *   is the angle, on a vertical section drawing of the wall, between a line
 *   perpendicular to the wall and the projection of the sun's rays on the plane
 *   of the drawing»*; *«The horizontal shadow angle (H.S.A.) is the angle on a
 *   plan drawing between a line perpendicular to the wall and the projection of
 *   the sun's rays on the horizontal plane»*; y la relación
 *   *«Tan V.S.A. = Tan Altitude Angle / Cos H.S.A.»*.
 *
 * · **UN-Habitat, «Sun shading catalogue — Adequate shading: Sizing overhangs
 *   and fins», Promoting Energy Efficiency in Buildings in East Africa, 2018.**
 *   El procedimiento de cuatro pasos (determinar el período sobrecalentado →
 *   leer azimut y altura → obtener HSA y VSA → dimensionar), el factor de
 *   proyección como profundidad sobre alto de la abertura, y las tablas de seis
 *   localidades entre 0° y 10° S que este módulo reproduce. También la
 *   advertencia de que al este y al oeste los ángulos de corte son bajos y el
 *   alero único resultante puede no ser construible, y que la solución son
 *   celosías u ojos de buey manteniendo el mismo ángulo de corte.
 *
 * · **Brager, G.S. & de Dear, R., «Climate, Comfort & Natural Ventilation: A new
 *   adaptive comfort standard for ASHRAE Standard 55», Proceedings: Moving
 *   Thermal Comfort Standards into the 21st Century, Oxford Brookes University,
 *   Windsor, abril de 2001.** De acá sale el umbral del período sobrecalentado:
 *   *«Tcomf = 0.31 x Ta,out + 17.8 (deg C)»*, con *«a mean comfort zone band of
 *   5 °C for 90% acceptability, and 7 °C for 80% acceptability, both centered on
 *   the optimum comfort temperature»*, sobre 21.000 encuestas en 160 edificios.
 *   Vale para edificios de ventilación natural —*«applicable for naturally
 *   ventilated buildings»*—, que es el caso de una vivienda rural sin equipo.
 *
 * · **Jacobson, M.Z. & Jadhav, V., «World estimates of PV optimal tilt angles
 *   and ratios of sunlight incident upon tilted and tracked PV panels relative
 *   to horizontal panels», Solar Energy 169 (2018) 55-66.** Inclinación de
 *   panel: el polinomio de tercer grado sobre los datos de PVWatts, la
 *   recta de Chang (2009) que el mismo paper grafica, y la regla de lluvia:
 *   *«Indicates the optimal tilt angle is between +/-10°, thus panels will
 *   likely be tilted in practice either +10° for positive values or -10° for
 *   negative values to allow for rain to naturally wash them»*.
 *
 * · **Duffie, J.A. & Beckman, W.A., «Solar Engineering of Thermal Processes»**,
 *   para la conversión hora de reloj → hora solar y la ecuación del tiempo de
 *   Spencer (1971), que acá se calcula para poder decir cuánto vale y se deja
 *   fuera del dimensionamiento a propósito (ver punto 3 arriba).
 *
 * · **Cooper, P.I. (1969)**, la declinación, que viene de `arco_solar.ts` para
 *   que el alero y el arco dibujado en el mapa usen la misma efemérides.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RANGO DE VALIDEZ
 *
 * · Alero **horizontal, continuo y de ancho suficiente**: el VSA sólo describe
 *   lo que tapa un borde paralelo a la fachada. Si el alero no sobresale a los
 *   costados de la abertura, el sol entra de flanco y la sombra calculada acá es
 *   optimista; la fuente dimensiona ese ancho con el HSA y ese número también se
 *   publica (`aletaDeUnaPared`).
 * · **Sombra geométrica del sol directo.** No hay difusa, no hay reflejo del
 *   piso ni de una pared vecina, y no hay obstrucción del horizonte. En un
 *   predio con monte alto al norte el alero puede sobrar; eso lo ve el viewshed,
 *   no este módulo.
 * · **Aberturas verticales.** Un techo vidriado o una ventana inclinada no se
 *   resuelven con VSA.
 * · El criterio adaptativo vale con la temperatura media mensual exterior entre
 *   **5 y 35 °C** (eje de la figura 3 de la fuente) y para edificios de
 *   ventilación natural. Fuera de eso el período sobrecalentado se devuelve con
 *   advertencia.
 * · La declinación de Cooper tiene un error de hasta 0,5°, y la posición del
 *   meridiano estándar se asume la nominal del huso (`round(lng/15)·15`), que en
 *   varios países **no es la legal**. Las dos cosas se publican en la salida.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * QUIÉN LO LEE
 *
 * `components/AleroBloque.tsx`, dentro del panel solar. Nada de esto entra
 * todavía al informe. `inclinacionPanel` **reemplaza** el `|lat| + 12` sin
 * fuente que `solar.ts` publicaba como «ángulo óptimo».
 */

import { declinacion, posicionSolar } from './arco_solar';

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

// ── Fuentes ───────────────────────────────────────────────────────────────────

export const FUENTE_CBD59 =
  'Stephenson, D.G., «Principles of Solar Shading», Canadian Building Digest CBD-59, National Research Council Canada, 1964';

export const FUENTE_UNHABITAT =
  'UN-Habitat, «Sun shading catalogue — Adequate shading: Sizing overhangs and fins», Promoting Energy Efficiency in Buildings in East Africa, 2018';

export const FUENTE_ADAPTATIVO =
  'Brager, G.S. & de Dear, R., «Climate, Comfort & Natural Ventilation: A new adaptive comfort standard for ASHRAE Standard 55», Windsor, 2001 (ASHRAE RP-884)';

export const FUENTE_JACOBSON =
  'Jacobson, M.Z. & Jadhav, V., «World estimates of PV optimal tilt angles…», Solar Energy 169 (2018) 55-66';

export const FUENTE_CHANG =
  'Chang, Y.-P. (2009), recta de inclinación óptima, tal como la grafica Jacobson & Jadhav (2018), fig. 1';

export const FUENTE_DUFFIE =
  'Duffie, J.A. & Beckman, W.A., «Solar Engineering of Thermal Processes»: hora solar y ecuación del tiempo (Spencer, 1971)';

export const FUENTE_COOPER =
  'Cooper, P.I. (1969), declinación solar, vía lib/arco_solar.ts';

// ── Constantes publicadas ─────────────────────────────────────────────────────

/** Pendiente y constante de la recta de confort adaptativo (ec. 1 de la fuente). */
export const ADAPTATIVO_PENDIENTE = 0.31;
export const ADAPTATIVO_CONSTANTE_C = 17.8;

/** Anchos de banda de aceptabilidad, CENTRADOS en Tcomf: 5 °C al 90 %, 7 °C al 80 %. */
export const BANDA_90_C = 5;
export const BANDA_80_C = 7;

/** Rango de temperatura media mensual exterior donde el modelo adaptativo vale. */
export const ADAPTATIVO_RANGO_C: readonly [number, number] = [5, 35];

/**
 * Ventana horaria por defecto: la del ejercicio de UN-Habitat, «all the months
 * between 9 AM and 4 PM», en hora de RELOJ. Se deja en reloj y no en hora solar
 * porque es así como la fuente la define y como se reproducen sus tablas; el
 * desfase respecto del sol se calcula y se muestra aparte.
 */
export const VENTANA_POR_DEFECTO: readonly [number, number] = [9, 16];

/** Oblicuidad de la eclíptica: el borde de los trópicos. */
export const OBLICUIDAD_C = 23.45;

/** Debajo de esta inclinación el panel no se lava con la lluvia (Jacobson & Jadhav). */
export const INCLINACION_MIN_LLUVIA = 10;

/** Paso temporal del barrido. 5 min: el VSA crítico cae en un instante angosto. */
export const PASO_MIN = 5;

/**
 * Tolerancia para decir que el corte lo decidió «el mediodía»: un ángulo
 * horario de 15° es una hora de movimiento del sol. No es un umbral de
 * desempeño, es la unidad en la que se lee un reloj solar.
 */
export const HSA_MEDIODIA = 15;

export const MESES_NOMBRE = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
] as const;

/** Día del año del centro de cada mes, igual que en `solar.ts`. */
export const DOY_MEDIO = [17, 47, 75, 105, 135, 162, 198, 228, 259, 289, 319, 345] as const;

const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** Día del año del primer día de cada mes (año no bisiesto). */
const DOY_INICIO: readonly number[] = (() => {
  const out: number[] = [];
  let acc = 1;
  for (const d of DIAS_MES) { out.push(acc); acc += d; }
  return out;
})();

/** Solsticios: doy 172 (junio) y 355 (diciembre), los mismos que `arco_solar.ts`. */
export const DOY_SOLSTICIOS: readonly [number, number] = [172, 355];

/**
 * Las dieciséis orientaciones de la tabla publicada, con el azimut de la NORMAL
 * EXTERIOR de la pared: 0 = la pared mira al norte, 90 = al este.
 */
export const ORIENTACIONES: readonly { nombre: string; corto: string; az: number }[] = [
  { nombre: 'Norte',           corto: 'N',   az: 0 },
  { nombre: 'Nornordeste',     corto: 'NNE', az: 22.5 },
  { nombre: 'Noreste',         corto: 'NE',  az: 45 },
  { nombre: 'Estenordeste',    corto: 'ENE', az: 67.5 },
  { nombre: 'Este',            corto: 'E',   az: 90 },
  { nombre: 'Estesudeste',     corto: 'ESE', az: 112.5 },
  { nombre: 'Sudeste',         corto: 'SE',  az: 135 },
  { nombre: 'Sudsudeste',      corto: 'SSE', az: 157.5 },
  { nombre: 'Sur',             corto: 'S',   az: 180 },
  { nombre: 'Sudsudoeste',     corto: 'SSO', az: 202.5 },
  { nombre: 'Sudoeste',        corto: 'SO',  az: 225 },
  { nombre: 'Oestesudoeste',   corto: 'OSO', az: 247.5 },
  { nombre: 'Oeste',           corto: 'O',   az: 270 },
  { nombre: 'Oestenoroeste',   corto: 'ONO', az: 292.5 },
  { nombre: 'Noroeste',        corto: 'NO',  az: 315 },
  { nombre: 'Nornoroeste',     corto: 'NNO', az: 337.5 },
];

/** Lo que el alero NO resuelve, escrito para que salga en pantalla. */
export const ALERO_NO_ES_AISLACION =
  'El alero decide cuánto sol directo entra por la abertura. No decide la temperatura adentro: eso lo deciden además la masa, la aislación y la ventilación, que este cálculo no mira.';

// ── Hora solar ────────────────────────────────────────────────────────────────

/** Meridiano nominal del huso de una longitud. Puede NO ser el legal. */
export function meridianoNominal(lng: number): number {
  if (!Number.isFinite(lng)) return 0;
  return Math.round(lng / 15) * 15;
}

/**
 * Minutos que hay que sumarle al reloj para obtener la hora media local.
 *
 * Duffie & Beckman lo escriben con longitudes OESTE positivas:
 * `solar − estándar = 4(Lst − Lloc) + E`. Acá las longitudes son este-positivas
 * (la convención de la app), así que el signo queda `4(lng − meridiano)`.
 *
 * Positivo = el sol va adelantado respecto del reloj (el predio está al este de
 * su meridiano). La ecuación del tiempo NO entra: ver `ecuacionDelTiempoMin`.
 */
export function desfaseSolarMin(lng: number, meridiano?: number): number {
  if (!Number.isFinite(lng)) return 0;
  const m = meridiano ?? meridianoNominal(lng);
  return 4 * (lng - m);
}

/**
 * Ecuación del tiempo en minutos (Spencer, 1971, vía Duffie & Beckman).
 *
 * Existe para poder DECIR cuánto vale —hasta ±16 minutos— y se deja fuera del
 * dimensionamiento del alero porque las cartas solares sobre las que están
 * dibujadas las tablas publicadas están en hora media: incorporarla sube el
 * error contra esas tablas de 0,61° a 1,29°. Es un caso raro en el que sumar
 * precisión astronómica aleja del resultado publicado, y la razón es que el
 * número publicado no es astronómico sino de carta.
 */
export function ecuacionDelTiempoMin(doy: number): number {
  const B = ((doy - 1) * 360) / 365 * DEG;
  return 229.2 * (
    0.000075
    + 0.001868 * Math.cos(B)
    - 0.032077 * Math.sin(B)
    - 0.014615 * Math.cos(2 * B)
    - 0.04089 * Math.sin(2 * B)
  );
}

/** Hora solar media correspondiente a una hora de reloj. */
export function horaSolarDeReloj(reloj: number, lng: number, meridiano?: number): number {
  return reloj + desfaseSolarMin(lng, meridiano) / 60;
}

/** Hora de reloj correspondiente a una hora solar media. */
export function relojDeHoraSolar(solar: number, lng: number, meridiano?: number): number {
  return solar - desfaseSolarMin(lng, meridiano) / 60;
}

/** `13.58` → `"13:35"`. Negativo o mayor que 24 se escribe igual, sin envolver. */
export function hhmm(horaDecimal: number): string {
  const signo = horaDecimal < 0 ? '-' : '';
  const t = Math.abs(horaDecimal);
  let h = Math.floor(t);
  let m = Math.round((t - h) * 60);
  if (m === 60) { h += 1; m = 0; }
  return `${signo}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ── Los dos ángulos de sombra ─────────────────────────────────────────────────

export interface AngulosDeSombra {
  /** Ángulo de sombra vertical (°). Es lo que tapa un alero horizontal. */
  vsa: number;
  /** Ángulo de sombra horizontal (°), con signo: el azimut del sol menos el de la pared. */
  hsa: number;
  /** Coseno del ángulo de incidencia sobre la pared vertical: cos(alt)·cos(hsa). */
  cos_incidencia: number;
}

/**
 * Los dos ángulos de sombra de una posición del sol sobre una pared.
 *
 * `null` cuando el sol está detrás de la pared (|HSA| ≥ 90°) o bajo el
 * horizonte: en los dos casos no hay nada que sombrear, y devolver un número
 * sería inventar una exigencia que no existe.
 *
 * `vsa ≥ elevacion` siempre, y con igualdad sólo cuando el sol está en el plano
 * perpendicular a la fachada. Es la razón por la que la elevación del mediodía
 * no sirve para dimensionar una pared que no mira al ecuador.
 */
export function angulosDeSombra(
  elevacion_deg: number,
  azimut_deg: number,
  orientacion_deg: number,
): AngulosDeSombra | null {
  if (!Number.isFinite(elevacion_deg) || !Number.isFinite(azimut_deg)) return null;
  if (elevacion_deg <= 0) return null;
  const hsa = (((azimut_deg - orientacion_deg) % 360) + 540) % 360 - 180;
  if (Math.abs(hsa) >= 90) return null;
  const cosH = Math.cos(hsa * DEG);
  const vsa = Math.atan(Math.tan(elevacion_deg * DEG) / cosH) * RAD;
  return {
    vsa,
    hsa,
    cos_incidencia: Math.cos(elevacion_deg * DEG) * cosH,
  };
}

/**
 * Factor de proyección: profundidad del alero dividida por el alto de la
 * abertura que tiene que quedar en sombra. Es la forma adimensional de la
 * respuesta, y es la que publica la fuente.
 */
export function factorProyeccion(vsa_deg: number): number {
  return 1 / Math.tan(vsa_deg * DEG);
}

/** Profundidad del alero, en metros, para tapar `alto_m` con un corte de `vsa`. */
export function profundidadAlero(alto_m: number, vsa_deg: number): number {
  return alto_m * factorProyeccion(vsa_deg);
}

/** Ancho que el alero tiene que sobresalir al costado de la abertura (HSA). */
export function anchoAleta(ancho_m: number, hsa_deg: number): number {
  return ancho_m * Math.tan(Math.abs(hsa_deg) * DEG);
}

// ── El período sobrecalentado ─────────────────────────────────────────────────

export interface MesSobrecalentado {
  mes: number;
  nombre: string;
  tmean_c: number;
  tmax_c: number;
  /** Límite superior de aceptabilidad al 80 %: Tcomf + 3,5 °C. */
  limite_c: number;
  /** Cuánto pasa la máxima media del mes por encima del límite. */
  exceso_c: number;
  sobrecalentado: boolean;
}

export interface PeriodoSobrecalentado {
  meses: MesSobrecalentado[];
  /** Índices 0–11 de los meses que piden sombra, en orden de calendario. */
  indices: number[];
  /** El mes de mayor exceso, o `null` si ninguno pasa el límite. */
  mes_pico: number | null;
  criterio: string;
  fuente: string;
  advertencias: string[];
}

/**
 * Los meses en los que hay que dar sombra, decididos con la serie del predio.
 *
 * Criterio: el modelo adaptativo da el óptimo de confort a partir de la media
 * mensual exterior, y la banda del 80 % de aceptabilidad es de 7 °C **centrada**
 * en ese óptimo, así que el techo es `Tcomf + 3,5`. Un mes pide sombra cuando
 * su **máxima media** supera ese techo.
 *
 * Por qué la máxima y no la media: el sol entra en la mitad caliente del día, no
 * en la media del día. Comparar la media mensual contra el techo adaptativo da,
 * despejando, un umbral de 30,9 °C de media mensual —casi ningún predio del
 * mundo pide sombra con eso—, y es el mismo error de escala que ya apareció con
 * el índice de calor del ganado: la media de un día no describe su hora peor.
 *
 * Validación contra la fuente: para Garissa (media ≈ 28 °C, máxima ≈ 35 °C) este
 * criterio marca los doce meses, que es exactamente el período que UN-Habitat
 * eligió para su ejercicio en esa ciudad.
 */
export function periodoSobrecalentado(
  tmean_c: readonly number[],
  tmax_c: readonly number[],
): PeriodoSobrecalentado | null {
  if (tmean_c.length !== 12 || tmax_c.length !== 12) return null;
  if (!tmean_c.every(Number.isFinite) || !tmax_c.every(Number.isFinite)) return null;

  const advertencias: string[] = [];
  const meses: MesSobrecalentado[] = [];

  for (let i = 0; i < 12; i++) {
    const tm = tmean_c[i]!;
    const tx = tmax_c[i]!;
    const limite = ADAPTATIVO_PENDIENTE * tm + ADAPTATIVO_CONSTANTE_C + BANDA_80_C / 2;
    meses.push({
      mes: i,
      nombre: MESES_NOMBRE[i]!,
      tmean_c: tm,
      tmax_c: tx,
      limite_c: limite,
      exceso_c: tx - limite,
      sobrecalentado: tx > limite,
    });
  }

  const fuera = meses.filter(m => m.tmean_c < ADAPTATIVO_RANGO_C[0] || m.tmean_c > ADAPTATIVO_RANGO_C[1]);
  if (fuera.length > 0) {
    advertencias.push(
      `El modelo adaptativo está calibrado con medias mensuales exteriores de ${ADAPTATIVO_RANGO_C[0]} a ${ADAPTATIVO_RANGO_C[1]} °C, y ${fuera.length === 1 ? 'un mes del predio queda' : `${fuera.length} meses del predio quedan`} afuera (${fuera.map(m => m.nombre).join(', ')}). Ahí el umbral es una extrapolación.`,
    );
  }

  const indices = meses.filter(m => m.sobrecalentado).map(m => m.mes);
  if (indices.length === 0) {
    advertencias.push(
      'Ningún mes supera el techo de confort: en este predio el alero no está para tapar calor sino para no tapar el sol de invierno, y el criterio de dimensionamiento es el opuesto.',
    );
  }
  if (indices.length === 12) {
    advertencias.push(
      'Los doce meses piden sombra, así que no hay un sol de invierno que convenga dejar entrar y el alero puede ser todo lo profundo que haga falta.',
    );
  }

  let mes_pico: number | null = null;
  let peor = -Infinity;
  for (const m of meses) {
    if (m.sobrecalentado && m.exceso_c > peor) { peor = m.exceso_c; mes_pico = m.mes; }
  }

  return {
    meses,
    indices,
    mes_pico,
    criterio: `Máxima media del mes por encima de Tcomf + ${BANDA_80_C / 2} °C, con Tcomf = ${ADAPTATIVO_PENDIENTE}·Tmedia + ${ADAPTATIVO_CONSTANTE_C} °C`,
    fuente: FUENTE_ADAPTATIVO,
    advertencias,
  };
}

// ── La simetría del alero contra la asimetría del clima ───────────────────────

/** Mes al que pertenece un día del año (1–365). */
export function mesDeDoy(doy: number): number {
  const d = ((Math.round(doy) - 1) % 365 + 365) % 365 + 1;
  for (let i = 11; i >= 0; i--) if (d >= DOY_INICIO[i]!) return i;
  return 0;
}

/** `298` → `"25 de octubre"`. El mes solo esconde media estación. */
export function fechaDeDoy(doy: number): string {
  const d = ((Math.round(doy) - 1) % 365 + 365) % 365 + 1;
  const m = mesDeDoy(d);
  return `${d - DOY_INICIO[m]! + 1} de ${MESES_NOMBRE[m]}`;
}

/** Distancia circular, en días, entre dos días del año. */
function distanciaCircular(a: number, b: number): number {
  const d = Math.abs(a - b) % 365;
  return Math.min(d, 365 - d);
}

/**
 * El **gemelo solar** de un mes: el mes del otro lado del solsticio más cercano
 * en el que el sol hace el mismo recorrido.
 *
 * Un alero fijo no puede distinguirlos. Es el límite duro del dispositivo, y no
 * se arregla con más profundidad: se arregla con una parte móvil, con una
 * parra de hoja caduca o aceptando el costo.
 *
 * El gemelo del gemelo vuelve al mes de partida, salvo en los dos meses que
 * CONTIENEN un solsticio: ahí el centro del mes no está sobre el solsticio y el
 * reflejo cae en el mes de al lado. Diciembre en el sur y junio en el norte son
 * su propio gemelo, y `costoDeLaSimetria` los saltea porque un mes que se
 * refleja en sí mismo no tiene costo que medir.
 *
 * El resultado NO es "el mes de enfrente en el calendario": el gemelo de
 * febrero es octubre y no noviembre, porque lo que se espeja es la declinación
 * y el centro de febrero cae 57 días después del solsticio de diciembre.
 */
export function gemeloSolarDoy(mes: number): number {
  const doy = DOY_MEDIO[((mes % 12) + 12) % 12]!;
  const [jun, dic] = DOY_SOLSTICIOS;
  const s = distanciaCircular(doy, jun) <= distanciaCircular(doy, dic) ? jun : dic;
  return ((s + (s - doy) - 1) % 365 + 365) % 365 + 1;
}

/** El mes del gemelo solar. Ver `gemeloSolarDoy` para la fecha exacta. */
export function gemeloSolar(mes: number): number {
  return mesDeDoy(gemeloSolarDoy(mes));
}

export interface CostoDeLaSimetria {
  /** El mes sobrecalentado cuyo gemelo está más fresco. */
  mes: number;
  mes_nombre: string;
  gemelo: number;
  gemelo_nombre: string;
  /** La fecha exacta en que el sol repite el recorrido del centro del mes. */
  gemelo_fecha: string;
  tmax_mes_c: number;
  tmax_gemelo_c: number;
  /** Cuánto más fresco está el gemelo. Es lo que el alero no puede distinguir. */
  dif_c: number;
  /** El gemelo pide sombra también, y entonces no hay costo. */
  gemelo_sobrecalentado: boolean;
  nota: string;
}

/**
 * Cuánto cuesta que la geometría del sol sea simétrica y el clima no.
 *
 * Devuelve el par (mes sobrecalentado, gemelo solar) con la mayor diferencia de
 * máxima media **entre los pares cuyo gemelo NO pide sombra**: ahí el alero
 * dimensionado para el mes caliente está tapando sol en un mes que no lo pedía.
 * `null` si no hay período sobrecalentado o si todos los gemelos también lo
 * están —en ese caso el alero no tiene este problema y vale decirlo—.
 */
export function costoDeLaSimetria(p: PeriodoSobrecalentado): CostoDeLaSimetria | null {
  if (p.indices.length === 0) return null;
  let mejor: CostoDeLaSimetria | null = null;
  for (const i of p.indices) {
    const g = gemeloSolar(i);
    if (g === i) continue;                      // el mes del solsticio es su propio gemelo
    const mi = p.meses[i]!;
    const mg = p.meses[g]!;
    const dif = mi.tmax_c - mg.tmax_c;
    if (mg.sobrecalentado) continue;
    if (!mejor || dif > mejor.dif_c) {
      const fecha = fechaDeDoy(gemeloSolarDoy(i));
      mejor = {
        mes: i,
        mes_nombre: mi.nombre,
        gemelo: g,
        gemelo_nombre: mg.nombre,
        gemelo_fecha: fecha,
        tmax_mes_c: mi.tmax_c,
        tmax_gemelo_c: mg.tmax_c,
        dif_c: dif,
        gemelo_sobrecalentado: false,
        nota: `El sol repite el recorrido del medio de ${mi.nombre} el ${fecha}, así que el alero da la misma sombra los dos días. En ${mi.nombre} la máxima media es de ${mi.tmax_c.toFixed(1)} °C y en ${mg.nombre} de ${mg.tmax_c.toFixed(1)} °C: ${Math.abs(dif).toFixed(1)} °C que el alero no puede distinguir.`,
      };
    }
  }
  return mejor;
}

// ── El sol de los dos lados: trópicos ─────────────────────────────────────────

export interface SolDeLosDosLados {
  /** El predio está entre los trópicos y el sol pasa por los dos lados del cenit. */
  tropico: boolean;
  /** Días del año en que el sol del mediodía queda del lado del ecuador. */
  dias_hacia_ecuador: number;
  /** Días en que queda del lado del polo: los que la regla templada no prevé. */
  dias_hacia_polo: number;
  /** Rumbo de la pared que mira al ecuador: 'norte' o 'sur'. */
  pared_ecuador: 'norte' | 'sur';
  nota: string;
}

/**
 * Si el sol del mediodía pasa por los dos lados del cenit, y cuántos días.
 *
 * La regla templada —«ventana grande a la pared que mira al ecuador, alero
 * arriba, y de la pared del polo no te preocupes»— supone que el sol del
 * mediodía está siempre del mismo lado. Entre los trópicos eso es falso, y
 * acequia trabaja ahí: Bogotá, Puerto Rico, Bali, el Indomalayo.
 *
 * El dato que cierra el argumento no es este conteo sino el factor de
 * proyección de la pared del polo, que `aleroPorOrientacion` calcula: en el
 * ejercicio publicado de Garissa (0,46° S) la pared sur pide 0,67 y la norte
 * 0,70 —prácticamente el mismo alero en las dos—, porque incluso los días en
 * que el sol del mediodía está al norte el sol de la mañana y de la tarde entra
 * igual por la pared sur.
 */
export function solDeLosDosLados(lat: number): SolDeLosDosLados | null {
  if (!Number.isFinite(lat)) return null;
  let haciaPolo = 0;
  for (let doy = 1; doy <= 365; doy++) {
    const d = declinacion(doy) * RAD;
    // Al mediodía solar el sol está al NORTE del cenit si la declinación es
    // mayor que la latitud. "Del lado del polo" es entonces al norte en el
    // hemisferio norte (δ > φ) y al sur en el hemisferio sur (δ < φ).
    if (lat >= 0 ? d > lat : d < lat) haciaPolo++;
  }
  const tropico = Math.abs(lat) < OBLICUIDAD_C;
  const pared_ecuador: 'norte' | 'sur' = lat < 0 ? 'norte' : 'sur';
  const haciaEcuador = 365 - haciaPolo;
  return {
    tropico,
    dias_hacia_ecuador: haciaEcuador,
    dias_hacia_polo: haciaPolo,
    pared_ecuador,
    nota: tropico
      ? `El sol del mediodía queda ${haciaPolo} días del año del lado del ${pared_ecuador === 'norte' ? 'sur' : 'norte'}, así que la pared que mira al ${pared_ecuador === 'norte' ? 'sur' : 'norte'} también recibe sol alto y también necesita alero.`
      : `El sol del mediodía queda siempre del lado del ${pared_ecuador}: la pared del ${pared_ecuador === 'norte' ? 'sur' : 'norte'} nunca lo recibe al mediodía, pero sí de mañana y de tarde.`,
  };
}

// ── El alero de una pared ─────────────────────────────────────────────────────

export interface MomentoCritico {
  mes: number;
  mes_nombre: string;
  doy: number;
  hora_solar: number;
  hora_reloj: number;
  elevacion: number;
  azimut: number;
  hsa: number;
  vsa: number;
  /** cos de la incidencia sobre la pared en ese instante: cuánta intensidad trae. */
  cos_incidencia: number;
}

export interface OpcionesAlero {
  /** Meses a sombrear (0–11). Por defecto: los doce. */
  meses?: readonly number[];
  /** Ventana horaria de RELOJ. Por defecto 9–16 (UN-Habitat). */
  ventana?: readonly [number, number];
  /** Meridiano estándar del huso, si el legal no es el nominal. */
  meridiano?: number;
  /** Paso del barrido en minutos. Por defecto 5. */
  paso_min?: number;
}

export interface AleroDePared {
  orientacion_deg: number;
  /** Ángulo de corte: el VSA mínimo del período. Debajo de él entra sol. */
  vsa_corte: number;
  /** Profundidad sobre alto de la abertura. */
  pf: number;
  /** Profundidad en metros para el alto pedido. */
  profundidad_m: number;
  /** El instante que fija el corte. Es el que hay que mirar si el número sorprende. */
  critico: MomentoCritico;
  /** Instantes evaluados con sol sobre la pared. */
  muestras: number;
  /** El alero sale más profundo que el alto de la abertura (PF > 1). */
  mas_profundo_que_alto: boolean;
/**
   * El corte lo decide el sol del mediodía solar, dentro de una hora.
   *
   * Es la pregunta que decide si el enunciado de la etapa servía. Cuando es
   * `true`, «la latitud y la altura del mediodía» alcanzan para dimensionar esa
   * pared; cuando es `false`, no, y el número sale de un sol de costado que
   * ninguna fórmula de latitud ve.
   *
   * Dónde pasa cada cosa es un resultado y no una intuición. En Buenos Aires la
   * pared al norte se decide en el mediodía solar, con el sol de frente. En
   * Mtwara —10° de latitud— la misma pared se decide con el sol de las 16 a 57°
   * del eje, porque ahí el sol sube casi vertical y a media tarde sigue alto
   * mientras el azimut ya se fue lejos.
   */
  decidido_al_mediodia: boolean;
  advertencias: string[];
}

/**
 * El alero que una pared necesita: el VSA mínimo del período sobrecalentado.
 *
 * El corte es el **mínimo** porque un alero que tapa el sol más bajo del período
 * tapa todos los demás. Eso también explica por qué el número es sensible: el
 * mínimo cae casi siempre en un instante rasante, donde el sol apenas roza la
 * fachada y `1/tan(VSA)` crece rápido. Por eso se publica el instante crítico y
 * el coseno de incidencia que traía: con esos dos datos se puede decidir si vale
 * la pena el último tramo de alero, y es una decisión de quien diseña, no del
 * cálculo.
 */
export function aleroDeUnaPared(
  lat: number,
  lng: number,
  orientacion_deg: number,
  alto_m: number,
  opciones: OpcionesAlero = {},
): AleroDePared | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(orientacion_deg)) return null;
  if (!Number.isFinite(alto_m) || alto_m <= 0) return null;

  const meses = opciones.meses && opciones.meses.length > 0
    ? opciones.meses.filter(m => Number.isInteger(m) && m >= 0 && m <= 11)
    : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  if (meses.length === 0) return null;

  const [h0, h1] = opciones.ventana ?? VENTANA_POR_DEFECTO;
  if (!Number.isFinite(h0) || !Number.isFinite(h1) || h1 <= h0) return null;
  const paso = (opciones.paso_min ?? PASO_MIN) / 60;
  const desfase = desfaseSolarMin(lng, opciones.meridiano) / 60;

  let critico: MomentoCritico | null = null;
  let muestras = 0;

  for (const mes of meses) {
    const d0 = DOY_INICIO[mes]!;
    const dias = DIAS_MES[mes]!;
    for (let k = 0; k < dias; k++) {
      const doy = d0 + k;
      for (let reloj = h0; reloj <= h1 + 1e-9; reloj += paso) {
        const solar = reloj + desfase;
        const pos = posicionSolar(lat, doy, solar);
        if (!pos) continue;
        const ang = angulosDeSombra(pos.elevacion, pos.azimut, orientacion_deg);
        if (!ang) continue;
        muestras++;
        if (!critico || ang.vsa < critico.vsa) {
          critico = {
            mes,
            mes_nombre: MESES_NOMBRE[mes]!,
            doy,
            hora_solar: solar,
            hora_reloj: reloj,
            elevacion: pos.elevacion,
            azimut: pos.azimut,
            hsa: ang.hsa,
            vsa: ang.vsa,
            cos_incidencia: ang.cos_incidencia,
          };
        }
      }
    }
  }

  if (!critico) return null;

  const pf = factorProyeccion(critico.vsa);
  const advertencias: string[] = [];

  const alMediodia = Math.abs(critico.hsa) <= HSA_MEDIODIA;
  if (!alMediodia) {
    // `cos(hsa)` es la fracción de intensidad que ese sol trae respecto de lo
    // que traería de frente. No se usa `cos_incidencia`, que incluye el coseno
    // de la elevación y por lo tanto es baja también con el sol alto y de
    // frente: no mide estar de costado, mide ser una pared vertical.
    const frente = Math.cos(critico.hsa * DEG);
    advertencias.push(
      `El corte no lo decide el mediodía sino el sol de las ${hhmm(critico.hora_reloj)}, a ${Math.abs(critico.hsa).toFixed(0)}° del eje de la pared, que trae el ${(frente * 100).toFixed(0)} % de la intensidad que tendría de frente. Un alero dimensionado con la altura del mediodía no cubre ese rato.`,
    );
  }
  if (pf > 1) {
    advertencias.push(
      'El alero sale más profundo que el alto de la abertura. La fuente resuelve estos casos con celosías u ojos de buey que mantienen el mismo ángulo de corte en varias piezas chicas, en vez de una sola pieza voladiza.',
    );
  }

  return {
    orientacion_deg,
    vsa_corte: critico.vsa,
    pf,
    profundidad_m: alto_m * pf,
    critico,
    muestras,
    mas_profundo_que_alto: pf > 1,
    decidido_al_mediodia: alMediodia,
    advertencias,
  };
}

export interface FilaOrientacion {
  nombre: string;
  corto: string;
  az: number;
  vsa_corte: number;
  pf: number;
  profundidad_m: number;
  mes_critico: string;
  hora_critica: string;
  decidido_al_mediodia: boolean;
}

export interface AleroPorOrientacion {
  filas: FilaOrientacion[];
  /** La orientación que pide el alero más profundo. */
  peor: FilaOrientacion;
  /** La que pide el más chico. */
  mejor: FilaOrientacion;
  /** Cuántas veces más profundo es el peor que el mejor. */
  factor: number;
  desfase_min: number;
  meridiano: number;
  mediodia_reloj: string;
}

/**
 * La tabla de las dieciséis orientaciones, que es la forma en que la fuente
 * publica la respuesta y la única manera de ver de un saque que la pared al
 * oeste es el problema y no la que mira al ecuador.
 */
export function aleroPorOrientacion(
  lat: number,
  lng: number,
  alto_m: number,
  opciones: OpcionesAlero = {},
): AleroPorOrientacion | null {
  const filas: FilaOrientacion[] = [];
  for (const o of ORIENTACIONES) {
    const a = aleroDeUnaPared(lat, lng, o.az, alto_m, opciones);
    if (!a) continue;
    filas.push({
      nombre: o.nombre,
      corto: o.corto,
      az: o.az,
      vsa_corte: a.vsa_corte,
      pf: a.pf,
      profundidad_m: a.profundidad_m,
      mes_critico: a.critico.mes_nombre,
      hora_critica: hhmm(a.critico.hora_reloj),
      decidido_al_mediodia: a.decidido_al_mediodia,
    });
  }
  if (filas.length === 0) return null;

  let peor = filas[0]!;
  let mejor = filas[0]!;
  for (const f of filas) {
    if (f.pf > peor.pf) peor = f;
    if (f.pf < mejor.pf) mejor = f;
  }
  const meridiano = opciones.meridiano ?? meridianoNominal(lng);
  const desfase = desfaseSolarMin(lng, meridiano);

  return {
    filas,
    peor,
    mejor,
    factor: mejor.pf > 0 ? peor.pf / mejor.pf : 0,
    desfase_min: desfase,
    meridiano,
    mediodia_reloj: hhmm(relojDeHoraSolar(12, lng, meridiano)),
  };
}

// ── Qué hace un alero que ya existe ───────────────────────────────────────────

export interface DesempenoAlero {
  profundidad_m: number;
  alto_m: number;
  pf: number;
  /** Fracción del alto de la abertura que queda en sombra, promediada en el período. */
  sombra_media_pct: number;
  /**
   * Fracción del sol DIRECTO del período que el alero bloquea, pesando cada
   * instante por el coseno de incidencia. Es el número que importa: tapar un sol
   * rasante aporta poco, y este promedio lo refleja y el otro no.
   */
  sombra_pesada_pct: number;
  /** Instantes del período con sol sobre la pared y la abertura sin tapar del todo. */
  horas_con_sol: number;
  nota: string;
}

/**
 * Qué hace un alero de profundidad dada, en vez de cuál haría falta.
 *
 * Existe porque la mayoría de los predios tienen la casa construida: la
 * pregunta real no es «cuánto alero» sino «qué me está haciendo el que tengo».
 */
export function desempenoAlero(
  lat: number,
  lng: number,
  orientacion_deg: number,
  alto_m: number,
  profundidad_m: number,
  opciones: OpcionesAlero = {},
): DesempenoAlero | null {
  if (!Number.isFinite(alto_m) || alto_m <= 0) return null;
  if (!Number.isFinite(profundidad_m) || profundidad_m < 0) return null;

  const meses = opciones.meses && opciones.meses.length > 0
    ? opciones.meses.filter(m => Number.isInteger(m) && m >= 0 && m <= 11)
    : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  if (meses.length === 0) return null;

  const [h0, h1] = opciones.ventana ?? VENTANA_POR_DEFECTO;
  const paso = (opciones.paso_min ?? PASO_MIN) / 60;
  const desfase = desfaseSolarMin(lng, opciones.meridiano) / 60;

  let n = 0;
  let sumaSombra = 0;
  let sumaPeso = 0;
  let sumaSombraPesada = 0;

  for (const mes of meses) {
    const d0 = DOY_INICIO[mes]!;
    for (let k = 0; k < DIAS_MES[mes]!; k++) {
      const doy = d0 + k;
      for (let reloj = h0; reloj <= h1 + 1e-9; reloj += paso) {
        const pos = posicionSolar(lat, doy, reloj + desfase);
        if (!pos) continue;
        const ang = angulosDeSombra(pos.elevacion, pos.azimut, orientacion_deg);
        if (!ang) continue;
        // Caída de la sombra por debajo del alero, acotada al alto de la abertura.
        const caida = profundidad_m * Math.tan(ang.vsa * DEG);
        const frac = Math.max(0, Math.min(1, caida / alto_m));
        n++;
        sumaSombra += frac;
        const peso = Math.max(0, ang.cos_incidencia);
        sumaPeso += peso;
        sumaSombraPesada += peso * frac;
      }
    }
  }

  if (n === 0) return null;
  const pct = (sumaSombra / n) * 100;
  const pctPesado = sumaPeso > 0 ? (sumaSombraPesada / sumaPeso) * 100 : 0;

  return {
    profundidad_m,
    alto_m,
    pf: profundidad_m / alto_m,
    sombra_media_pct: pct,
    sombra_pesada_pct: pctPesado,
    horas_con_sol: (n * paso) / meses.length,
    nota: `Pesando por la intensidad con que llega el sol, este alero bloquea el ${pctPesado.toFixed(0)} % del sol directo del período. Sin pesar, la cuenta da ${pct.toFixed(0)} %: la diferencia es el sol rasante, que tapa fácil y calienta poco.`,
  };
}

// ── Inclinación de panel: reemplaza el |lat| + 12 sin fuente ──────────────────

export interface InclinacionPanel {
  /** Grados desde la horizontal, ya con el piso de lluvia aplicado. */
  grados: number;
  /** Lo que da el polinomio antes del piso, para poder ver si hubo piso. */
  grados_crudos: number;
  /** La recta de Chang (2009) sobre los mismos datos, para contraste. */
  grados_lineal: number;
  /** Lo que la app publicaba antes: |lat| + 12, sin fuente. */
  grados_regla_vieja: number;
  orientacion: 'norte' | 'sur';
  /** Se aplicó el piso de 10° para que la lluvia lave el panel. */
  piso_de_lluvia: boolean;
  fuente: string;
  advertencias: string[];
}

/**
 * Inclinación de un panel fijo para el máximo ANUAL, con fuente.
 *
 * Lo que había era `|lat| + 12`, declarado «regla general» y sin cita. Esa
 * familia de reglas —latitud más diez o quince— es la de optimizar el
 * **invierno**, no el año: el año pesa más en el semestre luminoso y el óptimo
 * anual queda por DEBAJO de la latitud, no por encima. En Buenos Aires la regla
 * vieja da 47° y el valor publicado por PVWatts es 30°.
 *
 * Y hay un límite que ninguna fórmula de latitud puede pasar: Jacobson & Jadhav
 * encuentran que Calgary (51,12° N) tiene su óptimo en 45° y Beek (50,92° N) en
 * 34°, misma latitud y once grados de diferencia, por nubosidad y aerosoles. Así
 * que esto es una estimación de arranque y el módulo lo dice, en vez de llamarla
 * «óptima».
 */
export function inclinacionPanel(lat: number): InclinacionPanel | null {
  if (!Number.isFinite(lat) || Math.abs(lat) > 90) return null;

  const norte = lat >= 0;
  // Polinomios de tercer grado de Jacobson & Jadhav (2018), fig. 1, en Horner.
  const crudo = norte
    ? 1.3793 + lat * (1.2011 + lat * (-0.014404 + 0.000080509 * lat))
    : -0.41657 + lat * (1.4216 + lat * (0.024051 + 0.00021828 * lat));
  const lineal = norte ? 2.14 + 0.764 * lat : -2.14 + 0.764 * lat;

  const mag = Math.abs(crudo);
  const piso = mag < INCLINACION_MIN_LLUVIA;
  const advertencias: string[] = [];

  if (piso) {
    advertencias.push(
      `El óptimo anual cae en ${mag.toFixed(1)}°, casi plano. Se lleva a ${INCLINACION_MIN_LLUVIA}° porque un panel más acostado no se lava con la lluvia y el polvo cuesta más que los grados.`,
    );
  }
  advertencias.push(
    'Es una estimación por latitud. Dos ciudades a la misma latitud pueden tener óptimos separados por once grados según la nubosidad: Calgary 45° y Beek 34°, los dos a 51° N. Para una instalación conviene correr el cálculo del sitio.',
  );
  if (Math.abs(lat) > 65) {
    advertencias.push('Por encima de 65° de latitud el ajuste publicado tiene pocos puntos y el óptimo depende más del clima que de la geometría.');
  }

  return {
    grados: piso ? INCLINACION_MIN_LLUVIA : mag,
    grados_crudos: mag,
    grados_lineal: Math.abs(lineal),
    grados_regla_vieja: Math.abs(lat) + 12,
    orientacion: norte ? 'sur' : 'norte',
    piso_de_lluvia: piso,
    fuente: FUENTE_JACOBSON,
    advertencias,
  };
}

// ── Todo junto ────────────────────────────────────────────────────────────────

export interface ControlSolar {
  lat: number;
  lng: number;
  alto_m: number;
  periodo: PeriodoSobrecalentado;
  simetria: CostoDeLaSimetria | null;
  dosLados: SolDeLosDosLados;
  tabla: AleroPorOrientacion;
  panel: InclinacionPanel;
  /** La misma tabla corrida con los doce meses, para ver qué aportó el clima. */
  tabla_todo_el_anio: AleroPorOrientacion | null;
  /**
   * Lo que cuesta dimensionar el alero para los doce meses en vez de para el
   * período sobrecalentado, en la pared que mira al ecuador. En Buenos Aires el
   * factor es mayor que 7: el año entero incluye el sol rasante de junio, que
   * es justamente el que se quiere dejar entrar.
   */
  costo_del_anio_entero: { pf_periodo: number; pf_anio: number; factor: number } | null;
  fuentes: string[];
  advertencias: string[];
}

/**
 * El control solar de las aberturas del predio, de una.
 *
 * `null` sólo si falta el clima o la latitud: es un cálculo que no se puede
 * degradar a «promedio regional» porque no hay promedio posible de una
 * geometría.
 */
export function controlSolar(
  lat: number,
  lng: number,
  tmean_c: readonly number[],
  tmax_c: readonly number[],
  alto_m = 1.5,
  opciones: OpcionesAlero = {},
): ControlSolar | null {
  const periodo = periodoSobrecalentado(tmean_c, tmax_c);
  if (!periodo) return null;
  const dosLados = solDeLosDosLados(lat);
  if (!dosLados) return null;
  const panel = inclinacionPanel(lat);
  if (!panel) return null;

  const meses = periodo.indices.length > 0 ? periodo.indices : undefined;
  const tabla = aleroPorOrientacion(lat, lng, alto_m, { ...opciones, meses });
  if (!tabla) return null;
  const todo = periodo.indices.length > 0 && periodo.indices.length < 12
    ? aleroPorOrientacion(lat, lng, alto_m, { ...opciones, meses: undefined })
    : null;

  const advertencias = [...periodo.advertencias];
  if (Math.abs(tabla.desfase_min) >= 30) {
    advertencias.push(
      `El mediodía solar cae a las ${tabla.mediodia_reloj} del reloj nominal del huso: ${Math.abs(tabla.desfase_min).toFixed(0)} minutos de corrimiento. La ventana de 9 a 16 no está centrada en el sol, y eso mueve qué pared manda.`,
    );
  }
  advertencias.push(
    'El meridiano del huso se asume el nominal de la longitud. Varios países usan otro por ley —la Argentina entre ellos—, y en ese caso hay que pasarlo a mano.',
  );

  const azEcuador = lat < 0 ? 0 : 180;
  const filaPeriodo = tabla.filas.find(f => f.az === azEcuador) ?? null;
  const filaAnio = todo?.filas.find(f => f.az === azEcuador) ?? null;
  const costo_del_anio_entero = filaPeriodo && filaAnio && filaPeriodo.pf > 0
    ? { pf_periodo: filaPeriodo.pf, pf_anio: filaAnio.pf, factor: filaAnio.pf / filaPeriodo.pf }
    : null;

  return {
    lat, lng, alto_m,
    periodo,
    simetria: costoDeLaSimetria(periodo),
    dosLados,
    tabla,
    panel,
    tabla_todo_el_anio: todo,
    costo_del_anio_entero,
    fuentes: [FUENTE_CBD59, FUENTE_UNHABITAT, FUENTE_ADAPTATIVO, FUENTE_JACOBSON, FUENTE_CHANG, FUENTE_DUFFIE, FUENTE_COOPER],
    advertencias,
  };
}
