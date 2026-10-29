import { describe, expect, it } from 'vitest';

import { BIOMAS_GLOBALES } from '../../../lib/biomasGlobales';
import { BIOMAS_REGIONALES_AUSTRALASIA } from '../../../lib/biomasRegionales';
import { componerAptitud } from '../../../lib/contexto';
import { fichaDeEcorregion } from '../../../lib/ecorregiones';
import type { ModificadorAptitud } from '../../../lib/biomaTipos';

/**
 * La ficha del Pilbara existe para **confirmar** un número, no para corregirlo,
 * y ese es el caso raro que hay que proteger de una futura buena intención.
 *
 * El bioma global de desierto le pone `pasturas −15` con la razón «la carga que
 * aguanta es baja y el error se paga con desertificación». La entrega del lote 1
 * de la fase 3 propuso bajarlo a 0, con el argumento de que el Pilbara es un
 * sistema pastoril real con manejo documentado —lo cual es cierto— y de que un
 * castigo uniforme de desierto no lo representa.
 *
 * El relevamiento oficial dice lo contrario, y lo dice con la frase que decide
 * el lote: el Pilbara está en mejor estado que el resto de los rangelands de
 * Australia Occidental —77 % de la vegetación en buen estado contra 39 % de
 * promedio— **porque la mayor parte no se puede pastorear**. El forraje está en
 * la planicie aluvial y la llanura de inundación, un octavo de la superficie, y
 * ahí es donde el informe mide el daño.
 *
 * Y como `componerAptitud` hace que el delta regional reemplace al global, un 0
 * no suma: borra. Estos tests cuidan tres cosas:
 *
 * 1. Que la advertencia de pasturas **siga ahí** y con el valor del bioma.
 * 2. Que la razón lleve el mecanismo medido y no la conclusión.
 * 3. Que no se le atribuya una carga animal a un informe que no se abrió.
 */

const DESIERTO = 'resolve_desierto_matorral_xerofilo';
const PILBARA = 'pilbara_matorral';

const ficha = () => BIOMAS_REGIONALES_AUSTRALASIA[PILBARA]!;

/** Lo que ve el usuario: la ficha compuesta con su bioma global. */
const efectiva = () =>
  componerAptitud(ficha().aptitud, BIOMAS_GLOBALES[DESIERTO]?.aptitud);

const buscar = (aptitud: ModificadorAptitud[], uso: ModificadorAptitud['uso']) =>
  aptitud.find((m) => m.uso === uso);

describe('el lote de Australasia', () => {
  it('arranca con una sola ficha, y es la que corrige el reino que estaba en cero', () => {
    expect(Object.keys(BIOMAS_REGIONALES_AUSTRALASIA)).toEqual([PILBARA]);
  });

  it('el ECO_ID 213 deja de caer al bioma global', () => {
    // Las 83 ecorregiones de Australasia no tenían ninguna ficha: todas
    // recibían el modificador del bioma y nada más. Esta es la primera.
    expect(fichaDeEcorregion(213)).toBe(PILBARA);
  });

  it('no atribuye saberes, trae las siete especies y no declara cultivos', () => {
    // `cultivos` sin declarar no es un olvido: el catálogo de lib/especies.ts no
    // tiene ninguna especie que el Pilbara produzca, y la producción de la
    // región es carne sobre pastura nativa. Sin el campo, la sección cae al
    // catálogo por clase Köppen en vez de mostrar una lista inventada.
    expect(ficha().saberes).toEqual([]);
    expect(ficha().especies).toHaveLength(7);
    expect(ficha().cultivos).toBeUndefined();
  });
});

describe('el modificador de pasturas, que es el punto del lote', () => {
  it('se confirma en el valor del bioma: no se cancela', () => {
    // Si alguien vuelve a proponer 0 acá, este test lo frena. El 0 no suma:
    // reemplaza, y lo que reemplazaría es la única advertencia que el usuario
    // recibe sobre la carga en un rangeland árido.
    expect(buscar(efectiva(), 'pasturas')?.delta).toBe(-15);
    expect(BIOMAS_GLOBALES[DESIERTO]!.aptitud!.find((m) => m.uso === 'pasturas')!.delta).toBe(-15);
  });

  it('pero la razón ya no es la del desierto arquetípico: es el mosaico medido', () => {
    const razon = buscar(efectiva(), 'pasturas')!.razon;
    // El mecanismo: dónde está el forraje y cuánto es.
    expect(razon).toMatch(/octavo/);
    expect(razon).toMatch(/52 %/);
    expect(razon).toMatch(/18 %/);
    // La comparación que da vuelta la lectura del buen estado.
    expect(razon).toMatch(/77 %/);
    expect(razon).toMatch(/39 %/);
    // Y la conclusión que el número no autoriza, dicha al revés.
    expect(razon).toMatch(/no cuánto aguanta/);
    expect(razon).not.toBe(
      BIOMAS_GLOBALES[DESIERTO]!.aptitud!.find((m) => m.uso === 'pasturas')!.razon,
    );
  });

  it('la huerta se hereda intacta: la ficha pisa sólo lo que nombra', () => {
    // La regla de composición del encargo. El bioma castiga la huerta en −25
    // por falta de agua, y con 250 a 400 mm de lluvia de verano eso está bien:
    // no hay nada que corregir y por eso no se repite.
    const huerta = buscar(efectiva(), 'huerta');
    expect(huerta?.delta).toBe(-25);
    expect(huerta?.razon).toBe(
      BIOMAS_GLOBALES[DESIERTO]!.aptitud!.find((m) => m.uso === 'huerta')!.razon,
    );
    expect(ficha().aptitud!.map((m) => m.uso)).toEqual(['pasturas', 'reserva']);
  });

  it('la reserva mantiene el valor y corrige el mecanismo', () => {
    // El bioma dice que la costra biológica «tarda décadas en formarse y se
    // destruye en una pasada». El relevamiento del Pilbara mide otra cosa: la
    // costra de criptógamas se rompe con el pisoteo pero se rearma sola si el
    // horizonte superficial quedó entero. Lo irreversible es perder el suelo,
    // que son 25 a 50 cm sobre hardpan o roca.
    expect(buscar(efectiva(), 'reserva')?.delta).toBe(15);
    expect(buscar(efectiva(), 'reserva')!.razon).toMatch(/hardpan/);
    expect(buscar(efectiva(), 'reserva')!.razon).toMatch(/se rearma sola/);
  });
});

describe('lo que el texto tiene que seguir diciendo', () => {
  it('el suelo no es un orden único: son 21 grupos con su clase de la ASC', () => {
    // La tentación de una ficha árida es escribir «Aridisoles» y seguir. El
    // relevamiento describió más de 720 perfiles y los repartió en 21 grupos,
    // cada uno con su clase de la Australian Soil Classification.
    expect(ficha().suelos).toMatch(/21 Soil Groups/);
    expect(ficha().suelos).toMatch(/Australian Soil Classification/);
    expect(ficha().suelos).toMatch(/720 perfiles/);
  });

  it('la advertencia de diseño sobre el escurrimiento laminar está escrita', () => {
    // Es el dato más caro del informe para esta app, porque contradice la
    // intuición: en la planicie de hardpan del sistema Jurrawarinna el
    // escurrimiento laminar fue encauzado y el resultado no fue más agua abajo
    // sino muerte de mulga por falta de agua, más erosión. acequia dibuja
    // swales y líneas clave: acá eso se piensa dos veces.
    expect(ficha().suelos).toMatch(/Jurrawarinna/);
    expect(ficha().suelos).toMatch(/muerte de mulga/);
    expect(ficha().suelos).toMatch(/parche fértil/);
  });

  it('los duplex son el suelo que el ganado busca y el que se va', () => {
    expect(ficha().suelos).toMatch(/duplex/);
    expect(ficha().suelos).toMatch(/6,5 %/);   // puntos con erosión acelerada
    expect(ficha().suelos).toMatch(/310 km²/); // degradación severa cartografiada
  });
});

describe('lo que no se afirma', () => {
  it('no cita el informe de carga animal, porque no se abrió', () => {
    // «Pastoral resources and their management in the Pilbara region»
    // (Miscellaneous Publication 21/2004) trae la carga por sistema de tierras
    // y tipo de pastura. Su página abre; el PDF pesa 108,3 MB y no se bajó. Por
    // eso no está en fuentes y ningún número se le atribuye. Si alguien lo baja
    // y lo lee, este test es el lugar donde se saca de acá.
    const urls = ficha().fuentes.map((f) => f.url);
    expect(urls.some((u) => u.includes('misc_pbns/15'))).toBe(false);
    expect(ficha().fuentes).toHaveLength(4);
  });

  it('ningún texto declara una carga animal en hectáreas por cabeza', () => {
    // El error que el encargo pedía evitar: extrapolar una carga única a toda
    // la ecorregión. La fuente pastoral advierte que sus estimaciones son por
    // tipo de pastura y sistema de tierras, así que acá no hay ninguna.
    const textos = [ficha().resumen, ficha().vegetacion, ficha().fauna, ficha().suelos,
      ...ficha().aptitud!.map((a) => a.razon)];
    for (const t of textos) {
      expect(t, t.slice(0, 40)).not.toMatch(/ha\s*\/\s*(UV|EV|cabeza)|unidad vacuna|hect[áa]reas por (cabeza|unidad)/i);
    }
  });
});
