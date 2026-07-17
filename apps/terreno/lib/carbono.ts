/**
 * Estimador orientativo de carbono: stock actual en el suelo + potencial de
 * captura (secuestro) según prácticas regenerativas. Pensado como gancho de MRV,
 * no como inventario certificable. Los coeficientes son valores medios de
 * literatura y deben validarse con muestreo para cualquier uso formal.
 */

/** t C → t CO₂ equivalente (relación de masas 44/12). */
export const C_A_CO2 = 44 / 12;

export interface PracticaCarbono {
  id:              string;
  nombre:          string;
  tasa_tC_ha_anio: number;  // secuestro adicional de carbono, orientativo
}

/** Tasas medias de secuestro (t C/ha/año). Conservadoras y editables conceptualmente. */
export const PRACTICAS: PracticaCarbono[] = [
  { id: 'pastoreo',    nombre: 'Pastoreo regenerativo (AMP)',      tasa_tC_ha_anio: 0.5 },
  { id: 'cobertura',   nombre: 'Cobertura permanente del suelo',   tasa_tC_ha_anio: 0.3 },
  { id: 'agroforesteria', nombre: 'Agroforestería / silvopastoril', tasa_tC_ha_anio: 1.5 },
  { id: 'compost',     nombre: 'Compost / enmiendas orgánicas',    tasa_tC_ha_anio: 0.4 },
  { id: 'no_laboreo',  nombre: 'Siembra directa / sin laboreo',    tasa_tC_ha_anio: 0.2 },
];

export interface CarbonoResumen {
  area_ha:               number;
  stock_suelo_tCO2e:     number | null;  // stock actual 0–30 cm en todo el predio
  stock_suelo_tCO2e_ha:  number | null;
  captura_anual_tCO2e:   number;
  captura_10anios_tCO2e: number;
  practicas:             string[];
  autos_equiv_anio:      number;  // equivalencia orientativa
}

/**
 * Stock de carbono orgánico del suelo (t C/ha) a una profundidad dada.
 * SOC(t/ha) = SOC(g/kg) · densidad(g/cm³) · profundidad(cm) / 10.
 */
export function stockSueloTha(soc_gkg: number, bd_g_cm3: number, prof_cm = 30): number {
  return (soc_gkg * bd_g_cm3 * prof_cm) / 10;
}

export function calcularCarbono(
  area_ha: number,
  soc_gkg: number | null,
  bd_g_cm3: number | null,
  practicasActivas: string[],
): CarbonoResumen {
  const stock_ha = soc_gkg && bd_g_cm3 ? stockSueloTha(soc_gkg, bd_g_cm3) * C_A_CO2 : null;
  const stock_total = stock_ha != null ? stock_ha * area_ha : null;

  const tasaC = PRACTICAS
    .filter(p => practicasActivas.includes(p.id))
    .reduce((a, p) => a + p.tasa_tC_ha_anio, 0);
  const captura_anual = area_ha * tasaC * C_A_CO2;

  return {
    area_ha,
    stock_suelo_tCO2e: stock_total,
    stock_suelo_tCO2e_ha: stock_ha,
    captura_anual_tCO2e: captura_anual,
    captura_10anios_tCO2e: captura_anual * 10,
    practicas: PRACTICAS.filter(p => practicasActivas.includes(p.id)).map(p => p.nombre),
    autos_equiv_anio: captura_anual / 4.6,  // ~4,6 tCO₂e/año por auto (EPA)
  };
}
