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
 */

export interface MesRepresa {
  mes:          number;   // 0=Ene … 11=Dic
  volumen_m3:   number;   // volumen al fin del mes
  llenado_pct:  number;   // % de la capacidad
  aporte_m3:    number;   // escorrentía entrante
  evap_m3:      number;
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
export interface RepresaResumen {
  capacidad_m3:      number;
  cuenca_ha:         number;
  demanda_m3_mes:    number;
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
}

export interface ParamsRepresa {
  capacidad_m3:      number;
  area_espejo_m2:    number;
  cuencaArea_m2:     number;
  coefEscorrentia:   number;   // fracción de la lluvia que escurre (0–1)
  meses:             Array<{ precip_mm: number; etp_mm: number }>;  // 12
  demanda_m3_mes:    number;   // demanda mensual constante
  infiltracion_mm_dia: number;
  factorEvap?:       number;   // espejo de agua vs ETP de referencia (~1.05)
}

const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function simularRepresaAnual(p: ParamsRepresa): ResultadoRepresa | null {
  if (p.capacidad_m3 <= 0 || p.meses.length !== 12) return null;

  const fEvap = p.factorEvap ?? 1.05;
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
      const evap    = areaEf * (md.etp_mm / 1000) * fEvap;
      const infiltr = areaEf * (p.infiltracion_mm_dia * dias / 1000);
      const demanda = p.demanda_m3_mes;

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
