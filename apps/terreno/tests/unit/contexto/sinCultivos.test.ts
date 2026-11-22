/**
 * La compuerta de la ausencia declarada.
 *
 * El defecto que cierra: `cultivos` es opcional y la ausencia no se distinguía
 * de la falta de datos. Veintinueve fichas regionales no la traen, y hasta el
 * 22/11/2026 las veintinueve recibían el mismo trato: el bloque «en esta
 * ecorregión» les ofrecía el catálogo por clase Köppen avisando que «todavía»
 * faltaba curar, y el balance hídrico del calendario les ofrecía los diez
 * cultivos genéricos del Cono Sur sin ningún cartel. En un manglar, en el Rub
 * al-Jali o en el desierto polar de Ellesmere eso es el número plausible y
 * equivocado del que habla `lib/README.md`.
 *
 * Lo que estos tests protegen no es un número: es que **no se pueda volver a
 * agregar una ficha sin lista de cultivos sin decir por qué no la tiene.** Si
 * un lote nuevo entra sin declarar el motivo, el primer test de acá falla y
 * nombra la ficha.
 */
import { describe, it, expect } from 'vitest';
import { BIOMAS_REGIONALES } from '@/lib/biomasRegionales';
import { BIOMAS_GLOBALES } from '@/lib/biomasGlobales';
import { SIN_CULTIVOS } from '@/lib/sinCultivos';
import { fichaPorId } from '@/lib/contexto';
import { bloqueEcorregion } from '@/lib/especies';
import { cultivosDeFicha, CULTIVOS_KC } from '@/lib/calendario';
import { MESES, type MesDato } from '@/lib/clima';

/** Ids de las fichas regionales que no declaran cultivos. */
const sinLista = Object.entries(BIOMAS_REGIONALES)
  .filter(([, f]) => !f.cultivos?.length)
  .map(([id]) => id);

describe('toda ficha sin cultivos declara por qué', () => {
  it('la compuerta: ninguna ficha regional se queda sin motivo', () => {
    const faltan = sinLista.filter(id => !SIN_CULTIVOS[id]);
    // El mensaje importa tanto como el assert: si falla, el que agregó la ficha
    // tiene que leer qué le piden y no adivinarlo.
    expect(faltan, `Estas fichas no declaran cultivos y tampoco por qué. Agregalas a lib/sinCultivos.ts con motivo, detalle y, si el motivo es otro_uso, el uso documentado: ${faltan.join(', ')}`)
      .toEqual([]);
  });

  it('y ninguna entrada contradice a su ficha', () => {
    for (const [id, dec] of Object.entries(SIN_CULTIVOS)) {
      const ficha = BIOMAS_REGIONALES[id];
      expect(ficha, `${id} no existe en el catálogo regional`).toBeDefined();
      // Declarar el motivo de una ausencia que no existe es peor que no
      // declararlo: el programa diría que acá no se cultiva mostrando la lista.
      expect(ficha!.cultivos?.length ?? 0,
        `${id} declara ${dec.motivo} y además trae lista de cultivos`).toBe(0);
    }
  });

  it('el detalle nunca es un motivo suelto', () => {
    for (const [id, dec] of Object.entries(SIN_CULTIVOS)) {
      // Un motivo sin explicación vuelve a ser una ausencia sin explicar, sólo
      // que tipada. El umbral es bajo a propósito: no mide calidad, detecta el
      // campo puesto para pasar el test.
      expect(dec.detalle.length, `${id} tiene un detalle demasiado corto`)
        .toBeGreaterThan(80);
      expect(dec.detalle.trim().endsWith('.'), `${id}: el detalle se imprime, cerralo`).toBe(true);
    }
  });

  it('otro_uso nombra el uso y los otros dos no inventan uno', () => {
    for (const [id, dec] of Object.entries(SIN_CULTIVOS)) {
      if (dec.motivo === 'otro_uso') {
        expect(dec.uso, `${id} declara otro_uso y no dice cuál`).toBeTruthy();
      } else {
        expect(dec.uso, `${id} no es otro_uso y trae un uso`).toBeNull();
      }
    }
  });

  /**
   * El inventario. `sin_curar` es el único motivo que el tiempo arregla, así
   * que esta cuenta tiene que bajar y nunca subir: curar una ficha la baja sin
   * romper nada, y agregar una ecorregión nueva sin lista la sube y rompe.
   */
  it('las que sólo esperan la lista son tres y están nombradas', () => {
    const porCurar = Object.entries(SIN_CULTIVOS)
      .filter(([, d]) => d.motivo === 'sin_curar')
      .map(([id]) => id)
      .sort();
    expect(porCurar).toEqual(
      ['decan_norte_sal', 'decan_sur_elefantes', 'galapagos_matorral_xerico'],
    );
    expect(porCurar.length).toBeLessThanOrEqual(3);
  });

  it('y las demás no son un cajón de sastre: cada motivo tiene su caso', () => {
    const cuenta = Object.values(SIN_CULTIVOS).reduce<Record<string, number>>(
      (a, d) => { a[d.motivo] = (a[d.motivo] ?? 0) + 1; return a; }, {});
    expect(cuenta['no_corresponde']).toBeGreaterThanOrEqual(20);
    expect(cuenta['otro_uso']).toBe(2);          // Pilbara y mulga
    expect(Object.keys(cuenta).sort()).toEqual(['no_corresponde', 'otro_uso', 'sin_curar']);
  });

  /**
   * Los biomas globales quedan afuera de la compuerta y es a propósito. Son las
   * 14 clases de RESOLVE, y a esa escala no hay lista de cultivos que sea cierta
   * para el bioma entero: el aviso de «esto sale del catálogo climático, que es
   * más grueso» es ahí literalmente correcto. Exigirles un motivo declarado
   * sería pedir que afirmen algo sobre millones de kilómetros cuadrados.
   */
  it('los biomas globales no entran a la compuerta, y ninguno está declarado', () => {
    for (const id of Object.keys(BIOMAS_GLOBALES)) {
      expect(SIN_CULTIVOS[id], `${id} es un bioma global y no debería declarar motivo`)
        .toBeUndefined();
    }
  });
});

describe('la razón llega hasta donde se imprime', () => {
  it('fichaPorId la inyecta, porque los catálogos son generados', () => {
    const f = fichaPorId('manglares_mexico')!;
    expect(f.sinCultivos?.motivo).toBe('no_corresponde');
    expect(f.sinCultivos?.detalle).toMatch(/intermareal/);
    // Y no la inyecta donde la ficha sí trae lista.
    expect(fichaPorId('pinar_toba')!.sinCultivos).toBeUndefined();
  });

  const meses: MesDato[] = Array.from({ length: 12 }, (_, i) => ({
    mes: MESES[i] ?? '', viento_ms: 2,
    tmean_c: 26, tmin_c: 22, tmax_c: 31, precip_mm: 120, etp_mm: 130, balance_mm: -10,
  }));

  it('el bloque de ecorregión deja de decir "todavía" donde no es cuestión de tiempo', () => {
    const f = fichaPorId('manglares_mexico')!;
    const b = bloqueEcorregion(meses, 'Aw', f.cultivos, f.sinCultivos)!;
    expect(b.origen).toBe('koppen_no_corresponde');
    expect(b.aviso).toMatch(/el uso agrícola no es la pregunta/);
    expect(b.aviso).toMatch(/intermareal/);
    expect(b.aviso).not.toMatch(/todavía/);
    // Y sigue ofreciendo la lista climática: el borde del polígono no es el
    // borde del sistema productivo, y el predio puede estar en el albardón.
    expect(b.evaluadas.length).toBeGreaterThan(0);
  });

  it('en el Pilbara nombra el pastoreo en vez de hablar de cultivos', () => {
    const f = fichaPorId('pilbara_matorral')!;
    const b = bloqueEcorregion(meses, 'BWh', f.cultivos, f.sinCultivos)!;
    expect(b.origen).toBe('koppen_otro_uso');
    expect(b.aviso).toMatch(/pastoril extensivo/);
    expect(b.aviso).toMatch(/44 estaciones ganaderas/);
  });

  it('el balance hídrico avisa que esos diez cultivos no son de acá', () => {
    const f = fichaPorId('nefud_rub_al_khali')!;
    const r = cultivosDeFicha(f.cultivos, f.sinCultivos);
    expect(r.lista).toBe(CULTIVOS_KC);
    expect(r.origen).toBe('generica');
    expect(r.aviso).toMatch(/no son los de tu ecorregión/);
    expect(r.aviso).toMatch(/arena móvil/);
  });

  it('y donde la ficha sí tiene lista no aparece ningún cartel', () => {
    const f = fichaPorId('pinar_toba')!;
    const r = cultivosDeFicha(f.cultivos, f.sinCultivos);
    expect(r.origen).toBe('ficha');
    expect(r.aviso).toBeNull();
    expect(r.lista.some(c => c.id === 'soja')).toBe(false);
  });

  /**
   * El caso del desierto líbico, que es el que mejor muestra por qué la lista
   * genérica no se saca. Los oasis de Siwa, Bahariya, Farafra, Dajla y Jarga
   * son agricultura milenaria adentro del mismo polígono, y son puntos: el
   * detalle los nombra en vez de callarlos.
   */
  it('la excepción documentada va en el detalle y no se borra', () => {
    expect(SIN_CULTIVOS['sahara_oriental']!.detalle).toMatch(/Siwa/);
    expect(SIN_CULTIVOS['alaska_tundra_hielo_beringia']!.detalle).toMatch(/Aleutianas/);
  });
});
