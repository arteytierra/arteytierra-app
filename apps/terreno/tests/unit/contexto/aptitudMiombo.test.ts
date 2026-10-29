import { describe, expect, it } from 'vitest';

import { BIOMAS_GLOBALES } from '../../../lib/biomasGlobales';
import { BIOMAS_REGIONALES_AFRICA } from '../../../lib/biomasRegionales';
import { componerAptitud } from '../../../lib/contexto';
import { ESPECIES_POR_ID } from '../../../lib/especies';
import { fichaDeEcorregion } from '../../../lib/ecorregiones';
import { prodForrajera, consumoEV_kgMS_dia, EM_FORRAJE } from '../../../lib/produccion';
import { bandaUso } from '../../../lib/modulacion';
import type { ModificadorAptitud } from '../../../lib/biomaTipos';

/**
 * El miombo húmedo es la primera ficha del África tropical y austral, y entró
 * corrigiendo el modificador que el encargo daba por acertado.
 *
 * El encargo de la fase 5 decía, con honestidad, que en este reino el bioma
 * global probablemente acierte, porque la sabana africana es el arquetipo del
 * que salió el `pasturas +20`. La entrega del lote 1 lo confirmó con confianza
 * baja. Lo que fijan estos tests es lo que salió de leer los primarios, que es
 * lo contrario:
 *
 * 1. **El miombo no es un pastizal: es un bosque.** Las fuentes de las dos
 *    ecorregiones dicen que la densidad de grandes herbívoros está limitada por
 *    una vegetación de bajo contenido de nutrientes, y que la tsetsé afecta al
 *    ganado doméstico. Las cargas publicadas para la formación la ponen en el
 *    piso de su bioma: 15 ha por unidad animal contra 6 a 8 de la sabana de
 *    Urochloa y 3 a 4 del pastizal aluvial. El +20 pasa a 0.
 * 2. **Al bioma le falta la huerta.** La sabana global no la nombra, y acá hay
 *    que nombrarla, porque el sistema agrícola de este bosque importa la
 *    fertilidad como ceniza en vez de encontrarla en el suelo.
 * 3. **Lo que la app calcula acá va para el lado peligroso.** `prodForrajera`
 *    crece con la lluvia y termina en 7.000 kg MS/ha para 900 mm o más; el
 *    miombo húmedo recibe 1.000 a 1.400 y cae en ese escalón, lo que da del
 *    orden de una hectárea por EV contra quince publicadas. El aviso tiene que
 *    seguir escrito en la ficha hasta que el motor lo sepa.
 */

const SABANA = 'resolve_sabana_tropical';
const MIOMBO = 'miombo_humedo_zambeziano';

const ficha = () => BIOMAS_REGIONALES_AFRICA[MIOMBO]!;

/** Lo que ve el usuario: la ficha compuesta con su bioma global. */
const efectiva = () =>
  componerAptitud(ficha().aptitud, BIOMAS_GLOBALES[SABANA]?.aptitud);

const buscar = (aptitud: ModificadorAptitud[], uso: ModificadorAptitud['uso']) =>
  aptitud.find((m) => m.uso === uso);

describe('la ficha del miombo húmedo', () => {
  it('las dos ecorregiones dejan de caer al bioma global y van a la misma ficha', () => {
    expect(fichaDeEcorregion(39)).toBe(MIOMBO);
    expect(fichaDeEcorregion(36)).toBe(MIOMBO);
  });

  it('es la única del bloque, y el bloque arranca en una', () => {
    expect(Object.keys(BIOMAS_REGIONALES_AFRICA)).toHaveLength(1);
  });

  it('no atribuye saberes, aunque la literatura pastoril del miombo sea enorme', () => {
    expect(ficha().saberes).toEqual([]);
  });

  it('las especies son flora nativa y nada más', () => {
    // La entrega traía siete entradas y la séptima era el búfalo africano
    // (Syncerus caffer), que es la especie emblema de la ecorregión 39. El
    // contrato de `especies` en biomaTipos.ts dice flora nativa: lo que crece
    // ahí sin que nadie lo plante. El búfalo pasó al campo de fauna.
    const esp = ficha().especies;
    expect(esp.some((e) => e.includes('Syncerus'))).toBe(false);
    expect(ficha().fauna).toMatch(/Syncerus caffer/);
    // Los ocho dominantes del dosel que nombran las dos fichas de One Earth.
    expect(esp).toHaveLength(8);
    for (const genero of ['Brachystegia', 'Julbernardia', 'Isoberlinia', 'Copaifera']) {
      expect(esp.some((e) => e.includes(genero)), genero).toBe(true);
    }
  });

  it('los ocho cultivos existen en el catálogo, y los que no están no se sustituyeron', () => {
    for (const id of ficha().cultivos ?? []) {
      expect(ESPECIES_POR_ID[id], id).toBeDefined();
    }
    expect(ficha().cultivos).toHaveLength(8);
    // Tres ids de la entrega venían del ejemplo del propio encargo y no existen:
    // `maiz` es `maiz_tropical`, `mandioca` es `yuca` y `mijo_perla` es `mijo`.
    expect(ficha().cultivos).toContain('maiz_tropical');
    expect(ficha().cultivos).toContain('yuca');
    // Y tres cultivos de la región no están en el catálogo, así que no entran:
    // el tabaco, que es el cultivo de renta que más miombo tala; el mijo africano
    // (Eleusine coracana), que es el cereal del chitemene y no es el mijo perla
    // que el catálogo tiene; y el poroto de hábito arbustivo.
    expect(ficha().cultivos).not.toContain('tabaco');
    expect(ficha().cultivos).not.toContain('mijo');
    expect(ficha().cultivos).not.toContain('poroto_trepador');
  });
});

describe('el modificador de pasturas, que era el que el encargo esperaba confirmar', () => {
  it('el bioma de sabana suma 20 y la ficha lo baja a 0', () => {
    expect(buscar(BIOMAS_GLOBALES[SABANA]!.aptitud!, 'pasturas')!.delta).toBe(20);
    expect(buscar(ficha().aptitud!, 'pasturas')!.delta).toBe(0);
    expect(buscar(efectiva(), 'pasturas')!.delta).toBe(0);
  });

  it('no baja a negativo, porque el pastoreo existe y está en los parches', () => {
    const past = buscar(ficha().aptitud!, 'pasturas')!;
    expect(past.delta).toBeGreaterThanOrEqual(0);
    expect(past.razon).toMatch(/dambo/);
    expect(past.razon).toMatch(/parches/);
  });

  it('la razón trae las tres cargas publicadas y no sólo la del miombo', () => {
    // La entrega citó los 15 ha/UA como respaldo del +20. Son el peor número de
    // la tabla: lo que los vuelve información es el contraste con las otras dos
    // formaciones de la misma fuente.
    const razon = buscar(ficha().aptitud!, 'pasturas')!.razon;
    expect(razon).toMatch(/15 hectáreas por unidad animal/);
    expect(razon).toMatch(/6 a 8/);
    expect(razon).toMatch(/3 a 4/);
  });

  it('la razón nombra la tsetsé y el bajo contenido de nutrientes', () => {
    const razon = buscar(ficha().aptitud!, 'pasturas')!.razon;
    expect(razon).toMatch(/tsets/);
    expect(razon).toMatch(/tripanosomiasis/);
    expect(razon).toMatch(/nutrientes/);
  });

  it('y manda a mirar la lluvia del punto, porque el borde sur no se dio vuelta', () => {
    // La regla corregida de la fase 4: un gradiente que la app mide no es excusa
    // para abstenerse, es una instrucción. Acá la variable es la lluvia anual y
    // la app la tiene.
    const razon = buscar(ficha().aptitud!, 'pasturas')!.razon;
    expect(razon).toMatch(/800 mm/);
    expect(razon).toMatch(/lluvia del punto/);
  });

  it('el forestal del bioma se hereda intacto: la ficha pisa sólo lo que nombra', () => {
    const forestal = buscar(efectiva(), 'forestal');
    expect(forestal?.delta).toBe(-10);
    expect(forestal?.razon).toBe(
      buscar(BIOMAS_GLOBALES[SABANA]!.aptitud!, 'forestal')!.razon,
    );
    expect(ficha().aptitud!.map((m) => m.uso)).toEqual(['pasturas', 'huerta']);
  });
});

describe('el modificador de huerta, que el bioma de sabana no tiene', () => {
  it('la sabana global no nombra la huerta y la ficha la agrega en negativo', () => {
    expect(buscar(BIOMAS_GLOBALES[SABANA]!.aptitud!, 'huerta')).toBeUndefined();
    expect(buscar(ficha().aptitud!, 'huerta')!.delta).toBe(-20);
    expect(buscar(efectiva(), 'huerta')!.delta).toBe(-20);
  });

  it('la razón es el chitemene, no «suelo pobre»', () => {
    const razon = buscar(ficha().aptitud!, 'huerta')!.razon;
    expect(razon).toMatch(/chitemene/);
    expect(razon).toMatch(/ceniza/);
    expect(razon).toMatch(/importa/);
  });

  it('y trae los números del suelo y dónde está lo fértil', () => {
    const razon = buscar(ficha().aptitud!, 'huerta')!.razon;
    expect(razon).toMatch(/80 a 150 ppm/);
    expect(razon).toMatch(/1\.500 a 3\.000/);
    expect(razon).toMatch(/termita/);
  });
});

describe('el aviso sobre el forraje que calcula la propia app', () => {
  it('la escalera de forraje pone al miombo húmedo en su escalón más alto', () => {
    // 1.000 a 1.400 mm según la fuente: todo el rango cae en el tope.
    expect(prodForrajera(1000)).toBe(7000);
    expect(prodForrajera(1200)).toBe(7000);
    expect(prodForrajera(1400)).toBe(7000);
    expect(bandaUso(1100).id).toBe('humedo');
    expect(bandaUso(1100).inicial).toBe(0.5);
  });

  it('y eso da del orden de una hectárea por EV, contra quince publicadas', () => {
    const ofertaUtil = prodForrajera(1100) * bandaUso(1100).inicial;
    const haPorEV = (em: number) => (consumoEV_kgMS_dia(em) * 365) / ofertaUtil;
    // Con pastizal natural y con forraje grosero, los dos extremos del rango que
    // la app muestra.
    expect(haPorEV(EM_FORRAJE.natural)).toBeGreaterThan(1);
    expect(haPorEV(EM_FORRAJE.natural)).toBeLessThan(1.1);
    expect(haPorEV(EM_FORRAJE.grosero)).toBeLessThan(1.3);
    // La cifra publicada para la formación es 15, o sea más de diez veces.
    expect(15 / haPorEV(EM_FORRAJE.grosero)).toBeGreaterThan(10);
  });

  it('el aviso está escrito en el campo que llega al panel y al informe', () => {
    const suelos = ficha().suelos;
    expect(suelos).toMatch(/7\.000 kg/);
    expect(suelos).toMatch(/quince hectáreas por unidad animal/);
    expect(suelos).toMatch(/800 a 900 mm/);
    expect(suelos).toMatch(/desconfiar/);
  });

  it('el motor sigue sin tocarse, y es deliberado', () => {
    // Si alguien cambia la escalera, este test cae y hay que venir a decidir
    // qué pasa con el aviso de la ficha. Es el mismo trato que el vertisol del
    // Decán: una tabla global no se reemplaza desde una formación.
    expect(prodForrajera(901)).toBe(7000);
    expect(prodForrajera(2500)).toBe(7000);
  });
});

describe('lo que la ficha declara que no tiene', () => {
  it('no da porcentajes de HWSD ni de SoilGrids, porque no se extrajeron', () => {
    const suelos = ficha().suelos;
    expect(suelos).toMatch(/no se extrajo/);
    expect(suelos).toMatch(/1:3\.000\.000/);
    expect(suelos).not.toMatch(/\d+ % de HWSD/);
  });

  it('ninguna fuente apunta a un host de pruebas', () => {
    // La entrega citó la página angoleña de One Earth en stage.oneearth.org,
    // que devuelve el mismo contenido que producción pero no es una URL
    // citable.
    for (const f of ficha().fuentes) {
      expect(f.url, f.label).not.toMatch(/stage\./);
      expect(f.url, f.label).toMatch(/^https:\/\//);
    }
  });

  it('las dos fuentes de otra ecorregión están, y su alcance está escrito al lado', () => {
    // Gorongosa está en Mozambique y Nyimba es miombo seco: las dos se citan por
    // la formación y no por esta ecorregión, y el comentario del código lo dice.
    const urls = ficha().fuentes.map((f) => f.url).join(' ');
    expect(urls).toMatch(/gorongosa\.org/);
    expect(urls).toMatch(/pmc\.ncbi\.nlm\.nih\.gov/);
  });
});
