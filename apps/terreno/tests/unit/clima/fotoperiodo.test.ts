import { describe, it, expect } from 'vitest';
import {
  calcularFotoperiodo, horasLuz, limitarPorLuz,
  LUZ_MINIMA_H, LUZ_NULA_H, aptitudMes, FAMILIAS,
} from '@/lib/calendario';
import type { MesDato } from '@/lib/clima';

/** El día medio de cada mes, igual que el que usa el módulo. */
const SOLSTICIO_JUN = 172;
const SOLSTICIO_DIC = 355;
const EQUINOCCIO_MAR = 80;

describe('horas de luz', () => {
  it('en el ecuador el día dura doce horas todo el año', () => {
    for (const dia of [EQUINOCCIO_MAR, SOLSTICIO_JUN, SOLSTICIO_DIC]) {
      expect(horasLuz(0, dia)).toBeCloseTo(12.1, 1);
    }
  });

  it('en el equinoccio dura doce horas en cualquier latitud', () => {
    for (const lat of [-45, -20, 0, 35, 55]) {
      expect(horasLuz(lat, EQUINOCCIO_MAR)).toBeCloseTo(12.1, 0);
    }
  });

  it('los hemisferios están dados vuelta', () => {
    // Junio: verano al norte, invierno al sur.
    expect(horasLuz(55, SOLSTICIO_JUN)).toBeGreaterThan(16);
    expect(horasLuz(-55, SOLSTICIO_JUN)).toBeLessThan(8);
    // Y en diciembre, al revés.
    expect(horasLuz(55, SOLSTICIO_DIC)).toBeLessThan(8);
    expect(horasLuz(-55, SOLSTICIO_DIC)).toBeGreaterThan(16);
  });

  it('adentro del círculo polar hay sol de medianoche y noche polar', () => {
    expect(horasLuz(78, SOLSTICIO_JUN)).toBe(24);
    expect(horasLuz(78, SOLSTICIO_DIC)).toBe(0);
  });

  it('Ushuaia y Escocia son la misma curva espejada', () => {
    const escocia = calcularFotoperiodo(56.5);
    const ushuaia = calcularFotoperiodo(-54.8);
    expect(escocia.min).toBeLessThan(LUZ_MINIMA_H);
    expect(ushuaia.min).toBeLessThan(LUZ_MINIMA_H);
    // El norte tiene el día corto en el invierno boreal; el sur, medio año después.
    expect(escocia.meses_cortos).toContain(11);   // diciembre
    expect(ushuaia.meses_cortos).toContain(5);    // junio
    expect(escocia.meses_cortos).not.toContain(5);
  });
});

describe('la luz sólo manda donde el día se acorta', () => {
  it('en el trópico no limita nada', () => {
    // Java, Kerala, el Chaco: el día nunca baja de 10 h.
    for (const lat of [-7.5, 10.5, -25]) {
      const f = calcularFotoperiodo(lat);
      expect(f.limita).toBe(false);
      expect(f.meses_cortos).toEqual([]);
      expect(f.min).toBeGreaterThanOrEqual(LUZ_MINIMA_H);
    }
  });

  it('en latitud alta limita varios meses', () => {
    const f = calcularFotoperiodo(56.5);
    expect(f.limita).toBe(true);
    expect(f.meses_cortos.length).toBeGreaterThanOrEqual(3);
    expect(f.lectura).toMatch(/luz/i);
  });

  it('el umbral es el de Perséfone y el piso está más abajo', () => {
    expect(LUZ_MINIMA_H).toBe(10);
    expect(LUZ_NULA_H).toBeLessThan(LUZ_MINIMA_H);
  });
});

describe('la luz baja el veredicto, nunca lo sube', () => {
  it('con luz de sobra devuelve lo que le entra', () => {
    expect(limitarPorLuz('optimo', 14)).toBe('optimo');
    expect(limitarPorLuz('posible', 14)).toBe('posible');
    expect(limitarPorLuz('no_apto', 14)).toBe('no_apto');
  });

  it('sin dato de luz no toca nada', () => {
    expect(limitarPorLuz('optimo', undefined)).toBe('optimo');
  });

  it('un mes que la temperatura descartó no se rescata con sol', () => {
    expect(limitarPorLuz('no_apto', 16)).toBe('no_apto');
    expect(limitarPorLuz('no_apto', 8)).toBe('no_apto');
  });

  it('el día corto baja óptimo a posible, y el muy corto a no apto', () => {
    expect(limitarPorLuz('optimo', 9.5)).toBe('posible');
    expect(limitarPorLuz('optimo', 8)).toBe('no_apto');
    expect(limitarPorLuz('posible', 8)).toBe('no_apto');
  });
});

describe('aptitudMes con fotoperiodo', () => {
  /** Un mes templado que a la hoja le viene perfecto por temperatura. */
  const mesTemplado: MesDato = {
    mes: '11', precip_mm: 70, tmax_c: 12, tmin_c: 5, tmean_c: 8.5,
    etp_mm: 30, balance_mm: 40, viento_ms: 3,
  };
  const hoja = FAMILIAS.find(f => f.id === 'hoja')!;

  it('sin luz declarada, el veredicto es el de siempre', () => {
    // La compatibilidad hacia atrás importa: hay llamadas que sólo preguntan
    // por temperatura y no tienen por qué cambiar de respuesta.
    expect(aptitudMes(mesTemplado, hoja)).toBe(aptitudMes(mesTemplado, hoja, 14));
  });

  it('el mismo mes, en Escocia, deja de estar bueno', () => {
    // 8 °C de media en noviembre dan para la lechuga; nueve horas de luz, no.
    expect(aptitudMes(mesTemplado, hoja, 14)).toBe('optimo');
    expect(aptitudMes(mesTemplado, hoja, 9.5)).toBe('posible');
    expect(aptitudMes(mesTemplado, hoja, 7)).toBe('no_apto');
  });

  it('ninguna familia sale mejor parada por el filtro de luz', () => {
    const orden = { no_apto: 0, posible: 1, optimo: 2 } as const;
    for (const f of FAMILIAS) {
      for (const luz of [6, 9.5, 11, 15]) {
        const con = aptitudMes(mesTemplado, f, luz);
        const sin = aptitudMes(mesTemplado, f);
        expect(orden[con]).toBeLessThanOrEqual(orden[sin]);
      }
    }
  });
});
