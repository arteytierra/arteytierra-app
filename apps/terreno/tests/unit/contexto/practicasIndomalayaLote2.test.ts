import { describe, it, expect } from 'vitest';
import { PRACTICAS_POR_FICHA, practicasDeFicha } from '@/lib/practicasHistoricas';
import { fichaDeEcorregion } from '@/lib/ecorregiones';
import { fichaPorId } from '@/lib/contexto';

/*
 * El segundo lote de prácticas de Indomalaya, y lo que defiende es la regla que
 * salió del primero: el `id` que trae la entrega es una propuesta y lo que se
 * verifica es el `lugar`.
 *
 * De las 18 entradas que llegaron, 11 entraron, y de esas 11 una sola cayó en la
 * ficha propuesta —el arroz con peces del Brahmaputra—. Las otras diez se
 * movieron preguntándole a RESOLVE por la coordenada del lugar declarado. No es
 * un descuido de la entrega: los nombres de las fichas invitan al error, porque
 * "gangética superior" suena al sur de Bihar y "montano de Sri Lanka" suena a
 * Kandy, y ninguna de las dos cosas es cierta en el polígono.
 *
 * Estos tests fijan cada mudanza con el ECO_ID que la decidió, para que nadie
 * las devuelva al nombre que se les parece.
 */

describe('las mudanzas del lote: el ECO_ID manda sobre el nombre', () => {
  it('Gaya y Nawada son gangética INFERIOR, no superior', () => {
    // Los dos puntos dan 238 en RESOLVE. El ahar-pyne llegó propuesto en
    // `gangetica_superior`, que es el 287 y queda río arriba.
    expect(fichaDeEcorregion(238)).toBe('gangetica_inferior');
    expect(fichaDeEcorregion(287)).toBe('gangetica_superior');
    expect(practicasDeFicha('gangetica_inferior').some((p) => /Ahar y pyne/.test(p.practica))).toBe(true);
    expect(PRACTICAS_POR_FICHA['gangetica_superior']).toBeUndefined();
  });

  it('Kandy es zona húmeda BAJA, y la altura de la fuente lo dice', () => {
    // Kandy, Peradeniya y Gampola dan 274. El huerto kandyano llegó propuesto
    // en `sri_lanka_montano` —el 275, que arranca arriba de los mil metros— y
    // la entrega le puso un rango de 400 a 1.050 m que la fuente no dice: el
    // CBD lo ubica entre 400 y 650.
    expect(fichaDeEcorregion(274)).toBe('sri_lanka_humedo_bajo');
    expect(fichaDeEcorregion(275)).toBe('sri_lanka_montano');
    const kandy = practicasDeFicha('sri_lanka_humedo_bajo').find((p) => /kandyano/.test(p.practica))!;
    expect(kandy).toBeTruthy();
    expect(kandy.detalle).toMatch(/400 y 650 m/);
    expect(kandy.detalle).not.toMatch(/1\.050/);
    expect(PRACTICAS_POR_FICHA['sri_lanka_montano']).toBeUndefined();
  });

  it('el proyecto entre Chai Nat y Sing Buri es planicie inundable, no bosque deciduo', () => {
    // 224 es la planicie; 225, el deciduo del Chao Phraya, sigue en cero.
    expect(fichaDeEcorregion(224)).toBe('pantanos_chao_phraya');
    expect(fichaDeEcorregion(225)).toBe('chao_phraya_deciduo');
    expect(practicasDeFicha('pantanos_chao_phraya')).toHaveLength(2);
    expect(PRACTICAS_POR_FICHA['chao_phraya_deciduo']).toBeUndefined();
  });

  it('la aldea de Air Terjun es montano, aunque el centroide del distrito sea el pinar', () => {
    // Siulak tiene el límite por el medio: el centroide del distrito da 305
    // —cuya ficha se llama `pinar_toba`— y la aldea donde la fuente trabajó da
    // 279. Dos kilómetros cambian la ficha, así que vale la aldea.
    expect(fichaDeEcorregion(279)).toBe('sumatra_montano');
    expect(fichaDeEcorregion(305)).toBe('pinar_toba');
    expect(practicasDeFicha('sumatra_montano').some((p) => /HKm/.test(p.practica))).toBe(true);
    // El lote 3 volvió a proponer `pinar_toba`, esta vez para el café de la aldea
    // de Horsik, sobre la orilla del lago. Horsik da 279 en siete puntos, así que
    // la ficha que se llama como el lago sigue sin una sola práctica.
    expect(PRACTICAS_POR_FICHA['pinar_toba']).toBeUndefined();
  });

  it('los huertos flotantes entran por Gopalganj, que es el pantano y no el manglar', () => {
    // La propuesta SIPAM nombra Gopalganj, Pirojpur y Barisal. Gopalganj y
    // Kotalipara dan 282 —esta ficha—; Pirojpur, Nazirpur y Barisal dan 323,
    // que no tiene ficha curada. Por eso la entrada entra acá y no en la
    // gangética inferior, que es donde venía propuesta.
    expect(fichaDeEcorregion(282)).toBe('pantanos_sundarbans');
    const dhap = practicasDeFicha('pantanos_sundarbans').find((p) => /Dhap/.test(p.practica))!;
    expect(dhap).toBeTruthy();
    expect(dhap.detalle).toMatch(/Gopalganj/);
  });

  it('la única que cayó donde la entrega la puso es el arroz con peces de Assam', () => {
    expect(fichaDeEcorregion(222)).toBe('valle_brahmaputra');
    expect(practicasDeFicha('valle_brahmaputra')).toHaveLength(1);
  });
});

describe('las dos entradas que no entraron por falta de ficha', () => {
  it('el manglar de Sundarbans no tiene ficha curada, así que el arroz salino espera', () => {
    // Gosaba, Kakdwip y Patharpratima —las islas habitadas de South 24
    // Parganas— dan 323, y el 323 es manglar sin ficha. La entrada sobre
    // variedades locales tolerantes a la sal no tiene dónde montarse: el 282,
    // que sí tiene ficha, es el pantano de agua dulce del lado de Bangladesh.
    expect(fichaDeEcorregion(323)).toBeNull();
    expect(practicasDeFicha('pantanos_sundarbans').some((p) => /salin/i.test(p.practica))).toBe(false);
  });

  it('la zona seca del Irrawaddy tampoco, y no es el deciduo húmedo', () => {
    // Nyaung-U, Kyaukpadaung y Magway dan 294, Irrawaddy dry forests, sin
    // ficha. La entrega los había puesto en `irrawaddy_deciduo`, que es el 235
    // —moist deciduous— y es otra cosa: el cultivo mixto de la zona seca es una
    // respuesta a la sequía, no a la humedad.
    expect(fichaDeEcorregion(294)).toBeNull();
    expect(fichaDeEcorregion(235)).toBe('irrawaddy_deciduo');
    expect(PRACTICAS_POR_FICHA['irrawaddy_deciduo']).toBeUndefined();
  });
});

describe('los mecanismos que no se pueden perder al reescribir', () => {
  it('el bund del pyne está hecho para romperse', () => {
    // Es el detalle de diseño del lote: el terraplén de tierra atravesado en el
    // arroyo desvía agua al canal y, cuando la crecida sube, se rompe y le pasa
    // el caudal al eslabón de abajo. Una obra que falla a propósito es lo
    // contrario de lo que propondría cualquier manual, y es como funciona la
    // serie.
    const ahar = practicasDeFicha('gangetica_inferior')[0]!;
    expect(ahar.detalle).toMatch(/hecho para fallar|está hecho para fallar/);
    expect(ahar.detalle).toMatch(/40 %/);
    expect(ahar.tipo).toBe('agua');
  });

  it('en el Río Rojo la primera respuesta a la crecida fue el ciclo, no el terraplén', () => {
    // La mayor parte del delta se ganó con arroz de quinto mes, que se cosecha
    // antes de la crecida, y ahí las crónicas no registran terraplenes. El
    // terraplén aparece sólo donde se quiso cultivar el décimo mes.
    const diques = practicasDeFicha('pantanos_rio_rojo')[0]!;
    expect(diques.detalle).toMatch(/quinto mes/);
    expect(diques.detalle).toMatch(/décimo mes/);
    expect(diques.detalle).toMatch(/margen externa de las curvas/);
    expect(diques.vigencia).toBe('historica');
  });

  it('la planicie del Chao Phraya ya amortigua, y la obra puede desarmarlo', () => {
    // La advertencia que acequia necesita antes de proponer retención en una
    // llanura inundable: la fuente concluye que la política de cuencas de
    // retardo socava la flexibilidad de manejo y la capacidad de amortiguación
    // que dice mejorar.
    const regimen = practicasDeFicha('pantanos_chao_phraya').find((p) => p.tipo === 'agua')!;
    expect(regimen).toBeTruthy();
    expect(regimen.detalle).toMatch(/amortigua/);
    expect(regimen.detalle).toMatch(/socava/);
  });

  it('el arroz de aguas profundas de Pantanaw dice qué fracción del municipio es', () => {
    // 57,92 % de la superficie sembrada de monzón: no es un rincón, es la
    // categoría más extensa. Sin el número la práctica se lee como una rareza.
    const pantanaw = practicasDeFicha('pantanos_irrawaddy')[0]!;
    expect(pantanaw.detalle).toMatch(/57,92 %/);
    expect(pantanaw.detalle).toMatch(/un metro/);
  });

  it('el jungle rubber no sale mejor que el bosque primario en todo', () => {
    // La comparación es despareja y así va escrita: contra la plantación de
    // caucho gana en todos los grupos, contra el bosque primario pierde en
    // árboles, en epífitas y en especies de interior de bosque. Redondearlo a
    // "conserva biodiversidad" sería el error.
    const jungla = practicasDeFicha('sumatra_bajo')[0]!;
    expect(jungla.detalle).toMatch(/menor/);
    expect(jungla.detalle).toMatch(/cuarenta años/);
    expect(jungla.vigencia).toBe('en_retroceso');
  });
});

describe('las fuentes de este lote', () => {
  const FICHAS = [
    'gangetica_inferior', 'sri_lanka_humedo_bajo', 'valle_brahmaputra',
    'pantanos_sundarbans', 'pantanos_irrawaddy', 'pantanos_chao_phraya',
    'pantanos_rio_rojo', 'sumatra_bajo', 'sumatra_montano',
  ];
  const DEL_LOTE = FICHAS.flatMap((id) => practicasDeFicha(id).flatMap((p) => p.fuentes));

  it('son once entradas sobre nueve fichas, más la que le sumó el lote 3', () => {
    const total = FICHAS.reduce((n, id) => n + practicasDeFicha(id).length, 0);
    expect(total).toBe(12);
  });

  it('ninguna cuelga de un repositorio que sólo aloja, ni de un host de pruebas', () => {
    for (const f of DEL_LOTE) {
      // El `stage` se ancla al principio del host: `stage.oneearth.org` es un
      // servidor de pruebas y `www.jstage.jst.go.jp` es J-STAGE.
      expect(f.url, f.label).not.toMatch(/researchgate|academia\.edu|\/\/stage\.|\.stage\./i);
    }
  });

  it('el rótulo nombra al que publica antes del título', () => {
    for (const f of DEL_LOTE) {
      expect(f.label, f.url).toMatch(/ — /);
    }
  });

  it('las cuatro entradas cuya fuente no abría quedaron afuera', () => {
    // El soppinabetta de Sringeri (certificado roto en el host del IISc), el
    // arroz de Wayanad (NOPR no responde), el arroz de recesión del Tonle Sap
    // (403 en el PDF del gobierno de Camboya) y el pastoreo Toda (la URL es el
    // índice de la revista, no el trabajo). Ninguna de las cuatro fichas
    // estrena bloque.
    for (const id of ['ghats_norte_montano', 'ghats_sur_montano', 'pantanos_tonle_sap', 'ghats_norte_deciduo']) {
      expect(PRACTICAS_POR_FICHA[id], id).toBeUndefined();
    }
  });
});

describe('la capa llega a la ficha', () => {
  it('fichaPorId se las inyecta a las nueve', () => {
    const esperado: Record<string, number> = {
      gangetica_inferior: 1, sri_lanka_humedo_bajo: 2, valle_brahmaputra: 1,
      pantanos_sundarbans: 1, pantanos_irrawaddy: 1, pantanos_chao_phraya: 2,
      pantanos_rio_rojo: 1, sumatra_bajo: 1, sumatra_montano: 2,
    };
    for (const [id, n] of Object.entries(esperado)) {
      expect(fichaPorId(id)?.practicas, id).toHaveLength(n);
    }
  });
});
