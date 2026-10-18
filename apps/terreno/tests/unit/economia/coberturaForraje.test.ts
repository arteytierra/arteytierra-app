/**
 * La banda de forraje por clase de cobertura, y las dos fracciones del lote 09.
 *
 * Tres cosas distintas:
 *
 * 1. **La banda no se puede separar de las mediciones.** `cobertura.ts` no
 *    guarda ningún kg/ha: los deriva de `FORRAJE_MEDIDO`. Acá se vuelven a
 *    derivar por otro camino y se comparan, que es el patrón de
 *    `skills/fuente-unica-de-verdad` aplicado a dos archivos de TypeScript.
 * 2. **Los dos errores que tenía el cálculo anterior quedan clavados.** Un
 *    predio todo manglar devolvía 0 con toda confianza y un predio con menos de
 *    1 % de clases pastoreables salía escalado hacia abajo por el protector de
 *    la división. Los dos casos están acá y los dos tienen que seguir dando lo
 *    que dan ahora.
 * 3. **Las fracciones del lote 09, contra su fuente.** Las cuatro filas de la
 *    Tabla 1 del ORNL, su cociente, y la fila en carbono que no se convierte
 *    pero cuyo cociente sí vale.
 */
import { describe, it, expect } from 'vitest';
import {
  bandaDeClase, forrajePorCobertura, CLASES_PASTOREABLES, CLASES_WC,
  type ItemCobertura,
} from '@/lib/cobertura';
import {
  FORRAJE_MEDIDO, FRACCION_AEREA_MONTECILLO, FRACCION_HERBACEA_DEL_SITIO,
  TNPP_MONTECILLO_POR_ANIO, TIPOS_SIN_DESCONTAR, fraccionAerea, fraccionHerbacea,
} from '@/lib/forrajeMedido';

/** Un predio de prueba: pares de clase y porcentaje. */
function predio(...partes: Array<[number, number]>): ItemCobertura[] {
  return partes.map(([valor, pct]) => ({
    clase: CLASES_WC[valor] ?? { valor, nombre: `Clase ${valor}`, color: '#999', grupo: 'suelo' as const },
    pct,
  }));
}

describe('la banda de cada clase sale de las mediciones y de ningún otro lado', () => {
  it('se puede derivar por otro camino y da lo mismo', () => {
    for (const clase of CLASES_PASTOREABLES) {
      // La misma regla, derivada a mano: la clase, y sólo secano.
      const sitios = FORRAJE_MEDIDO.filter(m => m.clase_wc === clase && m.insumos === 'secano');
      const banda = bandaDeClase(clase);
      if (sitios.length === 0) {
        expect(banda).toBeNull();
        continue;
      }
      expect(banda?.sitios).toBe(sitios.length);
      expect(banda?.kg_ms_ha_anio_min).toBe(Math.min(...sitios.map(m => m.kg_ms_ha_anio_min)));
      expect(banda?.kg_ms_ha_anio_max).toBe(Math.max(...sitios.map(m => m.kg_ms_ha_anio_max)));
    }
  });

  it('el arbolado va de 39 a 940 y son cuatro sotobosques', () => {
    // Manitou 39 bajo 78 % de densidad de copa, Waring's Woods 60 bajo
    // Pseudotsuga cerrado, Cascade Head 410 bajo aliso, Różańsko 378-940 en
    // robledal-carpinal. El techo está sesgado bajo: Nepal mide 1.300-1.700 y no
    // monta porque su área publicada cruza tres biomas.
    const b = bandaDeClase(10);
    expect(b).not.toBeNull();
    expect(b?.kg_ms_ha_anio_min).toBe(39);
    expect(b?.kg_ms_ha_anio_max).toBe(940);
    expect(b?.sitios).toBe(4);
  });

  it('el arbustal tiene un solo sitio, y es la frygana de Lesbos', () => {
    const b = bandaDeClase(20);
    expect(b?.kg_ms_ha_anio_min).toBe(300);
    expect(b?.kg_ms_ha_anio_max).toBe(5800);
    expect(b?.sitios).toBe(1);
  });

  it('el pastizal va de 350 a 10.630 en siete sitios: un factor 30', () => {
    const b = bandaDeClase(30);
    expect(b?.kg_ms_ha_anio_min).toBe(350);
    expect(b?.kg_ms_ha_anio_max).toBe(10630);
    expect(b?.sitios).toBe(7);
    expect((b?.kg_ms_ha_anio_max ?? 0) / (b?.kg_ms_ha_anio_min ?? 1)).toBeGreaterThan(30);
  });

  it('el cultivo tiene dos mediciones y ninguna sirve para la banda', () => {
    // Los 4.500 kg MS/ha/año que la app le asignaba al cultivo nunca tuvieron
    // fuente. El lote 12 trajo dos mediciones de INTA, las dos buenas, y la
    // banda sigue vacía: una está fertilizada con 115 kg N/ha y la otra recibió
    // 1.300 mm de riego. Un píxel de WorldCover no sabe nada de eso.
    expect(bandaDeClase(40)).toBeNull();
    expect(FORRAJE_MEDIDO.filter(m => m.clase_wc === 40)).toHaveLength(2);
    expect(FORRAJE_MEDIDO.filter(m => m.clase_wc === 40 && m.insumos === 'secano')).toHaveLength(0);
  });

  it('la banda sólo usa secano, y es lo único que la protege', () => {
    // Si el filtro se cae, un predio con un lote sembrado recibe la oferta de
    // una alfalfa bajo riego en el Monte: 21.035 kg MS/ha/año.
    for (const clase of CLASES_PASTOREABLES) {
      const banda = bandaDeClase(clase);
      if (banda === null) continue;
      const conInsumos = FORRAJE_MEDIDO.filter(
        m => m.clase_wc === clase && m.insumos !== 'secano',
      );
      for (const m of conInsumos) {
        expect(banda.kg_ms_ha_anio_max).toBeLessThan(m.kg_ms_ha_anio_max);
      }
    }
    const regada = FORRAJE_MEDIDO.find(m => m.insumos === 'riego');
    expect(regada?.kg_ms_ha_anio_max).toBe(21035);
    // Y es más agua de riego que la lluvia del sitio de secano más húmedo.
    const lluviaMaxSecano = Math.max(
      ...FORRAJE_MEDIDO.filter(m => m.insumos === 'secano' && m.lluvia_mm_max !== null)
        .map(m => m.lluvia_mm_max ?? 0),
    );
    // Es Puno, con 1.119 mm en La Raya, y no el Delta con 1.056: el techo de la
    // lluvia de secano está en la puna y no en el pastizal más húmedo.
    expect(lluviaMaxSecano).toBe(1119);
    expect(regada?.lluvia_mm_max).toBeGreaterThan(lluviaMaxSecano);
  });

  it('toda medición declara una clase pastoreable o declara que no sabe', () => {
    for (const m of FORRAJE_MEDIDO) {
      if (m.clase_wc === null) continue;
      expect(CLASES_PASTOREABLES).toContain(m.clase_wc);
      expect(CLASES_WC[m.clase_wc]).toBeDefined();
    }
  });
});

describe('la banda del predio', () => {
  it('un predio todo pastizal recibe la banda del pastizal entera', () => {
    const f = forrajePorCobertura(predio([30, 100]));
    expect(f).not.toBeNull();
    expect(f?.kg_ms_ha_anio_min).toBe(350);
    expect(f?.kg_ms_ha_anio_max).toBe(10630);
    expect(f?.pct_con_fuente).toBe(100);
    expect(f?.pct_sin_fuente).toBe(0);
    expect(f?.clases_sin_fuente).toEqual([]);
  });

  it('un predio todo arbolado recibe 39 a 940, no los 800 de antes', () => {
    // El 800 cayó adentro de la banda por accidente y era el mejor respaldado de
    // los cuatro pesos. Igual se fue: lo que hay no es un número, es un factor 24.
    const f = forrajePorCobertura(predio([10, 100]));
    expect(f?.kg_ms_ha_anio_min).toBe(39);
    expect(f?.kg_ms_ha_anio_max).toBe(940);
    expect(800).toBeGreaterThan(f?.kg_ms_ha_anio_min ?? 0);
    expect(800).toBeLessThan(f?.kg_ms_ha_anio_max ?? 0);
  });

  it('pondera por el porcentaje de cada clase, en los mínimos y en los máximos', () => {
    // Mitad monte, mitad pastizal: (39+350)/2 y (940+10.630)/2.
    const f = forrajePorCobertura(predio([10, 50], [30, 50]));
    expect(f?.kg_ms_ha_anio_min).toBe(195);
    expect(f?.kg_ms_ha_anio_max).toBe(5785);
    expect(f?.sitios).toBe(11);
  });

  it('el suelo desnudo no entra en el promedio, y el porcentaje lo dice', () => {
    const f = forrajePorCobertura(predio([30, 50], [60, 50]));
    expect(f?.kg_ms_ha_anio_min).toBe(350);
    expect(f?.kg_ms_ha_anio_max).toBe(10630);
    expect(f?.pct_con_fuente).toBe(50);
    // Multiplicar la banda por las hectáreas del predio sobreestimaría al doble,
    // y el 50 % está en la salida justamente para que no se haga.
    expect(f?.advertencias.join(' ')).not.toContain('queda afuera de la banda');
  });

  it('el cultivo queda afuera y se nombra', () => {
    const f = forrajePorCobertura(predio([30, 60], [40, 40]));
    expect(f?.kg_ms_ha_anio_min).toBe(350);
    expect(f?.pct_con_fuente).toBe(60);
    expect(f?.pct_sin_fuente).toBe(40);
    expect(f?.clases_sin_fuente).toEqual(['Cultivo']);
    expect(f?.advertencias.some(a => a.includes('40 %') && a.includes('cultivo'))).toBe(true);
  });

  it('un predio todo manglar devuelve null: antes devolvía 0', () => {
    // El manglar es «vegetación» para WorldCover, así que pasaba el guard, y el
    // numerador quedaba en cero con el denominador protegido en 1. El panel
    // imprimía «0 kg MS/ha·año» como si fuera una medición.
    expect(forrajePorCobertura(predio([95, 100]))).toBeNull();
    expect(forrajePorCobertura(predio([100, 100]))).toBeNull();
    expect(forrajePorCobertura(predio([80, 60], [50, 40]))).toBeNull();
  });

  it('medio punto de pastizal da la banda del pastizal, no la mitad', () => {
    // Con `Math.max(1, 0,5)` como denominador, el viejo cálculo devolvía la mitad
    // del peso del pastizal para cualquier predio con menos de 1 % pastoreable.
    const f = forrajePorCobertura(predio([30, 0.5], [100, 99.5]));
    expect(f?.kg_ms_ha_anio_min).toBe(350);
    expect(f?.kg_ms_ha_anio_max).toBe(10630);
    expect(f?.pct_con_fuente).toBe(0.5);
    expect(f?.advertencias.some(a => a.includes('0.5 %') || a.includes('0,5 %'))).toBe(true);
  });

  it('avisa que la clase sola no define el forraje cuando la banda es ancha', () => {
    const ancho = forrajePorCobertura(predio([30, 100]));
    expect(ancho?.advertencias.some(a => a.includes('factor 30'))).toBe(true);
    const angosto = forrajePorCobertura(predio([20, 100]));
    // Lesbos sola da 300-5.800, que también es ancho: 19 veces.
    expect(angosto?.advertencias.some(a => a.includes('factor 19'))).toBe(true);
  });
});

describe('lote 09 — la fracción aérea, y por qué cierra la cadena en contra', () => {
  it('las cuatro filas de la Tabla 1 cierran por dentro', () => {
    // ANPP + BNPP = TNPP en las cuatro. Si una no cierra es error de transcripción.
    for (const f of FRACCION_AEREA_MONTECILLO) {
      expect(f.anpp + f.bnpp).toBe(f.tnpp);
    }
    expect(FRACCION_AEREA_MONTECILLO).toHaveLength(4);
  });

  it('la fracción aérea va de 0,342 a 0,611: un factor 1,79', () => {
    const fr = FRACCION_AEREA_MONTECILLO.map(fraccionAerea);
    expect(Math.min(...fr)).toBeCloseTo(0.341559, 5);
    expect(Math.max(...fr)).toBeCloseTo(0.610569, 5);
    expect(Math.max(...fr) / Math.min(...fr)).toBeCloseTo(1.787, 2);
  });

  it('no se ponen de acuerdo ni en cuál mitad es la grande', () => {
    // Dos dicen que abajo hay más y dos dicen que arriba. La fracción cruza el
    // 0,5 por el medio, así que ni el signo del reparto está determinado.
    const arriba = FRACCION_AEREA_MONTECILLO.filter(f => f.anpp > f.bnpp);
    const abajo = FRACCION_AEREA_MONTECILLO.filter(f => f.bnpp > f.anpp);
    expect(arriba).toHaveLength(2);
    expect(abajo).toHaveLength(2);
  });

  it('la fila en carbono no se convierte, pero su cociente sirve', () => {
    const c = FRACCION_AEREA_MONTECILLO.filter(f => f.carbono);
    expect(c).toHaveLength(1);
    const carbono = c[0];
    expect(carbono).toBeDefined();
    if (!carbono) return;
    // Su magnitud no es comparable —227 contra 1.676 a 1.783 en materia seca—
    // y su cociente sí: cae adentro del rango de las otras tres.
    const seca = FRACCION_AEREA_MONTECILLO.filter(f => !f.carbono);
    expect(Math.min(...seca.map(f => f.tnpp))).toBeGreaterThan(carbono.tnpp * 7);
    const fr = fraccionAerea(carbono);
    expect(fr).toBeCloseTo(0.572687, 5);
    expect(fr).toBeGreaterThan(Math.min(...seca.map(fraccionAerea)));
    expect(fr).toBeLessThan(Math.max(...seca.map(fraccionAerea)));
  });

  it('el año mueve el total más que el algoritmo, y el algoritmo mueve el reparto', () => {
    const porAnio = TNPP_MONTECILLO_POR_ANIO.map(a => a.tnpp_g_ms_m2_anio);
    const porAlgoritmo = FRACCION_AEREA_MONTECILLO.filter(f => !f.carbono).map(f => f.tnpp);
    const span = (xs: number[]) => Math.max(...xs) / Math.min(...xs);
    expect(span(porAnio)).toBeCloseTo(1.402, 2);
    expect(span(porAlgoritmo)).toBeCloseTo(1.064, 2);
    expect(span(porAnio)).toBeGreaterThan(span(porAlgoritmo));
    // Y el reparto arriba/abajo se mueve más que las dos cosas.
    const spanFraccion = span(FRACCION_AEREA_MONTECILLO.map(fraccionAerea));
    expect(spanFraccion).toBeGreaterThan(span(porAnio));
  });

  it('el promedio publicado de 1.676 trae un incendio adentro', () => {
    // 1985 sin fuego da 1.994 y 1986 con fuego da 1.422. El promedio de los tres
    // años, que es la cifra montada, queda 16 % abajo del año bueno.
    const anios = TNPP_MONTECILLO_POR_ANIO;
    expect(anios).toHaveLength(3);
    const fuego = anios.find(a => a.anio === 1986);
    expect(fuego?.tnpp_g_ms_m2_anio).toBe(1422);
    const media = anios.reduce((s, a) => s + a.tnpp_g_ms_m2_anio, 0) / 3;
    expect(Math.round(media)).toBe(1676);
    expect(media / 1994).toBeLessThan(0.85);
  });
});

describe('la segunda fracción: la capa herbácea contra su propio sitio', () => {
  it('va de 0,0039 a 0,92, un factor 236', () => {
    const fr = FRACCION_HERBACEA_DEL_SITIO.map(fraccionHerbacea);
    expect(Math.min(...fr)).toBeCloseTo(0.003896, 5);
    expect(Math.max(...fr)).toBeCloseTo(0.92, 4);
    expect(Math.max(...fr) / Math.min(...fr)).toBeCloseTo(236.1, 0);
  });

  it('cada cociente se arma con las dos cifras en la misma unidad', () => {
    // Es la única razón por la que se puede dividir: la ficha del NRCS publica
    // las dos en lb/acre/año y las del ORNL las dos en g MS/m²/año. Mezclar
    // unidades acá daría un factor 11,2 invisible.
    for (const f of FRACCION_HERBACEA_DEL_SITIO) {
      expect(['g_ms_m2_anio', 'lb_acre_anio']).toContain(f.unidad);
      expect(f.herbacea).toBeLessThanOrEqual(f.aerea_total);
      expect(f.aerea_total).toBeGreaterThan(0);
    }
  });

  it('las dos puntas de Oregón tienen el mismo clima y difieren 6,5 veces', () => {
    const waring = FRACCION_HERBACEA_DEL_SITIO.find(f => f.sitio.includes('Waring'));
    const cascade = FRACCION_HERBACEA_DEL_SITIO.find(f => f.sitio.includes('Cascade'));
    expect(waring).toBeDefined();
    expect(cascade).toBeDefined();
    if (!waring || !cascade) return;
    // Los rodales producen casi lo mismo —1.540 y 1.630— y el sotobosque no.
    expect(cascade.aerea_total / waring.aerea_total).toBeCloseTo(1.06, 2);
    expect(fraccionHerbacea(cascade) / fraccionHerbacea(waring)).toBeCloseTo(6.47, 1);
  });

  it('el 0,92 del Edwards Plateau sale de una ficha que publica las dos columnas', () => {
    const edwards = FRACCION_HERBACEA_DEL_SITIO.find(f => f.sitio.includes('Edwards'));
    expect(edwards).toBeDefined();
    if (!edwards) return;
    // 1.840 lb/acre de gramíneas y hierbas sobre 2.000 del sitio entero, que
    // incluye arbustos y árboles. Estaba en el repo desde el lote 02 y nadie lo
    // había mirado como fracción.
    expect(edwards.herbacea).toBe(1840);
    expect(edwards.aerea_total).toBe(2000);
    expect(fraccionHerbacea(edwards)).toBeCloseTo(0.92, 6);
  });
});

describe('lote 12 — el cultivo, medido y afuera de la banda', () => {
  const avena = FORRAJE_MEDIDO.find(m => m.sitio.includes('Avena'))!;
  const alfalfa = FORRAJE_MEDIDO.find(m => m.sitio.includes('Alfalfa'))!;

  it('las dos son clase 40, tipo cultivo sembrado, y declaran sus insumos', () => {
    expect(avena.clase_wc).toBe(40);
    expect(alfalfa.clase_wc).toBe(40);
    expect(avena.tipo).toBe('ms_cultivo_sembrado');
    expect(alfalfa.tipo).toBe('ms_cultivo_sembrado');
    expect(avena.insumos).toBe('fertilizado');
    expect(alfalfa.insumos).toBe('riego');
    // El tipo no descuenta uso admisible, como los otros cuatro.
    expect(TIPOS_SIN_DESCONTAR).toContain('ms_cultivo_sembrado');
  });

  it('entre las dos hay un factor 3, y lo explica el insumo', () => {
    // 19.880 contra 6.539 kg MS/ha/año. Las dos en el bioma 8, las dos en
    // Argentina, las dos de INTA: lo que cambia es el agua y el nitrógeno.
    expect(avena.kg_ms_ha_anio_tipico).toBe(6539);
    expect(alfalfa.kg_ms_ha_anio_tipico).toBe(19880);
    expect((alfalfa.kg_ms_ha_anio_tipico ?? 0) / (avena.kg_ms_ha_anio_tipico ?? 1)).toBeCloseTo(3.04, 2);
    expect(avena.bioma).toBe(alfalfa.bioma);
  });

  it('la alfalfa regada casi duplica la medición de secano más alta', () => {
    const maxSecano = Math.max(
      ...FORRAJE_MEDIDO.filter(m => m.insumos === 'secano').map(m => m.kg_ms_ha_anio_max),
    );
    expect(maxSecano).toBe(10630);
    expect((alfalfa.kg_ms_ha_anio_tipico ?? 0) / maxSecano).toBeCloseTo(1.87, 2);
  });

  it('la lluvia de la avena es la del año medido, no la normal', () => {
    // 984 mm es la suma de la serie mensual de 2024 que publica la fuente, en un
    // año con cero milímetros en junio, julio y septiembre y una helada de
    // −9,4 °C en agosto. La media de 19,3 °C es el promedio de las doce medias
    // mensuales, que sí es una media anual legítima.
    expect(avena.lluvia_mm_min).toBe(984);
    expect(avena.temp_media_c_anual).toBeCloseTo(19.3, 1);
    expect(avena.donde_deja_de_valer).toContain('−9,4');
  });

  it('el riego no se disfraza de lluvia: la alfalfa no trae temperatura', () => {
    // Los 1.300 mm están en el campo de lluvia porque es el agua que recibió el
    // cultivo, y el texto lo dice en todos lados. Sin temperatura publicada, el
    // contraste del Miami Model no se puede correr sobre este sitio, y eso es
    // preferible a inventarle una media.
    expect(alfalfa.lluvia_mm_min).toBe(1300);
    expect(alfalfa.temp_media_c_anual).toBeNull();
    expect(alfalfa.donde_deja_de_valer).toContain('RIEGO');
  });

  it('un predio todo cultivo sigue sin banda, y lo dice', () => {
    const f = forrajePorCobertura(predio([40, 100]));
    expect(f).toBeNull();
  });

  it('un predio mitad pastizal mitad cultivo declara el 50 % sin fuente', () => {
    const f = forrajePorCobertura(predio([30, 50], [40, 50]));
    expect(f?.kg_ms_ha_anio_min).toBe(350);
    expect(f?.kg_ms_ha_anio_max).toBe(10630);
    expect(f?.pct_sin_fuente).toBe(50);
    expect(f?.clases_sin_fuente).toEqual(['Cultivo']);
  });
});
