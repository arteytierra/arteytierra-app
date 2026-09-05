/**
 * Catálogo de especies y su cruce con el clima del predio.
 *
 * Lo que se fija acá no son los números agronómicos —esos son de rango
 * publicado y se discuten con el catálogo en la mano— sino el criterio: que la
 * especie que no sobrevive al frío se descarte por el frío y no por el agua,
 * que un cultivo tropical no aparezca como viable en un clima frío, y que la
 * lista nunca quede vacía cuando el clima alcanza para decir algo.
 */
import { describe, it, expect } from 'vitest';
import {
  ESPECIES, ESPECIES_POR_ID, ORDEN_ROL, LABEL_ROL,
  especiesDeKoppen, resolverEspecies, evaluarEspecie, bloqueEcorregion,
} from '@/lib/especies';
import type { MesDato } from '@/lib/clima';

const MESES_NOMBRE = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/** Doce meses sintéticos a partir de la media y la amplitud, hemisferio sur. */
function anio(media: number, amplitud: number, lluviaMes: number, etpMes = 100): MesDato[] {
  return MESES_NOMBRE.map((mes, i) => {
    // Enero es el verano austral: el pico va en i = 0.
    const t = media + amplitud * Math.cos((i / 12) * 2 * Math.PI);
    return {
      mes, tmean_c: Math.round(t * 10) / 10,
      tmin_c: Math.round((t - 7) * 10) / 10,
      tmax_c: Math.round((t + 8) * 10) / 10,
      precip_mm: lluviaMes, etp_mm: etpMes,
      balance_mm: lluviaMes - etpMes, viento_ms: 2,
    };
  });
}

const TROPICAL   = anio(26, 1.5, 200, 120);   // cálido y húmedo todo el año
const TEMPLADO   = anio(14, 9,   70,  85);    // helada suave en invierno
const FRIO       = anio(2,  12,  40,  50);    // inviernos duros, verano corto
const SEMIARIDO  = anio(17, 9,   25,  120);   // templado y seco

describe('catálogo de especies', () => {
  it('los ids son únicos y el índice los cubre a todos', () => {
    const ids = ESPECIES.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of ESPECIES) expect(ESPECIES_POR_ID[e.id]).toBe(e);
  });

  it('todo rol usado tiene etiqueta y lugar en el orden de lectura', () => {
    for (const e of ESPECIES) {
      expect(LABEL_ROL[e.rol], e.id).toBeTruthy();
      expect(ORDEN_ROL, e.id).toContain(e.rol);
    }
  });

  it('toda especie declara al menos una clase o grupo Köppen', () => {
    for (const e of ESPECIES) expect(e.koppen.length, e.id).toBeGreaterThan(0);
  });

  it('el grupo suelto vale para todas sus clases', () => {
    // El poroto trepador está declarado en ['A', 'B', 'C'], sin clases sueltas.
    const enAf  = especiesDeKoppen('Af').map(e => e.id);
    const enCfb = especiesDeKoppen('Cfb').map(e => e.id);
    expect(enAf).toContain('poroto_trepador');
    expect(enCfb).toContain('poroto_trepador');
    // Y el cacao, declarado sólo en Af/Am, no se cuela en el templado.
    expect(enCfb).not.toContain('cacao');
  });

  it('resolverEspecies saltea los ids que no existen en vez de romper', () => {
    expect(resolverEspecies(['cafe', 'no_existe', 'cacao']).map(e => e.id))
      .toEqual(['cafe', 'cacao']);
  });
});

describe('evaluarEspecie', () => {
  it('un perenne tropical no pasa un invierno frío, y lo dice por el frío', () => {
    const cacao = ESPECIES_POR_ID['cacao']!;
    const r = evaluarEspecie(cacao, FRIO);
    expect(r.viable).toBe(false);
    expect(r.razon).toContain('invierno');
  });

  it('el mismo perenne sí pasa en el trópico', () => {
    const r = evaluarEspecie(ESPECIES_POR_ID['cacao']!, TROPICAL);
    expect(r.viable).toBe(true);
  });

  it('el agua no decide: un perenne que sobrevive queda viable aunque falte riego', () => {
    // El olivo aguanta el semiárido; el déficit se informa, no descalifica.
    const r = evaluarEspecie(ESPECIES_POR_ID['olivo']!, SEMIARIDO);
    expect(r.viable).toBe(true);
    expect(r.riego_mm).toBeGreaterThan(0);
    expect(r.razon).toContain('riego');
  });

  it('un anual devuelve la ventana de siembra y la duración del ciclo', () => {
    const r = evaluarEspecie(ESPECIES_POR_ID['poroto_trepador']!, TEMPLADO);
    expect(r.viable).toBe(true);
    expect(r.siembra.length).toBeGreaterThan(0);
    expect(r.duracion_meses).toBeGreaterThan(0);
    expect(r.duracion_meses).toBeLessThanOrEqual(12);
  });

  it('cuando la ventana sin frío no alcanza, lo dice con los grados-día', () => {
    // La yuca pide 3400 GDD sobre base 13: en el templado no cierra.
    const r = evaluarEspecie(ESPECIES_POR_ID['yuca']!, TEMPLADO);
    expect(r.viable).toBe(false);
    expect(r.razon).toMatch(/grados-día|sobreviva/);
  });

  it('sin doce meses de datos no inventa un veredicto', () => {
    const r = evaluarEspecie(ESPECIES_POR_ID['cafe']!, TROPICAL.slice(0, 5));
    expect(r.viable).toBe(false);
    expect(r.razon).toContain('Faltan datos');
  });
});

describe('bloqueEcorregion', () => {
  it('sin lista de la ficha cae al catálogo por clima y lo avisa', () => {
    const b = bloqueEcorregion(TROPICAL, 'Af');
    expect(b).not.toBeNull();
    expect(b!.origen).toBe('koppen');
    expect(b!.aviso).toContain('curada');
    expect(b!.evaluadas.length).toBeGreaterThan(0);
  });

  it('con lista de la ficha la respeta y no avisa nada', () => {
    const b = bloqueEcorregion(TROPICAL, 'Af', ['cafe', 'platano_sombra', 'inga']);
    expect(b!.origen).toBe('ficha');
    expect(b!.aviso).toBeNull();
    expect(b!.evaluadas.map(e => e.especie.id).sort())
      .toEqual(['cafe', 'inga', 'platano_sombra']);
  });

  it('el cafetal queda ordenado como sistema: primero el principal, después la sombra', () => {
    const b = bloqueEcorregion(TROPICAL, 'Af', ['inga', 'platano_sombra', 'cafe'])!;
    const roles = b.porRol.map(g => g.rol);
    expect(roles.indexOf('principal')).toBeLessThan(roles.indexOf('sombra'));
    expect(b.porRol.find(g => g.rol === 'principal')!.especies[0]!.especie.id).toBe('cafe');
  });

  it('las viables van antes que las que no cierran, sin esconder a estas últimas', () => {
    // El cacao no pasa el frío; el trigo sí. Los dos se muestran.
    const b = bloqueEcorregion(FRIO, 'Dfb', ['cacao', 'centeno'])!;
    expect(b.evaluadas[0]!.viable).toBe(true);
    expect(b.evaluadas.map(e => e.especie.id)).toContain('cacao');
    expect(b.viables).toBe(1);
  });

  it('devuelve null cuando no hay ninguna especie para ese clima', () => {
    // EF (hielo permanente) no tiene cultivos declarados en el catálogo.
    expect(bloqueEcorregion(FRIO, 'EF')).toBeNull();
  });
});
