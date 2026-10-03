import { describe, it, expect } from 'vitest';
import { clasificarAridez } from '@/lib/clima';
import {
  PIE_M, PULGADA_M, YARDA3_M3,
  TABLA_CORONA_AH590, CORONA_TRANSITABLE_MIN_M, coronaMinima,
  TABLA_TALUDES_AH590, TALUD_INTERNO_MIN_AH590, taludesMinimos,
  TABLA_REVANCHA_AH590, revanchaMinima,
  ASENTAMIENTO_RODILLO_PCT, ASENTAMIENTO_SIN_RODILLO_PCT, asentamientoPct,
  cotaCoronamiento,
  areaSeccionTrapecio, volumenSumaDeAreas,
  ZANJA_ANCHO_FONDO_MIN_M, ZANJA_TALUD_MAX, ZANJA_CAPA_MAX_M, zanjaAnclaje,
  PRESTAMO_DISPONIBLE_MIN,
  TABLA_PROFUNDIDAD_UTIL_AH590, INFILTRACION_NORMAL_MAX_MM_MES, profundidadUtilMinima,
  KC_ESPEJO_SOMERO, KC_ESPEJO_PROFUNDO_CALENTANDO, KC_ESPEJO_PROFUNDO_ENFRIANDO,
  factorEvaporacionEspejo, compararCotas,
} from '@/lib/represaDiseno';

// ─────────────────────────────────────────────────────────────────────────────
// Casos resueltos de AH-590. La función es ciega a las unidades, así que los
// ejemplos del manual se corren en pies tal cual están publicados: es la única
// forma de comparar contra el número impreso sin que una conversión propia se
// meta en el medio.
// ─────────────────────────────────────────────────────────────────────────────

describe('areaSeccionTrapecio — los dos casos resueltos de AH-590', () => {
  it('el ejemplo del texto: corona de 12 pies, 15 de alto, 3:1 y 3:1 → 855 ft²', () => {
    // «For a point along the centerline where the fill is 15 feet high, the
    // table shows that the end area at that point is 675 plus 180, or 855
    // square feet.»
    const a = areaSeccionTrapecio({ corona_m: 12, alto_m: 15, taludInterno: 3, taludExterno: 3 });
    expect(a).toBeCloseTo(855, 6);
  });

  it('y se descompone como el cuadro 17: 675 de taludes + 180 de corona', () => {
    // El cuadro 17 tiene una columna por los taludes y otra por el ancho de
    // corona, y la nota dice que se suman. Si la fórmula estuviera armada con
    // el ancho medio en vez de con esos dos términos daría lo mismo en total,
    // pero este test deja clavada la descomposición que publica el manual.
    const taludes = (15 * 15 * (3 + 3)) / 2;
    const corona  = 12 * 15;
    expect(taludes).toBeCloseTo(675, 6);
    expect(corona).toBeCloseTo(180, 6);
    expect(taludes + corona).toBeCloseTo(
      areaSeccionTrapecio({ corona_m: 12, alto_m: 15, taludInterno: 3, taludExterno: 3 }), 6);
  });

  it('la nota al pie del cuadro 17: 6,4 pies de alto, corona de 14 → 212 ft²', () => {
    // «6.4-foot 3:1 front and back slopes, 14-foot top width — 123 plus 89, or
    // 212 square feet for the section.»
    const a = areaSeccionTrapecio({ corona_m: 14, alto_m: 6.4, taludInterno: 3, taludExterno: 3 });
    expect(a).toBeCloseTo(212.48, 2);
    expect(Math.round(a)).toBe(212);
  });

  it('taludes asimétricos: el término cuadrático usa la suma, no el doble de uno', () => {
    // 3:1 aguas arriba y 2:1 aguas abajo es la primera fila del cuadro 16, que
    // es el caso corriente. Si el código hubiera usado 2·ti o 2·te el número
    // saldría un 20 % arriba o abajo y seguiría pareciendo razonable.
    const a = areaSeccionTrapecio({ corona_m: 3, alto_m: 4, taludInterno: 3, taludExterno: 2 });
    expect(a).toBeCloseTo(3 * 4 + (16 * 5) / 2, 6);   // 12 + 40 = 52
    expect(a).toBeCloseTo(52, 6);
  });

  it('altura cero o negativa no devuelve sección', () => {
    expect(areaSeccionTrapecio({ corona_m: 3, alto_m: 0, taludInterno: 3, taludExterno: 2 })).toBe(0);
    expect(areaSeccionTrapecio({ corona_m: 3, alto_m: -2, taludInterno: 3, taludExterno: 2 })).toBe(0);
  });
});

describe('volumenSumaDeAreas — el método del manual', () => {
  it('dos estaciones: el promedio de las áreas por la distancia', () => {
    // «the sum of the end areas at those two points multiplied by the distance
    // between these points and divided by 54» — dividir por 54 es dividir por 2
    // y por 27 (ft³ en una yd³). En SI queda la regla del trapecio.
    const yd3 = volumenSumaDeAreas([855, 675], 50) / 27;
    expect(yd3).toBeCloseTo(((855 + 675) * 50) / 54, 6);
  });

  it('una sola estación no define volumen', () => {
    expect(volumenSumaDeAreas([855], 50)).toBe(0);
    expect(volumenSumaDeAreas([], 50)).toBe(0);
    expect(volumenSumaDeAreas([855, 675], 0)).toBe(0);
  });

  it('un muro que baja a cero contra los estribos da la mitad del prisma', () => {
    // Perfil triangular: 0 - A - 0. El prisma de área constante A sobre el
    // mismo largo daría el doble. Es la corrección que `dimensionarMuro` ya
    // hace integrando el perfil, y acá queda verificada sobre el método.
    const L = 100, A = 200;
    expect(volumenSumaDeAreas([0, A, 0], L / 2)).toBeCloseTo(A * L / 2, 6);
  });
});

describe('zanjaAnclaje — el caso resuelto de la zanja', () => {
  it('8 pies de fondo, 4 de profundidad, 1,5:1 → 56 ft² y 367 yd³ en 177 pies', () => {
    // «End area = [8 + (1.5 × 4)]4 = 56 ft²  ·  Volume = 56 × 177 / 27 = 367 yd³»
    const z = zanjaAnclaje({ prof_m: 4 * PIE_M, largo_m: 177 * PIE_M, anchoFondo_m: 8 * PIE_M });
    const seccion_ft2 = z.seccion_m2 / (PIE_M * PIE_M);
    expect(seccion_ft2).toBeCloseTo(56, 1);
    // El volumen se devuelve redondeado al m³, así que se compara con una
    // yarda cúbica de tolerancia sobre los 367 que publica el manual.
    expect(Math.abs(z.volumen_m3 / YARDA3_M3 - 367)).toBeLessThan(1);
  });

  it('es trapecio y no rectángulo: con 1,5:1 la boca abre 3 m por metro de hondo', () => {
    const z = zanjaAnclaje({ prof_m: 1, largo_m: 10 });
    expect(z.anchoBoca_m).toBeCloseTo(z.anchoFondo_m + 2 * ZANJA_TALUD_MAX, 2);
    // Modelarla como rectángulo subestima la excavación: acá, un 55 %.
    const rectangulo = z.anchoFondo_m * z.prof_m * 10;
    expect(z.volumen_m3).toBeGreaterThan(rectangulo * 1.5);
  });

  it('un fondo más angosto que los 8 pies se corrige y se avisa', () => {
    const z = zanjaAnclaje({ prof_m: 1, largo_m: 10, anchoFondo_m: 1.2 });
    expect(z.anchoFondo_m).toBeCloseTo(ZANJA_ANCHO_FONDO_MIN_M, 2);
    expect(z.advertencias.join(' ')).toMatch(/8 pies/);
    expect(z.advertencias.join(' ')).toMatch(/topadora/);
  });

  it('taludes más parados que 1,5:1 también se corrigen', () => {
    const z = zanjaAnclaje({ prof_m: 1, largo_m: 10, talud: 0.5 });
    expect(z.talud).toBe(ZANJA_TALUD_MAX);
    expect(z.advertencias.length).toBeGreaterThan(0);
  });

  it('las capas de relleno salen de las 9 pulgadas máximas', () => {
    expect(ZANJA_CAPA_MAX_M).toBeCloseTo(9 * PULGADA_M, 10);
    expect(ZANJA_CAPA_MAX_M).toBeCloseTo(0.2286, 4);
    // Un metro de zanja son cinco capas de 23 cm, no una de un metro.
    expect(zanjaAnclaje({ prof_m: 1, largo_m: 10 }).capas).toBe(5);
  });

  it('sin profundidad no hay cómputo, y lo dice', () => {
    const z = zanjaAnclaje({ prof_m: 0, largo_m: 50 });
    expect(z.volumen_m3).toBe(0);
    expect(z.capas).toBe(0);
    expect(z.nota).toMatch(/escarificar/);
  });
});

describe('asentamiento — el 10 % que faltaba en el cómputo', () => {
  it('el ejemplo del manual: 7.029 yd³ + 10 % = 7.732 yd³', () => {
    const a = asentamientoPct(5);   // muro de 5 m, sin rodillo
    expect(a.pct).toBe(ASENTAMIENTO_SIN_RODILLO_PCT);
    const total = 7029 * (1 + a.pct / 100);
    expect(Math.round(total)).toBe(7732);
  });

  it('compactado en capas con rodillo baja al 5 %', () => {
    expect(asentamientoPct(5, true).pct).toBe(ASENTAMIENTO_RODILLO_PCT);
    expect(ASENTAMIENTO_RODILLO_PCT).toBe(5);
  });

  it('el aviso nombra los 20 pies por debajo de los cuales el manual asume que no es rolled fill', () => {
    expect(asentamientoPct(4).nota).toMatch(/20 pies/);
    // Un muro alto ya no recibe ese comentario: ahí conviene compactar.
    expect(asentamientoPct(9).nota).not.toMatch(/20 pies/);
  });
});

describe('coronaMinima — AH-590 contra el criterio que acequia tenía', () => {
  it('transcribe las cinco filas del manual', () => {
    expect(TABLA_CORONA_AH590.map(f => [f.alto_max_ft, f.minimo_ft])).toEqual([
      [10, 6], [14, 8], [19, 10], [24, 12], [34, 14],
    ]);
    // Y las versiones métricas son la conversión exacta, no un redondeo lindo.
    for (const f of TABLA_CORONA_AH590) {
      expect(f.minimo_m).toBeCloseTo(f.minimo_ft * 0.3048, 10);
    }
  });

  it('un muro de 2 m pide 1,83 m de corona, no 1 m', () => {
    // La tabla vieja de acequia daba 1,5 m sugerido y aceptaba 1,0 como mínimo.
    const c = coronaMinima(2);
    expect(c.minimo_m).toBeCloseTo(6 * PIE_M, 4);
    expect(c.minimo_m).toBeGreaterThan(1.5);
  });

  it('y la diferencia crece con la altura: a 5 m el mínimo publicado es 3,05 m', () => {
    // 5 m son 16,4 pies: fila de 15 a 19 → 10 pies. acequia sugería 2,5 m,
    // un 18 % por debajo del mínimo del manual, y como la base del muro es
    // corona + alto × (ti + te), ese error se iba derecho al volumen.
    const c = coronaMinima(5);
    expect(c.minimo_m).toBeCloseTo(10 * PIE_M, 4);
    expect(c.minimo_m / 2.5).toBeGreaterThan(1.2);
  });

  it('a 8 m el mínimo son 4,27 m: el 42 % más de lo que acequia sugería', () => {
    const c = coronaMinima(8);   // 26,2 pies → fila 25-34 → 14 pies
    expect(c.minimo_m).toBeCloseTo(14 * PIE_M, 4);
    expect(c.minimo_m / 3.0).toBeGreaterThan(1.4);
  });

  it('el mínimo crece monótonamente con la altura', () => {
    let previo = 0;
    for (const h of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      const m = coronaMinima(h).minimo_m;
      expect(m).toBeGreaterThanOrEqual(previo);
      previo = m;
    }
  });

  it('transitable por vehículo salta a 16 pies, que es huella más banquinas', () => {
    const c = coronaMinima(2, true);
    expect(c.minimo_m).toBeCloseTo(CORONA_TRANSITABLE_MIN_M, 4);
    expect(CORONA_TRANSITABLE_MIN_M).toBeCloseTo(4.877, 3);
    expect(c.nota).toMatch(/banquinas/);
  });

  it('más de 34 pies queda fuera de tabla y lo dice', () => {
    const c = coronaMinima(12);   // 39 pies
    expect(c.fueraDeTabla).toBe(true);
    expect(c.fila).toBeNull();
    expect(c.nota).toMatch(/ingeniero/);
    // Igual devuelve el último valor tabulado como piso, no null ni cero.
    expect(c.minimo_m).toBeCloseTo(14 * PIE_M, 4);
  });

  it('el hueco de la tabla entre 10 y 11 pies se resuelve conservador y se declara', () => {
    const c = coronaMinima(10.5 * PIE_M);
    expect(c.minimo_m).toBeCloseTo(8 * PIE_M, 4);   // la fila de arriba
    expect(c.nota).toMatch(/no dice nada/);
  });
});

describe('taludesMinimos — el cuadro 16 tiene dos filas, y eso importa', () => {
  it('las dos filas publicadas, con 3:1 aguas arriba en las dos', () => {
    expect(TABLA_TALUDES_AH590.map(f => [f.interno, f.externo])).toEqual([[3, 2], [3, 3]]);
    expect(TALUD_INTERNO_MIN_AH590).toBe(3);
  });

  it('la mezcla areno-arcillosa pide 3:1 aguas arriba, no 2,5:1', () => {
    // Es la corrección que más cambia la obra: acequia daba 2,5:1 interno para
    // muros de menos de 5 m, y el cuadro 16 no admite nada más parado que 3:1
    // en ninguna de sus dos filas. El lado de aguas arriba es el que desliza
    // con el vaciado rápido.
    const t = taludesMinimos('areno_arcilloso');
    expect(t.interno).toBe(3);
    expect(t.externo).toBe(2);
    expect(t.fueraDeTabla).toBe(false);
  });

  it('la arcilla no expansiva pide 3:1 de los dos lados', () => {
    const t = taludesMinimos('arcilloso_inelastico');
    expect(t.interno).toBe(3);
    expect(t.externo).toBe(3);
    expect(t.fueraDeTabla).toBe(false);
  });

  it('la arena limpia y la arcilla expansiva NO tienen fila: se declaran fuera de tabla', () => {
    // Es el punto del módulo: donde el manual se calla, acequia no inventa la
    // fila. Si algún día alguien «completa» la tabla con dos filas más, este
    // test se cae y hay que mostrar de dónde salieron.
    for (const clase of ['arenoso_superficial', 'arcilloso_elastico']) {
      const t = taludesMinimos(clase);
      expect(t.fueraDeTabla).toBe(true);
      expect(t.fila).toBeNull();
      expect(t.interno).toBeGreaterThanOrEqual(TALUD_INTERNO_MIN_AH590);
    }
    expect(taludesMinimos('arenoso_superficial').nota).toMatch(/impermeable/);
    expect(taludesMinimos('arcilloso_elastico').nota).toMatch(/agrieta/);
  });

  it('sin clase de suelo devuelve la fila más tendida', () => {
    const t = taludesMinimos(null);
    expect(t.externo).toBe(3);
    expect(t.fueraDeTabla).toBe(true);
  });

  it('ninguna respuesta queda por debajo del mínimo publicado', () => {
    for (const clase of ['areno_arcilloso', 'arcilloso_inelastico', 'arcilloso_elastico', 'arenoso_superficial', null, 'inventado']) {
      const t = taludesMinimos(clase);
      expect(t.interno).toBeGreaterThanOrEqual(3);
      expect(t.externo).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('revanchaMinima — la fija el largo del vaso, no la altura del muro', () => {
  it('transcribe las tres filas', () => {
    expect(TABLA_REVANCHA_AH590.map(f => [f.largo_max_ft, f.minimo_ft])).toEqual([
      [660, 1.0], [1320, 1.5], [2640, 2.0],
    ]);
  });

  it('un vaso de 150 m: un pie', () => {
    expect(revanchaMinima(150).minimo_m).toBeCloseTo(1.0 * PIE_M, 4);
  });

  it('en los 660 pies exactos manda la fila de 1,5, porque el manual dice «less than»', () => {
    expect(revanchaMinima(660 * PIE_M).minimo_m).toBeCloseTo(1.5 * PIE_M, 4);
    expect(revanchaMinima(659 * PIE_M).minimo_m).toBeCloseTo(1.0 * PIE_M, 4);
  });

  it('un vaso de 600 m: dos pies', () => {
    expect(revanchaMinima(600).minimo_m).toBeCloseTo(2.0 * PIE_M, 4);
  });

  it('pasada la media milla la tabla no responde y lo dice', () => {
    const r = revanchaMinima(1000);
    expect(r.fueraDeTabla).toBe(true);
    expect(r.nota).toMatch(/ingeniero/);
    expect(r.minimo_m).toBeCloseTo(2.0 * PIE_M, 4);
  });

  it('la nota explica que lo que la revancha frena es la ola', () => {
    expect(revanchaMinima(150).nota).toMatch(/ola/);
  });

  it('sin largo de vaso cae a la primera fila y no a cero', () => {
    for (const v of [null, undefined, 0, -5, NaN]) {
      expect(revanchaMinima(v).minimo_m).toBeCloseTo(1.0 * PIE_M, 4);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// La cota del coronamiento. Es el número con el que se construye la obra, y el
// que estaba corto.
// ─────────────────────────────────────────────────────────────────────────────

describe('cotaCoronamiento — las tres cosas que se apilan sobre el vertedero', () => {
  it('el ejemplo del manual: Hp 1,3 pies + revancha 1 pie = 2,3 pies sobre la cresta', () => {
    // «If the freeboard is 1.0 foot, the top of the dam should be constructed
    // 2.3 feet higher than the spillway crest.»
    const c = cotaCoronamiento({
      cotaVertedero_m: 100,
      cargaVertedero_m: 1.3 * PIE_M,
      revancha_m: 1.0 * PIE_M,
    });
    expect(c.sobreVertedero_m / PIE_M).toBeCloseTo(2.3, 2);
  });

  it('el segundo ejemplo del manual: Hp 1,4 + 1 = 2,4 pies', () => {
    const c = cotaCoronamiento({
      cotaVertedero_m: 0,
      cargaVertedero_m: 1.4 * PIE_M,
      revancha_m: 1.0 * PIE_M,
    });
    expect(c.sobreVertedero_m / PIE_M).toBeCloseTo(2.4, 2);
  });

  it('la carga del vertedero puede ser MAYOR que la revancha: por eso faltaba la mitad', () => {
    // Es el hallazgo. acequia hacía cota = nivel + revancha, o sea que de los
    // 2,3 pies del ejemplo subía 1,0: se quedaba un 57 % corta antes de contar
    // el asentamiento.
    const Hp = 1.3 * PIE_M, rev = 1.0 * PIE_M;
    expect(Hp).toBeGreaterThan(rev);
    const c = cotaCoronamiento({ cotaVertedero_m: 100, cargaVertedero_m: Hp, revancha_m: rev });
    const viejo = 100 + rev;
    expect(c.cotaAsentada_m).toBeGreaterThan(viejo);
    expect(c.cotaAsentada_m - viejo).toBeCloseTo(Hp, 3);
  });

  it('el asentamiento se aplica a la ALTURA sobre la fundación, no a la cota', () => {
    // Un 10 % de la cota sería un disparate: con cotas de 400 m daría 40 m de
    // sobrealto. Se aplica a la altura del muro, que es lo que dice el manual.
    const c = cotaCoronamiento({
      cotaVertedero_m: 400, cargaVertedero_m: 0.4, revancha_m: 0.3, cotaFundacion_m: 396,
    });
    expect(c.altoDisenado_m).toBeCloseTo(4.7, 3);       // 400 + 0,4 + 0,3 − 396
    expect(c.sobrealto_m).toBeCloseTo(0.47, 3);          // 10 %
    expect(c.altoConstruido_m).toBeCloseTo(5.17, 3);
    expect(c.cotaConstruida_m).toBeCloseTo(401.17, 3);
  });

  it('con rodillo el sobrealto es la mitad', () => {
    const base = { cotaVertedero_m: 400, cargaVertedero_m: 0.4, revancha_m: 0.3, cotaFundacion_m: 396 };
    const sin = cotaCoronamiento(base);
    const con = cotaCoronamiento({ ...base, compactadoEnCapas: true });
    expect(con.sobrealto_m).toBeCloseTo(sin.sobrealto_m / 2, 4);
  });

  it('sin carga de vertedero avisa, y el aviso nombra la pestaña donde está el número', () => {
    const c = cotaCoronamiento({ cotaVertedero_m: 100, cargaVertedero_m: 0, largoVaso_m: 200 });
    expect(c.advertencias.join(' ')).toMatch(/Cuenca/);
    expect(c.advertencias.join(' ')).toMatch(/crecida de diseño/);
  });

  it('una revancha puesta a mano por debajo del mínimo publicado se avisa pero se respeta', () => {
    const c = cotaCoronamiento({
      cotaVertedero_m: 100, cargaVertedero_m: 0.4, largoVaso_m: 600, revancha_m: 0.2,
    });
    expect(c.revancha_m).toBeCloseTo(0.2, 3);            // se respeta: el usuario manda
    expect(c.revanchaMinima_m).toBeCloseTo(2 * PIE_M, 3);
    expect(c.advertencias.join(' ')).toMatch(/menor que el mínimo/);
  });

  it('sin revancha explícita toma el mínimo que corresponde al largo del vaso', () => {
    const corto = cotaCoronamiento({ cotaVertedero_m: 0, cargaVertedero_m: 0.3, largoVaso_m: 100 });
    const largo = cotaCoronamiento({ cotaVertedero_m: 0, cargaVertedero_m: 0.3, largoVaso_m: 600 });
    expect(largo.revancha_m).toBeGreaterThan(corto.revancha_m);
    expect(largo.cotaAsentada_m).toBeGreaterThan(corto.cotaAsentada_m);
  });

  it('sin fundación informa la corona asentada y avisa que no puede dar el sobrealto', () => {
    const c = cotaCoronamiento({ cotaVertedero_m: 100, cargaVertedero_m: 0.4, revancha_m: 0.3 });
    expect(c.altoDisenado_m).toBeNull();
    expect(c.sobrealto_m).toBe(0);
    expect(c.cotaConstruida_m).toBeCloseTo(c.cotaAsentada_m, 6);
    expect(c.advertencias.join(' ')).toMatch(/asentamiento/);
  });
});

describe('préstamo disponible — 1,5 no es el factor de contracción', () => {
  it('es el mínimo que tiene que HABER en el préstamo, y está separado', () => {
    expect(PRESTAMO_DISPONIBLE_MIN).toBe(1.5);
    // El factor de contracción de acequia va de 1,10 a 1,25: son dos cosas
    // distintas y multiplicarlas entre sí o confundirlas da un 50 % de error.
    expect(PRESTAMO_DISPONIBLE_MIN).toBeGreaterThan(1.25);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Profundidad útil del vaso.
// ─────────────────────────────────────────────────────────────────────────────

describe('profundidadUtilMinima — figura 12 de AH-590', () => {
  it('transcribe las seis bandas', () => {
    expect(TABLA_PROFUNDIDAD_UTIL_AH590.map(f => [f.banda, f.min_ft, f.max_ft])).toEqual([
      ['Wet', 5, 5], ['Humid', 6, 7], ['Moist subhumid', 7, 8],
      ['Dry subhumid', 8, 10], ['Semiarid', 10, 12], ['Arid', 12, 14],
    ]);
  });

  it('la profundidad crece de húmedo a árido, sin saltos al revés', () => {
    const clases = ['Húmedo', 'Subhúmedo', 'Seco subhúmedo', 'Semiárido', 'Árido'];
    let previo = 0;
    for (const c of clases) {
      const p = profundidadUtilMinima(c);
      expect(p.minimo_m).toBeGreaterThan(previo);
      previo = p.minimo_m;
    }
  });

  it('un predio árido pide 14 pies de agua permanente: 4,27 m', () => {
    const p = profundidadUtilMinima('Árido');
    expect(p.banda).toBe('Arid');
    expect(p.minimo_m).toBeCloseTo(14 * PIE_M, 2);
  });

  it('un predio húmedo, 7 pies: 2,13 m', () => {
    const p = profundidadUtilMinima('Húmedo');
    expect(p.banda).toBe('Humid');
    expect(p.minimo_m).toBeCloseTo(7 * PIE_M, 2);
    // acequia no separa «Humid» de «Wet», así que usa la más profunda y lo dice.
    expect(p.nota).toMatch(/no separa|separa «Humid»/);
  });

  it('el hiperárido queda fuera de la figura y se declara', () => {
    const p = profundidadUtilMinima('Hiperárido');
    expect(p.banda).toBe('Arid');
    expect(p.advertencias.join(' ')).toMatch(/no cubre esta banda/);
  });

  it('todas las clases que produce clasificarAridez tienen banda', () => {
    // Guarda contra deriva: si mañana alguien renombra una clase de aridez en
    // clima.ts, este test se cae en vez de que la profundidad útil se vaya en
    // silencio a la banda intermedia del default.
    const ratios = [0.01, 0.1, 0.35, 0.6, 0.8, 1.4];
    const clases = ratios.map(r => clasificarAridez(r * 1000, 1000).clase);
    expect(new Set(clases).size).toBe(6);
    for (const c of clases) {
      const p = profundidadUtilMinima(c);
      expect(p.advertencias.join(' ')).not.toMatch(/Falta la clase de aridez/);
    }
  });

  it('sin clase de clima usa la banda intermedia y avisa', () => {
    const p = profundidadUtilMinima(null);
    expect(p.banda).toBe('Dry subhumid');
    expect(p.advertencias.join(' ')).toMatch(/Falta la clase de aridez/);
  });

  it('con infiltración mayor a 3 pulgadas por mes la figura deja de valer', () => {
    expect(INFILTRACION_NORMAL_MAX_MM_MES).toBeCloseTo(76.2, 1);
    const p = profundidadUtilMinima('Semiárido', 120);
    expect(p.advertencias.join(' ')).toMatch(/3 pulgadas por mes/);
    // Y no inventa un número nuevo: dice que el camino es bajar la infiltración.
    expect(p.advertencias.join(' ')).toMatch(/bajar la infiltración/);
  });

  it('con infiltración normal no avisa nada', () => {
    expect(profundidadUtilMinima('Semiárido', 40).advertencias).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Evaporación del espejo — FAO-56, cuadro 12.
// ─────────────────────────────────────────────────────────────────────────────

describe('factorEvaporacionEspejo — el 1,05 tenía razón y no tenía condición', () => {
  it('un vaso somero: 1,05 los doce meses', () => {
    const f = factorEvaporacionEspejo({ profMedia_m: 1.5, lat: -31, claseAridez: 'Semiárido' });
    expect(f.regimen).toBe('somero');
    expect(f.factor_mensual).toEqual(Array(12).fill(KC_ESPEJO_SOMERO));
    expect(KC_ESPEJO_SOMERO).toBe(1.05);
  });

  it('en el trópico la fila somera gana aunque el vaso sea hondo', () => {
    // La fuente pone las tres condiciones en la misma fila: «< 2 m depth OR in
    // subhumid climates OR tropics».
    const f = factorEvaporacionEspejo({ profMedia_m: 9, lat: -5, claseAridez: 'Semiárido' });
    expect(f.regimen).toBe('somero');
    expect(f.nota).toMatch(/trópico/);
  });

  it('y en clima subhúmedo o más húmedo también', () => {
    const f = factorEvaporacionEspejo({ profMedia_m: 9, lat: -31, claseAridez: 'Subhúmedo' });
    expect(f.regimen).toBe('somero');
    expect(f.factor_mensual.every(v => v === KC_ESPEJO_SOMERO)).toBe(true);
  });

  it('un embalse hondo en clima templado seco NO tiene factor constante', () => {
    // Es la mitad del hallazgo: FAO-56 le da dos valores y la nota 25 explica
    // por qué. Si alguien «simplifica» esto a un promedio anual, este test es
    // el que se cae.
    const f = factorEvaporacionEspejo({ profMedia_m: 8, lat: -31, claseAridez: 'Semiárido' });
    expect(f.regimen).toBe('profundo_templado');
    expect(new Set(f.factor_mensual).size).toBe(2);
    expect(f.factor_mensual).toContain(KC_ESPEJO_PROFUNDO_CALENTANDO);
    expect(f.factor_mensual).toContain(KC_ESPEJO_PROFUNDO_ENFRIANDO);
    expect(KC_ESPEJO_PROFUNDO_CALENTANDO).toBe(0.65);
    expect(KC_ESPEJO_PROFUNDO_ENFRIANDO).toBe(1.25);
  });

  it('el hemisferio invierte el calendario: enero se calienta en el sur y se enfría en el norte', () => {
    const sur   = factorEvaporacionEspejo({ profMedia_m: 8, lat: -31, claseAridez: 'Semiárido' });
    const norte = factorEvaporacionEspejo({ profMedia_m: 8, lat:  38, claseAridez: 'Semiárido' });
    expect(sur.factor_mensual[0]).toBe(KC_ESPEJO_PROFUNDO_CALENTANDO);
    expect(norte.factor_mensual[0]).toBe(KC_ESPEJO_PROFUNDO_ENFRIANDO);
    expect(sur.factor_mensual[6]).toBe(KC_ESPEJO_PROFUNDO_ENFRIANDO);   // julio
    expect(norte.factor_mensual[6]).toBe(KC_ESPEJO_PROFUNDO_CALENTANDO);
  });

  it('con la serie de temperatura la mitad que se calienta sale del dato, no del calendario', () => {
    // Serie austral: pico en enero, mínimo en julio.
    const temp = [26, 25, 22, 18, 14, 11, 11, 13, 16, 20, 23, 25];
    const f = factorEvaporacionEspejo({ profMedia_m: 8, lat: -31, claseAridez: 'Semiárido', temp_mensual_c: temp });
    expect(f.advertencias).toHaveLength(0);
    expect(f.nota).toMatch(/serie de temperatura/);
    // Seis meses de cada lado, como corresponde a un ciclo anual.
    const calentando = f.factor_mensual.filter(v => v === KC_ESPEJO_PROFUNDO_CALENTANDO).length;
    expect(calentando).toBeGreaterThanOrEqual(5);
    expect(calentando).toBeLessThanOrEqual(7);
  });

  it('sin temperatura usa el hemisferio y lo avisa', () => {
    const f = factorEvaporacionEspejo({ profMedia_m: 8, lat: -31, claseAridez: 'Semiárido' });
    expect(f.advertencias.join(' ')).toMatch(/hemisferio/);
  });

  it('entre 2 y 5 m la fuente no dice nada: se usa la fila somera y se declara el hueco', () => {
    const f = factorEvaporacionEspejo({ profMedia_m: 3.5, lat: -31, claseAridez: 'Semiárido' });
    expect(f.regimen).toBe('intermedio');
    expect(f.factor_mensual.every(v => v === KC_ESPEJO_SOMERO)).toBe(true);
    expect(f.advertencias.join(' ')).toMatch(/No se interpola/);
  });

  it('sin latitud ni temperatura no se afirma el régimen profundo', () => {
    const f = factorEvaporacionEspejo({ profMedia_m: 8 });
    expect(f.factor_mensual.every(v => v === KC_ESPEJO_SOMERO)).toBe(true);
    expect(f.advertencias.join(' ')).toMatch(/qué mitad del año/);
  });

  it('el promedio anual del régimen profundo es 0,95 y no es lo que se usa', () => {
    const f = factorEvaporacionEspejo({ profMedia_m: 8, lat: -31, claseAridez: 'Semiárido' });
    expect(f.factor_medio).toBeCloseTo((0.65 + 1.25) / 2, 3);
    expect(f.factor_mensual).not.toEqual(Array(12).fill(f.factor_medio));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Comparar candidatos por cota.
// ─────────────────────────────────────────────────────────────────────────────

describe('compararCotas — el vaso concentrado pierde menos', () => {
  const etp = Array(12).fill(120);   // 1.440 mm/año, un semiárido corriente

  it('para el mismo volumen, menos espejo es menos evaporación', () => {
    const c = compararCotas({
      candidatos: [
        { etiqueta: 'cota baja, espejo abierto', nivel_m: 100, volumen_m3: 10_000, area_espejo_m2: 10_000 },
        { etiqueta: 'cota alta, vaso angosto',   nivel_m: 103, volumen_m3: 10_000, area_espejo_m2: 4_000 },
      ],
      etp_mensual_mm: etp, lat: -31, claseAridez: 'Semiárido',
    });
    expect(c.mejorEvaporacion?.etiqueta).toBe('cota alta, vaso angosto');
    const [abierto, angosto] = c.candidatos;
    expect(abierto!.evaporacion_anual_m3).toBeCloseTo(angosto!.evaporacion_anual_m3 * 2.5, 0);
  });

  it('pone número a la pérdida: un metro de profundidad media en semiárido se va casi entero', () => {
    // 1 m de lámina embalsada contra 1.440 mm de ETP × 1,05: la evaporación
    // anual supera lo embalsado. No es una curiosidad: es la razón por la que
    // una represa somera en clima seco no llega a fin de verano.
    const c = compararCotas({
      candidatos: [{ etiqueta: 'somera', nivel_m: 100, volumen_m3: 10_000, area_espejo_m2: 10_000 }],
      etp_mensual_mm: etp, lat: -31, claseAridez: 'Semiárido',
    });
    expect(c.candidatos[0]!.profMedia_m).toBeCloseTo(1, 2);
    expect(c.candidatos[0]!.lamina_anual_mm).toBe(Math.round(1440 * 1.05));
    expect(c.candidatos[0]!.perdida_anual_frac).toBeGreaterThan(1);
  });

  it('informa la tierra por m³ de agua, y el costo si hay precio', () => {
    const c = compararCotas({
      candidatos: [
        { etiqueta: 'A', nivel_m: 100, volumen_m3: 10_000, area_espejo_m2: 5_000, banco_m3: 2_000 },
        { etiqueta: 'B', nivel_m: 102, volumen_m3: 20_000, area_espejo_m2: 7_000, banco_m3: 6_000 },
      ],
      etp_mensual_mm: etp, lat: -31, claseAridez: 'Semiárido', precio_m3_tierra: 4,
    });
    expect(c.candidatos[0]!.tierra_por_agua).toBeCloseTo(0.2, 3);
    expect(c.candidatos[0]!.costo_por_m3_agua).toBeCloseTo(0.8, 3);
    expect(c.candidatos[1]!.tierra_por_agua).toBeCloseTo(0.3, 3);
    expect(c.mejorMovimiento?.etiqueta).toBe('A');
  });

  it('sin banco no inventa un costo', () => {
    const c = compararCotas({
      candidatos: [{ etiqueta: 'A', nivel_m: 100, volumen_m3: 10_000, area_espejo_m2: 5_000 }],
      etp_mensual_mm: etp, precio_m3_tierra: 4, lat: -31,
    });
    expect(c.candidatos[0]!.tierra_por_agua).toBeNull();
    expect(c.candidatos[0]!.costo_por_m3_agua).toBeNull();
    expect(c.mejorMovimiento).toBeNull();
  });

  it('cuando el mejor por agua y el mejor por tierra no coinciden, lo dice', () => {
    const c = compararCotas({
      candidatos: [
        { etiqueta: 'muro bajo',  nivel_m: 100, volumen_m3: 10_000, area_espejo_m2: 10_000, banco_m3: 1_000 },
        { etiqueta: 'muro alto',  nivel_m: 104, volumen_m3: 10_000, area_espejo_m2: 3_000,  banco_m3: 6_000 },
      ],
      etp_mensual_mm: etp, lat: -31, claseAridez: 'Semiárido',
    });
    expect(c.mejorEvaporacion?.etiqueta).toBe('muro alto');
    expect(c.mejorMovimiento?.etiqueta).toBe('muro bajo');
    expect(c.nota).toMatch(/agua o la plata/);
  });

  it('sin ETP lo dice en vez de devolver cero evaporación en silencio', () => {
    const c = compararCotas({
      candidatos: [{ etiqueta: 'A', nivel_m: 100, volumen_m3: 1000, area_espejo_m2: 500 }],
      etp_mensual_mm: Array(12).fill(0), lat: -31,
    });
    expect(c.nota).toMatch(/Sin ETP/);
  });
});
