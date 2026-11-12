import { describe, expect, it } from 'vitest';

import { BIOMAS_GLOBALES } from '../../../lib/biomasGlobales';
import { BIOMAS_REGIONALES_INDOMALAYA } from '../../../lib/biomasRegionales';
import { componerAptitud } from '../../../lib/contexto';
import { ECO_ID_INDOMALAYA } from '../../../lib/ecorregionesIndomalaya';
import { fichaDeEcorregion } from '../../../lib/ecorregiones';
import { ESPECIES } from '../../../lib/especies';
import type { ModificadorAptitud } from '../../../lib/biomaTipos';

/**
 * Las dos turberas del 12/11/2026: Borneo (221) y la península malaya (264).
 *
 * Con éstas, las cuatro ecorregiones que RESOLVE llama «peat swamp forests»
 * —221, 264, 280 y 286, las cuatro de Indomalaya— tienen ficha, y el módulo de
 * turba queda calibrado contra las que **son** turba y no sólo contra las que la
 * tienen de refilón.
 *
 * Lo que estos tests cuidan son las cinco formas en que el lote podía imprimir
 * un número plausible y equivocado, y las cinco aparecieron de verdad:
 *
 * 1. **Leer el nombre del polígono como si fuera la geografía.** «Borneo peat
 *    swamp forests» invita a creer que ahí están las turberas de Borneo, y las
 *    cúpulas grandes de Kalimantan central no están: medidas contra el
 *    FeatureServer de RESOLVE, Sebangau (−2,45/113,85 y −2,65/113,75) y Mawas
 *    (−2,30/114,40) dan **273**, el borde norte de Sebangau (−2,15/113,80) da
 *    **281**, y el Parque Nacional Tanjung Puting está repartido entre cuatro:
 *    −2,55/111,80 y −2,90/112,10 dan 281, −2,60/111,65 y −2,45/112,05 dan
 *    **219**, y sólo −3,20/111,85 da 221. Por eso el «más de 200 especies de
 *    aves» de One Earth es una cifra del parque y no de la ecorregión.
 * 2. **Declarar ausente un número que está en el trabajo.** La entrega concluyó
 *    que no hay rendimiento publicado de sagú con la napa por encima de los
 *    40 cm. Lo hay, y es el único caso que funciona de los tres del estudio: el
 *    resumen no da la profundidad, pero la sección de materiales la da, y son
 *    unos 10 cm, sin drenaje artificial, en turba somera.
 * 3. **Atribuirle el resultado a la variable equivocada.** Siendo un estudio
 *    titulado «de distinta profundidad y distinta napa», lo tentador es leer que
 *    lo que falla es la napa. No: en el jardín que fracasó la napa también
 *    estuvo alta todo el año. Lo que separa los tres jardines es el espesor,
 *    porque en turba somera la raíz llega al subsuelo mineral.
 * 4. **Inventar la autoría.** El trabajo de jelutong llegó firmado por cinco
 *    nombres de los cuales cuatro no son sus autores. Son cuatro: Tata, van
 *    Noordwijk, Jasnari y Widayati.
 * 5. **Citar la revista de al lado.** La síntesis de Kalimantan llegó atribuida
 *    a Nature Communications y está en Scientific Reports.
 */

const delta = (aptitud: ModificadorAptitud[], uso: ModificadorAptitud['uso']) =>
  aptitud.find((m) => m.uso === uso)?.delta;

const razon = (aptitud: ModificadorAptitud[], uso: ModificadorAptitud['uso']) =>
  aptitud.find((m) => m.uso === uso)?.razon ?? '';

const efectiva = (id: string) =>
  componerAptitud(
    BIOMAS_REGIONALES_INDOMALAYA[id]?.aptitud,
    BIOMAS_GLOBALES['resolve_bosque_tropical_humedo']?.aptitud,
  );

const BORNEO = 'pantanos_turba_borneo';
const MALACA = 'pantanos_turba_malaca';
/** Las cuatro «peat swamp forests» de RESOLVE, que son todas de Indomalaya. */
const LAS_CUATRO = [
  'pantanos_turba_sumatra',
  'pantanos_tonle_sap_mekong_turba',
  BORNEO,
  MALACA,
];

describe('los dos polígonos entran y no se confunden con sus vecinos', () => {
  it('cada ECO_ID deja de caer al bioma global', () => {
    expect(fichaDeEcorregion(221)).toBe(BORNEO);
    expect(fichaDeEcorregion(264)).toBe(MALACA);
  });

  it('el conjunto de las cuatro turberas está completo y cada una es la suya', () => {
    expect(ECO_ID_INDOMALAYA[221]).toBe(BORNEO);
    expect(ECO_ID_INDOMALAYA[264]).toBe(MALACA);
    expect(ECO_ID_INDOMALAYA[280]).toBe('pantanos_turba_sumatra');
    expect(ECO_ID_INDOMALAYA[286]).toBe('pantanos_tonle_sap_mekong_turba');
    for (const id of LAS_CUATRO) expect(BIOMAS_REGIONALES_INDOMALAYA[id], id).toBeDefined();
  });

  it('el 221 no se queda con las cúpulas de Kalimantan central, y lo dice', () => {
    // Si alguien borra esta advertencia, un predio sobre la turba profunda de
    // Sebangau empieza a recibir una ficha que no le corresponde —le toca el
    // 273— y, peor, el razonamiento de esta ficha empieza a leerse como si
    // cubriera toda la turba de la isla.
    const f = BIOMAS_REGIONALES_INDOMALAYA[BORNEO]!;
    expect(f.resumen).toMatch(/273/);
    expect(f.resumen).toMatch(/281/);
    expect(f.resumen).toMatch(/Sebangau/);
  });

  it('las aves de Tanjung Puting se atribuyen al parque y no a la ecorregión', () => {
    // El parque da 219, 221 y 281 según dónde se lo mida: tres de sus cuatro
    // ecorregiones no son ésta.
    const fauna = BIOMAS_REGIONALES_INDOMALAYA[BORNEO]!.fauna;
    expect(fauna).toMatch(/Tanjung Puting/);
    expect(fauna).toMatch(/cuatro ecorregiones/);
  });
});

describe('el +20 de forestal: las cuatro lo cancelan, y una trae la alternativa', () => {
  it('ninguna de las cuatro deja vivo el positivo del bioma', () => {
    // El bioma húmedo regala +20 de forestal porque su sistema productivo es
    // agroforestal de varios estratos. En turba eso vale sólo sin bajar la
    // napa, y el camino habitual para plantar es drenar.
    expect(delta(BIOMAS_GLOBALES['resolve_bosque_tropical_humedo']!.aptitud!, 'forestal')).toBe(20);
    for (const id of LAS_CUATRO) {
      expect(delta(efectiva(id), 'forestal'), id).toBe(0);
      const r = razon(efectiva(id), 'forestal');
      expect(r, id).toMatch(/varios estratos/);
      expect(r, id).toMatch(/napa/);
      expect(r, id).toMatch(/drenar/);
    }
  });

  it('las cuatro confirman el −25 de huerta, y ninguna por lixiviación', () => {
    // El bioma pone −25 porque «en los suelos lixiviados que dominan el bioma
    // la fertilidad está en la biomasa viva». Acá el número es el mismo y el
    // motivo no: las cuatro niegan la lixiviación por escrito y las cuatro
    // nombran el hundimiento medido, que es el mecanismo que sí aplica.
    for (const id of LAS_CUATRO) {
      expect(delta(efectiva(id), 'huerta'), id).toBe(-25);
      const r = razon(efectiva(id), 'huerta');
      expect(r, id).toMatch(/no por lixiviación|por lixiviación sino|ninguno es la lixiviación/);
      expect(r, id).toMatch(/142 cm/);
    }
    // Las dos nuevas nombran además el proceso: airear turba la oxida.
    for (const id of [BORNEO, MALACA]) {
      expect(razon(efectiva(id), 'huerta'), id).toMatch(/oxida/);
    }
  });
});

describe('el sagú de Mukah: lo que decide es el espesor, no la napa', () => {
  // Los tres jardines están en Mukah, Sarawak (2,8119/112,2912), que da 221:
  // es la única evidencia de rendimiento paludícola medida adentro de una de
  // las cuatro turberas. Las tres condiciones y sus resultados:
  //
  //   turba profunda, drenaje mínimo, napa alta todo el año  →  20 % formó
  //       tronco a los 10-15 años, ninguna maduró
  //   turba profunda, inundación estacional de más de 1 m    →  menos del 10 %
  //       a los 8 años
  //   turba somera (0,5-1,5 m), sin drenaje, napa a ~10 cm   →  más del 80 %
  //       formó tronco a los 5-6 años y maduró a los 10-11
  const forestal = () => razon(efectiva(BORNEO), 'forestal');

  it('la ficha da el caso que funciona con su espesor, su napa y su plazo', () => {
    expect(forestal()).toMatch(/Mukah/);
    expect(forestal()).toMatch(/0,5 a 1,5 m/);
    expect(forestal()).toMatch(/10 cm/);
    expect(forestal()).toMatch(/80 %/);
    expect(forestal()).toMatch(/5-6 años/);
  });

  it('y dice explícitamente que lo que separa los resultados es el espesor', () => {
    // Esta es la frase que impide volver a leer el estudio al revés. Si
    // desaparece, la ficha queda diciendo «mantené la napa alta y el sagú
    // anda», que es falso sobre una cúpula profunda.
    expect(forestal()).toMatch(/el espesor y no el agua/);
    expect(forestal()).toMatch(/subsuelo mineral/);
  });

  it('el cero es una abstención por no saber dónde cae el predio', () => {
    expect(forestal()).toMatch(/borde somero|cúpula/);
  });

  it('ni el sagú ni el jelutong se declaran como cultivo, porque no se pueden', () => {
    // Las dos fichas se abstienen de la lista entera en vez de inventar ids, y
    // el motivo no es que no se cultive: es que estas dos especies no existen en
    // el catálogo y no hay con qué crearlas. Si algún día aparecen los campos,
    // hay que sacar las fichas de SIN_CULTIVOS en cultivos.test.ts.
    for (const id of [BORNEO, MALACA]) {
      expect(BIOMAS_REGIONALES_INDOMALAYA[id]!.cultivos, id).toBeUndefined();
    }
    const ids = ESPECIES.map((e) => e.id);
    expect(ids).not.toContain('sagu');
    expect(ids).not.toContain('jelutong');
    expect(ESPECIES.some((e) => /Metroxylon|Dyera/.test(e.cientifico))).toBe(false);
    expect(razon(efectiva(MALACA), 'forestal')).toMatch(/no tiene id en el catálogo|tiene id en el catálogo/);
  });
});

describe('el 264 y lo que tiene abajo', () => {
  it('la arcilla marina sulfídica está en la ficha y en el motivo del −25', () => {
    // Es lo único que distingue a esta turbera de las otras tres: el mismo
    // drenaje que oxida la turba expone los sulfuros de la arcilla.
    const f = BIOMAS_REGIONALES_INDOMALAYA[MALACA]!;
    expect(f.suelos).toMatch(/sulfídica/);
    expect(razon(efectiva(MALACA), 'huerta')).toMatch(/sulfídica/);
    expect(razon(efectiva(MALACA), 'huerta')).toMatch(/sulfatado ácido/);
  });

  it('declara la dirección del proceso y no su magnitud, que no se encontró', () => {
    // One Earth da el pH natural del agua (2,9-4,5) y no dice cuánto baja al
    // oxidarse los sulfuros. Rellenarlo con el 12 % de Gleysols tiónicos que
    // HWSD v2 da para el 285 sería mezclar cuencas.
    expect(BIOMAS_REGIONALES_INDOMALAYA[MALACA]!.suelos).toMatch(/2,9-4,5/);
    expect(razon(efectiva(MALACA), 'huerta')).toMatch(/no se rellena|no está en las fuentes/);
    expect(BIOMAS_REGIONALES_INDOMALAYA[MALACA]!.suelos).toMatch(/no se traslada/);
  });

  it('las dos declaran que no heredan el reparto de suelos del vecino', () => {
    expect(BIOMAS_REGIONALES_INDOMALAYA[BORNEO]!.suelos).toMatch(/no se hereda el reparto del 219/);
    expect(BIOMAS_REGIONALES_INDOMALAYA[MALACA]!.suelos).toMatch(/no se hereda el reparto del 265/);
  });
});

describe('el espesor del 221 está medido adentro del polígono', () => {
  // Los dos extremos del gradiente dan 221: la cúpula al sur de Putussibau
  // (0,8711/112,9230) y el delta del Kapuas en Rasau Jaya (−0,2434/109,3366).
  // En cambio Ketapang (−1,8447/109,9784) da 322, Gunung Palung
  // (−1,2137/110,2375) da 219, Teluk Keramat (1,4583/109,2101) da 273 y
  // Mempawah (0,3421/109,1838) da 281: de los sitios que citan las dos fuentes
  // de espesor, varios están afuera.
  const suelos = () => BIOMAS_REGIONALES_INDOMALAYA[BORNEO]!.suelos;

  it('da las dos puntas y dice de dónde sale cada una', () => {
    expect(suelos()).toMatch(/Putussibau/);
    expect(suelos()).toMatch(/17-18 m/);
    expect(suelos()).toMatch(/Rasau Jaya/);
    expect(suelos()).toMatch(/4-6 m/);
    expect(suelos()).toMatch(/5,16 ± 2,66 m/);
    expect(suelos()).toMatch(/3\.833 km²/);
  });

  it('avisa que el promedio de la síntesis mezcla adentro y afuera', () => {
    expect(suelos()).toMatch(/444 cm/);
    expect(suelos()).toMatch(/774 cm/);
    expect(suelos()).toMatch(/Mempawah no/);
  });

  it('trae el rango de napa, que es lo que hace accionable el límite de 40 cm', () => {
    // Sin drenar, 5-50 cm; drenada, 60-90. Con el límite crítico reglamentario
    // en 40, una turba drenada está pasada por definición. Ese es el número que
    // el usuario puede medir en su predio.
    expect(suelos()).toMatch(/5 a 50 cm/);
    expect(suelos()).toMatch(/60 a 90 cm/);
    expect(suelos()).toMatch(/40 cm/);
    expect(suelos()).toMatch(/PP 57\/2016/);
  });

  it('y el dato de agua, que no es de suelo: la turba es el almacenamiento', () => {
    expect(suelos()).toMatch(/debajo del lecho del Kapuas/);
    expect(suelos()).toMatch(/el doble del volumen de agua/);
  });
});

describe('las fuentes: lo que se leyó, con quién la firma y por dónde abre', () => {
  it('toda fuente nueva respeta la convención del rótulo y trae autores', () => {
    for (const id of [BORNEO, MALACA]) {
      for (const f of BIOMAS_REGIONALES_INDOMALAYA[id]!.fuentes) {
        expect(f.label, f.url).toMatch(/ — /);
        expect(f.url, f.label).toMatch(/^https:\/\//);
      }
    }
  });

  it('el trabajo de jelutong va con sus cuatro autores de verdad', () => {
    // Llegó firmado «Galudra, van Noordwijk, Suyanto, Pradhan, Minang», que es
    // una lista inventada: de esos cinco apellidos sólo uno es de este trabajo,
    // y con la inicial equivocada.
    const label = BIOMAS_REGIONALES_INDOMALAYA[MALACA]!.fuentes
      .find((f) => /s10457-015-9837-3/.test(f.url))!.label;
    expect(label).toMatch(/^Tata, van Noordwijk, Jasnari y Widayati 2016 — /);
    expect(label).toMatch(/Agroforestry Systems 90\(4\):617-630/);
    expect(label).not.toMatch(/Galudra|Minang|Pradhan|Suyanto/);
  });

  it('la síntesis de Kalimantan va en la revista en la que salió', () => {
    const label = BIOMAS_REGIONALES_INDOMALAYA[BORNEO]!.fuentes
      .find((f) => /s41598-026-35152-x/.test(f.url))!.label;
    expect(label).toMatch(/Scientific Reports 16:5496/);
    expect(label).not.toMatch(/Nature Communications/);
    expect(label).toMatch(/^Anshari, Ruwaimana, Ritonga, Gangga, Loisel, Galego-Sala, van der Kaars y Novita 2026 — /);
  });

  it('el trabajo que sólo se leyó de resumen lo declara', () => {
    const label = BIOMAS_REGIONALES_INDOMALAYA[BORNEO]!.fuentes
      .find((f) => /10\.1890\/15-0017/.test(f.url))!.label;
    expect(label).toMatch(/leído el resumen/);
  });

  it('ninguna de las dos cita POWO, IFAD ni UNDP: las tres contestan 403', () => {
    // Kew POWO devuelve 403 incluso desde un navegador real, y el documento de
    // IFAD sólo se sirve como descarga que la ruta de fetch rebota. Un link que
    // no abre no sirve de cita aunque sea el canónico, así que la nomenclatura
    // se verificó contra el backbone de GBIF y los dos nombres vulgares de los
    // gibones contra ITIS. Y con el documento de IFAD se fueron sus números:
    // las 880.389 ha de turba y las 270.176 ha de bosque de turbera de la
    // península no están en la ficha, porque no se pudieron leer.
    for (const id of [BORNEO, MALACA]) {
      for (const f of BIOMAS_REGIONALES_INDOMALAYA[id]!.fuentes) {
        expect(f.url, `${id} / ${f.label}`).not.toMatch(/powo\.science\.kew\.org/i);
        expect(f.url, `${id} / ${f.label}`).not.toMatch(/ifad\.org|undp\.org/i);
      }
      expect(BIOMAS_REGIONALES_INDOMALAYA[id]!.suelos, id).not.toMatch(/880\.389|270\.176/);
    }
  });

  it('la ficha de Sumatra gana la fuente del jelutong, que estaba en su polígono', () => {
    // El estudio de Dyera polyphylla es de Jambi, y el Parque Nacional de
    // Berbak (−1,4093/104,2228) da 280: la evidencia del jelutong le
    // corresponde a la turbera de Sumatra, cuya razón de forestal ya lo nombraba
    // sin fuente desde el 06/11/2026.
    const f = BIOMAS_REGIONALES_INDOMALAYA['pantanos_turba_sumatra']!;
    expect(f.fuentes.some((x) => /s10457-015-9837-3/.test(x.url))).toBe(true);
    const r = razon(efectiva('pantanos_turba_sumatra'), 'forestal');
    expect(r).toMatch(/Berbak/);
    expect(r).toMatch(/1\.769 ha/);
    // Y la advertencia que trae el caso: la plantación creció bien y se quemó.
    expect(r).toMatch(/fuego/);
  });
});

describe('nomenclatura: las tres grafías que la fuente trae mal', () => {
  it('ningún binomial de las dos fichas repite el error de One Earth', () => {
    // «S. teysmaniana» le falta una n, «Crytostachys renda» tiene las letras
    // cruzadas, y «Kokoona ovato-lanceolata» lleva un guion que el nombre
    // aceptado no tiene. Verificado contra el backbone de GBIF.
    for (const id of [BORNEO, MALACA]) {
      const f = BIOMAS_REGIONALES_INDOMALAYA[id]!;
      const texto = [f.vegetacion, f.fauna, f.suelos, ...f.especies].join(' ');
      expect(texto, id).not.toMatch(/teysmaniana/);
      expect(texto, id).not.toMatch(/Crytostachys/);
      expect(texto, id).not.toMatch(/ovato-lanceolata/);
    }
  });

  it('el pandano de la turbera va con su nombre aceptado, no con el sinónimo', () => {
    // Pandanus atrocarpus Griff. es sinónimo: el aceptado es Benstonea
    // atrocarpa, que es otro género.
    const f = BIOMAS_REGIONALES_INDOMALAYA[MALACA]!;
    expect(f.especies).toContain('Pandano de turbera (Benstonea atrocarpa)');
    expect(f.especies.join(' ')).not.toMatch(/Pandanus atrocarpus/);
  });

  it('al gibón del sur de Borneo no se le pone binomial, y se explica por qué', () => {
    // One Earth da sólo el nombre vulgar, y los dos candidatos son especies
    // distintas: ITIS llama a Hylobates albibarbis «Bornean White-bearded
    // Gibbon» y a H. muelleri «Müller's Bornean Gibbon». Los registros con
    // coordenada de GBIF ponen la mediana del primero en −2,62/111,89 y la del
    // segundo en −0,83/116,23, o sea sur contra este. Elegir uno sin
    // autoridad que lo diga sería inventar la especie.
    const fauna = BIOMAS_REGIONALES_INDOMALAYA[BORNEO]!.fauna;
    expect(fauna).toMatch(/Hylobates albibarbis/);
    expect(fauna).toMatch(/Hylobates muelleri/);
    expect(fauna).toMatch(/no le pone binomial/);
  });
});
