import { describe, it, expect } from 'vitest';
import { PRACTICAS_POR_FICHA, practicasDeFicha } from '@/lib/practicasHistoricas';
import { fichaDeEcorregion } from '@/lib/ecorregiones';
import { fichaPorId } from '@/lib/contexto';

/*
 * El tercer lote de prácticas: seis entradas de Indomalaya insular, seis de
 * Filipinas y el Decán, y seis de América —California, el manglar del Pacífico
 * y Galápagos—. Llegaron 18, entraron 14 y quedaron montadas como 15, porque el
 * subak balinés cruza el límite entre el 229 y el 230 y se escribió una vez en
 * cada ficha.
 *
 * La diferencia con el lote anterior está medida: nueve de las 14 cayeron en la
 * ficha propuesta, contra una de once. La causa es el `lugar`: este lote nombró
 * aldea y distrito en vez de región. Las cinco que se movieron se movieron por
 * nombres de ficha que invitan al error, y estos tests fijan cada mudanza con el
 * ECO_ID que la decidió para que nadie las devuelva al nombre que se les parece.
 */

describe('las mudanzas del tercer lote', () => {
  it('la aldea de Horsik está sobre la caldera del Toba y es montano, no pinar', () => {
    // Siete puntos alrededor de Horsik (2,6365 / 98,9157) dan 279, y Parapat y
    // Balige también. El 305 —la ficha que se llama `pinar_toba`— es el pinar de
    // Kerinci, 400 km al sur. Es el segundo lote consecutivo en que esta ficha se
    // propone y no corresponde, así que sigue en cero.
    expect(fichaDeEcorregion(279)).toBe('sumatra_montano');
    expect(fichaDeEcorregion(305)).toBe('pinar_toba');
    expect(PRACTICAS_POR_FICHA['pinar_toba']).toBeUndefined();
    const toba = practicasDeFicha('sumatra_montano').find((p) => /Horsik|caldera del Toba/.test(p.practica + p.periodo))!;
    expect(toba).toBeTruthy();
  });

  it('Soreang es montano de Java occidental, y el Java occidental bajo sigue en cero', () => {
    // Sadu, Soreang, Pasirjambu y Banjaran dan todos 288, que esta ficha cubre
    // junto con el 229. El 289 —`java_occidental_bajo`— es otro polígono.
    expect(fichaDeEcorregion(288)).toBe('java_bali_montano');
    expect(fichaDeEcorregion(229)).toBe('java_bali_montano');
    expect(fichaDeEcorregion(289)).toBe('java_occidental_bajo');
    expect(PRACTICAS_POR_FICHA['java_occidental_bajo']).toBeUndefined();
    expect(practicasDeFicha('java_bali_montano').some((p) => /Talun-kebun/.test(p.practica))).toBe(true);
  });

  it('el subak ocupa las dos fichas, y cada entrada nombra los componentes que le tocan', () => {
    // Jatiluwih y Wongaya Gede (Batukaru) y el lago Batur dan 229; Mengwi y Pejeng
    // dan 230. No es una ficha o la otra: el sistema baja cruzando el límite.
    expect(fichaDeEcorregion(230)).toBe('java_oriental_bali_bajo');
    const arriba = practicasDeFicha('java_bali_montano').find((p) => /Subak/.test(p.practica))!;
    const abajo = practicasDeFicha('java_oriental_bali_bajo').find((p) => /Subak/.test(p.practica))!;
    expect(arriba).toBeTruthy();
    expect(abajo).toBeTruthy();
    expect(arriba.detalle).toMatch(/Ulun Danu Batur/);
    expect(arriba.detalle).toMatch(/Batukaru/);
    expect(abajo.detalle).toMatch(/Taman Ayun/);
    expect(abajo.detalle).toMatch(/Pakerisan/);
    // El mecanismo que acequia necesita de acá: el templo marca el paso del agua,
    // así que el calendario ritual ES el calendario de riego, y el bosque de
    // cabecera es parte del sistema de riego y no un área aparte.
    expect(arriba.detalle).toMatch(/calendario ritual/);
    expect(arriba.detalle).toMatch(/bosque de cabecera/);
  });

  it('los asentamientos agta de la Sierra Madre son selva baja, no montano', () => {
    // San Mariano, Palanan, Divilacan y Maconacon dan 241. El 240 es el montano
    // de Luzón y sigue en cero. La ficha propuesta era `luzon_montano`.
    expect(fichaDeEcorregion(241)).toBe('luzon_bajo');
    expect(fichaDeEcorregion(240)).toBe('luzon_montano');
    expect(PRACTICAS_POR_FICHA['luzon_montano']).toBeUndefined();
    expect(practicasDeFicha('luzon_bajo')).toHaveLength(5);
  });

  it('el chaparral del interior de California no es la ficha que se llama chaparral', () => {
    // Ukiah, Hopland, Clearlake y Healdsburg —el territorio pomo de las Coast
    // Ranges— y North Fork, en el pie de la Sierra, dan todos 423, que es una de
    // las cinco ecorregiones de `california_klamath_sierra_valle`. La ficha
    // `chaparral_californiano` es sólo el 424, el chaparral montano.
    expect(fichaDeEcorregion(423)).toBe('california_klamath_sierra_valle');
    expect(fichaDeEcorregion(424)).toBe('chaparral_californiano');
    expect(practicasDeFicha('california_klamath_sierra_valle')).toHaveLength(4);
    expect(practicasDeFicha('chaparral_californiano')).toHaveLength(1);
  });

  it('las nueve que cayeron donde la entrega las puso', () => {
    const esperado: Record<number, string> = {
      273: 'pantanos_borneo_suroeste',
      248: 'mindoro',
      246: 'mindanao_montano',
      247: 'mindanao_visayas_oriental',
      231: 'negros_panay',
      615: 'manglares_pacifico_suramericano',
      601: 'galapagos_matorral_xerico',
    };
    for (const [eco, ficha] of Object.entries(esperado)) {
      expect(fichaDeEcorregion(Number(eco)), eco).toBe(ficha);
    }
  });
});

describe('las cuatro que no entraron, y por qué', () => {
  it('el pantano de turba de Pampangan no tiene ficha, y la fuente además recomienda en vez de documentar', () => {
    // Pampangan y Ulak Depati dan 280, Sumatran peat swamp forests, sin ficha.
    // `pantanos_sumatra` es el 277, el pantano de agua dulce. Y el artículo
    // *propone* un esquema de manejo —reservar lebung y acompasar la siembra—, no
    // registra lo que se hizo, así que no alcanza el contrato ni con ficha.
    expect(fichaDeEcorregion(280)).toBeNull();
    expect(fichaDeEcorregion(277)).toBe('pantanos_sumatra');
    expect(PRACTICAS_POR_FICHA['pantanos_sumatra']).toBeUndefined();
  });

  it('el phad del noroeste de Maharashtra cae en el matorral espinoso, que no tiene ficha', () => {
    // Dhule, Sakri, Malegaon y Jalgaon dan 315, Deccan thorn scrub forests.
    // `decan_central_hardwickia` es el 290. Y el host de la fuente (eacpm.gov.in)
    // no responde: ni la raíz, ni por http, ni con www.
    expect(fichaDeEcorregion(315)).toBeNull();
    expect(fichaDeEcorregion(290)).toBe('decan_central_hardwickia');
    expect(PRACTICAS_POR_FICHA['decan_central_hardwickia']).toBeUndefined();
  });

  it('el café de Kintamani no entra aunque la ficha sea la correcta', () => {
    // Catur y Kintamani dan 229, que es la ficha propuesta. Lo que falla es el
    // contrato: la fuente es un estudio de ingresos y viabilidad —R/C 4,40,
    // 17,5 M IDR/ha/año— y no documenta ninguna práctica. Un número de
    // rentabilidad no es una práctica. La ficha abrió igual, por el talún y el
    // subak, pero sin el café.
    expect(practicasDeFicha('java_bali_montano').some((p) => /Kintamani|arábica/i.test(p.practica))).toBe(false);
  });

  it('el arroz de los Ati y Suludnon espera una URL donde se lean los resultados', () => {
    // Calinog, Lambunao e Iloilo dan 231, así que la ficha propuesta era la
    // correcta. Pero el repositorio de UPLB corta el resumen antes de los
    // hallazgos y la copia abierta de JESAM está detrás de una verificación
    // anti-bot que no se levanta. Sin fuente legible no hay entrada.
    expect(PRACTICAS_POR_FICHA['negros_panay']).toBeUndefined();
  });
});

describe('los mecanismos que no se pueden perder al reescribir', () => {
  it('en el talún-kebun la ceniza se guarda y es el primer abono', () => {
    // Es el detalle de diseño del lote: la quema no se descarta, se cosecha. El
    // paso tiene nombre propio —ngangkut lebu, acarrear la ceniza al cobertizo— y
    // esa ceniza guardada tapa los hoyos de siembra antes de que entre cualquier
    // fertilizante comprado.
    const talun = practicasDeFicha('java_bali_montano').find((p) => /Talun-kebun/.test(p.practica))!;
    expect(talun.detalle).toMatch(/ngangkut lebu/);
    expect(talun.detalle).toMatch(/primer abono/);
    // Y el barbecho son cuatro o cinco años: los 16, 24, 36 y 72 meses son las
    // parcelas que el trabajo midió, no la duración del descanso.
    expect(talun.detalle).toMatch(/cuatro o cinco/);
    expect(talun.tipo).toBe('suelo');
  });

  it('los hanunóo plantan las raíces antes de la quema porque sobreviven al fuego', () => {
    const roza = practicasDeFicha('mindoro')[0]!;
    expect(roza.detalle).toMatch(/sin quemar/);
    expect(roza.detalle).toMatch(/sobreviven a la quema/);
    expect(roza.detalle).toMatch(/media hectárea/);
    expect(roza.vigencia).toBe('historica');
  });

  it('la luz que pasa decide el abacá, y la edad del cocotero decide la luz', () => {
    // 33 % arriba del abacá bajo cocal y 11 % abajo; 36 y 9 bajo nativas. Y la
    // transmisión del cocotero va del 20 % entre los 8 y los 25 años al 50 % a los
    // 40: un cocal viejo deja luz suficiente y uno joven no. Sin eso la entrada se
    // lee como «al abacá le gusta la sombra», que no se puede usar para diseñar.
    const abaca = practicasDeFicha('mindanao_visayas_oriental')[0]!;
    expect(abaca.detalle).toMatch(/33 %/);
    expect(abaca.detalle).toMatch(/50 %/);
    expect(abaca.detalle).toMatch(/6,7 a 4,0 cm/);
  });

  it('la quema pomo dejaba afuera los manchones productivos', () => {
    // Lo que convierte esto en algo diseñable es la exclusión selectiva: el fuego
    // anual corría por el pasto y el matorral que no servía, y el arbusto que daba
    // fruto quedaba protegido. Más el dato contraintuitivo: la quema por parches
    // BAJABA el riesgo de incendio de verano sobre los caseríos.
    const quema = practicasDeFicha('california_klamath_sierra_valle').find((p) => /otoño/.test(p.practica))!;
    expect(quema.detalle).toMatch(/quedaban protegidos/);
    expect(quema.detalle).toMatch(/rayo/);
    expect(quema.detalle).toMatch(/competencia por el agua del suelo/);
  });

  it('la custodia trae su propia salvedad: los corrales bajan la talla', () => {
    // 34 conchas por hora contra 26, y tallas de 46,96 y 47,96 mm. Pero la fuente
    // dice que todas serían más grandes si no fuera por los corrales de engorde,
    // que justifican juntar conchas por debajo de la talla legal. Copiar el modelo
    // sin esa salvedad sería copiar la mitad.
    const cierres = practicasDeFicha('manglares_pacifico_suramericano').find((p) => /Custodia/.test(p.practica))!;
    expect(cierres.detalle).toMatch(/34 conchas por hora/);
    expect(cierres.detalle).toMatch(/26/);
    expect(cierres.detalle).toMatch(/corrales/);
    expect(cierres.detalle).toMatch(/45 mm/);
  });

  it('las cajas de agua no funcionan todas: el Cocoon bajó la supervivencia en Baltra', () => {
    // El dato que vuelve útil la entrada es el que contradice al folleto. Groasis
    // más que duplicó el crecimiento de Opuntia echios —que crece 2 cm al año—, y
    // el Cocoon, que es de la misma familia, bajó la supervivencia en todas las
    // especies menos Acacia macracantha.
    const cajas = practicasDeFicha('galapagos_matorral_xerico').find((p) => /caja/i.test(p.practica))!;
    expect(cajas.detalle).toMatch(/Cocoon/);
    expect(cajas.detalle).toMatch(/bajó la supervivencia/);
    expect(cajas.detalle).toMatch(/Acacia macracantha/);
    expect(cajas.detalle).toMatch(/mitad de su capacidad/);
  });

  it('el arroz del pantano de marea es un rechazo medido, no una preferencia', () => {
    const marea = practicasDeFicha('pantanos_borneo_suroeste')[0]!;
    expect(marea.detalle).toMatch(/años setenta/);
    expect(marea.detalle).toMatch(/tipo B, C y D/);
    expect(marea.detalle).toMatch(/costo/);
  });

  it('el acervo de arroz de Bukidnon está medido, no elogiado', () => {
    const arroz = practicasDeFicha('mindanao_montano')[0]!;
    expect(arroz.detalle).toMatch(/140/);
    expect(arroz.detalle).toMatch(/0,76 y 0,88/);
    expect(arroz.detalle).toMatch(/matigsalug/);
  });
});

describe('las fuentes de este lote', () => {
  const FICHAS = [
    'sumatra_montano', 'java_bali_montano', 'java_oriental_bali_bajo',
    'pantanos_borneo_suroeste', 'luzon_bajo', 'mindoro', 'mindanao_montano',
    'mindanao_visayas_oriental', 'california_klamath_sierra_valle',
    'manglares_pacifico_suramericano', 'galapagos_matorral_xerico',
  ];
  const DEL_LOTE = FICHAS.flatMap((id) => practicasDeFicha(id).flatMap((p) => p.fuentes));

  it('ninguna cuelga de un repositorio que sólo aloja', () => {
    for (const f of DEL_LOTE) {
      expect(f.url, f.label).not.toMatch(/researchgate|academia\.edu|scribd/i);
    }
  });

  it('el rótulo nombra al que publica antes del título', () => {
    for (const f of DEL_LOTE) {
      expect(f.label, f.url).toMatch(/ — /);
    }
  });

  it('son quince entradas nuevas sobre once fichas', () => {
    // 14 entradas entregadas, 15 montadas: el subak va en dos fichas.
    const esperado: Record<string, number> = {
      sumatra_montano: 2, java_bali_montano: 2, java_oriental_bali_bajo: 1,
      pantanos_borneo_suroeste: 1, luzon_bajo: 5, mindoro: 1, mindanao_montano: 1,
      mindanao_visayas_oriental: 1, california_klamath_sierra_valle: 4,
      manglares_pacifico_suramericano: 3, galapagos_matorral_xerico: 3,
    };
    for (const [id, n] of Object.entries(esperado)) {
      expect(practicasDeFicha(id), id).toHaveLength(n);
      expect(fichaPorId(id)?.practicas, id).toHaveLength(n);
    }
  });
});
