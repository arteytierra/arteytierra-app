/**
 * El tope de superficie de la muestra de topografía.
 *
 * Decisión comercial del 24/09/2026: en Semilla las curvas de nivel, el relieve
 * y la vista 3D siguen siendo gratis, pero sólo hasta media hectárea. Cerró la
 * divergencia de que la vidriera cobrara en Personal algo que la app regalaba.
 *
 * Lo que estos tests cuidan es que la regla sea UNA. El candado de la interfaz
 * y el guard de `/api/dem` tienen que decidir igual: si divergen, el usuario ve
 * una pestaña abierta que después devuelve 403, o al revés.
 */
import { describe, it, expect } from 'vitest';
import {
  ACEQUIA_TOPO_SEMILLA_HA, acequiaTopoPermitida, tabBloqueadaConArea, tabBloqueada,
} from '@/lib/entitlements';
import { haDeBBox } from '@/lib/coordenadas';

describe('acequiaTopoPermitida', () => {
  it('Semilla ve la topografía de un predio chico', () => {
    expect(acequiaTopoPermitida('semilla', 0.2)).toBe(true);
  });

  it('el tope es inclusivo: justo en el límite todavía pasa', () => {
    expect(acequiaTopoPermitida('semilla', ACEQUIA_TOPO_SEMILLA_HA)).toBe(true);
    expect(acequiaTopoPermitida('semilla', ACEQUIA_TOPO_SEMILLA_HA + 0.01)).toBe(false);
  });

  it('sin superficie todavía calculada NO se bloquea', () => {
    // El predio recién dibujado, o a medio cerrar, no tiene área. Bloquear ahí
    // dejaría al usuario trabado por un dato que la app aún no produjo — y es
    // justo el momento en que está probando la herramienta.
    expect(acequiaTopoPermitida('semilla', null)).toBe(true);
  });

  it('los planes pagos no tienen tope de tamaño', () => {
    for (const plan of ['personal', 'profesional', 'estudio'] as const) {
      expect(acequiaTopoPermitida(plan, 50_000), plan).toBe(true);
    }
  });
});

describe('el candado de la UI aplica la misma regla', () => {
  it('tabBloqueadaConArea coincide con acequiaTopoPermitida en el tab topo', () => {
    for (const ha of [null, 0.1, 0.5, 0.51, 2, 500]) {
      for (const plan of ['semilla', 'personal', 'profesional', 'estudio'] as const) {
        expect(
          tabBloqueadaConArea(plan, 'topo', ha),
          plan + ' con ' + ha + ' ha',
        ).toBe(!acequiaTopoPermitida(plan, ha));
      }
    }
  });

  it('el tope no se derrama sobre los otros tabs', () => {
    // Si `tabBloqueadaConArea` empezara a mirar la superficie para cualquier
    // tab, un predio grande apagaría media app sin que nadie lo decidiera.
    for (const tab of ['clima', 'suelo', 'keyline', 'riego', 'economia']) {
      for (const plan of ['semilla', 'personal'] as const) {
        expect(tabBloqueadaConArea(plan, tab, 5_000), tab + '/' + plan)
          .toBe(tabBloqueada(plan, tab));
      }
    }
  });
});

describe('haDeBBox', () => {
  it('un cuadrado de 0,01° a 30° de latitud da la superficie esperada', () => {
    // 0,01° de latitud = 1.113,2 m. En longitud, eso por cos(30°) = 964,0 m.
    // 1.113,2 × 964,0 = 1.073.125 m2 = 107,3 ha.
    expect(haDeBBox(-64.01, -30.01, -64.00, -30.00)).toBeCloseTo(107.3, 0);
  });

  it('en el ecuador el bbox es cuadrado y el área es el máximo', () => {
    const ecuador = haDeBBox(-64.01, -0.005, -64.00, 0.005);
    const lat60   = haDeBBox(-64.01, 59.995, -64.00, 60.005);
    // A 60° el coseno vale 0,5: la mitad de ancho, la mitad de superficie.
    expect(lat60 / ecuador).toBeCloseTo(0.5, 2);
  });

  it('media hectárea son unos 70 m de lado', () => {
    // El número que hace al tope: 0,5 ha es un cuadrado de 70,7 m, o sea 2,4
    // celdas del modelo global de 30 m. Está acá para que se vea al leerlo.
    const grados = 70.71 / 111_320;
    expect(haDeBBox(-64, -30, -64 + grados / Math.cos(30 * Math.PI / 180), -30 + grados))
      .toBeCloseTo(0.5, 2);
  });
});
