/**
 * Hidráulica de redes de agua por tubería.
 *
 * Núcleo de cálculo puro (sin React) para la herramienta "Red de agua":
 * pérdida de carga por fricción (Hazen-Williams), presión estática y dinámica
 * en metros de columna de agua (m.c.a.), línea piezométrica sobre el perfil del
 * terreno, velocidad, clase de caño (PN) y dimensionado inverso ("¿qué diámetro
 * compro?").
 *
 * Convención de unidades internas: caudal Q en m³/s, diámetro D en m, longitud
 * en m, presiones/cargas en m.c.a. (1 bar ≈ 10.197 m.c.a.).
 * Valores orientativos de diseño preliminar — no reemplazan cálculo de ingeniería.
 */

// ─── Resumen para el informe / snapshot ──────────────────────────────────────

export interface RedAguaResumen {
  camino:            string;
  material:          string;
  diametro:          string;   // etiqueta DN
  caudal:            string;   // p.ej. "10 L/min"
  longitud_m:        number;
  presion_final_mca: number;
  presion_min_mca:   number;
  velocidad_ms:      number;
  pn_recomendado:    number;
  bomba_kw:          number | null;   // potencia eléctrica si se necesita bombeo
}

/** Campos editables del panel Red de agua, para persistir con el proyecto. */
export interface RedAguaInputs {
  caminoId:      string;
  invertir:      boolean;
  caudal:        string;
  unidad:        string;
  materialId:    string;
  dn:            number;
  cargaOrigen:   string;
  perdidasLocal: string;
  presionMin:    string;
}

// ─── Materiales (coeficiente C de Hazen-Williams) ─────────────────────────────

export interface MaterialTuberia { id: string; nombre: string; C: number; }

export const MATERIALES: MaterialTuberia[] = [
  { id: 'pvc',         nombre: 'PVC',                     C: 150 },
  { id: 'pead',        nombre: 'PEAD / polietileno',      C: 150 },
  { id: 'prfv',        nombre: 'PRFV (fibra de vidrio)',  C: 150 },
  { id: 'cemento',     nombre: 'Asbesto-cemento',         C: 140 },
  { id: 'acero',       nombre: 'Acero nuevo',             C: 130 },
  { id: 'higal',       nombre: 'Hierro galvanizado',      C: 120 },
  { id: 'higal_usado', nombre: 'Hierro galv. usado',      C: 100 },
];

// ─── Diámetros comerciales (nominal → interior aprox., clase ~PN10) ────────────

export interface Diametro { dn: number; interior_mm: number; etiqueta: string; }

export const DIAMETROS: Diametro[] = [
  { dn: 20,  interior_mm: 17.4,  etiqueta: '20 (½")'  },
  { dn: 25,  interior_mm: 21.2,  etiqueta: '25 (¾")'  },
  { dn: 32,  interior_mm: 28.0,  etiqueta: '32 (1")'  },
  { dn: 40,  interior_mm: 35.2,  etiqueta: '40 (1¼")' },
  { dn: 50,  interior_mm: 44.0,  etiqueta: '50 (1½")' },
  { dn: 63,  interior_mm: 55.4,  etiqueta: '63 (2")'  },
  { dn: 75,  interior_mm: 66.0,  etiqueta: '75 (2½")' },
  { dn: 90,  interior_mm: 79.2,  etiqueta: '90 (3")'  },
  { dn: 110, interior_mm: 96.8,  etiqueta: '110 (4")' },
  { dn: 160, interior_mm: 141.0, etiqueta: '160 (6")' },
];

// Clases de presión nominal (PN) → carga admisible en m.c.a. (PNbar × 10.197).
export const CLASES_PN = [
  { pn: 4,  mca: 40.8 },
  { pn: 6,  mca: 61.2 },
  { pn: 10, mca: 101.9 },
  { pn: 16, mca: 163.1 },
  { pn: 20, mca: 203.9 },
  { pn: 25, mca: 254.9 },
];

// ─── Fórmulas base ─────────────────────────────────────────────────────────────

/** Pérdida de carga por fricción (m), Hazen-Williams SI. Q [m³/s], D [m], L [m]. */
export function perdidaHazenWilliams(Q: number, C: number, D: number, L: number): number {
  if (Q <= 0 || D <= 0 || C <= 0 || L <= 0) return 0;
  return (10.67 * L * Math.pow(Q, 1.852)) / (Math.pow(C, 1.852) * Math.pow(D, 4.8704));
}

/** Velocidad media del flujo (m/s). Q [m³/s], D [m]. */
export function velocidad(Q: number, D: number): number {
  if (D <= 0) return 0;
  return Q / (Math.PI * D * D / 4);
}

/** Clase PN mínima que soporta una presión estática dada (m.c.a.), con margen. */
export function claseNecesaria(presionMax_mca: number, margen = 1.1): number {
  const objetivo = presionMax_mca * margen;
  const c = CLASES_PN.find(x => x.mca >= objetivo);
  return c ? c.pn : CLASES_PN[CLASES_PN.length - 1]!.pn;
}

// ─── Análisis de una línea (rama simple) ──────────────────────────────────────

export interface EstacionHidraulica {
  distancia_m:          number;
  elevacion_m:          number;
  piezo_m:              number;   // cota de la línea piezométrica (energía)
  presion_mca:          number;   // presión dinámica residual = piezo − terreno
  presion_estatica_mca: number;   // presión sin flujo (para clase de caño)
}

export interface ResultadoLinea {
  estaciones:            EstacionHidraulica[];
  velocidad_ms:          number;
  perdida_total_m:       number;
  presion_origen_mca:    number;
  presion_final_mca:     number;   // residual en el extremo
  presion_min_mca:       number;
  estacion_min:          number;   // distancia donde ocurre la mínima
  presion_estatica_max:  number;
  desnivel_m:            number;   // elev origen − elev final (positivo = a favor)
  pn_recomendado:        number;
  advertencias:          string[];
}

export interface ParamsLinea {
  perfil:            Array<{ distancia_m: number; elevation: number }>;
  cargaOrigen_m:     number;   // altura de agua sobre el terreno en el origen (tanque/bomba)
  Q_m3s:             number;
  C:                 number;
  D_interior_m:      number;
  perdidasLocal_pct: number;   // pérdidas localizadas (accesorios) como % de la fricción
  presionMin_mca?:   number;   // presión residual requerida en el extremo (para advertencias)
  velMax_ms?:        number;
}

/**
 * Calcula la línea piezométrica y las presiones a lo largo del perfil.
 * El origen (fuente) es la primera estación del perfil. El agua pierde energía
 * por fricción; la presión en cada punto es la piezométrica menos la cota.
 */
export function analizarLinea(p: ParamsLinea): ResultadoLinea | null {
  const pts = p.perfil.filter(x => Number.isFinite(x.elevation) && x.elevation > -500);
  if (pts.length < 2) return null;

  const factorLocal = 1 + Math.max(0, p.perdidasLocal_pct) / 100;
  const vel = velocidad(p.Q_m3s, p.D_interior_m);
  const elev0 = pts[0]!.elevation;
  const piezo0 = elev0 + p.cargaOrigen_m;

  const estaciones: EstacionHidraulica[] = [];
  let hfAcum = 0;

  for (let i = 0; i < pts.length; i++) {
    if (i > 0) {
      const L = pts[i]!.distancia_m - pts[i - 1]!.distancia_m;
      hfAcum += perdidaHazenWilliams(p.Q_m3s, p.C, p.D_interior_m, L) * factorLocal;
    }
    const elev = pts[i]!.elevation;
    const piezo = piezo0 - hfAcum;
    estaciones.push({
      distancia_m:          pts[i]!.distancia_m,
      elevacion_m:          elev,
      piezo_m:              piezo,
      presion_mca:          piezo - elev,
      presion_estatica_mca: piezo0 - elev,
    });
  }

  const ult = estaciones[estaciones.length - 1]!;
  let min = estaciones[0]!;
  for (const e of estaciones) if (e.presion_mca < min.presion_mca) min = e;
  const estaticaMax = estaciones.reduce((m, e) => Math.max(m, e.presion_estatica_mca), 0);

  const velMax = p.velMax_ms ?? 2.0;
  const presionMin = p.presionMin_mca ?? 0;
  const advertencias: string[] = [];
  if (vel > velMax)   advertencias.push(`Velocidad alta (${vel.toFixed(2)} m/s > ${velMax} m/s): riesgo de golpe de ariete y erosión. Subí el diámetro.`);
  if (vel > 0 && vel < 0.5) advertencias.push(`Velocidad baja (${vel.toFixed(2)} m/s < 0.5 m/s): riesgo de sedimentación. Podés bajar el diámetro.`);
  if (min.presion_mca < presionMin) advertencias.push(`Presión insuficiente: ${min.presion_mca.toFixed(1)} m.c.a. en la progresiva ${Math.round(min.distancia_m)} m (requerido ${presionMin} m.c.a.). Falta carga o sobra pérdida.`);
  if (min.presion_mca < 0) advertencias.push('Presión negativa: por gravedad no llega el agua. Necesitás bombeo o mayor diámetro.');
  if (estaticaMax > 163.1) advertencias.push(`Presión estática ${estaticaMax.toFixed(0)} m.c.a.: supera PN16. Considerá rompecarga o caño de mayor clase.`);

  return {
    estaciones,
    velocidad_ms:         Math.round(vel * 1000) / 1000,
    perdida_total_m:      Math.round(hfAcum * 100) / 100,
    presion_origen_mca:   Math.round((estaciones[0]!.presion_mca) * 10) / 10,
    presion_final_mca:    Math.round(ult.presion_mca * 10) / 10,
    presion_min_mca:      Math.round(min.presion_mca * 10) / 10,
    estacion_min:         min.distancia_m,
    presion_estatica_max: Math.round(estaticaMax * 10) / 10,
    desnivel_m:           Math.round((elev0 - ult.elevacion_m) * 10) / 10,
    pn_recomendado:       claseNecesaria(estaticaMax),
    advertencias,
  };
}

// ─── Dimensionado inverso ─────────────────────────────────────────────────────

export interface SugerenciaDiametro {
  diametro:      Diametro;
  resultado:     ResultadoLinea;
}

/**
 * Devuelve el menor diámetro comercial que entrega la presión residual mínima
 * requerida sin superar la velocidad máxima. Null si ninguno alcanza.
 */
export function diametroMinimo(
  base: Omit<ParamsLinea, 'D_interior_m'>,
  presionRequerida_mca: number,
  velMax_ms = 2.0,
): SugerenciaDiametro | null {
  for (const d of DIAMETROS) {
    const r = analizarLinea({ ...base, D_interior_m: d.interior_mm / 1000, presionMin_mca: presionRequerida_mca, velMax_ms });
    if (!r) continue;
    if (r.presion_min_mca >= presionRequerida_mca && r.velocidad_ms <= velMax_ms) {
      return { diametro: d, resultado: r };
    }
  }
  return null;
}

// ─── Bombeo ────────────────────────────────────────────────────────────────────

export interface ResultadoBomba {
  altura_dinamica_m:  number;   // TDH = desnivel + fricción + presión requerida
  potencia_hidr_w:    number;   // potencia hidráulica útil
  potencia_eje_w:     number;   // en el eje de la bomba (η bomba)
  potencia_elec_w:    number;   // eléctrica (η bomba × η motor)
  potencia_hp:        number;   // eléctrica en HP
  energia_dia_wh:     number;   // para el volumen diario a ese caudal
  paneles_wp:         number;   // fotovoltaica estimada (con horas de sol pico)
}

/**
 * Dimensiona una bomba para vencer un desnivel + fricción + presión requerida.
 * desnivel_m: cota destino − cota origen (positivo = hay que subir).
 * horasOperacion: horas/día que trabaja la bomba (para energía y FV).
 */
export function calcularBomba(
  Q_m3s: number,
  desnivel_m: number,
  friccion_m: number,
  presionRequerida_m: number,
  opts?: { etaBomba?: number; etaMotor?: number; horasSol?: number; horasOperacion?: number },
): ResultadoBomba {
  const etaBomba = opts?.etaBomba ?? 0.6;
  const etaMotor = opts?.etaMotor ?? 0.9;
  const horasSol = opts?.horasSol ?? 5;     // horas de sol pico (Argentina central ~5)
  const horasOp  = opts?.horasOperacion ?? 6;

  const tdh = Math.max(0, desnivel_m) + friccion_m + presionRequerida_m;
  const pHidr = 1000 * 9.81 * Q_m3s * tdh;          // W
  const pEje  = etaBomba > 0 ? pHidr / etaBomba : 0;
  const pElec = etaMotor > 0 ? pEje / etaMotor : 0;
  const energiaDia = pElec * horasOp;                // Wh
  const paneles = horasSol > 0 ? energiaDia / (horasSol * 0.75) : 0;  // 0.75 = pérdidas de sistema FV

  return {
    altura_dinamica_m: Math.round(tdh * 10) / 10,
    potencia_hidr_w:   Math.round(pHidr),
    potencia_eje_w:    Math.round(pEje),
    potencia_elec_w:   Math.round(pElec),
    potencia_hp:       Math.round((pElec / 745.7) * 100) / 100,
    energia_dia_wh:    Math.round(energiaDia),
    paneles_wp:        Math.round(paneles),
  };
}

// ─── Conversión de caudal ─────────────────────────────────────────────────────

export const CAUDAL_UNIDADES = [
  { id: 'lmin', label: 'L/min', aM3s: (v: number) => v / 60000 },
  { id: 'ls',   label: 'L/s',   aM3s: (v: number) => v / 1000 },
  { id: 'm3h',  label: 'm³/h',  aM3s: (v: number) => v / 3600 },
  { id: 'm3d',  label: 'm³/día', aM3s: (v: number) => v / 86400 },
] as const;
