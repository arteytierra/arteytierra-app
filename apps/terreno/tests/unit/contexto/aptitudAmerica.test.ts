import { describe, expect, it } from 'vitest';

import { BIOMAS_GLOBALES } from '../../../lib/biomasGlobales';
import { BIOMAS_REGIONALES_SUDAMERICA } from '../../../lib/biomasRegionalesSudamerica';
import { componerAptitud } from '../../../lib/contexto';
import type { BiomaFicha, ModificadorAptitud } from '../../../lib/biomaTipos';

/**
 * Lo que se prueba acá no es que cada ficha tenga `aptitud` escrito, sino qué
 * aptitud termina VIENDO el usuario. Una ficha sin aptitud propia no dice nada
 * neutro: hereda la del bioma global, y esa herencia puede ser falsa para su
 * ecorregión. Eso es lo que estos casos fijan.
 */

const delta = (aptitud: ModificadorAptitud[], uso: ModificadorAptitud['uso']) =>
  aptitud.find((m) => m.uso === uso)?.delta;

const ficha = (id: string): BiomaFicha => {
  const f = BIOMAS_REGIONALES_SUDAMERICA[id];
  if (!f) throw new Error(`no existe la ficha ${id}`);
  return f;
};

/** Aptitud efectiva: la propia pisando uso por uso a la del bioma global. */
const efectiva = (id: string, biomaGlobalId: string) =>
  componerAptitud(ficha(id).aptitud, BIOMAS_GLOBALES[biomaGlobalId]?.aptitud);

describe('el bioma global no manda donde se equivoca', () => {
  it('en arena blanca lo forestal deja de ser una ventaja', () => {
    // El bioma húmedo da forestal +20 porque el reciclado de nutrientes es
    // rápido. Sobre espodosol oligotrófico no lo es.
    expect(delta(BIOMAS_GLOBALES['resolve_bosque_tropical_humedo']!.aptitud!, 'forestal')).toBe(20);
    expect(delta(efectiva('campinaranas_aguas_negras', 'resolve_bosque_tropical_humedo'), 'forestal'))
      .toBeLessThan(0);
  });

  it('en los tepuyes tampoco', () => {
    expect(delta(efectiva('pantepui_guayana_alta', 'resolve_bosque_tropical_humedo'), 'forestal'))
      .toBeLessThan(0);
  });

  it('en la mata atlántica y la araucaria, el remanente no se mide como rodal', () => {
    for (const id of ['mata_araucaria_altura', 'mata_atlantica_costera', 'mata_atlantica_interior']) {
      const a = efectiva(id, 'resolve_bosque_tropical_humedo');
      expect(delta(a, 'forestal')).toBe(0);
      expect(delta(a, 'reserva')).toBeGreaterThan(0);
    }
  });

  it('ninguna isla oceánica hereda un frutal recomendado', () => {
    // El +10 de frutales del bosque templado es exactamente lo que no
    // corresponde en una isla donde las invasoras son la amenaza principal.
    expect(delta(BIOMAS_GLOBALES['resolve_bosque_templado_caducifolio_mixto']!.aptitud!, 'frutales')).toBe(10);
    for (const id of ['bosque_juan_fernandez', 'islas_desventuradas']) {
      expect(delta(efectiva(id, 'resolve_bosque_templado_caducifolio_mixto'), 'frutales')).toBeLessThan(0);
    }
  });

  it('en las islas sin suelo no queda ningún uso agrícola en positivo', () => {
    const a = efectiva('isla_malpelo_xerica', 'resolve_desierto_matorral_xerofilo');
    for (const uso of ['huerta', 'frutales', 'pasturas', 'forestal'] as const) {
      expect(delta(a, uso)).toBeLessThan(0);
    }
    expect(delta(a, 'reserva')).toBeGreaterThan(0);
  });

  it('pero Rapa Nui no se declara improductiva: el manavai es un sistema probado', () => {
    expect(delta(ficha('rapa_nui_bosque_subtropical_transformado').aptitud ?? [], 'huerta'))
      .toBeGreaterThan(0);
  });
});

describe('el manglar habla de los cinco usos', () => {
  it('y no sólo de huerta y pasturas: así es como se pierde un manglar', () => {
    const a = BIOMAS_GLOBALES['resolve_manglar']?.aptitud ?? [];
    for (const uso of ['huerta', 'pasturas', 'frutales', 'forestal'] as const) {
      expect(delta(a, uso)).toBeLessThan(0);
    }
    expect(delta(a, 'reserva')).toBeGreaterThan(0);
  });

  it('y las tres fichas de manglar sudamericanas lo heredan entero', () => {
    for (const id of ['manglares_pacifico_suramericano', 'manglares_atlantico_sur_brasil', 'manglares_amazon_orinoco_caribe_sur']) {
      expect(efectiva(id, 'resolve_manglar')).toHaveLength(5);
    }
  });
});
