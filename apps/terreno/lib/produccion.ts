/**
 * Módulo de sistemas productivos agropecuarios.
 * 7.1 Balance hídrico productivo (FAO-56 simplificado)
 * 7.3 Receptividad ganadera y agua por potrero
 * 7.5 Cortinas rompevientos
 * Todos los valores son orientativos — no reemplazan asesoramiento agronómico.
 */
import type { MesDato } from './clima';
import { MESES } from './clima';
import { CULTIVOS_KC, type CultivoKc } from './calendario';
import { bandaUso } from './modulacion';

export { CULTIVOS_KC, type CultivoKc };

// ─── 7.1 Balance hídrico productivo ──────────────────────────────────────────

export interface BalanceProdMes {
  mes:                 string;
  precip_mm:           number;
  etc_mm:              number;   // ETP × Kc
  deficit_mm:          number;   // max(0, ETc − precip)
  superavit_mm:        number;   // max(0, precip − ETc)
  volumen_deficit_m3:  number;   // déficit × área_ha × 10
}

export interface ResultadoBalanceProd {
  cultivo:             CultivoKc;
  area_ha:             number;
  meses:               BalanceProdMes[];
  deficit_anual_mm:    number;
  reservorio_m3:       number;   // volumen total a almacenar para cubrir déficits
  meses_deficit:       number;
  meses_exceso:        number;
}

export function calcularBalanceProductivo(
  meses: MesDato[],
  cultivo: CultivoKc,
  area_ha: number,
): ResultadoBalanceProd {
  const resultMeses: BalanceProdMes[] = meses.map((m, i) => {
    const etc_mm       = Math.round(m.etp_mm * cultivo.kc * 10) / 10;
    const deficit_mm   = Math.round(Math.max(0, etc_mm - m.precip_mm) * 10) / 10;
    const superavit_mm = Math.round(Math.max(0, m.precip_mm - etc_mm) * 10) / 10;
    return {
      mes:               MESES[i] ?? '',
      precip_mm:         m.precip_mm,
      etc_mm,
      deficit_mm,
      superavit_mm,
      volumen_deficit_m3: Math.round(deficit_mm * area_ha * 10 * 10) / 10,
    };
  });

  const deficit_anual_mm = Math.round(resultMeses.reduce((s, m) => s + m.deficit_mm, 0) * 10) / 10;
  const reservorio_m3    = Math.round(resultMeses.reduce((s, m) => s + m.volumen_deficit_m3, 0) * 10) / 10;
  const meses_deficit    = resultMeses.filter(m => m.deficit_mm > 0).length;
  const meses_exceso     = resultMeses.filter(m => m.superavit_mm > 0).length;

  return { cultivo, area_ha, meses: resultMeses, deficit_anual_mm, reservorio_m3, meses_deficit, meses_exceso };
}

/* ─── 7.3 Receptividad ganadera ───────────────────────────────────────────────
 *
 * AUDITORÍA DEL EQUIVALENTE VACA — 01/10/2026
 *
 * Esta función venía con `consumo_ev_año = 8 * 365` y ningún respaldo. El
 * hallazgo de la auditoría no es que el 8 sea un error de tipeo: es que **el
 * consumo de un EV en kilos de materia seca no es una constante**, y escribirlo
 * como constante es la falla.
 *
 * El requerimiento de 1 EV está definido en ENERGÍA, no en kilos: son
 * 18,54 Mcal de energía metabolizable por día. Cuántos kilos de pasto hacen
 * falta para juntar esas Mcal depende de la densidad energética del forraje, y
 * eso cambia con el tipo de pastizal:
 *
 *     18,54 / 2,32 Mcal/kg = 8,0 kg MS/día   ← pastura de calidad
 *     18,54 / 1,87 Mcal/kg = 9,9 kg MS/día   ← pastizal natural (≈52% digest.)
 *     18,54 / 1,55 Mcal/kg = 12,0 kg MS/día  ← forraje grosero, maduro, diferido
 *
 * Los tres números circulan en la bibliografía como «el» consumo de un EV
 * (3.650 y 4.380 kg MS/año son los dos últimos), y no se contradicen: son el
 * mismo requerimiento de energía dividido por forrajes distintos.
 *
 * O sea que la app venía usando el valor de una pastura de calidad y
 * aplicándolo a todo el planeta, incluido el pastizal semiárido de 700 kg
 * MS/ha/año, donde el forraje es grosero y el número correcto es 12. El error
 * era más grande justo donde el margen es más fino: la receptividad salía ~24%
 * alta para un pastizal natural promedio y hasta ~50% alta para un pastizal
 * grosero. Dicho de otro modo: lo que la app mostraba como «el» número era en
 * realidad el techo del rango.
 *
 * Como la app no sabe qué calidad tiene el forraje de este predio, no lo
 * inventa: usa el valor del pastizal natural y además devuelve el rango
 * completo. Rige la regla de la casa — cuando la ciencia da un rango, se
 * muestra el rango.
 *
 * Los coeficientes EV por categoría, que al cerrar esa auditoría quedaron como
 * deuda, ya están: viven en `categorias.ts` con la tabla de AACREA y su fuente.
 * Esta función ya no recibe un «tipo de animal» con un coeficiente inventado,
 * recibe el perfil del rodeo real.
 */

/**
 * Requerimiento de 1 Equivalente Vaca, en Mcal de energía metabolizable por día.
 *
 * Fuente: Cocimano, M., Lange, A. y Menvielle, E. (1975), «Equivalencias
 * ganaderas para vacunos de carne y ovinos», AACREA. El EV es el promedio anual
 * de los requerimientos de una vaca de 400 kg que gesta y cría un ternero hasta
 * el destete a los 6 meses con 160 kg, **incluido el forraje que come el
 * ternero**.
 *
 * Rango de validez: es la unidad de referencia de la ganadería pastoril del Cono
 * Sur. Para un rodeo lechero en producción no alcanza —una vaca en lactancia
 * pide mucho más— y la app no tiene todavía esa categoría.
 *
 * Quién lo lee: `consumoEV_kgMS_dia`, y por esa vía toda la receptividad y el
 * agua de bebida del rodeo. Cambiarlo cambia cuántos animales dice la app que
 * entran en el campo.
 */
export const EV_MCAL_EM_DIA = 18.54;

/**
 * Densidad energética del forraje, en Mcal de EM por kg de materia seca.
 *
 * `natural` es el valor con cita directa: un pastizal natural de 5.000 kg
 * MS/ha/año tiene una concentración media de 1,87 Mcal/kg (≈52% de
 * digestibilidad), lo que da 9.350 Mcal EM/ha —el caso resuelto del test—.
 * `grosero` y `calidad` son los extremos del rango que reporta la bibliografía
 * de composición de forrajes (gramíneas de porte medio y bajo, 1,9–2,7 Mcal/kg
 * según estado fenológico; pasturas naturales hasta 2,4; forraje maduro o
 * diferido por debajo de 1,6).
 */
export const EM_FORRAJE = {
  /** Maduro, diferido, fibroso: hace falta más kilo para la misma energía. */
  grosero: 1.55,
  /** Pastizal natural, el valor por defecto. */
  natural: 1.87,
  /** Pastura implantada en estado vegetativo. */
  calidad: 2.40,
} as const;

/**
 * Cuántos kilos de materia seca por día necesita 1 EV, dado un forraje.
 *
 * Es la división que faltaba: `EV_MCAL_EM_DIA / em_mcal_kg`. Con el valor del
 * pastizal natural da 9,9 kg/día ≈ 3.620 kg/año, que es la cifra de 3.650 que
 * cita la bibliografía.
 */
export function consumoEV_kgMS_dia(em_mcal_kg: number): number {
  if (!(em_mcal_kg > 0)) return NaN;
  return EV_MCAL_EM_DIA / em_mcal_kg;
}

/**
 * Fracción del forraje producido que termina dentro del animal.
 *
 * ## ⚠ Corregido el 02/10/2026 — este número ya no se usa para calcular
 *
 * El 0,50 venía de la regla de manejo de pastizales más difundida —«take half,
 * leave half»— y se aplicaba a todo predio por igual. **La fuente que acuñó esa
 * regla dice explícitamente dónde vale, y no es en todas partes.** Holechek
 * (1988), después de revisar los estudios de intensidad de pastoreo de quince
 * tipos de pastizal de Estados Unidos: *«The general guideline of take half and
 * leave half of the current season's growth recommended by early range managers
 * appears applicable only to humid and annual grassland ranges.»*
 *
 * En un arbustal de menos de 300 mm el uso admisible es 30 %, no 50 %: la
 * receptividad que mostraba acequia era 1,67 veces la que corresponde, y el
 * error era más grande justo donde el margen es más fino. Es el mismo error que
 * ya había aparecido dos veces en esta cadena —el equivalente vaca y el agua de
 * bebida—: el valor de una situación buena aplicado a todo el planeta.
 *
 * El uso admisible ahora sale de la banda de precipitación del predio, en
 * `modulacion.ts`. Esta constante queda sólo porque es el número viejo y haber
 * escrito acá por qué se fue vale más que borrarla.
 *
 * @deprecated Usá `bandaUso(precip_anual_mm).inicial` de `modulacion.ts`.
 */
export const EFICIENCIA_UTILIZACION = 0.50;

/**
 * El rodeo visto desde la receptividad: cuánto pesa en EV una cabeza promedio y
 * cuánta agua toma.
 *
 * Son los dos únicos números que este cálculo necesita saber de la hacienda, y
 * los dos salen de sumar los lotes reales (`rodeo.ts`). Antes esto era una fila
 * de una tabla de seis tipos sin fuente; el coeficiente por categoría ahora vive
 * en `categorias.ts`.
 */
export interface PerfilRodeo {
  /** EV por cabeza, promediado sobre las cabezas que pastorean. */
  ev_por_cabeza: number;
  /** Litros por cabeza y día, promediado sobre todo el rodeo. */
  agua_l_dia:    number;
}

// Producción forrajera natural estimada por precipitación (kg MS/ha/año)
function prodForrajera(precip_mm: number): number {
  if (precip_mm < 300) return 700;
  if (precip_mm < 500) return 1500;
  if (precip_mm < 700) return 3000;
  if (precip_mm < 900) return 5000;
  return 7000;
}

/**
 * Los ajustes de paisaje que el predio le pone a la receptividad.
 *
 * Los dos son opcionales y los dos vienen de `modulacion.ts`. Si no se pasan, la
 * receptividad se calcula sobre la superficie bruta y sin ajuste por
 * distribución, que es lo que la app hacía antes: sobreestima, y por eso el
 * resultado dice `ajustada: false` para que la pantalla pueda avisarlo.
 */
export interface AjustesPaisaje {
  /** Hectáreas que son tierra de pastoreo, ya descontadas las exclusiones. */
  ha_pastoreables?: number;
  /**
   * Factor de distribución: el MENOR de pendiente y distancia al agua, nunca el
   * producto. La regla es de la fuente, no una elección de acequia.
   */
  factor_distribucion?: number;
  /** El pastizal es de especies anuales: admite más uso que un perenne. */
  deAnuales?: boolean;
}

export interface ResultadoReceptividad {
  ef_kg_ha:         number;   // forraje producido, kg MS/ha/año
  carga_ev:         number;   // carga en equivalentes vaca, con forraje natural
  /** El piso del rango: forraje grosero, que pide más kilos por EV. */
  carga_ev_min:     number;
  /** El techo: pastura de calidad. Es lo que la app mostraba antes, sola. */
  carga_ev_max:     number;
  /** Cabezas que entran manteniendo la composición del rodeo cargado. */
  carga_animales:   number;
  carga_animales_min: number;
  carga_animales_max: number;
  /** Kilos de MS por día que necesita 1 EV con el forraje supuesto. */
  consumo_ev_kg_dia: number;
  /** La densidad energética supuesta, para poder decirla en pantalla. */
  em_mcal_kg:       number;
  agua_l_dia:       number;   // demanda hídrica total L/día
  potreros_voisin:  number;   // N potreros sugeridos para rotación Voisin
  dias_ocupacion:   number;   // días de ocupación por potrero
  area_potrero_ha:  number;   // área sugerida por potrero
  /** Fracción del forraje que se le asigna al animal, por banda de lluvia. */
  uso_admisible:    number;
  /** Nombre de la banda, para poder decirlo en pantalla. */
  banda_uso:        string;
  /** Hectáreas de pastoreo efectivamente usadas en la cuenta. */
  ha_usadas:        number;
  /** El factor de distribución aplicado. 1 cuando no se pasó ninguno. */
  factor_distribucion: number;
  /** `false` cuando se calculó sobre la superficie bruta y sin ajuste. */
  ajustada:         boolean;
}

/**
 * Receptividad del campo: cuántos animales aguanta el pasto.
 *
 * Cadena de unidades, explícita porque es donde se cuelan los errores:
 *
 *   kg MS/ha/año × ha × (adimensional) ÷ (kg MS/día × 365 día/año) = EV
 *
 * Rango de validez: `prodForrajera` es una escalera por precipitación, pensada
 * para pastizal natural sin fertilización ni riego. En una pastura implantada y
 * fertilizada subestima la oferta; en un pastizal degradado la sobreestima. Y no
 * mira la estacionalidad: un campo con la misma lluvia anual repartida en cuatro
 * meses no aguanta la misma carga todo el año.
 *
 * El **uso admisible** sale de la banda de precipitación (`modulacion.ts`) y no
 * de un 0,50 fijo; los **ajustes de paisaje** son opcionales y, cuando no vienen,
 * la cuenta queda sobre la superficie bruta, que es el lado optimista. El
 * resultado dice `ajustada: false` para que la pantalla no lo presente como si
 * tuviera el terreno en cuenta.
 */
export function calcularReceptividad(
  area_ha: number,
  precip_anual_mm: number,
  perfil: PerfilRodeo,
  em_mcal_kg: number = EM_FORRAJE.natural,
  paisaje?: AjustesPaisaje,
): ResultadoReceptividad {
  const ef_kg_ha = prodForrajera(precip_anual_mm);
  const banda = bandaUso(precip_anual_mm, paisaje?.deAnuales ?? false);

  // Las dos cosas que el paisaje le hace a la cuenta, y son distintas: una resta
  // hectáreas (lo que no es tierra de pastoreo) y la otra multiplica la
  // capacidad (lo que el animal no camina). Ver `modulacion.ts`.
  const ha_usadas = paisaje?.ha_pastoreables !== undefined && paisaje.ha_pastoreables >= 0
    ? paisaje.ha_pastoreables
    : area_ha;
  const fDist = paisaje?.factor_distribucion !== undefined && paisaje.factor_distribucion >= 0
    ? Math.min(1, paisaje.factor_distribucion)
    : 1;

  const ofertaUtil_kg = ef_kg_ha * ha_usadas * banda.inicial * fDist;

  /** EV que sostiene la oferta con un forraje de densidad `em`. */
  const evCon = (em: number) => {
    const consumoAnual = consumoEV_kgMS_dia(em) * 365;
    return consumoAnual > 0 ? Math.round((ofertaUtil_kg / consumoAnual) * 10) / 10 : 0;
  };

  const carga_ev     = evCon(em_mcal_kg);
  // Menos energía por kilo → más kilos por EV → menos animales. Por eso
  // `grosero` da el mínimo y `calidad` el máximo, y no al revés.
  const carga_ev_min = evCon(EM_FORRAJE.grosero);
  const carga_ev_max = evCon(EM_FORRAJE.calidad);

  // Un rodeo sin cabezas que pastoreen no puede dividir: ahí `evPorCabeza`
  // devuelve 1 y la capacidad queda expresada en EV, que es la unidad.
  const evCabeza = perfil.ev_por_cabeza > 0 ? perfil.ev_por_cabeza : 1;
  const animalesDe = (ev: number) => Math.max(0, Math.floor(ev / evCabeza));
  const carga_animales = animalesDe(carga_ev);

  // Voisin: 30 días reposo + 3 días ocupación → 11 potreros como mínimo, ajuste por área
  const dias_reposo    = 30;
  const dias_ocupacion = 3;
  const potreros_voisin = Math.max(6, Math.round((dias_reposo / dias_ocupacion) + 1));
  const area_potrero_ha = Math.round((ha_usadas / potreros_voisin) * 100) / 100;

  return {
    ef_kg_ha,
    carga_ev,
    carga_ev_min,
    carga_ev_max,
    carga_animales,
    carga_animales_min: animalesDe(carga_ev_min),
    carga_animales_max: animalesDe(carga_ev_max),
    consumo_ev_kg_dia: Math.round(consumoEV_kgMS_dia(em_mcal_kg) * 10) / 10,
    em_mcal_kg,
    agua_l_dia: Math.round(carga_animales * perfil.agua_l_dia),
    potreros_voisin,
    dias_ocupacion,
    area_potrero_ha,
    uso_admisible: banda.inicial,
    banda_uso: banda.nombre,
    ha_usadas: Math.round(ha_usadas * 100) / 100,
    factor_distribucion: fDist,
    ajustada: paisaje !== undefined && (paisaje.ha_pastoreables !== undefined || paisaje.factor_distribucion !== undefined),
  };
}

// ─── 7.5 Cortinas rompevientos ────────────────────────────────────────────────
// ⚠ FUERA DE PRODUCCIÓN (11/08/2026): `calcularCortinas` ubica las líneas con
// offsets fijos sobre el centroide, así que siempre caían en el centro del predio
// sin relación con el terreno. Se desconectó de la UI (ProduccionPanel/MasterPlan).
// Pendiente de rework antes de reactivar: idealmente como hileras dibujadas por el
// usuario o auto-trazadas en el borde de barlovento (candidato para Silvopastura).

const AZIMUT_DIR: Record<string, number> = {
  N: 0, NE: 45, E: 90, SE: 135, S: 180, SO: 225, O: 270, NO: 315,
};

export const ESPECIES_ROMPEVIENTOS: Record<string, string[]> = {
  default: [
    'Algarrobo blanco (Prosopis alba)',
    'Espinillo (Vachellia caven)',
    'Sombra de toro (Jodina rhombifolia)',
    'Molle de beber (Schinus fasciculatus)',
    'Tala (Celtis ehrenbergiana)',
  ],
  Chaco: [
    'Quebracho blanco (Aspidosperma quebracho-blanco)',
    'Algarrobo negro (Prosopis nigra)',
    'Brea (Cercidium praecox)',
  ],
};

export interface CortinaSugerida {
  a:            { lat: number; lng: number };
  b:            { lat: number; lng: number };
  longitud_m:   number;
  azimut_perp:  number;
  dir_viento:   string;
  zona_prot_m:  number;   // radio de protección = 10× altura estimada (10 m)
  especies:     string[];
}

export function calcularCortinas(
  viento_dir_ppal: string,
  mojones: Array<{ lat: number; lng: number }>,
): CortinaSugerida[] {
  if (mojones.length < 3) return [];

  const lat  = mojones.reduce((s, m) => s + m.lat, 0) / mojones.length;
  const lng  = mojones.reduce((s, m) => s + m.lng, 0) / mojones.length;
  const azViento = AZIMUT_DIR[viento_dir_ppal] ?? 180;
  const azPerp   = (azViento + 90) % 360;
  const radPerp  = azPerp  * Math.PI / 180;

  // Generar 2 cortinas paralelas atravesando el predio
  const resultado: CortinaSugerida[] = [-0.0015, 0.0015].map(offset => {
    const cx = lat + offset * Math.sin(azViento * Math.PI / 180);
    const cy = lng + offset * Math.cos(azViento * Math.PI / 180);
    const d  = 0.0025;
    return {
      a:           { lat: cx + d * Math.cos(radPerp), lng: cy + d * Math.sin(radPerp) },
      b:           { lat: cx - d * Math.cos(radPerp), lng: cy - d * Math.sin(radPerp) },
      longitud_m:  Math.round(d * 2 * 111000),
      azimut_perp: azPerp,
      dir_viento:  viento_dir_ppal,
      zona_prot_m: 100, // 10 m altura × 10
      especies:    ESPECIES_ROMPEVIENTOS.default!,
    };
  });

  return resultado;
}

// ─── 7.4 Erosión hídrica USLE simplificado ────────────────────────────────────

export interface RiesgoErosion { pendiente_pct: number; nivel: 'bajo' | 'moderado' | 'alto' | 'muy_alto'; score: number }

export function nivelErosion(pendiente_pct: number, precip_anual_mm: number): RiesgoErosion {
  // Factor LS simplificado solo por pendiente
  const ls  = Math.min(10, Math.pow(pendiente_pct / 100, 0.4) * Math.pow(pendiente_pct, 1.3) * 0.065);
  // Factor R (erosividad lluvia) proporcional a precipitación
  const r   = precip_anual_mm * 0.03;
  const score = Math.min(100, Math.round(ls * r));
  const nivel = score < 15 ? 'bajo' : score < 40 ? 'moderado' : score < 70 ? 'alto' : 'muy_alto';
  return { pendiente_pct, nivel, score };
}
