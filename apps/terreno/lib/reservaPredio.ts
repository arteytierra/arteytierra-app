/**
 * ¿Alcanza el agua del predio? El inventario de todo lo que entra y lo que se
 * guarda, contra todo lo que se gasta, y cuántos días aguanta sin que entre nada.
 *
 * ─── POR QUÉ ESTE MÓDULO EXISTE ──────────────────────────────────────────────
 *
 * acequia ya sabía casi todo esto, repartido en pestañas que no se hablan: la
 * captación de techos y pavimentos sale de `captacion.ts`, el consumo del rodeo
 * de `aguaGanado.ts`, el vaso de una represa de `vaso.ts`, el año de esa represa
 * de `represa.ts`, y la racha seca más larga del predio —medida del dato diario,
 * no supuesta— de `climaExtremos.ts`, cuyo encabezado dice desde el principio
 * que las rachas secas están ahí para la «autonomía de tanques/represas». Nunca
 * se sumaron. Cada pestaña contestaba su pregunta y ninguna contestaba la del
 * dueño del predio, que es una sola y es ésta.
 *
 * ─── LA AUTONOMÍA NO ES VOLUMEN SOBRE CONSUMO ────────────────────────────────
 *
 * Es el error que este módulo existe para no cometer. Dividir el volumen
 * guardado por el consumo diario da un número grande, plausible y optimista,
 * porque deja afuera los dos egresos que no consume nadie:
 *
 *   • la **evaporación del espejo**, que es superficie por lámina y no depende
 *     de cuánta agua haya debajo, y
 *   • la **infiltración del vaso**, ídem.
 *
 * En una represa somera de verano los dos juntos pueden superar la demanda del
 * rodeo. Con 500 m² de espejo y 9 mm por día entre evaporación e infiltración
 * se van 4,5 m³ diarios: más que lo que beben cincuenta vacas. Una cisterna
 * tapada, en cambio, no evapora nada, y por eso los dos tipos de reserva no son
 * intercambiables aunque midan los mismos metros cúbicos.
 *
 * De ahí sale la otra consecuencia, que es de manejo: el litro que queda en una
 * represa abierta se evapora en parte, y el que queda en una cisterna no. Así
 * que **gastar primero el espejo abierto rinde más días** que guardarlo. No es
 * una opinión: es la misma agua con dos órdenes de uso, y el módulo calcula los
 * dos para que la diferencia se vea en vez de quedar supuesta.
 *
 * ─── Y EL VOLUMEN ÚTIL NO ES EL VOLUMEN ──────────────────────────────────────
 *
 * AH-590 lo pone como criterio antes de dar cualquier número: *«To ensure a
 * permanent water supply, the water must be deep enough to meet the intended use
 * requirements and to offset probable seepage and evaporation losses»*, y la
 * figura 12 vale *«if seepage and evaporation losses are normal»*. Esa lámina
 * permanente no es reserva disponible: es lo que tiene que seguir habiendo. Lo
 * que se puede usar es el volumen menos esa lámina, y `represaDiseno.ts` ya
 * calcula cuánta lámina pide el clima del predio (`profundidadUtilMinima`).
 *
 * ─── EL CAUDAL DE UNA NACIENTE NO ES FIRME HASTA QUE SE MIDE EN LA SECA ──────
 *
 * Una vertiente que da 10 L/min en septiembre puede dar cero en febrero, y es
 * justamente en febrero cuando se la necesita. Un caudal declarado sin decir
 * cuándo se midió no se puede contar en el escenario de crisis: acá entra como
 * aporte **no firme**, se muestra aparte, y la cuenta de autonomía se hace sin
 * él. El usuario puede declarar que lo midió en la seca, y entonces cuenta. Es
 * la regla de la app: degradar avisando, nunca rellenar en silencio.
 *
 * ─── EL PERÍODO DE DISEÑO SALE DEL DATO, NO DE UN SUPUESTO ───────────────────
 *
 * No se leyó ninguna norma que publique cuántos días de reserva tiene que tener
 * un predio, y no se inventa uno. Lo que sí hay es la racha seca medida de la
 * serie diaria del propio predio, en tres valores que son tres decisiones de
 * diseño distintas: la mediana de los máximos anuales (el año típico), el
 * percentil 90 (el año seco) y el máximo observado (el peor de la serie). La
 * elección es del usuario; el default es el año seco, que es el criterio de la
 * app en todo lo demás.
 *
 * ─── UNIDADES ────────────────────────────────────────────────────────────────
 *
 * Volúmenes en m³, caudales declarados en L/min, demanda en L/día, láminas en
 * mm/día, superficies en m². Todo va en el nombre de la variable.
 *
 * ─── RANGO DE VALIDEZ ────────────────────────────────────────────────────────
 *
 * Escala de predio y paso diario. La superficie del espejo se toma proporcional
 * al llenado, que es la misma aproximación que usa `simularRepresaAnual` y vale
 * mientras el vaso no sea un cilindro ni un cono extremo. No modela la
 * estratificación térmica del embalse, el ingreso de napa al vaso, ni la calidad
 * del agua: dos represas con el mismo volumen pueden no servir para lo mismo.
 *
 * ─── QUÉ SE ROMPE SI CAMBIA ──────────────────────────────────────────────────
 *
 * Lo consume `ReservaPredioPanel` y nada más por ahora. La demanda diaria que
 * recibe es la que arma `captacion.ts` con sus propias fuentes publicadas, así
 * que cambiar un consumo por defecto de allá mueve la autonomía de acá.
 */

import { KC_ESPEJO_SOMERO } from './represaDiseno';

// ─── 1 · Las fuentes de agua del predio ──────────────────────────────────────

/**
 * Qué clase de fuente es, que en esta cuenta es una pregunta física y no una
 * etiqueta: lo único que importa es si guarda un volumen o entrega un caudal, y
 * si tiene la cara al aire.
 */
export type TipoFuente =
  | 'represa'
  | 'tajamar'
  | 'aguada'
  | 'cisterna'
  | 'ecocisterna'
  | 'tanque'
  | 'naciente'
  | 'vertiente'
  | 'pozo';

export interface FichaTipoFuente {
  label:   string;
  /** `almacenaje` guarda m³; `caudal` entrega L/min. */
  clase:   'almacenaje' | 'caudal';
  /** Si el agua tiene la cara al aire, y entonces evapora. */
  abierta: boolean;
  /** Qué asume el tipo. Se imprime: es lo que hay que leer antes de creerle. */
  nota:    string;
}

export const TIPOS_FUENTE: Readonly<Record<TipoFuente, FichaTipoFuente>> = {
  represa: {
    label: 'Represa', clase: 'almacenaje', abierta: true,
    nota: 'Espejo al aire: evapora e infiltra todos los días, llueva o no. El volumen y el espejo salen del vaso que calcula la pestaña Represas.',
  },
  tajamar: {
    label: 'Tajamar', clase: 'almacenaje', abierta: true,
    nota: 'Igual que una represa pero más somero, así que la relación espejo/volumen es peor y pierde proporcionalmente más.',
  },
  aguada: {
    label: 'Aguada / bebedero', clase: 'almacenaje', abierta: true,
    nota: 'Volumen chico y al aire. Casi nunca es reserva: es el punto de entrega. Si se cuenta como reserva, la autonomía sale optimista.',
  },
  cisterna: {
    label: 'Cisterna tapada', clase: 'almacenaje', abierta: false,
    nota: 'Tapada: no evapora. Por eso el mismo metro cúbico rinde más días acá que en una represa.',
  },
  ecocisterna: {
    label: 'Ecocisterna', clase: 'almacenaje', abierta: false,
    nota: 'Se cuenta como cerrada: la cubierta vegetal o el sustrato cortan la evaporación libre. Lo que acequia no sabe es cuánta agua retiene el propio sustrato y no devuelve.',
  },
  tanque: {
    label: 'Tanque', clase: 'almacenaje', abierta: false,
    nota: 'Cerrado. El volumen útil es el que queda sobre la salida, no el del tanque.',
  },
  naciente: {
    label: 'Naciente', clase: 'caudal', abierta: false,
    nota: 'Caudal, no volumen. Sólo cuenta en la crisis si se midió en la época seca.',
  },
  vertiente: {
    label: 'Vertiente', clase: 'caudal', abierta: false,
    nota: 'Caudal, no volumen. Es la fuente que más se sobreestima: la medición de primavera no vale para febrero.',
  },
  pozo: {
    label: 'Pozo', clase: 'caudal', abierta: false,
    nota: 'Caudal, no volumen. Acá se toma el caudal declarado; acequia no sabe si el acuífero lo sostiene bombeando todos los días.',
  },
};

export interface FuenteAgua {
  id:     string;
  tipo:   TipoFuente;
  nombre: string;
  /** Volumen almacenado cuando arranca la racha (m³). Las de caudal van en 0. */
  volumen_m3: number;
  /**
   * Lámina permanente que no se puede usar, en m³ (el «volumen muerto»). Ver
   * AH-590 en el encabezado. Cero en las cerradas.
   */
  volumenMuerto_m3: number;
  /** Superficie del espejo a vaso lleno (m²). Sólo las abiertas. */
  espejo_m2: number;
  /** Pérdida por el vaso (mm/día). Sólo las abiertas. */
  infiltracion_mm_dia: number;
  /** Caudal declarado (L/min). Sólo las de caudal. */
  caudal_l_min: number;
  /**
   * Si el caudal se midió en la época seca. Sin esto el aporte no es firme y la
   * cuenta de crisis lo deja afuera.
   */
  medidoEnSeca: boolean;
}

export function nuevaFuenteDefault(tipo: TipoFuente = 'represa'): FuenteAgua {
  const ficha = TIPOS_FUENTE[tipo];
  return {
    id: `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    tipo,
    nombre: ficha.label,
    volumen_m3: 0,
    volumenMuerto_m3: 0,
    espejo_m2: 0,
    infiltracion_mm_dia: ficha.abierta ? 1 : 0,
    caudal_l_min: 0,
    medidoEnSeca: false,
  };
}

const n = (x: number | null | undefined): number =>
  x != null && Number.isFinite(x) ? x : 0;

/** Lo que se puede sacar de una fuente de almacenaje, en m³. Nunca negativo. */
export function volumenUtil_m3(f: FuenteAgua): number {
  if (TIPOS_FUENTE[f.tipo].clase !== 'almacenaje') return 0;
  return Math.max(0, n(f.volumen_m3) - Math.max(0, n(f.volumenMuerto_m3)));
}

/** El caudal declarado, pasado a m³/día. 1 L/min × 1.440 min = 1,44 m³/día. */
export function caudalDiario_m3(caudal_l_min: number | null | undefined): number {
  return (Math.max(0, n(caudal_l_min)) * 60 * 24) / 1000;
}

/**
 * El aporte de una fuente de caudal en el escenario de crisis: cero si no se
 * midió en la seca, porque entonces no se sabe si existe cuando hace falta.
 */
export function aporteFirme_m3_dia(f: FuenteAgua): number {
  if (TIPOS_FUENTE[f.tipo].clase !== 'caudal') return 0;
  return f.medidoEnSeca ? caudalDiario_m3(f.caudal_l_min) : 0;
}

/** El aporte declarado, firme o no. Es el que se muestra aparte. */
export function aporteDeclarado_m3_dia(f: FuenteAgua): number {
  if (TIPOS_FUENTE[f.tipo].clase !== 'caudal') return 0;
  return caudalDiario_m3(f.caudal_l_min);
}

// ─── 2 · La racha seca: de dónde sale el período de diseño ───────────────────

export type EscenarioRacha = 'tipico' | 'seco' | 'peor';

export interface RachaElegida {
  escenario: EscenarioRacha;
  dias:      number;
  /** Cómo se llama en palabras, para imprimirlo. */
  rotulo:    string;
  lectura:   string;
}

export const ESCENARIOS_RACHA: Readonly<Record<EscenarioRacha, { rotulo: string; lectura: string }>> = {
  tipico: {
    rotulo: 'Año típico',
    lectura: 'La mediana de la racha seca más larga de cada año de la serie: la mitad de los años trae una peor.',
  },
  seco: {
    rotulo: 'Año seco',
    lectura: 'El percentil 90 de las rachas anuales: uno de cada diez años trae una más larga. Es el criterio que la app usa en el resto de los diseños.',
  },
  peor: {
    rotulo: 'El peor de la serie',
    lectura: 'La racha más larga que se midió. No tiene período de retorno asignado: es un dato, no un cuantil.',
  },
};

/**
 * Elige el período de diseño a partir de la sequía medida.
 *
 * Un día seco es, en la serie de la app, un día con menos de 1 mm. No es una
 * convención de acequia: es el umbral con el que `climaExtremos.ts` cuenta las
 * rachas, y está acá para que el número no se lea como «días sin una gota».
 */
export function rachaDeDiseno(
  sequia: { racha_max_dias: number; racha_anual_p50: number; racha_anual_p90: number } | null | undefined,
  escenario: EscenarioRacha = 'seco',
): RachaElegida | null {
  if (!sequia) return null;
  const dias = escenario === 'tipico' ? sequia.racha_anual_p50
             : escenario === 'peor'   ? sequia.racha_max_dias
             :                          sequia.racha_anual_p90;
  if (!Number.isFinite(dias) || dias <= 0) return null;
  const f = ESCENARIOS_RACHA[escenario];
  return { escenario, dias: Math.round(dias), rotulo: f.rotulo, lectura: f.lectura };
}

// ─── 3 · El vaciado día por día ──────────────────────────────────────────────

/** Tope de la simulación. Un predio que pasa de acá no tiene problema de racha. */
export const DIAS_TOPE = 400;

/**
 * En qué orden se gasta el agua guardada.
 *
 * No es un detalle: el litro que queda en una represa abierta se evapora en
 * parte y el que queda en una cisterna no, así que los dos órdenes dan
 * autonomías distintas con la misma agua. El panel muestra los dos.
 */
export type OrdenDeUso = 'espejo_primero' | 'cerrado_primero';

export interface DiaDeRacha {
  dia:          number;
  /** Volumen útil que queda al final del día, sumando todas las fuentes (m³). */
  queda_m3:     number;
  aporte_m3:    number;
  evaporado_m3: number;
  infiltrado_m3:number;
  consumido_m3: number;
  /** true si ese día no alcanzó para la demanda. */
  falto:        boolean;
}

export interface Vaciado {
  orden:        OrdenDeUso;
  /**
   * Días que aguanta la demanda completa. `null` cuando no hay demanda
   * declarada y tampoco pérdidas: ahí la autonomía no es un número grande, es
   * una pregunta sin plantear.
   */
  dias:         number | null;
  /** true si la simulación llegó al tope sin vaciarse. */
  llegoAlTope:  boolean;
  dias_pedidos: number;
  /** ¿Aguanta la racha de diseño? `null` si no hay racha. */
  aguanta:      boolean | null;
  /** Lo que queda al terminar la racha pedida (m³), si llega. */
  queda_al_final_m3: number | null;
  serie:        DiaDeRacha[];
  /**
   * Cuánto se pierde el primer día sin que lo consuma nadie (m³). Es el número
   * que explica por qué la autonomía no es volumen sobre consumo.
   */
  perdida_dia1_m3: number;
  /** true si las pérdidas solas vacían la reserva, sin consumir una gota. */
  seVaciaSinConsumo: boolean;
}

export interface EntradaVaciado {
  fuentes:       readonly FuenteAgua[];
  /** La demanda del predio, en L/día. Sale de `captacion.ts`. */
  demanda_l_dia: number;
  /** Días de la racha de diseño. */
  dias:          number;
  /**
   * ETP de referencia del mes crítico, en mm/día. La evaporación del espejo es
   * esto por el factor de FAO-56, no esto a secas.
   */
  etp_mm_dia:    number;
  /** Factor del espejo sobre la ETP. Por defecto la fila somera de FAO-56. */
  factorEvap?:   number;
  orden?:        OrdenDeUso;
}

/**
 * Vacía la reserva del predio día por día durante una racha sin lluvia.
 *
 * El modelo, explícito:
 *   1. entran los aportes firmes de caudal,
 *   2. salen la evaporación y la infiltración de cada fuente abierta, con el
 *      espejo proporcional al llenado de ESA fuente,
 *   3. sale la demanda, del orden de uso elegido.
 *
 * Las pérdidas van antes de la demanda a propósito: la evaporación no espera a
 * que se termine de beber, y poniéndola después se recupera un día de más.
 */
export function simularRacha(e: EntradaVaciado): Vaciado {
  const orden = e.orden ?? 'espejo_primero';
  const fEvap = e.factorEvap != null && Number.isFinite(e.factorEvap) ? e.factorEvap : KC_ESPEJO_SOMERO;
  const etp   = Math.max(0, n(e.etp_mm_dia));
  const diasPedidos = Math.max(0, Math.round(n(e.dias)));
  const demanda_m3_dia = Math.max(0, n(e.demanda_l_dia)) / 1000;

  // Estado por fuente: volumen útil restante y su capacidad útil inicial, que es
  // contra lo que se mide el llenado del espejo.
  const almacenes = e.fuentes
    .filter(f => TIPOS_FUENTE[f.tipo].clase === 'almacenaje')
    .map(f => ({
      abierta:   TIPOS_FUENTE[f.tipo].abierta,
      util0_m3:  volumenUtil_m3(f),
      util_m3:   volumenUtil_m3(f),
      espejo_m2: Math.max(0, n(f.espejo_m2)),
      infil_mm:  TIPOS_FUENTE[f.tipo].abierta ? Math.max(0, n(f.infiltracion_mm_dia)) : 0,
    }))
    .filter(a => a.util0_m3 > 0);

  const aporte_m3_dia = e.fuentes.reduce((s, f) => s + aporteFirme_m3_dia(f), 0);

  // El orden de uso: se ordenan los almacenes y se descuenta de los primeros.
  const porOrden = [...almacenes].sort((a, b) => {
    if (a.abierta === b.abierta) return 0;
    return orden === 'espejo_primero'
      ? (a.abierta ? -1 : 1)
      : (a.abierta ? 1 : -1);
  });

  const perdidasDelDia = (): { evap: number; infil: number } => {
    let evap = 0, infil = 0;
    for (const a of almacenes) {
      if (!a.abierta || a.util0_m3 <= 0) continue;
      const llenado = Math.max(0, Math.min(1, a.util_m3 / a.util0_m3));
      const areaEf = a.espejo_m2 * llenado;
      evap  += areaEf * ((etp * fEvap) / 1000);
      infil += areaEf * (a.infil_mm / 1000);
    }
    return { evap, infil };
  };

  const perdida1 = perdidasDelDia();
  const perdida_dia1_m3 = Math.round((perdida1.evap + perdida1.infil) * 100) / 100;

  // Sin demanda y sin pérdidas la autonomía no es un número: no hay nada que la
  // consuma. Se devuelve null y el panel lo dice.
  const hayAlgoQueConsuma = demanda_m3_dia > 0 || perdida_dia1_m3 > 0;
  const total0 = almacenes.reduce((s, a) => s + a.util0_m3, 0);

  const serie: DiaDeRacha[] = [];
  let dias: number | null = hayAlgoQueConsuma ? 0 : null;
  let llegoAlTope = false;
  let quedaAlFinal: number | null = null;
  let seVaciaSinConsumo = false;

  if (hayAlgoQueConsuma && total0 + aporte_m3_dia > 0) {
    for (let d = 1; d <= DIAS_TOPE; d++) {
      // 1 · aporte firme, repartido en los almacenes que tengan lugar. Si no hay
      //     ninguno, el aporte se usa directo contra la demanda del día.
      let aporteLibre = aporte_m3_dia;
      for (const a of porOrden) {
        if (aporteLibre <= 0) break;
        const lugar = a.util0_m3 - a.util_m3;
        if (lugar <= 0) continue;
        const pone = Math.min(lugar, aporteLibre);
        a.util_m3 += pone;
        aporteLibre -= pone;
      }

      // 2 · pérdidas, que no esperan a nadie
      const p = perdidasDelDia();
      let aSacar = p.evap + p.infil;
      for (const a of almacenes) {
        if (aSacar <= 0) break;
        const saca = Math.min(a.util_m3, aSacar);
        a.util_m3 -= saca;
        aSacar -= saca;
      }

      // 3 · la demanda, en el orden elegido, con lo que sobró del aporte
      let aConsumir = Math.max(0, demanda_m3_dia - aporteLibre);
      let consumido = Math.min(demanda_m3_dia, aporteLibre);
      for (const a of porOrden) {
        if (aConsumir <= 0) break;
        const saca = Math.min(a.util_m3, aConsumir);
        a.util_m3 -= saca;
        aConsumir -= saca;
        consumido += saca;
      }

      const falto = aConsumir > 1e-9;
      const queda = almacenes.reduce((s, a) => s + a.util_m3, 0);
      serie.push({
        dia: d,
        queda_m3:      Math.round(queda * 100) / 100,
        aporte_m3:     Math.round(aporte_m3_dia * 100) / 100,
        evaporado_m3:  Math.round(p.evap * 100) / 100,
        infiltrado_m3: Math.round(p.infil * 100) / 100,
        consumido_m3:  Math.round(consumido * 100) / 100,
        falto,
      });

      if (falto) { dias = d - 1; break; }
      dias = d;
      if (d === diasPedidos) quedaAlFinal = Math.round(queda * 100) / 100;
      if (d === DIAS_TOPE) llegoAlTope = true;
    }

    // ¿Las pérdidas solas la vacían? Se responde sin demanda, que es la pregunta.
    if (demanda_m3_dia > 0 && perdida_dia1_m3 > 0) {
      const copia = almacenes.map(a => ({ ...a, util_m3: a.util0_m3 }));
      let v = copia.reduce((s, a) => s + a.util_m3, 0);
      for (let d = 1; d <= diasPedidos && v > 0; d++) {
        let evap = 0, infil = 0;
        for (const a of copia) {
          if (!a.abierta || a.util0_m3 <= 0) continue;
          const llenado = Math.max(0, Math.min(1, a.util_m3 / a.util0_m3));
          const areaEf = a.espejo_m2 * llenado;
          evap  += areaEf * ((etp * fEvap) / 1000);
          infil += areaEf * (a.infil_mm / 1000);
        }
        let aSacar = Math.max(0, evap + infil - aporte_m3_dia);
        for (const a of copia) {
          if (aSacar <= 0) break;
          const saca = Math.min(a.util_m3, aSacar);
          a.util_m3 -= saca;
          aSacar -= saca;
        }
        v = copia.reduce((s, a) => s + a.util_m3, 0);
      }
      seVaciaSinConsumo = v <= 1e-9;
    }
  }

  return {
    orden,
    dias,
    llegoAlTope,
    dias_pedidos: diasPedidos,
    aguanta: diasPedidos > 0 ? (dias == null ? true : dias >= diasPedidos) : null,
    queda_al_final_m3: quedaAlFinal,
    serie,
    perdida_dia1_m3,
    seVaciaSinConsumo,
  };
}

// ─── 4 · El resumen del predio ───────────────────────────────────────────────

export interface TrimestrePredio {
  nombre:       string;
  meses_label:  string;
  /** Lluvia captada por las superficies de `captacion.ts` (m³). */
  captado_m3:   number;
  /** Aporte de nacientes, vertientes y pozos declarado en el trimestre (m³). */
  caudales_m3:  number;
  /** Lo mismo, contando sólo los medidos en la seca. */
  caudales_firmes_m3: number;
  ingreso_m3:   number;
  egreso_m3:    number;
  balance_m3:   number;
}

export interface ResumenReserva {
  /** Volumen guardado total y el que de verdad se puede usar (m³). */
  almacenado_m3: number;
  util_m3:       number;
  muerto_m3:     number;
  /** Cuánto de lo útil está al aire y por lo tanto evapora (m³). */
  util_abierto_m3: number;
  util_cerrado_m3: number;
  espejo_total_m2: number;
  /** Aporte de caudal: lo declarado y lo firme (m³/día). */
  caudal_declarado_m3_dia: number;
  caudal_firme_m3_dia:     number;
  /** Demanda del predio (m³/día). */
  demanda_m3_dia: number;
  /** Las dos autonomías, por orden de uso. */
  gastandoEspejo:  Vaciado;
  gastandoCerrado: Vaciado;
  /** Cuántos días de diferencia hace el orden de uso. */
  dias_por_el_orden: number | null;
  racha:        RachaElegida | null;
  trimestres:   TrimestrePredio[];
  advertencias: string[];
}

export interface EntradaResumen {
  fuentes:       readonly FuenteAgua[];
  demanda_l_dia: number;
  etp_mm_dia:    number;
  factorEvap?:   number;
  racha:         RachaElegida | null;
  /** Los cuatro trimestres de `captacion.ts`, si el panel de captación corrió. */
  trimestresCaptacion?: ReadonlyArray<{
    nombre: string; meses_label: string; captacion_m3: number; consumo_m3: number;
  }> | null;
  /**
   * Egreso de cada trimestre (m³) cuando el predio tiene la demanda reunida de
   * todas las pestañas, y no sólo la lista de Captación.
   *
   * Pisa al `consumo_m3` de los trimestres por un motivo de consistencia y no
   * de precisión: si la autonomía de arriba se calcula con el rodeo y el riego
   * reales, la tabla de abajo no puede seguir mostrando el consumo de otra
   * lista. Dos egresos distintos en la misma pantalla es cómo se pierde la
   * confianza en las dos. Ver `lib/balanceAgua.ts`.
   */
  egresoTrimestral_m3?: readonly number[] | null;
}

/** Días de cada trimestre en un año no bisiesto, en el orden que arma captación. */
const DIAS_TRIMESTRE = [90, 91, 92, 92] as const;

export function resumenReserva(e: EntradaResumen): ResumenReserva {
  const fuentes = e.fuentes;
  const almacenado = fuentes.reduce((s, f) =>
    s + (TIPOS_FUENTE[f.tipo].clase === 'almacenaje' ? Math.max(0, n(f.volumen_m3)) : 0), 0);
  const util = fuentes.reduce((s, f) => s + volumenUtil_m3(f), 0);
  const utilAbierto = fuentes.reduce((s, f) =>
    s + (TIPOS_FUENTE[f.tipo].abierta ? volumenUtil_m3(f) : 0), 0);
  const espejo = fuentes.reduce((s, f) =>
    s + (TIPOS_FUENTE[f.tipo].abierta ? Math.max(0, n(f.espejo_m2)) : 0), 0);
  const caudalDecl = fuentes.reduce((s, f) => s + aporteDeclarado_m3_dia(f), 0);
  const caudalFirme = fuentes.reduce((s, f) => s + aporteFirme_m3_dia(f), 0);

  const dias = e.racha?.dias ?? 0;
  const base = {
    fuentes, demanda_l_dia: e.demanda_l_dia, dias,
    etp_mm_dia: e.etp_mm_dia,
    ...(e.factorEvap != null ? { factorEvap: e.factorEvap } : {}),
  };
  const gastandoEspejo  = simularRacha({ ...base, orden: 'espejo_primero' });
  const gastandoCerrado = simularRacha({ ...base, orden: 'cerrado_primero' });

  const diasPorElOrden = gastandoEspejo.dias != null && gastandoCerrado.dias != null
    ? gastandoEspejo.dias - gastandoCerrado.dias
    : null;

  // ─── Los cuatro trimestres ───
  const trimestres: TrimestrePredio[] = (e.trimestresCaptacion ?? []).map((t, i) => {
    const d = DIAS_TRIMESTRE[i] ?? 91;
    const caudales = caudalDecl * d;
    const firmes   = caudalFirme * d;
    const ingreso  = t.captacion_m3 + firmes;
    const egreso   = e.egresoTrimestral_m3?.[i] ?? t.consumo_m3;
    return {
      nombre: t.nombre,
      meses_label: t.meses_label,
      captado_m3: Math.round(t.captacion_m3 * 10) / 10,
      caudales_m3: Math.round(caudales * 10) / 10,
      caudales_firmes_m3: Math.round(firmes * 10) / 10,
      ingreso_m3: Math.round(ingreso * 10) / 10,
      egreso_m3: Math.round(egreso * 10) / 10,
      balance_m3: Math.round((ingreso - egreso) * 10) / 10,
    };
  });

  // ─── Lo que hay que decir ───
  const advertencias: string[] = [];

  if (fuentes.length === 0) {
    advertencias.push(
      'No hay ninguna fuente cargada, así que no hay nada que comparar. La represa que se diseñó en '
      + 'la pestaña Represas no entra sola: se carga acá con su volumen y su espejo, porque un vaso '
      + 'calculado y un vaso construido no son lo mismo.');
  }

  const sinMedir = fuentes.filter(f => TIPOS_FUENTE[f.tipo].clase === 'caudal' && !f.medidoEnSeca && n(f.caudal_l_min) > 0);
  if (sinMedir.length > 0) {
    advertencias.push(
      `${sinMedir.length === 1 ? 'Hay una fuente de caudal' : `Hay ${sinMedir.length} fuentes de caudal`} `
      + `(${sinMedir.map(f => `«${f.nombre}»`).join(', ')}) cuyo caudal no se midió en la época seca, así que `
      + `${sinMedir.length === 1 ? 'no entra' : 'no entran'} en la cuenta de autonomía: una vertiente que da `
      + `${Math.round(caudalDecl * 1000 / 1440)} L/min en primavera puede dar cero en febrero, y febrero es `
      + 'cuando se la necesita. Medila dos veces en la seca —con balde y reloj alcanza— y marcala como medida.');
  }

  const abiertasSinEspejo = fuentes.filter(f => TIPOS_FUENTE[f.tipo].abierta && volumenUtil_m3(f) > 0 && n(f.espejo_m2) <= 0);
  if (abiertasSinEspejo.length > 0) {
    advertencias.push(
      `${abiertasSinEspejo.map(f => `«${f.nombre}»`).join(', ')} ${abiertasSinEspejo.length === 1 ? 'guarda agua al aire' : 'guardan agua al aire'} `
      + 'y no tiene cargada la superficie del espejo, así que la evaporación de esa fuente sale cero y la '
      + 'autonomía sale optimista. El espejo es el dato que más mueve esta cuenta.');
  }

  const muertoCero = fuentes.filter(f => TIPOS_FUENTE[f.tipo].abierta && n(f.volumen_m3) > 0 && n(f.volumenMuerto_m3) <= 0);
  if (muertoCero.length > 0) {
    advertencias.push(
      'Hay represas con volumen muerto en cero. AH-590 pide una lámina permanente que no se puede usar '
      + '—«the water must be deep enough to meet the intended use requirements and to offset probable '
      + 'seepage and evaporation losses»—, y la pestaña Represas calcula cuánta pide este clima. Sin '
      + 'descontarla, la reserva disponible queda sobrestimada en el fondo del vaso.');
  }

  if (gastandoEspejo.seVaciaSinConsumo) {
    advertencias.push(
      'Las pérdidas solas vacían la reserva dentro de la racha, sin que nadie consuma una gota: la '
      + 'evaporación y la infiltración se la llevan. Acá el problema no es el consumo, es la relación '
      + 'entre el espejo y el volumen: el mismo agua en un vaso más hondo y más chico de boca dura más.');
  }

  if (e.racha == null) {
    advertencias.push(
      'Sin la serie diaria no hay racha seca medida, y el período de diseño no se inventa. Traé los '
      + 'extremos climáticos desde Clima y la autonomía se compara contra la racha de este predio.');
  }

  if (trimestres.length === 0) {
    advertencias.push(
      'Los cuatro trimestres salen de la pestaña Captación, que es la que tiene las superficies y los '
      + 'consumos. Sin eso, acá sólo está la reserva y no el ingreso de lluvia.');
  }

  return {
    almacenado_m3: Math.round(almacenado * 10) / 10,
    util_m3: Math.round(util * 10) / 10,
    muerto_m3: Math.round((almacenado - util) * 10) / 10,
    util_abierto_m3: Math.round(utilAbierto * 10) / 10,
    util_cerrado_m3: Math.round((util - utilAbierto) * 10) / 10,
    espejo_total_m2: Math.round(espejo),
    caudal_declarado_m3_dia: Math.round(caudalDecl * 100) / 100,
    caudal_firme_m3_dia: Math.round(caudalFirme * 100) / 100,
    demanda_m3_dia: Math.round((Math.max(0, n(e.demanda_l_dia)) / 1000) * 100) / 100,
    gastandoEspejo,
    gastandoCerrado,
    dias_por_el_orden: diasPorElOrden,
    racha: e.racha,
    trimestres,
    advertencias,
  };
}

// ─── 4.1 · La ETP del mes que manda ────────────────────────────────────────────

export interface EtpCritica {
  /** ETP de referencia del mes elegido, en mm/día. */
  mm_dia: number;
  mes:    string;
  lectura:string;
}

const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/**
 * Con qué ETP se calcula el vaciado: la del mes de ETP más alta.
 *
 * No es la del mes de balance hídrico más negativo, que sería el criterio si
 * esto fuera un balance. Durante una racha seca **no llueve, por definición**,
 * así que el término de lluvia no participa y lo único que queda es la demanda
 * atmosférica. El mes de ETP máxima es el peor momento para que caiga la racha,
 * y una reserva que aguanta ahí aguanta en cualquier otro.
 *
 * Es la ETP de REFERENCIA, de pasto corto. El espejo de agua no evapora eso: hay
 * que multiplicarla por el coeficiente de FAO-56, que es lo que hace
 * `simularRacha`.
 */
export function etpCritica(meses: ReadonlyArray<{ mes: string; etp_mm: number }> | null | undefined): EtpCritica | null {
  if (!meses || meses.length === 0) return null;
  let mejor: { mm_dia: number; mes: string } | null = null;
  meses.forEach((m, i) => {
    const d = DIAS_MES[i % 12] ?? 30;
    const v = Number.isFinite(m.etp_mm) ? m.etp_mm / d : NaN;
    if (!Number.isFinite(v) || v <= 0) return;
    if (!mejor || v > mejor.mm_dia) mejor = { mm_dia: v, mes: m.mes };
  });
  if (!mejor) return null;
  const elegido: { mm_dia: number; mes: string } = mejor;
  return {
    mm_dia: Math.round(elegido.mm_dia * 100) / 100,
    mes: elegido.mes,
    lectura:
      `Se usa la ETP de ${elegido.mes}, que es el mes de mayor demanda atmosférica `
      + `(${(Math.round(elegido.mm_dia * 100) / 100).toLocaleString('es-AR')} mm/día de referencia). `
      + 'No se usa el mes de balance más negativo porque en una racha seca no llueve: el término de '
      + 'lluvia no participa y sólo queda cuánto tira la atmósfera.',
  };
}

// ─── 4.2 · Snapshot para guardar el proyecto y el informe ───────────────

/**
 * Lo que se guarda son las FUENTES y nada más. El resumen se recalcula al abrir
 * el proyecto, porque depende del clima y de la captación, que pueden haber
 * cambiado: guardar un número de autonomía sería guardar una conclusión vieja.
 */
export interface ReservaSnapshot {
  fuentes:   FuenteAgua[];
  escenario: EscenarioRacha;
}

// ─── 5 · Las fuentes publicadas ──────────────────────────────────────────────

export const FUENTE_AH590_RESERVA =
  'USDA NRCS, Agriculture Handbook 590 «Ponds — Planning, Design, Construction» (1997): el criterio de '
  + 'la lámina permanente y la figura 12 de profundidad mínima recomendada.';

export const FUENTE_FAO56_ESPEJO =
  'FAO Irrigation and Drainage Paper 56 «Crop evapotranspiration» (1998), cuadro 12: el coeficiente del '
  + 'espejo de agua libre sobre la ETP de referencia.';

export const FUENTE_RACHA =
  'La racha seca sale de la serie diaria del propio predio (días con menos de 1 mm), calculada en '
  + 'climaExtremos.ts. No hay norma leída que publique cuántos días de reserva tiene que tener un predio: '
  + 'el período de diseño es el que midió el clima del lugar.';
