import { describe, expect, it } from 'vitest';

import { BIOMAS_GLOBALES } from '../../../lib/biomasGlobales';
import { BIOMAS_REGIONALES } from '../../../lib/biomasRegionales';
import { componerAptitud } from '../../../lib/contexto';
import type { ModificadorAptitud } from '../../../lib/biomaTipos';

/**
 * Tercer tramo del mismo barrido, ahora sobre lo que hereda el resto del
 * planeta. La diferencia con América y Europa es que fuera de ellas casi no hay
 * fichas regionales: 451 de las 847 ecorregiones de RESOLVE reciben el bioma
 * global y nada más. Ver `_research/COBERTURA_MUNDO.md`.
 */

const delta = (aptitud: ModificadorAptitud[], uso: ModificadorAptitud['uso']) =>
  aptitud.find((m) => m.uso === uso)?.delta;

const razon = (aptitud: ModificadorAptitud[], uso: ModificadorAptitud['uso']) =>
  aptitud.find((m) => m.uso === uso)?.razon ?? '';

const efectiva = (id: string, biomaGlobalId: string) =>
  componerAptitud(BIOMAS_REGIONALES[id]?.aptitud, BIOMAS_GLOBALES[biomaGlobalId]?.aptitud);

describe('el pastizal templado tampoco es la Pampa en las High Plains', () => {
  it('la pradera de pastos cortos deja de recomendar huerta', () => {
    // Mismo caso que la badia siria y la meseta de Anatolia: el bioma global
    // está calibrado sobre chernozem profundo. Acá son Aridisoles con poca
    // reserva de agua, y la huerta que existe se riega con el Ogallala.
    expect(delta(BIOMAS_GLOBALES['resolve_pastizal_templado']!.aptitud!, 'huerta')).toBe(10);
    expect(delta(efectiva('pradera_pastos_cortos', 'resolve_pastizal_templado'), 'huerta')).toBeLessThan(0);
  });

  it('pero el pastoreo sigue en positivo: es pradera', () => {
    expect(delta(efectiva('pradera_pastos_cortos', 'resolve_pastizal_templado'), 'pasturas')).toBeGreaterThan(0);
  });
});

describe('el bosque tropical húmedo habla por medio planeta y tiene que decir de qué habla', () => {
  it('la razón de huerta no afirma como universal lo que vale para el oxisol', () => {
    // 216 ecorregiones heredan este modificador sin pisarlo, y 145 de ellas
    // —Indomalaya, África tropical, Australasia, Oceanía— no tienen ninguna
    // ficha regional. Media Indomalaya se sostiene sobre andisoles volcánicos,
    // que son lo contrario de un suelo lixiviado.
    const r = razon(BIOMAS_GLOBALES['resolve_bosque_tropical_humedo']!.aptitud!, 'huerta');
    expect(r).toMatch(/volcánico/);
    expect(r).toMatch(/lixiviados/);
  });

  it('y el delta no se movió: corregirlo de verdad pide fichas regionales', () => {
    // Bajar el -25 arreglaría Java rompiendo la Amazonia. La distinción es
    // geográfica y el bioma global no tiene forma de expresarla.
    expect(delta(BIOMAS_GLOBALES['resolve_bosque_tropical_humedo']!.aptitud!, 'huerta')).toBe(-25);
  });
});
