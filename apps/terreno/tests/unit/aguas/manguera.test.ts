/**
 * Manguera móvil: la pérdida real contra la del caño de catálogo.
 *
 * El ancla es el ensayo de Tajrishy y Hills (1992), que midió **dos** diámetros
 * de manguera —76 y 102 mm— y publicó C = 135 y 140. El test que importa no es
 * que la fórmula devuelva un número: es que el número **sea más grande** que el
 * que daba el C de catálogo, y en la proporción exacta que impone el exponente
 * 1,852 de Hazen-Williams: (150/135)^1,852 = 1,2155, o sea un 21,5 % más de
 * pérdida.
 */
import { describe, it, expect } from 'vitest';
import {
  coeficienteManguera, perdidaManguera, dimensionarManguera,
  C_MEDIDO, C_CATALOGO_PLASTICO, DIAMETROS_MANGUERA,
  VEL_MAX_NRCS_MS, FRACCION_PRESION_TRABAJO_NRCS, CARGA_MAX_SIN_CLASE_MCA,
} from '@/lib/manguera';
import { perdidaHazenWilliams } from '@/lib/hidraulica';

/** 10 m³/h, un caudal razonable para llenar un bebedero. */
const Q = 10 / 3600;

describe('el coeficiente medido', () => {
  it('en los dos diámetros del ensayo devuelve exactamente lo publicado', () => {
    expect(coeficienteManguera(76).C).toBe(135);
    expect(coeficienteManguera(102).C).toBe(140);
    expect(coeficienteManguera(76).en_rango).toBe(true);
    expect(coeficienteManguera(102).en_rango).toBe(true);
  });

  it('entre los dos interpola, que es lo único que dos puntos autorizan', () => {
    const medio = coeficienteManguera((76 + 102) / 2);
    expect(medio.C).toBeCloseTo(137.5, 4);
    expect(medio.en_rango).toBe(true);
  });

  it('por debajo del rango no extrapola: usa el más desfavorable medido y lo avisa', () => {
    const r = coeficienteManguera(25);
    expect(r.C).toBe(135);
    expect(r.en_rango).toBe(false);
    expect(r.nota).toContain('76 y 102 mm');
  });

  it('por encima del rango tampoco le acredita más lisura', () => {
    const r = coeficienteManguera(150);
    expect(r.C).toBe(135);
    expect(r.en_rango).toBe(false);
  });

  it('el C medido es siempre menor que el de catálogo: la manguera pierde más que el caño', () => {
    for (const m of C_MEDIDO) expect(m.C).toBeLessThan(C_CATALOGO_PLASTICO);
  });
});

describe('el hallazgo: el catálogo subestima la pérdida un 21 %', () => {
  it('en una manguera de 3 pulgadas la diferencia es la que impone el exponente 1,852', () => {
    const r = perdidaManguera({ caudal_m3s: Q, diametro_interior_mm: 76, largo_m: 200 })!;
    expect(r.veces_catalogo).toBeCloseTo(Math.pow(150 / 135, 1.852), 4);
    expect(r.veces_catalogo).toBeCloseTo(1.2155, 3);
  });

  it('y la pérdida real es mayor, no menor: el error está del lado peligroso', () => {
    const r = perdidaManguera({ caudal_m3s: Q, diametro_interior_mm: 76, largo_m: 200 })!;
    expect(r.perdida_m).toBeGreaterThan(r.perdida_catalogo_m);
  });

  it('usa el mismo Hazen-Williams del resto de la app, sin una segunda fórmula', () => {
    const r = perdidaManguera({ caudal_m3s: Q, diametro_interior_mm: 76, largo_m: 200 })!;
    expect(r.perdida_m).toBeCloseTo(perdidaHazenWilliams(Q, 135, 0.076, 200), 10);
  });
});

describe('perdidaManguera', () => {
  it('la pérdida crece con el largo y baja fuerte con el diámetro', () => {
    const corta = perdidaManguera({ caudal_m3s: Q, diametro_interior_mm: 38, largo_m: 50 })!;
    const larga = perdidaManguera({ caudal_m3s: Q, diametro_interior_mm: 38, largo_m: 200 })!;
    const gorda = perdidaManguera({ caudal_m3s: Q, diametro_interior_mm: 51, largo_m: 200 })!;
    expect(larga.perdida_m).toBeCloseTo(corta.perdida_m * 4, 6);   // lineal en L
    expect(gorda.perdida_m).toBeLessThan(larga.perdida_m / 3);     // a la 4,87 en D
  });

  it('los acoples entran como largo equivalente, que es como la fuente los publica', () => {
    const sin = perdidaManguera({ caudal_m3s: Q, diametro_interior_mm: 51, largo_m: 100 })!;
    const con = perdidaManguera({ caudal_m3s: Q, diametro_interior_mm: 51, largo_m: 100, largo_equivalente_m: 20 })!;
    expect(con.largo_efectivo_m).toBe(120);
    expect(con.perdida_m).toBeCloseTo(sin.perdida_m * 1.2, 6);
  });

  it('si no se declaran pérdidas locales lo dice, porque la norma pide incluirlas', () => {
    const r = perdidaManguera({ caudal_m3s: Q, diametro_interior_mm: 51, largo_m: 100 })!;
    expect(r.avisos.join(' ')).toContain('pérdidas locales');
  });

  it('avisa cuando se pasa del techo de velocidad de la norma, y dice por qué', () => {
    const r = perdidaManguera({ caudal_m3s: 0.01, diametro_interior_mm: 25, largo_m: 50 })!;
    expect(r.velocidad_ms).toBeGreaterThan(VEL_MAX_NRCS_MS);
    expect(r.avisos.join(' ')).toContain('golpe al cerrar');
  });

  it('sin caudal o sin largo no devuelve nada', () => {
    expect(perdidaManguera({ caudal_m3s: 0, diametro_interior_mm: 51, largo_m: 100 })).toBeNull();
    expect(perdidaManguera({ caudal_m3s: Q, diametro_interior_mm: 51, largo_m: 0 })).toBeNull();
  });
});

describe('los tres límites de la norma', () => {
  it('la velocidad máxima son 5 pies por segundo, no 2 m/s', () => {
    expect(VEL_MAX_NRCS_MS).toBeCloseTo(1.524, 3);
    expect(VEL_MAX_NRCS_MS).toBeLessThan(2.0);
  });

  it('la presión de trabajo es el 72 % de la nominal, no el 91 %', () => {
    expect(FRACCION_PRESION_TRABAJO_NRCS).toBe(0.72);
    expect(1 / FRACCION_PRESION_TRABAJO_NRCS).toBeCloseTo(1.389, 3);
  });

  it('una manguera sin clase declarada no pasa de 25 pies de carga', () => {
    expect(CARGA_MAX_SIN_CLASE_MCA).toBeCloseTo(7.62, 2);
  });
});

describe('dimensionarManguera', () => {
  const caso = { caudal_m3s: Q, largo_m: 200, carga_disponible_m: 12, carga_min_punta_m: 2 };

  it('elige el menor diámetro que llega con la carga pedida y sin pasarse de velocidad', () => {
    const r = dimensionarManguera(caso);
    expect(r.elegida).not.toBeNull();
    expect(r.elegida!.carga_final_m).toBeGreaterThanOrEqual(2);
    expect(r.elegida!.perdida.velocidad_ms).toBeLessThanOrEqual(VEL_MAX_NRCS_MS);
    const menores = r.opciones.filter(o => o.diametro.interior_mm < r.elegida!.diametro.interior_mm);
    for (const m of menores) expect(m.alcanza).toBe(false);
  });

  it('cuando el C de catálogo habría alcanzado con una medida menos, lo dice', () => {
    // Es el aviso que convierte el hallazgo en una decisión de compra.
    let encontrado = false;
    for (const largo of [120, 150, 180, 200, 240, 300]) {
      const r = dimensionarManguera({ ...caso, largo_m: largo });
      if (r.avisos.join(' ').includes('habría alcanzado la de')) encontrado = true;
    }
    expect(encontrado).toBe(true);
  });

  it('el desnivel se le resta a la carga: subir cuesta carga igual que la fricción', () => {
    const plano  = dimensionarManguera(caso);
    const subida = dimensionarManguera({ ...caso, desnivel_m: 8 });
    expect(subida.elegida!.diametro.interior_mm).toBeGreaterThanOrEqual(plano.elegida!.diametro.interior_mm);
    expect(subida.elegida!.carga_final_m).toBeLessThan(plano.elegida!.carga_final_m);
  });

  it('bajar devuelve carga', () => {
    const bajada = dimensionarManguera({ ...caso, desnivel_m: -5 });
    const plano  = dimensionarManguera(caso);
    expect(bajada.elegida!.carga_final_m).toBeGreaterThan(plano.elegida!.carga_final_m);
  });

  it('si no llega con ningún diámetro, lo dice en vez de devolver el más grande', () => {
    const r = dimensionarManguera({ ...caso, largo_m: 5000, carga_disponible_m: 3 });
    expect(r.elegida).toBeNull();
    expect(r.avisos.join(' ')).toContain('acortar la tirada');
  });

  it('siempre recuerda el límite de presión de la manguera sin clase', () => {
    const r = dimensionarManguera(caso);
    expect(r.avisos.join(' ')).toContain('presión nominal impresa');
    expect(r.avisos.join(' ')).toContain('72 %');
  });

  it('la serie de diámetros va de media a cuatro pulgadas y está ordenada', () => {
    const mm = DIAMETROS_MANGUERA.map(d => d.interior_mm);
    expect(mm[0]).toBe(13);
    expect(mm[mm.length - 1]).toBe(102);
    for (let i = 1; i < mm.length; i++) expect(mm[i]!).toBeGreaterThan(mm[i - 1]!);
  });
});
