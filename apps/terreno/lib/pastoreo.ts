/**
 * Pastoreo rotativo: el balance forrajero de un manejo elegido y lo que cuesta
 * armarlo en el campo.
 *
 * Las reglas del manejo —cuántas parcelas, cuántos días, cuánto descanso, qué
 * forma— están en `manejos.ts`, con sus fuentes. Acá se usan.
 *
 * ## Qué cambió el 02/10/2026 (etapa C), y por qué
 *
 * Este archivo tenía cuatro números inventados, y los cuatro eran del mismo
 * tipo: plausibles, redondos y sin nadie que los firmara.
 *
 * 1. **El descanso por estación** era una escalera fija —30, 35, 45 y 80 días—
 *    igual para toda la Tierra. Ahora sale del tipo de pastura y de la
 *    temperatura de cada temporada del predio, con los rangos publicados de
 *    A3529, y la pastura se **sugiere** desde el clima del punto. El cambio más
 *    grande no es de valores: es que una pastura tropical pide **lo contrario**
 *    que una templada, así que la escalera vieja estaba al revés en medio mundo.
 * 2. **El número de parcelas** salía de `descanso / ocupación + 1` con el 1
 *    cableado. El 1 es la cantidad de rodeos que pastorean la misma secuencia, y
 *    con dos rodeos hacen falta dos parcelas más. Ahora es un parámetro.
 * 3. **La carga instantánea en EV** se calculaba como `peso / 400`. El
 *    equivalente vaca está definido en **energía** (18,54 Mcal EM/día) y no en
 *    kilos de animal; era el mismo error que ya se corrigió en `produccion.ts`,
 *    sobreviviendo acá. Ahora pasa por `consumoEV_kgMS_dia`.
 * 4. **Los postes y el agua de bebida.** «1 poste cada 8 m» no tiene fuente y el
 *    agua se estimaba como el 10 % del peso vivo, cuando acequia **ya** calcula
 *    el agua desde la temperatura con tabla publicada (`aguaGanado.ts`). Los dos
 *    números se fueron: el primero porque no hay con qué reponerlo, el segundo
 *    porque el bueno vive en otra pestaña y tener dos respuestas distintas para
 *    la misma pregunta es peor que tener una sola.
 *
 * Queda uno, el más grande, y está anotado abajo: `forrajePorLluvia`.
 */

import {
  parcelasNecesarias, descansoLogrado, grillaSubdivision, puntosDeAgua,
  topeRebrote, TOPE_CONDUCTA_D, RANGO_CHO_D, RELACION_MAX, AGUA_INTENSIVA_M,
  type Grilla,
} from './manejos';
import { consumoEV_kgMS_dia, EM_FORRAJE } from './produccion';

export interface ParamsPastoreo {
  area_ha:            number;
  n_animales:         number;
  peso_prom_kg:       number;
  consumo_pct_peso:   number;   // % del peso vivo en materia seca/día (típico 2,5–3)
  prod_forraje_kg_ha: number;   // producción anual (kg MS/ha/año)
  /** Uso admisible del forraje (0–1). Sale de `bandaUso` en `modulacion.ts`. */
  eficiencia:         number;
  dias_ocupacion:     number;   // días en cada parcela
  /** Descanso de la temporada más lenta: es el que dimensiona las parcelas. */
  descanso_objetivo_d: number;
  /** Rodeos que recorren la misma secuencia de parcelas, uno detrás del otro. */
  grupos?:            number;
  /** Densidad energética del forraje, para pasar kilos a EV. */
  em_mcal_kg?:        number;
}

/**
 * Campos del panel que se guardan para no perderlos al cambiar de pestaña.
 *
 * Se lee de proyectos ya guardados, así que **los campos viejos no se quitan ni
 * se renombran**: lo nuevo entra como opcional y con valor por defecto.
 */
export interface PastoreoInputs {
  area:     number;
  animales: number;
  peso:     number;
  consumo:  number;
  forraje:  number;
  efic:     number;
  ocup:     number;
  /** Tipo de pastura declarado; si falta, manda la sugerencia del clima. */
  tipo?:    'templada' | 'tropical' | 'leguminosa';
  /** Rodeos en la misma secuencia; si falta, uno. */
  grupos?:  number;
}

export interface ResultadoPastoreo {
  demanda_diaria_kg:  number;
  demanda_anual_kg:   number;
  oferta_anual_kg:    number;
  balance_pct:        number;   // oferta / demanda
  /** Carga instantánea en la parcela ocupada, en EV/ha de energía. */
  carga_ins_ev_ha:    number;
  n_potreros:         number;
  area_potrero_ha:    number;
  /** El descanso que de verdad se logra, que puede pasar al pedido. */
  descanso_logrado_d: number;
  /** Tope de ocupación por rebrote para el descanso de esta temporada. */
  tope_rebrote_d:     number;
  grilla:             Grilla;
  alambrado_m:        number;
  bebederos:          number;
  advertencias:       string[];
}

/**
 * Producción forrajera natural estimada por precipitación (kg MS/ha/año).
 *
 * ## ⚠ Este número no tiene fuente, y es el más grande de toda la cadena
 *
 * Es una escalera de cinco escalones por lluvia anual y **multiplica todo lo que
 * viene después**: la oferta, el balance, la carga, el rodeo y el agua de la
 * represa. Es una copia de `prodForrajera` de `produccion.ts` y hay una tercera
 * copia en el `forraje_sugerido` de `cobertura.ts`.
 *
 * Mientras siga así, el balance forrajero de este módulo tiene la precisión de
 * esta escalera y no más, por bien calculado que esté el resto. Reponerlo es un
 * relevamiento —mapas de productividad primaria neta de pastizales y series de
 * materia seca de los organismos regionales—, no una fórmula, y está anotado
 * como la deuda número uno del plan de diseño de predio.
 *
 * Se deja como **sugerencia editable** en la interfaz, nunca como un dato.
 */
/*
 * Medido el 10/10/2026, y es peor de lo que dice el parrafo de arriba.
 *
 * El primer lote del encargo de forraje trajo una medicion publicada de NPP
 * herbacea aerea en un bosque humedo tropical de Sunsari, Nepal, que recibe
 * 1.998,6 mm/anio: **1,3 a 1,7 Mg/ha/anio**, o sea 1.300 a 1.700 kg MS/ha/anio
 * (Gautam & Mandal, «Effect of disturbance on biomass, production and carbon
 * dynamics in moist tropical forest of eastern Nepal», Forest Ecosystems, 2016,
 * https://doi.org/10.1186/s40663-016-0070-y).
 *
 * Para esa misma lluvia, lo que calcula la app:
 *
 *   esta escalera, en Pastoreo ............ 7.000
 *   forraje_sugerido 100 % arbolado ....... 800   (cobertura.ts, SI pondera)
 *   medido (NPP herbacea, que es un techo)  1.300-1.700
 *
 * Las dos rutas difieren por un factor de 8,8 para el mismo predio, el panel de
 * Cobertura le dice al usuario que use la suya «como referencia junto al valor
 * por lluvia» como si fueran comparables, y la medicion cae del lado de los 800.
 * Esta escalera se escribio para pastizal natural y nada impide aplicarla a un
 * bosque: ahi sobreestima la oferta por un factor de cuatro o mas, y eso antes
 * de descontar el uso admisible.
 *
 * Dos cosas que la fuente aclara y que empeoran la comparacion, no la mejoran:
 * los herbaceos son el 6 % de la NPP del rodal no intervenido y el 9 % del
 * intervenido —el sotobosque es una fraccion chica de lo que produce un bosque
 * cerrado—, y la produccion se estimo como maximo menos minimo sobre dos
 * cosechas (mayo y septiembre), que no ve el recambio entre cortes. Es un techo
 * de NPP, no una oferta: a la NPP herbacea todavia hay que descontarle
 * palatabilidad, accesibilidad y pisoteo, y ese factor estas fuentes no lo miden.
 *
 * No se corrige con un numero inventado aca. La correccion espera los biomas
 * pastoriles del encargo, que es donde esta la literatura; el detalle esta en
 * `_research/_encargos/RESPUESTAS_FORRAJE.md`.
 */
export function forrajePorLluvia(precip_mm: number): number {
  if (precip_mm < 300) return 700;
  if (precip_mm < 500) return 1500;
  if (precip_mm < 700) return 3000;
  if (precip_mm < 900) return 5000;
  return 7000;
}

export function calcularPastoreo(p: ParamsPastoreo): ResultadoPastoreo | null {
  if (p.area_ha <= 0 || p.n_animales <= 0) return null;

  const grupos = Math.max(1, Math.round(p.grupos ?? 1));
  const em = p.em_mcal_kg ?? EM_FORRAJE.natural;

  const demanda_diaria = p.n_animales * p.peso_prom_kg * (p.consumo_pct_peso / 100);
  const demanda_anual  = demanda_diaria * 365;
  const oferta_anual   = p.prod_forraje_kg_ha * p.area_ha * p.eficiencia;
  const balance_pct    = demanda_anual > 0 ? Math.round((oferta_anual / demanda_anual) * 100) : 0;

  // Las parcelas las dimensiona el descanso de la temporada más lenta, que es lo
  // que pide A3529: con el descanso corto de la temporada rápida alcanzarían
  // menos parcelas, y las que sobran son el heno y el fusible del año seco.
  const ocupacion  = Math.max(0.5, p.dias_ocupacion);
  const n_potreros = Math.max(grupos + 1, parcelasNecesarias(p.descanso_objetivo_d, ocupacion, grupos));
  const area_potrero = p.area_ha / n_potreros;

  const grilla = grillaSubdivision(p.area_ha, n_potreros);

  // Carga instantánea: todo el rodeo en una parcela, en EV de energía. 1 EV son
  // 18,54 Mcal EM/día, así que los kilos se pasan a EV por la densidad energética
  // del forraje, no por el peso del animal.
  const kg_por_ev  = consumoEV_kgMS_dia(em);
  const ev_total   = kg_por_ev > 0 ? demanda_diaria / kg_por_ev : 0;
  const carga_ins  = area_potrero > 0 ? Math.round((ev_total / area_potrero) * 10) / 10 : 0;

  const descanso_logrado = descansoLogrado(n_potreros, ocupacion, grupos);
  const tope = topeRebrote(p.descanso_objetivo_d);

  const advertencias: string[] = [];
  if (balance_pct < 100) {
    advertencias.push(`Sobrepastoreo: la demanda supera la oferta (${balance_pct} %). Bajá la carga, suplementá o sumá superficie. Ajustar la carga rinde más que rotar: eso es lo que midieron los estudios de larga duración.`);
  } else if (balance_pct < 130) {
    advertencias.push(`Carga ajustada (${balance_pct} %): poco margen para años secos. El uso conservador del forraje resigna del 10 al 25 % de la ganancia en años normales y devuelve del 30 al 60 % más en una sequía severa.`);
  }
  if (ocupacion > tope) {
    advertencias.push(`Con ${ocupacion} días en cada parcela el rebrote vuelve a estar al alcance del diente antes de que el rodeo salga: en esta temporada el tope es ${tope} días. Sumá parcelas o acortá la ocupación.`);
  } else if (ocupacion > TOPE_CONDUCTA_D) {
    advertencias.push(`Pasando los ${TOPE_CONDUCTA_D} días la planta todavía aguanta, pero el rodeo arma querencia: la parcela queda pastoreada desparejo y en las vueltas siguientes repite las mismas sendas.`);
  }
  if (p.descanso_objetivo_d < RANGO_CHO_D[0] || p.descanso_objetivo_d > RANGO_CHO_D[1]) {
    advertencias.push(`El descanso de ${p.descanso_objetivo_d} días cae fuera de la banda de reposición de reservas de la planta (${RANGO_CHO_D[0]} a ${RANGO_CHO_D[1]} días). Puede estar bien —con mucho crecimiento alcanzan 20 y en pleno verano una pastura templada pide más de 40— pero conviene mirarlo.`);
  }
  if (grilla.relacion > RELACION_MAX) {
    advertencias.push(`Las parcelas quedan ${grilla.relacion.toFixed(1)} veces más largas que anchas y el tope publicado es ${RELACION_MAX}: el frente se sobrepastorea y el fondo queda sin comer. Probá otra grilla.`);
  }
  if (area_potrero < 0.1) {
    advertencias.push('Parcelas de menos de 1.000 m²: considerá menos parcelas con más días de ocupación.');
  }
  if (advertencias.length === 0) {
    advertencias.push('El manejo cierra con la oferta estimada. Movelo igual por la altura del pasto y no por el calendario: el descanso en días es una estimación, la altura es una medición.');
  }

  return {
    demanda_diaria_kg: Math.round(demanda_diaria),
    demanda_anual_kg:  Math.round(demanda_anual),
    oferta_anual_kg:   Math.round(oferta_anual),
    balance_pct,
    carga_ins_ev_ha:   carga_ins,
    n_potreros,
    area_potrero_ha:   Math.round(area_potrero * 100) / 100,
    descanso_logrado_d: descanso_logrado,
    tope_rebrote_d:    tope,
    grilla,
    alambrado_m:       grilla.alambre_m,
    bebederos:         puntosDeAgua({ parcelas: n_potreros, ha_parcela: area_potrero, radio_m: AGUA_INTENSIVA_M }).total,
    advertencias,
  };
}
