/**
 * El balance diario de Wight y Hanks, contra lo que su Tabla 1 permite probar.
 *
 * Este archivo hace tres cosas, y la tercera es la que importa que se entienda:
 *
 * 1. **Deriva de la tabla el parámetro que el trabajo publica como figura.**
 *    `Tp/(Kc·Eo)` es, por la ecuación 2, el `b` de la temporada ponderado por
 *    `Eo`, y las dos columnas están impresas. De ahí sale `B_PRADERA_MIXTA`.
 * 2. **Corre el balance con ese `b` y le exige la columna `Tp`.** Es el caso
 *    resuelto de la literatura de este módulo.
 * 3. **De la columna `T` no hay caso resuelto, y los tests lo dicen.**
 *    Reproducirla pediría la lluvia diaria de Sidney de 1967 a 1978, que el
 *    artículo no publica. Lo que se le exige a `T` son dos cosas que no
 *    dependen de esos datos: que el agua se conserve al milímetro y que las
 *    cotas físicas se cumplan. Y las degradaciones se prueban **por su
 *    dirección**: cada supuesto que falta tiene que empujar el índice para
 *    arriba, que es lo que las advertencias prometen.
 */
import { describe, it, expect } from 'vitest';
import {
  B_PRADERA_MIXTA, ADVERTENCIAS, EO_DIARIA_DE_LA_PRUEBA, TEMPORADA_DE_LA_PRUEBA,
  correrBalanceForraje, tresCapasDe30,
  type DiaDeBalance, type CapaDeSuelo,
} from '@/lib/forrajeBalance';
import { SERIE_WIGHT_HANKS, MODELO_WIGHT_HANKS, aniosDeWightHanks } from '@/lib/forrajeMedido';

/** Los doce años de Sidney con las cuatro columnas que el balance toca. */
const sidney = aniosDeWightHanks('sidney').map(a => ({
  anio: a.anio,
  kc_eo: a.kc_eo_mm!,
  tp: a.tp_mm!,
  t: a.t_mm!,
  et: a.et_modelo_mm!,
  drenaje: a.drenaje_mm!,
  pptn: a.pptn_periodo_mm!,
  dias: a.periodo_dias!,
}));

/** Días secos, todos iguales: el esqueleto de casi todos los casos de abajo. */
const secos = (n: number, eo = 8): DiaDeBalance[] =>
  Array.from({ length: n }, () => ({ pptn_mm: 0, eo_mm: eo }));

describe('el b de la temporada, despejado de la Tabla 1', () => {
  const bs = sidney.map(a => ({ anio: a.anio, b: a.tp / a.kc_eo }));
  const media = bs.reduce((s, x) => s + x.b, 0) / bs.length;

  it('la media de los doce años es el 0,435 que el módulo declara', () => {
    expect(media).toBeCloseTo(0.435, 3);
    expect(B_PRADERA_MIXTA.valor).toBeCloseTo(media, 3);
  });

  it('el desvío, el mínimo y el máximo son los declarados', () => {
    const desvio = Math.sqrt(bs.reduce((s, x) => s + (x.b - media) ** 2, 0) / bs.length);
    expect(desvio).toBeCloseTo(B_PRADERA_MIXTA.desvio, 4);
    expect(Math.min(...bs.map(x => x.b))).toBeCloseTo(B_PRADERA_MIXTA.minimo, 4);
    expect(Math.max(...bs.map(x => x.b))).toBeCloseTo(B_PRADERA_MIXTA.maximo, 4);
  });

  /**
   * El hallazgo: once de los doce años caen en una banda de tres centésimas, y
   * el que se despega es el de la temporada más corta. No es ruido, es la
   * limitación de usar un promedio donde el trabajo usa una curva.
   */
  it('once de los doce entran en 0,42-0,45 y el que se escapa es 1977', () => {
    const adentro = bs.filter(x => x.b >= 0.42 && x.b <= 0.45);
    expect(adentro).toHaveLength(11);
    const afuera = bs.filter(x => x.b < 0.42 || x.b > 0.45);
    expect(afuera.map(x => x.anio)).toEqual([1977]);
    expect(afuera[0]!.b).toBeCloseTo(B_PRADERA_MIXTA.excepcion.b, 4);
  });

  it('y 1977 es la temporada más corta de la serie, que es la explicación', () => {
    const masCorta = [...sidney].sort((a, b) => a.dias - b.dias)[0]!;
    expect(masCorta.anio).toBe(1977);
    expect(masCorta.dias).toBe(68);
    expect(B_PRADERA_MIXTA.excepcion.dias).toBe(68);
    // Las otras once van de 81 a 99 días: 1977 queda trece días abajo de la
    // siguiente, así que no es un continuo con una cola.
    const resto = sidney.filter(a => a.anio !== 1977).map(a => a.dias);
    expect(Math.min(...resto)).toBe(81);
  });

  it('b = 0,5 × LAI relativo, así que el LAI relativo medio fue 0,87', () => {
    expect(B_PRADERA_MIXTA.lai_relativo_medio).toBeCloseTo(media / 0.5, 2);
  });
});

describe('el caso resuelto: el balance reproduce la columna Tp', () => {
  /**
   * Con `Eo` repartida uniforme en los días publicados, `Tp` acumulado tiene
   * que dar `b · Kc·Eo` — o sea, la ecuación 2 integrada sobre la temporada.
   * Lo que se prueba acá es que el bucle del balance no se pierde nada por el
   * camino, y de paso cuánto cuesta usar un `b` constante.
   */
  const corridaDe = (kc_eo: number, dias: number) => correrBalanceForraje({
    dias: Array.from({ length: dias }, () => ({
      pptn_mm: 0, eo_mm: kc_eo / (MODELO_WIGHT_HANKS.kc * dias),
    })),
    capas: [{ espesor_cm: 90, aw_mm: 100, sws_inicial_mm: 100, agua_bajo_el_limite_mm: 0 }],
  })!;

  it('once de los doce años quedan dentro del 5 %', () => {
    const errores = sidney.map(a => ({
      anio: a.anio,
      err: corridaDe(a.kc_eo, a.dias).tp_mm / a.tp - 1,
    }));
    const dentro = errores.filter(e => Math.abs(e.err) < 0.05);
    expect(dentro).toHaveLength(11);
    expect(errores.filter(e => Math.abs(e.err) >= 0.05).map(e => e.anio)).toEqual([1977]);
  });

  it('el peor es 1977, y se pasa por 8,97 % para arriba', () => {
    const a = sidney.find(x => x.anio === 1977)!;
    const err = (corridaDe(a.kc_eo, a.dias).tp_mm / a.tp - 1) * 100;
    expect(err).toBeCloseTo(8.97, 1);
    // Para arriba: el promedio de temporada le atribuye más dosel del que tuvo.
    expect(err).toBeGreaterThan(0);
  });

  it('y el mejor es 1978, con 0,63 %', () => {
    const a = sidney.find(x => x.anio === 1978)!;
    expect(Math.abs(corridaDe(a.kc_eo, a.dias).tp_mm / a.tp - 1) * 100).toBeCloseTo(0.63, 1);
  });

  it('el reparto de los días no cambia el Tp acumulado: sólo importa la Eo total', () => {
    // Misma Kc·Eo total, en 60 días o en 120: la ecuación 2 es lineal en Eo.
    expect(corridaDe(300, 60).tp_mm).toBeCloseTo(corridaDe(300, 120).tp_mm, 9);
    expect(corridaDe(300, 90).tp_mm).toBeCloseTo(0.435 * 300, 6);
  });
});

describe('la Tabla 1 cierra su propio balance de agua', () => {
  /**
   * `P − ET − drenaje` es el cambio de almacenaje de la temporada. No está
   * publicado, pero las otras tres columnas sí, así que se despeja — y lo que
   * sale tiene que caber en el perfil, porque si no la tabla sería imposible.
   */
  const ds = sidney.map(a => ({ anio: a.anio, dS: a.pptn - a.et - a.drenaje }));

  it('el cambio de almacenaje despejado va de −62 a +34 mm', () => {
    expect(Math.min(...ds.map(x => x.dS))).toBe(-62);
    expect(Math.max(...ds.map(x => x.dS))).toBe(34);
  });

  it('y cabe en un perfil arenoso de 90 cm, que es lo que hace creíble la tabla', () => {
    // Un perfil arenoso de 90 cm almacena del orden de 100 mm de agua útil. El
    // swing más grande son 62 mm: entra, y por poco. Si hubiera dado 200 mm,
    // alguna columna de la tabla estaría mal leída.
    for (const x of ds) expect(Math.abs(x.dS), `${x.anio}`).toBeLessThan(100);
    expect(MODELO_WIGHT_HANKS.capas_cm.reduce((s, c) => s + c, 0)).toBe(90);
  });

  it('los años con drenaje son los tres de lluvia alta, y ninguno se seca', () => {
    const conDrenaje = sidney.filter(a => a.drenaje > 0);
    expect(conDrenaje.map(a => a.anio)).toEqual([1969, 1972, 1975]);
    // 1969 drena 117 mm con 338 de lluvia: la lluvia más alta de la serie.
    expect(Math.max(...sidney.map(a => a.pptn))).toBe(338);
  });

  /**
   * La evaporación del suelo también se despeja: `E = ET − T` y
   * `Ep = Kc·Eo − Tp`. El cociente dice qué fracción de la demanda de
   * evaporación se cumplió, y la ecuación 6 lo acota por abajo y por arriba.
   */
  it('E/Ep da 0,52 de media y los doce años entran en 0,40-0,60', () => {
    const eep = sidney.map(a => ({ anio: a.anio, r: (a.et - a.t) / (a.kc_eo - a.tp) }));
    const media = eep.reduce((s, x) => s + x.r, 0) / eep.length;
    expect(media).toBeCloseTo(0.52, 2);
    for (const x of eep) {
      expect(x.r, `${x.anio}`).toBeGreaterThan(0.40);
      expect(x.r, `${x.anio}`).toBeLessThan(0.60);
    }
    // El más bajo es 1977 otra vez: el año seco evapora menos de lo que podría
    // porque no hubo agua en superficie que evaporar.
    expect([...eep].sort((a, b) => a.r - b.r)[0]!.anio).toBe(1977);
  });

  it('el índice T/Tp publicado va de 0,40 a 0,98, y el techo no se toca', () => {
    const ttp = sidney.map(a => a.t / a.tp);
    expect(Math.min(...ttp)).toBeCloseTo(0.402, 3);
    expect(Math.max(...ttp)).toBeCloseTo(0.985, 3);
    // Ni el año más húmedo llega a 1: siempre hay algún día con el perfil seco.
    for (const x of ttp) expect(x).toBeLessThan(1);
  });
});

describe('el balance, día por día, a mano', () => {
  /**
   * Una capa de 60 mm llena, tres días secos de Eo 8 mm con b 0,5 y Kc 0,85.
   * Se puede seguir con lápiz:
   *
   *   Kc·Eo = 6,8    Tp = 0,5 × 6,8 = 3,4    Ep = 6,8 − 3,4 = 3,4
   *   día 1: SWS/AW = 1      → T = 3,4            E = 3,4/√1 = 3,400
   *   día 2: SWS/AW = 0,8867 → T = 3,014667       E = 3,4/√2 = 2,404163
   *   día 3: SWS/AW = 0,7964 → T = 2,707600       E = 3,4/√3 = 1,962991
   */
  const r = correrBalanceForraje({
    dias: secos(3),
    capas: [{ espesor_cm: 30, aw_mm: 60, sws_inicial_mm: 60, agua_bajo_el_limite_mm: 0 }],
    b_constante: 0.5,
  })!;

  it('los tres días dan lo que da el lápiz', () => {
    expect(r.serie.map(d => d.tp_mm)).toEqual([3.4, 3.4, 3.4]);
    expect(r.serie[0]!.t_mm).toBeCloseTo(3.4, 6);
    expect(r.serie[1]!.t_mm).toBeCloseTo(3.014667, 6);
    expect(r.serie[2]!.t_mm).toBeCloseTo(2.707600, 6);
    expect(r.serie[0]!.e_suelo_mm).toBeCloseTo(3.4, 6);
    expect(r.serie[1]!.e_suelo_mm).toBeCloseTo(2.404163, 6);
    expect(r.serie[2]!.e_suelo_mm).toBeCloseTo(1.962991, 6);
  });

  it('y los acumulados cierran', () => {
    expect(r.tp_mm).toBeCloseTo(10.2, 9);
    expect(r.t_mm).toBeCloseTo(9.122266, 5);
    expect(r.indice!).toBeCloseTo(0.894340, 6);
    expect(r.e_suelo_mm).toBeCloseTo(7.767154, 5);
    expect(r.et_mm).toBeCloseTo(16.889420, 5);
    expect(r.drenaje_mm).toBe(0);
    expect(r.almacenaje_final_mm).toBeCloseTo(43.110580, 5);
  });

  it('el reloj de la ecuación 6 cuenta 1, 2, 3 desde el arranque', () => {
    expect(r.serie.map(d => d.dias_secos)).toEqual([1, 2, 3]);
  });
});

describe('el agua se conserva, que es la condición para que el índice valga algo', () => {
  const casos: Array<[string, Parameters<typeof correrBalanceForraje>[0]]> = [
    ['tres días secos', {
      dias: secos(3), capas: tresCapasDe30(90, 1, 0), b_constante: 0.5,
    }],
    ['una lluvia que desborda el perfil', {
      dias: [{ pptn_mm: 100, eo_mm: 8 }, ...secos(4)], capas: tresCapasDe30(90, 0, 0),
      b_constante: 0.5,
    }],
    ['una capa que se agota del todo', {
      dias: secos(5),
      capas: [{ espesor_cm: 30, aw_mm: 10, sws_inicial_mm: 10, agua_bajo_el_limite_mm: 0 }],
      b_constante: 0.5,
    }],
    ['con colchón de aire seco, que deja el almacenaje negativo', {
      dias: [...secos(20), { pptn_mm: 30, eo_mm: 8 }, ...secos(20)],
      capas: [{ espesor_cm: 30, aw_mm: 40, sws_inicial_mm: 40, agua_bajo_el_limite_mm: 15 }],
    }],
    ['noventa días de lluvia salteada', {
      dias: Array.from({ length: 90 }, (_, i) => ({
        pptn_mm: i % 7 === 0 ? 12 : 0, eo_mm: 3.8,
      })),
      capas: tresCapasDe30(120, 0.6, 10),
    }],
  ];

  for (const [nombre, entradas] of casos) {
    it(`${nombre}: P + S₀ − (ET + drenaje + S₁) = 0`, () => {
      const r = correrBalanceForraje(entradas)!;
      expect(Math.abs(r.cierre_mm)).toBeLessThan(1e-9);
    });
  }

  it('T nunca pasa a Tp, ningún día, y el índice queda en [0, 1]', () => {
    for (const [, entradas] of casos) {
      const r = correrBalanceForraje(entradas)!;
      for (const d of r.serie) expect(d.t_mm).toBeLessThanOrEqual(d.tp_mm + 1e-12);
      expect(r.indice!).toBeGreaterThanOrEqual(0);
      expect(r.indice!).toBeLessThanOrEqual(1);
    }
  });

  it('ET es T más E, por definición', () => {
    for (const [, entradas] of casos) {
      const r = correrBalanceForraje(entradas)!;
      expect(r.et_mm).toBeCloseTo(r.t_mm + r.e_suelo_mm, 9);
    }
  });
});

describe('las cotas del modelo', () => {
  it('con el perfil lleno y lluvia de sobra el índice es exactamente 1, y lo demás drena', () => {
    const r = correrBalanceForraje({
      dias: [{ pptn_mm: 100, eo_mm: 8 }, ...secos(4)],
      capas: tresCapasDe30(90, 0, 0),
      b_constante: 0.5,
    })!;
    expect(r.indice).toBe(1);
    expect(r.tp_mm).toBeCloseTo(17, 9);
    expect(r.drenaje_mm).toBeCloseTo(10, 9);  // 100 de lluvia en 90 de perfil
  });

  it('cuando la capa se agota, lo último que queda se reparte y después todo es cero', () => {
    const r = correrBalanceForraje({
      dias: secos(5),
      capas: [{ espesor_cm: 30, aw_mm: 10, sws_inicial_mm: 10, agua_bajo_el_limite_mm: 0 }],
      b_constante: 0.5,
    })!;
    expect(r.serie[1]!.t_mm).toBeCloseTo(1.088, 6);
    expect(r.serie[1]!.e_suelo_mm).toBeCloseTo(2.112, 6);
    // Los 3,2 mm que quedaban después del día 1, repartidos entre los dos.
    expect(r.serie[1]!.t_mm + r.serie[1]!.e_suelo_mm).toBeCloseTo(3.2, 6);
    for (const d of r.serie.slice(2)) {
      expect(d.t_mm).toBe(0);
      expect(d.e_suelo_mm).toBe(0);
    }
    expect(r.indice!).toBeCloseTo(0.264, 6);
  });

  it('más lluvia nunca baja el índice', () => {
    let anterior = -1;
    for (const total of [0, 5, 10, 20, 40, 80, 160]) {
      const r = correrBalanceForraje({
        dias: Array.from({ length: 60 }, (_, i) => ({
          pptn_mm: i % 10 === 0 ? total / 6 : 0, eo_mm: 8,
        })),
        capas: tresCapasDe30(90, 0.5, 0),
      })!;
      expect(r.indice!, `${total} mm`).toBeGreaterThanOrEqual(anterior);
      anterior = r.indice!;
    }
    expect(anterior).toBeCloseTo(0.563340, 5);
  });
});

describe('cada degradación empuja el índice para arriba, que es lo que promete', () => {
  /**
   * Esto no es un detalle de implementación: es el contrato de
   * `motor-de-calculo`. Si una degradación empujara para abajo, la advertencia
   * estaría mintiendo sobre la dirección del error, y para dimensionar una
   * carga animal la dirección es lo único que importa.
   */
  it('no declarar el agua bajo el límite inferior da un índice MÁS alto', () => {
    const dias = [...secos(20), { pptn_mm: 30, eo_mm: 8 }, ...secos(20)];
    const capa = (bajo?: number): CapaDeSuelo[] =>
      [{ espesor_cm: 30, aw_mm: 40, sws_inicial_mm: 40, agua_bajo_el_limite_mm: bajo }];
    const sin = correrBalanceForraje({ dias, capas: capa(undefined) })!;
    const con = correrBalanceForraje({ dias, capas: capa(15) })!;
    expect(sin.indice!).toBeCloseTo(0.213862, 5);
    expect(con.indice!).toBeCloseTo(0.189985, 5);
    expect(sin.indice!).toBeGreaterThan(con.indice!);
    expect(sin.advertencias).toContain(ADVERTENCIAS.sin_agua_bajo_el_limite);
    expect(con.advertencias).not.toContain(ADVERTENCIAS.sin_agua_bajo_el_limite);
  });

  it('no aplicar la actividad radicular de las capas 2 y 3 da un índice MÁS alto', () => {
    const indice = (act?: number) => correrBalanceForraje({
      dias: secos(40),
      capas: [
        { espesor_cm: 30, aw_mm: 30, sws_inicial_mm: 30, agua_bajo_el_limite_mm: 0 },
        { espesor_cm: 30, aw_mm: 30, sws_inicial_mm: 30, actividad_radicular: act },
        { espesor_cm: 30, aw_mm: 30, sws_inicial_mm: 30, actividad_radicular: act },
      ],
    })!.indice!;
    expect(indice(undefined)).toBeCloseTo(0.586994, 5);
    expect(indice(0.5)).toBeCloseTo(0.524154, 5);
    expect(indice(0)).toBeCloseTo(0.096993, 5);
    expect(indice(undefined)).toBeGreaterThan(indice(0.5));
    expect(indice(0.5)).toBeGreaterThan(indice(0));
  });

  it('el aviso de escurrimiento nulo sale siempre, porque el supuesto es del modelo', () => {
    const r = correrBalanceForraje({ dias: secos(90, 3.8), capas: tresCapasDe30(90, 1, 5) })!;
    expect(r.advertencias).toContain(ADVERTENCIAS.escorrentia_nula);
  });

  it('el b por defecto se avisa, y no se avisa cuando la curva viene día por día', () => {
    const conCurva = correrBalanceForraje({
      dias: Array.from({ length: 90 }, (_, i) => ({
        pptn_mm: 0, eo_mm: 3.8, b: 0.3 + 0.3 * Math.sin((Math.PI * i) / 90),
      })),
      capas: tresCapasDe30(90, 1, 5),
    })!;
    expect(conCurva.advertencias).not.toContain(ADVERTENCIAS.b_por_defecto);
    const sinCurva = correrBalanceForraje({ dias: secos(90, 3.8), capas: tresCapasDe30(90, 1, 5) })!;
    expect(sinCurva.advertencias).toContain(ADVERTENCIAS.b_por_defecto);
  });

  it('una temporada fuera de los 68-99 días de la validación se avisa', () => {
    const corta = correrBalanceForraje({ dias: secos(30, 3.8), capas: tresCapasDe30(90, 1, 5) })!;
    expect(corta.advertencias).toContain(ADVERTENCIAS.temporada_fuera_de_rango);
    const buena = correrBalanceForraje({ dias: secos(90, 3.8), capas: tresCapasDe30(90, 1, 5) })!;
    expect(buena.advertencias).not.toContain(ADVERTENCIAS.temporada_fuera_de_rango);
    expect(TEMPORADA_DE_LA_PRUEBA.minimo_dias).toBe(Math.min(...sidney.map(a => a.dias)));
    expect(TEMPORADA_DE_LA_PRUEBA.maximo_dias).toBe(Math.max(...sidney.map(a => a.dias)));
  });

  it('una Eo fuera del envolvente de la prueba se avisa', () => {
    const alta = correrBalanceForraje({ dias: secos(90, 12), capas: tresCapasDe30(90, 1, 5) })!;
    expect(alta.advertencias).toContain(ADVERTENCIAS.eo_fuera_de_rango);
    const adentro = correrBalanceForraje({ dias: secos(90, 3.8), capas: tresCapasDe30(90, 1, 5) })!;
    expect(adentro.advertencias).not.toContain(ADVERTENCIAS.eo_fuera_de_rango);
    // El envolvente sale de la tabla, y los doce años tienen que caer adentro.
    const eos = sidney.map(a => ({
      anio: a.anio, eo: a.kc_eo / a.dias / MODELO_WIGHT_HANKS.kc,
    }));
    for (const x of eos) {
      expect(x.eo, `${x.anio}`).toBeGreaterThanOrEqual(EO_DIARIA_DE_LA_PRUEBA.minimo_mm);
      expect(x.eo, `${x.anio}`).toBeLessThanOrEqual(EO_DIARIA_DE_LA_PRUEBA.maximo_mm);
    }
    // Y los extremos son los que el módulo declara haber medido: 1968 abajo,
    // 1977 arriba, que es otra vez el año de la temporada corta.
    const ordenados = [...eos].sort((a, b) => a.eo - b.eo);
    expect(ordenados[0]!.anio).toBe(EO_DIARIA_DE_LA_PRUEBA.medido.anio_minimo);
    expect(ordenados[0]!.eo).toBeCloseTo(EO_DIARIA_DE_LA_PRUEBA.medido.minimo_mm, 2);
    expect(ordenados[11]!.anio).toBe(EO_DIARIA_DE_LA_PRUEBA.medido.anio_maximo);
    expect(ordenados[11]!.eo).toBeCloseTo(EO_DIARIA_DE_LA_PRUEBA.medido.maximo_mm, 2);
  });

  it('una capa que arranca con más agua que su capacidad se recorta y se avisa', () => {
    const r = correrBalanceForraje({
      dias: secos(90, 3.8),
      capas: [{ espesor_cm: 30, aw_mm: 30, sws_inicial_mm: 999, agua_bajo_el_limite_mm: 0 }],
    })!;
    expect(r.almacenaje_inicial_mm).toBe(30);
    expect(r.advertencias).toContain(ADVERTENCIAS.sws_inicial_recortado);
  });
});

describe('lo que devuelve null, y por qué no devuelve cero', () => {
  it('sin días no hay balance', () => {
    expect(correrBalanceForraje({ dias: [], capas: tresCapasDe30(90) })).toBeNull();
  });

  it('sin capas tampoco', () => {
    expect(correrBalanceForraje({ dias: secos(90, 3.8), capas: [] })).toBeNull();
  });

  /**
   * Una capa con `AW` en cero no tiene cociente de humedad: la ecuación 3
   * dividiría por cero. Devolver un índice de cero diría «no hay agua» cuando
   * lo que no hay es capa, y eso después se multiplica por un `Yp` y sale
   * impreso como «0 kg de pasto».
   */
  it('una capa sin capacidad de almacenaje devuelve null, no un índice en cero', () => {
    expect(correrBalanceForraje({
      dias: secos(90, 3.8),
      capas: [{ espesor_cm: 30, aw_mm: 0, sws_inicial_mm: 0 }],
    })).toBeNull();
    // Y alcanza con que una de las tres esté en cero.
    expect(correrBalanceForraje({
      dias: secos(90, 3.8),
      capas: [
        { espesor_cm: 30, aw_mm: 30, sws_inicial_mm: 30 },
        { espesor_cm: 30, aw_mm: 0, sws_inicial_mm: 0 },
        { espesor_cm: 30, aw_mm: 30, sws_inicial_mm: 30 },
      ],
    })).toBeNull();
  });

  it('con Eo en cero todos los días el índice es null y no 0/0', () => {
    const r = correrBalanceForraje({ dias: secos(90, 0), capas: tresCapasDe30(90, 1, 0) })!;
    expect(r.tp_mm).toBe(0);
    expect(r.indice).toBeNull();
    expect(Number.isNaN(r.indice as unknown as number)).toBe(false);
  });
});

describe('el umbral de mojado, que es una decisión nuestra y no de la fuente', () => {
  it('con el umbral en cero una llovizna reinicia el reloj; con 1 mm no', () => {
    const dias: DiaDeBalance[] = [...secos(5), { pptn_mm: 0.2, eo_mm: 8 }, ...secos(3)];
    const capas: CapaDeSuelo[] = [
      { espesor_cm: 30, aw_mm: 60, sws_inicial_mm: 60, agua_bajo_el_limite_mm: 0 },
    ];
    const reinicia = correrBalanceForraje({ dias, capas, b_constante: 0.5 })!;
    const no = correrBalanceForraje({ dias, capas, b_constante: 0.5, umbral_mojado_mm: 1 })!;
    expect(reinicia.serie[5]!.dias_secos).toBe(1);
    expect(no.serie[5]!.dias_secos).toBe(6);
    // Reiniciar el reloj evapora más, así que queda menos agua y el índice baja.
    expect(reinicia.e_suelo_mm).toBeGreaterThan(no.e_suelo_mm);
    expect(reinicia.indice!).toBeLessThan(no.indice!);
  });
});

describe('tresCapasDe30, el reparto que se usa cuando sólo se tiene el total', () => {
  it('reparte el agua útil en tres capas iguales de 30 cm', () => {
    const capas = tresCapasDe30(120, 1, 8);
    expect(capas).toHaveLength(3);
    expect(capas.map(c => c.espesor_cm)).toEqual([30, 30, 30]);
    expect(capas.map(c => c.aw_mm)).toEqual([40, 40, 40]);
    expect(capas.map(c => c.sws_inicial_mm)).toEqual([40, 40, 40]);
    // El colchón de aire seco va sólo en la superficial, que es la única que
    // evapora.
    expect(capas[0]!.agua_bajo_el_limite_mm).toBe(8);
    expect(capas[1]!.agua_bajo_el_limite_mm).toBeUndefined();
  });

  it('la fracción inicial se recorta a [0, 1]', () => {
    expect(tresCapasDe30(90, 2)[0]!.sws_inicial_mm).toBe(30);
    expect(tresCapasDe30(90, -1)[0]!.sws_inicial_mm).toBe(0);
    expect(tresCapasDe30(90, 0.5)[0]!.sws_inicial_mm).toBe(15);
  });

  it('la geometría es la del trabajo: tres capas, 90 cm', () => {
    expect(MODELO_WIGHT_HANKS.capas_cm).toEqual([30, 30, 30]);
    expect(tresCapasDe30(90).reduce((s, c) => s + c.espesor_cm, 0)).toBe(90);
  });
});

describe('lo que este módulo NO hace, dicho en un test', () => {
  /**
   * Un test que fija un límite de alcance. Si alguien agrega acá la
   * multiplicación por `Yp`, esto no cierra — y tiene que no cerrar, porque el
   * kilo sin una fuente para `Yp` es el número plausible y equivocado que la
   * app no puede imprimir.
   */
  it('el resultado no tiene ningún campo en kg: devuelve una fracción', () => {
    const r = correrBalanceForraje({ dias: secos(90, 3.8), capas: tresCapasDe30(90, 1, 5) })!;
    for (const clave of Object.keys(r)) {
      expect(clave).not.toMatch(/kg|rend|forraje|produccion/i);
    }
    expect(r.indice!).toBeLessThanOrEqual(1);
  });

  it('y la serie de validación sigue siendo la de forrajeMedido, sin tocar', () => {
    expect(SERIE_WIGHT_HANKS).toHaveLength(15);
    expect(sidney).toHaveLength(12);
  });
});
