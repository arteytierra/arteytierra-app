/**
 * Tests de `lib/bioconstruccion.ts`.
 *
 * Los casos resueltos son los valores que publican las propias normas: los
 * cortes de zona climática del IECC —que en SI son exactamente 5/9 de los
 * °F·día de la columna imperial—, la tabla 1 de 14.7.4 NMAC con sus seis
 * espesores y seis valores de `Sds`, los cortes del índice de Lacy, y las dos
 * líneas de aridez, que se comparan con aritmética exacta y no con ejemplos.
 */
import { describe, it, expect } from 'vitest';
import {
  BASE_CDD_C,
  BASE_HDD_C,
  CORTES_CDD10,
  CORTES_DRI,
  CORTES_HDD18,
  ESPESORES_TABLA1_PULG,
  LA_NORMA_LOCAL_PROHIBE,
  SDS_TABLA1,
  TECNICAS,
  ZONAS_MARINAS_TABULADAS,
  alturaMaximaMuroTierra,
  comparacionAridez,
  esMarina,
  estacionalidadLluvia,
  evaluarBioconstruccion,
  gradosDia,
  hieloDeshielo,
  indiceLluviaBatiente,
  perdidaPorSismo,
  zonaIECC,
} from '@/lib/bioconstruccion';
import type { MesDato } from '@/lib/clima';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** Serie mensual sintética: medias, mínimas, máximas y lluvia por mes. */
function serie(
  tmean: number[],
  precip: number[],
  opciones?: { amplitud?: number },
): MesDato[] {
  const amp = opciones?.amplitud ?? 10;
  return MESES.map((mes, i) => {
    const t = tmean[i] ?? 0;
    return {
      mes,
      precip_mm: precip[i] ?? 0,
      tmean_c:   t,
      tmin_c:    t - amp / 2,
      tmax_c:    t + amp / 2,
      etp_mm:    0,
      balance_mm: 0,
      viento_ms: 3,
    };
  });
}

/** Serie isoterma, para poder apuntar los grados-día donde se quiera. */
function isoterma(t: number, precip_anual = 1000): MesDato[] {
  return serie(new Array(12).fill(t), new Array(12).fill(precip_anual / 12));
}

// ══════════════════════════════════════════════════════════════════════════════
describe('los grados-día y las bases del IECC', () => {
  it('las bases son 65 °F y 50 °F, y 65 °F no son 18 °C redondos', () => {
    expect(BASE_HDD_C).toBeCloseTo(18.333, 3);
    expect(BASE_CDD_C).toBe(10);
    // La columna SI del código rotula la base «18°C»: hay un tercio de grado de
    // diferencia entre el rótulo y la conversión.
    expect(BASE_HDD_C - 18).toBeCloseTo(0.333, 3);
  });

  it('los cortes en SI son exactamente cinco novenos de los °F·día publicados', () => {
    expect(5400 * 5 / 9).toBe(CORTES_HDD18.z4);   // 3000
    expect(3600 * 5 / 9).toBe(CORTES_HDD18.z3);   // 2000
    expect(7200 * 5 / 9).toBe(CORTES_HDD18.z5);   // 4000
    expect(9000 * 5 / 9).toBe(CORTES_HDD18.z6);   // 5000
    expect(12600 * 5 / 9).toBe(CORTES_HDD18.z7);  // 7000
    expect(10800 * 5 / 9).toBe(CORTES_CDD10.z0);  // 6000
    expect(9000 * 5 / 9).toBe(CORTES_CDD10.z1);   // 5000
    expect(6300 * 5 / 9).toBe(CORTES_CDD10.z2);   // 3500
  });

  it('en una serie isoterma los grados-día son la diferencia por los días del año', () => {
    const { hdd18, cdd10 } = gradosDia(isoterma(10));
    expect(cdd10).toBeCloseTo(0, 6);
    expect(hdd18).toBeCloseTo((BASE_HDD_C - 10) * 365.25, 0);
  });

  it('EL MÉTODO DE LAS MEDIAS MENSUALES DA CERO DONDE LA REALIDAD TIENE HELADAS', () => {
    // Un mes con media de 18,5 °C y amplitud de 14 °C tiene mínimas de 11,5:
    // aporta grados-día de calefacción reales y por este método aporta cero.
    const { hdd18 } = gradosDia(isoterma(18.5));
    expect(hdd18).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('la zona climática del IECC', () => {
  it('ubica la zona térmica con los cortes publicados', () => {
    // Isoterma a 22 °C: CDD10 = 12 · 365,25 ≈ 4.383, entre 3.500 y 5.000 → zona 2.
    expect(zonaIECC(isoterma(22), -25)!.zona).toBe(2);
    // Isoterma a 27 °C: CDD10 ≈ 6.209 > 6.000 → zona 0.
    expect(zonaIECC(isoterma(27), -5)!.zona).toBe(0);
    // Isoterma a 4 °C: HDD18 ≈ 5.235, entre 5.000 y 7.000 → zona 7.
    expect(zonaIECC(isoterma(4), -50)!.zona).toBe(7);
    // Isoterma a 0 °C: HDD18 ≈ 6.696 → sigue en 7.
    expect(zonaIECC(isoterma(0), -55)!.zona).toBe(7);
    // Isoterma a −2 °C: HDD18 ≈ 7.426 > 7.000 → zona 8.
    expect(zonaIECC(isoterma(-2), -60)!.zona).toBe(8);
  });

  it('la letra seca es la línea P < 20·(T + 7) en milímetros', () => {
    const t = 15;
    const limite = 20 * (t + 7);   // 440 mm
    const seco = zonaIECC(isoterma(t, limite - 50), -30)!;
    const humedo = zonaIECC(isoterma(t, limite + 50), -30)!;
    expect(seco.humedad).toBe('B');
    expect(humedo.humedad).toBe('A');
  });

  it('LA ZONA MARINA NO ES ESTAR CERCA DEL MAR: LA CUARTA CONDICIÓN ES VERANO SECO', () => {
    // Serie templada que cumple las tres condiciones térmicas y reparte la
    // lluvia por igual: no es marina.
    const t = [8, 9, 11, 13, 16, 18, 19, 19, 17, 14, 11, 9];
    const parejo = new Array(12).fill(70);
    const z = zonaIECC(serie(t, parejo), 45)!;
    expect(z.humedad).not.toBe('C');
    expect(z.advertencias.some(a => a.includes('cuarta'))).toBe(true);
  });

  it('y con verano seco de verdad sí es marina, con la estación fría del hemisferio que toca', () => {
    const t = [8, 9, 11, 13, 16, 18, 19, 19, 17, 14, 11, 9];
    // Hemisferio norte: estación fría octubre-marzo. Mes más lluvioso de la
    // fría = 150, mes más seco del resto = 10: 150 ≥ 3 × 10.
    const inviernoLluvioso = [150, 120, 110, 60, 30, 10, 10, 10, 40, 100, 140, 150];
    expect(esMarina(inviernoLluvioso, t, 45)).toBe(true);
    // El mismo patrón en el hemisferio sur no es marino: ahí la estación fría
    // es abril-septiembre, y en esos meses casi no llueve.
    expect(esMarina(inviernoLluvioso, t, -45)).toBe(false);
  });

  it('EL NÚMERO DE ZONA ES PURAMENTE TÉRMICO: LA LETRA SE LE AGREGA DESPUÉS', () => {
    // La tabla no tiene un techo de refrigeración para las marinas ni cortes
    // propios: la zona sale del esquema de grados-día y la letra se decide
    // aparte. Un clima marino muy frío cae en una zona que la tabla no lista.
    const tFrio = [-2, -1, 2, 6, 11, 14, 15, 14, 11, 6, 1, -1];
    const inviernoLluvioso = [150, 120, 110, 60, 30, 10, 10, 10, 40, 100, 140, 150];
    const z = zonaIECC(serie(tFrio, inviernoLluvioso), 45)!;
    expect(z.humedad).toBe('C');
    expect(z.zona).toBe(6);
    expect(ZONAS_MARINAS_TABULADAS).toEqual([3, 4, 5]);
  });

  it('Y CUANDO ESO PASA LO AVISA, EN VEZ DE INVENTAR UNA ZONA QUE NO ESTÁ TABULADA', () => {
    const tFrio = [-2, -1, 2, 6, 11, 14, 15, 14, 11, 6, 1, -1];
    const inviernoLluvioso = [150, 120, 110, 60, 30, 10, 10, 10, 40, 100, 140, 150];
    const z = zonaIECC(serie(tFrio, inviernoLluvioso), 45)!;
    expect(z.advertencias.some(a => a.includes('sólo lista 3C, 4C y 5C'))).toBe(true);
    // Y una marina que sí está tabulada no dispara ese aviso.
    const templada = [8, 9, 11, 13, 16, 18, 19, 19, 17, 14, 11, 9];
    const zt = zonaIECC(serie(templada, inviernoLluvioso), 45)!;
    expect(zt.humedad).toBe('C');
    expect(ZONAS_MARINAS_TABULADAS).toContain(zt.zona);
    expect(zt.advertencias.some(a => a.includes('sólo lista 3C, 4C y 5C'))).toBe(false);
  });

  it('publica el margen al límite, porque cerca del corte la zona es una conjetura', () => {
    // Apuntado para quedar a pocos grados-día del corte de 3.000.
    const z = zonaIECC(isoterma(BASE_HDD_C - 3000 / 365.25), -35)!;
    expect(z.margen_al_limite).toBeLessThan(50);
    expect(z.advertencias.some(a => a.includes('conjetura'))).toBe(true);
  });

  it('y avisa siempre de que las medias mensuales subestiman los grados-día', () => {
    const z = zonaIECC(isoterma(15), -34)!;
    expect(z.advertencias.some(a => a.includes('subestima'))).toBe(true);
  });

  it('rechaza una serie incompleta en vez de clasificar con lo que haya', () => {
    expect(zonaIECC(serie([10, 10, 10], [50, 50, 50]).slice(0, 3), -34)).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('las dos líneas de aridez: por qué Köppen no es la variable', () => {
  it('CON LLUVIA REPARTIDA LAS DOS LÍNEAS SON LA MISMA LÍNEA, EXACTAMENTE', () => {
    for (const t of [-5, 0, 10, 18, 25, 30]) {
      const c = comparacionAridez(t, 500, 'repartida');
      expect(c.linea_codigo_mm).toBe(c.linea_koppen_mm);
      expect(c.brecha_mm).toBe(0);
      expect(c.discrepan).toBe(false);
    }
  });

  it('Y CON LLUVIA ESTACIONAL SE SEPARAN EXACTAMENTE 140 mm, PARA CUALQUIER TEMPERATURA', () => {
    for (const t of [-5, 0, 10, 18, 25, 30]) {
      expect(comparacionAridez(t, 500, 'verano').brecha_mm).toBe(140);
      expect(comparacionAridez(t, 500, 'invierno').brecha_mm).toBe(140);
    }
  });

  it('CON LLUVIA DE VERANO HAY UNA FRANJA DONDE KÖPPEN DICE ÁRIDO Y EL CÓDIGO DICE HÚMEDO', () => {
    // T = 20 °C: la línea del código está en 540 mm y la de Köppen, 140 mm más
    // arriba, en 680. Con 600 mm el mapa de la app muestra estepa y el código
    // que gobierna el revoque trata al lugar como zona húmeda.
    const c = comparacionAridez(20, 600, 'verano');
    expect(c.linea_codigo_mm).toBe(540);
    expect(c.linea_koppen_mm).toBe(680);
    expect(c.arida_para_koppen).toBe(true);
    expect(c.seca_para_codigo).toBe(false);
    expect(c.discrepan).toBe(true);
    expect(c.explicacion).toContain('Köppen llama árido');
  });

  it('Y CON LLUVIA DE INVIERNO LA DISCREPANCIA CAMBIA DE SIGNO: EL CÓDIGO DICE SECO', () => {
    // T = 20 °C: código en 540 mm, Köppen 140 mm más abajo, en 400. Con 480 mm
    // el código dice seco y Köppen dice templado húmedo.
    const c = comparacionAridez(20, 480, 'invierno');
    expect(c.linea_codigo_mm).toBe(540);
    expect(c.linea_koppen_mm).toBe(400);
    expect(c.seca_para_codigo).toBe(true);
    expect(c.arida_para_koppen).toBe(false);
    expect(c.discrepan).toBe(true);
    expect(c.explicacion).toContain('Köppen llama húmedo');
  });

  it('detecta la estacionalidad con el criterio del 70 % y el hemisferio correcto', () => {
    const veranoSur = [200, 180, 150, 20, 10, 5, 5, 10, 20, 100, 150, 200];
    expect(estacionalidadLluvia(serie(new Array(12).fill(15), veranoSur), -34)).toBe('verano');
    // La misma serie en el norte: esa lluvia cae en su invierno.
    expect(estacionalidadLluvia(serie(new Array(12).fill(15), veranoSur), 34)).toBe('invierno');
    expect(estacionalidadLluvia(serie(new Array(12).fill(15), new Array(12).fill(80)), -34))
      .toBe('repartida');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('los ciclos de hielo y deshielo', () => {
  it('un mes cicla sólo si cruza el cero en los dos sentidos', () => {
    // Media −3 con amplitud 10: mínima −8, máxima +2 → cicla.
    const cicla = hieloDeshielo(serie(new Array(12).fill(-3), new Array(12).fill(30)));
    expect(cicla.hay_ciclo_diario).toBe(true);
    expect(cicla.meses_con_ciclo.length).toBe(12);
  });

  it('UN MES QUE NO DESHIELA NO CICLA, Y ESO ES MENOS DESTRUCTIVO QUE ALTERNAR', () => {
    // Media −10 con amplitud 10: mínima −15, máxima −5 → el muro queda helado.
    const helado = hieloDeshielo(serie(new Array(12).fill(-10), new Array(12).fill(30)));
    expect(helado.hay_ciclo_diario).toBe(false);
    expect(helado.meses_congelados.length).toBe(12);
    expect(helado.advertencias.some(a => a.includes('no cicla'))).toBe(true);
  });

  it('avisa cuando no hay ciclo por las medias pero las mínimas rondan los 3 °C', () => {
    const borde = hieloDeshielo(serie(new Array(12).fill(7), new Array(12).fill(30)));
    expect(borde.hay_ciclo_diario).toBe(false);
    expect(borde.advertencias.some(a => a.includes('indicio'))).toBe(true);
  });

  it('los días de helada de la serie son una COTA SUPERIOR de los ciclos, y lo dice', () => {
    const h = hieloDeshielo(serie(new Array(12).fill(-2), new Array(12).fill(30)), 120);
    expect(h.dias_cota_sup).toBe(120);
    expect(h.advertencias.some(a => a.includes('cota superior'))).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('la lluvia batiente (Lacy)', () => {
  it('es el producto de la lluvia anual en metros por el viento medio', () => {
    expect(indiceLluviaBatiente(1000, 4)!.dri_m2s).toBe(4);
    expect(indiceLluviaBatiente(1500, 2)!.dri_m2s).toBe(3);
  });

  it('clasifica con los cortes de 3, 7 y 11 m²/s', () => {
    expect(CORTES_DRI).toEqual([3, 7, 11]);
    expect(indiceLluviaBatiente(500, 4)!.clase).toBe('resguardado');   // 2
    expect(indiceLluviaBatiente(1000, 5)!.clase).toBe('moderado');     // 5
    expect(indiceLluviaBatiente(1200, 7)!.clase).toBe('alto');         // 8,4
    expect(indiceLluviaBatiente(1500, 9)!.clase).toBe('severo');       // 13,5
  });

  it('ES UN PRODUCTO: POCA LLUVIA CON MUCHO VIENTO DA LO MISMO QUE MUCHA LLUVIA QUIETA', () => {
    // 600 mm con 8 m/s y 2.400 mm con 2 m/s dan el mismo índice. «Acá llueve
    // poco» no es un argumento sobre la pared.
    expect(indiceLluviaBatiente(600, 8)!.dri_m2s).toBe(indiceLluviaBatiente(2400, 2)!.dri_m2s);
    expect(indiceLluviaBatiente(600, 8)!.clase).toBe(indiceLluviaBatiente(2400, 2)!.clase);
  });

  it('sin viento no inventa un índice', () => {
    expect(indiceLluviaBatiente(1000, null)).toBeNull();
    expect(indiceLluviaBatiente(1000, undefined)).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('la tabla 1 de 14.7.4 NMAC', () => {
  it('reproduce los seis espesores y los seis valores de Sds publicados', () => {
    expect(ESPESORES_TABLA1_PULG).toEqual([10, 12, 14, 16, 18, 24]);
    expect(SDS_TABLA1).toEqual([0.25, 0.3, 0.35, 0.4, 0.45, 0.5]);
  });

  it('reproduce las alturas de las esquinas de la tabla', () => {
    expect(alturaMaximaMuroTierra(10, 0.25)!.altura_pulg).toBe(120);
    expect(alturaMaximaMuroTierra(24, 0.25)!.altura_pulg).toBe(144);
    expect(alturaMaximaMuroTierra(10, 0.5)!.altura_pulg).toBe(96);
    expect(alturaMaximaMuroTierra(24, 0.5)!.altura_pulg).toBe(144);
    expect(alturaMaximaMuroTierra(12, 0.5)!.altura_pulg).toBe(112);
    expect(alturaMaximaMuroTierra(14, 0.5)!.altura_pulg).toBe(136);
  });

  it('EL ESPESOR COMPRA TOLERANCIA SÍSMICA, Y LA TABLA DICE CUÁNTA', () => {
    // Un muro de 10 pulgadas pierde el 20 % de altura al pasar de Sds 0,25 a
    // 0,50; uno de 24 no pierde nada. El muro grueso no es prolijidad.
    expect(perdidaPorSismo(10)).toBeCloseTo(20, 1);
    expect(perdidaPorSismo(12)).toBeCloseTo(12.5, 1);
    expect(perdidaPorSismo(14)).toBeCloseTo(5.6, 1);
    expect(perdidaPorSismo(16)).toBe(0);
    expect(perdidaPorSismo(24)).toBe(0);
  });

  it('convierte a metros sin perder la pulgada', () => {
    const m = alturaMaximaMuroTierra(18, 0.4)!;
    expect(m.espesor_m).toBeCloseTo(0.457, 3);
    expect(m.altura_m).toBeCloseTo(3.66, 2);
  });

  it('NO EXTRAPOLA FUERA DE LA TABLA: Sds 0,6 NO ESTÁ PUBLICADO', () => {
    expect(alturaMaximaMuroTierra(10, 0.6)).toBeNull();
    expect(alturaMaximaMuroTierra(11, 0.25)).toBeNull();
    expect(alturaMaximaMuroTierra(30, 0.25)).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
describe('el relevamiento de técnicas', () => {
  const climaTemplado = {
    meses: serie(
      [24, 23, 21, 17, 14, 11, 10, 12, 14, 17, 20, 23],
      [120, 110, 120, 90, 75, 60, 60, 65, 80, 100, 100, 110],
    ),
    lat: -34.6,
    precip_anual_mm: 1090,
    tmean_anual_c: 17.2,
    viento_medio_ms: 3.5,
  };

  it('cada técnica viaja con su fuente y con sus límites publicados', () => {
    expect(TECNICAS.length).toBe(8);
    for (const t of TECNICAS) {
      expect(t.fuente.length).toBeGreaterThan(20);
      expect(t.limites.length).toBeGreaterThan(0);
    }
  });

  it('EL COB TIENE UN TOPE SÍSMICO Y ACEQUIA NO PUEDE EVALUARLO: NO INVENTA UNA LUZ VERDE', () => {
    const r = evaluarBioconstruccion(climaTemplado)!;
    const cob = r.tecnicas.find(t => t.tecnica.id === 'cob')!;
    expect(cob.veredicto).toBe('no_evaluable');
    expect(cob.decide).toContain('sísmic');
    expect(cob.pendientes.some(p => p.includes('mapa nacional'))).toBe(true);
  });

  it('EL ÚNICO GATE EXPLÍCITAMENTE CLIMÁTICO DE ESTOS CÓDIGOS ES EL HIELO-DESHIELO', () => {
    const frio = {
      ...climaTemplado,
      meses: serie(
        [2, 2, 0, -2, -5, -8, -8, -6, -3, 0, 1, 2],
        new Array(12).fill(40),
      ),
      tmean_anual_c: -2.1,
      precip_anual_mm: 480,
      lat: -50,
    };
    const r = evaluarBioconstruccion(frio)!;
    const quemado = r.tecnicas.find(t => t.tecnica.id === 'adobe_quemado')!;
    expect(quemado.veredicto).toBe('desaconsejada');
    expect(quemado.decide).toContain('freeze-thaw');
    // Y en clima templado sin heladas no se desaconseja.
    const templado = evaluarBioconstruccion(climaTemplado)!;
    expect(templado.tecnicas.find(t => t.tecnica.id === 'adobe_quemado')!.veredicto)
      .not.toBe('desaconsejada');
  });

  it('la cláusula de barrera de vapor del fardo se activa por ZONA, no por Köppen', () => {
    const frio = {
      ...climaTemplado,
      meses: isoterma(5, 600),
      tmean_anual_c: 5,
      precip_anual_mm: 600,
    };
    const z = zonaIECC(frio.meses, frio.lat)!;
    expect([5, 6, 7, 8]).toContain(z.zona);
    const r = evaluarBioconstruccion(frio)!;
    const fardo = r.tecnicas.find(t => t.tecnica.id === 'fardo_de_paja')!;
    expect(fardo.veredicto).toBe('con_condiciones');
    expect(fardo.condiciones.some(c => c.includes('clase III'))).toBe(true);
    expect(fardo.condiciones.some(c => c.includes('única cláusula'))).toBe(true);
  });

  it('LA ESTABILIZACIÓN ES LO QUE LEVANTA LA EXIGENCIA DE RECUBRIMIENTO, Y ESO ES DE LA FUENTE', () => {
    const ventoso = { ...climaTemplado, viento_medio_ms: 9, precip_anual_mm: 1500 };
    const r = evaluarBioconstruccion(ventoso)!;
    expect(r.lluvia!.clase).toBe('severo');
    const tapial = r.tecnicas.find(t => t.tecnica.id === 'tapial')!;
    const tapialEst = r.tecnicas.find(t => t.tecnica.id === 'tapial_estabilizado')!;
    expect(tapial.condiciones.some(c => c.includes('revestir'))).toBe(true);
    expect(tapialEst.condiciones.some(c => c.includes('no pide protección adicional'))).toBe(true);
  });

  it('y manda al alero, que es la pieza que los códigos están pidiendo', () => {
    const r = evaluarBioconstruccion(climaTemplado)!;
    const adobe = r.tecnicas.find(t => t.tecnica.id === 'adobe')!;
    expect(adobe.condiciones.some(c => c.includes('alero'))).toBe(true);
  });

  it('todas las técnicas declaran el gate de inundación que acequia no tiene', () => {
    const r = evaluarBioconstruccion(climaTemplado)!;
    for (const t of r.tecnicas) {
      expect(t.pendientes.some(p => p.includes('inundación'))).toBe(true);
    }
  });

  it('y el relevamiento entero recuerda que la norma local puede prohibirlo todo', () => {
    const r = evaluarBioconstruccion(climaTemplado)!;
    expect(r.advertencias).toContain(LA_NORMA_LOCAL_PROHIBE);
  });

  it('cuando las dos líneas de aridez discrepan, lo dice con los dos números', () => {
    // T = 20 °C, 600 mm con 70 % de lluvia en verano: Köppen húmedo, código seco.
    const monzon = {
      meses: serie(
        [26, 26, 25, 22, 19, 16, 15, 17, 20, 23, 25, 26],
        [120, 110, 90, 30, 15, 8, 8, 10, 25, 60, 54, 70],
      ),
      lat: -25,
      precip_anual_mm: 600,
      tmean_anual_c: 21.7,
      viento_medio_ms: 3,
    };
    const r = evaluarBioconstruccion(monzon)!;
    expect(estacionalidadLluvia(monzon.meses, monzon.lat)).toBe('verano');
    expect(r.aridez.brecha_mm).toBe(140);
    if (r.aridez.discrepan) {
      expect(r.advertencias.some(a => a.includes('se separan 140 mm'))).toBe(true);
    }
  });

  it('rechaza una serie incompleta en vez de relevar con lo que haya', () => {
    expect(evaluarBioconstruccion({ ...climaTemplado, meses: climaTemplado.meses.slice(0, 6) }))
      .toBeNull();
  });
});
