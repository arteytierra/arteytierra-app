import { describe, expect, it } from 'vitest';

import { BIOMAS_GLOBALES } from '../../../lib/biomasGlobales';
import { BIOMAS_REGIONALES_INDOMALAYA } from '../../../lib/biomasRegionales';
import { componerAptitud } from '../../../lib/contexto';
import { ESPECIES_POR_ID } from '../../../lib/especies';
import { fichaDeEcorregion } from '../../../lib/ecorregiones';
import type { ModificadorAptitud } from '../../../lib/biomaTipos';

/**
 * Las tres fichas del Decán seco, que son las únicas de Indomalaya que no son de
 * bioma húmedo. La central es además la única del catálogo entero que contradice
 * un cálculo de la propia app.
 *
 * El 297 y el 298 se montaron el 04/11/2026, de los lotes 2 y 3 del mismo
 * encargo, y sus tests están al final de este archivo. Lo que fijan es sobre
 * todo lo que **no** se montó de esa entrega: los dos modificadores de pasturas
 * en 0 y los dos de forestal en negativo, que estaban argumentados con la
 * presión de uso medida —el fuego que se prende para pastorear, el sobrepastoreo,
 * el sándalo ya extraído— y no con la aptitud del sitio. Degradación observada y
 * aptitud son dos cosas, y el bioma ya trae la advertencia de descanso.
 *
 * La entrega del lote 1 de `fichas-indomalaya` no propuso ningún modificador, y
 * dio un motivo correcto: el gradiente de lluvia de la región va de 500 a 1.200
 * mm y un delta único no lo representa. Lo que estos tests fijan es lo que
 * salió de leer los primarios, que es otra cosa:
 *
 * 1. **La variable que decide no es la lluvia, es la profundidad del perfil.**
 *    Un vertisol profundo guarda unos 230 mm de agua útil y uno somero unos
 *    120, y eso decide si hay cosecha post-monzón sin riego. Así que el −10 de
 *    huerta del bioma se mantiene —no se puede decir las dos cosas con un solo
 *    número— pero su razón se reescribe, y la razón es lo que llega a la
 *    pantalla.
 * 2. **Al bioma le falta el uso que la ecorregión sí banca.** El bosque
 *    tropical seco global no trae `forestal`, y acá la especie que define la
 *    ecorregión regenera en suelos compactados por el ganado y en suelos
 *    esqueléticos, con el 80 % del hábitat ya perdido. Eso se agrega.
 * 3. **Lo que la app calcula acá va al revés de lo medido.** El grupo
 *    hidrológico sale de la conductividad saturada, así que un vertisol cae en
 *    grupo D con «alta escorrentía», y treinta y cinco años de microcuencas del
 *    ICRISAT adentro de la ecorregión miden 7 a 11 % contra 16 a 17 % del
 *    alfisol arenoso de al lado. El aviso tiene que seguir escrito en la ficha
 *    hasta que el motor lo sepa.
 */

const SECO = 'resolve_bosque_tropical_seco';
const DECAN = 'decan_central_hardwickia';
const NORTE = 'decan_norte_sal';
const SUR = 'decan_sur_elefantes';

const ficha = () => BIOMAS_REGIONALES_INDOMALAYA[DECAN]!;
const fichaDe = (id: string) => BIOMAS_REGIONALES_INDOMALAYA[id]!;
const efectivaDe = (id: string) =>
  componerAptitud(fichaDe(id).aptitud, BIOMAS_GLOBALES[SECO]?.aptitud);

/** Lo que ve el usuario: la ficha compuesta con su bioma global. */
const efectiva = () =>
  componerAptitud(ficha().aptitud, BIOMAS_GLOBALES[SECO]?.aptitud);

const buscar = (aptitud: ModificadorAptitud[], uso: ModificadorAptitud['uso']) =>
  aptitud.find((m) => m.uso === uso);

const razonDe = (id: string, uso: ModificadorAptitud['uso']) =>
  buscar(efectivaDe(id), uso)?.razon ?? '';

describe('la ficha del Decán central', () => {
  it('el ECO_ID 290 deja de caer al bioma global', () => {
    expect(fichaDeEcorregion(290)).toBe(DECAN);
  });

  it('es una de las tres secas del bloque, y las tres están declaradas', () => {
    // Si alguna vez entra otra ecorregión seca a Indomalaya, hay que pasar por
    // FUERA_DE_LA_REGLA en aptitudIndomalaya.test.ts antes de que esto pase. Ya
    // pasó: el 05/11/2026 entraron tres más que tampoco salen de la regla, y una
    // de ellas —el Irrawaddy seco— es de este mismo bioma 2.
    expect(ficha().id).toBe(DECAN);
    expect(Object.keys(BIOMAS_REGIONALES_INDOMALAYA)).toHaveLength(40);
    for (const id of [DECAN, NORTE, SUR]) {
      expect(BIOMAS_REGIONALES_INDOMALAYA[id], id).toBeDefined();
    }
  });

  it('no atribuye saberes y declara diez cultivos que existen en el catálogo', () => {
    // La entrega trajo doce ids y cinco no existían: tres venían de leer la
    // columna del nombre en vez de la del id —mijo_perla por mijo, maiz por
    // maiz_tropical, gandul por guandul— y dos no están en el catálogo, el
    // cártamo y el poroto urad. El test de cultivos.test.ts habría frenado los
    // cinco; acá se fija el resultado.
    expect(ficha().saberes).toEqual([]);
    expect(ficha().cultivos).toHaveLength(10);
    for (const id of ficha().cultivos!) expect(ESPECIES_POR_ID[id], id).toBeDefined();
    expect(ficha().cultivos).not.toContain('cartamo');
    expect(ficha().cultivos).not.toContain('poroto_urad');
  });

  it('las especies son las de la ficha de la ecorregión, no las de la India en general', () => {
    const esp = ficha().especies;
    // El par característico que nombra el primario.
    expect(esp.some((e) => e.includes('Hardwickia binata'))).toBe(true);
    expect(esp.some((e) => e.includes('Albizia amara'))).toBe(true);
    // El sándalo que corresponde acá es el rojo, endémico de estos cerros, y no
    // Santalum album, que la fuente ubica en Madrás y Mysore entre 600 y 1.200 m.
    expect(esp.some((e) => e.includes('Pterocarpus santalinus'))).toBe(true);
    expect(esp.some((e) => e.includes('Santalum album'))).toBe(false);
    // Y Acacia arabica no: la fuente la pone en la serie espinosa de la llanura
    // del Decán y Guyarat, que es la ecorregión vecina.
    expect(esp.some((e) => e.includes('arabica'))).toBe(false);
    expect(esp).toHaveLength(8);
  });
});

describe('la huerta: se confirma el número y se cambia la variable', () => {
  it('queda en el −10 del bioma, porque un delta no puede decir las dos cosas', () => {
    expect(buscar(efectiva(), 'huerta')?.delta).toBe(-10);
    expect(BIOMAS_GLOBALES[SECO]!.aptitud!.find((m) => m.uso === 'huerta')!.delta).toBe(-10);
  });

  it('pero la razón ya no es la lluvia: es la profundidad del perfil', () => {
    const razon = buscar(efectiva(), 'huerta')!.razon;
    expect(razon).toMatch(/230 mm/);
    expect(razon).toMatch(/120/);
    expect(razon).toMatch(/profundidad del perfil/);
    expect(razon).toMatch(/reserva de agua útil/);
    expect(razon).not.toBe(
      BIOMAS_GLOBALES[SECO]!.aptitud!.find((m) => m.uso === 'huerta')!.razon,
    );
  });

  it('las pasturas se heredan intactas: la ficha pisa sólo lo que nombra', () => {
    // El bioma pone +10 con la advertencia de que al final de la seca el suelo
    // queda expuesto justo cuando llegan las primeras lluvias fuertes. Acá eso
    // está medido —50 cm de suelo en cien años sobre pendiente del 1 al 2 %— así
    // que la entrada del bioma sobrevive entera y no se repite. Si alguien la
    // quiere tocar, el motivo tiene que ser otro que éste.
    const past = buscar(efectiva(), 'pasturas');
    expect(past?.delta).toBe(10);
    expect(past?.razon).toBe(
      BIOMAS_GLOBALES[SECO]!.aptitud!.find((m) => m.uso === 'pasturas')!.razon,
    );
    expect(ficha().aptitud!.map((m) => m.uso)).toEqual(['huerta', 'forestal']);
  });
});

describe('lo forestal: el uso que el bioma no nombraba', () => {
  it('se agrega en positivo, y los positivos del bloque son sólo los del Decán', () => {
    expect(BIOMAS_GLOBALES[SECO]!.aptitud!.some((m) => m.uso === 'forestal')).toBe(false);
    expect(buscar(efectiva(), 'forestal')?.delta).toBe(15);

    // Ocho positivos en 38 fichas. Cuatro son del Decán deciduo —el forestal de
    // acá, el del norte y las dos reservas— y cuatro llegaron el 05/11/2026 con
    // las tres fichas que destrabaron prácticas: las tres reservas, que en los
    // tres casos confirman el número del bioma con el mecanismo del lugar, y el
    // +10 de pasturas del Irrawaddy seco, que es el del bioma 2. La regla del
    // −25 no puede dar ninguno, así que cualquier positivo nuevo tiene que
    // entrar por este test y traer su propia fuente.
    const positivos = Object.entries(BIOMAS_REGIONALES_INDOMALAYA)
      .flatMap(([id, f]) => (f.aptitud ?? []).map((m) => [id, m] as const))
      .filter(([, m]) => m.delta > 0);
    expect(positivos.map(([id, m]) => `${id}/${m.uso}`)).toEqual([
      `${DECAN}/forestal`, `${NORTE}/forestal`, `${NORTE}/reserva`, `${SUR}/reserva`,
      'manglares_sundarbans/reserva',
      'bosques_secos_irrawaddy/pasturas', 'bosques_secos_irrawaddy/reserva',
      'matorral_espinoso_decan/reserva',
    ]);
  });

  it('la razón trae el mecanismo y también el contrapeso', () => {
    const razon = buscar(efectiva(), 'forestal')!.razon;
    // El mecanismo: por qué esta tierra degradada acepta monte.
    expect(razon).toMatch(/compactados por el ganado/);
    expect(razon).toMatch(/esquel/);
    expect(razon).toMatch(/80 %/);
    // Y el contrapeso, que es lo que impide leerlo como «cortala».
    expect(razon).toMatch(/termitas/);
    expect(razon).toMatch(/no para cosechar/);
  });
});

describe('el aviso sobre el número que calcula la app', () => {
  it('el escurrimiento medido está escrito, con los dos suelos y los dos valores', () => {
    const suelos = ficha().suelos;
    expect(suelos).toMatch(/7 al 11 %/);
    expect(suelos).toMatch(/16 al 17 %/);
    expect(suelos).toMatch(/Patancheru/);
    // El dato que cierra el círculo con el barbecho: la misma arcilla, sin
    // cultivo, escurre como la arena.
    expect(suelos).toMatch(/barbecho escurre 17 %/);
  });

  it('dice que el grupo hidrológico de la app queda por encima de lo medido', () => {
    // Es el único lugar del catálogo donde una ficha avisa que un cálculo de la
    // propia app está alto. Mientras el motor no mire el suelo expansivo, este
    // texto es la única advertencia que recibe el usuario, y va al informe.
    const suelos = ficha().suelos;
    expect(suelos).toMatch(/grupo hidrológico/);
    expect(suelos).toMatch(/grupo D/);
    expect(suelos).toMatch(/represa/);
  });

  it('la curva de infiltración está entera, porque un solo número miente', () => {
    expect(ficha().suelos).toMatch(/76 mm por hora/);
    expect(ficha().suelos).toMatch(/0,21/);
    expect(ficha().suelos).toMatch(/144 horas/);
  });

  it('la obra publicada es un drenaje y no una zanja a nivel', () => {
    expect(ficha().suelos).toMatch(/0,4 al 0,8 %/);
    expect(ficha().suelos).toMatch(/no una zanja de infiltración a nivel/);
    // Y el límite honesto de esa obra: no sirve en los eventos que deciden el año.
    expect(ficha().suelos).toMatch(/alta intensidad/);
  });
});

describe('lo que no se afirma', () => {
  it('la pérdida de hábitat va con las dos mediciones y con sus fechas', () => {
    // El 04/11/2026 entró la segunda, del trabajo que llegó con el lote 3 y que
    // publica por ecorregión. La regla es la del encargo: si hay dos
    // evaluaciones con cifras distintas van las dos, no la más alta.
    const r = ficha().resumen;
    expect(r).toMatch(/80 % del hábitat natural según la evaluación de WWF de 2002/);
    expect(r).toMatch(/66,2 %/);
    expect(r).toMatch(/1880 y 2020/);
    expect(r).toMatch(/No son la misma cuenta/);
    expect(ficha().fuentes.some((f) => f.url.includes('edepot.wur.nl'))).toBe(true);
  });

  it('no da porcentajes de HWSD ni de SoilGrids, porque no se extrajeron', () => {
    // Las otras 32 fichas del bloque traen el reparto de las dos bases. Esta no,
    // y lo dice. Si alguien agrega porcentajes, tiene que agregar también la
    // fuente a `fuentes`, y este test lo obliga a pasar por acá.
    const urls = ficha().fuentes.map((f) => f.url);
    expect(urls.some((u) => u.includes('harmonized-world-soil-database'))).toBe(false);
    expect(urls.some((u) => u.includes('isric.org/soilgrids'))).toBe(false);
    expect(ficha().suelos).toMatch(/no hay reparto de HWSD ni de SoilGrids/);
  });

  it('las dos fuentes de las que sólo se leyó el resumen lo dicen en la etiqueta', () => {
    // Pathak 2013 y Garg 2021 están detrás de pago y la copia abierta del
    // ICRISAT devuelve 403. Los números que la ficha les atribuye están en el
    // resumen publicado; el cuerpo del trabajo no se leyó, y la etiqueta que el
    // usuario ve tiene que decirlo.
    const resumidas = ficha().fuentes.filter((f) => f.url.includes('doi.org'));
    expect(resumidas).toHaveLength(2);
    for (const f of resumidas) expect(f.label, f.url).toMatch(/leído el resumen/);
  });

  it('ningún texto declara una pérdida de suelo en toneladas por hectárea', () => {
    // Es el número que está en el cuerpo de los dos trabajos y no en el
    // resumen. La ficha habla de porcentajes de reducción y de los 50 cm en
    // cien años de Sholapur, que sí están leídos.
    const textos = [ficha().resumen, ficha().vegetacion, ficha().fauna, ficha().suelos,
      ...ficha().aptitud!.map((a) => a.razon)];
    for (const t of textos) {
      expect(t, t.slice(0, 40)).not.toMatch(/t\s*\/\s*ha|toneladas por hect[áa]rea|Mg\s*ha/i);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Los lotes 2 y 3: el norte y el sur de la misma meseta
// ═══════════════════════════════════════════════════════════════════════════

describe('el Decán norte, ECO_ID 297', () => {
  it('deja de caer al bioma global', () => {
    expect(fichaDeEcorregion(297)).toBe(NORTE);
  });

  it('el hallazgo del lote está escrito: acá no hay vertisol negro', () => {
    // El encargo daba por hecho el regur del Decán central y esta ecorregión
    // está afuera de la traza basáltica. Lo que hay son alfisoles rojos maduros
    // en las tierras altas y perfiles gleyizados en los valles, medidos en
    // catenas de Sambalpur, que es el distrito de Debrigarh, una de las cuatro
    // áreas protegidas de la ecorregión.
    const s = fichaDe(NORTE).suelos;
    expect(s).toMatch(/afuera de la traza basáltica/);
    expect(s).toMatch(/no se hereda/);
    expect(s).toMatch(/Rhodustalfs/);
    expect(s).toMatch(/gleyización/);
    expect(s).toMatch(/Sambalpur/);
    expect(s).toMatch(/Debrigarh/);
    // Y no se declara ningún porcentaje para el polígono, porque son catenas.
    expect(s).toMatch(/no se declara ninguna distribución/);
  });

  it('los tres estados son los de hoy, y Jharkhand es el que faltaba', () => {
    // Las dos fuentes la describen con Bihar, Orissa y Madhya Pradesh, que son
    // los nombres de antes del año 2000. La entrega hizo media conversión:
    // puso Odisha y Chhattisgarh y perdió el ex Bihar. Lo confirma la propia
    // delineación de WWF, que nombra la provincia biótica de Chhota-Nagpur.
    const r = fichaDe(NORTE).resumen;
    for (const estado of ['Odisha', 'Chhattisgarh', 'Jharkhand']) {
      expect(r, estado).toMatch(new RegExp(estado));
    }
    expect(r).toMatch(/Chhota-Nagpur/);
    expect(r).toMatch(/antes del año 2000/);
  });

  it('las dos evaluaciones del hábitat van las dos, con su fuente y su año', () => {
    const r = fichaDe(NORTE).resumen;
    expect(r).toMatch(/tres cuartas partes/);
    expect(r).toMatch(/90 %/);
    expect(r).toMatch(/1\.460 km²/);
    expect(r).toMatch(/WCMC/);
  });

  it('no inventa endemismos: la fuente dice que no tiene', () => {
    // Es lo que impide escribir la reserva como un argumento de endemismo.
    expect(fichaDe(NORTE).resumen).toMatch(/No es rica ni endémica/);
    expect(fichaDe(NORTE).fauna).toMatch(/ninguna endémica/);
    expect(razonDe(NORTE, 'reserva')).toMatch(/no hay endemismos/);
  });

  it('la huerta confirma el −10 del bioma y cambia la variable a la posición en la ladera', () => {
    expect(buscar(efectivaDe(NORTE), 'huerta')?.delta).toBe(-10);
    const r = razonDe(NORTE, 'huerta');
    expect(r).toMatch(/pendiente y la posición en el relieve/);
    expect(r).toMatch(/valles y las planicies/);
    // Y el contrapeso del valle, que es por qué el 0 no corresponde.
    expect(r).toMatch(/gleyización/);
    expect(r).not.toBe(
      BIOMAS_GLOBALES[SECO]!.aptitud!.find((m) => m.uso === 'huerta')!.razon,
    );
  });

  it('lo forestal entra en positivo con el mecanismo del trabajo, no con la degradación', () => {
    expect(buscar(efectivaDe(NORTE), 'forestal')?.delta).toBe(10);
    const r = razonDe(NORTE, 'forestal');
    // El mecanismo: lo que el trabajo promueve para esas posiciones.
    expect(r).toMatch(/agroforestería/);
    // El contrapeso que impide leerlo como «cortala».
    expect(r).toMatch(/cálaos/);
    expect(r).toMatch(/no para carnear/);
    // La entrega lo proponía en −10 porque hay extracción no sostenible. Eso
    // mide la presión y no la aptitud, y va al revés de lo que se montó en el
    // Decán central con la misma clase de evidencia.
    expect(buscar(efectivaDe(NORTE), 'forestal')!.delta).toBeGreaterThan(0);
  });

  it('las pasturas se heredan: el fuego para pastorear mide la presión, no la aptitud', () => {
    // La entrega proponía 0, o sea cancelar el +10 del bioma, porque la fuente
    // dice que el fuego se prende para abrir pastoreo. Cancelar con eso borra
    // la advertencia de descanso del bioma y la reemplaza por nada.
    const past = buscar(efectivaDe(NORTE), 'pasturas');
    expect(past?.delta).toBe(10);
    expect(past?.razon).toBe(
      BIOMAS_GLOBALES[SECO]!.aptitud!.find((m) => m.uso === 'pasturas')!.razon,
    );
    expect(fichaDe(NORTE).aptitud!.map((m) => m.uso)).toEqual(['huerta', 'forestal', 'reserva']);
    // Pero el dato que la entrega usaba sí queda escrito, donde corresponde.
    expect(fichaDe(NORTE).vegetacion).toMatch(/mide la presión que hay, no la aptitud/);
  });

  it('la reserva sale de las acciones prioritarias publicadas, que miran la tierra de afuera', () => {
    expect(buscar(efectivaDe(NORTE), 'reserva')?.delta).toBe(15);
    const r = razonDe(NORTE, 'reserva');
    expect(r).toMatch(/conectividad/);
    expect(r).toMatch(/2,5 %/);
    expect(r).toMatch(/superficie conectada/);
  });
});

describe('el Decán sur, ECO_ID 298', () => {
  it('deja de caer al bioma global', () => {
    expect(fichaDeEcorregion(298)).toBe(SUR);
  });

  it('las dos mediciones de pérdida van las dos, con su ventana y su método', () => {
    // WWF mide fracción de bosque natural aclarada; Kalam y otros 2025 miden
    // superficie de monte seco con mapas satelitales empalmados con históricos.
    // No son intercambiables y la ficha lo dice en vez de elegir la más alta.
    const r = fichaDe(SUR).resumen;
    expect(r).toMatch(/80 %/);
    expect(r).toMatch(/62 %/);
    expect(r).toMatch(/34,6 %/);
    expect(r).toMatch(/1880/);
    expect(r).toMatch(/No son la misma cuenta/);
  });

  it('el corredor de elefantes está con las dos estimaciones y sus fuentes', () => {
    const r = fichaDe(SUR).resumen;
    expect(r).toMatch(/12\.000 km²/);
    expect(r).toMatch(/6\.300/);
    expect(r).toMatch(/Sukumar \(1989\)/);
  });

  it('la huerta confirma el −10 y nombra las dos variables que acequia mide', () => {
    expect(buscar(efectivaDe(SUR), 'huerta')?.delta).toBe(-10);
    const r = razonDe(SUR, 'huerta');
    expect(r).toMatch(/900 a 1\.500 mm/);
    expect(r).toMatch(/profundidad del perfil/);
    expect(r).toMatch(/someros/);
    // Y dice que el argumento de suelo no cancela el de agua, que es la lección
    // de la zona seca de Sri Lanka.
    expect(r).toMatch(/no se cancela con un argumento de suelo/);
  });

  it('no se le agrega forestal, y la abstención está escrita con su motivo', () => {
    // La entrega proponía −15 porque el sándalo fue extraído de casi todos los
    // bosques. Eso mide la presión de extracción, no si el sitio cría monte, y
    // habría dejado dos fichas del mismo bioma con el signo opuesto a partir de
    // la misma clase de evidencia.
    expect(BIOMAS_GLOBALES[SECO]!.aptitud!.some((m) => m.uso === 'forestal')).toBe(false);
    expect(buscar(efectivaDe(SUR), 'forestal')).toBeUndefined();
    expect(fichaDe(SUR).vegetacion).toMatch(/no se le agrega/);
    expect(fichaDe(SUR).vegetacion).toMatch(/presión de extracción y no de si el sitio cría monte/);
  });

  it('las pasturas se heredan, y el matorral espinoso queda escrito como el costo', () => {
    // Acá la entrega también proponía 0, por sobrepastoreo. El dato bueno es
    // otro y es una transición medida: donde la presión es alta aparecen las
    // espinosas, y la mayor parte del bosque ya está degradada a matorral
    // espinoso. Eso dice qué cuesta pastorear sin descanso, que es exactamente
    // la advertencia que el bioma ya trae.
    expect(buscar(efectivaDe(SUR), 'pasturas')?.delta).toBe(10);
    expect(fichaDe(SUR).vegetacion).toMatch(/plantas espinosas se vuelven más comunes/);
    expect(fichaDe(SUR).aptitud!.map((m) => m.uso)).toEqual(['huerta', 'reserva']);
  });

  it('la reserva es la más alta del bloque, y dice lo que no sabe', () => {
    expect(buscar(efectivaDe(SUR), 'reserva')?.delta).toBe(20);
    const r = razonDe(SUR, 'reserva');
    expect(r).toMatch(/no tradicionales/);
    expect(r).toMatch(/lamentablemente inadecuado/);
    // El límite honesto: la ficha no sabe por dónde pasa el corredor.
    expect(r).toMatch(/no dice es dónde pasa el corredor/);
  });

  it('el claro no se presenta como tierra disponible', () => {
    // La fuente avisa que la conservación mal planificada convirtió pastizal y
    // matorral abierto, que son el hábitat de la avutarda y el florican.
    expect(fichaDe(SUR).fauna).toMatch(/El claro no es automáticamente tierra disponible/);
  });
});

describe('lo que las tres comparten, y lo que ninguna afirma', () => {
  it('ninguna declara reparto de HWSD ni de SoilGrids, y las tres dicen por qué', () => {
    for (const id of [DECAN, NORTE, SUR]) {
      const urls = fichaDe(id).fuentes.map((f) => f.url);
      expect(urls.some((u) => u.includes('harmonized-world-soil-database')), id).toBe(false);
      expect(urls.some((u) => u.includes('isric.org/soilgrids')), id).toBe(false);
      expect(fichaDe(id).suelos, id).toMatch(/(no|[Tt]ampoco) hay reparto de HWSD ni de SoilGrids/);
    }
  });

  it('el norte y el sur van sin cultivos, porque sus fuentes de cultivos no abren', () => {
    // La entrega citaba el proyecto FOLUR de Odisha y el plan distrital de
    // Tiruchirappalli. Ninguno de los dos resuelve desde esta máquina, ni con
    // curl ni con navegador, así que no se citan y la lista no se monta: la
    // ficha cae al catálogo por clase Köppen, que es más grueso y sí tiene
    // fuente. El Decán central sí los trae.
    expect(fichaDe(DECAN).cultivos).toHaveLength(10);
    expect(fichaDe(NORTE).cultivos).toBeUndefined();
    expect(fichaDe(SUR).cultivos).toBeUndefined();
  });

  it('las fuentes son sólo las que se usaron: ninguna de relleno', () => {
    // La entrega traía HWSD y SoilGrids en `fuentes` de las dos fichas
    // diciendo en el mismo archivo que no se habían procesado, más un PDF con
    // etiqueta «DjVu Document» y el índice de EUDASM, que contesta 200 con un
    // cuerpo que dice «Request Rejected».
    for (const id of [NORTE, SUR]) {
      expect(fichaDe(id).fuentes, id).toHaveLength(4);
      for (const f of fichaDe(id).fuentes) {
        expect(f.label.length, `${id} ${f.url}`).toBeGreaterThan(20);
        expect(f.url, id).not.toMatch(/eudasm|esdac\.jrc/i);
      }
    }
  });

  it('no atribuyen saberes y traen ocho especies cada una, todas plantas', () => {
    // La entrega metía el tigre, el dhole, el elefante y el gaur en `especies`,
    // que es flora nativa por contrato del tipo: la fauna va en `fauna`.
    for (const id of [DECAN, NORTE, SUR]) {
      expect(fichaDe(id).saberes, id).toEqual([]);
      expect(fichaDe(id).especies, id).toHaveLength(8);
      for (const e of fichaDe(id).especies) {
        expect(e, `${id} ${e}`).not.toMatch(/Panthera|Cuon|Elephas|Bos gaurus|Melursus|Tetracerus/);
      }
    }
  });
});
