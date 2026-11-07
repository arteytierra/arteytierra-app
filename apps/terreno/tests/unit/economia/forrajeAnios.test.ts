/**
 * El índice año por año, y las seis mediciones que lo acompañan.
 *
 * Tres clases de prueba, como en `forrajeCorte.test.ts`:
 *
 * 1. **Que cada constante sea consistente con la prosa que tiene arriba.** No
 *    alcanza con que el número exista: si el comentario dice que el `p10` se mueve
 *    más que la mediana, hay un test que lo verifica sobre la propia constante. Un
 *    hallazgo escrito en un comentario que nadie puede comprobar es una afirmación
 *    suelta, y acá ya pasó una vez.
 * 2. **Que las funciones rechacen lo que no pueden calcular.** Una serie con un
 *    hueco, una ventana fuera de la serie, el 29 de febrero, un `Yp` negativo.
 * 3. **Que la medición se pueda volver a hacer.** La cadena olvidando su arranque
 *    se vuelve a medir acá sobre una serie sintética determinista, independiente
 *    del archivo de Sidney: si el mecanismo se rompe, el test lo encuentra sin
 *    depender de ningún dato descargado.
 */
import { describe, it, expect } from 'vitest';
import {
  SITIO_DE_LA_MEDICION,
  LA_VENTANA_NO_SE_MUEVE_CON_EL_ANIO,
  LA_CADENA_OLVIDA_EL_ARRANQUE,
  LA_NIEVE_NO_SE_ACUMULA,
  EL_PROMEDIO_SOBREESTOCA,
  LA_LLUVIA_ANUAL_NO_PREDICE_EL_ANIO,
  EL_ANIO_SECO_LO_DECIDE_LA_EO,
  EL_ANIO_MAS_SECO_ES_EL_QUE_FUE,
  LA_DISTRIBUCION_ES_DEL_PASADO,
  AVISO_DE_LA_VENTANA,
  AVISO_DEL_ANIO_SECO,
  ventanasDeCadaAnio,
  indicesPorAnio,
  distribucion,
  indicesQueSirven,
  forrajePorAnio,
  frecuenciaDeAlcanzar,
  anioDelPercentil,
  type IndiceDeUnAnio,
} from '@/lib/forrajeAnios';
import { ADVERTENCIAS, EO_DIARIA_DE_LA_PRUEBA } from '@/lib/forrajeBalance';
import { type DiaDeSerie } from '@/lib/forrajeCorte';

// ─── La serie sintética con la que se vuelve a medir ─────────────────────────

/** LCG determinista: la serie de prueba tiene que ser la misma siempre. */
function lcg(semilla: number): () => number {
  let s = semilla >>> 0;
  return () => { s = (1664525 * s + 1013904223) >>> 0; return s / 4294967296; };
}

const UN_DIA = 86_400_000;

/**
 * Varios años de serie diaria continua, con `Eo` estacional y lluvia en eventos.
 *
 * No es el clima de ningún lugar: es una serie con la estructura que el modelo
 * necesita —eventos separados por días secos, que es lo que hace trabajar a la
 * ecuación 6— y con la `Eo` de la temporada dentro del rango de la Tabla 1 y la
 * del invierno muy por debajo, que es lo que hace falta para probar que el aviso
 * de la `Eo` se calcula sobre la temporada y no sobre la cadena entera.
 *
 * Cada año lleva su propio factor de lluvia, así que la distribución del índice
 * tiene ancho y los percentiles significan algo.
 */
function serieDeAnios(semilla: number, primer_anio: number, anios: number): DiaDeSerie[] {
  const r = lcg(semilla);
  const factores: number[] = [];
  for (let i = 0; i < anios; i += 1) factores.push(0.35 + 1.3 * r());

  const t0 = Date.parse(`${primer_anio}-01-01T00:00:00Z`);
  const tFin = Date.parse(`${primer_anio + anios}-01-01T00:00:00Z`);
  const salida: DiaDeSerie[] = [];
  for (let t = t0; t < tFin; t += UN_DIA) {
    const f = new Date(t);
    const anio = f.getUTCFullYear();
    const doy = Math.round((t - Date.parse(`${anio}-01-01T00:00:00Z`)) / UN_DIA);
    // `Eo` que pica a mitad de año: en la ventana de abril a julio cae en el
    // rango de la Tabla 1 y en enero queda cerca de cero.
    const eo = Math.max(0.3, 2.25 + 2.05 * Math.sin(((doy - 100) / 365) * 2 * Math.PI));
    const evento = r() < 0.2 ? -Math.log(1 - r()) : 0;
    const factor = factores[anio - primer_anio] ?? 1;
    salida.push({
      fecha: new Date(t).toISOString().slice(0, 10),
      precip_mm: evento * 3.2 * factor,
      et0_mm: eo,
    });
  }
  return salida;
}

/** 150 mm de agua útil repartidos en las tres capas de 30 cm. */
const AW = [50, 50, 50];

const SERIE = serieDeAnios(11, 1990, 25);
const VENTANAS = ventanasDeCadaAnio(1990, 2014, '04-15', 84)!;

function cadena(serie: readonly DiaDeSerie[] = SERIE) {
  const r = indicesPorAnio({ serie, ventanas: VENTANAS, aw_por_capa_mm: AW });
  expect(r).not.toBeNull();
  return r!;
}

// ─── 1. Las constantes contra su propia prosa ────────────────────────────────

describe('el sitio de la medición', () => {
  it('es el de la validación de Wight y Hanks, con la ventana del trabajo', () => {
    expect(SITIO_DE_LA_MEDICION.nombre).toMatch(/Sidney/);
    expect(SITIO_DE_LA_MEDICION.ventana.arranque).toBe('04-15');
    // 84 días es la mediana de los 68 a 99 de la prueba.
    expect(SITIO_DE_LA_MEDICION.ventana.dias).toBe(84);
    expect(SITIO_DE_LA_MEDICION.aw_por_capa_mm.reduce((a, b) => a + b, 0)).toBe(150);
  });
});

describe('la ventana no se mueve con el año', () => {
  it('el arranque del trabajo y el envolvente de días son los publicados', () => {
    const t = LA_VENTANA_NO_SE_MUEVE_CON_EL_ANIO.del_trabajo;
    expect(t.arranque).toBe('04-15');
    expect(t.dias_minimo).toBe(68);
    expect(t.dias_maximo).toBe(99);
    expect(t.dias_mediana).toBeGreaterThanOrEqual(t.dias_minimo);
    expect(t.dias_mediana).toBeLessThanOrEqual(t.dias_maximo);
  });

  it('la mediana y el p10 no se mueven igual: la ventana cambia la forma, no desplaza', () => {
    // Esto es lo que dicen los cuatro casos medidos, y NO lo que yo había escrito
    // antes de mirarlos: el p10 se mueve más cuando la ventana le da más agua
    // (−15 días de arranque, temporada más corta) y menos cuando se la quita.
    const c = LA_VENTANA_NO_SE_MUEVE_CON_EL_ANIO.cocientes;
    for (const caso of [c.arranque_menos_15, c.largo_68]) {
      expect(caso.mediana).toBeGreaterThan(1);
      expect(Math.abs(caso.p10 - 1)).toBeGreaterThan(Math.abs(caso.mediana - 1));
    }
    for (const caso of [c.arranque_mas_15, c.largo_99]) {
      expect(caso.mediana).toBeLessThan(1);
      expect(Math.abs(caso.p10 - 1)).toBeLessThan(Math.abs(caso.mediana - 1));
    }
    expect(LA_VENTANA_NO_SE_MUEVE_CON_EL_ANIO.no_desplaza_la_distribucion).toBe(true);
  });

  it('adelantar el arranque y acortar la temporada suben el índice; atrasarlo y alargarla lo bajan', () => {
    const c = LA_VENTANA_NO_SE_MUEVE_CON_EL_ANIO.cocientes;
    expect(c.arranque_menos_15.mediana).toBeGreaterThan(1);
    expect(c.largo_68.mediana).toBeGreaterThan(1);
    expect(c.arranque_mas_15.mediana).toBeLessThan(1);
    expect(c.largo_99.mediana).toBeLessThan(1);
  });
});

describe('la cadena olvida el arranque', () => {
  it('en Sidney la diferencia baja temporada a temporada hasta ser despreciable', () => {
    const d = LA_CADENA_OLVIDA_EL_ARRANQUE.en_sidney_pct;
    expect(d.t1).toBeGreaterThan(d.t2);
    expect(d.t2).toBeGreaterThan(d.t3);
    expect(d.t4_en_adelante_maximo).toBeLessThan(LA_CADENA_OLVIDA_EL_ARRANQUE.umbral_por_defecto_pct);
    expect(LA_CADENA_OLVIDA_EL_ARRANQUE.temporadas_en_sidney).toBe(3);
  });

  it('el tres de Sidney NO es del método: en un clima árido no alcanza', () => {
    // Éste es el hallazgo que corrigió el diseño. El número estaba clavado como
    // universal y la serie sintética del test mostró que no lo es.
    expect(LA_CADENA_OLVIDA_EL_ARRANQUE.en_una_serie_arida_pct.t4_en_adelante_maximo)
      .toBeGreaterThan(LA_CADENA_OLVIDA_EL_ARRANQUE.en_sidney_pct.t4_en_adelante_maximo);
    expect(LA_CADENA_OLVIDA_EL_ARRANQUE.no_se_clava).toBe(true);
    expect(LA_CADENA_OLVIDA_EL_ARRANQUE.por_que_no_se_clava).toMatch(/por corrida/);
  });
});

describe('la nieve no se acumula', () => {
  it('el sesgo del índice es bajo, que es lo que el motivo explica', () => {
    expect(LA_NIEVE_NO_SE_ACUMULA.sesgo_del_indice).toBe('bajo');
    expect(LA_NIEVE_NO_SE_ACUMULA.por_que).toMatch(/evapora/);
  });

  it('la fracción medida es la de los milímetros medidos', () => {
    const { total_mm, en_dias_bajo_cero_mm } = LA_NIEVE_NO_SE_ACUMULA.medido;
    expect(en_dias_bajo_cero_mm / total_mm * 100)
      .toBeCloseTo(LA_NIEVE_NO_SE_ACUMULA.fraccion_bajo_cero_pct, 0);
  });
});

describe('el promedio sobreestoca', () => {
  it('la cita y la fuente son las publicadas', () => {
    expect(EL_PROMEDIO_SOBREESTOCA.cita).toContain('overstocked');
    expect(EL_PROMEDIO_SOBREESTOCA.fuente).toMatch(/Texas A&M/);
    expect(EL_PROMEDIO_SOBREESTOCA.fuente).toMatch(/2001/);
  });

  it('el ancho es p90 sobre p10, y la cuenta cierra', () => {
    const m = EL_PROMEDIO_SOBREESTOCA.medido_en_sidney;
    expect(m.indice.p90 / m.indice.p10).toBeCloseTo(m.ancho, 1);
    expect(m.ancho).toBeGreaterThan(4);
  });

  it('los percentiles están ordenados y ninguno pasa de 1', () => {
    const i = EL_PROMEDIO_SOBREESTOCA.medido_en_sidney.indice;
    const orden = [i.minimo, i.p10, i.p25, i.mediana, i.p75, i.p90, i.maximo];
    for (let k = 1; k < orden.length; k += 1) {
      expect(orden[k]!).toBeGreaterThanOrEqual(orden[k - 1]!);
    }
    expect(i.maximo).toBeLessThanOrEqual(1);
  });

  it('el promedio queda por debajo de la mediana, que es por qué da 46,8 y no 50', () => {
    const m = EL_PROMEDIO_SOBREESTOCA.medido_en_sidney;
    expect(m.indice.promedio).toBeLessThan(m.indice.mediana);
    expect(m.fraccion_bajo_el_promedio_pct).toBeLessThan(50);
    expect(m.anios_bajo_el_promedio / m.anios * 100).toBeCloseTo(m.fraccion_bajo_el_promedio_pct, 0);
    expect(EL_PROMEDIO_SOBREESTOCA.por_que_no_da_50).toMatch(/no puede pasar de 1/);
  });

  it('no inventa un percentil para planificar: la decisión queda del usuario', () => {
    expect(EL_PROMEDIO_SOBREESTOCA.que_se_hace).toMatch(/no lo inventa/);
  });
});

describe('la lluvia anual no predice el año', () => {
  it('la lluvia de la temporada explica más que la del año, y ninguna alcanza', () => {
    const l = LA_LLUVIA_ANUAL_NO_PREDICE_EL_ANIO;
    expect(l.r2_contra_lluvia_de_la_temporada).toBeGreaterThan(l.r2_contra_lluvia_del_anio);
    expect(l.r2_contra_lluvia_del_anio).toBeLessThan(0.5);
    expect(l.r2_contra_lluvia_de_la_temporada).toBeLessThan(0.7);
  });

  it('el agua inicial medida recorre casi todo el perfil, que es lo que se lleva el resto', () => {
    const a = LA_LLUVIA_ANUAL_NO_PREDICE_EL_ANIO.agua_inicial_medida_mm;
    expect(a.minimo).toBeLessThan(5);
    expect(a.maximo).toBeGreaterThan(140);
  });
});

describe('el año seco lo decide la Eo', () => {
  it('la ETo de ERA5 lee alto contra la Eo de la Tabla 1, y el cociente cierra', () => {
    const e = EL_ANIO_SECO_LO_DECIDE_LA_EO;
    expect(e.eo_de_la_tabla_1_mm_dia.minimo).toBe(EO_DIARIA_DE_LA_PRUEBA.medido.minimo_mm);
    expect(e.eo_de_la_tabla_1_mm_dia.maximo).toBe(EO_DIARIA_DE_LA_PRUEBA.medido.maximo_mm);
    expect(e.eto_era5_mm_dia.media_62_anios / e.eo_de_la_tabla_1_mm_dia.media)
      .toBeCloseTo(e.cociente.sobre_62_anios, 2);
    expect(e.cociente.sobre_1968_1979).toBeGreaterThan(1);
  });

  it('NO cancela: el forraje del año seco se mueve más que el Yp solo', () => {
    // Éste es el hallazgo del lote y la razón de ser de la constante. Si alguien
    // vuelve a escribir que el cociente de dos índices cancela el error, falla.
    const c = EL_ANIO_SECO_LO_DECIDE_LA_EO.con_la_eo_14_pct_alta;
    expect(c.el_forraje_del_anio_pct.mediana).toBeGreaterThan(c.el_yp_solo_pct);
    expect(c.el_forraje_del_anio_pct.maximo).toBeGreaterThan(c.el_forraje_del_anio_pct.p90);
    expect(c.el_forraje_del_anio_pct.maximo).toBeGreaterThan(4 * c.el_yp_solo_pct);
    expect(EL_ANIO_SECO_LO_DECIDE_LA_EO.no_cancela).toBe(true);
  });

  it('el peor año de la amplificación es uno de los años secos del registro', () => {
    expect(EL_ANIO_MAS_SECO_ES_EL_QUE_FUE.los_cinco_peores)
      .toContain(EL_ANIO_SECO_LO_DECIDE_LA_EO.con_la_eo_14_pct_alta.el_forraje_del_anio_pct.peor_anio);
  });

  it('dice que las dos causas no se pueden separar sin leer Jensen-Haise', () => {
    expect(EL_ANIO_SECO_LO_DECIDE_LA_EO.no_se_pueden_separar).toMatch(/Jensen-Haise/);
    expect(EL_ANIO_SECO_LO_DECIDE_LA_EO.la_deuda).toMatch(/Jensen-Haise/);
  });
});

describe('el año más seco es el que fue', () => {
  it('es el primero de los 62 y el primero de los cinco peores', () => {
    const e = EL_ANIO_MAS_SECO_ES_EL_QUE_FUE;
    expect(e.puesto).toBe(1);
    expect(e.los_cinco_peores[0]).toBe(e.anio);
    expect(e.de).toBe(EL_PROMEDIO_SOBREESTOCA.medido_en_sidney.anios);
    expect(e.indice).toBeCloseTo(EL_PROMEDIO_SOBREESTOCA.medido_en_sidney.indice.minimo, 3);
  });

  it('ERA5 y la estación del sitio dicen lo mismo dentro de diez puntos', () => {
    const e = EL_ANIO_MAS_SECO_ES_EL_QUE_FUE;
    const estacion = e.estacion.abril_a_junio_pulgadas;
    expect(estacion.medido / estacion.promedio * 100).toBeCloseTo(estacion.fraccion_pct, 0);
    expect(e.era5_en_la_ventana.medido_mm / e.era5_en_la_ventana.media_mm * 100)
      .toBeCloseTo(e.era5_en_la_ventana.fraccion_pct, 0);
    expect(Math.abs(e.era5_en_la_ventana.fraccion_pct - estacion.fraccion_pct)).toBeLessThan(10);
  });

  it('el perfil llegó casi vacío a esa temporada, que es lo que explica un índice de 0,05', () => {
    const a = EL_ANIO_MAS_SECO_ES_EL_QUE_FUE.agua_inicial_del_perfil_mm;
    expect(a.ese_anio).toBeLessThan(a.promedio / 10);
    expect(a.tope).toBe(150);
  });

  it('no se presenta como validación: es un chequeo de una sola dirección', () => {
    expect(EL_ANIO_MAS_SECO_ES_EL_QUE_FUE.que_prueba).toMatch(/no valida/);
  });
});

describe('la distribución es del pasado', () => {
  it('la tendencia es chica y en la cola apunta al revés, que es por qué no se recorta', () => {
    const d = LA_DISTRIBUCION_ES_DEL_PASADO;
    expect(d.r2_de_la_tendencia).toBeLessThan(0.1);
    expect(d.pendiente_del_indice_por_decada).toBeLessThan(0);
    // La mediana bajó y el p10 subió: una pendiente sola no describe las dos.
    expect(d.mitades.segunda.mediana).toBeLessThan(d.mitades.primera.mediana);
    expect(d.mitades.segunda.p10).toBeGreaterThan(d.mitades.primera.p10);
  });
});

describe('los avisos', () => {
  it('los dos que salen siempre tienen sesgo desconocido y dicen qué está declarado', () => {
    expect(AVISO_DE_LA_VENTANA.sesgo).toBe('desconocido');
    expect(AVISO_DE_LA_VENTANA.aviso).toMatch(/declaración y no un dato/);
    expect(AVISO_DEL_ANIO_SECO.aviso).toMatch(/orden de magnitud/);
  });
});

// ─── 2. Que las funciones rechacen lo que no pueden calcular ─────────────────

describe('las ventanas de cada año', () => {
  it('una por año, con la fecha de cierre a los días declarados', () => {
    const v = ventanasDeCadaAnio(1990, 1992, '04-15', 84);
    expect(v).not.toBeNull();
    expect(v!.length).toBe(3);
    expect(v![0]).toEqual({ anio: 1990, desde: '1990-04-15', hasta: '1990-07-07' });
  });

  it('la ventana del hemisferio sur cruza el año, y el año es el del arranque', () => {
    const v = ventanasDeCadaAnio(2000, 2000, '10-15', 120);
    expect(v![0]!.anio).toBe(2000);
    expect(v![0]!.hasta).toBe('2001-02-11');
  });

  it('rechaza el 29 de febrero, que no existe en tres de cada cuatro años', () => {
    expect(ventanasDeCadaAnio(1990, 1995, '02-29', 84)).toBeNull();
  });

  it('rechaza una fecha que no existe en ningún año', () => {
    expect(ventanasDeCadaAnio(1990, 1995, '04-31', 84)).toBeNull();
    expect(ventanasDeCadaAnio(1990, 1995, '13-01', 84)).toBeNull();
    expect(ventanasDeCadaAnio(1990, 1995, 'abril', 84)).toBeNull();
  });

  it('rechaza un largo o una tira de años sin sentido', () => {
    expect(ventanasDeCadaAnio(1990, 1995, '04-15', 0)).toBeNull();
    expect(ventanasDeCadaAnio(1990, 1995, '04-15', 1.5)).toBeNull();
    expect(ventanasDeCadaAnio(1995, 1990, '04-15', 84)).toBeNull();
  });

  it('el 1 de marzo cae un día distinto según el año bisiesto, y la ventana lo respeta', () => {
    const v = ventanasDeCadaAnio(2000, 2001, '03-01', 10);
    expect(v![0]!.hasta).toBe('2000-03-10');
    expect(v![1]!.hasta).toBe('2001-03-10');
  });
});

describe('el índice de cada año', () => {
  it('devuelve un índice en [0,1] por temporada, y marca las tres primeras', () => {
    const r = cadena();
    expect(r.anios.length).toBe(25);
    // Cuántas se marcan lo decide la convergencia medida, no un número clavado.
    expect(r.anios_descartados).toBe(r.anios.filter(a => a.el_arranque_todavia_pesa).length);
    expect(r.anios_descartados).toBeGreaterThan(0);
    expect(r.anios[0]!.el_arranque_todavia_pesa).toBe(true);
    for (const a of r.anios) {
      expect(a.indice).not.toBeNull();
      expect(a.indice as number).toBeGreaterThanOrEqual(0);
      expect(a.indice as number).toBeLessThanOrEqual(1);
      expect(a.dias).toBe(84);
    }
  });

  it('rechaza una serie con un null: un hueco del reanálisis no es un día sin lluvia', () => {
    const roto = SERIE.map((d, i) => (i === 500 ? { ...d, precip_mm: null } : d));
    expect(indicesPorAnio({ serie: roto, ventanas: VENTANAS, aw_por_capa_mm: AW })).toBeNull();
  });

  it('rechaza una serie con un día faltante o desordenada', () => {
    const conHueco = [...SERIE.slice(0, 500), ...SERIE.slice(501)];
    expect(indicesPorAnio({ serie: conHueco, ventanas: VENTANAS, aw_por_capa_mm: AW })).toBeNull();
    const desordenada = [...SERIE];
    const a = desordenada[100]!;
    desordenada[100] = desordenada[200]!;
    desordenada[200] = a;
    expect(indicesPorAnio({ serie: desordenada, ventanas: VENTANAS, aw_por_capa_mm: AW })).toBeNull();
  });

  it('las ventanas que la serie no cubre salen aparte y no se calculan a medias', () => {
    const ventanas = ventanasDeCadaAnio(1988, 2016, '04-15', 84)!;
    const r = indicesPorAnio({ serie: SERIE, ventanas, aw_por_capa_mm: AW });
    expect(r).not.toBeNull();
    expect(r!.anios_sin_serie).toEqual([1988, 1989, 2015, 2016]);
    expect(r!.anios.length).toBe(25);
  });

  it('devuelve null si ninguna ventana cae en la serie', () => {
    const ventanas = ventanasDeCadaAnio(1900, 1905, '04-15', 84)!;
    expect(indicesPorAnio({ serie: SERIE, ventanas, aw_por_capa_mm: AW })).toBeNull();
  });

  it('el agua inicial de cada temporada es lo que dejó la anterior, no el supuesto', () => {
    const r = cadena();
    const sws = r.anios.map(a => a.sws_inicial_mm);
    // La primera es la más húmeda —la cadena arrancó llena y perdió el invierno—
    // y ninguna llega al tope, porque todas salen del balance y no de un supuesto.
    expect(sws[0]!).toBe(Math.max(...sws));
    expect(sws[0]!).toBeLessThan(150);
    expect(sws[0]!).toBeGreaterThan(100);
    expect(new Set(sws.map(x => x.toFixed(2))).size).toBeGreaterThan(10);
  });

  it('la advertencia del b por defecto NO desaparece por pasar el b día por día', () => {
    // Era un agujero de verdad: el balance emite esa advertencia cuando algún día
    // viene con `b` sin declarar, y la cadena lo pasa en todos. El `b` seguía
    // siendo el de Sidney y la degradación se callaba.
    expect(cadena().advertencias).toContain(ADVERTENCIAS.b_por_defecto);
    const conB = indicesPorAnio({
      serie: SERIE, ventanas: VENTANAS, aw_por_capa_mm: AW, opciones: { b_constante: 0.5 },
    });
    expect(conB!.advertencias).not.toContain(ADVERTENCIAS.b_por_defecto);
  });

  it('la advertencia de la Eo se mide sobre la temporada y no sobre la cadena entera', () => {
    // Con los inviernos adentro, la Eo media de 25 años es la mitad del rango y la
    // advertencia salía siempre. Un aviso que sale siempre no avisa nada.
    expect(cadena().advertencias).not.toContain(ADVERTENCIAS.eo_fuera_de_rango);
    const seca = SERIE.map(d => ({ ...d, et0_mm: (d.et0_mm ?? 0) * 2 }));
    expect(cadena(seca).advertencias).toContain(ADVERTENCIAS.eo_fuera_de_rango);
  });

  it('la advertencia del largo de la temporada mira la ventana, no los 9.000 días de la cadena', () => {
    expect(cadena().advertencias).not.toContain(ADVERTENCIAS.temporada_fuera_de_rango);
    const corta = indicesPorAnio({
      serie: SERIE, ventanas: ventanasDeCadaAnio(1990, 2014, '04-15', 30)!, aw_por_capa_mm: AW,
    });
    expect(corta!.advertencias).toContain(ADVERTENCIAS.temporada_fuera_de_rango);
  });

  it('los dos avisos que no se pueden evitar salen siempre', () => {
    const avisos = cadena().avisos.map(a => a.aviso);
    expect(avisos.some(a => /ETo|Eo/.test(a))).toBe(true);
    expect(avisos).toContain(AVISO_DE_LA_VENTANA.aviso);
  });
});

// ─── 3. La medición que se vuelve a hacer acá ────────────────────────────────

describe('la convergencia se mide en la corrida, medido de nuevo', () => {
  it('la primera temporada arrastra su arranque y la diferencia baja', () => {
    const r = cadena();
    const dif = r.anios.map(a => a.diferencia_de_arranque_pct);
    expect(dif[0]!).toBeGreaterThan(5);
    // Baja, aunque en esta serie árida no llegue al umbral: lo que importa es que
    // la corrida lo informe y marque, en vez de suponer un número de temporadas.
    expect(dif[dif.length - 1]!).toBeLessThan(dif[0]!);
    for (const a of r.anios) {
      expect(a.el_arranque_todavia_pesa)
        .toBe(a.diferencia_de_arranque_pct > LA_CADENA_OLVIDA_EL_ARRANQUE.umbral_por_defecto_pct);
    }
  });

  it('con umbral cero sobreviven sólo las temporadas que coinciden exacto', () => {
    const r = indicesPorAnio({
      serie: SERIE, ventanas: VENTANAS, aw_por_capa_mm: AW, umbral_de_convergencia_pct: 0,
    })!;
    // Un umbral de cero es «coincidencia exacta», y algunas temporadas la tienen:
    // las dos cadenas llegan al mismo estado de agua. No es un umbral imposible.
    expect(r.anios_descartados).toBeGreaterThan(0);
    expect(r.anios_descartados).toBeLessThan(r.anios.length);
    for (const a of r.anios) {
      if (!a.el_arranque_todavia_pesa) expect(a.diferencia_de_arranque_pct).toBe(0);
    }
  });

  it('sin lluvia ninguna temporada converge, y en vez de una distribución lo dice', () => {
    // Es el caso que el diseño clavado no podía representar: donde el perfil nunca
    // se llena, el agua inicial no se olvida nunca y no hay distribución que dar.
    const seco = SERIE.map(d => ({ ...d, precip_mm: 0 }));
    const r = indicesPorAnio({ serie: seco, ventanas: VENTANAS, aw_por_capa_mm: AW })!;
    expect(r.anios_descartados).toBe(r.anios.length);
    expect(indicesQueSirven(r.anios)).toEqual([]);
    expect(r.advertencias.some(a => /Ninguna temporada converge/.test(a))).toBe(true);
  });

  it('con un umbral generoso entran todas y la distribución existe', () => {
    const r = indicesPorAnio({
      serie: SERIE, ventanas: VENTANAS, aw_por_capa_mm: AW, umbral_de_convergencia_pct: 1000,
    })!;
    expect(r.anios_descartados).toBe(0);
    expect(indicesQueSirven(r.anios).length).toBe(25);
  });
});

describe('la ventana cambia la forma de la distribución, medido de nuevo', () => {
  it('correr el arranque quince días no mueve la mediana y el p10 en la misma proporción', () => {
    const todas = (arranque: string) => indicesPorAnio({
      serie: SERIE, ventanas: ventanasDeCadaAnio(1990, 2014, arranque, 84)!,
      aw_por_capa_mm: AW, umbral_de_convergencia_pct: 1000,
    })!;
    const base = distribucion(indicesQueSirven(todas('04-15').anios))!;
    const otra = distribucion(indicesQueSirven(todas('04-30').anios))!;
    const mueveMediana = Math.abs(otra.mediana / base.mediana - 1);
    const muevP10 = Math.abs(otra.p10 / base.p10 - 1);
    // Las dos se mueven, y no lo mismo: si fuera un desplazamiento parejo, una
    // ventana equivocada se podría corregir con un factor. No se puede.
    expect(mueveMediana).toBeGreaterThan(0.01);
    expect(muevP10).toBeGreaterThan(0.01);
    expect(Math.abs(muevP10 - mueveMediana)).toBeGreaterThan(0.01);
  });
});

// ─── La distribución y el forraje ────────────────────────────────────────────

describe('la distribución', () => {
  it('los percentiles son los del método tipo 7, contra un caso a mano', () => {
    // Con 0..10, el p10 cae exactamente en 1 y el p25 en 2,5.
    const d = distribucion([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])!;
    expect(d.p10).toBeCloseTo(1, 6);
    expect(d.p25).toBeCloseTo(2.5, 6);
    expect(d.mediana).toBeCloseTo(5, 6);
    expect(d.p75).toBeCloseTo(7.5, 6);
    expect(d.p90).toBeCloseTo(9, 6);
    expect(d.promedio).toBeCloseTo(5, 6);
    expect(d.ancho).toBeCloseTo(9, 6);
  });

  it('no le importa el orden en que llegan', () => {
    const a = distribucion([3, 1, 2])!;
    const b = distribucion([1, 2, 3])!;
    expect(a).toEqual(b);
  });

  it('con un solo valor todos los percentiles son ese valor', () => {
    const d = distribucion([0.4])!;
    expect(d.n).toBe(1);
    expect(d.minimo).toBe(0.4);
    expect(d.p10).toBe(0.4);
    expect(d.maximo).toBe(0.4);
    expect(d.anios_bajo_el_promedio).toBe(0);
  });

  it('rechaza una tira vacía o con algo que no es un número', () => {
    expect(distribucion([])).toBeNull();
    expect(distribucion([1, Number.NaN])).toBeNull();
    expect(distribucion([1, Number.POSITIVE_INFINITY])).toBeNull();
  });

  it('el ancho es null cuando el p10 es cero, y no infinito', () => {
    expect(distribucion([0, 0, 0, 1, 2])!.ancho).toBeNull();
  });
});

describe('el forraje de cada año', () => {
  const anios: IndiceDeUnAnio[] = [
    { anio: 1990, desde: '1990-04-15', hasta: '1990-07-07', indice: 0.5, tp_mm: 100, t_mm: 50, pptn_mm: 90, sws_inicial_mm: 80, dias: 84, diferencia_de_arranque_pct: 0, el_arranque_todavia_pesa: true },
    { anio: 1991, desde: '1991-04-15', hasta: '1991-07-07', indice: 0.25, tp_mm: 100, t_mm: 25, pptn_mm: 60, sws_inicial_mm: 40, dias: 84, diferencia_de_arranque_pct: 0, el_arranque_todavia_pesa: false },
    { anio: 1992, desde: '1992-04-15', hasta: '1992-07-07', indice: 1, tp_mm: 100, t_mm: 100, pptn_mm: 200, sws_inicial_mm: 150, dias: 84, diferencia_de_arranque_pct: 0, el_arranque_todavia_pesa: false },
    { anio: 1993, desde: '1993-04-15', hasta: '1993-07-07', indice: null, tp_mm: 0, t_mm: 0, pptn_mm: 10, sws_inicial_mm: 10, dias: 84, diferencia_de_arranque_pct: 0, el_arranque_todavia_pesa: false },
  ];

  it('es la ecuación 1 año por año, y deja afuera los que no sirven', () => {
    const f = forrajePorAnio(1300, anios)!;
    expect(f.map(x => x.anio)).toEqual([1991, 1992]);
    expect(f[0]!.forraje_kg_ha).toBeCloseTo(325, 6);
    expect(f[1]!.forraje_kg_ha).toBeCloseTo(1300, 6);
  });

  it('rechaza un Yp que no es un número o es negativo', () => {
    expect(forrajePorAnio(-1, anios)).toBeNull();
    expect(forrajePorAnio(Number.NaN, anios)).toBeNull();
  });

  it('con Yp cero devuelve ceros y no null: un sitio sin potencial no es un error', () => {
    const f = forrajePorAnio(0, anios)!;
    expect(f.every(x => x.forraje_kg_ha === 0)).toBe(true);
  });

  it('la frecuencia de alcanzar un objetivo es la del registro y nada más', () => {
    const f = forrajePorAnio(1300, anios)!;
    expect(frecuenciaDeAlcanzar(f, 0)).toBe(1);
    expect(frecuenciaDeAlcanzar(f, 400)).toBe(0.5);
    expect(frecuenciaDeAlcanzar(f, 2000)).toBe(0);
    expect(frecuenciaDeAlcanzar([], 100)).toBeNull();
  });

  it('el año del percentil es un año del registro, para poder nombrarlo', () => {
    const f = forrajePorAnio(1300, anios)!;
    expect(anioDelPercentil(f, 0)!.anio).toBe(1991);
    expect(anioDelPercentil(f, 1)!.anio).toBe(1992);
    expect(anioDelPercentil(f, 2)).toBeNull();
    expect(anioDelPercentil([], 0.5)).toBeNull();
  });

  it('sobre la serie sintética, el año bueno da varias veces el año malo', () => {
    const f = forrajePorAnio(1300, cadena().anios)!;
    const p10 = anioDelPercentil(f, 0.1)!;
    const p90 = anioDelPercentil(f, 0.9)!;
    expect(p90.forraje_kg_ha / p10.forraje_kg_ha).toBeGreaterThan(2);
    expect(p90.forraje_kg_ha).toBeLessThanOrEqual(1300);
  });
});
