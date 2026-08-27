/**
 * Hidrología del predio — motor compartido (H0).
 *
 * Hasta acá la hidrología vivía encerrada en la pestaña Cuenca: el SCS-CN, la
 * tormenta de Gumbel y el grupo hidrológico se calculaban ahí y no salían. El
 * resto de las herramientas de diseño (swales, represa, erosión) pedían al
 * usuario que adivinara a mano un "coeficiente de escorrentía" y una "lluvia de
 * diseño" que la app YA sabe.
 *
 * Este módulo responde una sola pregunta, y la responde una sola vez:
 *
 *     Para este predio, ¿cuál es el CN compuesto, la tormenta de diseño
 *     y el coeficiente de escorrentía?
 *
 * derivándolo de `datosSuelo.grupo_hidro` (Saxton-Rawls sobre SoilGrids),
 * `datosCobertura` (ESA WorldCover) y `datosExtremos.tormenta` (Gumbel sobre
 * máximos anuales de P24h). No reimplementa nada: reusa COBERTURAS y
 * `escurrimientoSCS` de `cuenca.ts`.
 *
 * Lo único realmente nuevo es el CN COMPUESTO — mapear las clases WorldCover a
 * las coberturas de la tabla SCS y ponderarlas por área — y el objeto
 * `confianza`, que dice qué faltó, qué se asumió y cuánto hay que creerle al
 * número. Todo orientativo: diseño preliminar, no proyecto ejecutivo.
 */
import { COBERTURAS, escurrimientoSCS, type GrupoHidro } from './cuenca';
import type { FuenteRelieve } from './grillaElevacion';

// ─── Mapeo ESA WorldCover → coberturas SCS ────────────────────────────────────

interface MapeoWC {
  /** id en COBERTURAS (cuenca.ts) cuando el CN depende del grupo hidrológico */
  coberturaId: string | null;
  /** CN fijo, para superficies donde el suelo debajo no manda */
  cnFijo:      number | null;
  /** factor C de cobertura (USLE) — lo consume `erosion.ts` */
  usleC:       number;
}

/**
 * WorldCover no distingue estado de manejo (una pastura sobrepastoreada y una
 * en buen estado son la misma clase 30), así que se asume el estado NEUTRO —
 * "regular" — y se avisa. Asumir "bueno" subestimaría la escorrentía, que es el
 * error caro cuando el número se usa para dimensionar.
 */
const MAPEO_WC: Record<number, MapeoWC> = {
  10:  { coberturaId: 'monte_regular',   cnFijo: null, usleC: 0.004 },  // Bosque / arbolado
  20:  { coberturaId: 'matorral',        cnFijo: null, usleC: 0.014 },  // Arbustal
  30:  { coberturaId: 'pastura_regular', cnFijo: null, usleC: 0.040 },  // Pastizal
  40:  { coberturaId: 'cultivo_bueno',   cnFijo: null, usleC: 0.280 },  // Cultivo
  50:  { coberturaId: 'urbano',          cnFijo: null, usleC: 0.010 },  // Construido
  60:  { coberturaId: 'barbecho',        cnFijo: null, usleC: 1.000 },  // Suelo desnudo / ralo
  70:  { coberturaId: null,              cnFijo: 98,   usleC: 0.000 },  // Nieve / hielo
  80:  { coberturaId: null,              cnFijo: 100,  usleC: 0.000 },  // Agua (toda la lluvia es "escurrimiento")
  90:  { coberturaId: null,              cnFijo: 92,   usleC: 0.010 },  // Humedal herbáceo (saturado)
  95:  { coberturaId: 'monte_regular',   cnFijo: null, usleC: 0.003 },  // Manglar
  100: { coberturaId: 'matorral',        cnFijo: null, usleC: 0.020 },  // Musgo / liquen
};

/** Cobertura neutra cuando no hay dato de WorldCover cargado. */
const COBERTURA_POR_DEFECTO = 'pastura_regular';
/** Grupo hidrológico neutro cuando no hay dato de suelo. */
const GRUPO_POR_DEFECTO: GrupoHidro = 'B';
/** Lluvia de diseño de último recurso, cuando no hay serie climática. */
const PRECIP_POR_DEFECTO = 50;
/** Período de retorno por defecto: el estándar para obras rurales de conservación. */
export const T_POR_DEFECTO = 10;

/** C de USLE de referencia (pastizal): con esto se compara la cobertura real. */
export const USLE_C_REF = 0.04;

/** Resolución nominal de cada fuente de relieve (m). `null` = no se sabe. */
const RESOLUCION_DEM: Record<FuenteRelieve, number | null> = {
  glo30: 30, srtm30: 30, terrarium: 30, usuario: null,
  usgs3dep: 10, ignfr: 5, ignes: 5, hrdemca: 2, ahnnl: 0.5, swisstopo: 2,
};

export function resolucionDem(fuente: FuenteRelieve | undefined): number | null {
  return fuente ? RESOLUCION_DEM[fuente] ?? null : null;
}

// ─── Salud del cálculo ────────────────────────────────────────────────────────

export type NivelAviso = 'ok' | 'aviso' | 'alerta';

export interface AvisoCalculo {
  id:      string;
  nivel:   NivelAviso;
  titulo:  string;
  detalle: string;
}

/**
 * Datos de entrada que una herramienta puede declarar. Cada una declara SÓLO
 * los que realmente usa: la erosión no mira el clima y la represa no compone un
 * CN por cobertura, así que mostrarles esos casilleros tachados mentiría sobre
 * lo que entró al cálculo.
 */
export type FuenteDato = 'relieve' | 'suelo' | 'cobertura' | 'clima';

export interface Confianza {
  nivel:   'alta' | 'media' | 'baja';
  avisos:  AvisoCalculo[];
  fuentes: Partial<Record<FuenteDato, boolean>>;
}

/**
 * Nivel de confianza a partir de los avisos y de qué fuentes faltaron.
 *
 * La regla, que vale para las cuatro herramientas: una alerta o dos fuentes
 * faltantes bajan a `baja`; un aviso o una fuente faltante dejan `media`; sólo
 * queda `alta` cuando entró todo lo que se podía cargar y nada llamó la
 * atención. Los avisos de nivel `ok` son afirmaciones de alcance del método
 * —cosas que el usuario no puede arreglar cargando datos— y por eso no bajan
 * el nivel: informan cómo leer el número, no lo desacreditan.
 */
export function armarConfianza(
  avisos:  AvisoCalculo[],
  fuentes: Partial<Record<FuenteDato, boolean>>,
): Confianza {
  const faltan = Object.values(fuentes).filter(v => v === false).length;
  const nivel: Confianza['nivel'] =
    avisos.some(a => a.nivel === 'alerta') || faltan >= 2 ? 'baja' :
    avisos.some(a => a.nivel === 'aviso')  || faltan >= 1 ? 'media' : 'alta';
  return { nivel, avisos, fuentes };
}

// ─── Entrada y salida ─────────────────────────────────────────────────────────

export interface ContextoHidro {
  /** fuente del relieve, para juzgar si el DEM alcanza para el área */
  fuenteDem?:      FuenteRelieve | null;
  area_ha?:        number | null;
  pendiente_pct?:  number | null;
  /** el área analizada se sale de la grilla cargada (subestima la cuenca) */
  fueraDeGrilla?:  boolean;
  /** qué se está midiendo, para redactar el aviso de DEM ("una cuenca de 30 ha") */
  objeto?:         string;
}

export interface EntradaHidro {
  suelo?:     { grupo: GrupoHidro; ksat_mm_h: number; capa_limitante: string } | null;
  /** composición de cobertura: valor WorldCover + % del predio */
  cobertura?: Array<{ wc: number; pct: number }> | null;
  tormenta?:  { recurrencias: Array<{ periodo_retorno: number; mm: number }>; anios: number } | null;
  /** período de retorno elegido (años). Por defecto T10. */
  periodoRetorno?: number;
  contexto?:  ContextoHidro;
}

export interface HidrologiaPredio {
  /** curva número compuesta, ponderada por área */
  cn:              number;
  grupo:           GrupoHidro;
  grupoAsumido:    boolean;
  ksat_mm_h:       number | null;
  /** lluvia de diseño del evento (mm en 24 h) */
  precip_mm:       number;
  periodoRetorno:  number;
  precipAsumida:   boolean;
  /** escurrimiento directo del evento por SCS-CN (mm) */
  escurrimiento_mm: number;
  /** fracción de la lluvia que escurre EN ESTE EVENTO — deja de ser un slider a ojo */
  coef:            number;
  /** factor C de USLE ponderado por cobertura (para erosión) */
  usleC:           number;
  composicion:     Array<{ nombre: string; pct: number; cn: number }>;
  confianza:       Confianza;
}

// ─── Núcleo ───────────────────────────────────────────────────────────────────

const CN_POR_ID = new Map(COBERTURAS.map(c => [c.id, c]));

function cnDeClase(wc: number, grupo: GrupoHidro): { cn: number; usleC: number } | null {
  const m = MAPEO_WC[wc];
  if (!m) return null;
  if (m.cnFijo !== null) return { cn: m.cnFijo, usleC: m.usleC };
  const cob = m.coberturaId ? CN_POR_ID.get(m.coberturaId) : undefined;
  if (!cob) return null;
  return { cn: cob.cn[grupo], usleC: m.usleC };
}

/**
 * Todo lo hidrológico del predio en un solo objeto. Función pura: mismos datos,
 * mismo resultado. Nunca tira — si falta un dato asume el valor neutro, lo
 * declara en `confianza.avisos` y baja el nivel de confianza.
 */
export function hidrologiaPredio(entrada: EntradaHidro): HidrologiaPredio {
  const avisos: AvisoCalculo[] = [];

  // ── Grupo hidrológico ──
  const hayS = !!entrada.suelo;
  const grupo = entrada.suelo?.grupo ?? GRUPO_POR_DEFECTO;
  const ksat  = entrada.suelo?.ksat_mm_h ?? null;
  if (!hayS) {
    avisos.push({
      id: 'sin_suelo', nivel: 'aviso',
      titulo: `Sin datos de suelo: asumí grupo hidrológico ${GRUPO_POR_DEFECTO}`,
      detalle: 'El grupo define cuánta lluvia infiltra. Cargá Suelo para que el CN y la infiltración salgan del perfil real del predio.',
    });
  }

  // ── CN compuesto ponderado por área ──
  const items = (entrada.cobertura ?? []).filter(c => c.pct > 0);
  const hayC = items.length > 0;
  const composicion: Array<{ nombre: string; pct: number; cn: number }> = [];
  let cn = 0, usleC = 0, pctUsado = 0, pctSinMapa = 0;

  if (hayC) {
    for (const it of items) {
      const v = cnDeClase(it.wc, grupo);
      if (!v) { pctSinMapa += it.pct; continue; }
      cn    += v.cn    * it.pct;
      usleC += v.usleC * it.pct;
      pctUsado += it.pct;
      composicion.push({ nombre: nombreWC(it.wc), pct: it.pct, cn: v.cn });
    }
  }

  if (pctUsado > 0) {
    cn    = cn    / pctUsado;
    usleC = usleC / pctUsado;
  } else {
    const cob = CN_POR_ID.get(COBERTURA_POR_DEFECTO)!;
    cn    = cob.cn[grupo];
    usleC = USLE_C_REF;
    avisos.push({
      id: 'sin_cobertura', nivel: 'aviso',
      titulo: 'Sin datos de cobertura: asumí pastura en estado regular',
      detalle: 'Cargá Cobertura para que el CN se componga con el bosque, pastizal y cultivo reales del predio en lugar de un valor único.',
    });
  }

  if (pctSinMapa > 5) {
    avisos.push({
      id: 'cobertura_parcial', nivel: 'aviso',
      titulo: `${Math.round(pctSinMapa)} % del predio con cobertura sin equivalencia SCS`,
      detalle: 'Ese porcentaje quedó fuera del promedio ponderado. El CN sale del resto del predio.',
    });
  } else if (hayC) {
    avisos.push({
      id: 'cobertura_neutra', nivel: 'ok',
      titulo: 'CN compuesto por cobertura satelital',
      detalle: 'WorldCover no distingue el estado de manejo, así que pasturas y cultivos se toman en condición regular. Si tu manejo es mejor que eso, el CN real es más bajo (menos escorrentía).',
    });
  }

  cn = Math.round(Math.min(100, Math.max(30, cn)) * 10) / 10;

  // ── Tormenta de diseño ──
  const T = entrada.periodoRetorno ?? T_POR_DEFECTO;
  const recs = entrada.tormenta?.recurrencias ?? [];
  const hit = recs.find(r => r.periodo_retorno === T);
  const hayCl = !!hit && hit.mm > 0;
  const precip = hayCl ? hit.mm : PRECIP_POR_DEFECTO;

  if (!hayCl) {
    avisos.push({
      id: 'sin_clima', nivel: 'alerta',
      titulo: `Sin tormenta de diseño: asumí ${PRECIP_POR_DEFECTO} mm`,
      detalle: 'Es un número inventado, no el de tu lugar. Cargá Clima → Extremos para que la lluvia salga del ajuste de Gumbel sobre 30+ años de tu ubicación.',
    });
  } else {
    const anios = entrada.tormenta?.anios ?? 0;
    if (anios > 0 && T > anios) {
      avisos.push({
        id: 'T_extrapolado', nivel: 'alerta',
        titulo: `T${T} extrapolado desde ${anios} años de serie`,
        detalle: `Estás pidiendo una recurrencia más larga que la serie disponible. El valor sale de la cola de la distribución, no de un evento observado. Para dimensionar, T${T} con ${anios} años es una extrapolación fuerte.`,
      });
    } else if (anios > 0 && anios < 20) {
      avisos.push({
        id: 'serie_corta', nivel: 'aviso',
        titulo: `Serie climática corta (${anios} años)`,
        detalle: 'Gumbel se banca series cortas pero pierde precisión en las recurrencias altas. Tomá el número como orden de magnitud.',
      });
    }
  }

  // ── Escurrimiento y coeficiente, por SCS-CN ──
  const Q = escurrimientoSCS(precip, cn);
  const coef = precip > 0 ? Math.min(1, Math.max(0, Q / precip)) : 0;

  if (Q <= 0.05) {
    avisos.push({
      id: 'sin_escurrimiento', nivel: 'alerta',
      titulo: 'Con este CN y esta lluvia, el SCS da escurrimiento cero',
      detalle: `CN ${cn} sobre ${precip} mm: toda la lluvia se va en abstracción inicial e infiltración. Es un resultado válido (suelo permeable y bien cubierto) pero no sirve para dimensionar: subí el período de retorno.`,
    });
  }

  // ── Avisos de contexto (DEM, pendiente, extensión) ──
  avisosDeContexto(entrada.contexto, avisos);

  // ── Nivel de confianza ──
  const confianza = armarConfianza(avisos, { suelo: hayS, cobertura: hayC, clima: hayCl });

  if (confianza.nivel === 'alta') {
    avisos.unshift({
      id: 'completo', nivel: 'ok',
      titulo: 'Suelo, cobertura y clima cargados',
      detalle: 'El CN, la tormenta y el coeficiente salen de datos del predio, no de supuestos.',
    });
  }

  return {
    cn, grupo, grupoAsumido: !hayS, ksat_mm_h: ksat,
    precip_mm: precip, periodoRetorno: T, precipAsumida: !hayCl,
    escurrimiento_mm: Math.round(Q * 10) / 10,
    coef: Math.round(coef * 100) / 100,
    usleC: Math.round(usleC * 1000) / 1000,
    composicion: composicion.sort((a, b) => b.pct - a.pct),
    confianza,
  };
}

/**
 * Avisos que no dependen de la hidrología sino de si la GRILLA alcanza para lo
 * que se le está pidiendo. Es el patrón que InfoDrainage llama "health check":
 * el número siempre sale, lo que cambia es cuánto vale.
 */
export function avisosDeContexto(ctx: ContextoHidro | undefined, avisos: AvisoCalculo[]): void {
  if (!ctx) return;

  const obj  = ctx.objeto ?? 'un predio';
  const res  = resolucionDem(ctx.fuenteDem ?? undefined);
  const area = ctx.area_ha ?? null;
  if (res !== null && area !== null && area > 0) {
    // Lado del área analizada si fuera cuadrada, en celdas de DEM.
    const ladoM = Math.sqrt(area * 10_000);
    const celdas = ladoM / res;
    if (celdas < 12) {
      avisos.push({
        id: 'dem_grueso', nivel: 'alerta',
        titulo: `DEM de ${res} m para ${obj} de ${area.toFixed(1)} ha`,
        detalle: `Entra en unas ${Math.round(celdas)} celdas de lado: cada celda del modelo cubre ${Math.round(res * res / 100) / 100} ha. El resultado es orientativo — para replantear, cargá un DEM propio (dron o LiDAR) en Topografía.`,
      });
    } else if (celdas < 30) {
      avisos.push({
        id: 'dem_justo', nivel: 'aviso',
        titulo: `DEM de ${res} m: resolución justa para ${area.toFixed(1)} ha`,
        detalle: 'Alcanza para ver la forma del terreno y decidir, no para cotas de obra.',
      });
    }
  }

  const p = ctx.pendiente_pct ?? null;
  if (p !== null) {
    if (p > 15) {
      avisos.push({
        id: 'pendiente_alta', nivel: 'alerta',
        titulo: `Pendiente media ${p.toFixed(1)} %: fuera del rango de swales`,
        detalle: 'Por encima de 15 % las zanjas a nivel se vuelven inestables y el talud aguas abajo falla. En esa pendiente corresponden terrazas, andenes o forestación, no swales.',
      });
    } else if (p < 1) {
      avisos.push({
        id: 'pendiente_baja', nivel: 'aviso',
        titulo: `Pendiente media ${p.toFixed(1)} %: terreno casi llano`,
        detalle: 'Con tan poca pendiente el agua no se concentra: las curvas de nivel se separan muchísimo y el trazado pierde sentido. Revisá si el problema es de anegamiento (drenaje) y no de escorrentía.',
      });
    }
  }

  if (ctx.fueraDeGrilla) {
    avisos.push({
      id: 'fuera_grilla', nivel: 'alerta',
      titulo: 'La cuenca de aporte excede la grilla cargada',
      detalle: 'Parte del agua que llega viene de afuera del área calculada, así que el volumen está SUBESTIMADO. Ampliá la topografía más allá del límite del predio.',
    });
  }
}

function nombreWC(wc: number): string {
  const n: Record<number, string> = {
    10: 'Bosque / arbolado', 20: 'Arbustal', 30: 'Pastizal', 40: 'Cultivo',
    50: 'Construido', 60: 'Suelo desnudo', 70: 'Nieve / hielo', 80: 'Agua',
    90: 'Humedal', 95: 'Manglar', 100: 'Musgo / liquen',
  };
  return n[wc] ?? `Clase ${wc}`;
}

/** Períodos de retorno ofrecidos en la UI (los que calcula `climaExtremos`). */
export const PERIODOS_RETORNO = [2, 5, 10, 25, 50, 100] as const;
