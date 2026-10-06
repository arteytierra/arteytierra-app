/**
 * Bioconstrucción: qué técnica de tierra o de paja admite el clima del predio,
 * y con qué condición.
 *
 * ── La premisa del enunciado, otra vez corrida ───────────────────────────────
 *
 * La etapa H pedía «qué técnica es razonable en cada clima de Köppen». Se
 * leyeron los códigos que de verdad regulan estas técnicas —el apéndice de
 * fardo de paja y el de cob del IRC, y el código de materiales de tierra de
 * Nuevo México, que son los publicados— y **ninguno** condiciona nada a una
 * clase de Köppen. Condicionan a otras cinco cosas:
 *
 * 1. la **categoría de diseño sísmico** (cob: A, B y C solamente; tierra: la
 *    altura del muro sale de una tabla de espesor × `Sds`),
 * 2. la **zona climática del IECC** (el fardo de paja pide barrera de vapor
 *    clase III del lado interior en las zonas 5, 6, 7, 8 y Marina 4),
 * 3. los **ciclos de hielo y deshielo** (el adobe quemado se desaconseja «in
 *    climate zones with daily freeze-thaw cycles»),
 * 4. la **zona inundable** (prohibido por debajo de la cota de diseño),
 * 5. la **exposición a la lluvia batiente** (el cob expuesto a lluvia tiene que
 *    revestirse; el revoque de arcilla expuesto a lluvia pide terminación de
 *    cal).
 *
 * Köppen no es ninguna de las cinco, y eso no es un detalle de vocabulario: la
 * zona del IECC y la clase de Köppen se construyen con criterios distintos y
 * **no son función una de la otra**. El caso más limpio está en la aridez, y se
 * demuestra con aritmética en vez de con ejemplos: las dos líneas coinciden
 * exactamente cuando la lluvia está repartida en el año y se separan exactamente
 * 140 mm cuando es estacional, con el signo de la discrepancia dado por la
 * estación en que llueve. Ver `comparacionAridez`.
 *
 * De las cinco, acequia puede calcular tres: la zona del IECC, los ciclos de
 * hielo-deshielo y la lluvia batiente. Las otras dos **no**, y el módulo lo dice
 * con nombre y apellido en vez de rellenarlas.
 *
 * ── Las fuentes ──────────────────────────────────────────────────────────────
 *
 * 1. **14.7.4 NMAC, «New Mexico Earthen Building Materials Code»**, State of
 *    New Mexico, Regulation and Licensing Department (texto integrado,
 *    enmendado 14/07/2023). Es el código de materiales de tierra con más
 *    recorrido y de acceso libre. Textual: «The test required is that a dried
 *    four inch cube cut from a sample unit shall not gain more than two and a
 *    half percent in weight when placed upon a constantly water-saturated
 *    porous surface for seven days. An adobe unit that meets this specification
 *    shall be considered "stabilized."»; «Exterior walls constructed of
 *    stabilized mortar and adobe requires no additional protection. Cement
 *    stucco or other waterproof coating is not required.»; «Use of unstabilized
 *    adobes is prohibited within four inches of the finished floor grade.»;
 *    sobre el adobe quemado, «This type of adobe is not generally dense enough
 *    to be "frost-proof" and may deteriorate with seasonal freeze-thaw cycles.
 *    Its use for exterior locations is discouraged in climate zones with daily
 *    freeze-thaw cycles.»; «Exterior rammed earth walls shall be a minimum of 18
 *    inches in thickness. Exception: Exterior walls that are also designed as
 *    solar mass walls (trombe) (…) shall be minimum thickness of 10 inches»;
 *    «Unstabilized rammed earth walls must be covered to prevent infiltration of
 *    moisture from the top of the wall at the end of each workday and prior to
 *    wet weather conditions.»; «Fully stabilized rammed earth walls may be left
 *    unprotected from the elements.»; y la tabla 1, «Allowable wall heights for
 *    earthen structures», por espesor y por `Sds`.
 *
 * 2. **IRC, Appendix S / AS «Strawbale Construction»** (texto del IRC 2015,
 *    renumerado AS en el IRC 2021). Textual: «The moisture content of bales at
 *    the time of application of the first coat of plaster or the installation of
 *    another finish shall not exceed 20 percent of the weight of the bale.»;
 *    «Bales shall have a dry density of not less than 6.5 pounds per cubic foot
 *    (104 kg/cubic meter).»; «Class I and II vapor retarders shall not be used
 *    on a strawbale wall, nor shall any other material be used that has a vapor
 *    permeance rating of less than 3 perms»; «Wall finishes shall have an
 *    equivalent vapor permeance rating of a Class III vapor retarder on the
 *    interior side of exterior strawbale walls in Climate Zones 5, 6, 7, 8 and
 *    Marine 4»; «Bales shall be separated from earth by not less than 8 inches
 *    (203 mm).»; «Clay plaster, where exposed to rain, shall be finished with
 *    lime wash, lime plaster» y «Portland cement shall not be permitted as a
 *    finish coat»; y las superficies horizontales expuestas, «sloped not less
 *    than 1 unit vertical in 12 units horizontal (8-percent slope)».
 *
 * 3. **IRC 2021, Appendix AU «Cob Construction (Monolithic Adobe)»**. Un piso,
 *    altura de edificio no mayor a 20 pies (6.096 mm), «limited to use in
 *    Seismic Design Categories A, B and C, except where an approved design (…)
 *    is provided», espesor «not less than 10 inches (254 mm), not greater than
 *    24 inches (610 mm) at the top two-thirds», los muros expuestos a lluvia
 *    «shall be finished or clad to provide protection from excessive erosion», y
 *    «vapor permeance of the combination of finish materials shall be 5 perms or
 *    greater to allow the transpiration of water vapor from the wall».
 *
 * 4. **International Energy Conservation Code, definición de zonas climáticas
 *    internacionales** (tabla R301.3(2)/C301.3(2); la misma de ASHRAE 169).
 *    Textual: Marina (C) son las localidades que cumplen las cuatro
 *    condiciones, entre ellas «dry season in summer. The month with the heaviest
 *    precipitation in the cold season has at least three times as much
 *    precipitation as the month with the least precipitation in the rest of the
 *    year. The cold season is October through March in the Northern Hemisphere
 *    and April through September in the Southern Hemisphere»; seca (B) es «Not
 *    marine and Pin < 0.44 × (TF − 19.5) [Pcm < 2.0 × (TC + 7) in SI units]»; y
 *    húmeda (A) son «Locations that are not Marine (C) or Dry (B)».
 *
 * 5. **Lacy, R.E., índice de lluvia batiente**, vía **Met Éireann,
 *    Climatological Note No. 13, «Distribution of Driving Rain»**. Textual: «The
 *    Driving Rain Index is the product of the Average Annual Rainfall and the
 *    Average Annual Windspeed». La escalera de exposición —resguardado,
 *    moderado, alto, severo— está en la literatura que cita a Lacy (1977) con
 *    cortes en 3, 7 y 11 m²/s.
 *
 * 6. **Peel, M.C., Finlayson, B.L. & McMahon, T.A. (2007)**, vía
 *    `lib/clima.ts`: las reglas de Köppen con las que se construye la
 *    comparación de aridez.
 *
 * ── Rango de validez y lo que este módulo NO puede hacer ─────────────────────
 *
 * - Es un **relevamiento con condiciones**, no un cálculo estructural. Dice qué
 *   dice cada código sobre cada técnica y qué variable del predio activa cada
 *   cláusula. No dimensiona un muro, no verifica una carga y no reemplaza a
 *   quien firma el proyecto.
 * - Los códigos son de los **Estados Unidos**, que son los que publican estas
 *   técnicas con el método a la vista. La norma local manda, y la tierra cruda
 *   está prohibida lisa y llanamente en más de un código municipal.
 * - La **categoría de diseño sísmico no se puede calcular acá**: necesita el
 *   `S_DS` del punto, que sale de un mapa nacional de amenaza. Es el gate más
 *   duro de dos de las técnicas y queda declarado como pendiente del usuario.
 *   `alturaMaximaMuroTierra` acepta un `Sds` si alguien lo tiene a mano.
 * - La **zona inundable** tampoco: el modelo de elevación no trae la mancha de
 *   inundación. Lo más cerca que llega acequia es la exclusión por posición
 *   cóncava de `lib/emplazamiento.ts`, que es otra cosa.
 * - Los **grados-día** salen de las medias mensuales, que es lo que la app
 *   tiene. Ese método **subestima** los dos: un mes cuya media cae cerca de la
 *   base igual tiene días de los dos lados, y sólo cuenta la diferencia de las
 *   medias. Por eso el módulo publica además a qué distancia quedó del límite de
 *   zona: cerca del límite, la zona es una conjetura.
 * - El índice de lluvia batiente usa el **viento medio anual**, no el viento
 *   coincidente con la lluvia. Lacy lo plantea así a propósito —es un índice, no
 *   una medición—, y por eso sirve para comparar lugares y no para calcular una
 *   carga de agua sobre una pared.
 *
 * ── Quién lo lee ─────────────────────────────────────────────────────────────
 * `components/BioconstruccionBloque.tsx`, dentro del panel de Clima, que es
 * donde están las variables que lo gobiernan.
 */

import type { MesDato } from './clima';

// ─── Fuentes citables ─────────────────────────────────────────────────────────

export const FUENTE_NM1474 =
  '14.7.4 NMAC «New Mexico Earthen Building Materials Code», NM RLD, texto integrado 2023';
export const FUENTE_IRC_AS =
  'IRC, Appendix S/AS «Strawbale Construction» (texto del IRC 2015, AS en el IRC 2021)';
export const FUENTE_IRC_AU =
  'IRC 2021, Appendix AU «Cob Construction (Monolithic Adobe)»';
export const FUENTE_IECC =
  'International Energy Conservation Code, definición de zonas climáticas internacionales (= ASHRAE 169)';
export const FUENTE_LACY =
  'Lacy, R.E., índice de lluvia batiente, vía Met Éireann, Climatological Note No. 13';
export const FUENTE_PEEL =
  'Peel, M.C., Finlayson, B.L. & McMahon, T.A. (2007), Hydrol. Earth Syst. Sci. 11, 1633-1644';

export const LA_NORMA_LOCAL_PROHIBE =
  'Estos códigos son de los Estados Unidos, que son los que publican estas ' +
  'técnicas con el método a la vista. La norma local manda, y la tierra cruda ' +
  'está prohibida lisa y llanamente en más de un código municipal: antes de ' +
  'proyectar, hay que preguntar.';

// ═══════════════════════════════════════════════════════════════════════════════
// 1 · LA ZONA CLIMÁTICA DEL IECC, QUE ES LA VARIABLE QUE LOS CÓDIGOS USAN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Bases de grados-día del IECC. En unidades imperiales son 65 °F y 50 °F; la
 * columna SI del propio código las rotula «HDD18°C» y «CDD10°C», y 65 °F son
 * 18,33 °C: hay un tercio de grado de diferencia entre el rótulo y la
 * conversión exacta. Se usa la conversión exacta y se declara.
 */
export const BASE_HDD_C = (65 - 32) / 1.8;   // 18,333…
export const BASE_CDD_C = (50 - 32) / 1.8;   // 10 exacto

const DIAS_MES = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export interface GradosDia {
  hdd18: number;
  cdd10: number;
}

/**
 * Grados-día de calefacción y de refrigeración a partir de las medias
 * mensuales.
 *
 * El método de las medias mensuales **subestima los dos**, y no por poco: un mes
 * con media de 18 °C aporta cero grados-día de calefacción por este camino, y en
 * la realidad tiene noches de 10 °C. La subestimación es mayor donde la
 * amplitud térmica es grande, que es justamente el desierto, que es justamente
 * donde se construye con tierra. Por eso `zonaIECC` publica el margen al límite.
 */
export function gradosDia(meses: MesDato[]): GradosDia {
  let hdd = 0;
  let cdd = 0;
  for (let i = 0; i < meses.length && i < 12; i++) {
    const t = meses[i]!.tmean_c;
    const d = DIAS_MES[i] ?? 30;
    if (!Number.isFinite(t)) continue;
    hdd += Math.max(0, BASE_HDD_C - t) * d;
    cdd += Math.max(0, t - BASE_CDD_C) * d;
  }
  return { hdd18: hdd, cdd10: cdd };
}

export type RegimenHumedad = 'A' | 'B' | 'C';

export interface ZonaIECC {
  /** 0 a 8. */
  zona:      number;
  humedad:   RegimenHumedad;
  /** El código como lo escribe el código: «4C», «3B», «1A». */
  codigo:    string;
  hdd18:     number;
  cdd10:     number;
  /** Qué tan lejos está del corte de zona más cercano, en grados-día. */
  margen_al_limite: number;
  /** Nombre del régimen, para decirlo en castellano. */
  regimen:   string;
  advertencias: string[];
}

/**
 * Cortes térmicos de la tabla del IECC, en SI: son exactamente 5/9 de los
 * valores en °F·día que publica la columna imperial (5.400 °F·d = 3.000 K·d).
 */
export const CORTES_CDD10 = { z0: 6000, z1: 5000, z2: 3500 } as const;
export const CORTES_HDD18 = { z3: 2000, z4: 3000, z5: 4000, z6: 5000, z7: 7000 } as const;
/**
 * Las zonas marinas que la tabla del código efectivamente lista: 3C, 4C y 5C.
 *
 * La definición de clima marino es puramente climática —las cuatro condiciones
 * de `esMarina`— y no trae un tope de zona, así que nada impide que un punto del
 * planeta salga «6C». Pero el código no tabula esa combinación, y por lo tanto
 * tampoco hay prescripciones escritas para ella. Cuando pasa, el módulo lo
 * avisa en vez de presentar una zona que ninguna tabla contempla.
 */
export const ZONAS_MARINAS_TABULADAS: readonly number[] = [3, 4, 5];

/**
 * La zona climática del IECC del predio: la variable a la que los códigos de
 * bioconstrucción atan sus cláusulas.
 *
 * El régimen de humedad se decide primero —marina, seca o húmeda— porque la
 * definición de seca dice «not marine» y la de húmeda, «not Marine (C) or Dry
 * (B)»: es un orden, no tres pruebas paralelas.
 */
export function zonaIECC(meses: MesDato[], lat: number): ZonaIECC | null {
  if (meses.length < 12) return null;
  const T = meses.map(m => m.tmean_c);
  const P = meses.map(m => m.precip_mm);
  if (!T.every(Number.isFinite) || !P.every(Number.isFinite)) return null;

  const Tann = T.reduce((s, v) => s + v, 0) / 12;
  const Pann = P.reduce((s, v) => s + v, 0);
  const Tcold = Math.min(...T);
  const Thot = Math.max(...T);
  const mesesSobre10 = T.filter(t => t > 10).length;

  const { hdd18, cdd10 } = gradosDia(meses);
  const advertencias: string[] = [];

  // ── Zona térmica, primero: la letra de humedad se apoya en ella ──
  let zona: number;
  if (cdd10 > CORTES_CDD10.z0)      zona = 0;
  else if (cdd10 > CORTES_CDD10.z1) zona = 1;
  else if (cdd10 > CORTES_CDD10.z2) zona = 2;
  else if (hdd18 <= CORTES_HDD18.z3) zona = 3;
  else if (hdd18 <= CORTES_HDD18.z4) zona = 4;
  else if (hdd18 <= CORTES_HDD18.z5) zona = 5;
  else if (hdd18 <= CORTES_HDD18.z6) zona = 6;
  else if (hdd18 <= CORTES_HDD18.z7) zona = 7;
  else                               zona = 8;

  // ── Régimen de humedad, en el orden que manda la tabla ──
  // Marina primero, porque la definición de seca dice literalmente «not marine»
  // y la de húmeda, «not Marine (C) or Dry (B)»: es un orden, no tres pruebas
  // paralelas. Y la letra no depende de la zona térmica: el número sale del
  // esquema de grados-día y la letra se le agrega.
  const marina = esMarina(P, T, lat);
  const seca = !marina && Pann < 20 * (Tann + 7);
  const humedad: RegimenHumedad = marina ? 'C' : seca ? 'B' : 'A';

  const margen = margenAlLimite(zona, hdd18, cdd10);
  if (margen < 300) {
    advertencias.push(
      `El predio queda a ${Math.round(margen)} grados-día del corte de zona, y los grados-día ` +
      'de acá salen de las medias mensuales, que los subestiman. Con esa cercanía la zona es ' +
      'una conjetura: dos zonas vecinas piden cosas distintas al fardo de paja.',
    );
  }
  advertencias.push(
    'Los grados-día salen de las medias mensuales, que es lo que la app tiene. Ese método ' +
    'subestima los dos —un mes con media de 18 °C aporta cero y en la realidad tiene noches de ' +
    '10 °C—, y subestima más donde la amplitud térmica es grande, que es donde se construye con ' +
    'tierra.',
  );
  if (humedad === 'C' && !ZONAS_MARINAS_TABULADAS.includes(zona)) {
    advertencias.push(
      `El clima de acá cumple las cuatro condiciones de clima marino pero la zona térmica es ` +
      `${zona}, y la tabla del código sólo lista 3C, 4C y 5C. Para «${zona}C» no hay ` +
      'prescripciones escritas: la combinación existe en el clima y no en el código.',
    );
  }
  if (Tcold > -3 && Thot < 22 && mesesSobre10 >= 4 && !marina) {
    advertencias.push(
      'Este predio cumple las tres condiciones térmicas de una zona marina y no la cuarta, que ' +
      'es la de verano seco. La zona marina no es una cuestión de estar cerca del mar.',
    );
  }

  return {
    zona,
    humedad,
    codigo: `${zona}${humedad}`,
    hdd18: Math.round(hdd18),
    cdd10: Math.round(cdd10),
    margen_al_limite: Math.round(margen),
    regimen: humedad === 'A' ? 'húmeda' : humedad === 'B' ? 'seca' : 'marina',
    advertencias,
  };
}

/**
 * Las cuatro condiciones de la zona marina (C), incluida la cuarta, que es la
 * que la gente no espera: verano seco, definido como que el mes más lluvioso de
 * la estación fría tenga **al menos el triple** de lluvia que el mes más seco
 * del resto del año. La estación fría es octubre-marzo en el hemisferio norte y
 * abril-septiembre en el sur, y el código lo dice explícitamente.
 */
export function esMarina(P: number[], T: number[], lat: number): boolean {
  const Tcold = Math.min(...T);
  const Thot = Math.max(...T);
  if (!(Tcold > -3 && Tcold < 18)) return false;
  if (!(Thot < 22)) return false;
  if (T.filter(t => t > 10).length < 4) return false;

  const idxFria = lat >= 0 ? [9, 10, 11, 0, 1, 2] : [3, 4, 5, 6, 7, 8];
  const fria = idxFria.map(i => P[i] ?? 0);
  const resto = P.filter((_, i) => !idxFria.includes(i));
  if (fria.length === 0 || resto.length === 0) return false;
  const maxFria = Math.max(...fria);
  const minResto = Math.min(...resto);
  return maxFria >= 3 * minResto;
}

function margenAlLimite(zona: number, hdd: number, cdd: number): number {
  // Hasta la zona 2 el corte es por refrigeración; de la 3 para arriba, por
  // calefacción. Se mide contra el corte más cercano del esquema que manda.
  const cortes = zona <= 2
    ? [CORTES_CDD10.z0, CORTES_CDD10.z1, CORTES_CDD10.z2]
    : [CORTES_HDD18.z3, CORTES_HDD18.z4, CORTES_HDD18.z5,
       CORTES_HDD18.z6, CORTES_HDD18.z7];
  const base = zona <= 2 ? cdd : hdd;
  return Math.min(...cortes.map(c => Math.abs(base - c)));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2 · POR QUÉ KÖPPEN NO ES LA VARIABLE: LAS DOS LÍNEAS DE ARIDEZ
// ═══════════════════════════════════════════════════════════════════════════════

export type EstacionalidadLluvia = 'verano' | 'invierno' | 'repartida';

export interface ComparacionAridez {
  /** La línea del código: P < 20·(T + 7) mm. */
  linea_codigo_mm: number;
  /** La línea de Köppen, que se mueve con la estación de la lluvia. */
  linea_koppen_mm: number;
  /** Cuánto se separan, en mm de lluvia anual. */
  brecha_mm:       number;
  seca_para_codigo: boolean;
  arida_para_koppen: boolean;
  /** Si los dos sistemas no coinciden en este punto. */
  discrepan:       boolean;
  explicacion:     string;
}

/**
 * Las dos líneas de aridez, puestas una al lado de la otra.
 *
 * El hallazgo es exacto y no hace falta ningún ejemplo para mostrarlo. El
 * código define seca como `P_cm < 2,0 · (T_C + 7)`, o sea **P < 20·T + 140 mm**.
 * Köppen define árido como `P < 10·Pth`, con `Pth = 2T + 28` si el 70 % o más de
 * la lluvia cae en la mitad de sol alto, `2T` si cae en la de sol bajo y
 * `2T + 14` si está repartida: o sea **20T + 280**, **20T** o **20T + 140**.
 *
 * Las dos líneas son **la misma** cuando la lluvia está repartida, y se separan
 * exactamente **140 mm** cuando es estacional —la de Köppen sube si llueve en
 * verano y baja si llueve en invierno—. Así que:
 *
 * - En un clima de lluvia de verano, la línea de Köppen queda **arriba**: hay
 *   una franja de 140 mm donde **Köppen dice árido y el código dice húmedo**. En
 *   un monzón, acequia puede estar mostrando «BSh» mientras el código que
 *   gobierna el revoque trata al lugar como zona húmeda.
 * - En un clima de lluvia de invierno —mediterráneo— la franja va al revés:
 *   **el código dice seco donde Köppen dice templado húmedo**.
 *
 * Por eso «la técnica según el clima de Köppen» no es una pregunta mal hecha:
 * es una pregunta con otra respuesta.
 */
export function comparacionAridez(
  tmean_anual_c: number,
  precip_anual_mm: number,
  estacionalidad: EstacionalidadLluvia,
): ComparacionAridez {
  const codigo = 20 * (tmean_anual_c + 7);
  const koppen =
    estacionalidad === 'verano'   ? 20 * tmean_anual_c + 280 :
    estacionalidad === 'invierno' ? 20 * tmean_anual_c :
                                    20 * tmean_anual_c + 140;

  const secaCodigo = precip_anual_mm < codigo;
  const aridaKoppen = precip_anual_mm < koppen;
  const discrepan = secaCodigo !== aridaKoppen;

  const explicacion = discrepan
    ? (secaCodigo
        ? 'Köppen llama húmedo a este clima y el código de edificación lo llama seco: es la ' +
          'franja de la lluvia de invierno. El que decide la barrera de vapor y el revoque es ' +
          'el código.'
        : 'Köppen llama árido a este clima y el código de edificación lo llama húmedo: es la ' +
          'franja de la lluvia de verano. Lo que la app muestra como clima de estepa, el código ' +
          'lo trata como zona húmeda.')
    : 'Los dos sistemas coinciden en este punto.';

  return {
    linea_codigo_mm:   Math.round(codigo),
    linea_koppen_mm:   Math.round(koppen),
    brecha_mm:         Math.round(Math.abs(codigo - koppen)),
    seca_para_codigo:  secaCodigo,
    arida_para_koppen: aridaKoppen,
    discrepan,
    explicacion,
  };
}

/** La estacionalidad de la lluvia, con el criterio del 70 % de Köppen. */
export function estacionalidadLluvia(meses: MesDato[], lat: number): EstacionalidadLluvia {
  const P = meses.map(m => m.precip_mm);
  const Pann = P.reduce((s, v) => s + v, 0);
  if (!(Pann > 0)) return 'repartida';
  const sur = lat < 0;
  const idxSolAlto = sur ? [9, 10, 11, 0, 1, 2] : [3, 4, 5, 6, 7, 8];
  const alto = idxSolAlto.reduce((s, i) => s + (P[i] ?? 0), 0);
  const bajo = Pann - alto;
  if (alto >= 0.7 * Pann) return 'verano';
  if (bajo >= 0.7 * Pann) return 'invierno';
  return 'repartida';
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3 · LOS CICLOS DE HIELO Y DESHIELO
// ═══════════════════════════════════════════════════════════════════════════════

export interface HieloDeshielo {
  /** Meses en que la mínima media baja de 0 y la máxima media lo pasa. */
  meses_con_ciclo:  string[];
  /** Meses en que la máxima media tampoco pasa de 0: el muro queda congelado. */
  meses_congelados: string[];
  /** Si hay al menos un mes con ciclo diario, que es el gate del adobe quemado. */
  hay_ciclo_diario: boolean;
  /** Cota superior de días con ciclo al año, si vienen los días de helada. */
  dias_cota_sup:    number | null;
  advertencias:     string[];
}

/**
 * Los ciclos de hielo y deshielo, que es la variable que el código nombra para
 * desaconsejar el adobe quemado.
 *
 * Un ciclo necesita las dos cosas: que el agua de los poros se congele y que
 * después se derrita. Un mes cuya máxima media no llega a 0 °C **no cicla**: el
 * muro queda congelado y quieto, que es menos destructivo que alternar. Por eso
 * la cuenta no es «meses con helada» sino «meses que cruzan el cero en los dos
 * sentidos», y los congelados se informan aparte.
 *
 * Con medias mensuales esto es un indicio y no una cuenta: un mes con mínima
 * media de 2 °C igual tiene mañanas bajo cero. Si llegan los días de helada de
 * `lib/climaExtremos.ts` se publica como **cota superior** —un día de helada es
 * un ciclo sólo si además deshiela—.
 */
export function hieloDeshielo(
  meses: MesDato[],
  dias_helada_anio?: number | null,
): HieloDeshielo {
  const con: string[] = [];
  const congelados: string[] = [];
  const advertencias: string[] = [];

  for (const m of meses) {
    if (!Number.isFinite(m.tmin_c) || !Number.isFinite(m.tmax_c)) continue;
    if (m.tmax_c <= 0) { congelados.push(m.mes); continue; }
    if (m.tmin_c <= 0) con.push(m.mes);
  }

  if (con.length === 0 && meses.some(m => Number.isFinite(m.tmin_c) && m.tmin_c <= 3)) {
    advertencias.push(
      'Ningún mes tiene la mínima media bajo cero, pero hay meses con mínima media de 3 °C o ' +
      'menos: con medias mensuales eso igual significa mañanas de helada. El indicio es débil ' +
      'hacia este lado.',
    );
  }
  if (congelados.length > 0) {
    advertencias.push(
      `En ${congelados.length} mes${congelados.length === 1 ? '' : 'es'} la máxima media tampoco ` +
      'pasa de cero: ahí el muro queda congelado y no cicla, que es menos destructivo que ' +
      'alternar. Esos meses no cuentan como ciclos.',
    );
  }
  if (dias_helada_anio != null && dias_helada_anio > 0) {
    advertencias.push(
      `Los ${Math.round(dias_helada_anio)} días de helada al año que publica la serie son una ` +
      'cota superior de los ciclos: un día de helada es un ciclo sólo si además deshiela.',
    );
  }

  return {
    meses_con_ciclo:  con,
    meses_congelados: congelados,
    hay_ciclo_diario: con.length > 0,
    dias_cota_sup:    dias_helada_anio ?? null,
    advertencias,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4 · LA LLUVIA BATIENTE (Lacy)
// ═══════════════════════════════════════════════════════════════════════════════

export type ClaseLluviaBatiente = 'resguardado' | 'moderado' | 'alto' | 'severo';

export const CORTES_DRI: readonly number[] = [3, 7, 11];

export interface LluviaBatiente {
  /** El índice, en m²/s: lluvia anual en metros por viento medio en m/s. */
  dri_m2s: number;
  clase:   ClaseLluviaBatiente;
  advertencias: string[];
}

/**
 * El índice de lluvia batiente de Lacy: el producto de la lluvia anual media por
 * la velocidad media anual del viento.
 *
 * Es el número que decide si un revoque de tierra aguanta, y es una **cuenta de
 * dos factores**: 1.200 mm con 2 m/s y 600 mm con 4 m/s dan el mismo índice. Por
 * eso «acá llueve poco» no alcanza como argumento, y por eso la Patagonia —poca
 * lluvia, mucho viento— puede ser más hostil para una pared de tierra que un
 * lugar con el doble de lluvia y aire quieto.
 *
 * Las unidades salen de multiplicar metros por metros por segundo, lo que da
 * m²/s y no significa nada físico: es un índice de comparación, no una carga.
 */
export function indiceLluviaBatiente(
  precip_anual_mm: number,
  viento_medio_ms: number | null | undefined,
): LluviaBatiente | null {
  if (!Number.isFinite(precip_anual_mm) || viento_medio_ms == null) return null;
  if (!Number.isFinite(viento_medio_ms)) return null;
  const dri = (precip_anual_mm / 1000) * viento_medio_ms;
  const clase: ClaseLluviaBatiente =
    dri < CORTES_DRI[0]! ? 'resguardado' :
    dri < CORTES_DRI[1]! ? 'moderado' :
    dri < CORTES_DRI[2]! ? 'alto' : 'severo';

  return {
    dri_m2s: Math.round(dri * 100) / 100,
    clase,
    advertencias: [
      'El índice usa el viento medio anual y no el viento que acompaña a la lluvia. Lacy lo ' +
      'plantea así a propósito: sirve para comparar lugares, no para calcular el agua que pega ' +
      'en una pared. Y es un producto, así que poca lluvia con mucho viento da lo mismo que ' +
      'mucha lluvia con aire quieto.',
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5 · LA TABLA 1 DE 14.7.4 NMAC: ALTURA DE MURO POR ESPESOR Y POR SISMO
// ═══════════════════════════════════════════════════════════════════════════════

export const ESPESORES_TABLA1_PULG: readonly number[] = [10, 12, 14, 16, 18, 24];
export const SDS_TABLA1: readonly number[] = [0.25, 0.3, 0.35, 0.4, 0.45, 0.5];

/**
 * Tabla 1, «Allowable wall heights for earthen structures», en pulgadas de
 * altura por espesor y por `Sds`. La fuente aclara que la tabla vale para dos
 * pisos como máximo, vivienda unifamiliar o bifamiliar y sitio sísmico clase D1.
 *
 * Lo que la tabla dice y una receta no puede decir: **el espesor compra
 * tolerancia sísmica, y se puede leer cuánta**. Entre `Sds` 0,25 y 0,50 un muro
 * de 10 pulgadas pierde un 20 % de altura admisible (de 120" a 96") y uno de 24
 * pulgadas no pierde nada. El muro grueso no es prolijidad: es lo que mantiene
 * la altura cuando el sismo aprieta.
 */
export const TABLA1_ALTURA_PULG: Readonly<Record<string, readonly number[]>> = {
  '0.25': [120, 128, 144, 144, 144, 144],
  '0.3':  [120, 128, 144, 144, 144, 144],
  '0.35': [120, 128, 144, 144, 144, 144],
  '0.4':  [120, 128, 144, 144, 144, 144],
  '0.45': [104, 128, 144, 144, 144, 144],
  '0.5':  [96, 112, 136, 144, 144, 144],
};

export interface AlturaMuroTierra {
  espesor_pulg: number;
  espesor_m:    number;
  sds:          number;
  altura_pulg:  number;
  altura_m:     number;
}

/**
 * Altura admisible de un muro de tierra, de la tabla 1. Devuelve `null` fuera de
 * la tabla en vez de extrapolar: `Sds` 0,6 no está publicado y un muro de tierra
 * ahí no es un número más alto, es otro problema.
 */
export function alturaMaximaMuroTierra(
  espesor_pulg: number,
  sds: number,
): AlturaMuroTierra | null {
  const iEsp = ESPESORES_TABLA1_PULG.indexOf(espesor_pulg);
  if (iEsp < 0) return null;
  const clave = SDS_TABLA1.find(s => Math.abs(s - sds) < 1e-9);
  if (clave == null) return null;
  const fila = TABLA1_ALTURA_PULG[String(clave)];
  const alt = fila?.[iEsp];
  if (alt == null) return null;
  return {
    espesor_pulg,
    espesor_m: Math.round(espesor_pulg * 0.0254 * 1000) / 1000,
    sds:       clave,
    altura_pulg: alt,
    altura_m:  Math.round(alt * 0.0254 * 100) / 100,
  };
}

/** Cuánta altura pierde un espesor dado al pasar del `Sds` más bajo al más alto. */
export function perdidaPorSismo(espesor_pulg: number): number | null {
  const bajo = alturaMaximaMuroTierra(espesor_pulg, SDS_TABLA1[0]!);
  const alto = alturaMaximaMuroTierra(espesor_pulg, SDS_TABLA1[SDS_TABLA1.length - 1]!);
  if (!bajo || !alto) return null;
  return Math.round((1 - alto.altura_pulg / bajo.altura_pulg) * 1000) / 10;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6 · EL RELEVAMIENTO DE TÉCNICAS
// ═══════════════════════════════════════════════════════════════════════════════

export type IdTecnica =
  | 'adobe' | 'adobe_estabilizado' | 'adobe_quemado' | 'bloque_comprimido'
  | 'tapial' | 'tapial_estabilizado' | 'cob' | 'fardo_de_paja';

export type Veredicto = 'apta' | 'con_condiciones' | 'desaconsejada' | 'no_evaluable';

export interface Tecnica {
  id:      IdTecnica;
  nombre:  string;
  familia: 'tierra' | 'paja';
  fuente:  string;
  /** Lo que el código fija y no depende del clima. */
  limites: string[];
  /** La categoría sísmica máxima, cuando el código la fija. */
  sdc_max?: string;
}

export const TECNICAS: readonly Tecnica[] = [
  {
    id: 'adobe', nombre: 'Adobe sin estabilizar', familia: 'tierra', fuente: FUENTE_NM1474,
    limites: [
      'Hasta dos pisos. La altura de cada muro sale de la tabla 1, por espesor y por Sds.',
      'Prohibido dentro de las primeras 4 pulgadas (10 cm) sobre el nivel del piso terminado: ahí va adobe estabilizado o mampostería impermeable.',
      'Resistencia a compresión media mínima de 300 psi (2,07 MPa), con una muestra de cinco que puede bajar a 250.',
      'El muro exterior sin estabilizar necesita revoque, y si el revoque es a base de portland hay que protegerlo con fieltro asfáltico y malla.',
    ],
  },
  {
    id: 'adobe_estabilizado', nombre: 'Adobe estabilizado', familia: 'tierra', fuente: FUENTE_NM1474,
    limites: [
      'La prueba es concreta: un cubo seco de 4 pulgadas no puede ganar más del 2,5 % de su peso en siete días sobre una superficie porosa saturada.',
      'Si pasa esa prueba, el muro exterior «requiere no additional protection»: no hace falta revoque cementicio ni ningún recubrimiento impermeable.',
      'Mismos límites de altura y de resistencia que el adobe sin estabilizar.',
    ],
  },
  {
    id: 'adobe_quemado', nombre: 'Adobe quemado', familia: 'tierra', fuente: FUENTE_NM1474,
    limites: [
      'Es adobe curado en horno a baja temperatura. El código advierte que no suele quedar lo bastante denso para ser a prueba de heladas.',
      'Mismos límites de altura que el resto de la tierra.',
    ],
  },
  {
    id: 'bloque_comprimido', nombre: 'Bloque de tierra comprimida', familia: 'tierra', fuente: FUENTE_NM1474,
    limites: [
      'Entra en la misma tabla 1 de altura que el adobe y el tapial.',
      'El suelo no puede llevar piedra de más de 1½ pulgada ni más del 2 % de sales solubles.',
    ],
  },
  {
    id: 'tapial', nombre: 'Tapial sin estabilizar', familia: 'tierra', fuente: FUENTE_NM1474,
    limites: [
      'Muro exterior de 18 pulgadas (46 cm) como mínimo. La excepción son los muros de masa solar tipo trombe, que bajan a 10 pulgadas.',
      'Resistencia última mínima de 300 psi, estabilizado o no.',
      'Mientras se construye, hay que tapar el muro al final de cada jornada y antes de cualquier pronóstico de lluvia.',
      'La primera tongada arranca con tapial estabilizado u hormigón de 2.500 psi, 3½ pulgadas sobre el nivel del piso.',
    ],
  },
  {
    id: 'tapial_estabilizado', nombre: 'Tapial estabilizado', familia: 'tierra', fuente: FUENTE_NM1474,
    limites: [
      'Los muros plenamente estabilizados «may be left unprotected from the elements»: ni se tapan en obra ni se revocan después.',
      'No se puede estabilizar con emulsión asfáltica.',
      'Mismo espesor mínimo y misma resistencia que el tapial sin estabilizar.',
    ],
  },
  {
    id: 'cob', nombre: 'Cob (adobe monolítico)', familia: 'tierra', fuente: FUENTE_IRC_AU,
    sdc_max: 'C',
    limites: [
      'Un solo piso y 20 pies (6,10 m) de altura de edificio como máximo.',
      'Categorías de diseño sísmico A, B y C solamente, salvo cálculo aprobado.',
      'Espesor de muro no menor a 10 pulgadas (25 cm) ni mayor a 24 pulgadas (61 cm) en los dos tercios superiores.',
      'El conjunto de materiales de terminación tiene que dar 5 perms o más, para que el muro transpire.',
      'Los muros expuestos a lluvia tienen que terminarse o revestirse contra la erosión.',
    ],
  },
  {
    id: 'fardo_de_paja', nombre: 'Fardo de paja', familia: 'paja', fuente: FUENTE_IRC_AS,
    limites: [
      'La humedad del fardo al revocar no puede pasar del 20 % de su peso, medida con higrómetro de sonda larga en al menos el 5 % y no menos de 10 fardos.',
      'Densidad seca mínima de 6,5 lb/pie³ (104 kg/m³).',
      'Nada con menos de 3 perms sobre un muro de fardos: prohibidas las barreras de vapor clase I y II.',
      'Los fardos tienen que estar a 20 cm (8 pulgadas) del suelo como mínimo.',
      'Las superficies horizontales expuestas —antepechos, nichos, contrafuertes— con pendiente de 1:12 (8 %) para afuera.',
      'El revoque de arcilla expuesto a lluvia se termina con lechada o revoque de cal, y el portland no se admite como capa de terminación encima.',
    ],
  },
] as const;

export interface EvaluacionTecnica {
  tecnica:    Tecnica;
  veredicto:  Veredicto;
  /** La cláusula que decidió, con su fuente. */
  decide:     string | null;
  condiciones: string[];
  /** Lo que un código exige y acequia no puede verificar. */
  pendientes: string[];
}

export interface Bioconstruccion {
  zona:        ZonaIECC;
  aridez:      ComparacionAridez;
  hielo:       HieloDeshielo;
  lluvia:      LluviaBatiente | null;
  tecnicas:    EvaluacionTecnica[];
  advertencias: string[];
}

/**
 * El relevamiento completo para el clima de un predio.
 *
 * `veredicto` tiene cuatro valores y el cuarto es el importante:
 * `no_evaluable` es lo que corresponde cuando el gate que manda es una variable
 * que acequia no tiene —la categoría sísmica, la zona inundable— y es mejor que
 * una luz verde optimista.
 */
export function evaluarBioconstruccion(entrada: {
  meses:            MesDato[];
  lat:              number;
  precip_anual_mm:  number;
  tmean_anual_c:    number;
  viento_medio_ms?: number | null;
  dias_helada_anio?: number | null;
}): Bioconstruccion | null {
  const zona = zonaIECC(entrada.meses, entrada.lat);
  if (!zona) return null;

  const estacion = estacionalidadLluvia(entrada.meses, entrada.lat);
  const aridez = comparacionAridez(entrada.tmean_anual_c, entrada.precip_anual_mm, estacion);
  const hielo = hieloDeshielo(entrada.meses, entrada.dias_helada_anio);
  const lluvia = indiceLluviaBatiente(entrada.precip_anual_mm, entrada.viento_medio_ms);

  const zonaPideBarrera = [5, 6, 7, 8].includes(zona.zona) || zona.codigo === '4C';
  const lluviaFuerte = lluvia != null && (lluvia.clase === 'alto' || lluvia.clase === 'severo');

  const tecnicas: EvaluacionTecnica[] = TECNICAS.map(t => {
    const condiciones: string[] = [];
    const pendientes: string[] = [];
    let veredicto: Veredicto = 'apta';
    let decide: string | null = null;

    // ── El gate que acequia no puede evaluar ──
    if (t.sdc_max) {
      pendientes.push(
        `El código limita esta técnica a categoría de diseño sísmico ${t.sdc_max}, y acequia no ` +
        'conoce la amenaza sísmica del punto: eso sale de un mapa nacional y lo tiene que ' +
        'verificar quien firme el proyecto.',
      );
      veredicto = 'no_evaluable';
      decide = `Categoría de diseño sísmico máxima ${t.sdc_max}, que acequia no puede calcular.`;
    }
    if (t.familia === 'tierra') {
      pendientes.push(
        'La altura admisible del muro sale de la tabla 1 por espesor y por Sds, y el Sds es un ' +
        'dato sísmico que acequia no tiene.',
      );
    }

    // ── El gate explícitamente climático ──
    if (t.id === 'adobe_quemado' && hielo.hay_ciclo_diario) {
      veredicto = 'desaconsejada';
      decide =
        `El código desaconseja el adobe quemado al aire libre «in climate zones with daily ` +
        `freeze-thaw cycles», y acá hay ${hielo.meses_con_ciclo.length} mes` +
        `${hielo.meses_con_ciclo.length === 1 ? '' : 'es'} que cruzan el cero en los dos ` +
        `sentidos: ${hielo.meses_con_ciclo.join(', ')}.`;
    }

    // ── La zona del IECC ──
    if (t.id === 'fardo_de_paja' && zonaPideBarrera) {
      if (veredicto === 'apta') veredicto = 'con_condiciones';
      decide = decide ?? `Zona climática ${zona.codigo}.`;
      condiciones.push(
        `En zona ${zona.codigo} el código pide barrera de vapor equivalente a clase III del lado ` +
        'interior del muro exterior, y sellar las penetraciones también por dentro. Es la única ' +
        'cláusula de estos códigos que se activa por zona climática.',
      );
    }

    // ── La lluvia batiente ──
    if (lluviaFuerte && (t.id === 'adobe' || t.id === 'tapial' || t.id === 'cob')) {
      if (veredicto === 'apta') veredicto = 'con_condiciones';
      condiciones.push(
        `Con un índice de lluvia batiente de ${lluvia!.dri_m2s} m²/s (exposición ` +
        `${lluvia!.clase}) la cláusula de protección contra la erosión deja de ser un trámite. ` +
        'La salida que los códigos nombran es revestir, estabilizar, o las dos.',
      );
    }
    if (lluviaFuerte && (t.id === 'adobe_estabilizado' || t.id === 'tapial_estabilizado')) {
      condiciones.push(
        'La estabilización es precisamente la que levanta la exigencia de recubrimiento: con la ' +
        'prueba de absorción pasada, el código no pide protección adicional aunque la exposición ' +
        'sea alta.',
      );
    }
    if (t.familia === 'paja' && lluviaFuerte) {
      if (veredicto === 'apta') veredicto = 'con_condiciones';
      condiciones.push(
        'Con esta exposición, el revoque de arcilla pide terminación de cal y las superficies ' +
        'horizontales su pendiente de 8 %: las dos cláusulas son del propio apéndice.',
      );
    }

    // ── El alero, que acequia ya sabe dimensionar ──
    if (lluviaFuerte || t.familia === 'tierra') {
      condiciones.push(
        'Lo que los códigos piden acá es proteger el muro del agua, y el alero es la pieza que ' +
        'lo hace. acequia lo dimensiona en el panel Solar, con el rumbo de la pared.',
      );
    }

    pendientes.push(
      'Ninguno de estos códigos admite la técnica por debajo de la cota de inundación de diseño, ' +
      'y acequia no tiene la mancha de inundación: el modelo de elevación no la trae.',
    );

    return { tecnica: t, veredicto, decide, condiciones, pendientes };
  });

  const advertencias: string[] = [
    ...zona.advertencias,
    ...hielo.advertencias,
    ...(lluvia?.advertencias ?? []),
    LA_NORMA_LOCAL_PROHIBE,
  ];
  if (aridez.discrepan) {
    advertencias.push(
      `${aridez.explicacion} La línea del código está en ${aridez.linea_codigo_mm} mm de lluvia ` +
      `anual y la de Köppen en ${aridez.linea_koppen_mm}: se separan ${aridez.brecha_mm} mm, y ` +
      'este predio cae justo en medio.',
    );
  }

  return { zona, aridez, hielo, lluvia, tecnicas, advertencias };
}
