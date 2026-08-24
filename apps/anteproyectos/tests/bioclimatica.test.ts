import { describe, expect, it } from 'vitest';
import {
  altitudSolsticioInvierno,
  altitudSolsticioVerano,
  calcularAleroPasivo,
  estrategiaClimatica,
  fachadaEcuador,
  hemisferioDe,
  rumboACardinal4,
} from '@/lib/motor/bioclimatica';
import type { Koppen } from '@/lib/clima';

const koppen = (codigo: string, grupo: string): Koppen => ({ codigo, grupo, descripcion: codigo });

describe('hemisferio y orientación', () => {
  it('identifica el hemisferio por el signo de la latitud', () => {
    expect(hemisferioDe(-31.4)).toBe('sur');
    expect(hemisferioDe(18.25)).toBe('norte');
  });

  it('orienta la fachada al ecuador según el hemisferio', () => {
    // En el hemisferio sur el sol de invierno viene del norte, y al revés.
    expect(fachadaEcuador(-31.4)).toBe('N');
    expect(fachadaEcuador(48.8)).toBe('S');
  });
});

describe('geometría solar', () => {
  it('en verano el sol está más alto que en invierno, en ambos hemisferios', () => {
    for (const lat of [-41.15, -18, 18.25, 52]) {
      expect(altitudSolsticioVerano(lat)).toBeGreaterThan(altitudSolsticioInvierno(lat));
    }
  });

  it('en el trópico el sol del solsticio llega al cenit', () => {
    // Sobre el Trópico de Cáncer (23,44° N) el sol del solsticio de junio cae
    // a plomo. En el ecuador eso pasa en los equinoccios, no en el solsticio:
    // ahí la altitud del solsticio es ~66,6°, y esa es la cifra correcta.
    expect(altitudSolsticioVerano(23.44)).toBeGreaterThan(89);
    expect(altitudSolsticioVerano(0)).toBeCloseTo(66.6, 0);
  });

  it('en latitudes altas el sol de invierno queda muy bajo', () => {
    expect(altitudSolsticioInvierno(60)).toBeLessThan(10);
  });

  it('nunca devuelve altitudes fuera del rango físico', () => {
    for (const lat of [-89, -45, 0, 45, 89]) {
      for (const alt of [altitudSolsticioVerano(lat), altitudSolsticioInvierno(lat)]) {
        expect(alt).toBeGreaterThanOrEqual(0);
        expect(alt).toBeLessThanOrEqual(90);
      }
    }
  });
});

describe('estrategiaClimatica', () => {
  it('en clima tropical prioriza sombra y ventilación con eje largo E-O', () => {
    const e = estrategiaClimatica(koppen('Af', 'Tropical'));
    expect(e.enfoque).toBe('sombra-ventilacion');
    expect(e.ejeLargoPreferido).toBe('E-O');
    expect(e.fachadaPrioritaria).toBe('viento-dominante');
  });

  it('en clima continental prioriza ganancia solar y compacidad', () => {
    const e = estrategiaClimatica(koppen('Dfb', 'Continental'));
    expect(e.enfoque).toBe('ganancia-solar');
    expect(e.compacidadObjetivo).toBe('alta');
    expect(e.fachadaPrioritaria).toBe('ecuador');
  });

  it('distingue árido cálido de árido frío', () => {
    // BWh (cálido) evita ganancia solar; BWk (frío) la busca.
    expect(estrategiaClimatica(koppen('BWh', 'Árido')).enfoque).toBe('masa-termica-arida');
    expect(estrategiaClimatica(koppen('BWk', 'Árido')).enfoque).toBe('mixto');
  });

  it('cubre los cinco grupos de Köppen sin caer en un default equivocado', () => {
    for (const [cod, grupo] of [
      ['Af', 'Tropical'],
      ['BSh', 'Árido'],
      ['Cfb', 'Templado'],
      ['Dfc', 'Continental'],
      ['ET', 'Polar'],
    ] as const) {
      expect(estrategiaClimatica(koppen(cod, grupo)).descripcion.length).toBeGreaterThan(20);
    }
  });
});

describe('calcularAleroPasivo', () => {
  it('en clima templado deja pasar el sol de invierno', () => {
    const alero = calcularAleroPasivo(-31.4, 1.4, 'mixto');
    expect(alero.profundidad_m).toBeGreaterThan(0);
    expect(alero.nota).toMatch(/invierno/i);
  });

  it('en trópico dimensiona para sombra permanente y no menciona ganancia de invierno', () => {
    const alero = calcularAleroPasivo(18.25, 1.4, 'sombra-ventilacion');
    expect(alero.nota).toMatch(/permanente/i);
    expect(alero.profundidad_m).toBeGreaterThanOrEqual(0.6);
  });

  it('mantiene el alero dentro de un rango construible', () => {
    for (const lat of [-55, -31, 0, 18, 52]) {
      for (const enfoque of ['mixto', 'sombra-ventilacion', 'ganancia-solar'] as const) {
        const a = calcularAleroPasivo(lat, 1.4, enfoque);
        expect(a.profundidad_m).toBeGreaterThan(0.2);
        expect(a.profundidad_m).toBeLessThanOrEqual(1.8);
      }
    }
  });
});

describe('rumboACardinal4', () => {
  it('reduce los 16 rumbos al cardinal más cercano por ángulo', () => {
    // NNE está a 22,5° — más cerca de N que de E.
    expect(rumboACardinal4('NNE')).toBe('N');
    // ENE está a 67,5° — más cerca de E.
    expect(rumboACardinal4('ENE')).toBe('E');
    expect(rumboACardinal4('SSO')).toBe('S');
    expect(rumboACardinal4('OSO')).toBe('O');
    expect(rumboACardinal4('E')).toBe('E');
  });

  it('cae en N ante un rumbo desconocido en vez de romper', () => {
    expect(rumboACardinal4('XYZ')).toBe('N');
  });
});
