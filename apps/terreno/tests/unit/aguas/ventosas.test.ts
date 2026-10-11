/**
 * Trampas de aire: dónde va una ventosa.
 *
 * Los tres criterios de la norma (NRCS 430) son geométricos, así que se pueden
 * probar con perfiles sintéticos donde se sabe la respuesta de antemano:
 *
 *   · todos los puntos altos;
 *   · una ventosa cada 2.500 pies (762 m) en tramos parejos;
 *   · y en los quiebres hacia abajo de más de 10°.
 *
 * Lo que más importa probar es lo que **no** tiene que marcar: un perfil con
 * ruido de DEM no puede producir quince ventosas falsas, porque una lista de
 * quince no la cree nadie y entonces no se pone ninguna.
 */
import { describe, it, expect } from 'vitest';
import {
  ventosasEnPerfil, puntosAltos, interpolarCota,
  ESPACIADO_MAX_M, QUIEBRE_DESCENDENTE_GRADOS, PROMINENCIA_MIN_M,
  ORIFICIO_CAV_MM, DELTA_ESCAPE_MCA, DELTA_VACIO_MCA,
} from '@/lib/ventosas';
import type { PuntoPerfilElevacion } from '@/lib/caminos';

/** Perfil a partir de pares [distancia, cota]. */
const perfilDe = (pares: Array<[number, number]>): PuntoPerfilElevacion[] =>
  pares.map(([distancia_m, elevation]) => ({ distancia_m, elevation }));

/** Perfil parejo de `largo` metros con paso de 50 m. */
const plano = (largo: number, cota = 100): PuntoPerfilElevacion[] =>
  perfilDe(Array.from({ length: Math.floor(largo / 50) + 1 }, (_, i) => [i * 50, cota]));

describe('las constantes de la norma', () => {
  it('el espaciado máximo son 2.500 pies', () => {
    expect(ESPACIADO_MAX_M).toBeCloseTo(762, 0);
  });

  it('el quiebre descendente son 10 grados', () => {
    expect(QUIEBRE_DESCENDENTE_GRADOS).toBe(10);
  });

  it('el orificio de purga va de 1/16 a 3/8 de pulgada', () => {
    expect(ORIFICIO_CAV_MM[0]).toBeCloseTo(1.6, 1);
    expect(ORIFICIO_CAV_MM[1]).toBeCloseTo(9.5, 1);
  });

  it('los dos diferenciales de diseño son 2 y 5 psi, y el de vacío es el mayor', () => {
    expect(DELTA_ESCAPE_MCA).toBeCloseTo(1.41, 2);
    expect(DELTA_VACIO_MCA).toBeCloseTo(3.52, 2);
    expect(DELTA_VACIO_MCA).toBeGreaterThan(DELTA_ESCAPE_MCA);
  });
});

describe('puntosAltos y la prominencia', () => {
  it('encuentra una loma de verdad', () => {
    const p = perfilDe([[0, 100], [100, 105], [200, 112], [300, 104], [400, 99]]);
    const altos = puntosAltos(p);
    expect(altos).toHaveLength(1);
    expect(p[altos[0]!.i]!.distancia_m).toBe(200);
    // 112 contra el más alto de los dos fondos (100 a la izquierda, 99 a la
    // derecha): 12 m. No son los 8 m del valle más cercano.
    expect(altos[0]!.prominencia_m).toBeCloseTo(12, 6);
  });

  it('NO marca una ondulación de pocos centímetros, que es ruido del modelo de elevación', () => {
    const p = perfilDe([[0, 100], [100, 100.3], [200, 100.0], [300, 100.25], [400, 99.9]]);
    expect(puntosAltos(p)).toHaveLength(0);
  });

  it('con un DEM de dron se baja el umbral y entonces sí las ve', () => {
    const p = perfilDe([[0, 100], [100, 100.3], [200, 100.0], [300, 100.25], [400, 99.9]]);
    expect(puntosAltos(p, 0.1).length).toBeGreaterThan(0);
  });

  it('en un perfil que sólo baja no hay ningún punto alto', () => {
    const p = perfilDe([[0, 120], [100, 110], [200, 100], [300, 90]]);
    expect(puntosAltos(p)).toHaveLength(0);
  });

  it('la prominencia es la bajada menor de los dos lados, no la mayor', () => {
    // 10 m de caída a la izquierda y 3 a la derecha: la prominencia es 3.
    const p = perfilDe([[0, 90], [100, 100], [200, 97], [300, 101]]);
    const altos = puntosAltos(p, 1);
    expect(altos).toHaveLength(1);
    expect(altos[0]!.prominencia_m).toBeCloseTo(3, 6);
  });

  it('el umbral por defecto es un metro y está declarado como criterio de acequia', () => {
    expect(PROMINENCIA_MIN_M).toBe(1.0);
  });
});

describe('ventosasEnPerfil', () => {
  it('pone una purga continua en el punto alto y dice su prominencia', () => {
    const r = ventosasEnPerfil({ perfil: perfilDe([[0, 100], [200, 112], [400, 99]]) });
    const alto = r.puntos.find(q => q.motivo === 'punto_alto')!;
    expect(alto.tipo).toBe('CAV');
    expect(alto.distancia_m).toBe(200);
    expect(alto.prominencia_m).toBeCloseTo(12, 6);
  });

  it('si en el punto alto ya hay una salida, no pide ventosa y explica por qué', () => {
    const perfil = perfilDe([[0, 100], [200, 112], [400, 99]]);
    const r = ventosasEnPerfil({ perfil, salidas_m: [205] });
    expect(r.puntos.filter(q => q.motivo === 'punto_alto')).toHaveLength(0);
    expect(r.avisos.join(' ')).toContain('la salida ventea');
  });

  it('marca el quiebre hacia abajo de más de 10° aunque no haya loma', () => {
    // Sube 1° en 200 m y después baja 20°: el quiebre son 21°.
    const perfil = perfilDe([[0, 100], [200, 103.5], [400, 103.5 - 200 * Math.tan(20 * Math.PI / 180)]]);
    const r = ventosasEnPerfil({ perfil });
    const q = r.puntos.find(x => x.motivo === 'quiebre_descendente' || x.motivo === 'punto_alto')!;
    expect(q.distancia_m).toBe(200);
  });

  it('un quiebre suave de menos de 10° no lleva ventosa', () => {
    const perfil = perfilDe([[0, 100], [500, 100], [1000, 100 - 500 * Math.tan(5 * Math.PI / 180)]]);
    const r = ventosasEnPerfil({ perfil });
    expect(r.puntos.filter(x => x.motivo === 'quiebre_descendente')).toHaveLength(0);
  });

  it('en un tramo parejo y largo pone una cada 762 m, aunque no haya nada que detectar', () => {
    const r = ventosasEnPerfil({ perfil: plano(2000) });
    const porTramo = r.puntos.filter(q => q.motivo === 'tramo_largo');
    expect(porTramo).toHaveLength(2);
    expect(porTramo[0]!.distancia_m).toBeCloseTo(762, 0);
    expect(porTramo[1]!.distancia_m).toBeCloseTo(1524, 0);
  });

  it('nunca deja un hueco de más de 762 m entre dos ventosas', () => {
    const r = ventosasEnPerfil({ perfil: plano(5000) });
    for (let i = 1; i < r.puntos.length; i++) {
      expect(r.puntos[i]!.distancia_m - r.puntos[i - 1]!.distancia_m).toBeLessThanOrEqual(ESPACIADO_MAX_M + 1e-6);
    }
  });

  it('siempre pone una de doble efecto en la entrada y otra en el extremo', () => {
    const r = ventosasEnPerfil({ perfil: plano(300) });
    const entrada = r.puntos.find(q => q.motivo === 'entrada')!;
    const extremo = r.puntos.find(q => q.motivo === 'extremo')!;
    expect(entrada.tipo).toBe('AVR');
    expect(extremo.tipo).toBe('AVR');
    expect(entrada.distancia_m).toBe(0);
    expect(extremo.distancia_m).toBe(300);
  });

  it('la lista sale ordenada por progresiva', () => {
    const perfil = perfilDe([[0, 100], [300, 118], [600, 101], [900, 120], [1200, 100]]);
    const r = ventosasEnPerfil({ perfil });
    for (let i = 1; i < r.puntos.length; i++) {
      expect(r.puntos[i]!.distancia_m).toBeGreaterThanOrEqual(r.puntos[i - 1]!.distancia_m);
    }
  });

  it('no duplica una ventosa cuando el punto alto y el quiebre son el mismo punto', () => {
    const perfil = perfilDe([[0, 100], [200, 130], [400, 100]]);
    const r = ventosasEnPerfil({ perfil });
    const en200 = r.puntos.filter(q => Math.abs(q.distancia_m - 200) < 1);
    expect(en200).toHaveLength(1);
  });

  it('avisa cuando no encontró ningún punto alto, porque puede ser el dato y no el terreno', () => {
    const r = ventosasEnPerfil({ perfil: plano(900) });
    expect(r.avisos.join(' ')).toContain('relevar el perfil con GPS');
  });

  it('informa el largo y el desnivel entre puntas', () => {
    const r = ventosasEnPerfil({ perfil: perfilDe([[0, 100], [500, 90]]) });
    expect(r.largo_m).toBe(500);
    expect(r.desnivel_m).toBe(-10);
  });

  it('con un perfil de un solo punto no inventa nada', () => {
    const r = ventosasEnPerfil({ perfil: perfilDe([[0, 100]]) });
    expect(r.puntos).toHaveLength(0);
    expect(r.avisos.join(' ')).toContain('suficientes puntos');
  });

  it('cada ventosa trae un detalle que dice qué hacer ahí', () => {
    const r = ventosasEnPerfil({ perfil: perfilDe([[0, 100], [300, 118], [600, 101], [1800, 99]]) });
    for (const q of r.puntos) {
      expect(q.detalle.length).toBeGreaterThan(30);
      expect(['CAV', 'AVR', 'VR']).toContain(q.tipo);
    }
  });
});

describe('interpolarCota', () => {
  it('interpola linealmente entre dos puntos del perfil', () => {
    const p = perfilDe([[0, 100], [100, 110]]);
    expect(interpolarCota(p, 50)).toBeCloseTo(105, 6);
  });

  it('fuera del perfil devuelve la cota de la punta más cercana', () => {
    const p = perfilDe([[0, 100], [100, 110]]);
    expect(interpolarCota(p, -10)).toBe(100);
    expect(interpolarCota(p, 500)).toBe(110);
  });

  it('con el perfil vacío devuelve cero en lugar de romperse', () => {
    expect(interpolarCota([], 10)).toBe(0);
  });
});
