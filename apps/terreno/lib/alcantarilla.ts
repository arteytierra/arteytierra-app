/**
 * Alcantarilla de un cruce de camino: del caudal de la cuenca al diámetro del caño.
 *
 * La app ya delinea la cuenca de aporte de un punto y ya calcula el caudal pico
 * de la ráfaga que la hace trabajar (`lib/cuenca.ts` + `lib/tormenta.ts`), y ya
 * detecta dónde un camino cruza un cauce (`lib/cuencaHidro.ts`, que marca
 * «puente» o «alcantarilla» según el tamaño del cauce). Lo que faltaba era el
 * paso final: **con ese caudal, qué diámetro hay que enterrar**.
 *
 * ── LA FUENTE ───────────────────────────────────────────────────────────────
 * FHWA (2012), «Hydraulic Design of Highway Culverts», Hydraulic Design Series
 * Number 5, tercera edición, publicación FHWA-HIF-12-026, U.S. Department of
 * Transportation, Federal Highway Administration. Es el método estándar del
 * mundo entero para esto, y las regresiones vienen del trabajo experimental del
 * National Bureau of Standards para el Bureau of Public Roads (French, 1955 y
 * 1961-1967; síntesis de Bossy, 1961).
 *
 * De ahí sale TODO lo que hay en este archivo: las tres ecuaciones de control de
 * entrada (apéndice A, ecuaciones A.1, A.2 y A.3), los coeficientes K, M, c e Y
 * por tipo de boca (tabla A.1), la ecuación de pérdidas del control de salida
 * (ecuación 3.5), los coeficientes de pérdida de entrada ke (tabla C.2), los
 * valores de n de Manning por material (tabla B.1) y el criterio de carga
 * admisible (sección 2.2.5).
 *
 * ── LO QUE HAY QUE ENTENDER ANTES DE LEER EL CÓDIGO ─────────────────────────
 * Una alcantarilla tiene **dos** formas de ahogarse y hay que calcular las dos,
 * porque la que manda es la peor. No es una sutileza de ingeniería: es la razón
 * por la que un caño que «da bien» por una cuenta rebalsa el camino.
 *
 *   · **Control de entrada.** El caño podría llevar más agua, pero la boca no
 *     la deja entrar. Pasa en caños cortos y con pendiente. Lo único que importa
 *     es la geometría de la boca: el largo del caño y su rugosidad no cambian
 *     nada. Por eso una boca bien hecha vale más que un caño más grande.
 *   · **Control de salida.** La boca deja entrar el agua pero el caño no la
 *     puede sacar. Pasa en caños largos, de poca pendiente, o cuando el agua de
 *     abajo está alta. Acá sí pesan el largo, la rugosidad y el nivel de salida.
 *
 * HDS-5 lo dice en una frase: *«If inlet control exists, the culvert barrel is
 * capable of carrying more flow than the inlet will accept.»* La carga de diseño
 * es **el mayor de los dos** resultados, y `diametroAlcantarilla` informa cuál
 * ganó, porque la decisión de obra cambia: si manda la entrada, se mejora la
 * boca; si manda la salida, se agranda o se alisa el caño.
 *
 * ── RANGO DE VALIDEZ ────────────────────────────────────────────────────────
 * · Las ecuaciones de entrada no sumergida (A.1 y A.2) valen hasta
 *   Q/(A·D^0,5) ≈ 3,5 en unidades inglesas (1,93 en SI); la sumergida (A.3)
 *   arriba de 4,0 (2,21 SI). En el medio, HDS-5 dice que la zona de transición
 *   «provided only limited information» y que se dibuja una curva tangente entre
 *   las dos. acequia no dibuja la tangente: toma **la mayor de las dos**, que es
 *   del lado conservador y queda declarado en el régimen que devuelve.
 * · El caudal pico que alimenta esto sale del método racional sobre una cuenca
 *   chica (hasta unas 200 ha). Afuera de eso, el que no vale es el caudal, no
 *   esta cuenta.
 * · El método supone una alcantarilla recta, sin depresión de la boca y con una
 *   sola batería de caños. Dos caños en paralelo no llevan el doble: hay que
 *   repartir el caudal y volver a entrar acá con la mitad.
 *
 * ── QUIÉN LEE ESTO ──────────────────────────────────────────────────────────
 * El panel de Cuenca y el informe. Si cambia algo acá cambia un diámetro de
 * obra, así que cada constante tiene su tabla de origen anotada al lado.
 */

export const FUENTE_HDS5 =
  'FHWA (2012) — Hydraulic Design of Highway Culverts, HDS-5, 3.ª ed., FHWA-HIF-12-026';

/** Gravedad (m/s²). */
const G = 9.81;

/**
 * Factor de conversión de unidades de las ecuaciones de control de entrada.
 * HDS-5, apéndice A: «Ku — Unit conversion 1.0 (1.811 SI)».
 *
 * No es un ajuste: es exactamente √(3,2808 ft/m), porque la intensidad de
 * descarga Q/(A·D^0,5) tiene unidades de longitud^0,5/tiempo. Multiplicar por
 * 1,811 lleva el número en m^0,5/s a la escala en que se ajustaron K, M, c e Y.
 */
export const KU_SI = 1.811;

/**
 * Corrección por pendiente. HDS-5, apéndice A: «Ks — Slope correction, -0.5
 * (mitered inlets +0.7)». La pendiente le resta carga a la boca, salvo en la
 * boca cortada al talud, donde se la suma.
 */
export const KS_NORMAL = -0.5;
export const KS_BISELADA_AL_TALUD = 0.7;

/** Techo de la ecuación no sumergida, en la escala inglesa de la intensidad. */
export const INTENSIDAD_NO_SUMERGIDA_MAX = 3.5;
/** Piso de la ecuación sumergida, en la misma escala. */
export const INTENSIDAD_SUMERGIDA_MIN = 4.0;

/**
 * Relación carga/diámetro admisible.
 *
 * HDS-5 §2.2.5(d): *«the headwater depth may not be allowed to exceed the barrel
 * height or some multiple of the barrel height, expressed as HW/D. The allowable
 * HW/D ratio varies throughout the country, but commonly ranges from 1.0 to
 * 1.5.»*
 *
 * No es una ley física: es el límite que ponen las reparticiones de caminos, y
 * varía. acequia avisa cuando se pasa de 1,5 pero no lo impone, porque en un
 * camino interno de un predio el que decide cuánta agua se puede embalsar arriba
 * del cruce es el dueño.
 */
export const HW_SOBRE_D_HABITUAL: readonly [number, number] = [1.0, 1.5];

/** Factor de Manning de la ecuación 3.5 de HDS-5: «KU = 29 in English Units (19.63 in SI)». */
const KU_MANNING_SI = 19.63;

// ─── Tipos de boca (tabla A.1 y tabla C.2 de HDS-5) ───────────────────────────

export interface BocaAlcantarilla {
  id:        string;
  nombre:    string;
  /** Material del caño, para elegir el n de Manning. */
  material:  'hormigon' | 'metal_corrugado';
  /** Forma de la ecuación no sumergida: 1 (con la carga crítica) o 2 (tipo vertedero). */
  forma:     1 | 2;
  K:         number;
  M:         number;
  c:         number;
  Y:         number;
  /** Coeficiente de pérdida de entrada para el control de salida (tabla C.2). */
  ke:        number;
  /** `true` sólo en la boca cortada al talud, que invierte el signo de la pendiente. */
  al_talud?: boolean;
  /** Nota de obra: qué significa esa boca en el campo. */
  nota:      string;
}

/**
 * Las seis bocas circulares de la tabla A.1, con su ke de la tabla C.2.
 *
 * Los valores se transcribieron de la tabla extraída en modo tabla del PDF
 * original —no del volcado de texto corrido, que **desplaza la columna Y una
 * fila** y le pone a la boca a escuadra el 0,74 que es de la boca acampanada—.
 * Es la clase de error que no se nota: 0,74 en vez de 0,67 es un 10 % más de
 * carga admitida sobre el mismo caño.
 *
 * Chart 1 = hormigón circular, Chart 2 = metal corrugado circular,
 * Chart 3 = anillo biselado.
 */
export const BOCAS: readonly BocaAlcantarilla[] = [
  {
    id: 'hormigon_escuadra', nombre: 'Hormigón, canto a escuadra con cabecero',
    material: 'hormigon', forma: 1, K: 0.0098, M: 2.0, c: 0.0398, Y: 0.67, ke: 0.5,
    nota: 'El caño cortado al ras contra un cabecero de hormigón o mampostería. Es la boca más común y la menos eficiente de las tres de hormigón.',
  },
  {
    id: 'hormigon_campana', nombre: 'Hormigón, campana con cabecero',
    material: 'hormigon', forma: 1, K: 0.0018, M: 2.0, c: 0.0292, Y: 0.74, ke: 0.2,
    nota: 'El caño entra con su campana hacia aguas arriba. Es la boca más eficiente que se consigue sin obra especial: admite más carga que la de canto a escuadra sin cambiar el diámetro.',
  },
  {
    id: 'hormigon_campana_saliente', nombre: 'Hormigón, campana saliente sin cabecero',
    material: 'hormigon', forma: 1, K: 0.0045, M: 2.0, c: 0.0317, Y: 0.69, ke: 0.2,
    nota: 'El caño asoma del terraplén sin cabecero. Se usa porque es lo más barato; paga con carga.',
  },
  {
    id: 'metal_cabecero', nombre: 'Metal corrugado, con cabecero',
    material: 'metal_corrugado', forma: 1, K: 0.0078, M: 2.0, c: 0.0379, Y: 0.69, ke: 0.5,
    nota: 'Chapa corrugada contra un cabecero de hormigón o mampostería. Es la boca razonable de un caño de chapa: el mismo caño saliente pierde casi el doble.',
  },
  {
    id: 'metal_al_talud', nombre: 'Metal corrugado, cortado al talud',
    material: 'metal_corrugado', forma: 1, K: 0.0210, M: 1.33, c: 0.0463, Y: 0.75, ke: 0.7,
    al_talud: true,
    nota: 'La boca cortada en diagonal siguiendo el talud del terraplén. Es la única donde la pendiente SUMA carga en vez de restarla.',
  },
  {
    id: 'metal_saliente', nombre: 'Metal corrugado, saliente sin cabecero',
    material: 'metal_corrugado', forma: 1, K: 0.0340, M: 1.50, c: 0.0553, Y: 0.54, ke: 0.9,
    nota: 'El caño de chapa asomando del terraplén. Es la peor boca de la tabla: ke = 0,9 contra 0,2 de una campana.',
  },
  {
    id: 'anillo_biselado_45', nombre: 'Anillo biselado a 45°',
    material: 'metal_corrugado', forma: 1, K: 0.0018, M: 2.50, c: 0.0300, Y: 0.74, ke: 0.2,
    nota: 'Un anillo de hormigón biselado en la boca. Es obra extra, y a cambio tiene el mismo ke que una campana sobre un caño de chapa.',
  },
  {
    id: 'anillo_biselado_34', nombre: 'Anillo biselado a 33,7°',
    material: 'metal_corrugado', forma: 1, K: 0.0018, M: 2.50, c: 0.0243, Y: 0.83, ke: 0.2,
    nota: 'El bisel más tendido. Es la boca más eficiente de la tabla A.1 para sección circular.',
  },
];

export function boca(id: string): BocaAlcantarilla {
  return BOCAS.find(b => b.id === id) ?? BOCAS[0]!;
}

/**
 * Rugosidad de Manning por material (HDS-5 tabla B.1).
 *
 * La tabla da rangos, no valores. Para hormigón liso 0,010-0,011 (Straub y otros
 * 1960; May y otros 1986; Tullis 1986 y 1991a) y para chapa corrugada de
 * 68 × 13 mm helicoidal 0,011-0,023, que es un rango de más del doble (FHWA
 * 1980; Tullis 1991c). acequia usa **el extremo rugoso** de cada rango para
 * dimensionar, porque el caño con el que se va a trabajar dentro de diez años no
 * es el del catálogo, y porque en control de salida más rugoso es más carga.
 */
export const N_MANNING: Record<BocaAlcantarilla['material'], readonly [number, number]> = {
  hormigon:        [0.010, 0.011],
  metal_corrugado: [0.011, 0.023],
};

/**
 * Diámetros comerciales de caño de alcantarilla (mm).
 *
 * No salen de HDS-5 —que trabaja con los planos tipo de cada repartición— sino
 * de la serie que se consigue en el mercado. Es una lista de compra, no un
 * cálculo.
 */
export const DIAMETROS_MM: readonly number[] = [300, 400, 500, 600, 800, 1000, 1200, 1500, 1800, 2000];

// ─── Geometría de una sección circular parcialmente llena ─────────────────────

export interface SeccionCircular {
  /** Ángulo mojado (rad). */
  theta_rad:   number;
  /** Tirante (m). */
  tirante_m:   number;
  /** Área mojada (m²). */
  area_m2:     number;
  /** Ancho de la superficie libre (m). */
  ancho_sup_m: number;
  /** Perímetro mojado (m). */
  perimetro_m: number;
}

/** Geometría de un caño circular de diámetro `D_m` con un ángulo mojado dado. */
export function seccionCircular(D_m: number, theta_rad: number): SeccionCircular {
  const area_m2     = (D_m * D_m / 8) * (theta_rad - Math.sin(theta_rad));
  const ancho_sup_m = D_m * Math.sin(theta_rad / 2);
  const tirante_m   = (D_m / 2) * (1 - Math.cos(theta_rad / 2));
  const perimetro_m = (D_m * theta_rad) / 2;
  return { theta_rad, tirante_m, area_m2, ancho_sup_m, perimetro_m };
}

/**
 * Tirante crítico en un caño circular, por bisección sobre el número de Froude.
 *
 * La condición de crítico es Fr = 1, o sea Q²·T/(g·A³) = 1 (HDS-5 apéndice A,
 * ecuación A.5 y el párrafo que la precede). No tiene solución cerrada en una
 * sección circular, así que se busca el ángulo mojado que la cumple.
 */
export function tiranteCritico(D_m: number, Q_m3s: number): SeccionCircular | null {
  if (D_m <= 0 || Q_m3s <= 0) return null;
  let lo = 1e-6, hi = 2 * Math.PI - 1e-6;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const s = seccionCircular(D_m, mid);
    if (s.area_m2 <= 0) { lo = mid; continue; }
    const fr2 = (Q_m3s * Q_m3s * s.ancho_sup_m) / (G * s.area_m2 ** 3);
    if (fr2 > 1) lo = mid; else hi = mid;
  }
  return seccionCircular(D_m, (lo + hi) / 2);
}

/**
 * Carga específica en el crítico, Hc = dc + yh/2.
 *
 * HDS-5 ecuación A.4, con la observación que la precede: *«At critical depth,
 * the critical velocity head is equal to one-half the hydraulic depth»*, donde
 * la profundidad hidráulica yh = A/T.
 */
export function cargaCritica_m(D_m: number, Q_m3s: number): number | null {
  const c = tiranteCritico(D_m, Q_m3s);
  if (!c || c.ancho_sup_m <= 0) return null;
  const yh = c.area_m2 / c.ancho_sup_m;
  return c.tirante_m + yh / 2;
}

/**
 * Tirante normal en un caño circular, por bisección sobre Manning.
 *
 * Hace falta para la velocidad de salida: cuando manda el control de entrada el
 * caño va parcialmente lleno, y la velocidad con la que el agua sale del caño es
 * la del tirante normal, **no** la de sección llena. En el caso resuelto de
 * HDS-5 la diferencia es de 3,2 a 5,1 m/s: usar la de sección llena subestima la
 * velocidad de salida en un tercio, que es justo el número con el que se decide
 * si hace falta proteger la salida contra socavación.
 */
export function tiranteNormal(p: {
  D_m: number; Q_m3s: number; n: number; pendiente_m_m: number;
}): SeccionCircular | null {
  const { D_m, Q_m3s, n, pendiente_m_m } = p;
  if (D_m <= 0 || Q_m3s <= 0 || n <= 0 || pendiente_m_m <= 0) return null;
  const caudalDe = (s: SeccionCircular): number => {
    if (s.perimetro_m <= 0) return 0;
    const R = s.area_m2 / s.perimetro_m;
    return (1 / n) * s.area_m2 * Math.pow(R, 2 / 3) * Math.sqrt(pendiente_m_m);
  };
  const lleno = seccionCircular(D_m, 2 * Math.PI - 1e-9);
  if (caudalDe(lleno) < Q_m3s) return null;   // no entra ni a sección llena
  let lo = 1e-6, hi = 2 * Math.PI - 1e-9;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (caudalDe(seccionCircular(D_m, mid)) < Q_m3s) lo = mid; else hi = mid;
  }
  return seccionCircular(D_m, (lo + hi) / 2);
}

// ─── Control de entrada (HDS-5 apéndice A) ────────────────────────────────────

export type RegimenEntrada = 'no_sumergida' | 'transicion' | 'sumergida';

export interface CargaEntrada {
  /** Carga sobre el fondo de la boca (m). */
  hw_m:       number;
  hw_sobre_d: number;
  /** Intensidad de descarga Ku·Q/(A·D^0,5), en la escala en que se ajustaron los coeficientes. */
  intensidad: number;
  regimen:    RegimenEntrada;
}

/**
 * Carga de agua arriba del cruce cuando lo que manda es la boca.
 *
 * Ecuaciones A.1 (forma 1), A.2 (forma 2) y A.3 (sumergida) de HDS-5:
 *
 *     forma 1:    HWi/D = Hc/D + K·[Ku·Q/(A·D^0,5)]^M + Ks·S
 *     forma 2:    HWi/D = K·[Ku·Q/(A·D^0,5)]^M
 *     sumergida:  HWi/D = c·[Ku·Q/(A·D^0,5)]²  + Y + Ks·S
 */
export function cargaControlEntrada(
  Q_m3s: number, D_m: number, pendiente_m_m: number, b: BocaAlcantarilla,
): CargaEntrada | null {
  if (Q_m3s <= 0 || D_m <= 0) return null;
  const areaLlena = (Math.PI * D_m * D_m) / 4;
  const intensidad = (KU_SI * Q_m3s) / (areaLlena * Math.sqrt(D_m));
  const Ks = b.al_talud ? KS_BISELADA_AL_TALUD : KS_NORMAL;

  const sumergida = b.c * intensidad * intensidad + b.Y + Ks * pendiente_m_m;

  let noSumergida: number | null = null;
  if (b.forma === 1) {
    const hc = cargaCritica_m(D_m, Q_m3s);
    if (hc !== null) {
      noSumergida = hc / D_m + b.K * Math.pow(intensidad, b.M) + Ks * pendiente_m_m;
    }
  } else {
    noSumergida = b.K * Math.pow(intensidad, b.M);
  }

  let hw_sobre_d: number;
  let regimen: RegimenEntrada;
  if (intensidad >= INTENSIDAD_SUMERGIDA_MIN || noSumergida === null) {
    hw_sobre_d = sumergida;
    regimen = 'sumergida';
  } else if (intensidad <= INTENSIDAD_NO_SUMERGIDA_MAX) {
    hw_sobre_d = noSumergida;
    regimen = 'no_sumergida';
  } else {
    // Zona de transición: HDS-5 la resuelve con una curva tangente dibujada a
    // mano. Acá se toma la mayor de las dos ramas, que es del lado conservador.
    hw_sobre_d = Math.max(noSumergida, sumergida);
    regimen = 'transicion';
  }

  return { hw_m: hw_sobre_d * D_m, hw_sobre_d, intensidad, regimen };
}

// ─── Control de salida (HDS-5 §3.1.5) ─────────────────────────────────────────

export interface CargaSalida {
  hw_m:       number;
  hw_sobre_d: number;
  /** Pérdidas totales H de la ecuación 3.5 (m). */
  perdidas_m: number;
  /** Velocidad a sección llena (m/s). */
  vel_llena_ms: number;
  /** Nivel de la línea de energía en la salida, sobre el fondo (m). */
  nivel_salida_m: number;
}

/**
 * Carga de agua arriba del cruce cuando lo que manda es el caño.
 *
 * Pérdidas por la ecuación 3.5 de HDS-5, que junta entrada, fricción y salida:
 *
 *     H = [1 + ke + KU·n²·L/R^1,33] · V²/(2g)      con KU = 19,63 en SI
 *
 * y la carga por la 3.6b, `HWo = TW + HL − L·S`, despreciando las velocidades de
 * aproximación y de aguas abajo como hace el método.
 *
 * Cuando la salida descarga libre —el caso normal en un cruce de camino de
 * campo— HDS-5 §3.1.5 usa la aproximación de arrancar la línea piezométrica en
 * **el mayor entre el nivel de aguas abajo y (dc + D)/2**: *«a downstream
 * extension of the full flow hydraulic grade line… pierces the plane of the
 * culvert outlet at a point one-half way between critical depth and the top of
 * the barrel»*. Esa aproximación da resultados adecuados hasta una carga de
 * 0,75·D; más abajo haría falta cálculo de remanso, y el aviso lo dice.
 */
export function cargaControlSalida(p: {
  Q_m3s: number; D_m: number; largo_m: number; pendiente_m_m: number;
  n: number; ke: number; nivel_aguas_abajo_m?: number;
}): CargaSalida | null {
  const { Q_m3s, D_m, largo_m, pendiente_m_m, n, ke } = p;
  if (Q_m3s <= 0 || D_m <= 0 || largo_m <= 0 || n <= 0) return null;

  const areaLlena = (Math.PI * D_m * D_m) / 4;
  const vel = Q_m3s / areaLlena;
  const R = D_m / 4;                                    // radio hidráulico a sección llena
  const cargaVel = (vel * vel) / (2 * G);
  const perdidas_m = (1 + ke + (KU_MANNING_SI * n * n * largo_m) / Math.pow(R, 1.33)) * cargaVel;

  const dc = tiranteCritico(D_m, Q_m3s)?.tirante_m ?? D_m;
  const porDefecto = (Math.min(dc, D_m) + D_m) / 2;
  const nivel_salida_m = Math.max(p.nivel_aguas_abajo_m ?? 0, porDefecto);

  const hw_m = nivel_salida_m + perdidas_m - largo_m * pendiente_m_m;
  return {
    hw_m, hw_sobre_d: hw_m / D_m, perdidas_m,
    vel_llena_ms: vel, nivel_salida_m,
  };
}

// ─── El dimensionado ──────────────────────────────────────────────────────────

export interface OpcionAlcantarilla {
  diametro_mm:   number;
  /** La carga que gobierna: la mayor de las dos. */
  hw_m:          number;
  hw_sobre_d:    number;
  /** Cuál de los dos controles ganó. */
  manda:         'entrada' | 'salida';
  entrada:       CargaEntrada;
  salida:        CargaSalida;
  /** Velocidad de salida al tirante normal (m/s); null si no se puede resolver. */
  vel_salida_ms: number | null;
  /** `true` si la carga que produce entra en la admisible. */
  alcanza:       boolean;
  avisos:        string[];
}

export interface ResultadoAlcantarilla {
  /** El menor diámetro de la serie que cumple. Null si ninguno alcanza. */
  elegido:  OpcionAlcantarilla | null;
  opciones: OpcionAlcantarilla[];
  boca:     BocaAlcantarilla;
  n_usado:  number;
  avisos:   string[];
}

/**
 * Del caudal de la cuenca al diámetro del caño.
 *
 * `carga_admisible_m` es cuánta agua se puede dejar embalsar arriba del cruce
 * antes de que moje lo que no tiene que mojar: normalmente la altura de la
 * calzada menos una revancha. HDS-5 usa 0,61 m (2 pies) de revancha bajo el
 * hombro del camino en sus ejemplos de diseño.
 */
export function diametroAlcantarilla(p: {
  caudal_m3s:        number;
  largo_m:           number;
  pendiente_m_m:     number;
  carga_admisible_m: number;
  boca_id?:          string;
  /** Nivel de aguas abajo sobre el fondo de la salida (m). Si no se sabe, 0. */
  nivel_aguas_abajo_m?: number;
}): ResultadoAlcantarilla {
  const b = boca(p.boca_id ?? 'hormigon_campana');
  const [, n_rugoso] = N_MANNING[b.material];
  const n_usado = n_rugoso;
  const avisos: string[] = [];

  if (p.caudal_m3s <= 0) avisos.push('Sin caudal de diseño no hay diámetro que calcular.');
  if (p.pendiente_m_m <= 0) {
    avisos.push('Con pendiente cero el caño no desagota solo: el método supone una pendiente de escurrimiento y abajo de ~0,5 % conviene revisar el nivel de salida a mano.');
  }

  const opciones: OpcionAlcantarilla[] = [];
  for (const dmm of DIAMETROS_MM) {
    const D_m = dmm / 1000;
    const entrada = cargaControlEntrada(p.caudal_m3s, D_m, p.pendiente_m_m, b);
    const salida  = cargaControlSalida({
      Q_m3s: p.caudal_m3s, D_m, largo_m: p.largo_m, pendiente_m_m: p.pendiente_m_m,
      n: n_usado, ke: b.ke, nivel_aguas_abajo_m: p.nivel_aguas_abajo_m,
    });
    if (!entrada || !salida) continue;

    const manda = entrada.hw_m >= salida.hw_m ? 'entrada' : 'salida';
    const hw_m = Math.max(entrada.hw_m, salida.hw_m);
    const normal = tiranteNormal({ D_m, Q_m3s: p.caudal_m3s, n: n_usado, pendiente_m_m: p.pendiente_m_m });
    const vel_salida_ms = normal && normal.area_m2 > 0 ? p.caudal_m3s / normal.area_m2 : null;

    const av: string[] = [];
    if (entrada.intensidad > INTENSIDAD_NO_SUMERGIDA_MAX && entrada.intensidad < INTENSIDAD_SUMERGIDA_MIN) {
      av.push('Queda en la zona de transición de las ecuaciones: acequia toma la rama más desfavorable.');
    }
    const hwd = hw_m / D_m;
    if (hwd > HW_SOBRE_D_HABITUAL[1]) {
      av.push(`Embalsa ${hwd.toFixed(1)} veces el diámetro arriba del cruce; las reparticiones de caminos suelen no admitir más de ${HW_SOBRE_D_HABITUAL[1]}.`);
    }
    if (manda === 'salida' && hwd < 0.75) {
      av.push('El control de salida se calculó con la aproximación de HDS-5, que vale hasta 0,75 del diámetro; abajo de eso haría falta cálculo de remanso.');
    }

    opciones.push({
      diametro_mm: dmm, hw_m, hw_sobre_d: hwd, manda, entrada, salida,
      vel_salida_ms, alcanza: hw_m <= p.carga_admisible_m, avisos: av,
    });
  }

  const elegido = opciones.find(o => o.alcanza) ?? null;
  if (!elegido && opciones.length > 0) {
    avisos.push('Ningún diámetro de la serie entra en la carga admisible: el cruce pide batería de dos caños, un puente o levantar la calzada.');
  }
  if (elegido && elegido.manda === 'entrada') {
    avisos.push('Manda la boca, no el caño: mejorar la entrada —una campana en vez de un canto a escuadra— rinde más que agrandar el diámetro.');
  }
  if (elegido && elegido.manda === 'salida') {
    avisos.push('Manda el caño: acá sí pagan el largo y la rugosidad, y agrandar el diámetro es lo que baja la carga.');
  }

  return { elegido, opciones, boca: b, n_usado, avisos };
}
