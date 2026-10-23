import { describe, expect, it } from 'vitest';

import { BIOMAS_GLOBALES } from '../../../lib/biomasGlobales';
import { BIOMAS_REGIONALES_INDOMALAYA } from '../../../lib/biomasRegionales';
import { componerAptitud } from '../../../lib/contexto';
import { ESPECIES_POR_ID } from '../../../lib/especies';
import { fichaDeEcorregion } from '../../../lib/ecorregiones';
import type { ModificadorAptitud } from '../../../lib/biomaTipos';

/**
 * El Decán central es la primera ficha de Indomalaya que no es de bioma húmedo,
 * y la única del catálogo entero que contradice un cálculo de la propia app.
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

const ficha = () => BIOMAS_REGIONALES_INDOMALAYA[DECAN]!;

/** Lo que ve el usuario: la ficha compuesta con su bioma global. */
const efectiva = () =>
  componerAptitud(ficha().aptitud, BIOMAS_GLOBALES[SECO]?.aptitud);

const buscar = (aptitud: ModificadorAptitud[], uso: ModificadorAptitud['uso']) =>
  aptitud.find((m) => m.uso === uso);

describe('la ficha del Decán central', () => {
  it('el ECO_ID 290 deja de caer al bioma global', () => {
    expect(fichaDeEcorregion(290)).toBe(DECAN);
  });

  it('es la única del bloque que no es bioma húmedo, y por eso está sola', () => {
    // Si alguna vez entra otra ecorregión seca a Indomalaya, hay que pasar por
    // FUERA_DE_LA_REGLA en aptitudIndomalaya.test.ts antes de que esto pase.
    expect(ficha().id).toBe(DECAN);
    expect(Object.keys(BIOMAS_REGIONALES_INDOMALAYA)).toHaveLength(33);
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
  it('se agrega en positivo, y es el único positivo del bloque', () => {
    expect(BIOMAS_GLOBALES[SECO]!.aptitud!.some((m) => m.uso === 'forestal')).toBe(false);
    expect(buscar(efectiva(), 'forestal')?.delta).toBe(15);

    const positivos = Object.entries(BIOMAS_REGIONALES_INDOMALAYA)
      .flatMap(([id, f]) => (f.aptitud ?? []).map((m) => [id, m] as const))
      .filter(([, m]) => m.delta > 0);
    expect(positivos).toHaveLength(1);
    expect(positivos[0]![0]).toBe(DECAN);
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
