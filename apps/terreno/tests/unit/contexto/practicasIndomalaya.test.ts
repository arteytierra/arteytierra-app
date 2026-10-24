import { describe, it, expect } from 'vitest';
import { PRACTICAS_POR_FICHA, practicasDeFicha } from '@/lib/practicasHistoricas';
import { fichaDeEcorregion } from '@/lib/ecorregiones';
import { fichaPorId } from '@/lib/contexto';
import { BIOMAS_REGIONALES_INDOMALAYA } from '@/lib/biomasRegionalesIndomalaya';

/*
 * El primer lote de prácticas de Indomalaya, y lo que defiende es una sola cosa
 * que cuesta caro: que la práctica caiga en el polígono donde está y no en el
 * que se le parece por el nombre.
 *
 * La entrega montó las terrazas de Ifugao en `luzon_montano`, porque Ifugao es
 * montaña y es Luzón. Pero el ECO_ID 240 —Luzon montane rain forests— es la
 * Sierra Madre y los montes de Zambales, y los cinco conjuntos que inscribió la
 * UNESCO están en la Cordillera Central, repartidos entre el 241 y el 303. La
 * consulta a RESOLVE sobre las coordenadas de cada conjunto es lo que lo
 * decidió, y estos tests son para que no se vuelva a mover por parecido de
 * nombre.
 *
 * Es el cuarto error del mismo tipo en esta tanda de encargos: la MPKV del
 * Decán, Gorongosa en Mozambique, Nyimba en el miombo seco, y ahora Ifugao. Los
 * tres primeros eran de país; éste es adentro de una isla, que es más fino y por
 * eso vale fijarlo con un test.
 */

const IFUGAO = 'Terrazas de arroz payo';

describe('la zona seca de Sri Lanka', () => {
  const lista = () => practicasDeFicha('sri_lanka_zona_seca');

  it('el ECO_ID 301 es esta ficha, que es donde cae el sitio SIPAM', () => {
    // Palugaswewa, Habarana y Anuradhapura dan 301 en RESOLVE.
    expect(fichaDeEcorregion(301)).toBe('sri_lanka_zona_seca');
  });

  it('dejó de estar en cero y llegó a cuatro entradas', () => {
    expect(lista()).toHaveLength(4);
  });

  it('la ficha venía prometiendo justo esto, y la promesa sigue escrita', () => {
    // El campo `suelos` de la ficha dice que los reservorios antiguos son "el
    // antecedente de diseño más útil de la región". Si alguien reescribe esa
    // frase, que al menos vea que había una capa colgada de ella.
    const ficha = BIOMAS_REGIONALES_INDOMALAYA['sri_lanka_zona_seca'];
    expect(ficha?.suelos).toMatch(/antecedente de dise/);
    expect(lista().some((p) => /tanques encadenados/.test(p.detalle))).toBe(true);
  });

  it('el anillo del tanque nombra las seis franjas y no sólo la kattakaduwa', () => {
    // La entrega trajo una sola de las seis. La página de la FAO le atribuye la
    // sostenibilidad del riego al conjunto, así que montar una sola deja seis
    // séptimos del mecanismo afuera.
    const anillo = lista().find((p) => /Franjas de uso/.test(p.practica));
    expect(anillo).toBeTruthy();
    for (const nombre of ['gas gommana', 'perahana', 'potawetiya', 'kattakaduwa', 'kiul ela', 'thisbambe']) {
      expect(anillo!.detalle, `falta ${nombre}`).toContain(nombre);
    }
  });

  it('y dice que la fuente no explica el mecanismo de cada franja', () => {
    // El límite de la fuente va escrito: enumera y traduce, no explica. Sin eso
    // el lector supondría que el dato está y no está.
    const anillo = lista().find((p) => /Franjas de uso/.test(p.practica));
    expect(anillo!.detalle).toMatch(/no explica el mecanismo/);
  });

  it('el pastoreo entra como ganadería, que es lo que la entrega no trajo', () => {
    // Es la entrada que más le importa a acequia: la superficie de pastoreo de
    // la zona seca es el vaso del tanque y el rastrojo, o sea la misma que
    // almacena el agua y la misma que produce el arroz. Un rodeo dimensionado
    // sobre la superficie del predio acá se equivoca de denominador.
    const pastoreo = lista().find((p) => p.tipo === 'ganaderia');
    expect(pastoreo).toBeTruthy();
    expect(pastoreo!.detalle).toMatch(/lecho del tanque/);
    expect(pastoreo!.detalle).toMatch(/rastrojo|fuera de temporada/);
  });

  it('las cuatro reparten tres tipos y ninguna repite nombre', () => {
    const tipos = new Set(lista().map((p) => p.tipo));
    expect(tipos.size).toBeGreaterThanOrEqual(3);
    const nombres = lista().map((p) => p.practica);
    expect(new Set(nombres).size).toBe(nombres.length);
  });
});

describe('las terrazas de Ifugao, que están en dos ecorregiones', () => {
  it('los ECO_ID que las contienen son el 241 y el 303', () => {
    expect(fichaDeEcorregion(241)).toBe('luzon_bajo');
    expect(fichaDeEcorregion(303)).toBe('pinar_luzon');
  });

  it('la misma práctica está montada en las dos fichas, a propósito', () => {
    // acequia resuelve un punto, no una provincia. El límite del 241 y el 303
    // parte en dos al municipio de Banaue —el pueblo da 241, el mirador da
    // 303—, así que montar esto en una sola dejaría sin nada a la mitad de los
    // predios que están sobre las terrazas.
    for (const fichaId of ['luzon_bajo', 'pinar_luzon']) {
      const lista = practicasDeFicha(fichaId);
      expect(lista, fichaId).toHaveLength(4);
      expect(lista.some((p) => p.practica === IFUGAO), fichaId).toBe(true);
    }
  });

  it('y cada una nombra los conjuntos inscritos que caen en su polígono', () => {
    const bajo = practicasDeFicha('luzon_bajo').find((p) => p.practica === IFUGAO)!;
    const pinar = practicasDeFicha('pinar_luzon').find((p) => p.practica === IFUGAO)!;
    expect(bajo.detalle).toMatch(/Nagacadan/);
    expect(bajo.detalle).toMatch(/Batad/);
    expect(bajo.detalle).not.toMatch(/Hungduan/);
    expect(pinar.detalle).toMatch(/Hungduan/);
    expect(pinar.detalle).toMatch(/Mayoyao/);
    expect(pinar.detalle).not.toMatch(/Nagacadan/);
  });

  it('NO están en luzon_montano, que es la Sierra Madre y Zambales', () => {
    // El ECO_ID 240 existe y tiene ficha, pero no contiene ni un conjunto
    // inscrito: RESOLVE lo confirma en Palanan y en el monte Tapulao. Esta ficha
    // sigue sin prácticas y el pendiente es relevar la Sierra Madre, no mudar
    // Ifugao.
    expect(fichaDeEcorregion(240)).toBe('luzon_montano');
    expect(practicasDeFicha('luzon_montano')).toEqual([]);
    expect(PRACTICAS_POR_FICHA['luzon_montano']).toBeUndefined();
  });

  it('la altura va escrita, porque contradice el resumen de luzon_bajo', () => {
    // El resumen del 241 dice "por debajo de unos 1.000 m" —prosa de WWF— pero
    // el polígono sube y alcanza bancales que la FAO ubica entre 800 y 1.500 m.
    // La contradicción se declara en el detalle en vez de dejarse para que el
    // lector la descubra.
    expect(BIOMAS_REGIONALES_INDOMALAYA['luzon_bajo']?.resumen).toMatch(/por debajo de unos 1\.000 m/);
    const bajo = practicasDeFicha('luzon_bajo').find((p) => p.practica === IFUGAO)!;
    expect(bajo.detalle).toMatch(/800 y 1\.500 m/);
  });

  it('el bosque de arriba entra como obra hidráulica y no como vecino', () => {
    // Es el mecanismo que la entrega casi omitió: la FAO le atribuye al bosque
    // de las cumbres regular el impacto de la lluvia y soltar agua y nutrientes
    // despacio hacia los bancales. Sin eso, el muyung se lee como un dato de
    // biodiversidad y no como parte del riego.
    const muyung = practicasDeFicha('pinar_luzon').find((p) => /Muyung/.test(p.practica))!;
    expect(muyung.detalle).toMatch(/regula el impacto de la lluvia/);
    expect(muyung.detalle).toMatch(/264 especies/);
    expect(muyung.vigencia).toBe('en_retroceso');
  });

  it('el bancal después de la cosecha es una entrada aparte y es de suelo', () => {
    // Pinkol, inado y luhok: lo que hace la terraza los otros meses del año.
    const post = practicasDeFicha('luzon_bajo').find((p) => p.tipo === 'suelo')!;
    expect(post.practica).toMatch(/Pinkol/);
    for (const nombre of ['pinkol', 'inado', 'luhok']) {
      expect(post.detalle, `falta ${nombre}`).toContain(nombre);
    }
  });

  it('las cuatro de cada ficha reparten cuatro tipos distintos', () => {
    for (const fichaId of ['luzon_bajo', 'pinar_luzon']) {
      const tipos = practicasDeFicha(fichaId).map((p) => p.tipo);
      expect(new Set(tipos).size, fichaId).toBe(4);
    }
  });
});

describe('las fuentes de este lote', () => {
  const DEL_LOTE = ['sri_lanka_zona_seca', 'luzon_bajo', 'pinar_luzon'].flatMap((id) =>
    practicasDeFicha(id).flatMap((p) => p.fuentes),
  );

  it('son todas de la FAO o de la UNESCO, que es lo que se pudo abrir', () => {
    expect(DEL_LOTE.length).toBeGreaterThan(0);
    for (const f of DEL_LOTE) {
      expect(f.url, f.label).toMatch(/^https:\/\/(www\.fao\.org|whc\.unesco\.org)\//);
    }
  });

  it('ninguna cuelga de un repositorio que sólo aloja, ni de un host de pruebas', () => {
    // ResearchGate y Academia.edu alojan el PDF de alguien, no lo publican; y en
    // el lote de África una entrega citó `stage.oneearth.org`, que es el
    // servidor de pruebas. Ninguna de las dos cosas entra.
    for (const f of DEL_LOTE) {
      expect(f.url, f.label).not.toMatch(/researchgate|academia\.edu|stage\./i);
    }
  });

  it('el rótulo lleva el nombre del que publica, como el resto del catálogo', () => {
    for (const f of DEL_LOTE) {
      expect(f.label).toMatch(/^(FAO SIPAM|UNESCO World Heritage Centre) — /);
    }
  });
});

describe('la capa llega a la ficha', () => {
  it('fichaPorId se las inyecta a las tres', () => {
    for (const id of ['sri_lanka_zona_seca', 'luzon_bajo', 'pinar_luzon']) {
      expect(fichaPorId(id)?.practicas, id).toHaveLength(4);
    }
  });

  it('y a luzon_montano no le estrena un campo vacío', () => {
    expect(fichaPorId('luzon_montano')?.practicas).toBeUndefined();
  });
});
