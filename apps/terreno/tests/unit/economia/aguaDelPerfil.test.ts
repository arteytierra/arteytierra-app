/**
 * El agua con la que arranca la temporada.
 *
 * Tres clases de prueba, como en el resto de este directorio:
 *
 * 1. **El caso resuelto de la literatura.** La Figura 5 de Wight y Hanks (1981)
 *    publica el agua medida con sonda de neutrones por capa de 30 cm en cuatro
 *    temporadas de Sidney. Las 158 mediciones digitalizadas están en
 *    `CONTRA_LA_FIGURA_5` y acá se verifica que lo que dice la prosa de arriba
 *    sea lo que dicen los números de abajo.
 * 2. **Que las funciones rechacen lo que no pueden calcular.** Una serie corta,
 *    un píxel que nunca se satura, dos clases de textura demasiado cerca, una
 *    capa que no llegó.
 * 3. **Que la tabla publicada sea la publicada.** La Tabla 8.9 del IFS trae el
 *    agua útil de cada clase en su última columna, y tiene que coincidir con la
 *    resta de las otras dos.
 */
import { describe, it, expect } from 'vitest';
import {
  FUENTES_AGUA_DEL_PERFIL,
  TEXTURAS_DE_HTESSEL,
  COMO_SE_IDENTIFICA_LA_TEXTURA,
  CAPAS_DEL_REANALISIS,
  LOS_DIAS_FUERA_DE_RANGO,
  CONTRA_LA_FIGURA_5,
  LA_CADENA_ARRANCA_HUMEDA_DE_MAS,
  EL_SEGUNDO_MODELO_NO_CONFIRMA,
  ADVERTENCIAS_AGUA_DEL_PERFIL,
  AVISO_AGUA_INICIAL,
  avisoDelAguaInicial,
  texturaDelPixel,
  fraccionDeAguaUtil,
  aguaUtilDelPerfil,
  aguaInicialPorCapaMm,
  humedadDeLaSerie,
} from '@/lib/aguaDelPerfil';

const MEDIA = TEXTURAS_DE_HTESSEL.find(t => t.clase === 'media')!;

describe('la tabla 8.9 del IFS', () => {
  it('trae las seis clases de textura con sus cuatro contenidos', () => {
    expect(TEXTURAS_DE_HTESSEL).toHaveLength(6);
    for (const t of TEXTURAS_DE_HTESSEL) {
      expect(t.residual).toBeLessThan(t.marchitez);
      expect(t.marchitez).toBeLessThan(t.capacidad);
      expect(t.capacidad).toBeLessThan(t.saturacion);
    }
  });

  it('la última columna publicada es la resta de las otras dos', () => {
    for (const t of TEXTURAS_DE_HTESSEL) {
      expect(t.agua_util).toBeCloseTo(t.capacidad - t.marchitez, 2);
    }
  });

  it('cita el documento y el capítulo, no «la bibliografía»', () => {
    expect(FUENTES_AGUA_DEL_PERFIL.parametros_hidraulicos).toMatch(/CY45R1/);
    expect(FUENTES_AGUA_DEL_PERFIL.parametros_hidraulicos).toMatch(/8\.9/);
    expect(FUENTES_AGUA_DEL_PERFIL.caso_resuelto).toMatch(/Figura 5/);
    expect(FUENTES_AGUA_DEL_PERFIL.humedad_del_suelo).toMatch(/ERA5-Land/);
  });

  it('una capa de 30 cm va de 51 a 119 mm de agua útil según la clase', () => {
    const mm = TEXTURAS_DE_HTESSEL.map(t => t.agua_util * 300);
    expect(Math.min(...mm)).toBeCloseTo(51, 0);
    expect(Math.max(...mm)).toBeCloseTo(119, 0);
  });
});

describe('la fracción de agua útil', () => {
  it('da 0 en el punto de marchitez y 1 en capacidad de campo', () => {
    expect(fraccionDeAguaUtil(MEDIA.marchitez, MEDIA)).toBeCloseTo(0, 10);
    expect(fraccionDeAguaUtil(MEDIA.capacidad, MEDIA)).toBeCloseTo(1, 10);
  });

  it('es lineal entre las dos', () => {
    const medio = (MEDIA.marchitez + MEDIA.capacidad) / 2;
    expect(fraccionDeAguaUtil(medio, MEDIA)).toBeCloseTo(0.5, 10);
  });

  it('se recorta a [0, 1] en vez de devolver un número fuera de rango', () => {
    expect(fraccionDeAguaUtil(0.01, MEDIA)).toBe(0);
    expect(fraccionDeAguaUtil(MEDIA.saturacion, MEDIA)).toBe(1);
  });

  it('devuelve null con null, undefined o NaN', () => {
    expect(fraccionDeAguaUtil(null, MEDIA)).toBeNull();
    expect(fraccionDeAguaUtil(undefined, MEDIA)).toBeNull();
    expect(fraccionDeAguaUtil(Number.NaN, MEDIA)).toBeNull();
  });
});

describe('la textura del píxel, leída de la propia serie', () => {
  it('en Sidney el máximo de 65 años la clava en la clase media', () => {
    const t = texturaDelPixel(0.434, 23_742);
    expect(t).not.toBeNull();
    expect(t!.textura.clase).toBe('media');
    // A cinco milésimas de la saturación de su clase y a ocho centésimas de la
    // siguiente: es una huella, no un ajuste fino.
    expect(Math.abs(t!.textura.saturacion - 0.434)).toBeLessThan(0.006);
    expect(t!.margen_al_segundo).toBeGreaterThan(0.08);
  });

  it('los cuatro píxeles donde se probó dan lo que dice la constante', () => {
    for (const p of COMO_SE_IDENTIFICA_LA_TEXTURA.probada_en) {
      const t = texturaDelPixel(p.maximo, 12_000);
      expect(t).not.toBeNull();
      expect(t!.textura.clase).toBe(p.clase);
      expect(t!.textura.saturacion).toBeCloseTo(p.saturacion, 3);
      expect(t!.margen_al_segundo).toBeCloseTo(p.margen, 2);
    }
  });

  it('con una serie corta no identifica nada', () => {
    expect(texturaDelPixel(0.434, 365)).toBeNull();
    expect(texturaDelPixel(0.434, COMO_SE_IDENTIFICA_LA_TEXTURA.dias_minimos - 1)).toBeNull();
  });

  it('si el máximo pasa la saturación de todas, devuelve null en vez de elegir', () => {
    expect(texturaDelPixel(0.9, 20_000)).toBeNull();
  });

  it('si dos clases quedan demasiado cerca, devuelve null', () => {
    // 0,430 es la saturación de la media-fina y está a nueve milésimas de la
    // media: no hay con qué distinguirlas.
    expect(texturaDelPixel(0.430, 20_000)).toBeNull();
  });

  it('rechaza un máximo que no es un número', () => {
    expect(texturaDelPixel(Number.NaN, 20_000)).toBeNull();
    expect(texturaDelPixel(0, 20_000)).toBeNull();
  });
});

describe('las tres capas del modelo', () => {
  it('la primera pesa 7/30, 21/30 y 2/30 y las dos profundas comparten humedad', () => {
    const f = aguaUtilDelPerfil(0.30, 0.25, 0.20, MEDIA)!;
    expect(f).toHaveLength(3);
    const esperado = (7 * 0.30 + 21 * 0.25 + 2 * 0.20) / 30;
    expect(f[0]).toBeCloseTo(fraccionDeAguaUtil(esperado, MEDIA)!, 10);
    expect(f[1]).toBeCloseTo(fraccionDeAguaUtil(0.20, MEDIA)!, 10);
    // Es la pérdida declarada: 30-60 y 60-90 salen las dos de la capa de 28-100.
    expect(f[2]).toBe(f[1]);
    expect(CAPAS_DEL_REANALISIS.pesos_de_la_primera.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
  });

  it('si falta una de las tres, no devuelve media humedad', () => {
    expect(aguaUtilDelPerfil(null, 0.25, 0.20, MEDIA)).toBeNull();
    expect(aguaUtilDelPerfil(0.30, undefined, 0.20, MEDIA)).toBeNull();
    expect(aguaUtilDelPerfil(0.30, 0.25, Number.NaN, MEDIA)).toBeNull();
  });

  it('la pérdida de la geometría está medida con un caso concreto', () => {
    const p = CAPAS_DEL_REANALISIS.lo_que_se_pierde;
    // La figura publica 0,71 arriba y 0,04 abajo; el reanálisis pone 0,31 en las dos.
    expect(p.reanalisis.capa_30_60).toBe(p.reanalisis.capa_60_90);
    expect(p.figura.capa_30_60).not.toBe(p.figura.capa_60_90);
    // Y el perfil entero igual cierra, porque los dos errores se compensan.
    expect(Math.abs(p.el_perfil_igual_cierra.figura_mm - p.el_perfil_igual_cierra.reanalisis_mm))
      .toBeLessThan(5);
  });
});

describe('de fracción a milímetros', () => {
  it('multiplica por el AW de cada capa', () => {
    expect(aguaInicialPorCapaMm([1, 0.5, 0], [50, 50, 50])).toEqual([50, 25, 0]);
    expect(aguaInicialPorCapaMm([0.5, 0.5, 0.5], [60, 50, 40])).toEqual([30, 25, 20]);
  });

  it('recorta una fracción fuera de rango y rechaza largos distintos', () => {
    expect(aguaInicialPorCapaMm([2, -1, 0.5], [50, 50, 50])).toEqual([50, 0, 25]);
    expect(aguaInicialPorCapaMm([0.5, 0.5], [50, 50, 50])).toBeNull();
    expect(aguaInicialPorCapaMm([], [])).toBeNull();
    expect(aguaInicialPorCapaMm([0.5], [Number.NaN])).toBeNull();
  });
});

describe('la serie entera', () => {
  const n = COMO_SE_IDENTIFICA_LA_TEXTURA.dias_minimos + 10;
  const sube = (i: number, lo: number, hi: number) => lo + (hi - lo) * ((i % 100) / 99);

  it('identifica la textura con el máximo y convierte día por día', () => {
    const a = Array.from({ length: n }, (_, i) => sube(i, 0.14, 0.434));
    const b = Array.from({ length: n }, (_, i) => sube(i, 0.15, 0.40));
    const c = Array.from({ length: n }, (_, i) => sube(i, 0.16, 0.34));
    const r = humedadDeLaSerie(a, b, c);
    expect(r).not.toBeNull();
    expect(r!.textura.textura.clase).toBe('media');
    expect(r!.completa).toBe(true);
    expect(r!.por_dia).toHaveLength(n);
    expect(r!.por_dia[0]).not.toBeNull();
  });

  it('marca la serie como incompleta si a un día le falta una capa', () => {
    const a: Array<number | null> = Array.from({ length: n }, (_, i) => sube(i, 0.14, 0.434));
    const b = Array.from({ length: n }, (_, i) => sube(i, 0.15, 0.40));
    const c = Array.from({ length: n }, (_, i) => sube(i, 0.16, 0.34));
    a[5] = null;
    const r = humedadDeLaSerie(a, b, c)!;
    expect(r.completa).toBe(false);
    expect(r.por_dia[5]).toBeNull();
    expect(r.por_dia[6]).not.toBeNull();
  });

  it('devuelve null si las tres listas no miden lo mismo o si la textura no sale', () => {
    const a = Array.from({ length: n }, () => 0.3);
    expect(humedadDeLaSerie(a, a.slice(1), a)).toBeNull();
    expect(humedadDeLaSerie([], [], [])).toBeNull();
    // Un píxel que nunca se acerca a ninguna saturación: 0,30 queda a 0,10 de la
    // clase gruesa y a 0,14 de la media, y gana la gruesa por margen, pero la
    // serie corta lo rechaza igual.
    expect(humedadDeLaSerie([0.3], [0.3], [0.3])).toBeNull();
  });
});

describe('el caso resuelto: la Figura 5 de Wight y Hanks', () => {
  it('la envolvente de la figura confirma los 50 mm de agua útil por capa', () => {
    // Esto es lo primero que salió de digitalizar la figura, y no es una
    // comparación sino la confirmación de un supuesto que estaba declarado como
    // decisión nuestra: 150 mm en el perfil de 90 cm.
    for (const e of CONTRA_LA_FIGURA_5.envolvente_mm) {
      expect(e.rango).toBeCloseTo(e.maximo - e.minimo, 1);
      expect(e.rango).toBeGreaterThan(45);
      expect(e.rango).toBeLessThan(60);
    }
    expect(CONTRA_LA_FIGURA_5.confirma_el_agua_util.por_capa_mm * 3)
      .toBe(CONTRA_LA_FIGURA_5.confirma_el_agua_util.perfil_mm);
  });

  it('la capa superficial tiene más rango porque baja del punto de marchitez', () => {
    const [sup, media, prof] = CONTRA_LA_FIGURA_5.envolvente_mm;
    expect(sup!.rango).toBeGreaterThan(media!.rango);
    expect(media!.rango).toBeGreaterThan(prof!.rango);
    expect(CONTRA_LA_FIGURA_5.por_que_la_primera_tiene_mas_rango).toMatch(/seco al aire/);
  });

  it('las 158 mediciones dan un sesgo alto, y más arriba que abajo', () => {
    const e = CONTRA_LA_FIGURA_5.en_fraccion_de_agua_util;
    expect(e.todas.n).toBe(e.por_capa.reduce((s, x) => s + x.n, 0));
    // El reanálisis lee húmedo en las tres capas, y el doble en la superficial,
    // que es donde el suelo real seca por debajo de lo que el modelo representa.
    for (const c of e.por_capa) expect(c.sesgo).toBeGreaterThan(0);
    expect(e.por_capa[0]!.sesgo).toBeGreaterThan(e.por_capa[1]!.sesgo * 1.5);
    expect(e.todas.sesgo).toBeGreaterThan(0);
    expect(CONTRA_LA_FIGURA_5.sesgo_del_dato).toBe('alto');
  });

  it('en el día del rebrote el reanálisis erra cuatro veces menos que la cadena', () => {
    const filas = CONTRA_LA_FIGURA_5.el_dia_del_rebrote;
    expect(filas).toHaveLength(4);
    const eamRea = filas.reduce((s, f) => s + Math.abs(f.reanalisis - f.medido), 0) / filas.length;
    const eamCad = filas.reduce((s, f) => s + Math.abs(f.cadena - f.medido), 0) / filas.length;
    expect(eamRea).toBeCloseTo(CONTRA_LA_FIGURA_5.resumen_del_arranque.reanalisis.eam_mm, 1);
    expect(eamCad).toBeCloseTo(CONTRA_LA_FIGURA_5.resumen_del_arranque.cadena.eam_mm, 1);
    expect(eamCad).toBeGreaterThan(eamRea * 4);
    // Y la cadena se equivoca siempre para el mismo lado: las cuatro temporadas
    // arrancan más húmedas de lo que se midió.
    for (const f of filas) expect(f.cadena).toBeGreaterThan(f.medido);
  });

  it('el reanálisis no tiene signo en el arranque y la cadena sí', () => {
    const r = CONTRA_LA_FIGURA_5.resumen_del_arranque;
    expect(Math.abs(r.reanalisis.sesgo_mm)).toBeLessThan(r.reanalisis.eam_mm / 5);
    expect(r.cadena.sesgo_mm).toBeCloseTo(r.cadena.eam_mm, 5);
  });
});

describe('la cadena arranca húmeda de más', () => {
  it('entrega 41 mm de más al rebrote, y nunca para el otro lado', () => {
    const a = LA_CADENA_ARRANCA_HUMEDA_DE_MAS.agua_al_rebrote_mm;
    expect(a.cadena - a.sembrada).toBeCloseTo(a.diferencia_media, 1);
    expect(a.diferencia_maxima).toBeGreaterThan(a.diferencia_media);
    // El mínimo es negativo pero chico: hay temporadas donde la cadena arranca
    // apenas más seca, y no llega a 3 mm sobre 150.
    expect(a.diferencia_minima).toBeGreaterThan(-5);
  });

  it('contra los doce publicados el error se parte al medio', () => {
    const c = LA_CADENA_ARRANCA_HUMEDA_DE_MAS.contra_los_doce;
    expect(c.sembrada.eam).toBeLessThan(c.cadena.eam / 1.9);
    expect(c.sembrada.sesgo).toBeLessThan(c.cadena.sesgo / 1.9);
    expect(c.sembrada.r).toBeGreaterThan(c.cadena.r);
    expect(c.sembrada.en_el_techo).toBeLessThan(c.cadena.en_el_techo);
    // Y sigue leyendo alto, que es lo que el aviso tiene que decir.
    expect(c.sembrada.sesgo).toBeGreaterThan(0);
  });

  it('dos de las tres temporadas secas se acomodan y 1971 no', () => {
    const t = LA_CADENA_ARRANCA_HUMEDA_DE_MAS.las_tres_que_estaban_lejos;
    const cerca = t.filter(x => Math.abs(x.sembrada - x.publicado) < Math.abs(x.cadena - x.publicado) / 2);
    expect(cerca.map(x => x.anio).sort()).toEqual([1968, 1977]);
    const mil971 = t.find(x => x.anio === 1971)!;
    expect(Math.abs(mil971.sembrada - mil971.publicado)).toBeGreaterThan(0.3);
    expect(LA_CADENA_ARRANCA_HUMEDA_DE_MAS.la_que_no_se_explica.anio).toBe(1971);
    // Para el reanálisis 1971 no arrancó con el perfil seco, así que la causa
    // de ese residuo está en otro lado.
    expect(LA_CADENA_ARRANCA_HUMEDA_DE_MAS.la_que_no_se_explica.agua_al_rebrote_mm)
      .toBeGreaterThan(LA_CADENA_ARRANCA_HUMEDA_DE_MAS.agua_al_rebrote_mm.sembrada);
  });

  it('la distribución se abre: baja la cola seca y sube el ancho', () => {
    const d = LA_CADENA_ARRANCA_HUMEDA_DE_MAS.en_la_distribucion;
    expect(d.sembrada.p10).toBeLessThan(d.cadena.p10);
    expect(d.sembrada.mediana).toBeLessThan(d.cadena.mediana);
    expect(d.sembrada.ancho).toBeGreaterThan(d.cadena.ancho);
    // Y vuelven las dos temporadas que la cadena descartaba.
    expect(d.sembrada.n).toBe(d.cadena.n + 2);
  });

  it('en los kilos no es un corrimiento parejo: el año seco baja y el bueno sube', () => {
    const k = LA_CADENA_ARRANCA_HUMEDA_DE_MAS.lo_que_mueve_en_los_kilos;
    expect(k.anio_del_p10.mediana).toBeLessThan(1);
    expect(k.anio_del_p90.mediana).toBeGreaterThan(1);
    expect(k.anio_de_la_mediana.mediana).toBeGreaterThan(0.9);
    expect(k.anio_de_la_mediana.mediana).toBeLessThan(1.1);
  });
});

describe('el control que no confirma', () => {
  it('los dos modelos correlacionan a medias y no comparten ningún año seco', () => {
    const c = EL_SEGUNDO_MODELO_NO_CONFIRMA;
    expect(c.r_al_15_de_abril).toBeGreaterThan(0.6);
    expect(c.r_al_15_de_abril).toBeLessThan(0.8);
    const a = new Set<number>(c.los_seis_arranques_mas_secos.era5_land);
    const b = (c.los_seis_arranques_mas_secos.merra2 as readonly number[]).filter(x => a.has(x));
    expect(b).toHaveLength(c.los_seis_arranques_mas_secos.en_comun);
    expect(b).toHaveLength(0);
  });

  it('no se tapa: dice por qué se usa ERA5-Land igual y qué acota la discrepancia', () => {
    expect(EL_SEGUNDO_MODELO_NO_CONFIRMA.por_que_igual_se_usa_era5).toMatch(/medirse/);
    expect(EL_SEGUNDO_MODELO_NO_CONFIRMA.que_acota).toMatch(/temporada puntual/);
  });

  it('sacarle la tendencia a cada uno no arregla la discrepancia', () => {
    const c = EL_SEGUNDO_MODELO_NO_CONFIRMA;
    expect(Math.abs(c.r_sin_tendencia - c.r_al_15_de_abril)).toBeLessThan(0.05);
    expect(Math.abs(c.r_con_abril_entero - c.r_al_15_de_abril)).toBeLessThan(0.05);
  });
});

describe('las dos direcciones del aviso', () => {
  it('el índice sale alto y el Yp sale bajo, que son opuestas', () => {
    expect(AVISO_AGUA_INICIAL.sesgo_del_indice).toBe('alto');
    expect(AVISO_AGUA_INICIAL.sesgo_del_yp).toBe('bajo');
    expect(AVISO_AGUA_INICIAL.sesgo_del_indice).not.toBe(AVISO_AGUA_INICIAL.sesgo_del_yp);
  });

  it('el aviso nombra la fuente, el número y el control que discrepa', () => {
    expect(AVISO_AGUA_INICIAL.aviso).toMatch(/ERA5-Land/);
    expect(AVISO_AGUA_INICIAL.aviso).toMatch(/0,046/);
    expect(AVISO_AGUA_INICIAL.aviso).toMatch(/MERRA-2/);
  });

  it('avisoDelAguaInicial devuelve la dirección que le toca a cada punta', () => {
    expect(avisoDelAguaInicial('indice').sesgo).toBe('alto');
    expect(avisoDelAguaInicial('yp').sesgo).toBe('bajo');
    expect(avisoDelAguaInicial('indice').aviso).toBe(AVISO_AGUA_INICIAL.aviso);
  });
});

describe('las advertencias y el rango', () => {
  it('nombran las cuatro degradaciones con su número', () => {
    expect(ADVERTENCIAS_AGUA_DEL_PERFIL.una_humedad_para_dos_capas).toMatch(/28-100/);
    expect(ADVERTENCIAS_AGUA_DEL_PERFIL.la_superficie_no_baja_a_seco).toMatch(/0,074/);
    expect(ADVERTENCIAS_AGUA_DEL_PERFIL.textura_sin_identificar).toMatch(/banda/);
    expect(ADVERTENCIAS_AGUA_DEL_PERFIL.sin_humedad_de_suelo).toMatch(/40 mm/);
  });

  it('el día que importa nunca cayó fuera de rango en 65 años', () => {
    const r = LOS_DIAS_FUERA_DE_RANGO.los_dias_de_rebrote;
    expect(r.fuera_de_rango).toBe(0);
    expect(r.minimo).toBeGreaterThan(MEDIA.marchitez);
    expect(r.maximo).toBeLessThanOrEqual(r.capacidad_de_la_clase + 0.001);
    // En cambio la capa superficial sí se recorta seguido, y para los dos lados.
    const sup = LOS_DIAS_FUERA_DE_RANGO.por_capa[0]!;
    expect(sup.bajo_marchitez_pct).toBeGreaterThan(5);
    expect(sup.sobre_capacidad_pct).toBeGreaterThan(10);
  });
});
