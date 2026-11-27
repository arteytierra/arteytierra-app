import { describe, expect, it } from 'vitest';

import { BIOMAS_REGIONALES_AMERICA } from '../../../lib/biomasRegionalesAmerica';
import { fichaDeEcorregion } from '../../../lib/ecorregiones';
import { practicasDeFicha } from '../../../lib/practicasHistoricas';

/**
 * California era una ficha y son cinco ecorregiones de cuatro biomas distintos.
 *
 * `california_klamath_sierra_valle` cubría los ECO_ID 357, 366, 385, 423 y 425,
 * y lo que RESOLVE dice de ellos no se parece entre sí. Los nombres y los biomas
 * son los del propio FeatureServer, consultados el 23/11/2026:
 *
 * | ECO_ID | ECO_NAME | BIOME_NAME | NNH_NAME |
 * |---|---|---|---|
 * | 357 | Klamath-Siskiyou forests | Temperate Conifer Forests | Could Reach Half Protected |
 * | 366 | Sierra Nevada forests | Temperate Conifer Forests | Could Reach Half Protected |
 * | 385 | California Central Valley grasslands | Temperate Grasslands | **Nature Imperiled** |
 * | 423 | California interior chaparral and woodlands | Mediterranean | Could Recover |
 * | 425 | Santa Lucia Montane Chaparral & Woodlands | Mediterranean | Could Recover |
 *
 * Tres biomas, cuatro combinaciones de bioma y grado de conservación, y uno de
 * los cinco —el Valle Central— en el peor grado que RESOLVE tiene. Una ficha
 * sola no puede decir eso.
 *
 * **Lo que la ficha única hacía mal, concreto.** Su lista de cultivos era
 * `almendro, nogal, vid, olivo, naranjo, durazno, arroz, lavanda, alfalfa`, y
 * esa lista le llegaba igual a un predio en el cinturón de coníferas de la
 * Sierra a 1.800 m y a uno en el aluvión del valle a 12 m. Arroz y naranjo en
 * el bosque de pino ponderosa: es exactamente el número plausible y equivocado
 * del que habla `lib/README.md`, con el agravante de que acá no hacía falta
 * medir nada para verlo. Y sus dos modificadores de aptitud eran de dos
 * sectores distintos: el 0 de huerta hablaba del aluvión del valle y el +10 de
 * reserva hablaba de la serpentina del Klamath, así que un predio en la Sierra
 * cobraba los dos.
 *
 * **Y había un sexto problema: el 425 no existía.** El nombre de la ficha era
 * «Klamath, Sierra Nevada, Valle Central y bosques interiores» y el campo
 * `suelos` describía cuatro sectores. Santa Lucía no estaba en ninguno de los
 * dos. Un predio en Big Sur caía en una ficha que no lo mencionaba.
 *
 * El suelo de las cinco sale ahora de las descripciones oficiales de serie del
 * National Cooperative Soil Survey, que para Estados Unidos son mejor dato que
 * cualquier ráster global: más finas y con la química adentro de la
 * clasificación. SoilGrids se corrió igual contra los cinco polígonos, pero acá
 * entra como control y no como fuente, que es la primera vez en este
 * relevamiento que se puede hacer en ese orden.
 */
describe('California partida en cinco', () => {
  const IDS = [
    'klamath_siskiyou',
    'sierra_nevada_coniferas',
    'valle_central_california',
    'california_matorral_interior',
    'santa_lucia_matorral_montano',
  ] as const;

  const ficha = (id: string) => BIOMAS_REGIONALES_AMERICA[id]!;

  it('la ficha única ya no está y los cinco ECO_ID tienen la suya', () => {
    expect(BIOMAS_REGIONALES_AMERICA['california_klamath_sierra_valle']).toBeUndefined();
    const esperado: Record<number, string> = {
      357: 'klamath_siskiyou',
      366: 'sierra_nevada_coniferas',
      385: 'valle_central_california',
      423: 'california_matorral_interior',
      425: 'santa_lucia_matorral_montano',
    };
    for (const [eco, id] of Object.entries(esperado)) {
      expect(fichaDeEcorregion(Number(eco)), eco).toBe(id);
      expect(ficha(id), id).toBeDefined();
    }
    // Y ninguna se quedó sin nada: las cinco traen especies, suelos y aptitud.
    for (const id of IDS) {
      expect(ficha(id).especies.length, id).toBeGreaterThanOrEqual(5);
      expect(ficha(id).suelos.length, id).toBeGreaterThan(400);
      expect(ficha(id).aptitud?.length, id).toBeGreaterThanOrEqual(2);
    }
  });

  it('el arroz y el naranjo quedaron donde se cultivan y en ningún otro lado', () => {
    // El fondo del asunto: la lista única ofrecía los dos en los cinco
    // sectores. Ahora el arroz sólo está en el valle, que es donde la propia
    // descripción de la serie San Joaquín lo lista entre los usos.
    expect(ficha('valle_central_california').cultivos).toContain('arroz');
    expect(ficha('valle_central_california').cultivos).toContain('naranjo');
    for (const id of IDS) {
      if (id === 'valle_central_california') continue;
      expect(ficha(id).cultivos, id).not.toContain('arroz');
      expect(ficha(id).cultivos, id).not.toContain('naranjo');
    }
    // Y las dos fichas de montaña fría llevan frutal templado, no cítrico.
    expect(ficha('klamath_siskiyou').cultivos).toContain('manzano');
    expect(ficha('sierra_nevada_coniferas').cultivos).toContain('manzano');
  });

  it('cada modificador de aptitud habla de su propio sector', () => {
    // El +10 de reserva era del Klamath y ahí se quedó; el 0 de huerta era del
    // valle y ahí se quedó. Antes los cobraban los cinco.
    const klamath = ficha('klamath_siskiyou').aptitud!;
    const reserva = klamath.find((a) => a.uso === 'reserva')!;
    expect(reserva.delta).toBe(10);
    expect(reserva.razon).toMatch(/ultramáficos/);
    expect(reserva.razon).toMatch(/Dubakella/);
    expect(klamath.some((a) => a.uso === 'huerta' && a.delta === 0)).toBe(false);

    const valle = ficha('valle_central_california').aptitud!;
    expect(valle.find((a) => a.uso === 'huerta')!.delta).toBe(0);
    expect(valle.find((a) => a.uso === 'huerta')!.razon).toMatch(/asignación de riego/);
    // El duripán es del valle y es lo que decide el frutal, no la huerta.
    const frutales = valle.find((a) => a.uso === 'frutales')!;
    expect(frutales.delta).toBe(-5);
    expect(frutales.razon).toMatch(/51 y 102 cm/);
    expect(frutales.razon).toMatch(/obra previa, no manejo/);
    // Y el peor grado de conservación de RESOLVE justifica el +10 de reserva
    // en la región agrícola más productiva del mundo, que suena contradictorio
    // hasta que se lee de qué parche habla.
    const reservaValle = valle.find((a) => a.uso === 'reserva')!;
    expect(reservaValle.delta).toBe(10);
    expect(reservaValle.razon).toMatch(/Nature Imperiled/);
    expect(reservaValle.razon).toMatch(/no discute el campo que ya existe/);
  });

  it('la serpentina es lo que el zonal no puede ver, y eso se dice', () => {
    // Hallazgo del 23/11/2026, y el único de los quince polígonos medidos
    // donde se pudo comparar SoilGrids contra un relevamiento nacional denso.
    // La serpentina es un cualificador de la WRB -hypermagnesic- y no un grupo,
    // así que `MostProbable`, que devuelve grupos, es estructuralmente ciego a
    // ella: el Klamath le sale Cambisols y Luvisols como cualquier monte
    // templado. Es la misma limitación que el script ya anota para los tiónicos.
    const s = ficha('klamath_siskiyou').suelos;
    expect(s).toMatch(/Cambisols 57,1 %/);
    expect(s).toMatch(/Luvisols 38,7 %/);
    expect(s).toMatch(/cualificador de la WRB y no un grupo/);
    expect(s).toMatch(/magnesic/);
    expect(s).toMatch(/51 y 102 cm/);
  });

  it('el valle no tiene clase dominante, y eso también es un dato', () => {
    // 26,4 % es el máximo. En los nueve polígonos del Decán y de Indomalaya la
    // dominante iba de 34,6 a 96,7 %; acá no hay ninguna, porque el valle es un
    // mosaico de aluvión, cubeta y faja de río y no una provincia de suelo.
    const s = ficha('valle_central_california').suelos;
    expect(s).toMatch(/no hay clase dominante/);
    expect(s).toMatch(/Luvisols 26,4 %/);
    expect(s).toMatch(/Vertisols 18,6 %/);
    expect(s).toMatch(/Fluvisols 4,1 %/);
    // Y las dos clasificaciones coinciden: el argílico de la serie oficial del
    // estado es el Luvisol, y las arcillas de cubeta son los Vertisols.
    expect(s).toMatch(/dicen lo mismo con otras palabras/);
    expect(s).toMatch(/Abruptic Durixeralf/);
  });

  it('el zonal pierde las dos capas que deciden el uso, y las dos fichas lo dicen', () => {
    // El hallazgo más fuerte de la corrida, y el que sólo se puede hacer donde
    // hay relevamiento nacional denso con el que comparar. `MostProbable`
    // devuelve grupos de referencia de la WRB, y sobre estos cinco polígonos no
    // devuelve ni un píxel de dos grupos:
    //
    // - **Durisols**, que la WRB 2022 define por «accumulation of, and
    //   cementation by, secondary silica», o sea por el duripán. El Valle
    //   Central lo tiene a 51-102 cm en el suelo oficial del estado, y es lo
    //   que ahoga un frutal.
    // - **Umbrisols**, que la WRB define por el topsoil oscuro de baja
    //   saturación de bases. La serie extensiva del cinturón de coníferas de la
    //   Sierra tiene ese horizonte con 50 a 90 cm de espesor, y es la reserva
    //   de agua del perfil.
    //
    // Los dos grupos están entre las 31 capas que el script baja, así que no es
    // que no se pidieran: el producto los da en cero. Lo que el zonal devuelve
    // en su lugar son Luvisols y Cambisols, que es el perfil sin la capa que
    // importa. No invalida los nueve polígonos de Indomalaya medidos con el
    // mismo método, pero sí dice qué clase de cosa se les puede estar
    // escapando, y ahí no hay con qué compararlo.
    expect(ficha('valle_central_california').suelos).toMatch(/ni un píxel de Durisols/);
    expect(ficha('valle_central_california').suelos).toMatch(/sílice secundaria/);
    expect(ficha('sierra_nevada_coniferas').suelos).toMatch(/ni un píxel de Umbrisols/);
    expect(ficha('sierra_nevada_coniferas').suelos).toMatch(/50 a 90 cm/);
    // Y la salvedad va escrita: una serie no es un polígono.
    expect(ficha('sierra_nevada_coniferas').suelos).toMatch(/una serie y la ecorregión tiene decenas/);
  });

  it('la Sierra declara el único uso productivo que su fuente le da', () => {
    const s = ficha('sierra_nevada_coniferas');
    expect(s.suelos).toMatch(/Cambisols 50,4 %/);
    // Shaver y Holland declaran las dos lo mismo: madera de coníferas. El
    // delta de forestal sale de ahí y no de una impresión.
    const forestal = s.aptitud!.find((a) => a.uso === 'forestal')!;
    expect(forestal.delta).toBe(5);
    expect(forestal.razon).toMatch(/Shaver y Holland/);
    expect(forestal.razon).toMatch(/producción comercial de conífera/);
    // Lo que se midió del fuego, con su alcance declarado: una unidad de suelo
    // y trece muestras, no la Sierra entera. Y dos resultados que van contra la
    // simplificación usual: el suelo sin quemar ya era hidrófobo y la ceniza de
    // arriba resultó hidrófila.
    expect(s.suelos).toMatch(/Caldor/);
    expect(s.suelos).toMatch(/sin quemar ya era hidrófobo/);
    expect(s.suelos).toMatch(/hidrófila/);
    expect(s.suelos).toMatch(/trece muestras de una unidad/);
  });

  it('en Santa Lucía las dos clasificaciones coinciden sin haberse consultado', () => {
    // Kastanozems 80,7 % contra el Haploxeroll de la serie Sur: es la
    // traducción directa. El sector que la ficha única no mencionaba es el que
    // da el control más limpio.
    const s = ficha('santa_lucia_matorral_montano').suelos;
    expect(s).toMatch(/Kastanozems 80,7 %/);
    expect(s).toMatch(/Haploxeroll/);
    expect(s).toMatch(/30 a 85 %/);
    expect(s).toMatch(/movimiento gravitacional/);
    // El matiz que la separa de la ficha vecina de chaparral: acá la vegetación
    // vuelve rápido, así que la ventana de peligro tras el fuego dura menos.
    expect(s).toMatch(/Mud Creek/);
    expect(s).toMatch(/dura menos acá/);
    expect(ficha('santa_lucia_matorral_montano').aptitud!
      .find((a) => a.uso === 'huerta')!.delta).toBe(-25);
  });

  it('en el pie de la Sierra el mapa de suelo no alcanza, y la fuente lo dice', () => {
    // El dato que convierte una recomendación en una calicata: la profundidad
    // hasta la roca pasa de menos de 50 cm a más de 50 cm en menos de 3,5 m de
    // distancia horizontal. Ninguna consulta por punto puede resolver eso.
    const s = ficha('california_matorral_interior').suelos;
    expect(s).toMatch(/3,5 metros/);
    expect(s).toMatch(/25 y 70 cm/);
    expect(s).toMatch(/calicata/);
    // Y el selenio del valle nace acá: la roca sedimentaria marina del flanco
    // oeste es la fuente, cuesta arriba del polígono vecino.
    expect(s).toMatch(/selenio/);
    expect(ficha('valle_central_california').suelos).toMatch(/Kesterson/);
    // Y el desacuerdo entre el zonal y la serie acá no es del producto: es de
    // la escala. 232 m de lado contra una propiedad que cambia al doble en 3,5
    // m. La conclusión no es buscar otra fuente.
    expect(s).toMatch(/Luvisols 49,9 %/);
    expect(s).toMatch(/no es acá culpa del producto sino de la escala/);
    expect(s).toMatch(/se arregla cavando/);
  });

  it('las dos prácticas de cada lado quedaron del lado que les toca', () => {
    // Las cuatro estaban juntas. Karuk y Yurok son del bajo Klamath (357); la
    // quema pomo de las Coast Ranges y la sidra de manzanita de North Fork dan
    // las dos 423 por consulta espacial, y eso ya estaba verificado en
    // `practicasLote3.test.ts` antes de que la ficha se partiera.
    const klamath = practicasDeFicha('klamath_siskiyou');
    const interior = practicasDeFicha('california_matorral_interior');
    expect(klamath).toHaveLength(2);
    expect(interior).toHaveLength(2);
    expect(klamath.map((p) => p.practica).join(' | ')).toMatch(/avellano/);
    expect(klamath.map((p) => p.practica).join(' | ')).toMatch(/weirs/);
    expect(interior.map((p) => p.practica).join(' | ')).toMatch(/otoño/);
    expect(interior.map((p) => p.practica).join(' | ')).toMatch(/manzanita/);
    expect(practicasDeFicha('california_klamath_sierra_valle')).toHaveLength(0);
  });

  it('las cinco declaran la serie de la NRCS y ninguna tiene HWSD', () => {
    const serie: Record<string, string> = {
      klamath_siskiyou: 'dubakella',
      sierra_nevada_coniferas: 'shaver',
      valle_central_california: 'san+joaquin',
      california_matorral_interior: 'auburn',
      santa_lucia_matorral_montano: 'sur',
    };
    for (const [id, s] of Object.entries(serie)) {
      const urls = ficha(id).fuentes.map((f) => f.url);
      expect(urls.some((u) => u.includes(`series=${s}`)), id).toBe(true);
      expect(urls.some((u) => u.includes('isric.org/soilgrids')
        || u.includes('isric.org/soilgrids/')), id).toBe(true);
      // HWSD v2 sigue sin WCS en ISRIC y las cinco lo dicen, igual que las
      // nueve de Indomalaya.
      expect(urls.some((u) => u.includes('harmonized-world-soil-database')), id).toBe(false);
      expect(ficha(id).suelos, id).toMatch(/HWSD v2 sigue sin extraerse/);
    }
  });
});
