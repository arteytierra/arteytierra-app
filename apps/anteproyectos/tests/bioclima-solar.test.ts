import { describe, expect, it } from 'vitest';
import { posicionSolar, diaDelAnio, horasSalidaPuesta } from '@/lib/bioclima/posicionSolar';
import { direccionDesdeAzimutElevacion, factorSombreado, type RayoSolar } from '@/lib/bioclima/sombra';
import { azimutLocal, evaluadorSolarReal, horasDeSol } from '@/lib/bioclima/evaluadorSolar';
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

// Hallazgos de la revisión de Checkpoint 1 (Pista B, 26/08/2026): horasSol
// sobrecontaba intervalos inclusivos, y el azimut del sol no se rotaba por
// sitio.sistema.norte_deg antes de armar el rayo en coordenadas locales.
describe('azimutLocal', () => {
  it('con norte_deg = 0, el azimut local coincide con el geográfico', () => {
    expect(azimutLocal(90, 0)).toBe(90);
  });

  it('resta norte_deg (giro horario del eje Y local) del azimut geográfico', () => {
    expect(azimutLocal(90, 90)).toBe(0);
    expect(azimutLocal(200, 90)).toBe(110);
  });

  it('da la vuelta en 0°/360° sin devolver negativos', () => {
    expect(azimutLocal(10, 90)).toBe(280);
    expect(azimutLocal(0, -90)).toBe(90);
  });
});

describe('horasDeSol', () => {
  it('con todas las muestras iluminadas, da exactamente el largo del período (no lo excede)', () => {
    const muestras = [6, 9, 12, 15, 18].map(hora => ({ hora, iluminado: true }));
    // Período real: 18 - 6 = 12h. La fórmula vieja (conteo × paso) daba
    // 5 muestras × 3h = 15h — más que el período evaluado.
    expect(horasDeSol(muestras)).toBe(12);
  });

  it('con la mitad de las muestras iluminadas de forma contigua, integra por trapecios', () => {
    const muestras = [
      { hora: 6, iluminado: false },
      { hora: 9, iluminado: true },
      { hora: 12, iluminado: true },
      { hora: 15, iluminado: false },
    ];
    // Trapecio 6-9: (0+1)/2 × 3 = 1.5; 9-12: (1+1)/2 × 3 = 3; 12-15: (1+0)/2 × 3 = 1.5.
    expect(horasDeSol(muestras)).toBe(6);
  });

  it('con ninguna muestra iluminada, da 0', () => {
    const muestras = [6, 9, 12].map(hora => ({ hora, iluminado: false }));
    expect(horasDeSol(muestras)).toBe(0);
  });

  it('con una sola muestra, no hay período que integrar: 1h si está iluminada, si no 0', () => {
    expect(horasDeSol([{ hora: 12, iluminado: true }])).toBe(1);
    expect(horasDeSol([{ hora: 12, iluminado: false }])).toBe(0);
  });
});

describe('evaluadorSolarReal.evaluar — respeta norte_deg', () => {
  // Muro a lo largo del eje X local, en y=10 (es decir, a azimut LOCAL 0°).
  const muro: ObjetoPrisma = {
    id: 'muro-norte-local', tipo: 'muro', geometria: 'prisma',
    vertices: [{ x_m: -5, y_m: 10 }, { x_m: 5, y_m: 10 }, { x_m: 5, y_m: 10.5 }, { x_m: -5, y_m: 10.5 }],
    z0_m: 0, altura_m: 3,
  };
  const evaluado: ObjetoPrisma = {
    id: 'punto-eval', tipo: 'muro', geometria: 'prisma',
    vertices: [{ x_m: -0.5, y_m: 0 }, { x_m: 0.5, y_m: 0 }, { x_m: 0.5, y_m: 0.1 }, { x_m: -0.5, y_m: 0.1 }],
    z0_m: 1, altura_m: 0,
  };
  const volumenesRotados: ObjetoVolumen[] = [muro, evaluado];

  it('un sitio con norte_deg = 90 gira el sol en la escena antes de calcular la sombra', async () => {
    // lat 0, equinoccio, 6:30 solar: sol bajo (rasante, ~7.5°) a azimut
    // geográfico ~90° (este). Con norte_deg = 90, el azimut LOCAL queda ~0°
    // (alineado con el muro en y=10) y lo rasante alcanza para taparlo; con
    // norte_deg = 0 (bug), el rayo se habría armado a azimut local ~90° —
    // casi paralelo al muro, nunca llega a y=10 — y no lo hubiera tapado.
    const fecha = new Date(Date.UTC(2026, 2, 21));
    const rotado: ModeloSitio = {
      id: 's-rot', sistema: { origen: { lat: 0, lng: 0, elevacion_m: 0 }, norte_deg: 90 },
      poligono: [], linderos: [],
      elevacion: { valores_m: [[0, 0], [0, 0]], origenLocal: { x_m: 0, y_m: 0 }, pasoX_m: 10, pasoY_m: 10, filas: 2, columnas: 2, fuente: 'glo30' },
      accesos: [], vistas: [],
    };
    const sinRotar: ModeloSitio = { ...rotado, id: 's-plano', sistema: { ...rotado.sistema, norte_deg: 0 } };

    const conRotacion = await evaluadorSolarReal.evaluar(volumenesRotados, rotado, fecha, [6.5]);
    const sinRotacion = await evaluadorSolarReal.evaluar(volumenesRotados, sinRotar, fecha, [6.5]);

    const rEval = conRotacion.resultados.find(r => r.objetoId === 'punto-eval')!;
    const rEvalPlano = sinRotacion.resultados.find(r => r.objetoId === 'punto-eval')!;
    expect(rEval.muestras[0]!.porcentajeSombreado).toBeGreaterThan(rEvalPlano.muestras[0]!.porcentajeSombreado);
  });
});
