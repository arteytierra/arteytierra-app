import { describe, expect, it } from 'vitest';
import { COBERTURAS, escurrimientoSCS } from '@/lib/cuenca';
import {
  ADVERTENCIAS_ESCURRIMIENTO,
  AVISO_ESCURRIMIENTO,
  CN_DE_LA_TABLA_10_1,
  CONTRA_LA_COPITA,
  DONDE_SI_PESA,
  EL_CASO_DEL_MANUAL,
  EN_SIDNEY_NO_TOCA_LA_COLA_SECA,
  FUENTES_ESCURRIMIENTO,
  LA_TABLA_NO_TIENE_PENDIENTE,
  LO_QUE_DICE_EL_MANUAL,
  avisoDelEscurrimiento,
  cnDePastizal,
  cnHumedo,
  cnSeco,
  escurrimientoDelDiaMm,
  retencionDelDiaMm,
  retencionMaximaMm,
} from '@/lib/escurrimientoForraje';
import { ADVERTENCIAS, correrBalanceForraje, tresCapasDe30 } from '@/lib/forrajeBalance';
import { AVISO_ACTIVIDAD_RADICULAR } from '@/lib/actividadRadicular';
import { AVISO_AGUA_INICIAL } from '@/lib/aguaDelPerfil';

const PULGADA = 25.4;

describe('la Tabla 10-1 del NEH-630, tal cual está publicada', () => {
  it('tiene las 77 filas del manual, de 100 a 0', () => {
    expect(CN_DE_LA_TABLA_10_1).toHaveLength(77);
    expect(CN_DE_LA_TABLA_10_1[0]).toEqual([100, 100, 100]);
    expect(CN_DE_LA_TABLA_10_1[CN_DE_LA_TABLA_10_1.length - 1]).toEqual([0, 0, 0]);
  });

  it('está ordenada de mayor a menor y la seca nunca pasa a la media ni la media a la húmeda', () => {
    for (let i = 1; i < CN_DE_LA_TABLA_10_1.length; i++) {
      expect(CN_DE_LA_TABLA_10_1[i]![0]).toBeLessThan(CN_DE_LA_TABLA_10_1[i - 1]![0]);
    }
    for (const [ii, i, iii] of CN_DE_LA_TABLA_10_1) {
      expect(i).toBeLessThanOrEqual(ii);
      expect(ii).toBeLessThanOrEqual(iii);
    }
  });

  it('las filas que el manual usa en sus ejemplos salen exactas', () => {
    // Ejemplo 10-2: CN II = 74 → 55 y 88.
    expect(cnSeco(74)).toBe(55);
    expect(cnHumedo(74)).toBe(88);
    // Dos más de la tabla, una de cada mitad.
    expect(cnSeco(80)).toBe(63);
    expect(cnHumedo(80)).toBe(91);
    expect(cnSeco(30)).toBe(15);
    expect(cnHumedo(30)).toBe(50);
  });

  it('interpola abajo de 30, que es donde el manual publica de cinco en cinco', () => {
    // Entre 30 (→15) y 25 (→12): el punto medio da 13,5.
    expect(cnSeco(27.5)).toBeCloseTo(13.5, 6);
  });

  it('devuelve null fuera del dominio del CN', () => {
    expect(cnSeco(-1)).toBeNull();
    expect(cnSeco(101)).toBeNull();
    expect(cnSeco(Number.NaN)).toBeNull();
    expect(cnHumedo(1000)).toBeNull();
  });
});

describe('el caso resuelto del manual', () => {
  it('la retención de la tabla sale de la fórmula', () => {
    // Tabla 10-1: para CN = 74, S = 3,51 pulgadas.
    const s = retencionMaximaMm(EL_CASO_DEL_MANUAL.cn_arc_ii)!;
    expect(s / PULGADA).toBeCloseTo(EL_CASO_DEL_MANUAL.s_publicado_pulgadas, 2);
  });

  it('reproduce el escurrimiento publicado de las tres condiciones antecedentes', () => {
    for (const caso of EL_CASO_DEL_MANUAL.por_condicion) {
      const s = retencionMaximaMm(caso.cn)!;
      const q = escurrimientoDelDiaMm(EL_CASO_DEL_MANUAL.lluvia_mm, s);
      expect(q / PULGADA).toBeCloseTo(caso.q_pulgadas, 2);
      expect(q / EL_CASO_DEL_MANUAL.lluvia_mm * 100).toBeCloseTo(caso.pct_de_la_lluvia, 0);
    }
  });

  it('el mm declarado al lado de la pulgada es el mismo número', () => {
    expect(EL_CASO_DEL_MANUAL.lluvia_mm)
      .toBeCloseTo(EL_CASO_DEL_MANUAL.lluvia_pulgadas * PULGADA, 2);
    expect(EL_CASO_DEL_MANUAL.s_publicado_mm)
      .toBeCloseTo(EL_CASO_DEL_MANUAL.s_publicado_pulgadas * PULGADA, 2);
    for (const caso of EL_CASO_DEL_MANUAL.por_condicion) {
      expect(caso.q_mm).toBeCloseTo(caso.q_pulgadas * PULGADA, 1);
    }
  });

  it('es la misma ecuación que la del análisis de cuenca, escrita en función de S', () => {
    for (const cn of [40, 55, 74, 88, 95]) {
      for (const p of [5, 20, 50, 109.22, 200]) {
        expect(escurrimientoDelDiaMm(p, retencionMaximaMm(cn)!))
          .toBeCloseTo(escurrimientoSCS(p, cn), 8);
      }
    }
  });
});

describe('la retención máxima, ecuación 12', () => {
  it('es 25400/CN − 254, que es la forma SI de 1000/CN − 10', () => {
    expect(retencionMaximaMm(50)).toBeCloseTo(254, 6);
    expect(retencionMaximaMm(50)! / PULGADA).toBeCloseTo(10, 6);
  });

  it('crece cuando el CN baja', () => {
    expect(retencionMaximaMm(40)!).toBeGreaterThan(retencionMaximaMm(60)!);
  });

  it('devuelve null en las dos puntas, donde el número no significa nada', () => {
    expect(retencionMaximaMm(0)).toBeNull();
    expect(retencionMaximaMm(100)).toBeNull();
    expect(retencionMaximaMm(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe('la retención del día, ecuación 11', () => {
  it('con el perfil vacío devuelve la retención máxima', () => {
    expect(retencionDelDiaMm(200, 0, 150)).toBeCloseTo(200, 6);
  });

  it('con el perfil lleno devuelve cero, o sea que escurre toda la lluvia', () => {
    expect(retencionDelDiaMm(200, 150, 150)).toBe(0);
    expect(escurrimientoDelDiaMm(30, retencionDelDiaMm(200, 150, 150))).toBe(30);
  });

  it('es lineal en la fracción de llenado', () => {
    expect(retencionDelDiaMm(200, 75, 150)).toBeCloseTo(100, 6);
    expect(retencionDelDiaMm(200, 37.5, 150)).toBeCloseTo(150, 6);
  });

  it('se recorta cuando la capa superficial bajó del límite inferior', () => {
    // Un SWS negativo daría una retención mayor que el máximo.
    expect(retencionDelDiaMm(200, -20, 150)).toBeCloseTo(200, 6);
    // Y un SWS por encima de la capacidad no da retención negativa.
    expect(retencionDelDiaMm(200, 180, 150)).toBe(0);
  });

  it('sin capacidad o sin máximo devuelve cero y no NaN', () => {
    expect(retencionDelDiaMm(0, 50, 150)).toBe(0);
    expect(retencionDelDiaMm(200, 50, 0)).toBe(0);
  });
});

describe('el escurrimiento del día, ecuación 10', () => {
  it('es cero mientras la lluvia no pase la abstracción inicial', () => {
    const s = 100;
    expect(escurrimientoDelDiaMm(20, s)).toBe(0);
    expect(escurrimientoDelDiaMm(20.0001, s)).toBeGreaterThan(0);
  });

  it('nunca devuelve más que la lluvia que cayó', () => {
    for (const s of [0, 1, 10, 100, 500]) {
      for (const p of [0.1, 5, 30, 120, 400]) {
        const q = escurrimientoDelDiaMm(p, s);
        expect(q).toBeGreaterThanOrEqual(0);
        expect(q).toBeLessThanOrEqual(p + 1e-9);
      }
    }
  });

  it('crece con la lluvia y baja con la retención', () => {
    expect(escurrimientoDelDiaMm(60, 100)).toBeGreaterThan(escurrimientoDelDiaMm(40, 100));
    expect(escurrimientoDelDiaMm(60, 50)).toBeGreaterThan(escurrimientoDelDiaMm(60, 150));
  });

  it('con lluvia cero o negativa devuelve cero', () => {
    expect(escurrimientoDelDiaMm(0, 100)).toBe(0);
    expect(escurrimientoDelDiaMm(-5, 100)).toBe(0);
  });
});

describe('el CN del pastizal sale de la tabla del análisis de cuenca', () => {
  it('es la fila de pastura regular, la condición neutra', () => {
    const cob = COBERTURAS.find(c => c.id === 'pastura_regular')!;
    for (const g of ['A', 'B', 'C', 'D'] as const) {
      expect(cnDePastizal(g)).toBe(cob.cn[g]);
    }
  });

  it('la condición regular queda entre la buena y la sobrepastoreada', () => {
    const buena = COBERTURAS.find(c => c.id === 'pastura_buena')!;
    const pobre = COBERTURAS.find(c => c.id === 'pastura_pobre')!;
    for (const g of ['A', 'B', 'C', 'D'] as const) {
      expect(cnDePastizal(g)!).toBeGreaterThan(buena.cn[g]);
      expect(cnDePastizal(g)!).toBeLessThan(pobre.cn[g]);
    }
  });
});

describe('el balance con escurrimiento', () => {
  const dias = Array.from({ length: 84 }, (_, i) => ({
    pptn_mm: i % 7 === 0 ? 21 : 0,
    eo_mm: 4,
  }));

  it('sin CN el escurrimiento es cero y la advertencia es la del trabajo original', () => {
    const r = correrBalanceForraje({ dias, capas: tresCapasDe30(150, 0.5) })!;
    expect(r.escurrimiento_mm).toBe(0);
    expect(r.advertencias).toContain(ADVERTENCIAS.escorrentia_nula);
    expect(r.advertencias).not.toContain(ADVERTENCIAS.escorrentia_por_curva_numero);
    expect(r.serie.every(d => d.retencion_mm === null)).toBe(true);
  });

  it('con CN escurre, lo advierte, y el agua sigue cerrando al milímetro', () => {
    const r = correrBalanceForraje({ dias, capas: tresCapasDe30(150, 0.5), cn_arc_ii: 84 })!;
    expect(r.escurrimiento_mm).toBeGreaterThan(0);
    expect(r.advertencias).toContain(ADVERTENCIAS.escorrentia_por_curva_numero);
    expect(r.advertencias).not.toContain(ADVERTENCIAS.escorrentia_nula);
    expect(Math.abs(r.cierre_mm)).toBeLessThan(1e-9);
    expect(r.serie.every(d => d.retencion_mm !== null)).toBe(true);
  });

  it('el índice nunca sube por escurrir, y baja cuando el CN sube', () => {
    const sin = correrBalanceForraje({ dias, capas: tresCapasDe30(150, 0.5) })!;
    const indices = [49, 69, 79, 84].map(
      cn => correrBalanceForraje({ dias, capas: tresCapasDe30(150, 0.5), cn_arc_ii: cn })!.indice!,
    );
    for (const i of indices) expect(i).toBeLessThanOrEqual(sin.indice! + 1e-12);
    for (let k = 1; k < indices.length; k++) {
      expect(indices[k]!).toBeLessThanOrEqual(indices[k - 1]! + 1e-12);
    }
  });

  it('parte de lo que escurre es drenaje que antes se contaba como tal', () => {
    const sin = correrBalanceForraje({ dias, capas: tresCapasDe30(150, 1) })!;
    const con = correrBalanceForraje({ dias, capas: tresCapasDe30(150, 1), cn_arc_ii: 84 })!;
    expect(sin.drenaje_mm).toBeGreaterThan(0);
    expect(con.drenaje_mm).toBeLessThan(sin.drenaje_mm);
    expect(con.escurrimiento_mm).toBeGreaterThan(0);
  });

  it('un CN de 0 o de 100 no deja retención: escurrimiento cero y aviso propio', () => {
    const r = correrBalanceForraje({ dias, capas: tresCapasDe30(150, 0.5), cn_arc_ii: 100 })!;
    expect(r.escurrimiento_mm).toBe(0);
    expect(r.advertencias).toContain(ADVERTENCIAS.cn_sin_retencion);
  });

  it('el escurrimiento del día nunca pasa la lluvia del día', () => {
    const r = correrBalanceForraje({ dias, capas: tresCapasDe30(150, 1), cn_arc_ii: 94 })!;
    for (const d of r.serie) expect(d.escurrimiento_mm).toBeLessThanOrEqual(d.pptn_mm + 1e-9);
  });
});

describe('las dos direcciones, que esta vez van al revés', () => {
  it('el índice sale bajo y el Yp alto', () => {
    expect(AVISO_ESCURRIMIENTO.sesgo_del_indice).toBe('bajo');
    expect(AVISO_ESCURRIMIENTO.sesgo_del_yp).toBe('alto');
    expect(avisoDelEscurrimiento('indice').sesgo).toBe('bajo');
    expect(avisoDelEscurrimiento('yp').sesgo).toBe('alto');
  });

  it('es la dirección contraria a las otras tres degradaciones del bloque', () => {
    for (const otro of [AVISO_ACTIVIDAD_RADICULAR, AVISO_AGUA_INICIAL]) {
      expect(otro.sesgo_del_indice).toBe('alto');
      expect(otro.sesgo_del_yp).toBe('bajo');
    }
    expect(AVISO_ESCURRIMIENTO.sesgo_del_indice).not.toBe(AVISO_AGUA_INICIAL.sesgo_del_indice);
  });

  it('el aviso dice las dos cotas y de dónde salen', () => {
    expect(AVISO_ESCURRIMIENTO.aviso).toMatch(/BAJO/);
    expect(AVISO_ESCURRIMIENTO.aviso).toMatch(/ALTO/);
    expect(AVISO_ESCURRIMIENTO.aviso).toMatch(/ERHYM-II/);
    expect(AVISO_ESCURRIMIENTO.aviso).toMatch(/pendiente/);
  });
});

describe('el rango de validez, declarado con las palabras del manual', () => {
  it('la NRCS dice que la simulación continua no es el uso previsto', () => {
    expect(LO_QUE_DICE_EL_MANUAL.cita).toMatch(/not within the intended usage/);
    expect(LO_QUE_DICE_EL_MANUAL.cita).toMatch(/continuous simulation/);
  });

  it('la cota de La Copita es coherente con su propia tabla', () => {
    const pastizal = CONTRA_LA_COPITA.balance_mm.find(x => x.parcela === 'pastizal')!;
    const matorral = CONTRA_LA_COPITA.balance_mm.find(x => x.parcela === 'matorral')!;
    const veces = CONTRA_LA_COPITA.veces_de_mas.con_el_cn_calibrado;
    for (const p of [pastizal, matorral]) {
      const razon = p.escurrimiento.simulado / p.escurrimiento.medido;
      expect(razon).toBeGreaterThanOrEqual(veces.minimo - 0.1);
      expect(razon).toBeLessThanOrEqual(veces.maximo + 0.1);
    }
    // El CN de tabla erra más que el calibrado, y el calibrado está abajo de los dos.
    expect(CONTRA_LA_COPITA.veces_de_mas.con_el_cn_de_tabla.minimo)
      .toBeGreaterThan(veces.maximo);
    expect(CONTRA_LA_COPITA.cn_calibrado).toBeLessThan(CONTRA_LA_COPITA.cn_de_tabla.minimo);
  });

  it('el Nash-Sutcliff negativo es el de las dos parcelas con vegetación', () => {
    expect(CONTRA_LA_COPITA.nash_sutcliff.pastizal).toBeLessThan(0);
    expect(CONTRA_LA_COPITA.nash_sutcliff.matorral).toBeLessThan(0);
    expect(CONTRA_LA_COPITA.nash_sutcliff.suelo_desnudo).toBeGreaterThan(0);
  });

  it('la pendiente queda declarada y no resuelta', () => {
    expect(LA_TABLA_NO_TIENE_PENDIENTE.pendiente_supuesta_pct).toBe(5);
    expect(LA_TABLA_NO_TIENE_PENDIENTE.lo_que_dice_swat).toMatch(/5% slopes/);
    expect(LA_TABLA_NO_TIENE_PENDIENTE.williams_1995.por_que_no).toMatch(/SWAT\+/);
    expect(LA_TABLA_NO_TIENE_PENDIENTE.huang_2006.rango_de_pendiente_pct.minimo).toBe(14);
    expect(ADVERTENCIAS_ESCURRIMIENTO.sin_pendiente).toMatch(/ALTO/);
  });

  it('cada fuente tiene autor y año', () => {
    for (const v of Object.values(FUENTES_ESCURRIMIENTO)) {
      expect(v).toMatch(/\d{4}/);
    }
  });
});

describe('las mediciones declaradas son coherentes con lo que dicen', () => {
  it('en Sidney el p10 sale igual con los cuatro grupos', () => {
    const p10 = EN_SIDNEY_NO_TOCA_LA_COLA_SECA.el_p10_no_se_mueve.valor;
    expect(EN_SIDNEY_NO_TOCA_LA_COLA_SECA.sin_escurrimiento.p10).toBe(p10);
    for (const g of EN_SIDNEY_NO_TOCA_LA_COLA_SECA.por_grupo) expect(g.p10).toBe(p10);
  });

  it('el escurrimiento crece con el CN y el sesgo baja', () => {
    const g = EN_SIDNEY_NO_TOCA_LA_COLA_SECA.por_grupo;
    for (let i = 1; i < g.length; i++) {
      expect(g[i]!.cn).toBeGreaterThan(g[i - 1]!.cn);
      expect(g[i]!.esc_anual_pct).toBeGreaterThan(g[i - 1]!.esc_anual_pct);
      expect(g[i]!.sesgo).toBeLessThanOrEqual(g[i - 1]!.sesgo);
      expect(g[i]!.yp_kg_ha).toBeGreaterThanOrEqual(g[i - 1]!.yp_kg_ha);
    }
  });

  it('la fracción anual de Sidney cabe en la franja publicada', () => {
    const n = EN_SIDNEY_NO_TOCA_LA_COLA_SECA.contra_lo_publicado.nuestro_pct;
    expect(n.grupo_a).toBeLessThan(5);
    expect(n.grupo_b).toBeLessThan(5);
    expect(n.grupo_a).toBeGreaterThan(CONTRA_LA_COPITA.en_fraccion_de_la_lluvia.medido_pct.minimo - 0.5);
  });

  it('en la pampa escurre mucho más y el índice se mueve menos, porque está en el techo', () => {
    const sidneyD = EN_SIDNEY_NO_TOCA_LA_COLA_SECA.por_grupo.find(g => g.grupo === 'D')!;
    const pampaD = DONDE_SI_PESA.por_grupo.find(g => g.grupo === 'D')!;
    expect(pampaD.esc_anual_pct!).toBeGreaterThan(sidneyD.esc_anual_pct * 3);
    expect(DONDE_SI_PESA.sin_escurrimiento.mediana).toBe(1);
  });

  it('la diferencia con el coeficiente anual de la app está declarada en los dos sentidos', () => {
    const c = DONDE_SI_PESA.contra_el_coeficiente_anual_de_la_app;
    expect(c.pampa.el_calculo_diario).toBeGreaterThan(c.pampa.la_tabla);
    expect(c.sidney.el_calculo_diario).toBeLessThan(c.sidney.la_tabla);
  });

  it('queda escrito que hoy la textura de Sidney no se identifica', () => {
    const t = EN_SIDNEY_NO_TOCA_LA_COLA_SECA.la_textura_no_se_identifica_hoy;
    expect(t.maximo_de_la_serie).not.toBe(t.anotado_en_el_acta);
    expect(t.y_el_sesgo_sembrado.esta_corrida)
      .not.toBe(t.y_el_sesgo_sembrado.el_acta);
    expect(EN_SIDNEY_NO_TOCA_LA_COLA_SECA.con_la_textura_forzada).toBe('media');
  });
});
