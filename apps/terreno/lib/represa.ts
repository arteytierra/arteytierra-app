/**
 * Simulación mensual de represa / embalse (B3).
 *
 * Balance de agua mes a mes: entradas (escorrentía de la cuenca de aporte) menos
 * evaporación del espejo, infiltración por el vaso y demanda (bebida + riego).
 * Devuelve la curva de volumen anual y la confiabilidad (% de meses que cubren
 * la demanda), respondiendo "¿aguanta el invierno seco?".
 *
 * Se itera el ciclo de 12 meses hasta converger (3 años) para eliminar el sesgo
 * de la condición inicial. Valores orientativos de diseño preliminar.
 *
 * La evaporación del espejo no es la ETP de referencia y desde el 03/10/2026
 * tampoco es un factor constante: sale de `factorEvaporacionEspejo`, que lee el
 * cuadro 12 de FAO-56 y distingue el vaso somero del embalse hondo en clima
 * templado. Ver el comentario de `factorEvap_mensual`.
 */
import { KC_ESPEJO_SOMERO } from './represaDiseno';

export interface MesRepresa {
  mes:          number;   // 0=Ene … 11=Dic
  volumen_m3:   number;   // volumen al fin del mes
  llenado_pct:  number;   // % de la capacidad
  aporte_m3:    number;   // escorrentía entrante
  evap_m3:      number;
  /** Factor del espejo sobre la ETP de ese mes. Ver `factorEvap_mensual`. */
  factor_evap:  number;
  infiltr_m3:   number;
  demanda_m3:   number;
  deficit_m3:   number;   // demanda no cubierta
  derrame_m3:   number;   // vertido por exceso
}

export interface ResultadoRepresa {
  meses:            MesRepresa[];
  confiabilidad_pct:number;   // % de meses sin déficit
  meses_deficit:    number;
  volumen_min_m3:   number;
  mes_critico:      number;
  derrame_anual_m3: number;
  aporte_anual_m3:  number;
  demanda_anual_m3: number;
  aguanta:          boolean;  // cubre la demanda todo el año
}

/** Resumen para el informe / snapshot. */
/**
 * La demanda del mes `m`. Un arreglo corto o con huecos cae al primer valor
 * finito que encuentre antes que devolver `NaN`: un `NaN` acá sale como volumen
 * de embalse en el informe y nadie lo ve venir.
 */
export function demandaDelMes(demanda: number | number[], m: number): number {
  if (typeof demanda === 'number') return Number.isFinite(demanda) ? demanda : 0;
  const v = demanda[m];
  if (Number.isFinite(v)) return v as number;
  return demanda.find(x => Number.isFinite(x)) ?? 0;
}

export interface RepresaResumen {
  capacidad_m3:      number;
  /** Promedio de los doce meses. Por doce da la demanda anual exacta. */
  demanda_m3_mes:    number;
  /** La del mes que más pide, y cuál es. Faltan si la demanda es constante. */
  demanda_m3_mes_max?: number;
  mes_demanda_max?:    number;
  cuenca_ha:         number;
  confiabilidad_pct: number;
  aguanta:           boolean;
  volumen_min_m3:    number;
  mes_critico:       number;
  aporte_anual_m3:   number;
}

/**
 * Todo lo que el usuario eligió en la pestaña Represa, para persistirlo con el
 * proyecto y devolvérselo tal cual al volver.
 *
 * Por qué existe: hasta acá los parámetros del muro, el nivel de agua y el
 * polígono elegido vivían en el estado local del panel. Cambiar de pestaña
 * desmonta el panel y se perdía todo el trabajo, sin aviso. Riego y Red de agua
 * ya guardaban sus campos así; Represa era la que faltaba.
 *
 * No se guarda el resultado del cálculo (la grilla de elevación pesa megas): al
 * volver a la pestaña se recalcula solo con estos mismos parámetros.
 */
export interface RepresaInputs {
  /** id del polígono del espejo de agua. */
  poligonoId:   string;
  /** Cota del pelo de agua (m). */
  nivel:        number | null;
  /** Índice del lado del polígono que hace de muro. */
  muroIdx:      number | null;
  tipoMuro:     'aguada' | 'ladera';
  anchoCorona:  number;
  taludInterno: number;
  taludExterno: number;
  revancha:     number;
  /** Largo del coronamiento si se pisó a mano (null = el del lado elegido). */
  longMuro:     number | null;
  /** Cobertura de la cuenca de aporte (id de `COBERTURAS`). */
  cobertura:    string;
  coef:         string;
  ha:           string;
  seep:         string;
  /** Unidad elegida para leer el volumen de agua: 'm3' o 'litros'. */
  unidadVol?:   string;
  /**
   * Carga sobre el vertedero cuando pasa la crecida de diseño (m). Opcional
   * para no invalidar los proyectos guardados antes del 03/10/2026, que no la
   * tenían: al abrirlos el panel la repone en su default y avisa.
   */
  cargaVertedero?: number;
  /** Terraplén compactado en capas con rodillo. Decide el 5 % o el 10 %. */
  compactadoEnCapas?: boolean;
}

export interface ParamsRepresa {
  capacidad_m3:      number;
  area_espejo_m2:    number;
  cuencaArea_m2:     number;
  coefEscorrentia:   number;   // fracción de la lluvia que escurre (0–1)
  meses:             Array<{ precip_mm: number; etp_mm: number }>;  // 12
  /**
   * Demanda mensual. Un número es la misma demanda los doce meses; un arreglo de
   * doce es la demanda mes a mes, que es lo que corresponde desde que el consumo
   * del rodeo sale de la temperatura (ver `demandaMensualPorTemperatura_m3` en
   * `rodeo.ts`). Entre julio y enero hay más de un 50 % de diferencia, y el error
   * caía del lado peligroso: enero es cuando la represa está más baja.
   */
  demanda_m3_mes:    number | number[];
  infiltracion_mm_dia: number;
  /**
   * Factor del espejo de agua sobre la ETP de referencia, **mes a mes** (12
   * valores, enero primero).
   *
   * Por qué es mensual. Hasta el 03/10/2026 esto era un solo número, 1,05, sin
   * fuente ni condición. El 1,05 está bien y sale del cuadro 12 de FAO-56, pero
   * sólo para su primera fila de agua libre: *«Open Water, < 2 m depth or in
   * subhumid climates or tropics»*. Para un embalse de más de 5 m en clima
   * templado la misma fuente da **dos** valores —0,65 mientras el agua se
   * calienta y 1,25 cuando devuelve el calor—, porque una masa de agua honda
   * guarda la radiación de una estación para la otra. Un factor constante borra
   * justo esa diferencia, y el mes que importa es el de la punta seca.
   *
   * Lo calcula `factorEvaporacionEspejo` en `represaDiseno.ts`, que además pide
   * el hemisferio: la mitad que se calienta en Córdoba es la que se enfría en
   * Kansas.
   */
  factorEvap_mensual?: readonly number[];
  /**
   * @deprecated Factor único. Se conserva para no romper llamadas viejas; si
   * viene `factorEvap_mensual` manda ése. Sin ninguno de los dos se usa 1,05,
   * que es la fila somera de FAO-56.
   */
  factorEvap?:       number;
}

const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function simularRepresaAnual(p: ParamsRepresa): ResultadoRepresa | null {
  if (p.capacidad_m3 <= 0 || p.meses.length !== 12) return null;

  const mensual = p.factorEvap_mensual;
  const fEvapMes = (m: number): number => {
    if (mensual && mensual.length === 12) {
      const v = mensual[m];
      if (Number.isFinite(v)) return v as number;
    }
    return p.factorEvap ?? KC_ESPEJO_SOMERO;
  };
  const cap = p.capacidad_m3;

  // Itera 3 ciclos anuales para converger; guarda el último.
  let vol = cap;   // arranca lleno
  let ciclo: MesRepresa[] = [];

  for (let año = 0; año < 3; año++) {
    ciclo = [];
    for (let m = 0; m < 12; m++) {
      const md = p.meses[m]!;
      const dias = DIAS_MES[m]!;

      // Superficie efectiva del espejo, proporcional al llenado (aprox).
      const llenado = cap > 0 ? Math.min(1, vol / cap) : 0;
      const areaEf = p.area_espejo_m2 * llenado;

      const aporte  = p.cuencaArea_m2 * (md.precip_mm / 1000) * p.coefEscorrentia;
      const fEvap   = fEvapMes(m);
      const evap    = areaEf * (md.etp_mm / 1000) * fEvap;
      const infiltr = areaEf * (p.infiltracion_mm_dia * dias / 1000);
      const demanda = demandaDelMes(p.demanda_m3_mes, m);

      let v = vol + aporte - evap - infiltr - demanda;
      let derrame = 0, deficit = 0;
      if (v > cap) { derrame = v - cap; v = cap; }
      if (v < 0)   { deficit = -v; v = 0; }

      vol = v;
      ciclo.push({
        mes: m,
        volumen_m3:  Math.round(v),
        llenado_pct: Math.round((v / cap) * 100),
        aporte_m3:   Math.round(aporte),
        evap_m3:     Math.round(evap),
        factor_evap: fEvap,
        infiltr_m3:  Math.round(infiltr),
        demanda_m3:  Math.round(demanda),
        deficit_m3:  Math.round(deficit),
        derrame_m3:  Math.round(derrame),
      });
    }
  }

  const mesesDeficit = ciclo.filter(m => m.deficit_m3 > 0).length;
  const critico = ciclo.reduce((min, m) => (m.volumen_m3 < min.volumen_m3 ? m : min), ciclo[0]!);

  return {
    meses:            ciclo,
    confiabilidad_pct:Math.round(((12 - mesesDeficit) / 12) * 100),
    meses_deficit:    mesesDeficit,
    volumen_min_m3:   critico.volumen_m3,
    mes_critico:      critico.mes,
    derrame_anual_m3: ciclo.reduce((s, m) => s + m.derrame_m3, 0),
    aporte_anual_m3:  ciclo.reduce((s, m) => s + m.aporte_m3, 0),
    demanda_anual_m3: ciclo.reduce((s, m) => s + m.demanda_m3, 0),
    aguanta:          mesesDeficit === 0,
  };
}

/** Demanda mensual de agua (m³) para hacienda + riego. */
export function demandaMensual(
  cabezas: number,
  litrosCabezaDia: number,
  riego_m3_mes: number,
): number {
  const bebida = cabezas * litrosCabezaDia * 30 / 1000;  // m³/mes
  return Math.round((bebida + riego_m3_mes) * 10) / 10;
}

export const MESES_NOMBRE = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
