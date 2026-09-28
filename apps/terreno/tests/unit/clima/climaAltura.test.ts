import { describe, it, expect } from 'vitest';
import {
  GRADIENTE_TERMICO_C_KM, UMBRAL_IGNORAR_M, UMBRAL_AVISO_M,
  deltaTemperaturaC, diagnosticarAltura,
} from '@/lib/climaAltura';

/**
 * El caso resuelto: Armenia, Quindío, Colombia.
 *
 * Medido contra NASA POWER el 28/09/2026 pidiendo la climatología del punto
 * (4,53 N; 75,68 O). POWER devolvió, en `geometry.coordinates[2]`, una altura de
 * celda de **2.266,93 m**. La ciudad está a **1.483 m**, así que la celda de
 * ~50 km está 784 m más arriba que el predio y devuelve una media anual de
 * **15,09 °C**.
 *
 * El café arábigo pide entre 18 y 22 °C de media anual. Con 15,09 °C la app lo
 * marcaba no viable en la capital cafetera de Colombia; corregido da 20,19 °C,
 * que cae en el medio del rango. Ése es el caso publicado contra el que se
 * valida: no un número que inventamos, sino el hecho de que ahí se cultiva café.
 */
const ARMENIA = {
  altura_celda_m: 2266.93,
  altura_predio_m: 1483,
  media_anual_cruda_c: 15.09,
} as const;

describe('el gradiente térmico', () => {
  it('es el de la atmósfera estándar', () => {
    // Si alguien lo cambia, se mueven a la vez la ETP, el balance hídrico, la
    // aridez, el GDD, las horas de frío, las heladas y la aptitud de cada
    // especie. No es una constante para tocar sin leer lib/climaAltura.ts.
    expect(GRADIENTE_TERMICO_C_KM).toBe(6.5);
  });

  it('un kilómetro más arriba es 6,5 °C más frío', () => {
    expect(deltaTemperaturaC(0, 1000)).toBeCloseTo(-6.5, 10);
    expect(deltaTemperaturaC(1000, 0)).toBeCloseTo(6.5, 10);
  });

  it('el signo es el que corresponde: abajo hace más calor', () => {
    // El error de signo acá es invisible —devuelve un número plausible— y
    // convierte un valle cálido en una cumbre fría.
    expect(deltaTemperaturaC(2000, 1000)).toBeGreaterThan(0);
    expect(deltaTemperaturaC(1000, 2000)).toBeLessThan(0);
  });
});

describe('Armenia (Quindío): el caso que destapó el problema', () => {
  it('corrige +5,1 °C y lleva la media anual a los 20 °C', () => {
    const delta = deltaTemperaturaC(ARMENIA.altura_celda_m, ARMENIA.altura_predio_m);
    expect(delta).toBeCloseTo(5.1, 1);

    const corregida = ARMENIA.media_anual_cruda_c + delta;
    expect(corregida).toBeCloseTo(20.2, 1);
  });

  it('el café arábigo entra en su rango recién después de corregir', () => {
    // Coffea arabica: 18-22 °C de media anual. La cruda queda 3 °C por debajo
    // del piso; la corregida cae en el medio. Este test es el que impide que
    // alguien "simplifique" la corrección y vuelva a perder el café del Quindío.
    const ARABIGO_MIN = 18;
    const ARABIGO_MAX = 22;

    expect(ARMENIA.media_anual_cruda_c).toBeLessThan(ARABIGO_MIN);

    const corregida = ARMENIA.media_anual_cruda_c
      + deltaTemperaturaC(ARMENIA.altura_celda_m, ARMENIA.altura_predio_m);
    expect(corregida).toBeGreaterThan(ARABIGO_MIN);
    expect(corregida).toBeLessThan(ARABIGO_MAX);
  });

  it('el diagnóstico dice dónde está el predio y cuánto se corrigió', () => {
    const d = diagnosticarAltura(ARMENIA.altura_celda_m, ARMENIA.altura_predio_m)!;
    expect(d).not.toBeNull();
    expect(d.desnivel_m).toBe(-784);
    expect(d.delta_c).toBeCloseTo(5.1, 1);
    expect(d.altura_celda_m).toBe(2267);
    expect(d.altura_predio_m).toBe(1483);
    // 784 m no llega al umbral de aviso: la corrección es buena, no gruesa.
    expect(d.confianza).toBe('buena');
    // La leyenda tiene que decir para qué lado, con palabras y no sólo con signo.
    expect(d.leyenda).toMatch(/más abajo/);
    expect(d.leyenda).toMatch(/más calor/);
    expect(d.leyenda).toMatch(/6,5 °C por kilómetro/);
  });
});

describe('cuándo NO se corrige, que importa igual', () => {
  it('sin altura de celda o sin altura de predio no se inventa una corrección', () => {
    expect(diagnosticarAltura(undefined, 1483)).toBeNull();
    expect(diagnosticarAltura(2267, undefined)).toBeNull();
    expect(diagnosticarAltura(null, null)).toBeNull();
    expect(deltaTemperaturaC(NaN, 1483)).toBe(0);
    expect(deltaTemperaturaC(2267, Infinity)).toBe(0);
  });

  it('un desnivel por debajo del umbral se ignora', () => {
    // 49 m son 0,32 °C: menos que el redondeo con el que se muestra la
    // temperatura. Corregir ahí sería ruido con cara de precisión.
    expect(UMBRAL_IGNORAR_M).toBe(50);
    expect(diagnosticarAltura(1000, 1049)).toBeNull();
    expect(diagnosticarAltura(1000, 951)).toBeNull();
    expect(deltaTemperaturaC(1000, 1049)).toBe(0);
  });

  it('justo en el umbral ya corrige', () => {
    expect(diagnosticarAltura(1000, 1050)).not.toBeNull();
    expect(diagnosticarAltura(1000, 950)).not.toBeNull();
  });
});

describe('un desnivel grande se corrige igual, pero avisando', () => {
  it('pasado el umbral de aviso la confianza baja a gruesa', () => {
    expect(UMBRAL_AVISO_M).toBe(1000);
    // 2.000 m de desnivel: el predio está en el valle y la celda promedia el
    // cordón entero. Es el caso andino y el himalayo.
    const d = diagnosticarAltura(3500, 1500)!;
    expect(d.confianza).toBe('gruesa');
    // No se deja de corregir: sin corregir el error serían 13 °C enteros, que
    // es la diferencia entre un clima templado y uno de páramo.
    expect(d.delta_c).toBeCloseTo(13, 1);
    expect(d.leyenda).toMatch(/gruesa/);
    expect(d.leyenda).toMatch(/estación/);
  });

  it('a 1.000 m justos todavía es buena', () => {
    expect(diagnosticarAltura(2000, 1000)!.confianza).toBe('buena');
    expect(diagnosticarAltura(2001, 1000)!.confianza).toBe('gruesa');
  });

  it('un predio más arriba que la celda sale más frío y lo dice así', () => {
    const d = diagnosticarAltura(1000, 2500)!;
    expect(d.delta_c).toBeLessThan(0);
    expect(d.leyenda).toMatch(/más arriba/);
    expect(d.leyenda).toMatch(/más frío/);
  });
});
