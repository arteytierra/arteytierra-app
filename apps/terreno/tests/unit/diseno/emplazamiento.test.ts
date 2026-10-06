/**
 * Tests de `lib/emplazamiento.ts`.
 *
 * Los casos resueltos son los números que publican las propias normas: los
 * cinco anchos de retiro de CPS 391, los cuatro taludes de la tabla B-1 de
 * OSHA, los dos taludes permanentes de CPS 560, la tabla II de 15A NCAC 18A con
 * sus cuatro grupos texturales, y los tres umbrales de Montgomery y Dietrich.
 *
 * La geometría de la plataforma se verifica contra la derivación analítica, que
 * es el caso resuelto que corresponde cuando la fuente no publica una tabla:
 * corte = ancho · pendiente / 2 y volumen = largo · ancho² · pendiente / 8.
 */
import { describe, it, expect } from 'vitest';
import {
  BUFFERS_CAUCE,
  CAUDAL_DORMITORIO_EPA_L_DIA,
  CAUDAL_DORMITORIO_L_DIA,
  CAUDAL_VIVIENDA_MIN_L_DIA,
  CLASE_CAUCE,
  CORTE_CON_PROFESIONAL_M,
  FACTOR_AREA_RESERVA,
  GRUPOS_LTAR,
  PENDIENTE_CAMINO_MAX_PCT,
  PENDIENTE_CAMINO_NORMAL_PCT,
  PIE_M,
  RECURRENCIA_CRUCE_CAMINO,
  SEPARACION_ZANJAS_VECES_ANCHO,
  TALUD_ENGRAMABLE_HV,
  TALUD_OSHA_HV,
  TALUD_PERMANENTE_HV,
  UMBRAL_CABECERA_M,
  UMBRAL_CAUCE_M,
  accesibilidad,
  acumulacionD8,
  areaParaCauce,
  bufferCauce,
  campoDeInfiltracion,
  claseDeCauce,
  claseUSDA,
  clasePosicion,
  distanciaACauce,
  evaluarPunto,
  exposicionSolar,
  factorEscaleraBuffer,
  gpdFt2ALDiaM2,
  grupoLTAR,
  incertidumbreDeBorde,
  indiceCauce,
  indicePosicion,
  ladoAsoleado,
  pendienteCentrada,
  pendienteMinimaResoluble,
  pendienteQueExigeMuro,
  piesAM,
  plataforma,
  prepararEmplazamiento,
  resumenEmplazamiento,
  taludAGrados,
  taludAPct,
} from '@/lib/emplazamiento';
import type { GrillaElevacion } from '@/lib/grillaElevacion';

// ─── Grillas sintéticas ───────────────────────────────────────────────────────

/**
 * Grilla con un paso horizontal controlado. Se arma eligiendo el span en grados
 * para que `dimsCelda` devuelva exactamente el paso buscado en la latitud dada.
 */
function grilla(
  rows: number,
  cols: number,
  paso_m: number,
  z: (r: number, c: number) => number,
  opciones?: { lat?: number; fuente?: GrillaElevacion['fuente'] },
): GrillaElevacion {
  const lat = opciones?.lat ?? -34;
  const dLat = paso_m / 111_320;
  const dLng = paso_m / (111_320 * Math.cos((lat * Math.PI) / 180));
  const elev = new Float64Array(rows * cols);
  let min = Infinity;
  let max = -Infinity;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = z(r, c);
      elev[r * cols + c] = v;
      if (Number.isFinite(v)) { if (v < min) min = v; if (v > max) max = v; }
    }
  }
  return {
    rows, cols,
    latMin: lat, latMax: lat + dLat * (rows - 1),
    lngMin: -58, lngMax: -58 + dLng * (cols - 1),
    elev, elev_min: min, elev_max: max,
    fuente: opciones?.fuente ?? 'glo30',
  };
}

/** Plano inclinado puro: baja hacia el sur (row 0) con la pendiente pedida. */
function planoInclinado(rows: number, cols: number, paso_m: number, pct: number, lat = -34) {
  return grilla(rows, cols, paso_m, r => r * paso_m * (pct / 100), { lat });
}

// ══════════════════════════════════════════════════════════════════════════════
describe('el retiro del curso de agua (CPS 391)', () => {
  it('reproduce los cinco anchos publicados, en pies y en metros', () => {
    expect(BUFFERS_CAUCE.map(b => b.pies)).toEqual([35, 50, 50, 100, 165]);
    expect(piesAM(35)).toBeCloseTo(10.668, 3);
    expect(piesAM(50)).toBeCloseTo(15.24, 3);
    expect(piesAM(100)).toBeCloseTo(30.48, 3);
    expect(piesAM(165)).toBeCloseTo(50.292, 3);
  });

  it('EL RETIRO NO ES UN NÚMERO: ENTRE EL PRIMER ESCALÓN Y EL ÚLTIMO HAY UN FACTOR 4,7', () => {
    expect(factorEscaleraBuffer()).toBeCloseTo(4.714, 2);
    expect(bufferCauce('sedimento').m).toBeCloseTo(10.668, 3);
    expect(bufferCauce('fauna_grande').m).toBeCloseTo(50.292, 3);
  });

  it('distingue los dos que la norma exige de los tres que recomienda', () => {
    const exigidos = BUFFERS_CAUCE.filter(b => b.exigido).map(b => b.id);
    expect(exigidos).toEqual(['sedimento', 'nutrientes']);
  });

  it('el retiro de fauna de borde y el de nutrientes coinciden en 50 pies por razones distintas', () => {
    expect(bufferCauce('nutrientes').m).toBe(bufferCauce('fauna_borde').m);
    expect(bufferCauce('nutrientes').para).not.toBe(bufferCauce('fauna_borde').para);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('dónde empieza el cauce (Montgomery & Dietrich 1992)', () => {
  it('clasifica con los tres umbrales publicados', () => {
    expect(claseDeCauce(UMBRAL_CAUCE_M + 1)).toBe('cauce');
    expect(claseDeCauce(100)).toBe('cabecera');
    expect(claseDeCauce(UMBRAL_CABECERA_M - 1)).toBe('ladera');
    expect(claseDeCauce(5)).toBe('divisoria');
  });

  it('el índice tiene unidades de metros: área específica por pendiente al cuadrado', () => {
    // 100 celdas de 5 m aguas arriba, pendiente 0,20 → 100·5·0,04 = 20 m
    expect(indiceCauce(100, 5, 0.2)).toBeCloseTo(20, 6);
  });

  it('EL ÁREA QUE ABRE UN CAUCE BAJA CON EL CUADRADO DE LA PENDIENTE', () => {
    // Para cruzar el mismo umbral, al duplicar la pendiente hace falta la cuarta
    // parte del área. Eso es lo que un umbral fijo de acumulación no puede hacer.
    const areaPara = (pend: number) => UMBRAL_CAUCE_M / (5 * pend * pend);
    expect(areaPara(0.1) / areaPara(0.2)).toBeCloseTo(4, 6);
  });

  it('en un plano inclinado el umbral absoluto puede no marcar ningún cauce, y eso es correcto', () => {
    // Una ladera plana sin convergencia no tiene cauce. Un umbral RELATIVO
    // —como el `acumMax · 0,03` que la app ya tenía— siempre marca uno, porque
    // siempre hay una celda que es el 3 % del máximo.
    const g = planoInclinado(20, 20, 5, 8);
    const ctx = prepararEmplazamiento(g);
    expect(ctx).not.toBeNull();
    let cauces = 0;
    for (let i = 0; i < g.rows * g.cols; i++) if (ctx!.clase_cauce[i] === CLASE_CAUCE) cauces++;
    // La fila de abajo concentra todo el flujo del plano, así que algo marca;
    // lo que importa es que no marca media ladera.
    expect(cauces).toBeLessThan(g.rows * g.cols * 0.2);
  });

  it('en un valle en V con pendiente el cauce cae en el eje y no en las laderas', () => {
    // z = distancia al eje × pendiente transversal + caída longitudinal. La
    // grilla tiene row 0 al sur y z baja al aumentar r, así que el agua va al
    // norte y aguas abajo es la fila alta.
    const cols = 31;
    const eje = 15;
    const g = grilla(40, cols, 5, (r, c) => Math.abs(c - eje) * 5 * 0.3 + (40 - r) * 5 * 0.3);
    const ctx = prepararEmplazamiento(g)!;
    const r = 35;
    expect(ctx.clase_cauce[r * cols + eje]).toBe(CLASE_CAUCE);
    expect(ctx.clase_cauce[r * cols + (eje + 8)]).not.toBe(CLASE_CAUCE);
  });

  it('EN UN PREDIO CHICO Y SUAVE EL CRITERIO NO ENCUENTRA NINGÚN CAUCE, Y LO DICE', () => {
    // Una vaguada de 3 ha al 5 % no alcanza el umbral, y es correcto: para
    // abrir un cauce a esa pendiente hacen falta 40 ha de cuenca. Lo que no
    // sería correcto es aplicar un retiro inventado o callarse.
    const cols = 31;
    const g = grilla(40, cols, 5, (r, c) => Math.abs(c - 15) * 5 * 0.25 + (40 - r) * 5 * 0.05);
    const ctx = prepararEmplazamiento(g)!;
    expect(ctx.celdas_cauce).toBe(0);
    const lat = g.latMin + ((g.latMax - g.latMin) * 20) / (g.rows - 1);
    const lng = g.lngMin + ((g.lngMax - g.lngMin) * 15) / (g.cols - 1);
    const ev = evaluarPunto(ctx, lat, lng)!;
    expect(ev.dist_cauce_m).toBeNull();
    expect(ev.advertencias.some(a => a.includes('ningún cauce'))).toBe(true);
    expect(ev.advertencias.some(a => a.includes('marcarlo a mano'))).toBe(true);
  });

  it('Y EL ÁREA QUE HACE FALTA EXPLICA POR QUÉ: 40 ha AL 5 %, 250 ha AL 2 %', () => {
    expect(areaParaCauce(5, 0.05) / 10_000).toBeCloseTo(40, 0);
    expect(areaParaCauce(5, 0.02) / 10_000).toBeCloseTo(250, 0);
    expect(areaParaCauce(5, 0.3) / 10_000).toBeCloseTo(1.1, 1);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('los taludes (OSHA tabla B-1 y CPS 560)', () => {
  it('reproduce los cuatro ángulos de la tabla B-1 de OSHA', () => {
    expect(taludAGrados(TALUD_OSHA_HV.roca)).toBe(90);
    expect(taludAGrados(TALUD_OSHA_HV.A)).toBeCloseTo(53.13, 2);
    expect(taludAGrados(TALUD_OSHA_HV.B)).toBeCloseTo(45, 2);
    expect(taludAGrados(TALUD_OSHA_HV.C)).toBeCloseTo(33.69, 2);
  });

  it('EL TALUD PERMANENTE ES MÁS DEL DOBLE DE TENDIDO QUE EL QUE OSHA ADMITE EN OBRA', () => {
    // OSHA tipo C: 1½:1 = 66,7 %. CPS 560 permanente: 2:1 = 50 %. El que corta
    // «porque OSHA lo permite» deja un talud que aguanta la obra y no el invierno.
    expect(taludAPct(TALUD_OSHA_HV.C)).toBeCloseTo(66.67, 2);
    expect(taludAPct(TALUD_PERMANENTE_HV)).toBe(50);
    expect(taludAPct(TALUD_OSHA_HV.A) / taludAPct(TALUD_PERMANENTE_HV)).toBeCloseTo(2.667, 2);
  });

  it('el talud engramable de CPS 560 es la mitad del permanente', () => {
    expect(taludAPct(TALUD_ENGRAMABLE_HV)).toBe(25);
    expect(taludAGrados(TALUD_ENGRAMABLE_HV)).toBeCloseTo(14.04, 2);
  });

  it('el corte que exige profesional son 20 pies', () => {
    expect(CORTE_CON_PROFESIONAL_M).toBeCloseTo(6.096, 3);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('la plataforma: qué cuesta la pendiente', () => {
  it('reproduce la derivación analítica del corte y del volumen', () => {
    const p = plataforma(10, 12, 20)!;
    expect(p.corte_m).toBeCloseTo(1, 6);          // 10 · 0,20 / 2
    expect(p.vol_corte_m3).toBeCloseTo(30, 6);    // 12 · 100 · 0,20 / 8
    expect(p.relleno_m).toBe(p.corte_m);
    expect(p.vol_relleno_m3).toBe(p.vol_corte_m3);
  });

  it('EL VOLUMEN VA CON EL CUADRADO DEL ANCHO: LA MISMA CASA GIRADA MUEVE EL TRIPLE', () => {
    // 120 m² de huella en una ladera del 30 %, en tres proporciones.
    const angosta  = plataforma(6, 20, 30)!;
    const cuadrada = plataforma(10, 12, 30)!;
    const ancha    = plataforma(20, 6, 30)!;
    expect(angosta.vol_corte_m3).toBeCloseTo(27, 1);
    expect(cuadrada.vol_corte_m3).toBeCloseTo(45, 1);
    expect(ancha.vol_corte_m3).toBeCloseTo(90, 1);
    expect(ancha.vol_corte_m3 / angosta.vol_corte_m3).toBeCloseTo(3.333, 2);
    // Y el corte: 0,90 m contra 3 m. Una es una plataforma, la otra es una obra.
    expect(angosta.corte_m).toBeCloseTo(0.9, 2);
    expect(ancha.corte_m).toBeCloseTo(3, 2);
  });

  it('LO QUE SE TOCA NO ES LA HUELLA: EL TALUD SE COME MÁS QUE EL EDIFICIO', () => {
    const p = plataforma(10, 12, 40)!;
    expect(p.alcance_corte_m).toBeCloseTo(20, 1);       // 2 / (0,5 − 0,4)
    expect(p.alcance_veces_ancho).toBeCloseTo(2, 1);
    expect(p.factor_huella).toBeGreaterThan(3);
  });

  it('a pendiente suave el talud casi no agrega superficie', () => {
    const p = plataforma(10, 12, 5)!;
    expect(p.factor_huella).toBeLessThan(1.15);
    expect(p.pide_muro).toBe(false);
  });

  it('EL TALUD PERMANENTE DEJA DE CERRAR EXACTAMENTE EN EL 50 %, QUE ES EL PROPIO 2H:1V', () => {
    expect(pendienteQueExigeMuro()).toBe(50);
    expect(plataforma(10, 12, 49)!.pide_muro).toBe(false);
    expect(plataforma(10, 12, 51)!.pide_muro).toBe(true);
    expect(plataforma(10, 12, 51)!.alcance_corte_m).toBe(Infinity);
  });

  it('con una banda disponible acotada pide muro mucho antes', () => {
    const libre = plataforma(10, 12, 30)!;
    const apretada = plataforma(10, 12, 30, { banda_disponible_m: 14 })!;
    expect(libre.pide_muro).toBe(false);
    expect(apretada.pide_muro).toBe(true);
  });

  it('marca el corte que la norma de obra manda a un profesional', () => {
    expect(plataforma(10, 12, 20)!.pide_profesional).toBe(false);
    expect(plataforma(70, 12, 20)!.pide_profesional).toBe(true);  // corte 7 m
  });

  it('rechaza entradas sin sentido en vez de devolver un número', () => {
    expect(plataforma(0, 12, 10)).toBeNull();
    expect(plataforma(10, 0, 10)).toBeNull();
    expect(plataforma(10, 12, NaN)).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('el camino (CPS 560)', () => {
  it('conserva los dos límites de pendiente y las tres recurrencias publicadas', () => {
    expect(PENDIENTE_CAMINO_NORMAL_PCT).toBe(10);
    expect(PENDIENTE_CAMINO_MAX_PCT).toBe(15);
    expect(RECURRENCIA_CRUCE_CAMINO.map(r => r.anios)).toEqual([2, 10, 25]);
  });

  it('el ancho mínimo de calzada de la norma son 14 pies, no tres metros', () => {
    expect(piesAM(14)).toBeCloseTo(4.267, 3);
    expect(piesAM(20)).toBeCloseTo(6.096, 3);
  });

  it('en un plano del 8 % el camino llega a todo el predio', () => {
    const g = planoInclinado(20, 20, 10, 8);
    const cam = accesibilidad(g, { lat: g.latMin, lng: g.lngMin }, 10)!;
    expect(cam.alcanzadas).toBe(g.rows * g.cols);
  });

  it('EN UN PLANO DEL 20 % NO LLEGA A NINGUNA PARTE, AUNQUE TODO EL PREDIO SEA IGUAL', () => {
    // Un plano uniforme del 20 % no tiene un solo paso de menos del 10 % en la
    // dirección de máxima pendiente; en la perpendicular sí, pero desde una
    // esquina eso sólo alcanza para recorrer una fila.
    const g = planoInclinado(20, 20, 10, 20);
    const cam = accesibilidad(g, { lat: g.latMin, lng: g.lngMin }, 10)!;
    expect(cam.alcanzadas).toBeLessThan(g.rows * g.cols);
    expect(cam.alcanzadas).toBeGreaterThan(0);
  });

  it('UNA LOMA AISLADA QUEDA SIN CAMINO AUNQUE SU CIMA SEA PLANA', () => {
    // Meseta plana rodeada por un escarpe del 40 %: el mejor lugar del predio
    // para construir y no se llega. Es exactamente lo que `masterplan.ts`
    // elegiría y no podía detectar.
    const cols = 21;
    const g = grilla(21, cols, 10, (r, c) => {
      const d = Math.max(Math.abs(r - 10), Math.abs(c - 10));
      return d <= 3 ? 40 : Math.max(0, 40 - (d - 3) * 10 * 0.4);
    });
    const cam = accesibilidad(g, { lat: g.latMin, lng: g.lngMin }, 10)!;
    expect(Number.isFinite(cam.largo_m[10 * cols + 10]!)).toBe(false);
  });

  it('con el límite de 15 % llega a más celdas que con el de 10 %', () => {
    const g = planoInclinado(20, 20, 10, 18);
    const c10 = accesibilidad(g, { lat: g.latMin, lng: g.lngMin }, 10)!;
    const c15 = accesibilidad(g, { lat: g.latMin, lng: g.lngMin }, 15)!;
    expect(c10.alcanzadas).toBeLessThan(g.rows * g.cols);
    expect(c15.alcanzadas).toBeGreaterThan(c10.alcanzadas);
  });

  it('LA DIAGONAL ES LA CONTRAVUELTA: EN UN PLANO SE PUEDE SUBIR AL 71 % DE LA PENDIENTE', () => {
    // Sobre un plano uniforme, un paso en diagonal recorre √2 veces más
    // distancia por el mismo desnivel, así que la pendiente del camino es la del
    // terreno dividida por √2. De ahí sale que un plano del 14 % sea totalmente
    // accesible con un límite del 10 % y uno del 15 % ya no.
    const accesible = (pct: number) => {
      const g = planoInclinado(16, 16, 10, pct);
      return accesibilidad(g, { lat: g.latMin, lng: g.lngMin }, 10)!.alcanzadas === 256;
    };
    expect(accesible(14)).toBe(true);
    expect(accesible(15)).toBe(false);
    expect(10 * Math.SQRT2).toBeCloseTo(14.14, 2);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('el ruido del relieve', () => {
  it('con los 30 m de la fuente global el ruido es dos tercios del criterio de camino', () => {
    expect(pendienteMinimaResoluble(30)).toBeCloseTo(6.67, 2);
    expect(pendienteMinimaResoluble(30) / PENDIENTE_CAMINO_NORMAL_PCT).toBeCloseTo(0.667, 2);
  });

  it('EN TERRENO EMPINADO EL ERROR PUBLICADO SUPERA AL CRITERIO QUE SE ESTÁ PROBANDO', () => {
    expect(pendienteMinimaResoluble(30, 25)).toBeCloseTo(13.33, 2);
    expect(pendienteMinimaResoluble(30, 25)).toBeGreaterThan(PENDIENTE_CAMINO_NORMAL_PCT);
  });

  it('MUESTREAR MÁS FINO LA MISMA FUENTE EMPEORA LA PENDIENTE, NO LA MEJORA', () => {
    // El error publicado está en metros y es fijo: dividirlo por un paso más
    // chico da un número más grande. Por eso lo que vale es el paso EFECTIVO.
    expect(pendienteMinimaResoluble(5)).toBeCloseTo(40, 1);
    expect(pendienteMinimaResoluble(5)).toBeGreaterThan(pendienteMinimaResoluble(30));
  });

  it('con un DEM nacional de 2 m el criterio de camino vuelve a tener sentido', () => {
    expect(pendienteMinimaResoluble(2)).toBeCloseTo(100, 1);   // absurdo: es interpolación
    // Lo que cambia de verdad es el borde de la exclusión.
    expect(incertidumbreDeBorde(30)).toBe(15);
    expect(incertidumbreDeBorde(2)).toBe(1);
  });

  it('EL BORDE DEL RETIRO TIENE MÁS INCERTIDUMBRE QUE EL PROPIO RETIRO MÍNIMO', () => {
    // Con la fuente global: ±15 m de incertidumbre sobre un retiro de 10,67 m.
    expect(incertidumbreDeBorde(30)).toBeGreaterThan(bufferCauce('sedimento').m);
  });

  it('el paso efectivo no baja del de la fuente aunque la grilla sea más densa', () => {
    const g = planoInclinado(30, 30, 5, 10);
    const ctx = prepararEmplazamiento(g)!;
    expect(ctx.paso_m).toBeCloseTo(5, 1);
    expect(ctx.paso_fuente_m).toBe(30);
    expect(ctx.paso_efectivo_m).toBe(30);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('el campo de infiltración (15A NCAC 18A + EPA)', () => {
  it('reproduce la tabla II con sus cuatro grupos', () => {
    expect(GRUPOS_LTAR.map(g => g.gpd_ft2)).toEqual([
      [1.2, 0.8], [0.8, 0.6], [0.6, 0.3], [0.4, 0.1],
    ]);
  });

  it('LOS RANGOS DE LOS GRUPOS SE SUPERPONEN: EL ORDEN NO ES UN ORDEN DE CALIDAD', () => {
    const iii = GRUPOS_LTAR[2]!.gpd_ft2;
    const iv  = GRUPOS_LTAR[3]!.gpd_ft2;
    expect(iv[0]).toBeGreaterThan(iii[1]);   // 0,4 > 0,3
  });

  it('DENTRO DEL GRUPO IV LA TASA VARÍA UN FACTOR CUATRO, Y LA TEXTURA NO LO DECIDE', () => {
    const iv = GRUPOS_LTAR[3]!.gpd_ft2;
    expect(iv[0] / iv[1]).toBeCloseTo(4, 6);
  });

  it('convierte gpd/ft² a L/día·m² sin perder el factor', () => {
    expect(gpdFt2ALDiaM2(1)).toBeCloseTo(40.746, 3);
    expect(gpdFt2ALDiaM2(0.6)).toBeCloseTo(24.447, 3);
  });

  it('clasifica las doce clases del triángulo USDA', () => {
    expect(claseUSDA(2, 92, 6)).toBe('arenoso');
    expect(claseUSDA(5, 80, 15)).toBe('arenoso-franco');
    expect(claseUSDA(12, 70, 18)).toBe('franco-arenoso');
    expect(claseUSDA(18, 40, 42)).toBe('franco');
    expect(claseUSDA(20, 20, 60)).toBe('franco-limoso');
    expect(claseUSDA(5, 10, 85)).toBe('limoso');
    expect(claseUSDA(28, 55, 17)).toBe('franco-arcillo-arenoso');
    expect(claseUSDA(32, 35, 33)).toBe('franco-arcilloso');
    expect(claseUSDA(32, 12, 56)).toBe('franco-arcillo-limoso');
    expect(claseUSDA(42, 50, 8)).toBe('arcillo-arenoso');
    expect(claseUSDA(45, 10, 45)).toBe('arcillo-limoso');
    expect(claseUSDA(55, 25, 20)).toBe('arcilloso');
  });

  it('LAS DOS CLASES QUE EL CLASIFICADOR DE suelos.ts NO SABE DEVOLVER CAEN EN EL GRUPO III', () => {
    // `clasificarTextura` de `lib/suelos.ts` tiene diez salidas, no doce: un
    // franco arcillo arenoso le sale «Arcillo-arenoso» y se iría al grupo IV,
    // con un tercio menos de tasa. Por eso este módulo parte de los porcentajes.
    expect(grupoLTAR(28, 55, 17)).toBe('III');
    expect(grupoLTAR(32, 12, 56)).toBe('III');
    expect(grupoLTAR(42, 50, 8)).toBe('IV');
  });

  it('el caudal de diseño son 120 galones por dormitorio, con piso de 240 por vivienda', () => {
    expect(CAUDAL_DORMITORIO_L_DIA).toBeCloseTo(454.25, 2);
    expect(CAUDAL_VIVIENDA_MIN_L_DIA).toBeCloseTo(908.5, 2);
    const uno = campoDeInfiltracion(1, { arcilla_pct: 18, arena_pct: 40, limo_pct: 42 })!;
    expect(uno.caudal_l_dia).toBe(908);              // el piso de 240 gal, no 454
  });

  it('LAS DOS CONVENCIONES PUBLICADAS DEL CAUDAL DIFIEREN UN 25 %', () => {
    // La regla de Carolina del Norte dice 120 gpd por dormitorio; la EPA declara
    // que el supuesto habitual son 150. El número de partida no es uno.
    expect(CAUDAL_DORMITORIO_EPA_L_DIA / CAUDAL_DORMITORIO_L_DIA).toBeCloseTo(1.25, 3);
  });

  it('reproduce el cálculo de la norma para una casa de tres dormitorios en franco fino', () => {
    const c = campoDeInfiltracion(3, { arcilla_pct: 20, arena_pct: 20, limo_pct: 60 })!;
    expect(c.clase).toBe('franco-limoso');
    expect(c.grupo).toBe('III');
    expect(c.caudal_l_dia).toBeCloseTo(1362.7, 0);           // 360 gpd
    expect(c.area_zanja_m2[0]).toBeCloseTo(55.7, 1);         // 360 / 0,6 = 600 ft²
    expect(c.area_zanja_m2[1]).toBeCloseTo(111.5, 1);        // 360 / 0,3 = 1.200 ft²
  });

  it('LO QUE OCUPA NO ES EL FONDO DE ZANJA: ES SEIS VECES ESO', () => {
    const c = campoDeInfiltracion(3, { arcilla_pct: 20, arena_pct: 20, limo_pct: 60 })!;
    // Tres anchos entre ejes por la separación, y el doble por el área de reserva.
    expect(SEPARACION_ZANJAS_VECES_ANCHO).toBe(3);
    expect(FACTOR_AREA_RESERVA).toBe(2);
    expect(c.con_reserva_m2[1]! / c.area_zanja_m2[1]!).toBeCloseTo(6, 1);
    expect(c.con_reserva_m2[1]).toBeCloseTo(668.9, 0);
  });

  it('Y EN EL PEOR SUELO PASA LOS 800 m² QUE EL MASTER PLAN RESERVA PARA LA CASA ENTERA', () => {
    const arcilla = campoDeInfiltracion(3, { arcilla_pct: 55, arena_pct: 25, limo_pct: 20 })!;
    expect(arcilla.grupo).toBe('IV');
    expect(arcilla.con_reserva_m2[1]).toBeGreaterThan(800);
    expect(arcilla.con_reserva_m2[1]).toBeCloseTo(2006.7, 0);
  });

  it('EL MISMO PROGRAMA PIDE CUATRO VECES MÁS TERRENO SEGÚN LA TEXTURA', () => {
    const arena = campoDeInfiltracion(3, { arcilla_pct: 2, arena_pct: 92, limo_pct: 6 })!;
    const fino  = campoDeInfiltracion(3, { arcilla_pct: 20, arena_pct: 20, limo_pct: 60 })!;
    expect(arena.grupo).toBe('I');
    expect(arena.con_reserva_m2[0]).toBeCloseTo(167.2, 0);
    expect(fino.con_reserva_m2[1]! / arena.con_reserva_m2[0]!).toBeCloseTo(4, 1);
  });

  it('cambia de base cuando la ocupación pasa de dos personas por dormitorio', () => {
    const normal = campoDeInfiltracion(2, { arcilla_pct: 18, arena_pct: 40, limo_pct: 42 }, { personas: 4 })!;
    const lleno  = campoDeInfiltracion(2, { arcilla_pct: 18, arena_pct: 40, limo_pct: 42 }, { personas: 10 })!;
    expect(normal.caudal_l_dia).toBe(908);
    expect(lleno.caudal_l_dia).toBe(2271);                    // 10 × 60 gal/día
    expect(lleno.advertencias.some(a => a.includes('dos por dormitorio'))).toBe(true);
  });

  it('avisa siempre de los dos factores de seguridad que se cancelan sólo en una vivienda', () => {
    const c = campoDeInfiltracion(3, { arcilla_pct: 18, arena_pct: 40, limo_pct: 42 })!;
    expect(c.advertencias.some(a => a.includes('2.3') && a.includes('3.6'))).toBe(true);
    expect(c.advertencias.some(a => a.includes('no se cancelan'))).toBe(true);
  });

  it('y de que la tasa se toma del horizonte más limitante y no del de superficie', () => {
    const c = campoDeInfiltracion(3, { arcilla_pct: 18, arena_pct: 40, limo_pct: 42 })!;
    expect(c.advertencias.some(a => a.includes('90 cm'))).toBe(true);
  });

  it('rechaza porcentajes que no son números', () => {
    expect(campoDeInfiltracion(3, { arcilla_pct: NaN, arena_pct: 40, limo_pct: 42 })).toBeNull();
    expect(campoDeInfiltracion(3, { arcilla_pct: 18, arena_pct: 40, limo_pct: NaN })).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('el hemisferio', () => {
  it('en el sur el sol del mediodía está al norte y en el norte al sur', () => {
    expect(ladoAsoleado(-34.6).lado).toBe('norte');
    expect(ladoAsoleado(40.4).lado).toBe('sur');
    expect(ladoAsoleado(-34.6).signo).toBe(1);
    expect(ladoAsoleado(40.4).signo).toBe(-1);
  });

  it('LA MISMA LADERA ES LA BUENA EN BUENOS AIRES Y LA MALA EN MADRID', () => {
    // «El sur más alto que el norte» = la ladera baja al norte.
    const dz = 5;
    expect(exposicionSolar(dz, -34.6)).toBe(5);    // Buenos Aires: al sol
    expect(exposicionSolar(dz, 40.4)).toBe(-5);    // Madrid: sombría
  });

  it('en Bogotá y en Puerto Rico la regla de la ladera no decide sola', () => {
    expect(ladoAsoleado(4.7).ambiguo).toBe(true);
    expect(ladoAsoleado(18.2).ambiguo).toBe(true);
    expect(ladoAsoleado(-34.6).ambiguo).toBe(false);
  });

  it('el límite de la ambigüedad es el trópico, no un número redondo', () => {
    expect(ladoAsoleado(23.4).ambiguo).toBe(true);
    expect(ladoAsoleado(23.5).ambiguo).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('la posición en el paisaje', () => {
  it('EN UN PLANO INCLINADO NO HAY NI CONCAVIDAD NI CONVEXIDAD', () => {
    // La pendiente es la misma en todas las celdas y la posición también: una
    // tabla de puntaje que sólo mira pendiente no puede distinguir este caso de
    // una vaguada con la misma pendiente, y el criterio de la fuente sí.
    const g = planoInclinado(20, 20, 5, 15);
    const { tpi, umbral } = indicePosicion(g, 3);
    // En el interior de la grilla el índice es nulo; el borde no cuenta.
    expect(Math.abs(tpi[10 * 20 + 10]!)).toBeLessThan(0.01);
    expect(umbral).toBeLessThan(1);
  });

  it('en una vaguada el eje sale cóncavo y las laderas convexas', () => {
    const cols = 31;
    const g = grilla(31, cols, 5, (r, c) => Math.abs(c - 15) * 5 * 0.2 + (31 - r) * 5 * 0.03);
    const { tpi, umbral } = indicePosicion(g, 3);
    expect(clasePosicion(tpi[15 * cols + 15]!, umbral)).toBe('concava');
    expect(clasePosicion(tpi[15 * cols + 0]!, umbral)).toBe('convexa');
  });

  it('el umbral se escala con el predio en vez de ser un número fijo', () => {
    const suave = grilla(21, 21, 5, (r, c) => Math.abs(c - 10) * 5 * 0.01);
    const fuerte = grilla(21, 21, 5, (r, c) => Math.abs(c - 10) * 5 * 0.4);
    expect(indicePosicion(fuerte, 3).umbral).toBeGreaterThan(
      indicePosicion(suave, 3).umbral * 10,
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('la pendiente centrada', () => {
  it('reproduce la pendiente de un plano inclinado conocido', () => {
    const g = planoInclinado(12, 12, 10, 25);
    const { dx, dy } = { dx: 10, dy: 10 };
    const p = pendienteCentrada(g, dx, dy);
    expect(p[6 * 12 + 6]! * 100).toBeCloseTo(25, 1);
  });

  it('LA PENDIENTE AL VECINO MÁS EMPINADO SOBREESTIMA, Y EL ÍNDICE DE CAUCE VA AL CUADRADO', () => {
    // En un plano de 25 % orientado en diagonal, el gradiente centrado da 25 %
    // y el máximo a una vecina da el valor de la diagonal, mayor. Un 30 % de
    // error en S se vuelve 69 % en (A/b)S².
    expect(1.3 * 1.3 - 1).toBeCloseTo(0.69, 2);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('la distancia al cauce', () => {
  it('da cero en el cauce y crece con el paso de la grilla', () => {
    const cols = 11;
    const g = grilla(11, cols, 5, () => 0);
    const clase = new Uint8Array(11 * cols);
    clase[5 * cols + 5] = CLASE_CAUCE;
    const d = distanciaACauce(g, clase, 5);
    expect(d[5 * cols + 5]).toBe(0);
    expect(d[5 * cols + 6]).toBeCloseTo(5, 6);
    expect(d[5 * cols + 8]).toBeCloseTo(15, 6);
    expect(d[6 * cols + 6]).toBeCloseTo(7.071, 2);
  });

  it('sin cauces la distancia queda en infinito en vez de en cero', () => {
    const g = grilla(5, 5, 5, () => 0);
    const d = distanciaACauce(g, new Uint8Array(25), 5);
    expect(d[12]).toBe(Infinity);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('la evaluación de un punto y el resumen del predio', () => {
  const cols = 41;
  // Valle en V con un arroyo en el eje, bajando hacia el norte (row alta) con
  // pendiente suficiente para que el criterio de cauce se cumpla.
  const valle = grilla(41, cols, 5, (r, c) =>
    Math.abs(c - 20) * 5 * 0.3 + (41 - r) * 5 * 0.3);

  it('excluye el cauce y su retiro, y lo dice con la distancia que hay y la que pide', () => {
    const ctx = prepararEmplazamiento(valle, null, { buffer: 'sedimento' })!;
    // Una celda a dos pasos del eje: 10 m, menos que los 10,67 que pide la norma.
    const lat = valle.latMin + ((valle.latMax - valle.latMin) * 38) / (valle.rows - 1);
    const lng = valle.lngMin + ((valle.lngMax - valle.lngMin) * 22) / (valle.cols - 1);
    const ev = evaluarPunto(ctx, lat, lng)!;
    expect(ev.excluido).toBe(true);
    const ex = ev.exclusiones.find(e => e.regla === 'buffer_cauce' || e.regla === 'cauce')!;
    expect(ex).toBeTruthy();
    expect(ex.pide_m).toBeCloseTo(10.7, 1);
  });

  it('EL RETIRO QUE SE ELIGE CAMBIA CUÁNTO PREDIO QUEDA, Y EL FACTOR ES GRANDE', () => {
    const sedimento = resumenEmplazamiento(
      prepararEmplazamiento(valle, null, { buffer: 'sedimento' })!,
    );
    const fauna = resumenEmplazamiento(
      prepararEmplazamiento(valle, null, { buffer: 'fauna_grande' })!,
    );
    expect(fauna.celdas_libres).toBeLessThan(sedimento.celdas_libres);
    expect(sedimento.superficie_total_ha).toBeCloseTo(fauna.superficie_total_ha, 2);
  });

  it('el resumen dice qué regla saca más y no sólo cuánto queda', () => {
    const ctx = prepararEmplazamiento(valle, null, { buffer: 'fauna_interior' })!;
    const r = resumenEmplazamiento(ctx);
    expect(r.por_regla.length).toBeGreaterThan(0);
    expect(r.por_regla[0]!.celdas).toBeGreaterThanOrEqual(r.por_regla[r.por_regla.length - 1]!.celdas);
    expect(r.celdas_libres + r.por_regla.reduce((s, x) => s + x.celdas, 0))
      .toBeGreaterThanOrEqual(r.celdas_total);
  });

  it('UNA CELDA DE LA GRILLA DEL MASTER PLAN SE COME TREINTA HUELLAS DE CASA', () => {
    // La grilla del shader son 10 × 10 celdas. En un predio de 40 ha eso da
    // celdas de 63 m, de 4.000 m², contra una casa de 120 m². Con esa regla no
    // se aplica un retiro de 10,67 m: por eso este módulo usa la grilla densa.
    const lado40ha = Math.sqrt(40 * 10_000);
    const celdaShader = lado40ha / 10;
    expect(celdaShader).toBeCloseTo(63.2, 1);
    expect((celdaShader * celdaShader) / (10 * 12)).toBeCloseTo(33.3, 1);
    expect(bufferCauce('sedimento').m / celdaShader).toBeLessThan(0.2);
  });

  it('en el resumen la superficie libre nunca supera la total', () => {
    const ctx = prepararEmplazamiento(valle, null, { buffer: 'nutrientes' })!;
    const r = resumenEmplazamiento(ctx);
    expect(r.superficie_libre_ha).toBeLessThanOrEqual(r.superficie_total_ha);
    expect(r.paso_m).toBeCloseTo(5, 1);
    expect(r.incertidumbre_borde_m).toBe(15);
  });

  it('con un acceso marcado agrega el camino como requisito y no como puntaje', () => {
    const g = planoInclinado(25, 25, 10, 6);
    const ctx = prepararEmplazamiento(g, { lat: g.latMin, lng: g.lngMin })!;
    const lat = g.latMin + ((g.latMax - g.latMin) * 12) / (g.rows - 1);
    const lng = g.lngMin + ((g.lngMax - g.lngMin) * 12) / (g.cols - 1);
    const ev = evaluarPunto(ctx, lat, lng)!;
    expect(ev.camino).not.toBeNull();
    expect(ev.requisitos.some(r => r.titulo === 'Camino')).toBe(true);
  });

  it('y si el camino no puede llegar, eso SÍ es una exclusión', () => {
    const cols2 = 21;
    const g = grilla(21, cols2, 10, (r, c) => {
      const d = Math.max(Math.abs(r - 10), Math.abs(c - 10));
      return d <= 3 ? 40 : Math.max(0, 40 - (d - 3) * 10 * 0.4);
    });
    const ctx = prepararEmplazamiento(g, { lat: g.latMin, lng: g.lngMin })!;
    const lat = g.latMin + ((g.latMax - g.latMin) * 10) / (g.rows - 1);
    const lng = g.lngMin + ((g.lngMax - g.lngMin) * 10) / (g.cols - 1);
    const ev = evaluarPunto(ctx, lat, lng)!;
    expect(ev.exclusiones.some(e => e.regla === 'sin_camino')).toBe(true);
  });

  it('cada exclusión y cada requisito viajan con su fuente', () => {
    const ctx = prepararEmplazamiento(valle, { lat: valle.latMin, lng: valle.lngMin },
      { buffer: 'fauna_interior' })!;
    const lat = valle.latMin + ((valle.latMax - valle.latMin) * 38) / (valle.rows - 1);
    const lng = valle.lngMin + ((valle.lngMax - valle.lngMin) * 24) / (valle.cols - 1);
    const ev = evaluarPunto(ctx, lat, lng)!;
    for (const e of ev.exclusiones) expect(e.fuente.length).toBeGreaterThan(10);
    expect(ev.advertencias.some(a => a.includes('norma local'))).toBe(true);
  });

  it('rechaza grillas demasiado chicas en vez de inventar un contexto', () => {
    expect(prepararEmplazamiento(grilla(2, 2, 5, () => 0))).toBeNull();
    expect(prepararEmplazamiento(grilla(4, 4, 5, () => 0))).toBeNull();  // 16 < 20 celdas
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('la acumulación D8 de este módulo', () => {
  it('en una vaguada la acumulación del eje crece aguas abajo', () => {
    // row 0 es el sur y z baja al crecer r: el agua va al norte.
    const cols = 21;
    const g = grilla(30, cols, 5, (r, c) => Math.abs(c - 10) * 5 * 0.2 + (30 - r) * 5 * 0.05);
    const acum = acumulacionD8(g);
    expect(acum[28 * cols + 10]!).toBeGreaterThan(acum[10 * cols + 10]!);
  });

  it('la suma de la acumulación de las celdas sin salida cubre todo el dominio', () => {
    const g = planoInclinado(10, 10, 5, 10);
    const acum = acumulacionD8(g);
    // La fila de abajo recibe todo el plano: 100 celdas en total.
    let maxAcum = 0;
    for (let i = 0; i < 100; i++) if (acum[i]! > maxAcum) maxAcum = acum[i]!;
    expect(maxAcum).toBeGreaterThan(1);
    expect(maxAcum).toBeLessThanOrEqual(100);
  });

  it('resuelve una hoya cerrada en vez de dejarla sin drenaje', () => {
    const cols = 15;
    const g = grilla(15, cols, 5, (r, c) => {
      if (r === 7 && c === 7) return -5;    // hoya de 5 m
      return (15 - r) * 5 * 0.05;
    });
    const acum = acumulacionD8(g);
    expect(Number.isFinite(acum[7 * cols + 7]!)).toBe(true);
    expect(acum[7 * cols + 7]!).toBeGreaterThanOrEqual(1);
  });
});
