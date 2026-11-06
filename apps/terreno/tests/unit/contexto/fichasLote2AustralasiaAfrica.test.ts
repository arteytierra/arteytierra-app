import { describe, expect, it } from 'vitest';

import { BIOMAS_GLOBALES } from '../../../lib/biomasGlobales';
import { BIOMAS_REGIONALES_AFRICA, BIOMAS_REGIONALES_AUSTRALASIA } from '../../../lib/biomasRegionales';
import { componerAptitud } from '../../../lib/contexto';
import { ESPECIES_POR_ID } from '../../../lib/especies';
import { fichaDeEcorregion } from '../../../lib/ecorregiones';
import { prodForrajera } from '../../../lib/produccion';
import type { BiomaFicha, ModificadorAptitud } from '../../../lib/biomaTipos';

/**
 * Los dos lotes 2 de la expansión de ecorregiones: el matorral de mulga de
 * Australia Occidental (ECO_ID 216) y el miombo seco (ECO_ID 42). Las dos
 * entregas vinieron bien hechas y a las dos hubo que corregirles cosas que sólo
 * se ven midiendo. Lo que estos tests fijan es justamente eso, porque es lo que
 * se vuelve a perder:
 *
 * 1. **Tres decisiones de polígono.** El relevamiento del bajo Murchison, que mi
 *    propio encargo invitaba a usar, cae en el ECO_ID 205 y en otro bioma; el
 *    relevamiento del Murchison se sale del 216 por su rincón suroeste; y la
 *    meseta de Makonde, sobre la que la entrega de África construyó su párrafo de
 *    suelos y dos cultivos, cae en el ECO_ID 28. Ninguna de las tres se nota
 *    leyendo: hay que preguntarle a RESOLVE por la coordenada.
 * 2. **Un error aritmético.** La entrega de África tabuló la curva logística de
 *    biomasa del rodal con las edades corridas: decía 30, 40 y 50 años con los
 *    valores de 25, 30 y 35, y para el lado que hace ver el rebrote más lento de
 *    lo que el modelo publicado dice. Acá la curva se recalcula.
 * 3. **Una unidad mal declarada en el primario.** La figura 2.7 del libro de
 *    CIFOR declara el rinde herbáceo en Mg/ha y los números sólo cierran en
 *    kg/ha. La prueba es que cualquier otra lectura se va del rango de biomasa
 *    herbácea que publica el mismo libro.
 * 4. **Dos hosts que contestan 200 y no sirven el documento.** El repositorio
 *    Epsilon de la SLU redirige cualquier ruta a la portada institucional, y
 *    ScienceDirect devuelve 403 también desde el navegador.
 */

const DESIERTO = 'resolve_desierto_matorral_xerofilo';
const SABANA = 'resolve_sabana_tropical';
const MULGA = 'mulga_australia_occidental';
const MIOMBO_SECO = 'miombo_seco';

const mulga = () => BIOMAS_REGIONALES_AUSTRALASIA[MULGA]!;
const seco = () => BIOMAS_REGIONALES_AFRICA[MIOMBO_SECO]!;

const buscar = (aptitud: ModificadorAptitud[], uso: ModificadorAptitud['uso']) =>
  aptitud.find((m) => m.uso === uso);

const global = (bioma: string, uso: ModificadorAptitud['uso']) =>
  buscar(BIOMAS_GLOBALES[bioma]!.aptitud!, uso);

const textos = (f: BiomaFicha) => [
  f.resumen, f.vegetacion, f.fauna, f.suelos,
  ...(f.aptitud ?? []).map((a) => a.razon),
];

describe('las dos fichas existen y su ECO_ID deja de caer al bioma global', () => {
  it('el 216 va a la mulga de Australia Occidental y el 42 al miombo seco', () => {
    expect(fichaDeEcorregion(216)).toBe(MULGA);
    expect(fichaDeEcorregion(42)).toBe(MIOMBO_SECO);
  });

  it('cada bloque pasa de una ficha a dos', () => {
    expect(Object.keys(BIOMAS_REGIONALES_AUSTRALASIA)).toHaveLength(2);
    expect(Object.keys(BIOMAS_REGIONALES_AFRICA)).toHaveLength(2);
  });

  it('las dos declaran el id igual que su clave y no atribuyen saberes', () => {
    expect(mulga().id).toBe(MULGA);
    expect(seco().id).toBe(MIOMBO_SECO);
    expect(mulga().saberes).toEqual([]);
    expect(seco().saberes).toEqual([]);
  });

  it('`especies` es flora y nada más, en las dos', () => {
    // El contrato de biomaTipos.ts: flora nativa, lo que crece ahí sin que nadie
    // lo plante. La entrega de Australasia traía siete entradas y tres eran
    // animales —la serpiente de mulga moteada, el eslizón del Gran Desierto y el
    // perico de Alexandra—; la de África traía el antílope sable y el alcéfalo de
    // Lichtenstein. Los cinco pasaron al campo de fauna.
    const fauna = ['Pseudechis', 'Egernia', 'Polytelis', 'Hippotragus', 'Alcelaphus', 'Dasycercus', 'Leipoa'];
    for (const f of [mulga(), seco()]) {
      for (const bicho of fauna) {
        expect(f.especies.some((e) => e.includes(bicho)), `${f.id} / ${bicho}`).toBe(false);
      }
    }
    expect(mulga().fauna).toMatch(/Pseudechis butleri/);
    expect(seco().fauna).toMatch(/Hippotragus niger/);
    expect(mulga().especies).toHaveLength(7);
    expect(seco().especies).toHaveLength(8);
  });
});

describe('el polígono decidió tres veces, y dos de las tres contra mi propio encargo', () => {
  it('el bajo Murchison es el ECO_ID 205: ni su informe ni su 78 % entran', () => {
    // Seis puntos medidos dentro de esa área de relevamiento —Kalbarri, los
    // acantilados de Zuytdorp, dos puntos interiores, el sur de Shark Bay y el
    // norte de Geraldton— dan 205, Southwest Australia savanna, bioma 12. El
    // contraste entre su 78 % de vegetación en buen estado y el 21 % de acá no
    // mide una recuperación: mide dos lugares distintos.
    const urls = mulga().fuentes.map((f) => f.url).join(' ');
    expect(urls).not.toMatch(/tech_bull\/9/);
    for (const t of textos(mulga())) {
      expect(t, t.slice(0, 40)).not.toMatch(/78 %|13\.039|bajo Murchison/i);
    }
  });

  it('y el 205 queda nombrado en el texto del archivo de ecorregiones, no en la ficha', () => {
    // La ficha no tiene por qué contarle al usuario de una ecorregión vecina. El
    // aviso vive en el comentario del código, que es donde lo va a leer quien
    // vuelva a tener la tentación.
    expect(textos(mulga()).join(' ')).not.toMatch(/205/);
  });

  it('la meseta de Makonde es el ECO_ID 28: ni su fuente ni su arroz entran', () => {
    // Dos puntos medidos en la meseta dan 28, Southern Swahili coastal forests
    // and woodlands, bioma 1. La entrega construyó ahí todo su párrafo de suelos
    // y de ahí sacó el arroz de secano y el sésamo. El arroz se cae; el sésamo se
    // sostiene porque el informe de Niassa, que sí está adentro, lo propone.
    const urls = seco().fuentes.map((f) => f.url).join(' ');
    expect(urls).not.toMatch(/kuleuven|soil-monoliths/i);
    expect(seco().cultivos).not.toContain('arroz');
    expect(seco().cultivos).toContain('sesamo');
    expect(seco().suelos).not.toMatch(/Makonde/);
  });

  it('el informe de Niassa sí está adentro y es el único suelo medido de la ficha', () => {
    const urls = seco().fuentes.map((f) => f.url).join(' ');
    expect(urls).toMatch(/biofund\.org\.mz/);
    expect(seco().suelos).toMatch(/Niassa/);
    expect(seco().suelos).toMatch(/3,84/);        // ECEC de chacra activa, 0-20 cm
    expect(seco().suelos).toMatch(/0,67/);        // la más baja, 40-60 cm
    expect(seco().suelos).toMatch(/6,5 a 7,3/);   // el pH, que no es ácido
    expect(seco().suelos).toMatch(/1\.418,4 mm/); // y el aviso de que es un rincón húmedo
  });
});

describe('los dos hosts que contestan 200 sin servir el documento', () => {
  it('ninguna fuente apunta a Epsilon de la SLU ni a ScienceDirect', () => {
    // `pub.epsilon.slu.se` devuelve 200 con 66.742 bytes de la portada del
    // portal de investigación de la SLU para cualquier ruta, incluida la del PDF
    // que la entrega citó para su mecanismo de pasturas. ScienceDirect, donde el
    // artículo está en acceso abierto híbrido, da 403 a curl y también al
    // navegador. El dato que venía de ahí —67 a 162 g/m² de biomasa herbácea— no
    // se pudo verificar y no entró: lo reemplazó el rango que publica el libro de
    // CIFOR, que es más ancho, abierto y citable.
    const urls = [...mulga().fuentes, ...seco().fuentes].map((f) => f.url).join(' ');
    expect(urls).not.toMatch(/epsilon\.slu\.se|sciencedirect/i);
    expect(seco().vegetacion).toMatch(/0,1 a 4,0 Mg\/ha/);
    expect(seco().vegetacion).toMatch(/2 a 5 %/);
  });

  it('todas las fuentes de las dos fichas son https y ninguna es de staging', () => {
    for (const f of [...mulga().fuentes, ...seco().fuentes]) {
      expect(f.url, f.label).toMatch(/^https:\/\//);
      expect(f.url, f.label).not.toMatch(/stage\.|localhost/);
      expect(f.label.length, f.url).toBeGreaterThan(12);
    }
  });
});

describe('la mulga: tres modificadores confirmados y las tres razones nuevas', () => {
  const efectiva = () => componerAptitud(mulga().aptitud, BIOMAS_GLOBALES[DESIERTO]?.aptitud);

  it('los tres deltas son los del bioma: la ficha confirma, no corrige', () => {
    for (const [uso, delta] of [['pasturas', -15], ['huerta', -25], ['reserva', 15]] as const) {
      expect(buscar(mulga().aptitud!, uso)?.delta, uso).toBe(delta);
      expect(global(DESIERTO, uso)?.delta, `global ${uso}`).toBe(delta);
      expect(buscar(efectiva(), uso)?.delta, `efectiva ${uso}`).toBe(delta);
    }
    expect(mulga().aptitud!.map((m) => m.uso)).toEqual(['pasturas', 'huerta', 'reserva']);
  });

  it('pero ninguna de las tres razones es la del bioma', () => {
    for (const uso of ['pasturas', 'huerta', 'reserva'] as const) {
      expect(buscar(mulga().aptitud!, uso)!.razon, uso).not.toBe(global(DESIERTO, uso)!.razon);
    }
  });

  it('pasturas trae la escalera de capacidades y los 76 km² de la mejor tierra', () => {
    // El reparto es la información, no el promedio: el 79 % de la superficie
    // está en 12 o 20 hectáreas por equivalente oveja seca, y el único sistema
    // con potencial pastoril muy alto son 76 km², el 0,09 %.
    const r = buscar(mulga().aptitud!, 'pasturas')!.razon;
    expect(r).toMatch(/0,09 %/);
    expect(r).toMatch(/39,1 %/);
    expect(r).toMatch(/39,8 %/);
    expect(r).toMatch(/76 km²/);
    expect(r).toMatch(/condición buena/);
    expect(r).toMatch(/invierno efectivo previo/);
  });

  it('y el dato que cambia la aritmética de un rodeo: la mitad de la presión no es del ganado', () => {
    const r = buscar(mulga().aptitud!, 'pasturas')!.razon;
    expect(r).toMatch(/menos del 50 %/);
    expect(r).toMatch(/no baja la presión a la mitad/);
    expect(mulga().fauna).toMatch(/censo aéreo/);
  });

  it('el mecanismo es explícitamente distinto del Pilbara', () => {
    // En el Pilbara el forraje vive en un octavo de la superficie. Acá los 74
    // sistemas tienen todos capacidad: lo que pasa es que la escalera es flaca
    // entera. Si alguien copia la razón del Pilbara, este test cae.
    const r = buscar(mulga().aptitud!, 'pasturas')!.razon;
    expect(r).toMatch(/distinto del Pilbara/);
    expect(r).not.toMatch(/octavo/);
  });

  it('huerta se confirma por la calidad del agua y no por su ausencia', () => {
    // El bioma dice «sin agua traída de otro lado no hay huerta». Agua hay, y es
    // con la que se desarrolló la región. La salinidad crece hacia las líneas de
    // drenaje, así que el lugar donde la app pondría la obra es el peor.
    const r = buscar(mulga().aptitud!, 'huerta')!.razon;
    expect(r).toMatch(/50\.000 mg\/L/);
    expect(r).toMatch(/divisorias/);
    expect(r).toMatch(/pozo por pozo/);
    expect(r).toMatch(/OMS/);
  });

  it('reserva se confirma por irreversibilidad, no por la costra', () => {
    const r = buscar(mulga().aptitud!, 'reserva')!.razon;
    expect(r).toMatch(/irreversiblemente desinflada/);
    expect(r).toMatch(/1\.561 km²/);
    expect(r).toMatch(/15 a 17 %/);
    // Nombra la costra sólo para decir que no es el mecanismo: lo que acá no
    // vuelve es el suelo, porque abajo hay hardpan o roca a menos de 50 cm.
    expect(r).toMatch(/el suelo mismo no vuelve/);
    expect(r).toMatch(/no hay nada abajo hacia donde erosionar/);
  });

  it('el suelo dominante entra con sus atributos medidos, no con un adjetivo', () => {
    expect(mulga().suelos).toMatch(/523/);
    expect(mulga().suelos).toMatch(/Duric Red Kandosol/);
    expect(mulga().suelos).toMatch(/muy lenta/);     // permeabilidad 0-50 cm
    expect(mulga().suelos).toMatch(/moderada/);      // fertilidad inherente
    expect(mulga().suelos).toMatch(/subsuelo salino/);
  });

  it('la lámina: el boletín no propone encauzarla, y eso está dicho', () => {
    // Era la pregunta específica del encargo y la entrega la contestó bien. En
    // 406 páginas no aparece ni un contour bank ni un water spreading; lo que
    // hay es la obra que el paisaje ya tiene y el registro de que concentrar la
    // lámina es el mecanismo de la erosión.
    expect(mulga().suelos).toMatch(/no propone/);
    expect(mulga().suelos).toMatch(/concentrated sheet flows/);
    expect(mulga().suelos).toMatch(/mulga groves/);
    expect(mulga().suelos).toMatch(/wanderrie/);
  });

  it('no declara cultivos, igual que el Pilbara, y no es un olvido', () => {
    expect(mulga().cultivos).toBeUndefined();
  });

  it('el nivel de protección de One Earth se lee como escala y no como porcentaje', () => {
    expect(mulga().resumen).toMatch(/escala de 0 a 10/);
    expect(seco().resumen).toMatch(/escala de 0 a 10/);
    for (const f of [mulga(), seco()]) {
      expect(f.resumen, f.id).not.toMatch(/1 % protegid|7 % protegid/);
    }
  });
});

describe('el miombo seco: el cero vuelve, con el primario abierto', () => {
  const efectiva = () => componerAptitud(seco().aptitud, BIOMAS_GLOBALES[SABANA]?.aptitud);

  it('el +20 del bioma queda en 0, y no por copiar el cero del miombo húmedo', () => {
    expect(global(SABANA, 'pasturas')!.delta).toBe(20);
    expect(buscar(seco().aptitud!, 'pasturas')!.delta).toBe(0);
    expect(buscar(efectiva(), 'pasturas')!.delta).toBe(0);
    const humedo = BIOMAS_REGIONALES_AFRICA['miombo_humedo_zambeziano']!;
    expect(buscar(seco().aptitud!, 'pasturas')!.razon)
      .not.toBe(buscar(humedo.aptitud!, 'pasturas')!.razon);
  });

  it('la razón trae la regresión que no es significativa, que es el hallazgo', () => {
    // A escala regional la lluvia anual no predice el estrato herbáceo del
    // miombo y la pendiente ajustada es negativa. La ficha del miombo húmedo
    // sólo podía citar eso de segunda mano, por el informe de Gorongosa.
    const r = buscar(seco().aptitud!, 'pasturas')!.razon;
    expect(r).toMatch(/0,147/);
    expect(r).toMatch(/no significativa/);
    expect(r).toMatch(/pendiente negativa/);
    expect(r).toMatch(/10 m²\/ha/);
  });

  it('y manda a mirar el dosel del punto, no la lluvia', () => {
    // La regla de la fase 4: un gradiente que la app mide es una instrucción.
    // Acá la variable que sirve no es la lluvia —que no funciona— sino la
    // cobertura leñosa, que la app también tiene.
    const r = buscar(seco().aptitud!, 'pasturas')!.razon;
    expect(r).toMatch(/cobertura leñosa del punto/);
    expect(r).toMatch(/no la lluvia/);
    expect(r).toMatch(/nadie publicó/);
  });

  it('no baja a negativo, y el motivo es propio del miombo seco', () => {
    const r = buscar(seco().aptitud!, 'pasturas')!.razon;
    expect(buscar(seco().aptitud!, 'pasturas')!.delta).toBeGreaterThanOrEqual(0);
    expect(r).toMatch(/Panicum maximum/);
    expect(r).toMatch(/tolera la seca mejor que la hierba/);
  });

  it('la huerta es un agregado declarado, no una confirmación', () => {
    // El encargo del lote decía que el bioma 7 hereda «huerta −10». No la
    // hereda: hereda `forestal −10`. Ese error era mío y la entrega contestó con
    // honestidad a una premisa falsa.
    expect(global(SABANA, 'huerta')).toBeUndefined();
    expect(buscar(seco().aptitud!, 'huerta')!.delta).toBe(-20);
    expect(buscar(seco().aptitud!, 'huerta')!.razon).toMatch(/agregado y no una confirmación/);
  });

  it('y su mecanismo es el opuesto al del miombo húmedo: acá el suelo no es ácido', () => {
    const r = buscar(seco().aptitud!, 'huerta')!.razon;
    expect(r).toMatch(/6,5 a 7,3/);
    expect(r).toMatch(/Striga/);
    expect(r).toMatch(/Faidherbia albida/);
    expect(r).toMatch(/no es cal lo que falta/);
    // Nombra el chitemene sólo para separarse de él.
    expect(r).toMatch(/no es el chitemene del miombo húmedo/);
  });

  it('el forestal se mueve de −10 a +5 porque la razón del global no aplica', () => {
    expect(global(SABANA, 'forestal')!.delta).toBe(-10);
    expect(buscar(seco().aptitud!, 'forestal')!.delta).toBe(5);
    expect(buscar(efectiva(), 'forestal')!.delta).toBe(5);
    const r = buscar(seco().aptitud!, 'forestal')!.razon;
    expect(r).toMatch(/no hay pastizal que forestar/);
    expect(r).toMatch(/18 a 20 años/);
    expect(r).toMatch(/1,2 a 2,0 Mg\/ha\/año/);
    expect(r).toMatch(/0,778 Mg\/m³/);  // la serie que no es biomasa medida
  });

  it('los tres usos están y en ese orden', () => {
    expect(seco().aptitud!.map((m) => m.uso)).toEqual(['pasturas', 'huerta', 'forestal']);
  });

  it('los once cultivos existen en el catálogo', () => {
    for (const id of seco().cultivos ?? []) {
      expect(ESPECIES_POR_ID[id], id).toBeDefined();
    }
    expect(seco().cultivos).toHaveLength(11);
    // El lablab y el poroto bambara los nombra el informe y no están en el
    // catálogo, así que no se sustituyeron por nada parecido.
    expect(seco().cultivos).not.toContain('lablab');
    expect(seco().cultivos).not.toContain('bambara');
  });
});

describe('la aritmética de la curva de rebrote, que la entrega había corrido', () => {
  /** La figura 2.9 del libro de CIFOR, verbatim: r² = 0,886, con la recta
   *  ajustada excluyendo sus dos puntos más altos. */
  const B = (t: number) => 84.20 / (1 + 28.76 * Math.pow(0.82, t));

  it('los tres valores que la ficha declara son los que da la ecuación', () => {
    // La entrega tabuló 30, 40 y 50 años con los valores de 25, 30 y 35. Si
    // alguien vuelve a escribir esa tabla, este test cae.
    expect(B(10)).toBeCloseTo(17.0, 0);
    expect(B(20)).toBeCloseTo(54.6, 0);
    expect(B(30)).toBeCloseTo(78.3, 0);
    const r = buscar(seco().aptitud!, 'forestal')!.razon;
    expect(r).toMatch(/17 Mg\/ha a los diez años/);
    expect(r).toMatch(/55 a los veinte/);
    expect(r).toMatch(/78 a los treinta/);
  });

  it('y los valores que la entrega atribuía a 30, 40 y 50 corresponden a 25, 30 y 35', () => {
    expect(B(25)).toBeCloseTo(70.1, 0);
    expect(B(30)).toBeCloseTo(78.4, 0);
    expect(B(35)).toBeCloseTo(81.9, 0);
    // O sea: a los 50 el modelo ya está en la asíntota, no en 82.
    expect(B(50)).toBeGreaterThan(84);
  });

  it('el pico del incremento anual está en 17 años y el libro lee 18 a 20', () => {
    // El incremento anual es la derivada de la curva, y para una logística
    // B = K/(1+a·r^t) tiene su máximo donde a·r^t = 1, o sea en
    // t = ln(1/28,76)/ln(0,82) = 16,9 años. El texto del libro dice que la
    // producción hace pico «at about 18-20 years», leído de su figura 2.10, que
    // la misma figura declara estimada de esta regresión. Son dos lecturas de la
    // misma fuente que no coinciden del todo, y la ficha lo dice en vez de
    // elegir una.
    const dB = (t: number) => B(t + 0.5) - B(t - 0.5);
    const pico = [...Array(60).keys()].slice(2)
      .reduce((mejor, t) => (dB(t) > dB(mejor) ? t : mejor), 2);
    expect(pico).toBeGreaterThanOrEqual(16);
    expect(pico).toBeLessThanOrEqual(18);
    expect(Math.log(1 / 28.76) / Math.log(0.82)).toBeCloseTo(16.9, 1);
    const r = buscar(seco().aptitud!, 'forestal')!.razon;
    expect(r).toMatch(/18 a 20 años/);
    expect(r).toMatch(/17/);
  });
});

describe('la unidad del rinde herbáceo, que el primario declara mal', () => {
  /** Figura 2.7 (Robertson 1984, Malaui): Y = 1878,4·A^(−0,45). El epígrafe dice
   *  Mg/ha y sólo cierra en kg/ha. */
  const Y_kg = (A: number) => 1878.4 * Math.pow(A, -0.45);
  /** Tabla 2.5: área basal leñosa contra lluvia anual, r = 0,605, p < 0,01. */
  const A = (lluvia: number) => 0.01 * lluvia + 4.14;

  it('leído en kg/ha cae dentro del rango que publica el mismo libro, y en Mg/ha no', () => {
    // El libro publica 0,1 a 4,0 Mg/ha de biomasa herbácea aérea. Con la lectura
    // en kg/ha, todo el rango de área basal del miombo entra ahí; con la lectura
    // del epígrafe, un rodal de 10 m²/ha daría 666 Mg/ha de pasto.
    for (const a of [2, 5, 10, 14, 20]) {
      expect(Y_kg(a) / 1000, `${a} m2/ha`).toBeGreaterThan(0.1);
      expect(Y_kg(a) / 1000, `${a} m2/ha`).toBeLessThan(4.0);
    }
    expect(Y_kg(10)).toBeGreaterThan(400);   // kg/ha, plausible
    expect(Y_kg(10)).toBeLessThan(4000);     // y muy lejos de 666 Mg/ha
  });

  it('compuestas las dos regresiones, más lluvia da menos pasto en este polígono', () => {
    // Composición propia, no un resultado publicado, y por eso la ficha lo dice.
    expect(A(600)).toBeCloseTo(10.14, 2);
    expect(A(1000)).toBeCloseTo(14.14, 2);
    expect(Y_kg(A(600))).toBeGreaterThan(Y_kg(A(1000)));
    expect(Y_kg(A(600))).toBeCloseTo(662, 0);
    expect(Y_kg(A(1000))).toBeCloseTo(570, 0);
    expect(seco().suelos).toMatch(/660 kg\/ha/);
    expect(seco().suelos).toMatch(/570 kg\/ha/);
  });

  it('y el aviso contra la escalera de la app está escrito, con las dos lecturas', () => {
    // A 900 mm la app dice 7.000 kg MS/ha/año y la composición publicada da 589:
    // doce veces. Corregido el rinde a producción anual con el factor de 25 a
    // 35 % que publica la misma fuente, siguen siendo unas 3,6 veces.
    expect(prodForrajera(900)).toBe(7000);
    const compuesto = Y_kg(A(900));
    expect(compuesto).toBeCloseTo(589, 0);
    expect(7000 / compuesto).toBeGreaterThan(11);
    expect(7000 / (compuesto / 0.30)).toBeGreaterThan(3.5);
    expect(seco().suelos).toMatch(/doce veces/);
    expect(seco().suelos).toMatch(/3,6 veces/);
    expect(seco().suelos).toMatch(/desconfiar/);
    expect(seco().vegetacion).toMatch(/25 a 35 %/);
  });

  it('el motor sigue sin tocarse, y es deliberado', () => {
    // Mismo trato que el vertisol del Decán y que el miombo húmedo: una tabla
    // global no se reemplaza desde una formación. Si alguien cambia la escalera,
    // este test cae y hay que venir a decidir qué pasa con el aviso.
    expect(prodForrajera(600)).toBe(3000);
    expect(prodForrajera(1000)).toBe(7000);
  });
});

describe('la escalera de capacidades del Murchison, que es un reparto y no un promedio', () => {
  it('los cinco escalones suman el 90 % del área relevada y ninguno es la mayoría', () => {
    // Contados los 66 sistemas de tierras cuyo encabezado se puede leer. Lo que
    // importa es que no hay un escalón dominante: el 79 % está repartido entre
    // 12 y 20 ha/dse, que para una oveja seca es mucho.
    const reparto = { 5: 0.09, 7: 8.87, 12: 39.10, 20: 39.80, 30: 1.99 };
    const suma = Object.values(reparto).reduce((a, b) => a + b, 0);
    expect(suma).toBeGreaterThan(89);
    expect(suma).toBeLessThan(91);
    expect(reparto[12] + reparto[20]).toBeGreaterThan(78);
    expect(Math.max(...Object.values(reparto))).toBeLessThan(50);
  });

  it('ningún texto de la ficha declara una carga única para toda la ecorregión', () => {
    // El error que el encargo pedía evitar, y el mismo que cuida la ficha del
    // Pilbara: una capacidad promedio no significa lo mismo donde lo comestible
    // es un octavo que donde es la mitad.
    for (const t of textos(mulga())) {
      expect(t, t.slice(0, 40)).not.toMatch(/la capacidad de la ecorregión|carga media de|promedio de \d+ ha/i);
    }
  });
});
