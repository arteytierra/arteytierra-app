import { describe, expect, it } from 'vitest';

import { BIOMAS_GLOBALES } from '../../../lib/biomasGlobales';
import { BIOMAS_REGIONALES_EUROPA } from '../../../lib/biomasRegionalesEuropa';
import { BIOMAS_REGIONALES_EUROPA_UE } from '../../../lib/biomasRegionalesEuropaUE';
import { BIOMAS_REGIONALES_MEDIO_ORIENTE } from '../../../lib/biomasRegionalesMedioOriente';
import { BIOMAS_REGIONALES_NORTE_AFRICA } from '../../../lib/biomasRegionalesNorteAfrica';
import { componerAptitud } from '../../../lib/contexto';
import type { BiomaFicha, ModificadorAptitud } from '../../../lib/biomaTipos';

/**
 * Mismo criterio que `aptitudAmerica.test.ts`: no se prueba qué está escrito
 * en la ficha sino qué aptitud termina viendo el usuario. Una ficha sin
 * `aptitud` propia no calla: hereda la del bioma global, y la herencia puede
 * ser falsa justo donde más importa.
 */

const delta = (aptitud: ModificadorAptitud[], uso: ModificadorAptitud['uso']) =>
  aptitud.find((m) => m.uso === uso)?.delta;

const ficha = (id: string): BiomaFicha => {
  const f = BIOMAS_REGIONALES_EUROPA[id]
    ?? BIOMAS_REGIONALES_EUROPA_UE[id]
    ?? BIOMAS_REGIONALES_MEDIO_ORIENTE[id]
    ?? BIOMAS_REGIONALES_NORTE_AFRICA[id];
  if (!f) throw new Error(`no existe la ficha ${id}`);
  return f;
};

const efectiva = (id: string, biomaGlobalId: string) =>
  componerAptitud(ficha(id).aptitud, BIOMAS_GLOBALES[biomaGlobalId]?.aptitud);

describe('la estepa templada no es la Pampa', () => {
  it('en la badia siria la huerta deja de estar recomendada', () => {
    // El pastizal templado global está calibrado sobre chernozem —Pampa,
    // Ucrania— y da huerta +10. La badia tiene entre 100 y 250 mm, y ararla
    // fue el error histórico de la región: rompió la costra que sujetaba el
    // suelo y el matorral no volvió.
    expect(delta(BIOMAS_GLOBALES['resolve_pastizal_templado']!.aptitud!, 'huerta')).toBe(10);
    expect(delta(efectiva('estepa_siria_badia', 'resolve_pastizal_templado'), 'huerta')).toBeLessThan(0);
  });

  it('pero el pastoreo sigue en positivo: la badia es tierra de pastoreo', () => {
    // La corrección tiene que distinguir "acá no se puede" de "acá no se
    // puede así". Negar la pastura sería negar el uso que sostiene la región.
    expect(delta(efectiva('estepa_siria_badia', 'resolve_pastizal_templado'), 'pasturas')).toBeGreaterThan(0);
  });

  it('en la meseta de Anatolia lo que limita es el acuífero, no el suelo', () => {
    expect(delta(efectiva('meseta_anatolia_estepa', 'resolve_pastizal_templado'), 'huerta')).toBeLessThan(0);
  });
});

describe('lo hiperárido y lo salino no son el desierto promedio', () => {
  it('en el Rub al-Jali la huerta cae muy por debajo del desierto genérico', () => {
    const generico = delta(BIOMAS_GLOBALES['resolve_desierto_matorral_xerofilo']!.aptitud!, 'huerta')!;
    expect(delta(efectiva('nefud_rub_al_khali', 'resolve_desierto_matorral_xerofilo'), 'huerta')).toBeLessThan(generico);
  });

  it('pero el pastoreo camellero del interduna se deja heredado, no se niega', () => {
    const a = efectiva('nefud_rub_al_khali', 'resolve_desierto_matorral_xerofilo');
    expect(delta(a, 'pasturas')).toBe(delta(BIOMAS_GLOBALES['resolve_desierto_matorral_xerofilo']!.aptitud!, 'pasturas'));
  });

  it('un chott no es pastizal inundable: es donde termina la sal', () => {
    expect(delta(BIOMAS_GLOBALES['resolve_pastizal_inundable']!.aptitud!, 'pasturas')).toBeGreaterThan(0);
    expect(delta(efectiva('chotts_sebkhas', 'resolve_pastizal_inundable'), 'pasturas')).toBeLessThan(0);
  });
});

describe('la tundra global no puede hablar por el bosque de abedul', () => {
  it('el abedular escandinavo no queda tan negado como el desierto polar', () => {
    // Regresión: al poner `forestal -35` en la tundra global, este abedular
    // —que es literalmente bosque— pasó a heredar que acá no se foresta.
    const tundra = delta(BIOMAS_GLOBALES['resolve_tundra']!.aptitud!, 'forestal')!;
    const propio = delta(efectiva('abedular_montano_escandinavo', 'resolve_tundra'), 'forestal')!;
    expect(propio).toBeLessThan(0);
    expect(propio).toBeGreaterThan(tundra);
  });
});
