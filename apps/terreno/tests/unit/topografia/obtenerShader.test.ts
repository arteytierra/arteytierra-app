/**
 * Tests de la cascada de relieve.
 *
 * Lo que se prueba acá no es el cálculo del shader (eso ya lo cubren
 * `shaderRango` y `grillaElevacion`) sino el ORDEN: qué fuente se intenta
 * primero, cuándo se cae a la siguiente, y qué pasa cuando una explota.
 *
 * Es el motivo de haber sacado la cascada afuera del componente: adentro esto
 * requería montar el mapa entero, y `obtenerGrillaDensa` ni siquiera corre
 * fuera del browser (dibuja los tiles en un canvas).
 */
import { describe, it, expect, vi } from 'vitest';
import { obtenerShader, type DepsRelieve } from '@/lib/relieve/obtenerShader';
import type { DatosShader } from '@/lib/shaders';
import type { DEMImportado } from '@/lib/demImport';
import { grillaDesdeFn } from './_grilla';

const PREDIO = [
  { lat: -30.010, lng: -64.010 },
  { lat: -30.010, lng: -64.000 },
  { lat: -30.000, lng: -64.000 },
  { lat: -30.000, lng: -64.010 },
];

/** Un shader cualquiera: lo único que importa es poder distinguirlo por `elev_min`. */
function shaderFalso(marca: number): DatosShader {
  return { celdas: [], elev_min: marca, elev_max: marca + 10, pend_max: 5 };
}

const DEM_FALSO = {
  grilla: grillaDesdeFn(5, 5, (r) => 800 + r),
  ancho: 5, alto: 5, pasoM: 1,
} as unknown as DEMImportado;

/** Dobles de las cuatro dependencias. Por defecto todas fallan: cada test prende la suya. */
function deps(over: Partial<DepsRelieve> = {}): DepsRelieve {
  return {
    shaderDesdeDEM:     vi.fn(() => null),
    obtenerGrillaDensa: vi.fn(async () => null),
    shaderDesdeGrilla:  vi.fn(() => null),
    fetchShader:        vi.fn(async () => ({ error: 'sin red' })),
    ...over,
  } as DepsRelieve;
}

describe('obtenerShader — cascada de fuentes', () => {
  it('rechaza un predio de menos de 3 mojones sin tocar ninguna fuente', async () => {
    const d = deps();
    const r = await obtenerShader([{ lat: -30, lng: -64 }], {}, d);

    expect(r.ok).toBe(false);
    expect(d.fetchShader).not.toHaveBeenCalled();
    expect(d.obtenerGrillaDensa).not.toHaveBeenCalled();
  });

  it('con DEM propio no sale a internet', async () => {
    const d = deps({ shaderDesdeDEM: vi.fn(() => shaderFalso(1)) });
    const r = await obtenerShader(PREDIO, { demPropio: DEM_FALSO }, d);

    expect(r).toMatchObject({ ok: true, via: 'dem_propio' });
    expect(d.obtenerGrillaDensa).not.toHaveBeenCalled();
    expect(d.fetchShader).not.toHaveBeenCalled();
  });

  it('si el DEM propio no sirve, sigue con las fuentes satelitales', async () => {
    const d = deps({
      shaderDesdeDEM:     vi.fn(() => null),          // grilla degenerada
      obtenerGrillaDensa: vi.fn(async () => grillaDesdeFn(5, 5, (r) => 800 + r)),
      shaderDesdeGrilla:  vi.fn(() => shaderFalso(2)),
    });
    const r = await obtenerShader(PREDIO, { demPropio: DEM_FALSO }, d);

    expect(r).toMatchObject({ ok: true, via: 'grilla_densa' });
  });

  it('si la grilla densa explota, cae al muestreo 10×10 y NO queda en error', async () => {
    const d = deps({
      obtenerGrillaDensa: vi.fn(async () => { throw new Error('tiles caídos'); }),
      fetchShader:        vi.fn(async () => shaderFalso(3)),
    });
    const r = await obtenerShader(PREDIO, {}, d);

    expect(r).toMatchObject({ ok: true, via: 'muestreo' });
  });

  it('si la grilla densa devuelve null, también cae al muestreo', async () => {
    const d = deps({ fetchShader: vi.fn(async () => shaderFalso(4)) });
    const r = await obtenerShader(PREDIO, {}, d);

    expect(r).toMatchObject({ ok: true, via: 'muestreo' });
    expect(d.obtenerGrillaDensa).toHaveBeenCalled();
  });

  it('en modo rápido saltea la grilla densa', async () => {
    const d = deps({ fetchShader: vi.fn(async () => shaderFalso(5)) });
    const r = await obtenerShader(PREDIO, { detallado: false }, d);

    expect(r).toMatchObject({ ok: true, via: 'muestreo' });
    expect(d.obtenerGrillaDensa).not.toHaveBeenCalled();
  });

  it('si falla la última fuente, devuelve el motivo', async () => {
    const r = await obtenerShader(PREDIO, {}, deps());

    expect(r).toEqual({ ok: false, mensaje: 'sin red' });
  });
});
