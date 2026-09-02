/**
 * Tests de la máquina de estados del relieve.
 *
 * El punto de estos asserts no es que el reducer "funcione" —son cuatro líneas—
 * sino fijar las transiciones que antes se hacían a mano en cinco lugares
 * distintos de `handleFetchShader`, que es donde se colaban los estados
 * imposibles: spinner girando con datos ya cargados, o un error viejo pintado
 * arriba de un cálculo nuevo.
 */
import { describe, it, expect } from 'vitest';
import { reducerRelieve, datosDe, RELIEVE_VACIO, type EstadoRelieve } from '@/lib/relieve/reducerRelieve';
import type { DatosShader } from '@/lib/shaders';

const DATOS: DatosShader = { celdas: [], elev_min: 800, elev_max: 840, pend_max: 12 };
const LISTO: EstadoRelieve = { fase: 'listo', datos: DATOS };

describe('reducerRelieve', () => {
  it('calcular deja un único estado, sin datos viejos ni error viejo', () => {
    const desdeError = reducerRelieve({ fase: 'error', mensaje: 'sin red' }, { t: 'calcular' });
    const desdeListo = reducerRelieve(LISTO, { t: 'calcular' });

    expect(desdeError).toEqual({ fase: 'calculando' });
    expect(desdeListo).toEqual({ fase: 'calculando' });
  });

  it('un resultado ok deja los datos y apaga el cálculo', () => {
    const e = reducerRelieve({ fase: 'calculando' }, { t: 'resuelto', res: { ok: true, datos: DATOS, via: 'muestreo' } });

    expect(e).toEqual(LISTO);
    expect(datosDe(e)).toBe(DATOS);
  });

  it('un resultado con error apaga el cálculo y no deja datos', () => {
    const e = reducerRelieve({ fase: 'calculando' }, { t: 'resuelto', res: { ok: false, mensaje: 'sin red' } });

    expect(e).toEqual({ fase: 'error', mensaje: 'sin red' });
    expect(datosDe(e)).toBeNull();
  });

  it('poner carga datos de afuera de la cascada (DEM importado, escenario guardado)', () => {
    expect(reducerRelieve(RELIEVE_VACIO, { t: 'poner', datos: DATOS })).toEqual(LISTO);
  });

  it('poner con null vuelve a vacío: abrir un escenario sin relieve borra el anterior', () => {
    expect(reducerRelieve(LISTO, { t: 'poner', datos: null })).toEqual(RELIEVE_VACIO);
  });

  it('datosDe es null en toda fase que no sea listo', () => {
    expect(datosDe(RELIEVE_VACIO)).toBeNull();
    expect(datosDe({ fase: 'calculando' })).toBeNull();
    expect(datosDe({ fase: 'error', mensaje: 'x' })).toBeNull();
  });
});
