/**
 * Salud del cálculo para el resto de las herramientas de agua (H2).
 *
 * `hidrologiaPredio` (H0) ya devuelve su propio objeto `Confianza` y con eso se
 * estrenó el bloque en Swales. Este módulo hace lo mismo para las tres
 * herramientas que quedaban con sus números desnudos: Cuenca, Represa y
 * Erosión. Cada una tiene supuestos distintos, así que cada una arma sus
 * avisos; lo único compartido es el contrato (`Confianza`) y el criterio de
 * nivel (`armarConfianza`).
 *
 * Criterio de redacción, el mismo en las tres:
 *
 *  · `alerta` → el número puede estar mal y hay algo concreto que hacer.
 *  · `aviso`  → falta un dato que el usuario PUEDE cargar, o el método está
 *               operando fuera de su rango de calibración.
 *  · `ok`     → alcance del método. No se arregla cargando nada: es cómo hay
 *               que leer el resultado. Informa, no baja la confianza.
 *
 * Todo esto es puro y no tira: son funciones de datos a texto.
 */
import {
  armarConfianza, avisosDeContexto,
  type AvisoCalculo, type Confianza,
} from './hidrologiaPredio';
import type { FuenteRelieve } from './grillaElevacion';
import type { GrupoHidro } from './cuenca';
import { DUR_MIN_MIN } from './tormenta';

// ─── Cuenca de aporte (B2) ────────────────────────────────────────────────────

export interface EntradaCuencaSalud {
  area_ha:          number;
  long_flujo_m:     number;
  cn:               number;
  precip_mm:        number;
  escurrimiento_mm: number;
  /** la tormenta se autocompletó desde Clima → Extremos */
  precipDeClima:    boolean;
  /** el grupo hidrológico salió del análisis de Suelo (A4) */
  grupoDeSuelo:     boolean;
  /** la cuenca ya se extendió hasta la divisoria real */
  expandida:        boolean;
  fuenteDem?:       FuenteRelieve | null;
  /** CN compuesto por cobertura satelital del predio, para contrastar */
  cnPredio?:        number | null;
  /** duración de la ráfaga de diseño usada para el pico (H5), en minutos */
  duracion_min?:    number | null;
  /** intensidad media de esa ráfaga (mm/h) */
  intensidad_mm_h?: number | null;
}

/** Hasta acá Kirpich fue calibrado (cuencas agrícolas chicas). */
const KIRPICH_HA_MAX = 80;

/** Y hasta acá el método racional (misma familia de cuencas chicas). */
const RACIONAL_HA_MAX = 200;

export function confianzaCuenca(e: EntradaCuencaSalud): Confianza {
  const avisos: AvisoCalculo[] = [];

  if (!e.expandida) {
    avisos.push({
      id: 'cuenca_acotada', nivel: 'alerta',
      titulo: 'La cuenca está acotada al terreno',
      detalle: 'Se cortó en el límite del predio, así que el área de aporte —y con ella el volumen y el caudal pico— está SUBESTIMADA. Usá "Extender hasta la divisoria real" para que suba hasta el filo, aunque se salga del lote.',
    });
  }

  if (!e.grupoDeSuelo) {
    avisos.push({
      id: 'sin_suelo', nivel: 'aviso',
      titulo: 'Grupo hidrológico elegido a mano',
      detalle: 'El grupo define cuánta lluvia infiltra antes de escurrir: entre A y D, el mismo aguacero puede escurrir el triple. Analizá el suelo (pestaña Suelo) para que salga del perfil real.',
    });
  }

  if (!e.precipDeClima) {
    avisos.push({
      id: 'sin_clima', nivel: 'alerta',
      titulo: `Tormenta de diseño puesta a mano (${Math.round(e.precip_mm)} mm)`,
      detalle: 'Es un número tuyo, no el de tu lugar. Cargá Clima → Extremos y la lluvia sale del ajuste de Gumbel sobre la serie de tu ubicación: el vertedero se dimensiona con eso.',
    });
  }

  if (e.escurrimiento_mm <= 0.05) {
    avisos.push({
      id: 'sin_escurrimiento', nivel: 'alerta',
      titulo: 'Con este CN y esta lluvia el SCS da escurrimiento cero',
      detalle: `CN ${e.cn} sobre ${Math.round(e.precip_mm)} mm: toda la lluvia se va en abstracción inicial e infiltración. Es un resultado válido, pero no sirve para dimensionar nada: subí la tormenta de diseño al T50 o T100.`,
    });
  }

  if (e.area_ha > KIRPICH_HA_MAX) {
    const tambienRacional = e.area_ha > RACIONAL_HA_MAX;
    avisos.push({
      id: 'kirpich_rango', nivel: 'aviso',
      titulo: `Cuenca de ${e.area_ha.toFixed(0)} ha: fuera del rango de Kirpich`,
      detalle: `La fórmula del tiempo de concentración se calibró en cuencas de hasta ~${KIRPICH_HA_MAX} ha. Más grande que eso, subestima el tc y por lo tanto SOBREESTIMA el caudal pico: queda del lado seguro para el vertedero, pero no es el caudal real.${
        tambienRacional
          ? ` Arriba de ~${RACIONAL_HA_MAX} ha el método racional tampoco corresponde: en cuencas así hace falta un hidrograma con tránsito, no un pico de fórmula.`
          : ''
      }`,
    });
  }

  if (e.cnPredio != null && Math.abs(e.cn - e.cnPredio) >= 5) {
    const mas = e.cn > e.cnPredio;
    avisos.push({
      id: 'cn_vs_satelital', nivel: 'aviso',
      titulo: `CN ${e.cn} elegido a mano · la cobertura satelital da ${e.cnPredio}`,
      detalle: `La cobertura que elegiste escurre ${mas ? 'MÁS' : 'MENOS'} que la que ve el satélite sobre el predio. Si la cuenca cae mayormente adentro del lote, revisá la cobertura; si viene de campos vecinos con otro uso, está bien que difieran.`,
    });
  }

  avisosDeContexto({ fuenteDem: e.fuenteDem, area_ha: e.area_ha, objeto: 'una cuenca' }, avisos);

  if (e.duracion_min != null && e.intensidad_mm_h != null) {
    avisos.push({
      id: 'rafaga_desagregada', nivel: 'ok',
      titulo: `El pico sale de una ráfaga de ${e.duracion_min} min a ${e.intensidad_mm_h} mm/h`,
      detalle: `El volumen es de todo el evento de 24 h; el caudal pico, no: lo produce la ráfaga corta que coincide con el tiempo de concentración. Como el clima sólo da la lámina diaria, esa ráfaga se desagrega con la ley potencia P(d) = P(24h)·(d/24)^0.30, que es la aproximación empírica clásica. Si conseguís curvas IDF de una estación cercana, mandan ellas.${
        e.duracion_min <= DUR_MIN_MIN ? ` Acá el tc dio menos de ${DUR_MIN_MIN} min y se recortó ahí: abajo de eso la ley se dispara y daría una intensidad irreal.` : ''
      }`,
    });
  }

  avisos.push({
    id: 'amc_ii', nivel: 'ok',
    titulo: 'CN en humedad antecedente media (AMC II)',
    detalle: 'El método asume el suelo en estado medio al empezar a llover. Si el aguacero cae sobre suelo ya saturado —dos días de lluvia seguidos— el escurrimiento real puede ser cerca del doble. Para obras que no perdonan, dimensioná con la tormenta de mayor recurrencia.',
  });

  return armarConfianza(avisos, {
    relieve: e.fuenteDem != null,
    suelo:   e.grupoDeSuelo,
    clima:   e.precipDeClima,
  });
}

// ─── Represa · simulación anual del embalse (B3) ──────────────────────────────

export interface EntradaRepresaSalud {
  hayClima:            boolean;
  area_espejo_m2:      number;
  cuenca_ha:           number;
  /** el área de aporte vino del cálculo (B2 o el muro), no tipeada a mano */
  cuencaCalculada:     boolean;
  infiltracion_mm_dia: number;
  grupo:               GrupoHidro | null;
  fuenteDem?:          FuenteRelieve | null;
}

export function confianzaRepresa(e: EntradaRepresaSalud): Confianza {
  const avisos: AvisoCalculo[] = [];

  if (!e.hayClima) {
    avisos.push({
      id: 'sin_clima', nivel: 'alerta',
      titulo: 'Sin clima cargado no hay balance',
      detalle: 'La simulación necesita la lluvia y la evapotranspiración mes a mes. Cargá la pestaña Clima.',
    });
  }

  // El vaso: de qué sirve embalsar si el suelo se lo chupa.
  if (e.grupo === null) {
    avisos.push({
      id: 'sin_suelo', nivel: 'aviso',
      titulo: `Infiltración del vaso asumida en ${e.infiltracion_mm_dia} mm/día`,
      detalle: 'Es el valor típico de un vaso en suelo medio. Analizá el suelo (pestaña Suelo) y sabrás si el terreno retiene o si hay que impermeabilizar: entre un vaso arcilloso y uno arenoso, la pérdida cambia de 1 a 10.',
    });
  } else if (e.grupo === 'A') {
    avisos.push({
      id: 'vaso_permeable', nivel: 'alerta',
      titulo: 'Suelo grupo A (arenoso): el vaso pierde agua',
      detalle: `Con ${e.infiltracion_mm_dia} mm/día el modelo está siendo optimista para un suelo así — es de los que se vacían solos. Contá con impermeabilizar (arcilla compactada, bentonita o membrana) o subí la infiltración a 8–15 mm/día para ver el caso realista.`,
    });
  } else if (e.grupo === 'B') {
    avisos.push({
      id: 'vaso_permeable', nivel: 'aviso',
      titulo: 'Suelo grupo B: vaso medianamente permeable',
      detalle: `${e.infiltracion_mm_dia} mm/día es razonable, pero es el parámetro más incierto de toda la simulación. Si la represa es clave, hacé un pozo de infiltración en el sitio antes de excavar.`,
    });
  } else {
    avisos.push({
      id: 'vaso_estanco', nivel: 'ok',
      titulo: `Suelo grupo ${e.grupo}: buen vaso`,
      detalle: 'Los suelos pesados retienen: la infiltración cargada probablemente esté del lado conservador. Lo mismo que hace bueno al vaso hace mala la infiltración de la cuenca — por eso también escurre más y la llena antes.',
    });
  }

  if (!e.cuencaCalculada) {
    avisos.push({
      id: 'cuenca_a_mano', nivel: 'aviso',
      titulo: `Área de aporte puesta a mano (${e.cuenca_ha} ha)`,
      detalle: 'Todo el llenado sale de ese número: si está al doble, la represa "aguanta" en la pantalla y se seca en el campo. Marcá la cuenca en la pestaña Cuenca o desde el muro para que la calcule el relieve.',
    });
  }

  avisosDeContexto(
    { fuenteDem: e.fuenteDem, area_ha: e.area_espejo_m2 / 10_000, objeto: 'un espejo de agua' },
    avisos,
  );

  avisos.push({
    id: 'clima_normales', nivel: 'ok',
    titulo: 'El balance corre sobre el año promedio',
    detalle: 'Son las normales mensuales, no una serie de años. Un año seco real cae bastante por debajo de esta curva: si la confiabilidad da justa en el año medio, en el año seco no alcanza. Miralo como el mejor caso razonable.',
  });

  avisos.push({
    id: 'coef_anual', nivel: 'ok',
    titulo: 'Acá el coeficiente de escorrentía es ANUAL',
    detalle: 'Es la fracción de la lluvia del año que llega al vaso, y es bastante menor que el coeficiente de un aguacero (el que usan Swales y Cuenca). No los mezcles: con el de evento, la represa se llenaría en la pantalla tres veces de más.',
  });

  return armarConfianza(avisos, {
    relieve: e.fuenteDem != null,
    suelo:   e.grupo !== null,
    clima:   e.hayClima,
  });
}

// ─── Riesgo de erosión ────────────────────────────────────────────────────────

export interface EntradaErosionSalud {
  area_ha:        number;
  usle_c:         number | null;
  nota_cobertura: string;
  fuenteDem?:     FuenteRelieve | null;
  /** clase textural del suelo (A4), sólo para matizar qué falta */
  textura?:       string | null;
}

export function confianzaErosion(e: EntradaErosionSalud): Confianza {
  const avisos: AvisoCalculo[] = [];

  if (e.usle_c === null) {
    avisos.push({
      id: 'sin_cobertura', nivel: 'aviso',
      titulo: 'Sin cobertura: el mapa es puro relieve',
      detalle: 'Con pendiente y flujo solos, un monte cerrado y un barbecho en la misma ladera se pintan igual. Cargá Cobertura y entra el factor C de la USLE, que es el que más mueve la erosión real.',
    });
  } else {
    avisos.push({
      id: 'cobertura_magnitud', nivel: 'ok',
      titulo: 'La cobertura entra como magnitud, no como dibujo',
      detalle: `${e.nota_cobertura} WorldCover llega como porcentajes del predio, no celda por celda, así que C corre los umbrales de severidad para todo el lote — no puede señalar cuál rincón está pelado.`,
    });
  }

  avisosDeContexto({ fuenteDem: e.fuenteDem, area_ha: e.area_ha }, avisos);

  avisos.push({
    id: 'indice_relativo', nivel: 'ok',
    titulo: 'El mapa es relativo a ESTE predio',
    detalle: 'El índice se normaliza contra el propio terreno, así que siempre va a haber celdas en rojo aunque el lote entero sea suave (y al revés). Sirve para decidir dónde proteger primero adentro del predio, no para comparar un campo con otro.',
  });

  avisos.push({
    id: 'sin_erodabilidad', nivel: 'ok',
    titulo: 'Índice de relieve y cobertura, no USLE completa',
    detalle: e.textura
      ? `Falta la erodabilidad del suelo (K) y las prácticas de conservación (P). Tu suelo es ${e.textura}: los limosos se van con mucha menos energía que los arcillosos, así que la misma ladera puede erosionar bastante más o menos que lo que muestra el mapa.`
      : 'Falta la erodabilidad del suelo (K) y las prácticas de conservación (P). Un suelo limoso se va con mucha menos energía que uno arcilloso sobre la misma pendiente.',
  });

  return armarConfianza(avisos, {
    relieve:   e.fuenteDem != null,
    cobertura: e.usle_c !== null,
  });
}
