/**
 * La compuerta del corte, y las tres mediciones que la justifican.
 *
 * Tres clases de prueba:
 *
 * 1. **Que las constantes sean lo que las fuentes publican.** Los repartos corte
 *    por corte, los seis algoritmos de Rawlik, el par del Delta. Si alguien
 *    toquetea un número de esos, el test lo encuentra.
 * 2. **Que la compuerta rechace cada cosecha que no es la magnitud del modelo**,
 *    y que acepte la que sí es, con la dirección del error de cada degradación.
 * 3. **Las tres mediciones de la cadena completa**: la elasticidad del `Yp` a la
 *    escala de `Eo`, el ancho de la banda que deja el agua inicial, y cuánto
 *    mueve el índice usar la serie dekadal. Las tres están escritas en el módulo
 *    como constantes, y acá se vuelven a calcular: la constante es el resultado
 *    de la medición y no una afirmación aparte.
 */
import { describe, it, expect } from 'vitest';
import {
  UN_CORTE_NO_ES_LA_TEMPORADA, LA_SUMA_NO_ES_EL_PICO, TOTAL_CONTRA_FORRAJERA,
  EL_PICO_NO_ES_LA_PRODUCCION_ANUAL,
  ETO_NO_ES_EO, EL_AGUA_INICIAL_NO_SE_OLVIDA, LA_SERIE_DEKADAL_NO_ALCANZA,
  kgHaDeAro, kgHaDeVariosAros, evaluarCorte, sesgoNeto,
  aguaUtilEnTresCapas, capasDe90, ventanaDeBalance, eoDelDia, sembrarPerfil,
  ypDelCorte, forrajeDelAnio,
  type CorteDeclarado, type DiaDeSerie,
} from '@/lib/forrajeCorte';
import {
  coeficientesEo, eoJensenHaiseMm, AVISO_EO_JENSEN_HAISE,
} from '@/lib/eoJensenHaise';
import { correrBalanceForraje, type DiaDeBalance } from '@/lib/forrajeBalance';
import { actividadRadicular, AVISO_ACTIVIDAD_RADICULAR } from '@/lib/actividadRadicular';
import { FORRAJE_MEDIDO } from '@/lib/forrajeMedido';

// ─── Lo que hace falta para medir ────────────────────────────────────────────

/** LCG determinista: la serie de prueba tiene que ser la misma siempre. */
function lcg(semilla: number): () => number {
  let s = semilla >>> 0;
  return () => { s = (1664525 * s + 1013904223) >>> 0; return s / 4294967296; };
}

/**
 * `n` días de lluvia en eventos —uno cada cinco días, de tamaño exponencial—
 * escalada a `total` mm, con `Eo` constante.
 *
 * No pretende ser el clima de ningún lugar: es una serie con la estructura que
 * el modelo necesita —eventos separados por días secos, que es lo que hace
 * trabajar a la ecuación 6— y con los totales de la pradera mixta donde Wight y
 * Hanks calibraron.
 */
function serieDePrueba(semilla: number, n: number, total_mm: number, eo_mm: number): DiaDeBalance[] {
  const r = lcg(semilla);
  const crudos: number[] = [];
  for (let i = 0; i < n; i += 1) crudos.push(r() < 0.2 ? -Math.log(1 - r()) : 0);
  const suma = crudos.reduce((a, b) => a + b, 0);
  const k = suma > 0 ? total_mm / suma : 0;
  return crudos.map(c => ({ pptn_mm: (c ?? 0) * k, eo_mm }));
}

/** La temporada de 90 días con la `Eo` modulada, que es la de las mediciones. */
function temporada(total_mm: number): DiaDeBalance[] {
  const base = serieDePrueba(7, 90, total_mm, 0);
  return base.map((d, i) => ({ ...d, eo_mm: 3.8 + 0.4 * Math.sin((i / 90) * Math.PI) }));
}

/** 150 mm de agua útil repartidos en las tres capas de 30 cm. */
const AW = [50, 50, 50];

/** Un corte que la compuerta acepta sin una sola advertencia. */
const CORTE_LIMPIO: CorteDeclarado = {
  rendimiento_kg_ha: 1200,
  cuando: 'madurez_de_las_gramineas',
  cortes_en_la_temporada: 1,
  informa: { es: 'un_corte', orden: 1 },
  que_se_corto: 'todo_lo_herbaceo',
  peso: 'estufa',
  remanente_cm: 0,
  que_habia: 'pastizal_natural',
  insumos: 'secano',
};

// ─── 1. Las constantes contra lo que publican las fuentes ────────────────────

describe('un corte no es la temporada', () => {
  it('los repartos suman el total que publica cada fuente', () => {
    const avena = UN_CORTE_NO_ES_LA_TEMPORADA.avena_marcos_juarez;
    const alfalfa = UN_CORTE_NO_ES_LA_TEMPORADA.alfalfa_curaco;
    expect(avena.reparto_kg_ha).toHaveLength(avena.cortes);
    expect(alfalfa.reparto_kg_ha).toHaveLength(alfalfa.cortes);
    expect(avena.reparto_kg_ha.reduce((a, b) => a + b, 0)).toBe(avena.total_kg_ha);
    expect(alfalfa.reparto_kg_ha.reduce((a, b) => a + b, 0)).toBe(alfalfa.total_kg_ha);
  });

  it('el corte más grande es el 30 % de la temporada en las dos', () => {
    for (const m of [UN_CORTE_NO_ES_LA_TEMPORADA.avena_marcos_juarez,
                     UN_CORTE_NO_ES_LA_TEMPORADA.alfalfa_curaco]) {
      const mayor = Math.max(...m.reparto_kg_ha);
      expect(mayor / m.total_kg_ha).toBeCloseTo(m.mayor_sobre_total, 3);
      expect(mayor / m.total_kg_ha).toBeGreaterThanOrEqual(UN_CORTE_NO_ES_LA_TEMPORADA.mayor_sobre_total.minimo - 0.001);
      expect(mayor / m.total_kg_ha).toBeLessThanOrEqual(UN_CORTE_NO_ES_LA_TEMPORADA.mayor_sobre_total.maximo + 0.001);
    }
  });

  it('los totales coinciden con las entradas montadas del catálogo', () => {
    // Las dos entradas publican el promedio de cultivares, y el reparto que está
    // acá es el promedio corte por corte: tienen que cerrar entre sí.
    const avena = FORRAJE_MEDIDO.find(m => m.sitio.includes('Marcos Juárez'));
    const alfalfa = FORRAJE_MEDIDO.find(m => m.sitio.includes('Curacó'));
    expect(avena).toBeDefined();
    expect(alfalfa).toBeDefined();
    const tipicoAvena = avena!.kg_ms_ha_anio_tipico;
    const tipicoAlfalfa = alfalfa!.kg_ms_ha_anio_tipico;
    // Las dos entradas publican el típico; si alguna pasara a `null` este test
    // tiene que fallar acá y no comparar contra cero.
    expect(tipicoAvena).not.toBeNull();
    expect(tipicoAlfalfa).not.toBeNull();
    expect(UN_CORTE_NO_ES_LA_TEMPORADA.avena_marcos_juarez.total_kg_ha)
      .toBeCloseTo(tipicoAvena as number, -1);
    expect(UN_CORTE_NO_ES_LA_TEMPORADA.alfalfa_curaco.total_kg_ha)
      .toBeCloseTo(tipicoAlfalfa as number, -1);
  });
});

describe('la suma no es el pico', () => {
  it('los cocientes de Rawlik salen de las dos temporadas publicadas', () => {
    const { metodo_1_pico, metodo_2_suma_de_incrementos, metodo_6_el_mas_alto,
            suma_sobre_pico, mayor_sobre_pico } = LA_SUMA_NO_ES_EL_PICO;
    for (let i = 0; i < 2; i += 1) {
      expect(metodo_2_suma_de_incrementos[i]! / metodo_1_pico[i]!).toBeCloseTo(suma_sobre_pico[i]!, 3);
      expect(metodo_6_el_mas_alto[i]! / metodo_1_pico[i]!).toBeCloseTo(mayor_sobre_pico[i]!, 3);
    }
  });

  it('el pico es el más bajo de los tres, que es la dirección del error', () => {
    const { metodo_1_pico, metodo_2_suma_de_incrementos, metodo_6_el_mas_alto } = LA_SUMA_NO_ES_EL_PICO;
    for (let i = 0; i < 2; i += 1) {
      expect(metodo_1_pico[i]!).toBeLessThan(metodo_2_suma_de_incrementos[i]!);
      expect(metodo_2_suma_de_incrementos[i]!).toBeLessThan(metodo_6_el_mas_alto[i]!);
    }
  });
});

describe('el pico no es la produccion anual', () => {
  it('la fraccion publicada es la que dice la cita, y la cita no se tocó', () => {
    const { cita, fraccion } = EL_PICO_NO_ES_LA_PRODUCCION_ANUAL;
    expect(cita).toContain('25-35');
    expect(fraccion.minima).toBeCloseTo(0.25, 6);
    expect(fraccion.maxima).toBeCloseTo(0.35, 6);
    expect(fraccion.minima).toBeLessThan(fraccion.maxima);
  });

  it('dice por qué no se corrige, y nombra la cadena que pide materia en pie', () => {
    const m = EL_PICO_NO_ES_LA_PRODUCCION_ANUAL;
    expect(m.por_que_no_se_corrige).toMatch(/bandaUso/);
    expect(m.y_del_otro_lado).toMatch(/Yp/);
    expect(m.fuente).toMatch(/CIFOR/);
  });

  it('la compuerta sigue aceptando el pico y no la producción anual', () => {
    // El cerco es de tipo: `base` tiene un solo valor admitido. Esta prueba fija
    // que ese valor sea el pico, que es lo que el despeje espera.
    const r = evaluarCorte(CORTE_LIMPIO);
    expect(r.sirve).toBe(true);
    if (!r.sirve) return;
    expect(r.base).toBe('pico_de_materia_en_pie_herbacea');
  });
});

describe('el total contra la forrajera', () => {
  it('el cociente del Delta sale de la misma cosecha', () => {
    const { herbacea_total_kg_ha, forrajera_kg_ha, cociente } = TOTAL_CONTRA_FORRAJERA;
    expect(herbacea_total_kg_ha / forrajera_kg_ha).toBeCloseTo(cociente, 2);
  });
});

// ─── 2. Las unidades del campo ───────────────────────────────────────────────

describe('las unidades del campo', () => {
  it('un aro de 0,25 m² con 60 g secos da 2.400 kg/ha', () => {
    expect(kgHaDeAro(60, 0.25)).toBeCloseTo(2400, 6);
  });

  it('un aro de 1 m² con 100 g da 1.000 kg/ha', () => {
    expect(kgHaDeAro(100, 1)).toBeCloseTo(1000, 6);
  });

  it('área cero o gramos negativos no son cero kilos: no son medición', () => {
    expect(kgHaDeAro(60, 0)).toBeNull();
    expect(kgHaDeAro(60, -0.25)).toBeNull();
    expect(kgHaDeAro(-1, 0.25)).toBeNull();
    expect(kgHaDeAro(Number.NaN, 0.25)).toBeNull();
  });

  it('promedia densidades y no gramos, así aros de distinto tamaño pesan lo que les toca', () => {
    // 60 g en 0,25 m² son 2.400 kg/ha; 240 g en 1 m² son 2.400 kg/ha. La media
    // tiene que dar 2.400, no el promedio de los gramos sobre el área media.
    const r = kgHaDeVariosAros([
      { gramos_secos: 60, area_m2: 0.25 },
      { gramos_secos: 240, area_m2: 1 },
    ]);
    expect(r).not.toBeNull();
    expect(r!.kg_ha).toBeCloseTo(2400, 6);
    expect(r!.desvio_kg_ha).toBeCloseTo(0, 6);
    expect(r!.aros).toBe(2);
  });

  it('cuenta los aros descartados en vez de hacerlos desaparecer', () => {
    const r = kgHaDeVariosAros([
      { gramos_secos: 60, area_m2: 0.25 },
      { gramos_secos: 60, area_m2: 0 },
    ]);
    expect(r!.aros).toBe(1);
    expect(r!.descartados).toBe(1);
  });

  it('sin ningún aro válido devuelve null', () => {
    expect(kgHaDeVariosAros([])).toBeNull();
    expect(kgHaDeVariosAros([{ gramos_secos: 10, area_m2: 0 }])).toBeNull();
  });
});

// ─── 3. La compuerta ─────────────────────────────────────────────────────────

describe('la compuerta acepta lo que el modelo midió', () => {
  it('un corte limpio pasa sin una sola advertencia', () => {
    const r = evaluarCorte(CORTE_LIMPIO);
    expect(r.sirve).toBe(true);
    if (!r.sirve) return;
    expect(r.avisos).toHaveLength(0);
    expect(r.sesgo).toBe('ninguno');
    expect(r.base).toBe('pico_de_materia_en_pie_herbacea');
    expect(r.rendimiento_kg_ha).toBe(1200);
  });

  it('cuando se cortó una sola vez, «la suma de la temporada» es ese corte', () => {
    const r = evaluarCorte({
      ...CORTE_LIMPIO, cortes_en_la_temporada: 1, informa: { es: 'la_suma_de_la_temporada' },
    });
    expect(r.sirve).toBe(true);
  });
});

describe('la compuerta rechaza, y dice qué medir', () => {
  const rechazo = (c: Partial<CorteDeclarado>) => {
    const r = evaluarCorte({ ...CORTE_LIMPIO, ...c });
    expect(r.sirve).toBe(false);
    if (r.sirve) throw new Error('debería haber rechazado');
    return r.rechazos;
  };

  it('el peso verde, porque no hay factor y sí hay una salida barata', () => {
    const m = rechazo({ peso: 'verde' });
    expect(m.map(x => x.motivo)).toContain('peso_verde');
    expect(m[0]!.que_medir).toMatch(/secala|secar/i);
  });

  it('la suma de varios cortes, nombrando que el Yp saldría alto', () => {
    const m = rechazo({ cortes_en_la_temporada: 4, informa: { es: 'la_suma_de_la_temporada' } });
    expect(m.map(x => x.motivo)).toContain('suma_de_varios_cortes');
    expect(m.find(x => x.motivo === 'suma_de_varios_cortes')!.por_que).toMatch(/alto/);
  });

  it('un corte de rebrote, aunque sea el más grande de la temporada', () => {
    const m = rechazo({ cortes_en_la_temporada: 4, informa: { es: 'un_corte', orden: 3 } });
    expect(m.map(x => x.motivo)).toContain('corte_de_rebrote');
  });

  it('el corte antes del pico, porque el error no se puede acotar', () => {
    expect(rechazo({ cuando: 'antes_del_pico' }).map(x => x.motivo)).toContain('antes_del_pico');
  });

  it('no saber cuándo se cortó, porque los dos errores van para lados distintos', () => {
    expect(rechazo({ cuando: 'no_se' }).map(x => x.motivo)).toContain('momento_desconocido');
  });

  it('las leñosas adentro del aro', () => {
    expect(rechazo({ que_se_corto: 'incluye_lenosas' }).map(x => x.motivo)).toContain('incluye_lenosas');
  });

  it('el riego, porque el balance diario sólo conoce la lluvia', () => {
    for (const insumos of ['riego', 'riego_y_fertilizado'] as const) {
      const m = rechazo({ insumos });
      expect(m.map(x => x.motivo)).toContain('riego_fuera_del_balance');
      expect(m.find(x => x.motivo === 'riego_fuera_del_balance')!.por_que).toMatch(/ALTO/);
    }
  });

  it('los insumos sin declarar, que no es lo mismo que declarar que no hubo', () => {
    expect(rechazo({ insumos: 'desconocido' }).map(x => x.motivo)).toContain('insumos_desconocidos');
  });

  it('un rendimiento que no es un número positivo', () => {
    for (const rendimiento_kg_ha of [0, -100, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(rechazo({ rendimiento_kg_ha }).map(x => x.motivo)).toContain('rendimiento_no_valido');
    }
  });

  it('un orden de corte que no existe en la temporada declarada', () => {
    expect(rechazo({ cortes_en_la_temporada: 2, informa: { es: 'un_corte', orden: 5 } })
      .map(x => x.motivo)).toContain('cortes_inconsistentes');
    expect(rechazo({ cortes_en_la_temporada: 0, informa: { es: 'un_corte', orden: 1 } })
      .map(x => x.motivo)).toContain('cortes_inconsistentes');
  });

  it('devuelve TODOS los motivos juntos, no el primero', () => {
    const m = rechazo({
      peso: 'verde', insumos: 'riego', cuando: 'no_se',
      cortes_en_la_temporada: 4, informa: { es: 'la_suma_de_la_temporada' },
    });
    expect(m.map(x => x.motivo).sort()).toEqual([
      'momento_desconocido', 'peso_verde', 'riego_fuera_del_balance', 'suma_de_varios_cortes',
    ]);
  });

  it('cada rechazo dice qué medir, sin excepción', () => {
    const todos = [
      { peso: 'verde' as const }, { cuando: 'antes_del_pico' as const },
      { cuando: 'no_se' as const }, { que_se_corto: 'incluye_lenosas' as const },
      { insumos: 'riego' as const }, { insumos: 'desconocido' as const },
      { rendimiento_kg_ha: 0 },
      { cortes_en_la_temporada: 3, informa: { es: 'un_corte' as const, orden: 2 } },
      { cortes_en_la_temporada: 3, informa: { es: 'la_suma_de_la_temporada' as const } },
    ];
    for (const caso of todos) {
      for (const m of rechazo(caso)) {
        expect(m.que_medir.length).toBeGreaterThan(20);
        expect(m.por_que.length).toBeGreaterThan(20);
      }
    }
  });
});

describe('la compuerta avisa, y nombra la dirección', () => {
  const avisos = (c: Partial<CorteDeclarado>) => {
    const r = evaluarCorte({ ...CORTE_LIMPIO, ...c });
    expect(r.sirve).toBe(true);
    if (!r.sirve) throw new Error('debería haber aceptado');
    return r;
  };

  it('el peso seco al aire empuja el Yp para arriba', () => {
    const r = avisos({ peso: 'aire_seco' });
    expect(r.sesgo).toBe('alto');
    expect(r.avisos[0]!.aviso).toMatch(/ALTO/);
  });

  it('el corte después de la senescencia lo empuja para abajo', () => {
    expect(avisos({ cuando: 'despues_de_la_senescencia' }).sesgo).toBe('bajo');
  });

  it('cortar sólo las forrajeras lo empuja para abajo, y no hay que descontar dos veces', () => {
    const r = avisos({ que_se_corto: 'solo_las_forrajeras' });
    expect(r.sesgo).toBe('bajo');
    expect(r.avisos[0]!.aviso).toMatch(/bandaUso/);
  });

  it('el remanente en pie lo empuja para abajo, y dice cuántos centímetros', () => {
    const r = avisos({ remanente_cm: 7 });
    expect(r.sesgo).toBe('bajo');
    expect(r.avisos[0]!.aviso).toMatch(/7 cm/);
  });

  it('el fertilizado avisa que el Yp es de ese paño con esa fertilización', () => {
    const r = avisos({ insumos: 'fertilizado' });
    expect(r.sesgo).toBe('desconocido');
    expect(r.avisos[0]!.aviso).toMatch(/trasladar/);
  });

  it('una pastura sembrada avisa que el b y el c del balance son de pradera nativa', () => {
    for (const que_habia of ['pastura_sembrada', 'verdeo_anual'] as const) {
      const r = avisos({ que_habia });
      expect(r.avisos.some(a => /b del dosel|umbral c/.test(a.aviso))).toBe(true);
    }
  });

  it('dos direcciones opuestas dan sesgo «ambos», que es lo que hay que decir', () => {
    const r = avisos({ peso: 'aire_seco', remanente_cm: 5 });
    expect(r.sesgo).toBe('ambos');
    expect(r.avisos).toHaveLength(2);
  });

  it('sin avisos el sesgo es «ninguno», no «desconocido»', () => {
    expect(sesgoNeto([])).toBe('ninguno');
  });
});

// ─── 4. Del perfil de suelo a las tres capas ─────────────────────────────────

describe('el agua útil en las tres capas del modelo', () => {
  /** Las seis capas de SoilGrids, con 25 mm de agua útil cada 10 cm. */
  const perfilParejo = [
    { prof_top: 0, prof_bot: 5, awc_mm: 12.5 },
    { prof_top: 5, prof_bot: 15, awc_mm: 25 },
    { prof_top: 15, prof_bot: 30, awc_mm: 37.5 },
    { prof_top: 30, prof_bot: 60, awc_mm: 75 },
    { prof_top: 60, prof_bot: 100, awc_mm: 100 },
    { prof_top: 100, prof_bot: 200, awc_mm: 250 },
  ];

  it('un perfil parejo da tres capas iguales de 75 mm', () => {
    const r = aguaUtilEnTresCapas(perfilParejo);
    expect(r).not.toBeNull();
    expect(r![0]).toBeCloseTo(75, 6);
    expect(r![1]).toBeCloseTo(75, 6);
    // La tercera toma 30 de los 40 cm de la capa 60-100: 100 × 30/40 = 75.
    expect(r![2]).toBeCloseTo(75, 6);
  });

  it('reparte por superposición de profundidad y no por capa entera', () => {
    // Toda el agua en la capa 60-100: la tercera del modelo tiene que tomar 3/4.
    const r = aguaUtilEnTresCapas([
      { prof_top: 0, prof_bot: 60, awc_mm: 0.0001 },
      { prof_top: 60, prof_bot: 100, awc_mm: 80 },
    ]);
    expect(r).not.toBeNull();
    expect(r![2]).toBeCloseTo(60, 6);
  });

  it('un perfil que no llega a 90 cm devuelve null en vez de un número corto', () => {
    expect(aguaUtilEnTresCapas(perfilParejo.slice(0, 4))).toBeNull();
    expect(aguaUtilEnTresCapas([])).toBeNull();
  });

  it('una capa sin agua útil devuelve null: el balance tampoco correría', () => {
    const r = aguaUtilEnTresCapas([
      { prof_top: 0, prof_bot: 30, awc_mm: 50 },
      { prof_top: 30, prof_bot: 60, awc_mm: 0 },
      { prof_top: 60, prof_bot: 90, awc_mm: 50 },
    ]);
    expect(r).toBeNull();
    expect(correrBalanceForraje({
      dias: temporada(200),
      capas: capasDe90([50, 0, 50], 0.5),
    })).toBeNull();
  });

  it('capasDe90 recorta la fracción a [0, 1] y arma los 30 cm', () => {
    const c = capasDe90([40, 50, 60], 2);
    expect(c.map(x => x.sws_inicial_mm)).toEqual([40, 50, 60]);
    expect(capasDe90([40, 50, 60], -1).map(x => x.sws_inicial_mm)).toEqual([0, 0, 0]);
    expect(c.every(x => x.espesor_cm === 30)).toBe(true);
  });

  it('el agua bajo el límite inferior va sólo en la capa superficial', () => {
    const c = capasDe90([40, 50, 60], 0.5, 8);
    expect(c[0]!.agua_bajo_el_limite_mm).toBe(8);
    expect(c[1]!.agua_bajo_el_limite_mm).toBeUndefined();
    expect(c[2]!.agua_bajo_el_limite_mm).toBeUndefined();
  });
});

// ─── 5. La ventana de la serie diaria ────────────────────────────────────────

describe('la ventana de la serie diaria', () => {
  const dia = (n: number, precip: number | null, et0: number | null): DiaDeSerie => ({
    fecha: `2026-04-${String(n).padStart(2, '0')}`, precip_mm: precip, et0_mm: et0,
  });
  const serie = Array.from({ length: 10 }, (_, i) => dia(i + 1, i, 4));

  it('corta la ventana inclusive en las dos puntas', () => {
    const v = ventanaDeBalance(serie, '2026-04-03', '2026-04-07');
    expect(v).not.toBeNull();
    expect(v!.dias).toHaveLength(5);
    expect(v!.dias[0]!.pptn_mm).toBe(2);
    expect(v!.dias[4]!.pptn_mm).toBe(6);
    expect(v!.desde).toBe('2026-04-03');
  });

  it('declara la sustitución de Eo por la ETo de referencia en cada ventana', () => {
    const v = ventanaDeBalance(serie, '2026-04-01', '2026-04-10');
    expect(v!.avisos).toHaveLength(1);
    expect(v!.avisos[0]!.aviso).toMatch(/FAO-56/);
    expect(ETO_NO_ES_EO.factor_aplicado).toBeNull();
  });

  it('un null de la serie no es un día sin lluvia: devuelve null', () => {
    const conHueco = serie.map((d, i) => (i === 4 ? dia(5, null, 4) : d));
    expect(ventanaDeBalance(conHueco, '2026-04-01', '2026-04-10')).toBeNull();
    // Y afuera de la ventana el hueco no molesta.
    expect(ventanaDeBalance(conHueco, '2026-04-06', '2026-04-10')).not.toBeNull();
  });

  it('un día que falta en el medio también devuelve null', () => {
    const sinUno = serie.filter(d => d.fecha !== '2026-04-05');
    expect(ventanaDeBalance(sinUno, '2026-04-01', '2026-04-10')).toBeNull();
  });

  it('una ventana dada vuelta o vacía devuelve null', () => {
    expect(ventanaDeBalance(serie, '2026-04-07', '2026-04-03')).toBeNull();
    expect(ventanaDeBalance(serie, '2026-05-01', '2026-05-10')).toBeNull();
  });
});

describe('la Eo de la ventana: el método del trabajo si se puede, la ETo si no', () => {
  const COEF = coeficientesEo({
    elevacion_m: 589, tmax_normal_c: 28.7, tmin_normal_c: 16.3, anios_de_las_normales: 30,
  })!;
  const dia = (n: number): DiaDeSerie => ({
    fecha: `2026-04-${String(n).padStart(2, '0')}`,
    precip_mm: 2, et0_mm: 5, rs_mj_m2: 22, t_max_c: 20, t_min_c: 6,
  });
  const serie = Array.from({ length: 10 }, (_, i) => dia(i + 1));

  it('con coeficientes usa Jensen-Haise, y el número no es el de la ETo', () => {
    const v = ventanaDeBalance(serie, '2026-04-01', '2026-04-10', COEF)!;
    const esperado = eoJensenHaiseMm(13, 22, COEF) as number;
    expect(v.dias[0]!.eo_mm).toBeCloseTo(esperado, 6);
    expect(v.dias[0]!.eo_mm).not.toBeCloseTo(5, 2);
  });

  it('sin coeficientes usa la ETo de la serie, como antes', () => {
    const v = ventanaDeBalance(serie, '2026-04-01', '2026-04-10')!;
    expect(v.dias[0]!.eo_mm).toBe(5);
  });

  it('el aviso cambia con el método, y el sesgo del Yp también', () => {
    const conEo = ventanaDeBalance(serie, '2026-04-01', '2026-04-10', COEF)!;
    expect(conEo.avisos[0]!.aviso).toMatch(/Jensen-Haise/);
    expect(conEo.avisos[0]!.sesgo).toBe(AVISO_EO_JENSEN_HAISE.sesgo_del_yp);
    const conEto = ventanaDeBalance(serie, '2026-04-01', '2026-04-10')!;
    expect(conEto.avisos[0]!.aviso).toMatch(/FAO-56/);
  });

  it('con coeficientes, un día sin radiación rechaza la ventana en vez de mezclar', () => {
    // Mezclar las dos Eo adentro de una ventana sería peor que no tener el día:
    // la escala cambia un 16 % entre una y otra.
    const conHueco = serie.map((d, i) => (i === 4 ? { ...d, rs_mj_m2: null } : d));
    expect(ventanaDeBalance(conHueco, '2026-04-01', '2026-04-10', COEF)).toBeNull();
    // Y sin coeficientes ese mismo día no molesta, porque la ETo está.
    expect(ventanaDeBalance(conHueco, '2026-04-01', '2026-04-10')).not.toBeNull();
  });

  it('lo mismo si falta una temperatura', () => {
    for (const campo of ['t_max_c', 't_min_c'] as const) {
      const roto = serie.map((d, i) => (i === 2 ? { ...d, [campo]: null } : d));
      expect(ventanaDeBalance(roto, '2026-04-01', '2026-04-10', COEF)).toBeNull();
    }
  });

  it('eoDelDia es la que decide, y devuelve la ETo cuando no hay coeficientes', () => {
    const d = dia(1);
    expect(eoDelDia(d)).toBe(5);
    expect(eoDelDia(d, null)).toBe(5);
    expect(eoDelDia(d, COEF)).toBeCloseTo(eoJensenHaiseMm(13, 22, COEF) as number, 6);
    expect(eoDelDia({ ...d, rs_mj_m2: null }, COEF)).toBeNull();
    // Sin coeficientes y sin ETo, null: no hay con qué.
    expect(eoDelDia({ ...d, et0_mm: null })).toBeNull();
  });

  it('la ETo quedó como respaldo declarado, con su costo medido', () => {
    expect(ETO_NO_ES_EO.es_el_respaldo).toBe(true);
    expect(ETO_NO_ES_EO.factor_aplicado).toBeNull();
    expect(ETO_NO_ES_EO.tp_reproducida_pct.con_la_eto)
      .toBeGreaterThan(9 * ETO_NO_ES_EO.tp_reproducida_pct.con_la_eo_del_modelo);
    expect(ETO_NO_ES_EO.por_que_no).toMatch(/el que viaja es el método/);
  });
});

// ─── 6. La cadena completa, y el caso resuelto de la aritmética ──────────────

describe('del corte al Yp', () => {
  it('con el agua inicial declarada, el Yp es exactamente Y·Tp/T del balance', () => {
    const dias = temporada(150);
    const res = correrBalanceForraje({ dias, capas: capasDe90(AW, 0.5) });
    expect(res).not.toBeNull();
    const esperado = 1200 * res!.tp_mm / res!.t_mm;

    const r = ypDelCorte({ corte: CORTE_LIMPIO, dias, aw_por_capa_mm: AW, fraccion_inicial: 0.5 });
    expect(r.yp_kg_ha).not.toBeNull();
    expect(r.yp_kg_ha!).toBeCloseTo(esperado, 6);
    expect(r.indice!).toBeCloseTo(res!.t_mm / res!.tp_mm, 9);
  });

  it('no corre el balance si la compuerta rechazó', () => {
    const r = ypDelCorte({
      corte: { ...CORTE_LIMPIO, peso: 'verde' },
      dias: temporada(150), aw_por_capa_mm: AW, fraccion_inicial: 0.5,
    });
    expect(r.yp_kg_ha).toBeNull();
    expect(r.banda_kg_ha).toBeNull();
    expect(r.rechazos.map(x => x.motivo)).toContain('peso_verde');
  });

  it('sin agua inicial declarada no hay número puntual, hay banda', () => {
    const r = ypDelCorte({ corte: CORTE_LIMPIO, dias: temporada(200), aw_por_capa_mm: AW });
    expect(r.yp_kg_ha).toBeNull();
    expect(r.banda_kg_ha).not.toBeNull();
    expect(r.avisos.some(a => /banda/.test(a.aviso))).toBe(true);
  });

  it('la punta conservadora de la banda es el perfil lleno, no el seco', () => {
    for (const total of [120, 200]) {
      const r = ypDelCorte({ corte: CORTE_LIMPIO, dias: temporada(total), aw_por_capa_mm: AW });
      expect(r.banda_kg_ha!.perfil_lleno).toBeLessThan(r.banda_kg_ha!.perfil_seco);
    }
  });

  it('arrastra las advertencias del balance y del despeje sin reescribirlas', () => {
    const r = ypDelCorte({ corte: CORTE_LIMPIO, dias: temporada(150), aw_por_capa_mm: AW, fraccion_inicial: 0.5 });
    expect(r.advertencias.some(a => /escurrimiento nulo/i.test(a))).toBe(true);
    expect(r.advertencias.some(a => /una sola temporada/i.test(a))).toBe(true);
  });

  it('el forraje del año es Yp por el índice, y no acepta un índice imposible', () => {
    expect(forrajeDelAnio(1300, 0.5)).toBeCloseTo(650, 9);
    expect(forrajeDelAnio(1300, 1)).toBeCloseTo(1300, 9);
    expect(forrajeDelAnio(1300, 1.01)).toBeNull();
    expect(forrajeDelAnio(1300, -0.1)).toBeNull();
    expect(forrajeDelAnio(-1, 0.5)).toBeNull();
    expect(forrajeDelAnio(1300, Number.NaN)).toBeNull();
  });
});

// ─── 7. Las tres mediciones que el módulo declara como constantes ────────────

describe('la sustitución de Eo no se cancela donde el modelo trabaja', () => {
  const ypConEoEscalada = (total_mm: number, factor: number): number => {
    const dias = temporada(total_mm).map(d => ({ ...d, eo_mm: d.eo_mm * factor }));
    const r = ypDelCorte({ corte: CORTE_LIMPIO, dias, aw_por_capa_mm: AW, fraccion_inicial: 0.5 });
    expect(r.yp_kg_ha).not.toBeNull();
    return r.yp_kg_ha!;
  };

  it('con el agua limitando, el Yp sigue a Eo casi uno a uno', () => {
    const base = ypConEoEscalada(120, 1);
    const elasticidades: number[] = [];
    for (const f of [0.7, 0.85, 1.15]) {
      const cociente = ypConEoEscalada(120, f) / base;
      elasticidades.push(Math.log(cociente) / Math.log(f));
    }
    const { minima, maxima } = ETO_NO_ES_EO.elasticidad_con_agua_limitando;
    for (const e of elasticidades) {
      expect(e).toBeGreaterThanOrEqual(minima - 0.02);
      expect(e).toBeLessThanOrEqual(maxima + 0.02);
    }
    // Y que no sea casualidad del redondeo: la media tiene que estar cerca de 1.
    const media = elasticidades.reduce((a, b) => a + b, 0) / elasticidades.length;
    expect(media).toBeGreaterThan(0.8);
    expect(media).toBeLessThan(1.2);
  });

  it('con el agua sin limitar se cancela del todo: el índice se pega a 1', () => {
    for (const f of [0.7, 0.85, 1, 1.15]) {
      expect(ypConEoEscalada(300, f)).toBeCloseTo(1200, 6);
    }
  });
});

describe('el agua inicial no se olvida en la temporada seca', () => {
  /** El ancho de la banda del `Yp` con `n` días de calentamiento. */
  const ancho = (total_mm: number, nPrevios: number): number => {
    const dias = temporada(total_mm);
    // El período previo: tasa de lluvia la mitad de la de la temporada y Eo baja,
    // que es lo que pasa fuera de la estación de crecimiento.
    const previos = nPrevios === 0
      ? []
      : serieDePrueba(31, nPrevios, (total_mm / 90) * nPrevios * 0.5, 1.5);
    const r = ypDelCorte({
      corte: CORTE_LIMPIO, dias, aw_por_capa_mm: AW,
      ...(nPrevios > 0 ? { dias_previos: previos } : {}),
    });
    expect(r.banda_kg_ha).not.toBeNull();
    return r.banda_kg_ha!.perfil_seco / r.banda_kg_ha!.perfil_lleno;
  };

  it('en la temporada húmeda el calentamiento la cierra del todo a los 180 días', () => {
    const m = EL_AGUA_INICIAL_NO_SE_OLVIDA.ancho_de_la_banda.humeda_200mm;
    expect(ancho(200, 0)).toBeCloseTo(m.sin_calentar, 2);
    expect(ancho(200, 60)).toBeCloseTo(m.d60, 2);
    expect(ancho(200, 120)).toBeCloseTo(m.d120, 2);
    expect(ancho(200, 180)).toBeCloseTo(m.d180, 3);
    expect(ancho(200, 270)).toBeCloseTo(m.d270, 3);
    // Que cierre de verdad: la punta seca y la llena dan el mismo Yp.
    expect(ancho(200, 180)).toBeCloseTo(1, 6);
  });

  it('en la temporada seca sigue casi tres veces ancha después de 270 días', () => {
    const m = EL_AGUA_INICIAL_NO_SE_OLVIDA.ancho_de_la_banda.seca_120mm;
    expect(ancho(120, 0)).toBeCloseTo(m.sin_calentar, 2);
    expect(ancho(120, 60)).toBeCloseTo(m.d60, 2);
    expect(ancho(120, 120)).toBeCloseTo(m.d120, 2);
    expect(ancho(120, 180)).toBeCloseTo(m.d180, 2);
    expect(ancho(120, 270)).toBeCloseTo(m.d270, 2);
    // Lo que importa no es el número: es que calentar no alcanza.
    expect(ancho(120, 270)).toBeGreaterThan(2);
  });

  it('en la seca el ancho no baja parejo: el calentamiento mueve el problema', () => {
    // A los 120 días baja y a los 180 vuelve a subir. Si el calentamiento
    // estuviera lavando la condición inicial, esto no podría pasar.
    expect(ancho(120, 180)).toBeGreaterThan(ancho(120, 120));
  });

  it('el calentamiento corre con la pastura dormida y lo declara', () => {
    expect(EL_AGUA_INICIAL_NO_SE_OLVIDA.b_del_calentamiento).toBe(0);
    const r = ypDelCorte({
      corte: CORTE_LIMPIO, dias: temporada(200), aw_por_capa_mm: AW,
      dias_previos: serieDePrueba(31, 120, 130, 1.5),
    });
    expect(r.avisos.some(a => /dormida/.test(a.aviso))).toBe(true);
  });

  it('sembrarPerfil nunca devuelve agua negativa y respeta el tope de cada capa', () => {
    const semilla = sembrarPerfil(serieDePrueba(31, 180, 300, 2), AW, 1);
    expect(semilla).not.toBeNull();
    semilla!.forEach((v, i) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(AW[i]! + 1e-9);
    });
    expect(sembrarPerfil([], AW, 1)).toBeNull();
  });
});

describe('la serie dekadal no reemplaza a la diaria', () => {
  const indice = (dias: DiaDeBalance[]): number => {
    const r = correrBalanceForraje({ dias, capas: capasDe90(AW, 0.5) });
    expect(r?.indice).not.toBeNull();
    return r!.indice!;
  };

  /** La misma temporada con la lluvia agrupada en décadas, de las dos formas. */
  const dekadal = (dias: DiaDeBalance[], como: 'golpe' | 'parejo'): DiaDeBalance[] => {
    const salida = dias.map(d => ({ ...d, pptn_mm: 0 }));
    for (let k = 0; k * 10 < dias.length; k += 1) {
      let suma = 0;
      for (let i = k * 10; i < Math.min(k * 10 + 10, dias.length); i += 1) suma += dias[i]?.pptn_mm ?? 0;
      if (como === 'golpe') {
        const primero = salida[k * 10];
        if (primero) primero.pptn_mm = suma;
      } else {
        for (let i = k * 10; i < Math.min(k * 10 + 10, dias.length); i += 1) {
          const d = salida[i];
          if (d) d.pptn_mm = suma / 10;
        }
      }
    }
    return salida;
  };

  it('en la temporada seca mueve el índice un 12 % arriba o un 18 % abajo según cómo se reparta', () => {
    const dias = temporada(120);
    const base = indice(dias);
    expect(base).toBeCloseTo(LA_SERIE_DEKADAL_NO_ALCANZA.indice_diario, 3);
    const golpe = indice(dekadal(dias, 'golpe'));
    const parejo = indice(dekadal(dias, 'parejo'));
    expect(golpe).toBeCloseTo(LA_SERIE_DEKADAL_NO_ALCANZA.indice_con_el_golpe_el_primer_dia, 3);
    expect(parejo).toBeCloseTo(LA_SERIE_DEKADAL_NO_ALCANZA.indice_con_reparto_parejo, 3);
    expect(golpe / base).toBeCloseTo(LA_SERIE_DEKADAL_NO_ALCANZA.cociente_golpe, 2);
    expect(parejo / base).toBeCloseTo(LA_SERIE_DEKADAL_NO_ALCANZA.cociente_parejo, 2);
    // Y el error va para los dos lados, que es lo que lo vuelve inservible.
    expect(golpe).toBeGreaterThan(base);
    expect(parejo).toBeLessThan(base);
  });

  it('en la temporada húmeda las tres dan lo mismo: la degradación aparece con el agua limitando', () => {
    const dias = temporada(300);
    expect(indice(dias)).toBeCloseTo(1, 4);
    expect(indice(dekadal(dias, 'golpe'))).toBeCloseTo(1, 4);
    expect(indice(dekadal(dias, 'parejo'))).toBeCloseTo(1, 4);
  });
});

describe('la ventana aplica el factor de actividad radicular si tiene temperatura de suelo', () => {
  const dia = (n: number, suelo?: number | null): DiaDeSerie => ({
    fecha: `2026-04-${String(n).padStart(2, '0')}`,
    precip_mm: 2, et0_mm: 5, rs_mj_m2: 22, t_max_c: 20, t_min_c: 6,
    ...(suelo === undefined ? {} : { t_suelo_30_90_c: suelo }),
  });
  const sinSuelo = Array.from({ length: 10 }, (_, i) => dia(i + 1));
  const conSuelo = Array.from({ length: 10 }, (_, i) => dia(i + 1, 8));

  it('con temperatura de suelo lo aplica, y lo dice', () => {
    const v = ventanaDeBalance(conSuelo, '2026-04-01', '2026-04-10')!;
    expect(v.actividad_radicular).toBe(true);
    expect(v.dias[0]!.actividad_radicular).toHaveLength(3);
    // La primera capa no lleva factor; las de abajo sí.
    expect(v.dias[0]!.actividad_radicular![0]).toBe(1);
    expect(v.dias[0]!.actividad_radicular![1]).toBeCloseTo(actividadRadicular(8) as number, 9);
  });

  it('sin temperatura de suelo no lo aplica, y también lo dice', () => {
    const v = ventanaDeBalance(sinSuelo, '2026-04-01', '2026-04-10')!;
    expect(v.actividad_radicular).toBe(false);
    expect(v.dias[0]!.actividad_radicular).toBeUndefined();
  });

  it('medio y medio rechaza la ventana, como con la Eo', () => {
    const mezcla = conSuelo.map((d, i) => (i === 3 ? { ...d, t_suelo_30_90_c: null } : d));
    expect(ventanaDeBalance(mezcla, '2026-04-01', '2026-04-10')).toBeNull();
  });

  it('el aviso del factor sale con la dirección del Yp, no la del índice', () => {
    const v = ventanaDeBalance(conSuelo, '2026-04-01', '2026-04-10')!;
    const aviso = v.avisos.find(a => /temperatura de suelo/.test(a.aviso));
    expect(aviso).toBeDefined();
    expect(aviso!.sesgo).toBe(AVISO_ACTIVIDAD_RADICULAR.sesgo_del_yp);
    expect(aviso!.sesgo).not.toBe(AVISO_ACTIVIDAD_RADICULAR.sesgo_del_indice);
  });
});
