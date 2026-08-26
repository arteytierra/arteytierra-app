import { describe, expect, it } from 'vitest';
import { posicionSolar, diaDelAnio, horasSalidaPuesta } from '@/lib/bioclima/posicionSolar';
import { direccionDesdeAzimutElevacion, factorSombreado, type RayoSolar } from '@/lib/bioclima/sombra';
import { evaluadorSolarReal } from '@/lib/bioclima/evaluadorSolar';
import type { ObjetoPrisma, ObjetoSuperficie, ObjetoVolumen, ModeloSitio } from '@arteytierra/anteproyectos-contracts';

describe('posicionSolar', () => {
  it('en el ecuador, equinoccio, mediodía solar: el sol está casi cenital', () => {
    const doy = diaDelAnio(new Date(Date.UTC(2026, 2, 21))); // ~21 mar
    const pos = posicionSolar(0, doy, 12);
    expect(pos.elevacion_deg).toBeGreaterThan(85);
  });

  it('el amanecer en el ecuador es hacia el este (azimut ~90°)', () => {
    const doy = diaDelAnio(new Date(Date.UTC(2026, 2, 21)));
    const { salida } = horasSalidaPuesta(0, doy);
    const pos = posicionSolar(0, doy, salida + 0.1);
    expect(pos.azimut_deg).toBeGreaterThan(80);
    expect(pos.azimut_deg).toBeLessThan(100);
  });

  it('en el hemisferio sur, pleno invierno (jun), el sol de mediodía es más bajo que en verano (dic)', () => {
    const lat = -34; // Buenos Aires aprox
    const doyInvierno = diaDelAnio(new Date(Date.UTC(2026, 5, 21)));
    const doyVerano = diaDelAnio(new Date(Date.UTC(2026, 11, 21)));
    const invierno = posicionSolar(lat, doyInvierno, 12);
    const verano = posicionSolar(lat, doyVerano, 12);
    expect(invierno.elevacion_deg).toBeLessThan(verano.elevacion_deg);
  });
});

describe('factorSombreado — prisma (muro vertical)', () => {
  const muro: ObjetoPrisma = {
    id: 'muro-norte', tipo: 'muro', geometria: 'prisma',
    vertices: [
      { x_m: -5, y_m: 10 }, { x_m: 5, y_m: 10 }, { x_m: 5, y_m: 10.5 }, { x_m: -5, y_m: 10.5 },
    ],
    z0_m: 0, altura_m: 3,
  };

  it('sol bajo (rasante) desde el norte: el muro tapa al punto de evaluación', () => {
    const rayo: RayoSolar = { x0_m: 0, y0_m: 0, z0_m: 1, ...direccionDesdeAzimutElevacion(0, 10) };
    expect(factorSombreado([muro], rayo)).toBeGreaterThan(0);
  });

  it('sol muy alto (casi cenital): el rayo pasa por encima del muro, no tapa', () => {
    const rayo: RayoSolar = { x0_m: 0, y0_m: 0, z0_m: 1, ...direccionDesdeAzimutElevacion(0, 80) };
    expect(factorSombreado([muro], rayo)).toBe(0);
  });

  it('un objeto no se sombrea a sí mismo (excluirId)', () => {
    const rayo: RayoSolar = { x0_m: 0, y0_m: 10.25, z0_m: 1, ...direccionDesdeAzimutElevacion(0, 10) };
    expect(factorSombreado([muro], rayo, 'muro-norte')).toBe(0);
  });

  it('respeta opacidadSolar (vegetación semitransparente)', () => {
    const vegetacion: ObjetoPrisma = { ...muro, id: 'seto', tipo: 'vegetacion', opacidadSolar: 0.4 };
    const rayo: RayoSolar = { x0_m: 0, y0_m: 0, z0_m: 1, ...direccionDesdeAzimutElevacion(0, 10) };
    expect(factorSombreado([vegetacion], rayo)).toBeCloseTo(0.4);
  });
});

describe('factorSombreado — superficie (cubierta inclinada)', () => {
  // Faldón que sube de z=3 (y=-5) a z=6 (y=5), techo sobre un punto en el origen.
  const cubierta: ObjetoSuperficie = {
    id: 'faldon-1', tipo: 'cubierta', geometria: 'superficie',
    vertices: [
      { x_m: -5, y_m: -5, z_m: 3 }, { x_m: 5, y_m: -5, z_m: 3 },
      { x_m: 5, y_m: 5, z_m: 6 }, { x_m: -5, y_m: 5, z_m: 6 },
    ],
  };

  it('sol casi cenital: el faldón tapa al punto directamente debajo', () => {
    const rayo: RayoSolar = { x0_m: 0, y0_m: 0, z0_m: 1, ...direccionDesdeAzimutElevacion(0, 89) };
    expect(factorSombreado([cubierta], rayo)).toBeGreaterThan(0);
  });

  it('sol muy rasante alejándose del faldón: el rayo sale de la huella antes de cruzar el plano', () => {
    const rayo: RayoSolar = { x0_m: 0, y0_m: 0, z0_m: 1, ...direccionDesdeAzimutElevacion(90, 2) };
    expect(factorSombreado([cubierta], rayo)).toBe(0);
  });
});

describe('evaluadorSolarReal.evaluar', () => {
  const sitio: ModeloSitio = {
    id: 'sitio-test',
    sistema: { origen: { lat: -34, lng: -58, elevacion_m: 0 }, norte_deg: 0 },
    poligono: [],
    linderos: [],
    elevacion: { valores_m: [[0, 0], [0, 0]], origenLocal: { x_m: 0, y_m: 0 }, pasoX_m: 10, pasoY_m: 10, filas: 2, columnas: 2, fuente: 'glo30' },
    accesos: [],
    vistas: [],
  };

  const muro: ObjetoPrisma = {
    id: 'muro-norte', tipo: 'muro', geometria: 'prisma',
    vertices: [{ x_m: -5, y_m: 10 }, { x_m: 5, y_m: 10 }, { x_m: 5, y_m: 10.5 }, { x_m: -5, y_m: 10.5 }],
    z0_m: 0, altura_m: 3,
  };
  const evaluado: ObjetoPrisma = {
    id: 'ventana-sur', tipo: 'muro', geometria: 'prisma',
    vertices: [{ x_m: -0.5, y_m: 0 }, { x_m: 0.5, y_m: 0 }, { x_m: 0.5, y_m: 0.1 }, { x_m: -0.5, y_m: 0.1 }],
    z0_m: 1, altura_m: 0,
  };
  const volumenes: ObjetoVolumen[] = [muro, evaluado];

  it('produce un resultado por objeto con una muestra por hora pedida', async () => {
    const horas = [6, 9, 12, 15, 18];
    const mapa = await evaluadorSolarReal.evaluar(volumenes, sitio, new Date(Date.UTC(2026, 5, 21)), horas);
    expect(mapa.resultados).toHaveLength(volumenes.length);
    for (const r of mapa.resultados) expect(r.muestras).toHaveLength(horas.length);
  });

  it('de noche (sol bajo el horizonte) el objeto queda sin iluminar', async () => {
    const mapa = await evaluadorSolarReal.evaluar(volumenes, sitio, new Date(Date.UTC(2026, 5, 21)), [0]);
    const r = mapa.resultados.find(r => r.objetoId === 'ventana-sur')!;
    expect(r.muestras[0]!.iluminado).toBe(false);
  });
});
