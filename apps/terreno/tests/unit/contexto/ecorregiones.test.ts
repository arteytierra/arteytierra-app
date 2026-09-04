import { describe, it, expect } from 'vitest';
import {
  BIOMAS_RESOLVE, ECO_ID_A_FICHA, ECO_ID_SUDAMERICA, ECO_ID_RESTO_DEL_MUNDO,
  biomaGlobal, fichaDeEcorregion, enSudamerica,
  type Ecorregion,
} from '@/lib/ecorregiones';
import { resolverBioma, determinarBioma, fichaPorId, BIOMAS } from '@/lib/contexto';
import { BIOMAS_REGIONALES, BIOMAS_REGIONALES_CURADAS } from '@/lib/biomasRegionales';
import { BIOMAS_REGIONALES_AMERICA } from '@/lib/biomasRegionalesAmerica';
import { BIOMAS_REGIONALES_EUROPA } from '@/lib/biomasRegionalesEuropa';
import { BIOMAS_REGIONALES_SUDAMERICA } from '@/lib/biomasRegionalesSudamerica';
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

  it('toda ficha regional trae especies', () => {
    // 22 escritas a mano + 53 americanas + 8 europeas + 47 sudamericanas.
    expect(Object.keys(BIOMAS_REGIONALES)).toHaveLength(130);
    for (const f of Object.values(BIOMAS_REGIONALES)) {
      expect(f.especies.length, f.id).toBeGreaterThan(0);
    }
  });

  it('las escritas a mano traen saberes y las generadas los dejan vacíos', () => {
    // No es una omisión: los saberes de estas regiones son subnacionales y
    // necesitan geometría con procedencia y licencia. Atribuirlos a una
    // ecorregión entera sería inventar quién practica qué y dónde.
    for (const f of Object.values(BIOMAS_REGIONALES_CURADAS)) {
      expect(f.saberes.length, f.id).toBeGreaterThan(0);
    }
    for (const f of Object.values({ ...BIOMAS_REGIONALES_AMERICA, ...BIOMAS_REGIONALES_EUROPA, ...BIOMAS_REGIONALES_SUDAMERICA })) {
      expect(f.saberes, f.id).toEqual([]);
    }
  });

  it('los cuatro bloques de fichas regionales son disjuntos', () => {
    // Se unen con spread: un id repetido ganaría en silencio y dejaría la otra
    // ficha muerta sin que falle nada.
    const bloques = [BIOMAS_REGIONALES_CURADAS, BIOMAS_REGIONALES_AMERICA, BIOMAS_REGIONALES_EUROPA, BIOMAS_REGIONALES_SUDAMERICA];
    const ids = bloques.flatMap(b => Object.keys(b));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(Object.keys(BIOMAS_REGIONALES).length);
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
  it('toda ecorregión curada apunta a una ficha que existe', () => {
    // 109 sudamericanas + 187 del resto del mundo, de las 846 de RESOLVE.
    expect(Object.keys(ECO_ID_SUDAMERICA)).toHaveLength(109);
    expect(Object.keys(ECO_ID_RESTO_DEL_MUNDO)).toHaveLength(187);
    for (const [eco, id] of Object.entries(ECO_ID_A_FICHA)) {
      expect(fichaPorId(id), `ECO_ID ${eco} → ${id}`).not.toBeNull();
    }
  });

  it('las dos mitades no se pisan: ningún ECO_ID está en las dos', () => {
    const sa = Object.keys(ECO_ID_SUDAMERICA);
    const resto = Object.keys(ECO_ID_RESTO_DEL_MUNDO);
    expect(sa.filter(id => resto.includes(id))).toEqual([]);
    expect(sa.length + resto.length).toBe(Object.keys(ECO_ID_A_FICHA).length);
  });

  it('ninguna ecorregión de afuera apunta a una ficha sudamericana', () => {
    // El bug original: un predio en Ohio salía "Espinal".
    for (const ficha of Object.values(ECO_ID_RESTO_DEL_MUNDO)) {
      expect(Object.keys(BIOMAS), ficha).not.toContain(ficha);
    }
  });

  it('las sudamericanas apuntan a una ficha sudamericana, de contexto o del bloque regional', () => {
    // Desde el montaje de Sudamérica hay dos dueños posibles: las 12 fichas de
    // contexto.ts y las 47 regionales. Lo que no puede pasar es que una
    // ecorregión sudamericana termine en una ficha de otro continente.
    const propias = [...Object.keys(BIOMAS), ...Object.keys(BIOMAS_REGIONALES_SUDAMERICA)];
    for (const ficha of Object.values(ECO_ID_SUDAMERICA)) {
      expect(propias, ficha).toContain(ficha);
    }
  });

  it('devuelve null para una ecorregión sin curar', () => {
    expect(fichaDeEcorregion(653)).toBeNull();  // europea, deliberadamente afuera de la lista blanca
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
  it('la Pampa sale de la ecorregión, no de la heurística', () => {
    const r = resolverBioma(k('Cfa'), -34.5, -59.0, 120, E(576, 'Humid Pampas', 8));
    expect(r.fuente).toBe('ecorregion');
    expect(r.ficha?.id).toBe('pampa');
    expect(r.ecorregion?.eco_name).toBe('Humid Pampas');
    expect(r.aviso).toBeNull();
  });

  it('Sechura ya no es Chaco seco', () => {
    // El bug de la heurística: árido cálido al norte del paralelo 27 → chaco.
    // Sechura es desierto costero del Pacífico, con niebla y sin lluvia.
    expect(determinarBioma(k('BWh'), -5.9, -80.7)).toBe('chaco_seco');
    const r = resolverBioma(k('BWh'), -5.9, -80.7, 50, E(608, 'Sechura desert', 13));
    expect(r.fuente).toBe('ecorregion');
    expect(r.ficha?.id).toBe('desierto_costero');
  });

  it('el páramo no se hace pasar por Puna', () => {
    // Los dos pasan los 2800 m y ahí termina el parecido: el páramo recibe
    // 1000-2000 mm al año y la puna menos de 400. Con el montaje de Sudamérica
    // el páramo tiene ficha propia y la heurística lo separa por latitud.
    expect(determinarBioma(k('Cfb'), 4.8, -75.5, 3400)).toBe('paramos_andinos');
    expect(determinarBioma(k('Cfb'), -22.0, -66.5, 3900)).toBe('puna_altoandino');
    const r = resolverBioma(k('Cfb'), 4.8, -75.5, 3400, E(590, 'Cordillera Central páramo', 10));
    expect(r.fuente).toBe('ecorregion');
    expect(r.ficha?.id).toBe('paramos_andinos');
    expect(r.aviso).toBeNull();
  });

  it('la Caatinga tiene ficha propia y ya no cae al bioma global', () => {
    // Era el ejemplo de vacío deliberado: ninguna de las 12 fichas argentinas
    // la describe. El montaje de Sudamérica le dio dueña.
    const r = resolverBioma(k('BSh'), -8.5, -39.5, 500, E(525, 'Caatinga', 2));
    expect(r.fuente).toBe('ecorregion');
    expect(r.ficha?.id).toBe('caatinga');
    expect(r.ficha?.saberes).toEqual([]);
  });

  it('la Amazonía y las Yungas conservan su ficha', () => {
    expect(resolverBioma(k('Af'), -3.1, -60.0, 40, E(484, 'Negro-Branco moist forests', 1)).ficha?.id)
      .toBe('guayanas_bosques_tierras_bajas');
    expect(resolverBioma(k('Af'), -3.5, -55.0, 60, E(507, 'Tapajós-Xingu moist forests', 1)).ficha?.id)
      .toBe('amazonia_oriental_tierra_firme');
    expect(resolverBioma(k('Cwa'), -23.5, -64.8, 1200, E(504, 'Southern Andean Yungas', 1)).ficha?.id)
      .toBe('yungas');
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
    // 653 no está en la lista blanca: el ECO_ID es real, el nombre es de prueba.
    const r = resolverBioma(k('Dfb'), 50.0, 20.0, 200, E(653, 'ecorregión sin curar', 4));
    expect(r.fuente).toBe('bioma_global');
    expect(r.ficha?.id).toBe('resolve_bosque_templado_caducifolio_mixto');
    expect(r.ficha?.saberes).toEqual([]);
    expect(r.aviso).toContain('ecorregión sin curar');
    expect(r.ecorregion?.eco_id).toBe(653);
  });

  it('el este boreal canadiense ya tiene ficha propia', () => {
    // Era el ejemplo de "sin curar" hasta el montaje del paquete de Norteamérica.
    const r = resolverBioma(k('Dfb'), 44.0, -79.0, 200, E(334, 'Eastern forest-boreal transition', 4));
    expect(r.fuente).toBe('ecorregion');
    expect(r.ficha?.id).toBe('noreste_grandes_lagos_bosques');
  });

  it('las tres fichas que no se activaban donde están escritas ahora se activan', () => {
    // Lanzarote y Fuerteventura son 796, no 787, y macaronesia es la ficha que
    // lleva el enarenado, el jable y las gavias.
    expect(fichaDeEcorregion(796)).toBe('macaronesia');
    // El Alentejo, el Algarve, Doñana y Los Alcornocales son 805, no 793, y
    // mediterraneo_europeo es la que lleva la dehesa y el montado.
    expect(fichaDeEcorregion(805)).toBe('mediterraneo_europeo');
    // Los Pirineos son 676, no 689, y la ficha alpina los nombra en su texto.
    expect(fichaDeEcorregion(676)).toBe('alpino_montano_europeo');
  });

  it('la llanura atlántica europea deja de caer al bioma global', () => {
    const r = resolverBioma(k('Cfb'), 48.1, -1.7, 60, E(664, 'North Atlantic moist mixed forests', 4));
    expect(r.fuente).toBe('ecorregion');
    expect(r.ficha?.id).toBe('atlantico_llanura_noroeste');
  });

  it('Almería no recibe la receta de la dehesa', () => {
    // 803 es semiárido de verdad, del orden de 250 mm al año. Plegarlo al
    // mediterráneo ibérico haría recomendar dehesa y montado en un semidesierto.
    const r = resolverBioma(k('BSk'), 37.0, -2.1, 300, E(803, 'Southeastern Iberian shrubs and woodlands', 13));
    expect(r.ficha?.id).toBe('semiarido_sureste_iberico');
    expect(r.ficha?.id).not.toBe('mediterraneo_europeo');
  });

  it('Oaxaca y Kansas conservan la ficha que ya tenían', () => {
    // El montaje agrega 143 ECO_ID americanos sin remapear ninguno de los 21
    // que ya estaban curados.
    expect(fichaDeEcorregion(487)).toBe('bosque_mesofilo_montana');
    expect(fichaDeEcorregion(392)).toBe('pradera_pastos_altos');
    expect(fichaDeEcorregion(495)).toBe('bosque_humedo_tropical_caribeno');
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

describe('montaje de Sudamérica', () => {
  it('los seis vacíos deliberados ya tienen ficha propia', () => {
    // Eran los seis que caían al bioma global porque ninguna de las 12 fichas
    // argentinas los describe.
    expect(fichaDeEcorregion(525)).toBe('caatinga');                 // Caatinga
    expect(fichaDeEcorregion(571)).toBe('chaco_humedo');             // Humid Chaco
    expect(fichaDeEcorregion(584)).toBe('pantanal');                 // Pantanal
    expect(fichaDeEcorregion(590)).toBe('paramos_andinos');          // Cordillera Central páramo
    expect(fichaDeEcorregion(454)).toBe('darien_humedo_panama');     // Chocó-Darién
    expect(fichaDeEcorregion(479)).toBe('valles_secos_interandinos');// Marañón dry forests
  });

  it('la Amazonía dejó de recibir la ficha del Alto Paraná', () => {
    // El id selva_tropical pasó a llamarse selva_paranaense justamente porque
    // después de la partición sólo cubre el Alto Paraná.
    expect(fichaDeEcorregion(439)).toBe('selva_paranaense');
    expect(fichaDeEcorregion(476)).toBe('amazonia_oriental_tierra_firme');
    expect(fichaDeEcorregion(446)).toBe('amazonia_noroccidental_tierra_firme');
    expect(fichaDeEcorregion(505)).toBe('amazonia_suroccidental_tierra_firme');
    expect(fichaDeEcorregion(467)).toBe('varzeas_igapos_amazonicos');
    // Y la heurística climática tampoco: un predio amazónico sin ecorregión
    // recibía la ficha de Misiones por el camino Af/Am.
    expect(determinarBioma(k('Af'), -3.5, -60.0, 40)).toBe('amazonia_oriental_tierra_firme');
    expect(determinarBioma(k('Cfa'), -26.8, -54.5, 200)).toBe('selva_paranaense');
  });

  it('la Mata Atlántica y los campos uruguayos salen de las fichas argentinas', () => {
    expect(fichaDeEcorregion(442)).toBe('mata_atlantica_costera');
    expect(fichaDeEcorregion(443)).toBe('mata_atlantica_interior');
    expect(fichaDeEcorregion(440)).toBe('mata_araucaria_altura');
    // 574 es Uruguayan savanna: campos, no pampa húmeda (576).
    expect(fichaDeEcorregion(574)).toBe('campos_uruguayos');
    expect(fichaDeEcorregion(576)).toBe('pampa');
  });

  it('las tres punas y los llanos dejan de ser una sola ficha', () => {
    expect(fichaDeEcorregion(587)).toBe('puna_seca_central');
    expect(fichaDeEcorregion(588)).toBe('puna_altoandino');
    expect(fichaDeEcorregion(589)).toBe('puna_humeda_central');
    expect(fichaDeEcorregion(567)).toBe('sabana_cerrado');   // Cerrado
    expect(fichaDeEcorregion(572)).toBe('llanos_orinoquia'); // Llanos
    expect(fichaDeEcorregion(570)).toBe('sabanas_guayanesas');
  });

  it('el montaje no le sacó ecorregiones a los paquetes anteriores', () => {
    // La entrega sudamericana lista 15 ECO_ID que ya eran de Mesoamérica y el
    // Caribe. Se respetan: el dueño no cambia.
    expect(fichaDeEcorregion(495)).toBe('bosque_humedo_tropical_caribeno');
    expect(fichaDeEcorregion(506)).toBe('talamanca_caribe_sur');
    expect(fichaDeEcorregion(510)).toBe('trinidad_tobago_bosques');
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
