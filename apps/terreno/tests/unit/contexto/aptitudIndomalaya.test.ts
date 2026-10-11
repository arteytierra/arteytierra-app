import { describe, expect, it } from 'vitest';

import { BIOMAS_GLOBALES } from '../../../lib/biomasGlobales';
import { BIOMAS_REGIONALES_INDOMALAYA } from '../../../lib/biomasRegionales';
import { componerAptitud } from '../../../lib/contexto';
import type { ModificadorAptitud } from '../../../lib/biomaTipos';

/**
 * Las 32 fichas de Indomalaya existen para corregir **un número**: el −25 de
 * huerta que el bioma global `resolve_bosque_tropical_humedo` imponía a 216
 * ecorregiones con una razón que en media Indomalaya es falsa.
 *
 * Por eso lo que estos tests cuidan no es que las fichas tengan texto —eso ya
 * lo verifica `ecorregiones.test.ts`— sino las tres formas en que este lote
 * podría empeorar las cosas en vez de mejorarlas:
 *
 * 1. **Cancelar una advertencia con el argumento equivocado.** `componerAptitud`
 *    hace que el delta regional *reemplace* al global, así que un 0 mal puesto
 *    no suma: borra. La zona seca de Sri Lanka es el caso: su bioma penaliza
 *    por falta de agua y la ficha propuso 0 por fertilidad.
 * 2. **Atribuirle el número a una fuente que no lo dijo.** El delta sale de una
 *    regla de acequia; HWSD y SoilGrids sólo aportan las fracciones de suelo.
 * 3. **Perder la corrección grande.** Las dos llanuras gangéticas son 516.000
 *    km² y el punto entero del lote.
 */

const delta = (aptitud: ModificadorAptitud[], uso: ModificadorAptitud['uso']) =>
  aptitud.find((m) => m.uso === uso)?.delta;

const razon = (aptitud: ModificadorAptitud[], uso: ModificadorAptitud['uso']) =>
  aptitud.find((m) => m.uso === uso)?.razon ?? '';

/** Lo que ve el usuario: la ficha compuesta con su bioma global. */
const efectiva = (id: string, biomaGlobalId: string) =>
  componerAptitud(BIOMAS_REGIONALES_INDOMALAYA[id]?.aptitud, BIOMAS_GLOBALES[biomaGlobalId]?.aptitud);

const HUMEDO = 'resolve_bosque_tropical_humedo';
const SECO = 'resolve_bosque_tropical_seco';
const CONIFERA = 'resolve_bosque_coniferas_tropical';

/** Las nueve que se abstuvieron porque HWSD y SoilGrids discrepaban por más de
 *  5 puntos, más la décima que se abstuvo al montar. Abstenerse es heredar. */
const SIN_MODIFICADOR = [
  'java_oriental_bali_bajo', 'pinar_toba', 'pinar_luzon', 'luzon_montano',
  'mindanao_visayas_oriental', 'negros_panay', 'mindoro', 'valle_brahmaputra',
  'ghats_sur_montano', 'sri_lanka_zona_seca',
];

describe('el lote entero', () => {
  it('son 32 fichas y 22 corrigen el número', () => {
    const ids = Object.keys(BIOMAS_REGIONALES_INDOMALAYA);
    expect(ids).toHaveLength(32);
    const conAptitud = ids.filter((id) => BIOMAS_REGIONALES_INDOMALAYA[id]!.aptitud?.length);
    expect(conAptitud).toHaveLength(22);
    expect(ids.length - conAptitud.length).toBe(SIN_MODIFICADOR.length);
  });

  it('las que se abstienen son exactamente las declaradas, y no traen aptitud', () => {
    // Si una abstención se "completa" sin discutirlo, este test lo frena: el
    // relevamiento se abstuvo porque las dos bases de suelo no coincidían, y
    // eso no se arregla eligiendo una.
    for (const id of SIN_MODIFICADOR) {
      expect(BIOMAS_REGIONALES_INDOMALAYA[id], id).toBeDefined();
      expect(BIOMAS_REGIONALES_INDOMALAYA[id]!.aptitud, id).toBeUndefined();
    }
    for (const [id, f] of Object.entries(BIOMAS_REGIONALES_INDOMALAYA)) {
      if (SIN_MODIFICADOR.includes(id)) continue;
      expect(f.aptitud?.length, id).toBeGreaterThan(0);
    }
  });

  it('ningún modificador es positivo, porque la regla no puede darlo', () => {
    // valor = −25 × fracción, con la fracción entre 0 y 1: el techo es 0. Un
    // positivo acá querría decir que alguien salió de la regla sin decirlo, y
    // eso hay que escribirlo aparte, con su propia fuente.
    for (const [id, f] of Object.entries(BIOMAS_REGIONALES_INDOMALAYA)) {
      for (const m of f.aptitud ?? []) {
        expect(m.delta, `${id}/${m.uso}`).toBeLessThanOrEqual(0);
        expect(m.delta, `${id}/${m.uso}`).toBeGreaterThanOrEqual(-25);
        expect(Math.abs(m.delta % 5), `${id}/${m.uso}`).toBe(0);   // -5 % 5 es -0 en JS
      }
    }
  });

  it('cada razón dice que el número es de acequia, no de HWSD', () => {
    // El campo `fuente` del relevamiento decía «HWSD v2; SoilGrids» para el
    // delta, y esas bases son la fuente de las fracciones de suelo, no del
    // número. Bajo el contrato de motor-de-calculo eso va al revés.
    for (const [id, f] of Object.entries(BIOMAS_REGIONALES_INDOMALAYA)) {
      for (const m of f.aptitud ?? []) {
        expect(m.razon, `${id}/${m.uso}`).toMatch(/Regla de acequia|Se cancela/);
        expect(m.razon.length, `${id}/${m.uso}`).toBeGreaterThan(80);
      }
    }
  });

  it('todas las correcciones son de huerta: es el único uso que el lote tocó', () => {
    for (const [id, f] of Object.entries(BIOMAS_REGIONALES_INDOMALAYA)) {
      for (const m of f.aptitud ?? []) expect(m.uso, id).toBe('huerta');
    }
  });
});

describe('las dos llanuras gangéticas, que son el punto del lote', () => {
  it('pasan de −25 a 0: el aluvión del Ganges no es un suelo lixiviado', () => {
    // 516.000 km² de aluvión fértil recibían la advertencia de que «la
    // fertilidad está en la biomasa viva y no en el suelo». HWSD y SoilGrids
    // coinciden en 6–7 % lixiviado.
    expect(delta(BIOMAS_GLOBALES[HUMEDO]!.aptitud!, 'huerta')).toBe(-25);
    expect(delta(efectiva('gangetica_inferior', HUMEDO), 'huerta')).toBe(0);
    expect(delta(efectiva('gangetica_superior', HUMEDO), 'huerta')).toBe(0);
  });

  it('cancelar la huerta no cancela el resto del bioma', () => {
    // componerAptitud pisa por uso y hereda lo demás: el +20 forestal del
    // bioma sigue en pie, que es lo correcto —son llanuras agroforestales—.
    expect(delta(efectiva('gangetica_inferior', HUMEDO), 'forestal')).toBe(20);
    expect(delta(efectiva('gangetica_superior', HUMEDO), 'forestal')).toBe(20);
  });

  it('el 0 no deja el lugar sin advertencia: el límite es el agua y está escrito', () => {
    // Cancelar por fertilidad no significa "acá se puede todo". En la llanura
    // baja el limitante es el arsénico geogénico del acuífero, y en la alta los
    // parches sódicos. Si se va del texto, el 0 queda desnudo.
    expect(razon(efectiva('gangetica_inferior', HUMEDO), 'huerta')).toMatch(/arsénico/);
    expect(BIOMAS_REGIONALES_INDOMALAYA['gangetica_inferior']!.suelos).toMatch(/arsénico/);
    expect(BIOMAS_REGIONALES_INDOMALAYA['gangetica_superior']!.suelos).toMatch(/sódico/);
  });
});

describe('la zona seca de Sri Lanka: la corrección que no se montó', () => {
  it('hereda el −10 del bioma seco y no el 0 que proponía el relevamiento', () => {
    // El relevamiento propuso 0 con pisa_global en null, porque no tenía el
    // valor de su bioma. El valor es −10 y su razón es «sin riego o cosecha de
    // agua, la huerta queda parada varios meses del año»: agua, no suelo. La
    // ficha dice lo mismo. Montar el 0 habría borrado la advertencia correcta
    // con un argumento de fertilidad.
    expect(delta(BIOMAS_GLOBALES[SECO]!.aptitud!, 'huerta')).toBe(-10);
    expect(BIOMAS_REGIONALES_INDOMALAYA['sri_lanka_zona_seca']!.aptitud).toBeUndefined();
    expect(delta(efectiva('sri_lanka_zona_seca', SECO), 'huerta')).toBe(-10);
  });

  it('y la ficha explica por qué: el límite es el agua, con los reservorios como antecedente', () => {
    const f = BIOMAS_REGIONALES_INDOMALAYA['sri_lanka_zona_seca']!;
    expect(f.suelos).toMatch(/el agua sí/);
    expect(f.resumen).toMatch(/reservorios/);
  });

  it('sigue heredando el +10 de pasturas del bioma seco', () => {
    expect(delta(efectiva('sri_lanka_zona_seca', SECO), 'pasturas')).toBe(10);
  });
});

describe('las dos fichas de coníferas tropicales', () => {
  it('heredan su bioma entero, que es el que sabe de fuego', () => {
    // Las dos se abstuvieron con doble motivo: las bases discrepaban y el
    // relevamiento no tenía el valor global de este bioma. Heredar acá es lo
    // correcto: el bioma de coníferas tropicales trae un +15 forestal ligado al
    // manejo de combustible que ninguna de las dos fichas podía proponer.
    for (const id of ['pinar_toba', 'pinar_luzon']) {
      expect(delta(efectiva(id, CONIFERA), 'huerta'), id).toBe(-10);
      expect(delta(efectiva(id, CONIFERA), 'forestal'), id).toBe(15);
    }
  });

  it('el pinar de Benguet trae el dato que pesa más que el suelo', () => {
    // 62 t/ha/año de pérdida sin conservación. Sea cual sea el grupo de suelo,
    // la ladera es el límite, y eso el número no lo dice.
    expect(BIOMAS_REGIONALES_INDOMALAYA['pinar_luzon']!.suelos).toMatch(/62 t\/ha/);
  });
});

describe('donde la premisa del lote era falsa y la ficha lo dice', () => {
  it('Sumatra bajo casi no corrige nada: ahí el −25 estaba bien', () => {
    // Es el resultado que no se buscaba y el que más vale: tres fuentes
    // coinciden en suelos lixiviados y los Andosols son el 0,1 %.
    expect(delta(efectiva('sumatra_bajo', HUMEDO), 'huerta')).toBe(-20);
    expect(BIOMAS_REGIONALES_INDOMALAYA['sumatra_bajo']!.suelos).toMatch(/no baja a estas tierras bajas/);
  });

  it('las dos de Sri Lanka húmeda también quedan cerca del −25', () => {
    expect(delta(efectiva('sri_lanka_humedo_bajo', HUMEDO), 'huerta')).toBe(-20);
    expect(delta(efectiva('sri_lanka_montano', HUMEDO), 'huerta')).toBe(-20);
  });

  it('Java montano es la única donde el andisol domina, y corrige poco', () => {
    // Era la ficha que motivó el encargo. El modificador es −5, no positivo, y
    // la razón dice por qué: pendiente y retención de fósforo.
    expect(delta(efectiva('java_bali_montano', HUMEDO), 'huerta')).toBe(-5);
    expect(razon(efectiva('java_bali_montano', HUMEDO), 'huerta')).toMatch(/fósforo/);
  });

  it('y la franja baja de Java no es andosólica, contra lo que suponíamos', () => {
    expect(BIOMAS_REGIONALES_INDOMALAYA['java_occidental_bajo']!.suelos)
      .toMatch(/ninguna de las dos bases muestra dominio andosólico/i);
  });
});

describe('las aluviales que son negativas por otra causa que la del bioma', () => {
  it('el Chao Phraya es negativo por suelo sulfatado ácido, no por lixiviación', () => {
    expect(delta(efectiva('pantanos_chao_phraya', HUMEDO), 'huerta')).toBe(-10);
    expect(razon(efectiva('pantanos_chao_phraya', HUMEDO), 'huerta')).toMatch(/sulfatado ácido|pirita/);
    // Y la regla de diseño que sigue de eso tiene que estar en la ficha, porque
    // es lo único accionable: no bajar la napa por debajo de la capa pirítica.
    expect(BIOMAS_REGIONALES_INDOMALAYA['pantanos_chao_phraya']!.suelos).toMatch(/pirítica/);
  });

  it('las dos turberas son negativas por turba, y la ficha dice no drenar', () => {
    for (const id of ['pantanos_borneo_suroeste', 'pantanos_sumatra']) {
      expect(razon(efectiva(id, HUMEDO), 'huerta'), id).toMatch(/turba/);
      expect(BIOMAS_REGIONALES_INDOMALAYA[id]!.suelos, id).toMatch(/drenar/);
    }
    expect(delta(efectiva('pantanos_borneo_suroeste', HUMEDO), 'huerta')).toBe(-15);
    expect(delta(efectiva('pantanos_sumatra', HUMEDO), 'huerta')).toBe(-10);
  });

  it('los deltas avisan que el anegamiento no está en el número', () => {
    // La regla no penaliza el anegamiento a propósito: se resuelve con obra de
    // agua, no con enmienda. Pero si el número sale −5 y el predio se inunda
    // seis meses, alguien tiene que haberlo dicho.
    expect(razon(efectiva('pantanos_irrawaddy', HUMEDO), 'huerta')).toMatch(/anegamiento/);
    expect(razon(efectiva('pantanos_tonle_sap', HUMEDO), 'huerta')).toMatch(/inundación/);
  });
});

describe('las nueve abstenciones heredan el bioma sin tocarlo', () => {
  it('las ocho de bosque tropical húmedo siguen en −25', () => {
    const humedas = SIN_MODIFICADOR.filter((id) => id !== 'sri_lanka_zona_seca' && id !== 'pinar_toba' && id !== 'pinar_luzon');
    expect(humedas).toHaveLength(7);
    for (const id of humedas) {
      expect(delta(efectiva(id, HUMEDO), 'huerta'), id).toBe(-25);
      expect(razon(efectiva(id, HUMEDO), 'huerta'), id).toMatch(/lixiviados/);
    }
  });

  it('y cada una explica en su texto de suelos por qué no corrigió', () => {
    // «No corrige el modificador del bioma» tiene que estar dicho en la ficha,
    // no sólo en el archivo de investigación: es lo que distingue una decisión
    // de un olvido.
    const humedas = SIN_MODIFICADOR.filter((id) => id !== 'sri_lanka_zona_seca');
    for (const id of humedas) {
      expect(BIOMAS_REGIONALES_INDOMALAYA[id]!.suelos, id).toMatch(/no corrige el modificador del bioma/);
    }
  });
});
