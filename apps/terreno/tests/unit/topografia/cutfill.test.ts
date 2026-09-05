/**
 * Tests del dominio "topografía" — cut & fill de represas.
 * Rango de elevación dentro del polígono, volumen embalsado a un nivel dado y
 * dimensionamiento de la sección trapezoidal del muro.
 */
import { describe, it, expect } from 'vitest';
import { rangoElevacionPoligono, calcularEmbalse, dimensionarMuro, balanceTierra } from '@/lib/cutfill';
import { grillaDesdeFn, poligonoQueEnvuelve, BBOX_DEFECTO } from './_grilla';

// Pendiente uniforme: elevación = fila (0..10).
const g = grillaDesdeFn(11, 11, (r) => r, BBOX_DEFECTO);
const poly = poligonoQueEnvuelve(BBOX_DEFECTO);

describe('rangoElevacionPoligono', () => {
  it('devuelve min/max/celdas del terreno dentro del polígono', () => {
    const r = rangoElevacionPoligono(g, poly)!;
    expect(r).not.toBeNull();
    expect(r.min).toBe(0);
    expect(r.max).toBe(10);
    expect(r.celdas).toBe(121);
  });

  it('un polígono que no contiene celdas devuelve null', () => {
    const fuera = [
      { lat: 10, lng: 10 }, { lat: 10, lng: 10.001 },
      { lat: 10.001, lng: 10.001 }, { lat: 10.001, lng: 10 },
    ];
    expect(rangoElevacionPoligono(g, fuera)).toBeNull();
  });
});

describe('calcularEmbalse', () => {
  it('inunda las celdas por debajo del nivel de agua', () => {
    const r = calcularEmbalse(g, poly, 4)!;
    expect(r).not.toBeNull();
    expect(r.nivelAgua_m).toBe(4);
    expect(r.elev_min).toBe(0);
    expect(r.elev_max).toBe(10);
    expect(r.prof_max_m).toBeCloseTo(4, 1);   // nivel − fondo
    expect(r.volumen_m3).toBeGreaterThan(0);
    expect(r.area_inundada_m2).toBeGreaterThan(0);
    expect(r.prof_media_m).toBeGreaterThan(0);
    expect(r.prof_media_m).toBeLessThanOrEqual(r.prof_max_m);
  });

  it('sin nivel explícito usa el 60% del desnivel interno', () => {
    const r = calcularEmbalse(g, poly)!;
    expect(r.nivelAgua_m).toBeCloseTo(6, 1); // 0 + (10−0)·0.6
  });

  it('un nivel por debajo del fondo no embalsa nada → null', () => {
    expect(calcularEmbalse(g, poly, -5)).toBeNull();
  });
});

describe('dimensionarMuro', () => {
  it('sección trapezoidal con valores de referencia', () => {
    const m = dimensionarMuro({
      profMax_m: 3, revancha_m: 0.5, anchoCorona_m: 3,
      taludInterno: 3, taludExterno: 2, longitud_m: 50,
    });
    expect(m.alto_m).toBeCloseTo(3.5, 5);          // prof + revancha
    expect(m.anchoBase_m).toBeCloseTo(20.5, 1);    // 3 + 3.5·(3+2)
    expect(m.seccion_m2).toBeCloseTo(41.1, 1);     // (3+20.5)/2 · 3.5
    expect(m.volumenTierra_m3).toBe(2056);         // round(41.125 · 50)
    expect(m.anguloInterno_deg).toBe(18);          // atan2(1,3)
    expect(m.anguloExterno_deg).toBe(27);          // atan2(1,2)
  });

  it('con perfil, el muro se afina hacia los estribos y el terraplén baja a ~1/3', () => {
    // Perfil en V simétrica: el terreno sube 3,5 m desde el fondo hasta cada
    // estribo, así que la altura del muro va de 3,5 m en el medio a 0 en los
    // extremos. La sección crece con el cuadrado de la altura, de modo que la
    // media de h² es h_máx²/3 y no h_máx²: el prisma constante sobredimensiona
    // por un factor cercano a 3. Ese es el error que se está corrigiendo.
    const n = 41;
    const fondo = 100;
    const perfil = Array.from({ length: n }, (_, i) => {
      const t = Math.abs(i - (n - 1) / 2) / ((n - 1) / 2);   // 0 en el medio, 1 en los bordes
      return fondo + 3.5 * t;
    });
    const p = {
      profMax_m: 3, revancha_m: 0.5, anchoCorona_m: 3,
      taludInterno: 3, taludExterno: 2, longitud_m: 50,
    };
    const constante = dimensionarMuro(p);
    const conPerfil = dimensionarMuro({ ...p, perfilTerreno_m: perfil, cotaCorona_m: fondo + 3.5 });

    expect(conPerfil.perfilUsado).toBe(true);
    expect(constante.perfilUsado).toBe(false);

    // La altura máxima es la misma; la media, la mitad.
    expect(conPerfil.alto_m).toBeCloseTo(3.5, 1);
    expect(conPerfil.altoMedio_m).toBeCloseTo(1.7, 1);

    // El terraplén cae a menos de la mitad del prisma constante.
    expect(conPerfil.volumenTierra_m3).toBeLessThan(constante.volumenTierra_m3 * 0.55);
    expect(conPerfil.volumenTierra_m3).toBeGreaterThan(constante.volumenTierra_m3 * 0.30);

    // La base sigue teniendo el mismo máximo, pero ahora se informa el promedio.
    expect(conPerfil.anchoBase_m).toBeCloseTo(constante.anchoBase_m, 1);
    expect(conPerfil.anchoBaseMedio_m).toBeLessThan(conPerfil.anchoBase_m);
  });

  it('si el terreno del eje ya supera el nivel de agua, no hay muro', () => {
    // Una aguada: el agua la contiene la excavación, no el bordo.
    const m = dimensionarMuro({
      profMax_m: 3, revancha_m: 0.3, anchoCorona_m: 2,
      taludInterno: 2.5, taludExterno: 2, longitud_m: 40,
      perfilTerreno_m: [110, 110, 110, 110, 110],
      cotaCorona_m: 100,
    });
    expect(m.sinMuro).toBe(true);
    expect(m.volumenTierra_m3).toBe(0);
  });

  it('las partidas suman el terraplén y la zanja se rellena con lo que se abrió', () => {
    const m = dimensionarMuro({
      profMax_m: 3, revancha_m: 0.5, anchoCorona_m: 3,
      taludInterno: 3, taludExterno: 2, longitud_m: 50,
    });
    const { nucleo_m3, espaldones_m3, revestimiento_m3, zanjaExcavacion_m3, zanjaArcilla_m3 } = m.partidas;
    expect(nucleo_m3 + espaldones_m3 + revestimiento_m3).toBeCloseTo(m.volumenTierra_m3, -1);
    expect(zanjaArcilla_m3).toBe(zanjaExcavacion_m3);
    expect(m.partidas.destape_m3).toBeGreaterThan(0);
  });

  it('alto mínimo de 0.1 m aunque profundidad y revancha sean 0', () => {
    const m = dimensionarMuro({
      profMax_m: 0, revancha_m: 0, anchoCorona_m: 2,
      taludInterno: 2, taludExterno: 2, longitud_m: 10,
    });
    expect(m.alto_m).toBeGreaterThanOrEqual(0.1);
  });
});

describe('balanceTierra', () => {
  const muro = dimensionarMuro({
    profMax_m: 3, revancha_m: 0.5, anchoCorona_m: 3,
    taludInterno: 3, taludExterno: 2, longitud_m: 50,
    factorContraccion: 1.2,
  });
  const embalse = {
    nivelAgua_m: 100, volumen_m3: 5000, area_inundada_m2: 4000,
    prof_max_m: 3, prof_media_m: 1.25, elev_min: 97, elev_max: 102,
    ancho_max_m: 80, celdas: 120,
  };

  it('el préstamo sale de adentro del vaso y suma capacidad', () => {
    const b = balanceTierra(muro, embalse);
    // El agua total es la del terreno natural más lo que gana la excavación.
    expect(b.volumenAgua_m3).toBe(embalse.volumen_m3 + b.capacidadExtra_m3);
    expect(b.capacidadExtra_m3).toBeGreaterThan(0);
    // Con contracción, el banco supera a lo que queda compactado.
    expect(b.banco_m3).toBeGreaterThan(b.compactado_m3);
  });

  it('la profundización media es el control de realidad del préstamo', () => {
    const b = balanceTierra(muro, embalse);
    expect(b.profundizacionMedia_m).toBeCloseTo(b.capacidadExtra_m3 / embalse.area_inundada_m2, 2);
    // Un vaso diminuto no puede dar el material: deja de ser viable y lo dice.
    const chico = balanceTierra(muro, { ...embalse, area_inundada_m2: 200 });
    expect(chico.viable).toBe(false);
    expect(chico.nota).toContain('préstamo');
  });
});
