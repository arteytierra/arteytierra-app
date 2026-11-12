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
 * Y desde el 12/11/2026 también para las dos que deciden qué obra se hace con
 * esa agua: `avisoSwalesExpansivo` y `avisoKeylineExpansivo`, al final del
 * archivo, que devuelven un aviso suelto en vez de una `Confianza` porque
 * Swales ya muestra la de H0 y Líneas clave no tiene ninguna.
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
  type AvisoCalculo, type Confianza, type RelieveMedido,
} from './hidrologiaPredio';
import type { FuenteRelieve } from './grillaElevacion';
import type { GrupoHidro } from './cuenca';
import type { SueloExpansivo } from './sueloExpansivo';
import {
  DERIVA_MAX_FRACCION_PENDIENTE, DERIVA_MIN_DRENAJE_PCT,
} from './keylineGeometria';
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
  /** cómo llegó muestreado el relieve: una grilla escalonada vacía el D8 */
  relieve?:         RelieveMedido | null;
  /** CN compuesto por cobertura satelital del predio, para contrastar */
  cnPredio?:        number | null;
  /** duración de la ráfaga de diseño usada para el pico (H5), en minutos */
  duracion_min?:    number | null;
  /** intensidad media de esa ráfaga (mm/h) */
  intensidad_mm_h?: number | null;
  /** pendiente media del recorrido de flujo (m/m), para el rango de Kirpich */
  pendiente_m_m?:   number | null;
  /** factor de ajuste de Kirpich aplicado, con su razón (ver `cuenca.ts`) */
  tc_factor?:       number | null;
  tc_kirpich_min?:  number | null;
  tc_min?:          number | null;
  /**
   * Suelo expansivo en el punto (A4), si se pudo reconocer. Acá el aviso no
   * es para desconfiar del CN del evento sino para mandar la desconfianza
   * al lugar que le toca, que es el coeficiente ANUAL de la represa.
   */
  expansivo?:       SueloExpansivo | null;
}

/** Hasta acá Kirpich fue calibrado (cuencas agrícolas chicas). */
const KIRPICH_HA_MAX = 80;

/** Y entre estas pendientes: las siete cuencas de Tennessee de Kirpich (1940)
 *  tenían entre 3 y 10 %. Abajo de 3 % la fórmula devuelve tiempos cortos que
 *  no son los de un terreno llano. */
const KIRPICH_PEND_MIN = 0.03;
const KIRPICH_PEND_MAX = 0.10;

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

  // Pendiente fuera del rango en el que Kirpich fue ajustado. No invalida el
  // número —no hay otro mejor sin curvas IDF locales— pero cambia de qué lado
  // está el error, y eso hay que decirlo antes de que alguien compre una caño.
  if (e.pendiente_m_m != null && e.pendiente_m_m > 0) {
    const p = e.pendiente_m_m;
    if (p < KIRPICH_PEND_MIN || p > KIRPICH_PEND_MAX) {
      const llano = p < KIRPICH_PEND_MIN;
      avisos.push({
        id: 'kirpich_pendiente', nivel: 'aviso',
        titulo: `Pendiente media ${(p * 100).toFixed(1)} %: fuera del ${KIRPICH_PEND_MIN * 100}–${KIRPICH_PEND_MAX * 100} % de Kirpich`,
        detalle: llano
          ? 'En terreno tan llano el agua no se encauza: se extiende en lámina y tarda bastante más de lo que dice la fórmula. El tiempo de concentración queda CORTO y el caudal pico, alto. Sirve para dimensionar del lado seguro; no lo tomes como el caudal que va a pasar.'
          : 'En pendientes así de fuertes la fórmula extrapola hacia arriba. Con una obra que no perdone, verificá el tiempo de concentración con el método de velocidades del NRCS (NEH-630, cap. 15).',
      });
    }
  }

  // El ajuste de Kirpich, dicho en voz alta. Es una corrección grande —duplica
  // el tc— y no puede pasar escondida adentro de un número: si el recorrido va
  // por una cuneta o un arroyito formado, el factor no corresponde.
  if (e.tc_factor != null && e.tc_factor !== 1 && e.tc_kirpich_min != null && e.tc_min != null) {
    avisos.push({
      id: 'kirpich_ajuste', nivel: 'ok',
      titulo: `Tiempo de concentración ajustado ×${e.tc_factor}: ${e.tc_kirpich_min} → ${e.tc_min} min`,
      detalle: 'Kirpich se calibró en cuencas con cauce definido, y el agua desparramada sobre el suelo tarda alrededor del doble. El factor es el publicado (FHWA HEC-22; Rossmiller 1980), no un ajuste nuestro. Si el recorrido de tu cuenca va por una cuneta, una zanja o un arroyito ya formado, el factor no corresponde y el tc real está más cerca del valor sin ajustar.',
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

  avisosDeContexto({ fuenteDem: e.fuenteDem, relieve: e.relieve, area_ha: e.area_ha, objeto: 'una cuenca' }, avisos);

  if (e.duracion_min != null && e.intensidad_mm_h != null) {
    avisos.push({
      id: 'rafaga_desagregada', nivel: 'ok',
      titulo: `El pico sale de una ráfaga de ${e.duracion_min} min a ${e.intensidad_mm_h} mm/h`,
      detalle: `El volumen es de todo el evento de 24 h; el caudal pico, no: lo produce la ráfaga corta que coincide con el tiempo de concentración. Como el clima sólo da la lámina diaria, esa ráfaga se desagrega con la ley potencia P(d) = P(24h)·(d/24)^0.30, que es la aproximación empírica clásica. Si conseguís curvas IDF de una estación cercana, mandan ellas.${
        e.duracion_min <= DUR_MIN_MIN ? ` Acá el tc dio menos de ${DUR_MIN_MIN} min y se recortó ahí: abajo de eso la ley se dispara y daría una intensidad irreal.` : ''
      }`,
    });
  }

  // El suelo que se agrieta no tiene una infiltración, tiene dos, y el CN es
  // una sola. Lo importante acá es que el aviso no asuste en el lugar
  // equivocado: para la tormenta de diseño el grupo D está bien.
  if (e.expansivo) {
    avisos.push({
      id: 'suelo_expansivo', nivel: 'aviso',
      titulo: e.expansivo.nivel === 'medido'
        ? 'Suelo expansivo: este perfil tiene dos infiltraciones, no una'
        : 'Puede ser suelo expansivo: serían dos infiltraciones, no una',
      detalle:
        'Las grietas de contracción controlan la infiltración mientras están '
        + 'abiertas, incluso rellenas de material de la superficie (WRB 2022). '
        + 'Medido en el vertisol del ICRISAT: 76 mm/h en la primera media hora, '
        + '34 en la segunda, 4 en la segunda hora y 0,21 ± 0,1 después de 144 h. '
        + 'Un factor 360 entre el suelo agrietado y el sellado, y el CN describe '
        + 'uno de los dos estados. Para la tormenta de diseño el estado sellado '
        + 'es el que corresponde —un T10 o un T50 cae con el perfil ya húmedo y '
        + 'las grietas cerradas—, así que este caudal pico no cambia. Lo que sí '
        + 'queda sobreestimado es el coeficiente ANUAL que usa la represa: '
        + 'miralo en esa pestaña. ' + e.expansivo.cautela,
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
  /**
   * Suelo expansivo en el punto (A4), si se pudo reconocer. Es el aviso que
   * más importa de los tres: el coeficiente anual alimenta el llenado, y en
   * este suelo la tabla por grupo hidrológico se equivoca para arriba.
   */
  expansivo?:          SueloExpansivo | null;
  fuenteDem?:          FuenteRelieve | null;
  /** cómo llegó muestreado el relieve: una grilla escalonada vacía el D8 */
  relieve?:         RelieveMedido | null;
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
    { fuenteDem: e.fuenteDem, relieve: e.relieve, area_ha: e.area_espejo_m2 / 10_000, objeto: 'un espejo de agua' },
    avisos,
  );

  avisos.push({
    id: 'clima_normales', nivel: 'ok',
    titulo: 'El balance corre sobre el año promedio',
    detalle: 'Son las normales mensuales, no una serie de años. Un año seco real cae bastante por debajo de esta curva: si la confiabilidad da justa en el año medio, en el año seco no alcanza. Miralo como el mejor caso razonable.',
  });

  // El aviso que justifica todo el módulo: si el suelo es expansivo, el
  // coeficiente anual que llena esta represa está sobreestimado, y el error
  // va para arriba. No se toca el número —ver `lib/sueloExpansivo.ts`—: se
  // dice cuánto puede valer y qué se mide para saberlo.
  if (e.expansivo) {
    avisos.push({
      id: 'suelo_expansivo',
      nivel: e.expansivo.nivel === 'medido' ? 'alerta' : 'aviso',
      titulo: e.expansivo.nivel === 'medido'
        ? 'Suelo expansivo: el aporte anual está sobreestimado'
        : 'Puede ser suelo expansivo, y entonces el aporte anual está sobreestimado',
      detalle:
        e.expansivo.efecto_hidrologico
        + ' No cambia el vaso —un suelo así retiene—: cambia el agua que '
        + 'llega. Lo que hay que hacer es bajar el coeficiente a mano hacia el '
        + 'extremo inferior y ver si la represa sigue aguantando; si no aguanta, '
        + 'el dato que decide no es un pozo de infiltración sino el '
        + 'escurrimiento medido de una temporada en el mismo predio. '
        + e.expansivo.cautela,
    });
  }

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
  /** cómo llegó muestreado el relieve: una grilla escalonada vacía el D8 */
  relieve?:         RelieveMedido | null;
  /** clase textural del suelo (A4): matiza qué falta, y da el K si hay magnitud */
  textura?:       string | null;
  /** ¿se está mostrando la pérdida en t/ha/año? (necesita clima + suelo) */
  hayMagnitud?:   boolean;
  /** precipitación anual usada para la erosividad R, si la hay */
  precipAnual_mm?: number | null;
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

  avisosDeContexto({ fuenteDem: e.fuenteDem, relieve: e.relieve, area_ha: e.area_ha }, avisos);

  avisos.push({
    id: 'indice_relativo', nivel: 'ok',
    titulo: 'El mapa es relativo a ESTE predio',
    detalle: 'El índice se normaliza contra el propio terreno, así que siempre va a haber celdas en rojo aunque el lote entero sea suave (y al revés). Sirve para decidir dónde proteger primero adentro del predio, no para comparar un campo con otro.',
  });

  if (e.hayMagnitud) {
    // Con clima y suelo cargados la USLE se cierra y el índice relativo pasa a
    // t/ha/año. El número vale, pero es el producto de cinco aproximaciones y
    // eso hay que decirlo con todas las letras, no en una nota al pie.
    avisos.push({
      id: 'usle_completa', nivel: 'ok',
      titulo: 'La pérdida en t/ha/año es una banda, no un número',
      detalle: `A = R·K·LS·C·P. La erosividad R sale de una regresión global sobre la lluvia anual${
        e.precipAnual_mm ? ` (${Math.round(e.precipAnual_mm)} mm)` : ''
      }, K de la tabla de valores típicos por textura${e.textura ? ` (${e.textura})` : ''} corregida por materia orgánica, y LS de la pendiente media y la longitud de ladera de cada clase sobre el DEM. Por eso se muestra una banda de ×÷2: sirve para saber si estás arriba o abajo de la tolerancia, no para llevar al papel.`,
    });
    avisos.push({
      id: 'sin_practicas', nivel: 'ok',
      titulo: 'Se asume P = 1: sin prácticas de conservación',
      detalle: 'La app no sabe si hay terrazas, siembra en contorno o fajas. Si las hay, la pérdida real es menor —hasta la mitad con contorno en pendientes medias—. Se asume que no, porque suponer que sí subestimaría, que es el error caro.',
    });
  } else {
    avisos.push({
      id: 'sin_erodabilidad', nivel: 'ok',
      titulo: 'Índice de relieve y cobertura, no USLE completa',
      detalle: e.textura
        ? `Falta la erodabilidad del suelo (K) y las prácticas de conservación (P). Tu suelo es ${e.textura}: los limosos se van con mucha menos energía que los arcillosos, así que la misma ladera puede erosionar bastante más o menos que lo que muestra el mapa. Cargá Clima y se completa la USLE con la pérdida en t/ha/año.`
        : 'Falta la erodabilidad del suelo (K) y las prácticas de conservación (P). Un suelo limoso se va con mucha menos energía que uno arcilloso sobre la misma pendiente. Con Clima y Suelo cargados, la app cierra la USLE y estima la pérdida en t/ha/año.',
    });
  }

  return armarConfianza(avisos, {
    relieve:   e.fuenteDem != null,
    cobertura: e.usle_c !== null,
  });
}

// ─── Obras de retención sobre suelo expansivo (Swales y Líneas clave) ────────

/**
 * El aviso que les faltaba a las dos herramientas que empujan a retener agua.
 *
 * El 12/11/2026 la app aprendió a reconocer un suelo expansivo
 * (`lib/sueloExpansivo.ts`) y el aviso salió en Cuenca y en Represa, que son
 * las que calculan cuánta agua llega. Faltaban las dos que deciden **qué obra
 * se hace con esa agua**, y acá son las que más importan: una zanja a nivel y
 * un patrón de líneas clave son obras de retención, y para este suelo la
 * bibliografía publica lo contrario.
 *
 * ## Qué publica la bibliografía para este suelo
 *
 * La tecnología que el ICRISAT desarrolló para los vertisoles del Decán no es
 * una zanja de infiltración a nivel: es un **camellón ancho con surco a
 * pendiente**, «laid out on a gradual slope (usually 0.4-0.8%)», donde el lomo
 * del camellón hace de minibordo y el surco «provides good surface drainage to
 * prevent waterlogging», con desagües de parcela y cauces empastados aguas
 * abajo. Y el elemento se enuncia como «shaping land to promote disposal of
 * excess water»: el propósito declarado es **sacar** el agua que sobra, no
 * juntarla (Swindale 1988, texto completo abierto; es el mismo trabajo del que
 * sale la curva de infiltración de Virmani y Swindale 1984).
 *
 * Y no es un solo sitio ni un solo equipo:
 *
 * - En el altiplano etíope el camellón sube el rendimiento **si la zona es de
 *   lluvia alta**; en el año de poca lluvia del ensayo no hubo diferencia
 *   significativa contra el laboreo tradicional, «due to limited waterlogging»
 *   (Astatke, Jutzi y Grunder 1988). O sea: la ventaja aparece cuando hay
 *   exceso que drenar. Los propios autores piden investigar todavía cuál es la
 *   pendiente y el largo de surco óptimos, así que la banda publicada es un
 *   dato de un sistema de cultivo y no un umbral de validez general.
 * - Y las obras físicas de conservación sobre vertisoles de Etiopía central
 *   dieron resultados «not very significant» para mucha mano de obra, con la
 *   recomendación de correr el énfasis al manejo agronómico —materia orgánica,
 *   fajas de pasto, cultivo en callejones— antes que a mover tierra
 *   (Escobedo 1988, FAO/PNUD).
 *
 * ## Por qué es un aviso y no un cambio de número
 *
 * Por lo mismo que en Cuenca y en Represa, y además por una razón propia de
 * acá: el piso de drenaje del surco que la app aplica es el del estándar
 * —0,2 %, «not less than 0.2 percent», NRCS 330, en `lib/keylineGeometria.ts`—
 * y ese piso vale para cualquier suelo de infiltración lenta. Reemplazarlo por
 * la banda de Patancheru sería cambiar un criterio general por el número de un
 * sistema de cultivo de la India semiárida. Lo que el aviso agrega es que para
 * **este** suelo el diseño publicado corre entre dos y cuatro veces más
 * empinado que ese piso, y por qué.
 *
 * Fuentes:
 * - Swindale, L.D. (1988). «Developing, testing and transferring improved
 *   Vertisol technology: the Indian experience», en Jutzi, Haque, McIntire y
 *   Stares (eds.), *Management of Vertisols in sub-Saharan Africa*, ILCA,
 *   Addis Abeba. Texto completo: https://www.fao.org/4/x5493e/x5493e03.htm
 * - Astatke, A., Jutzi, S.C. y Grunder, M. (1988). «Effects of surface
 *   drainage on soil erosion and wheat growth on a gently sloping Vertisol at
 *   Debre Zeit, Ethiopia», mismo volumen. Resumen:
 *   https://www.fao.org/4/x5493e/x5493e0s.htm
 * - Escobedo, J. (1988). «Soil conservation works on Vertisols of central
 *   Ethiopia», mismo volumen. Resumen:
 *   https://www.fao.org/4/x5493e/x5493e0t.htm
 * - WRB 2022 §3.2.12, para las grietas. Pathak et al. 2013 y Garg et al. 2021
 *   para el escurrimiento medido; de esos dos se leyó el resumen.
 */

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Un número escrito como se lee en el panel: con coma decimal. */
const coma = (n: number | string) => String(n).replace('.', ',');

/** Pendiente del surco del camellón del ICRISAT, en %. Es un dato publicado. */
export const BBF_SURCO_MIN_PCT = 0.4;
export const BBF_SURCO_MAX_PCT = 0.8;

/**
 * Infiltración medida en el vertisol del ICRISAT, en mm/h: el suelo recién
 * agrietado y el suelo sellado después de 144 h (Virmani y Swindale 1984). El
 * factor entre los dos es 360, y cualquier Ksat único describe uno solo.
 */
export const INFIL_AGRIETADO_MM_H = 76;
export const INFIL_SELLADO_MM_H = 0.21;

/** Para que el techo de la banda llegue a 0,8 %, por la mitad de la pendiente. */
const PENDIENTE_PARA_BANDA_PCT = r1(BBF_SURCO_MAX_PCT / DERIVA_MAX_FRACCION_PENDIENTE);

const BANDA_PUBLICADA =
  `El diseño publicado para este suelo no es una zanja a nivel: es un camellón `
  + `ancho con el surco a pendiente, entre ${coma(BBF_SURCO_MIN_PCT)} y `
  + `${coma(BBF_SURCO_MAX_PCT)} %, que termina en desagües de parcela y cauces `
  + 'empastados. El surco está ahí para sacar el exceso y evitar el '
  + 'encharcamiento, y el lomo del camellón es el que conserva humedad. En el '
  + 'altiplano etíope el mismo camellón sólo rindió más donde la lluvia era '
  + 'alta: en el año seco del ensayo no hubo diferencia, justamente porque no '
  + 'hubo exceso que drenar.';

/**
 * El tiempo de vaciado de la zanja, puesto entre los dos valores medidos.
 *
 * Vale compararlo así porque en `swales.ts` el vaciado sale de la integral
 * cerrada `t = (1/K)·[2d − (b/z)·ln(1 + z·d/b)]`, donde el Ksat es el único
 * factor fuera del corchete: para una misma sección, `t` es inversamente
 * proporcional a `K`. Así que los dos extremos se calculan sin volver a tocar
 * la geometría, con el Ksat del perfil tal como lo declara el panel de suelo.
 */
function vaciadoEntreLosDos(ksat_mm_h: number | null | undefined): string {
  const base =
    'El tiempo de vaciado de la zanja sale de un solo Ksat y este suelo tiene '
    + `dos: medido en el mismo vertisol, ${INFIL_AGRIETADO_MM_H} mm/h en la `
    + `primera media hora contra ${coma(INFIL_SELLADO_MM_H)} mm/h después de `
    + '144 horas, un factor 360 entre el suelo agrietado y el sellado.';
  if (!(typeof ksat_mm_h === 'number' && Number.isFinite(ksat_mm_h) && ksat_mm_h > 0)) {
    return base + ' Cargá el suelo y el panel puede poner el vaciado entre los dos extremos.';
  }
  const rapido = INFIL_AGRIETADO_MM_H / ksat_mm_h;
  const lento  = ksat_mm_h / INFIL_SELLADO_MM_H;
  const partes: string[] = [];
  if (rapido >= 1.5) partes.push(`unas ${coma(r1(rapido))} veces más rápido con el suelo recién agrietado`);
  if (lento  >= 1.5) partes.push(`unas ${coma(r1(lento))} veces más lento con el perfil húmedo y las grietas cerradas`);
  if (partes.length === 0) return base;
  return base
    + ` El perfil de acá declara ${coma(r1(ksat_mm_h))} mm/h, así que la misma `
    + `zanja se vaciaría ${partes.join(' y ')}. El número que muestra el panel `
    + 'no es ninguno de los dos.';
}

export interface EntradaSwalesSalud {
  /** El diagnóstico de suelo expansivo del punto (A4), si se pudo reconocer. */
  expansivo?: SueloExpansivo | null;
  /** Ksat del perfil (mm/h): el mismo con el que `swales.ts` calcula el vaciado. */
  ksat_mm_h?: number | null;
}

/**
 * El aviso de suelo expansivo para una zanja de infiltración a nivel.
 *
 * Devuelve `null` cuando no hay diagnóstico, que es la mayoría de los casos:
 * este aviso tiene que aparecer donde corresponde o no sirve de nada. Lo que
 * hace es tres cosas y en este orden: decir que el tiempo de vaciado que el
 * panel muestra no describe a este suelo, decir qué obra publica la
 * bibliografía para él, y decir qué dato lo decide.
 */
export function avisoSwalesExpansivo(e: EntradaSwalesSalud): AvisoCalculo | null {
  const x = e.expansivo;
  if (!x) return null;
  const medido = x.nivel === 'medido';
  return {
    id: 'suelo_expansivo',
    nivel: medido ? 'alerta' : 'aviso',
    titulo: medido
      ? 'Suelo expansivo: la zanja a nivel no es la obra que se publica para este suelo'
      : 'Puede ser suelo expansivo, y entonces la zanja a nivel no es la obra',
    detalle:
      vaciadoEntreLosDos(e.ksat_mm_h) + ' ' + BANDA_PUBLICADA
      + ' Lo que corresponde no es borrar la zanja sino decidirla por el clima '
      + 'y por el destino del agua. Si el limitante es la seca hay poco que '
      + 'juntar: en los años de menos de 500 mm el escurrimiento medido no '
      + 'llegó al 2 %. Si la lluvia se concentra, el riesgo es el contrario '
      + '—agua parada sobre un perfil que ya está lleno—, y ahí el surco va '
      + 'con pendiente y termina en un cauce empastado, no cerrado a nivel. El '
      + 'dato que decide no es un ensayo de infiltración puntual, que daría '
      + 'cualquiera de los dos valores según el día, sino el escurrimiento '
      + 'medido de una temporada en el mismo predio. ' + x.cautela,
  };
}

export interface EntradaKeylineSalud {
  /** El diagnóstico de suelo expansivo del punto (A4), si se pudo reconocer. */
  expansivo?: SueloExpansivo | null;
  /**
   * La banda de deriva admisible que calculó `keylineGeometria.bandaDeriva`.
   * Si todavía no se generó un patrón no hay banda, y el aviso sale igual: el
   * suelo no depende de que el usuario haya dibujado algo.
   */
  banda?: { min_pct: number; max_pct: number } | null;
}

/**
 * El aviso de suelo expansivo para el patrón de líneas clave.
 *
 * Es distinto del de los swales y la diferencia importa: el patrón de líneas
 * clave **mueve** el agua con una deriva, así que su geometría no es el
 * problema acá —es, de hecho, la misma idea que el surco del camellón—. El
 * problema es leerlo como obra de retención y apoyarlo en el piso del estándar.
 * Por eso el aviso compara el techo de la banda contra la pendiente publicada,
 * que es una cuenta que puede salir de las tres maneras.
 */
export function avisoKeylineExpansivo(e: EntradaKeylineSalud): AvisoCalculo | null {
  const x = e.expansivo;
  if (!x) return null;
  const medido = x.nivel === 'medido';

  const max = e.banda && Number.isFinite(e.banda.max_pct) ? e.banda.max_pct : null;
  let cuenta: string;
  if (max === null) {
    cuenta =
      'El techo de la deriva es la mitad de la pendiente del terreno, así que '
      + `para que la banda llegue al ${coma(BBF_SURCO_MAX_PCT)} % del diseño `
      + `publicado hace falta un ${coma(PENDIENTE_PARA_BANDA_PCT)} % de `
      + 'pendiente. Generá el patrón y el panel compara la banda de acá contra esa.';
  } else if (max < BBF_SURCO_MIN_PCT) {
    cuenta =
      `Acá el techo de la banda es ${coma(max.toFixed(2))} % y no llega ni al piso de `
      + `${coma(BBF_SURCO_MIN_PCT)} % de ese diseño: con esta pendiente de `
      + 'terreno el surco no puede drenar como el diseño pide, porque el techo '
      + `es la mitad de la pendiente y harían falta ${coma(PENDIENTE_PARA_BANDA_PCT)} % `
      + 'para llegar al extremo superior. En un terreno así de plano la '
      + 'herramienta no es el patrón de cultivo sino el desagüe de parcela.';
  } else if (max < BBF_SURCO_MAX_PCT) {
    cuenta =
      `Acá el techo de la banda es ${coma(max.toFixed(2))} %, así que entra en la mitad `
      + 'baja de la banda publicada: el surco puede drenar, pero sin margen. '
      + 'Llevalo al techo y no al piso.';
  } else {
    cuenta =
      `Acá el techo de la banda es ${coma(max.toFixed(2))} %, así que la banda publicada `
      + `entra entera: apuntá al ${coma(BBF_SURCO_MIN_PCT)} a `
      + `${coma(BBF_SURCO_MAX_PCT)} % y no al piso de `
      + `${coma(DERIVA_MIN_DRENAJE_PCT)} % del estándar.`;
  }

  return {
    id: 'suelo_expansivo',
    nivel: medido ? 'alerta' : 'aviso',
    titulo: medido
      ? 'Suelo expansivo: el surco necesita más pendiente que el piso del estándar'
      : 'Puede ser suelo expansivo, y entonces el surco necesita más pendiente',
    detalle:
      'El patrón de líneas clave mueve el agua con una deriva, así que la '
      + 'geometría no es el problema acá: es la misma idea que el surco del '
      + 'camellón. El problema sería leerlo como obra de retención. '
      + BANDA_PUBLICADA
      + ` Esa banda de ${coma(BBF_SURCO_MIN_PCT)} a ${coma(BBF_SURCO_MAX_PCT)} % `
      + `es de dos a cuatro veces el piso de ${coma(DERIVA_MIN_DRENAJE_PCT)} % `
      + 'que la app ya le aplica a cualquier suelo de infiltración lenta. '
      + cuenta
      + ' Y lo que el arado de cincel busca —abrir el perfil en profundidad— '
      + 'acá lo hace la contracción sola en cada estación seca: son grietas de '
      + '0,5 cm o más que abren y cierran con el agua y que, dice WRB, '
      + 'controlan la infiltración y la percolación incluso rellenas de '
      + 'material de la superficie. Eso es una consecuencia de la definición y '
      + 'no una medición: ensayos de arado Yeomans sobre vertisol no se '
      + 'encontraron publicados, así que el beneficio de pasarlo no se puede '
      + 'dar por hecho ni descartar. ' + x.cautela,
  };
}
