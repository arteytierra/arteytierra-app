/**
 * Cultivos declarados por ficha y herencia de los modificadores de aptitud.
 *
 * Dos cosas distintas que se tocan y por eso viven juntas.
 *
 * La primera es la lista de cultivos: `BiomaFicha.cultivos` guarda ids del
 * catálogo de `lib/especies.ts`, no nombres. Un id mal escrito no rompe nada
 * —`resolverEspecies` saltea lo que no existe— así que el cultivo desaparece de
 * la pantalla en silencio. Eso es exactamente lo que se fija acá.
 *
 * La segunda es de dónde sale la corrección de aptitud. Vive en las fichas de
 * bioma global, pero la que llega a la pantalla es la regional cuando existe.
 * Sin préstamo, tener ficha regional *quitaba* la corrección: cuanto mejor
 * cubierta la región, menos advertencia recibía el usuario.
 */
import { describe, it, expect } from 'vitest';
import { ESPECIES, ESPECIES_POR_ID, resolverEspecies } from '@/lib/especies';
import { BIOMAS, resolverBioma } from '@/lib/contexto';
import { BIOMAS_REGIONALES } from '@/lib/biomasRegionales';
import { BIOMAS_GLOBALES } from '@/lib/biomasGlobales';
import type { BiomaFicha } from '@/lib/biomaTipos';
import type { Koppen } from '@/lib/clima';
import type { Ecorregion } from '@/lib/ecorregiones';

const k = (codigo: string): Koppen => ({ codigo, descripcion: 'clima' } as Koppen);
const E = (eco_id: number, eco_name: string, bioma_num: number): Ecorregion =>
  ({ eco_id, eco_name, bioma_num, bioma_name: 'x' });

const TODAS: BiomaFicha[] = [
  ...Object.values(BIOMAS),
  ...Object.values(BIOMAS_REGIONALES),
  ...Object.values(BIOMAS_GLOBALES),
];

describe('cultivos declarados por ficha', () => {
  it('todo id de cultivo existe en el catálogo de especies', () => {
    // Sin esto un id viejo o mal tipeado desaparece de la pantalla sin error.
    for (const f of TODAS) {
      for (const id of f.cultivos ?? []) {
        expect(ESPECIES_POR_ID[id], `${f.id} → ${id}`).toBeDefined();
      }
    }
  });

  it('ninguna ficha repite un cultivo', () => {
    for (const f of TODAS) {
      const ids = f.cultivos ?? [];
      expect(new Set(ids).size, f.id).toBe(ids.length);
    }
  });

  it('las doce fichas de casa declaran cultivos y corrección de aptitud', () => {
    // Son las de Argentina y Chile continental, las que más se usan: si alguna
    // se queda sin lista cae al catálogo por Köppen, que no distingue el
    // Espinal de Ohio.
    for (const f of Object.values(BIOMAS)) {
      expect(f.cultivos?.length, f.id).toBeGreaterThan(0);
      expect(f.aptitud?.length, f.id).toBeGreaterThan(0);
    }
  });

  it('la lista de la ficha se resuelve entera, sin ids que se caigan', () => {
    for (const f of Object.values(BIOMAS)) {
      expect(resolverEspecies(f.cultivos ?? []).length, f.id).toBe(f.cultivos!.length);
    }
  });

  it('los modificadores explican el porqué, no sólo el número', () => {
    // Un puntaje que se mueve sin decir por qué no se puede discutir.
    for (const f of TODAS) {
      for (const m of f.aptitud ?? []) {
        expect(m.razon.length, `${f.id} → ${m.uso}`).toBeGreaterThan(20);
        expect(Math.abs(m.delta), `${f.id} → ${m.uso}`).toBeLessThanOrEqual(40);
      }
    }
  });
});

describe('herencia de la aptitud del bioma', () => {
  it('una ficha regional sin modificadores propios usa los de su bioma', () => {
    // Oaxaca: bosque mesófilo de montaña, bioma 1 (selva húmeda). La ficha
    // regional no declara aptitud; antes de la herencia el predio no recibía
    // ninguna advertencia, justo por estar bien cubierto.
    const r = resolverBioma(k('Cwb'), 17.1, -96.7, 1800, E(487, 'Oaxacan montane forests', 1));
    expect(r.ficha?.id).toBe('bosque_mesofilo_montana');
    const global = BIOMAS_GLOBALES['resolve_bosque_tropical_humedo']!;
    expect(r.ficha?.aptitud).toEqual(global.aptitud);
    expect(r.ficha!.aptitud!.length).toBeGreaterThan(0);
  });

  it('la ficha regional que trae los suyos manda sobre el bioma', () => {
    // Las Yungas comparten el bioma 1 con Oaxaca, pero tienen ficha propia con
    // su corrección: la pendiente de ladera no es la del llano amazónico.
    const r = resolverBioma(k('Cwa'), -23.5, -64.8, 1200, E(504, 'Southern Andean Yungas', 1));
    expect(r.ficha?.id).toBe('yungas');
    expect(r.ficha?.aptitud).toEqual(BIOMAS['yungas'].aptitud);
    expect(r.ficha?.aptitud).not.toEqual(BIOMAS_GLOBALES['resolve_bosque_tropical_humedo']!.aptitud);
  });

  it('el préstamo no ensucia el catálogo compartido', () => {
    // Se devuelve una copia: si mutáramos la ficha, el primer predio que se
    // resuelve le fijaría la aptitud a todos los demás del mismo ECO_ID.
    resolverBioma(k('Cwb'), 17.1, -96.7, 1800, E(487, 'Oaxacan montane forests', 1));
    expect(BIOMAS_REGIONALES['bosque_mesofilo_montana']!.aptitud).toBeUndefined();
  });

  it('sin bioma conocido la ficha queda como está, sin inventar corrección', () => {
    // ECO_ID 0 es roca y hielo; el bioma que RESOLVE le deja no describe nada.
    const r = resolverBioma(k('ET'), -50.0, -73.0, 2000, E(0, 'Rock and Ice', 11));
    expect(r.ficha).not.toBeNull();
  });
});

describe('cobertura del catálogo de cultivos', () => {
  /**
   * Las únicas fichas regionales sin cultivos, y por qué.
   *
   * Manglar, hielo, erg y roca desnuda no tienen respuesta honesta a "qué
   * planto acá", y la isla que es reserva tampoco: en Revillagigedo, Malpelo,
   * Desventuradas y Galápagos la respuesta correcta es no plantar. La arena
   * blanca amazónica (campinarana) y el campo rupestre son suelos que no
   * sostienen cultivo aunque llueva encima.
   *
   * Sin lista se cae al catálogo por clase Köppen, que avisa que es genérico.
   * Eso es lo que corresponde acá; inventar una lista sería peor.
   */
  const SIN_CULTIVOS = new Set([
    'alaska_tundra_hielo_beringia', 'alto_artico_desierto_polar',
    'montana_artica_baffin_torngat', 'tundra_artica_canadiense',
    'manglares_mexico', 'manglares_centroamericanos', 'manglares_antillanos',
    'manglares_pacifico_suramericano', 'manglares_atlantico_sur_brasil',
    'manglares_amazon_orinoco_caribe_sur', 'golfo_persico_mangle', 'mar_rojo_mangle',
    'nefud_rub_al_khali', 'sahara_occidental_erg', 'sahara_oriental', 'chotts_sebkhas',
    'revillagigedo_ecosistemas_insulares', 'isla_malpelo_xerica', 'islas_desventuradas',
    'galapagos_matorral_xerico', 'pantepui_guayana_alta',
    'campinaranas_aguas_negras', 'campos_rupestres',
  ]);

  it('toda ficha regional declara cultivos salvo las excluidas a propósito', () => {
    for (const f of Object.values(BIOMAS_REGIONALES)) {
      if (SIN_CULTIVOS.has(f.id)) continue;
      expect(f.cultivos?.length, f.id).toBeGreaterThan(0);
    }
  });

  it('las excluidas siguen sin lista, y no por olvido', () => {
    // Si una entra al catálogo de cultivos hay que sacarla de acá a mano: el
    // test obliga a decidirlo, no deja que pase de largo.
    for (const id of SIN_CULTIVOS) {
      expect(BIOMAS_REGIONALES[id], id).toBeDefined();
      expect(BIOMAS_REGIONALES[id]!.cultivos, id).toBeUndefined();
    }
  });

  it('ninguna especie del catálogo declara el grupo polar entero', () => {
    // 'E' o 'EF' sueltos harían que el bloque de un predio de hielo ofrezca
    // cultivos. Sólo 'ET' explícito es seguro.
    for (const e of ESPECIES) {
      expect(e.koppen, e.id).not.toContain('E');
      expect(e.koppen, e.id).not.toContain('EF');
    }
  });
});
