import { describe, it, expect } from 'vitest';
import {
  BIOMAS_RESOLVE, ECO_ID_A_FICHA, biomaGlobal, fichaDeEcorregion, enSudamerica,
  type Ecorregion,
} from '@/lib/ecorregiones';
import { resolverBioma, determinarBioma, fichaPorId, BIOMAS } from '@/lib/contexto';
import { BIOMAS_REGIONALES } from '@/lib/biomasRegionales';
import { BIOMAS_GLOBALES } from '@/lib/biomasGlobales';
import type { Koppen } from '@/lib/clima';

const k = (codigo: string, descripcion = 'clima'): Koppen => ({ codigo, descripcion } as Koppen);

/** Ecorregión de prueba, con los valores que devuelve RESOLVE. */
const E = (eco_id: number, eco_name: string, bioma_num: number, bioma_name = 'x'): Ecorregion =>
  ({ eco_id, eco_name, bioma_num, bioma_name });

describe('tabla de biomas RESOLVE', () => {
  it('cubre los 14 biomas más roca y hielo', () => {
    for (let n = 1; n <= 14; n++) expect(biomaGlobal(n), `bioma ${n}`).not.toBeNull();
    expect(biomaGlobal(98)).not.toBeNull();
    expect(biomaGlobal(0)).toBeNull();
  });

  it('cada bioma global tiene su ficha escrita', () => {
    for (const [num, b] of Object.entries(BIOMAS_RESOLVE)) {
      expect(fichaPorId(b.id), `bioma ${num} → ${b.id}`).not.toBeNull();
    }
  });

  it('no repite ids de bioma global', () => {
    const ids = Object.values(BIOMAS_RESOLVE).map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('catálogos de fichas', () => {
  it('la clave de cada ficha coincide con su id', () => {
    for (const [clave, f] of Object.entries({ ...BIOMAS, ...BIOMAS_REGIONALES, ...BIOMAS_GLOBALES })) {
      expect(f.id, clave).toBe(clave);
    }
  });

  it('ningún id se repite entre los tres catálogos', () => {
    const ids = [
      ...Object.keys(BIOMAS),
      ...Object.keys(BIOMAS_REGIONALES),
      ...Object.keys(BIOMAS_GLOBALES),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toda ficha tiene texto y al menos una fuente', () => {
    for (const f of Object.values({ ...BIOMAS, ...BIOMAS_REGIONALES, ...BIOMAS_GLOBALES })) {
      expect(f.nombre.length, f.id).toBeGreaterThan(3);
      expect(f.resumen.length, f.id).toBeGreaterThan(40);
      expect(f.vegetacion.length, f.id).toBeGreaterThan(20);
      expect(f.fauna.length, f.id).toBeGreaterThan(20);
      expect(f.suelos.length, f.id).toBeGreaterThan(20);
      expect(f.color, f.id).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(f.fuentes.length, f.id).toBeGreaterThan(0);
      for (const fuente of f.fuentes) expect(fuente.url, f.id).toMatch(/^https:\/\//);
    }
  });

  it('las 22 fichas regionales traen saberes y especies', () => {
    expect(Object.keys(BIOMAS_REGIONALES)).toHaveLength(22);
    for (const f of Object.values(BIOMAS_REGIONALES)) {
      expect(f.saberes.length, f.id).toBeGreaterThan(0);
      expect(f.especies.length, f.id).toBeGreaterThan(0);
    }
  });

  it('las fichas globales no atribuyen saberes ni especies a nadie', () => {
    // A escala de bioma, una lista de especies o de prácticas sólo sería cierta
    // en una región. Dejarlas vacías es la garantía de que no inventamos.
    for (const f of Object.values(BIOMAS_GLOBALES)) {
      expect(f.saberes, f.id).toEqual([]);
      expect(f.especies, f.id).toEqual([]);
    }
  });

  it('no quedan saberes cubanos en fichas que sólo se activan en Puerto Rico', () => {
    const caribe = [BIOMAS_REGIONALES.bosque_humedo_tropical_caribeno!, BIOMAS_REGIONALES.matorral_seco_caribeno!];
    for (const f of caribe) {
      for (const s of f.saberes) expect(s.cultura, f.id).not.toMatch(/cuba/i);
    }
  });
});

describe('lista blanca de ecorregiones', () => {
  it('las 30 ecorregiones curadas apuntan a una ficha que existe', () => {
    expect(Object.keys(ECO_ID_A_FICHA)).toHaveLength(30);
    for (const [eco, id] of Object.entries(ECO_ID_A_FICHA)) {
      expect(fichaPorId(id), `ECO_ID ${eco} → ${id}`).not.toBeNull();
    }
  });

  it('ninguna ecorregión de afuera apunta a una ficha sudamericana', () => {
    for (const ficha of Object.values(ECO_ID_A_FICHA)) {
      expect(Object.keys(BIOMAS), ficha).not.toContain(ficha);
    }
  });

  it('devuelve null para una ecorregión sin curar', () => {
    expect(fichaDeEcorregion(334)).toBeNull();  // Eastern forest-boreal transition
    expect(fichaDeEcorregion(495)).toBe('bosque_humedo_tropical_caribeno');
  });
});

describe('caja de Sudamérica', () => {
  it('reconoce puntos de adentro', () => {
    expect(enSudamerica(-37.3, -59.1)).toBe(true);   // Tandil
    expect(enSudamerica(-16.5, -68.1)).toBe(true);   // La Paz
    expect(enSudamerica(4.7, -74.1)).toBe(true);     // Bogotá
  });

  it('deja afuera Norteamérica, Europa y el Caribe', () => {
    expect(enSudamerica(38.3, -96.6)).toBe(false);   // Flint Hills
    expect(enSudamerica(39.5, -6.0)).toBe(false);    // Extremadura
    expect(enSudamerica(18.3, -66.7)).toBe(false);   // Utuado, Puerto Rico
    expect(enSudamerica(17.1, -96.7)).toBe(false);   // Oaxaca
  });
});

describe('resolverBioma — tres niveles', () => {
  it('en Sudamérica la ecorregión no le saca la ficha a la Pampa', () => {
    // 576 todavía no está curado; adentro de Sudamérica manda Köppen igual y la
    // ecorregión sólo agrega el nombre exacto. Esto es lo que evita la regresión.
    const r = resolverBioma(k('Cfa'), -34.5, -59.0, 120, E(576, 'Humid Pampas', 8));
    expect(r.fuente).toBe('koppen');
    expect(r.ficha?.id).toBe('pampa');
    expect(r.ecorregion?.eco_name).toBe('Humid Pampas');
    expect(r.aviso).toBeNull();
  });

  it('Puerto Rico da la ficha caribeña, no una sudamericana', () => {
    const r = resolverBioma(k('Af'), 18.27, -66.72, 400, E(495, 'Puerto Rican moist forests', 1));
    expect(r.fuente).toBe('ecorregion');
    expect(r.ficha?.id).toBe('bosque_humedo_tropical_caribeno');
    expect(r.aviso).toBeNull();
  });

  it('Kansas da la pradera de pastos altos, nunca el Espinal', () => {
    const r = resolverBioma(k('Cfa'), 38.3, -96.6, 400, E(392, 'Flint Hills tallgrass prairie', 8));
    expect(r.fuente).toBe('ecorregion');
    expect(r.ficha?.id).toBe('pradera_pastos_altos');
  });

  it('Extremadura da el mediterráneo europeo, no el chileno', () => {
    const r = resolverBioma(k('Csa'), 39.5, -6.0, 400, E(793, 'Iberian sclerophyllous and semi-deciduous forests', 12));
    expect(r.ficha?.id).toBe('mediterraneo_europeo');
    expect(r.ficha?.id).not.toBe('mediterraneo');
  });

  it('Oaxaca da el bosque mesófilo de montaña', () => {
    const r = resolverBioma(k('Cwb'), 17.1, -96.7, 1800, E(487, 'Oaxacan montane forests', 1));
    expect(r.ficha?.id).toBe('bosque_mesofilo_montana');
  });

  it('una ecorregión sin curar cae a la ficha de bioma global, con aviso', () => {
    const r = resolverBioma(k('Dfb'), 44.0, -79.0, 200, E(334, 'Eastern forest-boreal transition', 4));
    expect(r.fuente).toBe('bioma_global');
    expect(r.ficha?.id).toBe('resolve_bosque_templado_caducifolio_mixto');
    expect(r.ficha?.saberes).toEqual([]);
    expect(r.aviso).toContain('Eastern forest-boreal transition');
    expect(r.ecorregion?.eco_id).toBe(334);
  });

  it('sin ecorregión, en Sudamérica sigue funcionando el Köppen de siempre', () => {
    const r = resolverBioma(k('Cfa'), -34.5, -59.0, 120, null);
    expect(r.fuente).toBe('koppen');
    expect(r.ficha?.id).toBe(determinarBioma(k('Cfa'), -34.5, -59.0, 120));
    expect(r.aviso).toBeNull();
  });

  it('sin ecorregión y fuera de Sudamérica no inventa ficha', () => {
    const r = resolverBioma(k('Cfa'), 38.3, -96.6, 400, null);
    expect(r.ficha).toBeNull();
    expect(r.aviso).toContain('Sudamérica');
  });

  it('el bug histórico está cerrado: Ohio ya no es Espinal', () => {
    // determinarBioma sigue devolviendo espinal — es una heurística sudamericana.
    expect(determinarBioma(k('Cfa'), 40.0, -83.0)).toBe('espinal');
    // Pero resolverBioma nunca la deja salir afuera.
    expect(resolverBioma(k('Cfa'), 40.0, -83.0, 250, null).ficha).toBeNull();
    const conEco = resolverBioma(k('Cfa'), 40.0, -83.0, 250, E(329, 'Appalachian mixed mesophytic forests', 4));
    expect(conEco.ficha?.id).toBe('bosque_templado_caducifolio_este');
  });
});

describe('fichaPorId', () => {
  it('busca en los tres catálogos', () => {
    expect(fichaPorId('pampa')?.nombre).toBeTruthy();                  // sudamericana
    expect(fichaPorId('pradera_pastos_altos')?.nombre).toBeTruthy();   // regional
    expect(fichaPorId('resolve_tundra')?.nombre).toBeTruthy();         // global
    expect(fichaPorId('no_existe')).toBeNull();
  });
});
