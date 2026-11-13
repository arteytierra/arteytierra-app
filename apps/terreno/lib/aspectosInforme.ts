/**
 * Los «aspectos a considerar» del resumen ejecutivo del informe.
 *
 * Es la página 2 del PDF, la que se lee, y lo que sale de acá no es un número:
 * son las frases que recomiendan una obra. Vivían dentro del JSX de
 * `InformeView.tsx`, sin un test que las cubriera, y salieron de ahí el
 * 13/11/2026 por una razón concreta: sobre un suelo expansivo dos de ellas
 * recomendaban lo contrario de lo que publica la bibliografía.
 *
 * ## El caso que las sacó del componente
 *
 * Un vertisol del Decán es semiárido y de grupo hidrológico D. Con esos dos
 * datos, y nada más, el resumen escribía «priorizar captación, almacenamiento
 * y retención de agua (represas, keyline, cobertura)» y, pasando el 8 % de
 * pendiente, «manejar el escurrimiento con trazados a nivel». Las dos empujan
 * a retener a nivel, y el diseño publicado para este suelo hace lo opuesto: el
 * camellón ancho del ICRISAT lleva el surco a pendiente del 0,4 al 0,8 %,
 * enunciado por sus propios autores como «shaping land to promote disposal of
 * excess water» (Swindale 1988, capítulo del volumen de la ILCA *Management of
 * Vertisols in sub-Saharan Africa*, https://www.fao.org/4/x5493e/x5493e03.htm;
 * las dos corroboraciones etíopes del mismo volumen están citadas en
 * `saludCalculo.ts`).
 *
 * Desde el 12/11/2026 los paneles de Swales y de líneas clave lo avisan en
 * pantalla. Pero quien lee el PDF no abre la app, y el informe tenía el
 * diagnóstico de suelo en la sección 5 y la recomendación equivocada en la
 * página 2: el orden de lectura es justamente el inverso.
 *
 * ## Límite declarado: los umbrales de las otras frases son editoriales
 *
 * Hay que decirlo, porque mudar código a `lib/` lo hace parecer un motor de
 * cálculo. El 8 % y el 15 % de pendiente, los 100 mm de agua útil, los 30 días
 * de racha seca y el 30 % de suelo descubierto **no tienen fuente publicada**:
 * son cortes editoriales heredados del componente, elegidos para decidir si
 * una frase aparece, no para calcular una magnitud. Quedan tal como estaban,
 * con el texto palabra por palabra, y hay un test que lo fija. Lo único con
 * fuente acá es la rama de suelo expansivo.
 *
 * Qué se rompe si cambia: el resumen ejecutivo del informe, en pantalla y en
 * PDF. No alimenta ningún cálculo.
 */
import type { DatosClima }       from './clima';
import type { DatosTopografia }  from './topografia';
import type { DatosSuelo }       from './suelos';
import type { Extremos }         from './climaExtremos';
import type { CoberturaResumen } from './cobertura';
import { BBF_SURCO_MIN_PCT, BBF_SURCO_MAX_PCT } from './saludCalculo';

/**
 * Los campos del informe que estas frases leen, y ninguno más. Son `Pick` de
 * los tipos reales para que `InformeData` entre sin adaptador y para que un
 * test no tenga que fabricar un `DatosClima` entero.
 */
export interface EntradaAspectos {
  clima?:     Pick<DatosClima, 'aridez' | 'heladas'>;
  topo?:      Pick<DatosTopografia, 'pendiente_pct'>;
  suelo?:     Pick<DatosSuelo, 'agua_util' | 'grupo_hidro' | 'expansivo'>;
  extremos?:  Pick<Extremos, 'sequia'>;
  cobertura?: Pick<CoberturaResumen, 'suelo_pct'>;
}

/** Umbrales editoriales, no publicados. Ver el límite declarado arriba. */
export const PENDIENTE_PRONUNCIADA_PCT = 15;
export const PENDIENTE_MODERADA_PCT    = 8;
export const AGUA_UTIL_BAJA_MM         = 100;
export const RACHA_SECA_LARGA_DIAS     = 30;
export const SUELO_DESCUBIERTO_PCT     = 30;

/** Un número escrito como se lee en el informe: con coma decimal. */
const coma = (n: number) => String(n).replace('.', ',');

/** La pendiente del surco publicada, en las dos formas en que se imprime. */
const BANDA = `${coma(BBF_SURCO_MIN_PCT)} a ${coma(BBF_SURCO_MAX_PCT)} %`;
const BANDA_ENTRE = `entre ${coma(BBF_SURCO_MIN_PCT)} y ${coma(BBF_SURCO_MAX_PCT)} %`;

/**
 * Las frases del resumen ejecutivo, en el orden en que se imprimen.
 *
 * El suelo expansivo va primero y cambia tres de las otras: la del clima seco,
 * la de la pendiente y la del grupo hidrológico. No repite acá el `cautela` ni
 * el `efecto_hidrologico` del diagnóstico, que el informe imprime completos en
 * «Análisis de suelo»: en esta página la frase decide una obra, no explica un
 * suelo.
 */
export function aspectosAConsiderar(d: EntradaAspectos): string[] {
  const notas: string[] = [];
  const exp = d.suelo?.expansivo ?? null;
  // «Puede ser» cuando el dato es inferido, el mismo criterio que el panel de
  // suelo y los dos avisos de obra.
  const medido = exp?.nivel === 'medido';

  if (exp) {
    notas.push(
      (medido ? 'Suelo expansivo' : 'Puede ser suelo expansivo')
      + ': la obra de agua acá no va a nivel. El diseño publicado para este '
      + `suelo es el camellón ancho con el surco a pendiente, ${BANDA_ENTRE}, `
      + 'que termina en desagües de parcela y cauces empastados; el surco saca el '
      + 'exceso y evita el encharcamiento, y el lomo del camellón es el que '
      + 'conserva humedad. Una zanja a nivel hace lo contrario. El detalle, en '
      + '«Análisis de suelo».',
    );
  }

  const ar = d.clima?.aridez?.clase?.toLowerCase() ?? '';
  if (d.clima?.aridez && (ar.includes('árid') || ar.includes('arid') || ar.includes('semi'))) {
    const clase = d.clima.aridez.clase.toLowerCase();
    notas.push(exp
      ? `Clima ${clase}: la reserva de agua sigue siendo lo primero, pero sobre `
        + 'este suelo se guarda en represa o tanque y no en obras a nivel. El '
        + 'patrón de líneas clave sirve igual, con la deriva en pendiente para '
        + 'mover el agua, no para retenerla.'
      : `Clima ${clase}: priorizar captación, almacenamiento y retención de agua (represas, keyline, cobertura).`);
  }

  const mh = d.clima?.heladas?.meses_riesgo;
  if (mh && mh.length) notas.push(`Riesgo de heladas (${mh.join(', ')}): elegir especies y fechas de siembra acordes.`);

  if (d.topo) {
    const p = d.topo.pendiente_pct;
    if (p > PENDIENTE_PRONUNCIADA_PCT) {
      notas.push(`Pendiente general pronunciada (${p.toFixed(0)} %): riesgo de erosión; `
        + (exp
          ? `el trazado va con pendiente —el surco publicado corre ${BANDA_ENTRE}— y la cobertura permanente es lo que más rinde.`
          : 'considerar terrazas, keyline o cobertura permanente.'));
    } else if (p > PENDIENTE_MODERADA_PCT) {
      notas.push(`Pendiente general moderada (${p.toFixed(0)} %): manejar el escurrimiento `
        + (exp ? `con trazados a pendiente suave, del orden de ${BANDA}, y no a nivel.` : 'con trazados a nivel.'));
    }
  }

  if (d.suelo) {
    if (d.suelo.agua_util.total_mm_100 < AGUA_UTIL_BAJA_MM)
      notas.push(`Baja capacidad de agua útil (${Math.round(d.suelo.agua_util.total_mm_100)} mm): suelos de poca retención; aportar materia orgánica.`);
    const g = d.suelo.grupo_hidro.grupo;
    if (g === 'C' || g === 'D') {
      notas.push(exp
        ? `Grupo hidrológico ${g}: la tabla le pone baja infiltración todo el año, `
          + 'y este suelo infiltra mucho más recién agrietado y mucho menos '
          + 'sellado. El escurrimiento anual que sale de ahí queda del lado '
          + 'optimista; dimensionar el reservorio con ese margen.'
        : `Grupo hidrológico ${g}: baja infiltración y mayor escurrimiento; dimensionar drenajes y reservorios en consecuencia.`);
    }
  }

  if (d.extremos && d.extremos.sequia.racha_max_dias > RACHA_SECA_LARGA_DIAS)
    notas.push(`Racha seca histórica de ${d.extremos.sequia.racha_max_dias} días: prever reserva de agua para el período crítico.`);

  if (d.cobertura && d.cobertura.suelo_pct > SUELO_DESCUBIERTO_PCT)
    notas.push(`Suelo descubierto en ${Math.round(d.cobertura.suelo_pct)} % del predio: oportunidad de aumentar la cobertura vegetal.`);

  return notas;
}
