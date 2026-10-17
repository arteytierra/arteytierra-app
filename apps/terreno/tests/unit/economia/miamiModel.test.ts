/**
 * El Miami Model contra lo que sus propias fuentes afirman.
 *
 * Este archivo no verifica que las funciones «devuelvan un número»: verifica las
 * tres afirmaciones publicadas que se pueden reproducir con las ecuaciones —el
 * comportamiento abajo de 5 °C, la asíntota y la casi-linealidad de Walter— y
 * deja fijados los dos contrastes contra mediciones de este repositorio, que son
 * los que dicen para qué NO sirve el modelo.
 *
 * Fuentes: Lieth, «Vegetation and CO₂ Changes» (IIASA, 1978), pp. 103-104;
 * Scurlock, Cramer, Olson et al., GPPDI (ORNL), p. 14; Scurlock y Olson,
 * *Environmental Reviews* 10 (2002), pp. 99-102.
 */
import { describe, it, expect } from 'vitest';
import {
  MIAMI, DOMINIO_MIAMI, SESGO_PASTIZAL,
  nppMiami, nppPorLluvia, nppPorTemperatura, contrastarForraje,
} from '@/lib/miamiModel';

describe('las dos ecuaciones, como las imprime la fuente', () => {
  it('tiene los cuatro coeficientes publicados', () => {
    expect(MIAMI.ASINTOTA_G_M2_ANIO).toBe(3000);
    expect(MIAMI.T_A).toBe(1.315);
    expect(MIAMI.T_B).toBe(0.119);
    expect(MIAMI.P_K).toBe(0.000664);
  });

  it('las dos ramas tienden a 3.000 g MS/m²/año y nunca lo pasan', () => {
    expect(nppPorLluvia(100_000)).toBeCloseTo(3000, 2);
    expect(nppPorTemperatura(100)).toBeGreaterThan(2999.9);
    for (const p of [0, 500, 1500, 5000, 12_000]) expect(nppPorLluvia(p)).toBeLessThanOrEqual(3000);
    for (const t of [-25, 0, 15, 35]) expect(nppPorTemperatura(t)).toBeLessThan(3000);
  });

  it('sin lluvia no hay producción, y la rama de temperatura nunca llega a cero', () => {
    expect(nppPorLluvia(0)).toBe(0);
    expect(nppPorTemperatura(-25)).toBeGreaterThan(0);
  });
});

describe('«below 5 °C are temperature-limited»: la frase de la GPPDI, reproducida', () => {
  /**
   * La fuente dice *«regions with mean annual temperature below 5 °C are
   * temperature-limited, while the majority of warmer regions are limited by
   * precipitation»*. Con estos coeficientes el cruce a 5 °C cae en 597 mm, así
   * que la frase vale para los sitios que reciben más que eso — y el propio
   * Scurlock y Olson avisa que *«there was no simple temperature threshold»*.
   */
  it('a 5 °C las dos ramas se cruzan en 597 mm', () => {
    expect(nppPorTemperatura(5)).toBeCloseTo(982.2, 1);
    expect(nppPorLluvia(597.3)).toBeCloseTo(982.2, 0);
  });

  it('con lluvia suficiente, abajo de 5 °C manda la temperatura', () => {
    for (const t of [-5, 0, 4]) {
      const r = nppMiami(900, t);
      expect(r?.limitante).toBe('temperatura');
    }
  });

  it('arriba de 5 °C y con lluvia normal manda el agua', () => {
    for (const t of [12, 18, 25]) {
      const r = nppMiami(700, t);
      expect(r?.limitante).toBe('lluvia');
    }
  });

  it('no es un umbral: con poca lluvia manda el agua aunque haga frío', () => {
    // 2 °C y 200 mm: un desierto frío. La rama de temperatura da 762 y la de
    // lluvia 374, así que limita el agua pese a estar muy abajo de los 5 °C.
    const r = nppMiami(200, 2);
    expect(r?.limitante).toBe('lluvia');
  });

  it('cuando las dos ramas pasan juntas, no dice cuál limita', () => {
    const r = nppMiami(597, 5);
    expect(r?.limitante).toBe('empate');
    expect(r?.advertencias.some(a => /no dice si limita/.test(a))).toBe(true);
  });
});

describe('«Walter\'s ratio»: la rama de lluvia es casi una recta hasta los 1.000 mm', () => {
  /**
   * Scurlock y Olson: *«this approximates to a straight line for annual
   * precipitation below about 1000 mm […] its "saturation curve" […] only
   * becomes signiﬁcant at higher annual precipitation, about 3000 mm»*.
   */
  it('la pendiente cae menos de un 25 % entre 200 y 1.000 mm', () => {
    const pend = (p: number) => nppPorLluvia(p) / p;
    const caida = 1 - pend(1000) / pend(200);
    expect(caida).toBeLessThan(0.25);
  });

  it('a 3.000 mm la curvatura ya es grande, y el modelo avisa de ahí para arriba', () => {
    const pend = (p: number) => nppPorLluvia(p) / p;
    expect(1 - pend(3000) / pend(200)).toBeGreaterThan(0.5);
    const r = nppMiami(3200, 24);
    expect(r?.advertencias.some(a => /3\.000 mm/.test(a))).toBe(true);
    expect(nppMiami(2900, 24)?.advertencias.some(a => /3\.000 mm/.test(a))).toBe(false);
  });
});

describe('el dominio: afuera devuelve null, que es una respuesta', () => {
  it('rechaza lo que no es un número y lo imposible', () => {
    expect(nppMiami(NaN, 15)).toBeNull();
    expect(nppMiami(500, Number.POSITIVE_INFINITY)).toBeNull();
    expect(nppMiami(-1, 15)).toBeNull();
  });

  it('rechaza los climas que el modelo nunca vio', () => {
    expect(nppMiami(500, DOMINIO_MIAMI.TEMP_MIN_C - 1)).toBeNull();
    expect(nppMiami(500, DOMINIO_MIAMI.TEMP_MAX_C + 1)).toBeNull();
    expect(nppMiami(DOMINIO_MIAMI.LLUVIA_MAX_MM + 1, 25)).toBeNull();
    expect(nppMiami(500, DOMINIO_MIAMI.TEMP_MIN_C)).not.toBeNull();
  });
});

describe('Montecillo: el sesgo del modelo en pastizal, con las dos cifras publicadas', () => {
  /**
   * Caso resuelto, y las cuatro cifras salen de la misma ficha del ORNL
   * (`NPP_MNT.html`): medias anuales publicadas de 580 mm y 15,1 °C; NPP aérea
   * medida 669,2 g/m²/año y NPP total medida 1.676 g/m²/año, promedio 1985-1987.
   */
  const m = nppMiami(580, 15.1);

  it('el modelo da 959 g MS/m²/año y dice que limita el agua', () => {
    expect(m?.npp_ms_g_m2_anio).toBeCloseTo(958.9, 1);
    expect(m?.npp_ms_kg_ha_anio).toBe(9589);
    expect(m?.limitante).toBe('lluvia');
  });

  it('lee 1,75 veces BAJO contra la NPP total medida en ese mismo pastizal', () => {
    const TNPP_MEDIDA = 1676;
    expect(TNPP_MEDIDA / (m?.npp_ms_g_m2_anio ?? 1)).toBeCloseTo(1.75, 2);
  });

  it('la NPP aérea medida sola ya es el 70 % de todo lo que el modelo atribuye', () => {
    const ANPP_MEDIDA = 669.2;
    expect(ANPP_MEDIDA / (m?.npp_ms_g_m2_anio ?? 1)).toBeCloseTo(0.70, 2);
  });

  it('por eso el factor que separa «alto» de «imposible» es 2, y no 1', () => {
    // Scurlock y Olson sobre las medias de NPP total de pastizal de su propia
    // compilación: «more than twice as high» que los rangos de Lieth.
    expect(SESGO_PASTIZAL).toBe(2);
  });
});

describe('el contraste es un test de una sola dirección', () => {
  it('caza el predio frío y húmedo, que es el punto ciego de la escalera', () => {
    // La escalera de `prodForrajera` da 7.000 kg MS/ha/año con 900 mm, sin
    // mirar la temperatura. A −10 °C el modelo dice que todo el ecosistema
    // produce 2.265.
    const c = contrastarForraje(7000, 900, -10);
    expect(c?.npp_total_kg_ha_anio).toBe(2265);
    expect(c?.limitante).toBe('temperatura');
    expect(c?.fraccion_de_la_npp).toBeCloseTo(3.09, 2);
    expect(c?.veredicto).toBe('imposible');
    expect(c?.frase).toMatch(/Está mal por un margen/);
  });

  it('en la zona del sesgo documentado dice «alto» y no «imposible»', () => {
    const c = contrastarForraje(7000, 900, -5);
    expect(c?.fraccion_de_la_npp).toBeCloseTo(1.81, 2);
    expect(c?.veredicto).toBe('alto');
    expect(c?.frase).toMatch(/el modelo lee bajo/);
  });

  it('cuando la cifra entra, no la confirma: dice que no la descarta', () => {
    const c = contrastarForraje(7000, 1000, 20);
    expect(c?.veredicto).toBe('plausible');
    expect(c?.frase).toMatch(/no la confirma/);
  });

  it('le pasa las advertencias del modelo y rechaza lo que no se puede contrastar', () => {
    expect(contrastarForraje(3000, 500, 15)?.advertencias.some(a => /no forraje/.test(a))).toBe(true);
    expect(contrastarForraje(-1, 500, 15)).toBeNull();
    expect(contrastarForraje(3000, 500, 99)).toBeNull();
  });
});
