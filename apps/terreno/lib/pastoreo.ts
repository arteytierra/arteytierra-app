/**
 * Pastoreo rotativo (C1) — diseño tipo PRV / Voisin.
 *
 * A partir del área, el rodeo y la producción de forraje calcula: balance
 * oferta/demanda, número de potreros (parcelas) según el período de descanso
 * estacional, tiempo de ocupación por estación, calendario de rotación, metros
 * de alambrado + postes y cobertura de bebederos. Valores orientativos de
 * planificación — ajustar a campo con el crecimiento real de la pastura.
 */

export interface DescansoEstacional {
  primavera: number;   // días de reposo para rebrote
  verano:    number;
  otono:     number;
  invierno:  number;
}

export const DESCANSO_DEFAULT: DescansoEstacional = {
  primavera: 30, verano: 35, otono: 45, invierno: 80,
};

export interface ParamsPastoreo {
  area_ha:            number;
  n_animales:         number;
  peso_prom_kg:       number;
  consumo_pct_peso:   number;   // % del peso vivo en materia seca/día (típico 2.5–3)
  prod_forraje_kg_ha: number;   // producción anual (kg MS/ha/año)
  eficiencia:         number;   // utilización del forraje (0–1)
  dias_ocupacion:     number;   // ocupación objetivo por potrero (Voisin ≤ 3)
  descanso:           DescansoEstacional;
}

export interface EstacionRotacion {
  nombre:    string;
  descanso:  number;   // días de reposo
  ocupacion: number;   // días de ocupación por potrero
  ciclo:     number;   // vuelta completa (días)
}

export interface ResultadoPastoreo {
  demanda_diaria_kg:  number;
  demanda_anual_kg:   number;
  oferta_anual_kg:    number;
  balance_pct:        number;   // oferta / demanda
  carga_ins_ev_ha:    number;   // carga instantánea en el potrero ocupado (EV/ha)
  n_potreros:         number;
  area_potrero_ha:    number;
  estaciones:         EstacionRotacion[];
  alambrado_m:        number;   // alambrado interno de subdivisión
  postes:             number;
  bebederos:          number;   // para cubrir con radio 300 m
  agua_l_dia:         number;
  advertencias:       string[];
}

// Producción forrajera natural estimada por precipitación (kg MS/ha/año).
export function forrajePorLluvia(precip_mm: number): number {
  if (precip_mm < 300) return 700;
  if (precip_mm < 500) return 1500;
  if (precip_mm < 700) return 3000;
  if (precip_mm < 900) return 5000;
  return 7000;
}

export function calcularPastoreo(p: ParamsPastoreo): ResultadoPastoreo | null {
  if (p.area_ha <= 0 || p.n_animales <= 0) return null;

  const demanda_diaria = p.n_animales * p.peso_prom_kg * (p.consumo_pct_peso / 100);
  const demanda_anual  = demanda_diaria * 365;
  const oferta_anual   = p.prod_forraje_kg_ha * p.area_ha * p.eficiencia;
  const balance_pct    = demanda_anual > 0 ? Math.round((oferta_anual / demanda_anual) * 100) : 0;

  // Número de potreros: dimensionado por el descanso más largo (invierno).
  const O = Math.max(0.5, p.dias_ocupacion);
  const descMax = Math.max(p.descanso.primavera, p.descanso.verano, p.descanso.otono, p.descanso.invierno);
  const n_potreros = Math.max(2, Math.round(descMax / O) + 1);
  const area_potrero = p.area_ha / n_potreros;

  // Por estación, con n potreros fijos: ocupación = descanso / (n − 1).
  const estacion = (nombre: string, descanso: number): EstacionRotacion => {
    const ocupacion = Math.max(0.5, Math.round((descanso / (n_potreros - 1)) * 10) / 10);
    return { nombre, descanso, ocupacion, ciclo: Math.round(descanso + ocupacion) };
  };
  const estaciones = [
    estacion('Primavera', p.descanso.primavera),
    estacion('Verano',    p.descanso.verano),
    estacion('Otoño',     p.descanso.otono),
    estacion('Invierno',  p.descanso.invierno),
  ];

  // Carga instantánea: todo el rodeo en un potrero (EV ≈ peso/400).
  const ev_total = p.n_animales * (p.peso_prom_kg / 400);
  const carga_ins = area_potrero > 0 ? Math.round((ev_total / area_potrero) * 10) / 10 : 0;

  // Alambrado interno: subdivisión en una grilla ~cuadrada de n potreros.
  const A_m2 = p.area_ha * 10000;
  const lado = Math.sqrt(A_m2);
  const alambrado = Math.round(2 * lado * (Math.sqrt(n_potreros) - 1));
  const perimetro = 4 * lado;
  const postes = Math.round((alambrado + perimetro) / 8) + n_potreros * 2; // 1 poste/8 m + esquineros/tranqueras

  // Bebederos: cada uno cubre un radio de 300 m ≈ 28.3 ha.
  const bebederos = Math.max(1, Math.ceil(p.area_ha / (Math.PI * 0.3 * 0.3 * 100)));
  const agua_l_dia = Math.round(p.n_animales * p.peso_prom_kg * 0.1); // ~10 % del peso vivo (clima cálido)

  const advertencias: string[] = [];
  if (balance_pct < 100) advertencias.push(`Sobrepastoreo: la demanda supera la oferta (${balance_pct} %). Bajá la carga, suplementá o sumá superficie.`);
  else if (balance_pct < 130) advertencias.push(`Carga ajustada (${balance_pct} %): poco margen para años secos. Dejá un potrero de reserva.`);
  if (area_potrero < 0.1) advertencias.push('Potreros muy chicos (<0.1 ha): considerá menos parcelas con más días de ocupación.');
  if (estaciones[3]!.ocupacion > O * 3) advertencias.push('En invierno la ocupación se alarga mucho: sumá potreros o reservá un diferido invernal.');
  if (advertencias.length === 0) advertencias.push('Carga sostenible con la oferta forrajera estimada. Ajustá el descanso al rebrote real.');

  return {
    demanda_diaria_kg: Math.round(demanda_diaria),
    demanda_anual_kg:  Math.round(demanda_anual),
    oferta_anual_kg:   Math.round(oferta_anual),
    balance_pct,
    carga_ins_ev_ha:   carga_ins,
    n_potreros,
    area_potrero_ha:   Math.round(area_potrero * 100) / 100,
    estaciones,
    alambrado_m:       alambrado,
    postes,
    bebederos,
    agua_l_dia,
    advertencias,
  };
}
