import { describe, it, expect } from 'vitest';
import {
  detectarSueloExpansivo,
  ARCILLA_VERTICA_PCT, ACTIVIDAD_ALTA_CMOL, LEP_VERTICO_PCT,
  CONTROL_TOP_CM, CONTROL_BOT_CM,
} from '@/lib/sueloExpansivo';
import {
  confianzaCuenca, confianzaRepresa,
  avisoSwalesExpansivo, avisoKeylineExpansivo,
  BBF_SURCO_MIN_PCT, BBF_SURCO_MAX_PCT,
  INFIL_AGRIETADO_MM_H, INFIL_SELLADO_MM_H,
} from '@/lib/saludCalculo';
import {
  bandaDeriva, DERIVA_MIN_DRENAJE_PCT, DERIVA_MAX_PCT,
  DERIVA_MAX_FRACCION_PENDIENTE, GRUPOS_QUE_ENCHARCAN,
} from '@/lib/keylineGeometria';
import { coefEscorrentiaAnual } from '@/lib/cuenca';
import type { CapaSuelo } from '@/lib/suelos';

/**
 * Esta función decide si el informe avisa que el aporte anual de la represa está
 * sobreestimado. Los dos errores posibles son opuestos y los dos caros:
 *
 * - **No avisar donde corresponde** deja el número que el encargo encontró mal.
 *   Para un vertisol con cultivo la tabla por grupo hidrológico da 32 % contra
 *   7 a 11 % medido en Patancheru: el vaso se dimensiona tres o cuatro veces más
 *   grande que el agua que va a llegar.
 * - **Avisar en todas partes** convierte el aviso en ruido, y entonces no avisa
 *   de nada. Un suelo arcilloso NO es un suelo expansivo: el Latossolo del
 *   Cerrado tiene 47 % de arcilla y no se hincha.
 *
 * Por eso los tests son contra **perfiles reales medidos**, con los valores de
 * SoilGrids y, donde existe, la clasificación y la extensibilidad lineal de
 * SSURGO en el mismo punto. Medidos el 12/11/2026 por la API de consulta de
 * SoilGrids (250 m) y por Soil Data Access.
 */

const DEPTHS: Array<[string, number, number]> = [
  ['0-5cm', 0, 5], ['5-15cm', 5, 15], ['15-30cm', 15, 30],
  ['30-60cm', 30, 60], ['60-100cm', 60, 100], ['100-200cm', 100, 200],
];

/** Un perfil con la arcilla y la CEC de cada profundidad; el resto es relleno. */
function perfil(
  arcillas: number[],
  cecs: Array<number | null>,
  lep: Array<number | null> = [],
): CapaSuelo[] {
  return DEPTHS.map(([label, top, bot], i) => ({
    label, prof_top: top, prof_bot: bot, espesor_mm: (bot - top) * 10,
    ph: 7, carbono_org: 10,
    arcilla: arcillas[i] ?? 0,
    arena: Math.max(0, 100 - (arcillas[i] ?? 0) - 25), limo: 25,
    densidad_ap: 1.3, nitrogeno: 1, clase_textura: 'arcilloso',
    pmp: 0.2, cc: 0.38, sat: 0.5, awc_frac: 0.18, awc_mm: 9, ksat: 1,
    cec: cecs[i] ?? null,
    lep: lep[i] ?? null,
  }));
}

// ── Los puntos medidos ───────────────────────────────────────────────────────
// Arcilla % y CEC cmol(c)/kg de SoilGrids, en las seis profundidades.

/** Heiden, Riesel TX (31,4757/-96,8767). SSURGO: Vertisols, LEP 12,0-12,2. */
const HEIDEN = perfil(
  [43.1, 42.3, 44.1, 49.8, 48.5, 47.7],
  [31.6, 34.5, 34.3, 33.6, 33.5, 30.4],
);

/** Capay, valle de Sacramento CA (38,6/-121,8). SSURGO: Vertisols, LEP 7,8-9,9. */
const CAPAY = perfil(
  [34.5, 33.7, 36.2, 35.9, 36.0, 33.1],
  [26.2, 24.9, 25.3, 25.4, 25.2, 24.9],
);

/** Vertisol del ICRISAT, Patancheru (17,5049/78,2729). El del encargo. */
const PATANCHERU = perfil(
  [30.0, 38.6, 36.9, 43.8, 44.3, 45.7],
  [22.8, 25.9, 23.6, 28.9, 27.8, 28.6],
);

/** Vertisol de Gezira, Sudán (14,4/33,4). */
const GEZIRA = perfil(
  [43.6, 43.3, 48.8, 50.4, 50.8, 51.6],
  [29.1, 30.0, 33.2, 33.1, 35.0, 35.3],
);

/** Vertisol de Entre Ríos, Argentina (-31,9/-58,45). */
const ENTRE_RIOS = perfil(
  [40.0, 39.7, 41.8, 45.8, 46.7, 44.9],
  [25.6, 26.1, 26.8, 28.7, 28.9, 28.8],
);

/** Vertosol negro de Darling Downs, Australia (-27,6/151,3). */
const DARLING = perfil(
  [48.9, 47.5, 56.2, 61.9, 61.9, 59.5],
  [33.0, 33.5, 34.3, 34.7, 34.1, 34.4],
);

/** Wedowee (Cecil), Piedmont de Georgia (33,8/-83,4). SSURGO: Ultisols, LEP 1,5. */
const WEDOWEE = perfil(
  [21.1, 20.9, 30.0, 41.1, 41.6, 36.2],
  [14.1, 5.7, 5.5, 5.5, 5.8, 5.6],
);

/** Latossolo del Cerrado, Brasil (-15,6/-47,7). Arcilloso y no expansivo. */
const CERRADO = perfil(
  [44.8, 47.4, 45.3, 47.2, 47.1, 47.5],
  [10.5, 10.2, 8.8, 8.0, 7.4, 6.5],
);

/** Turbera de Riau, Sumatra (0,75/102,1). */
const RIAU = perfil(
  [39.3, 39.5, 44.6, 50.1, 50.6, 50.3],
  [15.5, 11.1, 9.9, 9.0, 9.1, 9.3],
);

/** Clarion, Boone IA (42,1/-93,75). SSURGO: Mollisols, LEP 2,5 MEDIDO. */
const CLARION = perfil(
  [26.1, 26.5, 25.7, 25.9, 24.0, 21.0],
  [24.6, 23.8, 22.7, 20.8, 18.0, 12.7],
);

/** Llanura del Pilbara, Australia (-21,5/118,5). CEC alta y poca arcilla. */
const PILBARA = perfil(
  [20.2, 21.2, 22.4, 25.2, 26.5, 25.8],
  [25.7, 25.6, 26.1, 26.6, 26.7, 26.8],
);

/** Argiudol de Pergamino, Argentina (-33,9/-60,6). Ilítico: NO es expansivo. */
const PERGAMINO = perfil(
  [26.2, 26.4, 28.5, 33.4, 31.1, 19.6],
  [24.2, 23.4, 23.2, 27.6, 27.8, 26.5],
);

describe('los umbrales, que son los publicados y no estimados acá', () => {
  it('son los tres de WRB 2022, leídos del primario', () => {
    // Si alguien los "afina", esto falla y hay que volver a la fuente: 30 % es
    // el criterio 1 del horizonte vértico (§3.1.40) y del protovértico
    // (§3.1.32); 24 cmol(c)/kg de arcilla es el complemento exacto de las
    // propiedades siderálicas (§3.2.13); y el 6 % de extensibilidad lineal es
    // el COLE ≥ 0,06 que el horizonte vértico tiene «usually» y que el
    // protovértico acepta solo, en su criterio 2d.
    expect(ARCILLA_VERTICA_PCT).toBe(30);
    expect(ACTIVIDAD_ALTA_CMOL).toBe(24);
    expect(LEP_VERTICO_PCT).toBe(6);
  });

  it('el tramo de control excluye el horizonte orgánico', () => {
    // No es prolijidad: en superficie una parte grande de la CEC la aporta el
    // humus y el cociente miente para arriba. Clarion lo muestra en el mismo
    // perfil: 94 cmol/kg de arcilla en los primeros 5 cm contra 60 a los
    // 100-200, con la misma arcilla.
    expect(CONTROL_TOP_CM).toBe(30);
    expect(CONTROL_BOT_CM).toBe(100);
  });
});

describe('los suelos expansivos medidos: los seis salen positivos', () => {
  it('Heiden, Texas: SSURGO lo clasifica Vertisol, y eso manda sobre todo', () => {
    const r = detectarSueloExpansivo(HEIDEN, { taxorder: 'Vertisols' });
    expect(r?.nivel).toBe('medido');
    expect(r?.criterio).toBe('vertisol_ssurgo');
    // Y la inferencia, por separado, habría dado lo mismo.
    expect(detectarSueloExpansivo(HEIDEN)?.nivel).toBe('posible');
  });

  it('Capay, California: con LEP 9,9 medido alcanza sin el taxorder', () => {
    // WRB acepta el COLE solo para el protovértico (criterio 2d), así que una
    // extensibilidad medida de 9,9 % con 36 % de arcilla no necesita más.
    const conLep = perfil(
      [34.5, 33.7, 36.2, 35.9, 36.0, 33.1],
      [26.2, 24.9, 25.3, 25.4, 25.2, 24.9],
      [9.4, 9.4, 9.8, 7.8, 8.4, 9.9],
    );
    const r = detectarSueloExpansivo(conLep, { taxorder: 'Vertisols' });
    expect(r?.criterio).toBe('vertisol_ssurgo');
    // Sin taxorder, la extensibilidad sola lo sostiene y sigue siendo `medido`.
    const sinTax = detectarSueloExpansivo(conLep);
    expect(sinTax?.nivel).toBe('medido');
    expect(sinTax?.criterio).toBe('lep_ssurgo');
    // La extensibilidad se mira por capa en todo el primer metro, no promediada
    // sobre un tramo: WRB le pide el valor a un horizonte.
    expect(sinTax?.lep_pct).toBe(9.8);
    expect(sinTax?.detalle).toMatch(/0-5cm/);
  });

  it('Patancheru, Gezira, Entre Ríos y Darling Downs: los cuatro «posible»', () => {
    for (const [nombre, p] of [
      ['Patancheru', PATANCHERU], ['Gezira', GEZIRA],
      ['Entre Ríos', ENTRE_RIOS], ['Darling Downs', DARLING],
    ] as const) {
      const r = detectarSueloExpansivo(p);
      expect(r, nombre).not.toBeNull();
      expect(r!.nivel, nombre).toBe('posible');
      expect(r!.criterio, nombre).toBe('actividad_arcilla');
      expect(r!.arcilla_pct, nombre).toBeGreaterThanOrEqual(ARCILLA_VERTICA_PCT);
      expect(r!.actividad!, nombre).toBeGreaterThanOrEqual(ACTIVIDAD_ALTA_CMOL);
    }
  });

  it('y la actividad medida de los seis cae entre 55 y 71', () => {
    // El dato que justifica el umbral: no hay ningún vertisol pegado al 24.
    const act = [HEIDEN, CAPAY, PATANCHERU, GEZIRA, ENTRE_RIOS, DARLING]
      .map(p => detectarSueloExpansivo(p)!.actividad!);
    expect(Math.min(...act)).toBeGreaterThanOrEqual(55);
    expect(Math.max(...act)).toBeLessThanOrEqual(71);
  });
});

describe('lo que NO es expansivo, que es la mitad del valor de esto', () => {
  it('arcilla de baja actividad: el Cerrado, Wedowee y Riau quedan afuera', () => {
    // Los tres tienen MÁS arcilla que Capay y ninguno se hincha. Si el criterio
    // fuera la textura —que es lo que ya tiene el motor— los tres darían
    // positivo, y eso es precisamente el error que este módulo evita.
    for (const [nombre, p] of [
      ['Cerrado', CERRADO], ['Wedowee', WEDOWEE], ['Riau', RIAU],
    ] as const) {
      expect(detectarSueloExpansivo(p), nombre).toBeNull();
    }
    expect(detectarSueloExpansivo(CERRADO, { taxorder: 'Oxisols' })).toBeNull();
  });

  it('y su actividad medida no pasa de 18: el hueco hasta 55 está vacío', () => {
    // Por eso el umbral de 24 no decide casos de borde: separa dos poblaciones.
    // La actividad se recalcula acá a mano, con la misma fórmula y el mismo
    // tramo, porque el detector no la expone cuando devuelve `null` —y la
    // distancia al umbral es justamente lo que hay que dejar asentado—.
    const act = (p: CapaSuelo[]) => {
      const tramo = p.filter(c => c.prof_top >= 30 && c.prof_bot <= 100);
      const peso = tramo.reduce((a, c) => a + (c.prof_bot - c.prof_top), 0);
      const arc = tramo.reduce((a, c) => a + c.arcilla * (c.prof_bot - c.prof_top), 0) / peso;
      const cec = tramo.reduce((a, c) => a + (c.cec ?? 0) * (c.prof_bot - c.prof_top), 0) / peso;
      return (cec / arc) * 100;
    };
    expect(Math.max(act(CERRADO), act(WEDOWEE), act(RIAU))).toBeLessThan(19);
  });

  it('Clarion, Iowa: actividad 77 y sin embargo LEP 2,5 MEDIDO', () => {
    // Este es el punto que justifica el piso de arcilla, y lo justifica con una
    // medición y no con una opinión. La arcilla de Clarion es de alta actividad
    // de verdad —es till esmectítico— y el suelo igual no se hincha, porque
    // tiene 24,8 % de arcilla. La actividad dice de qué está hecha la arcilla;
    // la cantidad decide si eso se nota.
    const conLep = perfil(
      [26.1, 26.5, 25.7, 25.9, 24.0, 21.0],
      [24.6, 23.8, 22.7, 20.8, 18.0, 12.7],
      [2.5, 2.5, 2.5, 2.4, 2.4, 1.2],
    );
    expect(detectarSueloExpansivo(conLep, { taxorder: 'Mollisols' })).toBeNull();
    expect(detectarSueloExpansivo(CLARION)).toBeNull();
  });

  it('el Pilbara tampoco: CEC alta sobre poca arcilla', () => {
    expect(detectarSueloExpansivo(PILBARA)).toBeNull();
  });
});

describe('el falso positivo, que se declara en vez de esconderse', () => {
  it('Pergamino pasa los dos umbrales y no es un suelo expansivo', () => {
    // Argiudol ilítico. «Arcilla de alta actividad» incluye a la ilita y a la
    // vermiculita, que tienen CEC alta y no se hinchan, y el dato no las separa
    // de la esmectita. Por eso el nivel es `posible` y nunca `medido`, y por eso
    // el texto manda a la calicata.
    const r = detectarSueloExpansivo(PERGAMINO);
    expect(r?.nivel).toBe('posible');
    expect(r?.cautela).toMatch(/Puede ser/);
    expect(r?.cautela).toMatch(/ilita/);
    expect(r?.cautela).toMatch(/slickensides|cuña/);
  });

  it('un «posible» nunca se dice en indicativo', () => {
    for (const p of [PATANCHERU, GEZIRA, ENTRE_RIOS, DARLING, PERGAMINO]) {
      const r = detectarSueloExpansivo(p)!;
      expect(r.nivel).toBe('posible');
      expect(r.cautela).not.toMatch(/^Suelo expansivo/);
    }
  });
});

describe('cuando no hay dato, no se afirma nada', () => {
  it('perfil vacío, null', () => {
    expect(detectarSueloExpansivo([])).toBeNull();
  });

  it('sin CEC no hay inferencia: es el caso de la caché vieja', () => {
    // Las respuestas guardadas antes del 12/11/2026 no traen la capa `cec`. Si
    // esto devolviera algo, lo devolvería tratando la ausencia como un cero, y
    // un cero dice «arcilla de baja actividad»: el diagnóstico contrario.
    const sinCec = perfil(
      [43.6, 43.3, 48.8, 50.4, 50.8, 51.6],
      [null, null, null, null, null, null],
    );
    expect(detectarSueloExpansivo(sinCec)).toBeNull();
    // Pero el taxorder y la extensibilidad siguen alcanzando solos.
    expect(detectarSueloExpansivo(sinCec, { taxorder: 'Vertisols' })?.nivel).toBe('medido');
  });

  it('una CEC en cero es NoData, no arcilla inerte', () => {
    const cero = perfil([45, 45, 45, 45, 45, 45], [0, 0, 0, 0, 0, 0]);
    expect(detectarSueloExpansivo(cero)).toBeNull();
  });

  it('un perfil que no llega al tramo de control no alcanza para decidir', () => {
    // Pasa con SSURGO: hay perfiles descriptos sólo hasta 25 cm.
    const somero: CapaSuelo[] = perfil([50, 50, 50, 0, 0, 0], [35, 35, 35, null, null, null])
      .filter(c => c.prof_bot <= 30);
    expect(detectarSueloExpansivo(somero)).toBeNull();
    expect(detectarSueloExpansivo(somero, { taxorder: 'Vertisols' })?.nivel).toBe('medido');
  });

  it('arcilla en cero, null: no hay nada que se hinche', () => {
    expect(detectarSueloExpansivo(perfil([0, 0, 0, 0, 0, 0], [40, 40, 40, 40, 40, 40]))).toBeNull();
  });
});

describe('los bordes de los umbrales son «≥», no «>»', () => {
  const uniforme = (arc: number, cec: number) =>
    detectarSueloExpansivo(perfil([arc, arc, arc, arc, arc, arc], [cec, cec, cec, cec, cec, cec]));

  it('30 % de arcilla justo entra; 29,9 no', () => {
    // 30 × 0,24 = 7,2 de CEC da exactamente actividad 24.
    expect(uniforme(30, 7.2)?.nivel).toBe('posible');
    expect(uniforme(29.9, 7.2)).toBeNull();
  });

  it('actividad 24 justo entra; 23 no', () => {
    expect(uniforme(40, 9.6)?.nivel).toBe('posible');   // 9,6/40 = 24
    expect(uniforme(40, 9.2)).toBeNull();               // 9,2/40 = 23
  });

  it('LEP 6 justo entra; 5,9 cae a la inferencia o a null', () => {
    const con = (lep: number) => detectarSueloExpansivo(
      perfil([40, 40, 40, 40, 40, 40], [8, 8, 8, 8, 8, 8], [lep, lep, lep, lep, lep, lep]),
    );
    // Actividad 20: por abajo del umbral, así que sólo la extensibilidad decide.
    expect(con(6)?.criterio).toBe('lep_ssurgo');
    expect(con(5.9)).toBeNull();
  });
});

describe('el aviso que sale a pantalla, que es para lo que existe el módulo', () => {
  const REPRESA = {
    hayClima: true, area_espejo_m2: 2_000, cuenca_ha: 12,
    cuencaCalculada: true, infiltracion_mm_dia: 3, grupo: 'D' as const,
  };

  it('sin suelo expansivo no hay aviso: el ruido también es un error', () => {
    const c = confianzaRepresa(REPRESA);
    expect(c.avisos.map(a => a.id)).not.toContain('suelo_expansivo');
  });

  it('con uno medido es alerta, y dice que el error va para arriba', () => {
    const exp = detectarSueloExpansivo(HEIDEN, { taxorder: 'Vertisols' })!;
    const a = confianzaRepresa({ ...REPRESA, expansivo: exp }).avisos
      .find(x => x.id === 'suelo_expansivo')!;
    expect(a.nivel).toBe('alerta');
    expect(a.titulo).toMatch(/sobreestimado/);
    // Los números medidos tienen que viajar: un aviso sin cifras no se discute.
    expect(a.detalle).toMatch(/7 a 11 %/);
    expect(a.detalle).toMatch(/16 a 17 %/);
    expect(a.detalle).toMatch(/32 %/);
    // Y lo que hay que hacer, que no es mirar un pozo de infiltración.
    expect(a.detalle).toMatch(/escurrimiento medido de una temporada/);
  });

  it('con uno inferido es aviso y no alerta', () => {
    const exp = detectarSueloExpansivo(PATANCHERU)!;
    const a = confianzaRepresa({ ...REPRESA, expansivo: exp }).avisos
      .find(x => x.id === 'suelo_expansivo')!;
    expect(a.nivel).toBe('aviso');
    expect(a.titulo).toMatch(/Puede ser/);
  });

  it('en Cuenca el aviso manda la desconfianza al lugar que le toca', () => {
    // Acá está el matiz que evita el aviso alarmista: para la tormenta de
    // diseño el grupo D está bien, porque un T10 cae con el perfil húmedo y las
    // grietas cerradas. Lo que está mal es el coeficiente ANUAL de la represa.
    const exp = detectarSueloExpansivo(GEZIRA)!;
    const a = confianzaCuenca({
      area_ha: 10, long_flujo_m: 300, cn: 80, precip_mm: 95,
      escurrimiento_mm: 40, precipDeClima: true, grupoDeSuelo: true,
      expandida: true, expansivo: exp,
    }).avisos.find(x => x.id === 'suelo_expansivo')!;
    expect(a.nivel).toBe('aviso');
    expect(a.detalle).toMatch(/este caudal pico no cambia/);
    expect(a.detalle).toMatch(/coeficiente ANUAL/);
    // Y la curva entera, porque un solo número de infiltración miente.
    expect(a.detalle).toMatch(/76 mm\/h/);
    expect(a.detalle).toMatch(/0,21/);
    expect(a.detalle).toMatch(/360/);
  });
});

describe('el número que el aviso está corrigiendo sigue donde estaba', () => {
  it('COEF_BASE_GRUPO no se tocó: 0,28 para D y el factor 1,15 del cultivo', () => {
    // Deliberado, y por eso hay un test: Garg et al. es un sitio, un clima y un
    // manejo. Si alguna vez se cambia esta tabla tiene que ser con rango de
    // validez declarado y un test contra el caso medido, y este test va a
    // fallar para que nadie lo haga de costado.
    expect(coefEscorrentiaAnual('D', 'pastura_regular')).toBeCloseTo(0.28, 2);
    expect(coefEscorrentiaAnual('D', 'cultivo_bueno')).toBeCloseTo(0.32, 2);
    expect(coefEscorrentiaAnual('D', 'barbecho')).toBeCloseTo(0.42, 2);
    // El alfisol arenoso, donde la tabla acierta: 15 % contra 16 a 17 % medido.
    expect(coefEscorrentiaAnual('B', 'cultivo_bueno')).toBeCloseTo(0.15, 2);
  });
});

describe('el aviso en las dos herramientas que empujan a retener', () => {
  /**
   * Swales y Líneas clave son las que deciden QUÉ OBRA se hace, y hasta el
   * 12/11/2026 no sabían nada de esto: el aviso salía en Cuenca y en Represa,
   * que son las que calculan cuánta agua llega. Acá el error de no avisar es
   * peor que allá, porque termina en tierra movida.
   *
   * Lo que se verifica es que los dos avisos digan las tres cosas que tienen
   * que decir —el número de este panel no describe a este suelo, qué obra
   * publica la bibliografía, y qué dato lo decide— y que no se pasen de ahí:
   * el piso del estándar sigue donde estaba.
   */
  const MEDIDO  = detectarSueloExpansivo(HEIDEN, { taxorder: 'Vertisols' })!;
  const POSIBLE = detectarSueloExpansivo(PATANCHERU)!;

  it('sin diagnóstico no hay aviso, en ninguna de las dos', () => {
    expect(avisoSwalesExpansivo({})).toBeNull();
    expect(avisoSwalesExpansivo({ expansivo: null, ksat_mm_h: 1.2 })).toBeNull();
    expect(avisoKeylineExpansivo({})).toBeNull();
    expect(avisoKeylineExpansivo({ expansivo: null, banda: { min_pct: 0.2, max_pct: 2 } })).toBeNull();
  });

  it('medido es alerta e inferido es aviso, igual que en Represa', () => {
    expect(avisoSwalesExpansivo({ expansivo: MEDIDO })!.nivel).toBe('alerta');
    expect(avisoSwalesExpansivo({ expansivo: POSIBLE })!.nivel).toBe('aviso');
    expect(avisoKeylineExpansivo({ expansivo: MEDIDO })!.nivel).toBe('alerta');
    expect(avisoKeylineExpansivo({ expansivo: POSIBLE })!.nivel).toBe('aviso');
    // El inferido nunca afirma. Es el falso positivo de Pergamino.
    expect(avisoSwalesExpansivo({ expansivo: POSIBLE })!.titulo).toMatch(/^Puede ser/);
    expect(avisoKeylineExpansivo({ expansivo: POSIBLE })!.titulo).toMatch(/^Puede ser/);
  });

  it('el swale: pone el vaciado entre los dos valores medidos', () => {
    // Con 2 mm/h de perfil, la misma zanja se vacía 76/2 = 38 veces más rápido
    // recién agrietada y 2/0,21 = 9,5 veces más lento sellada. La cuenta vale
    // porque el vaciado es inversamente proporcional al Ksat para una misma
    // sección: el Ksat es el único factor fuera del corchete de la integral.
    const a = avisoSwalesExpansivo({ expansivo: MEDIDO, ksat_mm_h: 2 })!;
    expect(a.detalle).toMatch(/2 mm\/h/);
    expect(a.detalle).toMatch(/38 veces más rápido/);
    expect(a.detalle).toMatch(/9,5 veces más lento/);
    expect(a.detalle).toMatch(/factor 360/);
    expect(a.detalle).toMatch(/no es ninguno de los dos/);
  });

  it('el swale: sin Ksat no inventa la comparación, la pide', () => {
    const a = avisoSwalesExpansivo({ expansivo: MEDIDO })!;
    expect(a.detalle).toMatch(/factor 360/);
    expect(a.detalle).not.toMatch(/veces más rápido/);
    expect(a.detalle).toMatch(/Cargá el suelo/);
  });

  it('el swale: dice qué obra se publica y cuál es el dato que decide', () => {
    const a = avisoSwalesExpansivo({ expansivo: MEDIDO, ksat_mm_h: 1 })!;
    // El camellón del ICRISAT, con su pendiente publicada y su propósito.
    expect(a.detalle).toMatch(/camellón/);
    expect(a.detalle).toMatch(/0,4 y 0,8 %/);
    expect(a.detalle).toMatch(/cauces\s+empastados|cauces empastados/);
    // El límite honesto del altiplano etíope: sin exceso no hay ventaja.
    expect(a.detalle).toMatch(/año seco del ensayo no hubo diferencia/);
    // Y los años secos de Patancheru, que es cuando no hay nada que juntar.
    expect(a.detalle).toMatch(/menos de 500 mm/);
    expect(a.detalle).toMatch(/escurrimiento medido de una temporada/);
    // La cautela del diagnóstico viaja siempre: el aviso no es una certeza.
    expect(a.detalle).toContain(MEDIDO.cautela);
  });

  it('las líneas clave: la geometría no es el problema y lo dice', () => {
    const a = avisoKeylineExpansivo({ expansivo: MEDIDO })!;
    expect(a.detalle).toMatch(/mueve el agua con una deriva/);
    expect(a.detalle).toMatch(/geometría no es el problema/);
    // El piso del estándar, contra la pendiente publicada para este suelo.
    expect(a.detalle).toMatch(/0,2 %/);
    expect(a.detalle).toMatch(/0,4 y 0,8 %/);
    expect(a.detalle).toMatch(/dos a cuatro veces/);
  });

  it('las líneas clave: compara el techo de la banda contra el diseño', () => {
    // Terreno de 0,5 %: el techo es 0,25 % y no llega ni al piso de 0,4 %.
    const chato = avisoKeylineExpansivo({
      expansivo: MEDIDO, banda: { min_pct: 0.2, max_pct: 0.25 },
    })!;
    expect(chato.detalle).toMatch(/techo de la banda es 0,25 %/);
    expect(chato.detalle).toMatch(/1,6 %/);
    expect(chato.detalle).toMatch(/desagüe de parcela/);

    // Terreno de 1,2 %: el techo es 0,60 % y entra en la mitad baja.
    const justo = avisoKeylineExpansivo({
      expansivo: MEDIDO, banda: { min_pct: 0.2, max_pct: 0.6 },
    })!;
    expect(justo.detalle).toMatch(/mitad\s+baja de la banda publicada|mitad baja/);
    expect(justo.detalle).toMatch(/sin margen/);

    // Terreno de 6 %: el techo es 3 % y la banda publicada entra entera.
    const sobra = avisoKeylineExpansivo({
      expansivo: MEDIDO, banda: { min_pct: 0.2, max_pct: 3 },
    })!;
    expect(sobra.detalle).toMatch(/entra entera/);
    expect(sobra.detalle).toMatch(/no al piso de 0,2 %/);
  });

  it('las líneas clave: sin patrón todavía, dice qué pendiente hace falta', () => {
    const a = avisoKeylineExpansivo({ expansivo: MEDIDO, banda: null })!;
    expect(a.detalle).toMatch(/la mitad de la pendiente del terreno/);
    expect(a.detalle).toMatch(/1,6 %/);
    expect(a.detalle).toMatch(/Generá el patrón/);
  });

  it('las líneas clave: el arado va con su límite declarado', () => {
    const a = avisoKeylineExpansivo({ expansivo: MEDIDO })!;
    expect(a.detalle).toMatch(/arado de cincel/);
    // Esto no es una medición y el aviso lo dice, que es la mitad del valor.
    expect(a.detalle).toMatch(/no se\s+encontraron publicados|no se encontraron publicados/);
    expect(a.detalle).toMatch(/ni descartar/);
  });

  it('los dos números publicados son los de la fuente, no estimados acá', () => {
    // Swindale 1988: «laid out on a gradual slope (usually 0.4-0.8%)».
    expect(BBF_SURCO_MIN_PCT).toBe(0.4);
    expect(BBF_SURCO_MAX_PCT).toBe(0.8);
    // Virmani y Swindale 1984, los dos extremos de la misma curva.
    expect(INFIL_AGRIETADO_MM_H).toBe(76);
    expect(INFIL_SELLADO_MM_H).toBe(0.21);
    expect(INFIL_AGRIETADO_MM_H / INFIL_SELLADO_MM_H).toBeCloseTo(362, 0);
  });

  it('y el piso del estándar sigue donde estaba', () => {
    // Deliberado, y por eso hay un test. La banda de Patancheru es de un
    // sistema de cultivo de la India semiárida y sus propios autores piden
    // investigar todavía la pendiente óptima: no reemplaza al criterio
    // general del NRCS, lo matiza en el aviso.
    expect(DERIVA_MIN_DRENAJE_PCT).toBe(0.2);
    expect(DERIVA_MAX_PCT).toBe(4);
    expect(DERIVA_MAX_FRACCION_PENDIENTE).toBe(0.5);
    expect(GRUPOS_QUE_ENCHARCAN).toContain('D');
    // Y la banda de un suelo D sigue saliendo con el piso del estándar.
    expect(bandaDeriva({ pendienteTerreno_pct: 4, grupoHidro: 'D' }).min_pct).toBe(0.2);
  });
});
