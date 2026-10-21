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
import { contrastarForraje, type ContrasteForraje } from './miamiModel';

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

/**
 * Producción forrajera natural estimada por precipitación (kg MS/ha/año).
 *
 * **Sigue sin fuente, y ahora se sabe cuánto se equivoca.** Las primeras tres
 * mediciones publicadas están en `forrajeMedido.ts`, con su método, su rango de
 * validez y su estacionalidad, y dicen que esta escalera falla en las DOS
 * direcciones: acierta en la pradera de Dakota, se pasa entre dos y cuatro
 * veces en el Edwards Plateau y hasta once veces en el altiplano de Puno, donde
 * con más lluvia se produce bastante menos. El problema no es el nivel de los
 * escalones: es que una función de una sola variable no puede dar las dos cosas
 * bien, porque faltan el frío, el largo de la estación de crecimiento y la
 * profundidad del suelo.
 *
 * **Ya no hay tres copias: hay una, y es esta.** `forrajePorLluvia` de
 * `pastoreo.ts` delega acá desde el 17/10/2026. Lo que había en el panel de
 * Cobertura nunca fue esta escalera sino otra cosa —kg/ha ponderados por clase
 * de cobertura— y sigue en `cobertura.ts`, que es donde corresponde.
 *
 * ## Lo que sí cambió: ahora el clima puede desmentirla
 *
 * El reemplazo por una tabla medida por bioma no es posible —la dispersión de la
 * literatura en un solo sitio de sabana llega a 7,6×, ver `forrajeMedido.ts`— y
 * el Miami Model tampoco la reemplaza, porque devuelve NPP total y no forraje.
 * Pero sirve para una cosa que la escalera no puede hacer sola: **decir cuándo
 * el número es imposible.** Si `calcularReceptividad` recibe la temperatura
 * media anual, el resultado trae un `contraste` de `miamiModel.ts` que compara
 * esta cifra contra toda la materia seca que ese clima produce, y nombra la
 * limitante. Con 900 mm la escalera dice 7.000 sin mirar si hace 20 °C o −10.
 *
 * ## El primer escalón ya tiene una medición, y el problema no es su altura
 *
 * El escalón de menos de 300 mm devolvió 700 kg MS/ha/año durante todo este
 * tiempo sin que ninguna medición lo tocara. El lote 14 trajo la primera: la
 * estepa de Río Mayo, en Chubut, con **191 mm** de lluvia en el año medido y
 * **530 kg MS/ha/año** de producción aérea de la capa de gramíneas. La escalera
 * se pasa 1,32 veces, que para este archivo es un acierto: en el altiplano de
 * Puno se pasa once.
 *
 * **Y aun así el escalón está mal, por un motivo que no se arregla cambiando el
 * número.** El mismo trabajo mide cuatro años más en el mismo sitio, con lluvias
 * de 55 a 167 mm, y la producción va de 21 a 75 g MS/m²/año: **un factor 3,6
 * adentro de un escalón que devuelve una constante**. Los cinco años caen en el
 * mismo tramo de la función y la función les da 700 a todos.
 *
 * Los autores de Río Mayo agregaban una forma: «There was a large reduction in
 * ANPP during a year of extreme drought; however, there were no increases in ANPP
 * during years with above-average precipitation». Con cinco años eso parecía una
 * asimetría de la producción. **El lote 15 lo midió con cincuenta años y no se
 * replica**: en el CPER los años secos caen un 30 % y los húmedos suben un 30 %.
 * Queda escrito acá porque este comentario afirmaba lo contrario.
 *
 * ## Lo que sí está medido, y es peor: la pendiente
 *
 * El lote 15 trajo cincuenta años del mismo campo —`SERIE_CPER` en
 * `forrajeMedido.ts`— y con ellos las dos rectas que publica Lauenroth y Sala
 * (1992), Figura 2, de ANPP contra lluvia anual en g/m²/año:
 *
 * - regional, comparando sitios: `ANPP = −34 + 0,60 × P`
 * - el mismo sitio, cincuenta años: `ANPP = 56 + 0,13 × P`
 *
 * **La pendiente del modelo espacial es 4,6 veces la del campo real.** Y esta
 * función es un modelo espacial: sus escalones salen de comparar lugares. Con los
 * 588 mm del año más húmedo del CPER devuelve 3.000 kg MS/ha, que son 300 g/m²,
 * que es **exactamente** lo que el artículo publica como la predicción regional
 * que midió como significativamente demasiado alta para ese campo, contra 130 del
 * modelo de largo plazo.
 *
 * Sobre los cincuenta años esta función se pasa en **35 de 50**, con mediana de
 * 1,27 veces y un peor año de 2,62. Lo que está mal no es la altura de los
 * escalones: es la pendiente de la familia a la que pertenecen.
 *
 * ## Y lo que le falta no es otra variable: es memoria
 *
 * Tras las sequías extremas de 1954 y 1964 llovió normal —328 y 371 mm— y la
 * producción siguió en 32 y 48 g/m² contra una media de 68. El trabajo lo
 * explica por la estructura de la vegetación, que tarda años en recuperarse.
 * **La producción de un año depende del estado en que la dejó el anterior**, y
 * una función de la lluvia de este año no tiene dónde guardar eso. El reemplazo
 * no es una escalera mejor ni una recta: es algo con estado.
 *
 * El lote 16 trajo ese «algo con estado» publicado y sobre el mismo campo, en
 * `MODELO_CON_MEMORIA_CPER`:
 *
 * ```
 * ANPP(t) = 14,8 + 0,13 × lluvia(t) + 0,41 × ANPP(t−1)
 * ```
 *
 * Tres cosas de ahí le hablan directo a esta función.
 *
 * **Primera: la memoria no le compite a la lluvia, le compite a la constante.** La
 * pendiente de la lluvia es 0,13 con memoria y sin memoria; lo que se mueve es la
 * ordenada, de 55,8 a 14,8. Esta función no tiene pendiente —devuelve una
 * constante por tramo— así que lo que le falta no es un escalón más fino: es el
 * término que la memoria ocupa.
 *
 * **Segunda: con la misma lluvia, el resultado cambia 1,24 veces según lo que
 * vino antes.** Un año de 222 mm en ese campo produce 73,9 g/m² si viene después
 * de una racha seca y 92,0 si viene después de una húmeda. Esta función devuelve
 * 700 kg/ha en los dos casos, y no por estar mal calibrada: por no tener dónde
 * mirar.
 *
 * **Tercera, y corrige un número de más arriba.** La pendiente de ese modelo
 * llevada a equilibrio es 0,22 y no 0,13, así que la razón contra el modelo
 * espacial es 2,7 y no 4,6. El 4,6 queda escrito porque es la razón que hace el
 * propio trabajo del CPER, pero la comparación justa contra un modelo que compara
 * sitios ya acomodados a su lluvia es la de equilibrio.
 *
 * ## Y hay algo peor, que es de qué capa hablamos
 *
 * Todo lo anterior discute la forma de una función de la lluvia. El lote 16 trajo
 * una segunda serie larga, `SERIE_RIO_MAYO`, con las capas separadas todos los
 * años, y ahí la pregunta cambia:
 *
 * | lo que se ajusta contra la lluvia anual | pendiente | r² |
 * |---|---|---|
 * | **gramíneas**, 15 años | **0,024** | **0,015** |
 * | arbustos, 10 años | 0,125 | 0,728 |
 *
 * Esta función devuelve **forraje**. En ese sitio la lluvia anual explica el 1,5 %
 * de la variación del forraje y el 73 % de la de la leñosa, y los autores
 * concluyen que juntar las capas enmascara la relación. En el CPER —donde la
 * columna medida sí es forraje— la lluvia explica el 39 %, así que no es que la
 * lluvia nunca sirva: **deja de servir donde hay leñosas compitiendo por el agua
 * profunda**, que es buena parte de los predios que esta app analiza.
 *
 * ## Y lo que esta función ignora es más grande que todo lo anterior
 *
 * `CONTRASTE_DE_MANEJO` mide tres pares de parcelas vecinas del mismo sitio, con
 * el mismo clima, sobre 27 a 30 años: el estado del pastizal lleva la producción a
 * **0,31** y la fertilización alta a **3,79**. En el CPER, cincuenta años de
 * lluvia de 107 a 588 mm la mueven un factor 5,8.
 *
 * **El manejo pesa más que medio siglo de clima en un sitio.** Mientras esta
 * función sea sólo de la lluvia, afinarla es trabajar sobre la variable chica.
 *
 * ## Y la carga animal, que es el manejo que el usuario sí decide
 *
 * El párrafo de arriba mide el manejo por fertilización y estado del pastizal. El
 * lote 18 lo midió por **carga animal**, que es lo que acequia le pregunta al
 * usuario: diecisiete años, cinco intensidades, dos sitios ecológicos del mismo
 * campo, en `CARGA_CGREC` de `forrajeMedido.ts`. Con 454 mm de normal, esta
 * función devuelve **1.500**; la producción total medida al final de la temporada:
 *
 * | manejo | cosecha | carga | lomada (silty) | bajo (overflow) |
 * |---|---|---|---|---|
 * | sin pastoreo | 0 % | 0 | 2.865 | sin media publicada |
 * | liviano | 35 % | 1,3 AUM/ha | **3.410** | 4.131 |
 * | moderado | 50 % | 2,7 | 3.156 | 4.360 |
 * | fuerte | 65 % | 4,4 | 2.637 | **4.362** |
 * | extremo | 80 % | 6,9 | 2.501 | 3.087 |
 *
 * Tres cosas, en orden de lo que más le pega a esta función:
 *
 * **1. Acá se queda corta, de 1,7 a 2,9 veces.** Y es el sitio donde esta cadena
 * creía que la escalera andaba bien: la fila de Dakota del encabezado de
 * `forrajeMedido.ts` decía «va bien» porque la ficha del NRCS publica un rango de
 * lluvia —381 a 508 mm— que cruza el escalón de los 500 y entonces la escalera
 * devolvía «1.500 a 3.000». El CGREC está en la misma MLRA y en el mismo sitio
 * ecológico, y publica un solo número. Con un número, falla también ahí.
 *
 * **2. La pendiente contra la lluvia es una función del manejo.** En los sitios de
 * lomada, al inicio de la temporada, el no pastoreado sube 46,31 kg/ha por cm de
 * lluvia del año agrícola y el liviano 32,48, pero **moderado, fuerte y extremo no
 * se distinguen de cero**. En los bajos pasa lo contrario al final de la
 * temporada: el no pastoreado no responde a la lluvia y los cuatro pastoreados
 * suben 46,85 kg/ha por cm. O sea que en el mismo campo y los mismos años la
 * pregunta «cuánto sube la producción por milímetro» tiene cinco respuestas por
 * sitio ecológico, dos de ellas cero, y quién responde a la lluvia se da vuelta
 * entre una lomada y un bajo. **Una función de la lluvia sola no describe un campo
 * pastoreado: describe uno en descanso**, y ni eso en los bajos.
 *
 * **3. El signo del efecto del pastoreo depende de la lluvia del año, y está
 * publicado.** En los bajos, el pastoreo supera al descanso si la lluvia del año
 * agrícola pasa de 26,7 cm en el liviano, 24,8 en el moderado, 26,2 en el fuerte y
 * 53,2 en el extremo; y el extremo produce MENOS que el descanso si no llega a
 * 31,5 cm. Está en `UMBRAL_P2E_OVERFLOW`.
 *
 * Lo que **no** se puede escribir, aunque la tabla lo tiente: un factor por
 * pastorear liviano. El mismo experimento en el CPER dio el orden inverso
 * (Milchunas et al. 1994) y el informe anterior de este propio ensayo no veía la
 * joroba (Biondini et al. 1998). El motivo está en `CONTRASTE_DE_CARGA`.
 */
export function prodForrajera(precip_mm: number): number {
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
  /**
   * Temperatura media anual del predio, °C. No entra en la cuenta de la
   * receptividad: habilita el contraste climático del resultado. Si no viene,
   * `contraste` sale `null` y la pantalla no puede avisar nada.
   */
  temp_media_c?: number;
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
  /**
   * El contraste de la cifra de forraje contra el clima, por el Miami Model.
   * `null` cuando no se pasó la temperatura media anual, o cuando el clima cae
   * fuera del dominio del modelo. Es un test de una sola dirección: puede decir
   * que el número es imposible, no que sea correcto.
   */
  contraste:        ContrasteForraje | null;
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
    // El contraste no corrige la cifra: la pone al lado de lo que el clima puede
    // producir. Sale `null` sin temperatura, que es lo que pasa cuando el clima
    // del predio todavia no llego.
    contraste: paisaje?.temp_media_c !== undefined
      ? contrastarForraje(ef_kg_ha, precip_anual_mm, paisaje.temp_media_c)
      : null,
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
