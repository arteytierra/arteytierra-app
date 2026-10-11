import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import {
  clasificar, agrupar, distanciaKm, azimutGrados, distanciaACajaKm,
  distanciaASegmentoKm, distanciaATrazaKm, tensionKv, hayTruncamiento,
  consultaOverpass, titulo, ubicacionTexto, cantidadTexto, cultivoTexto,
  RADIO_CONTEXTO_KM, RADIO_INFRAESTRUCTURA_KM, RADIO_CULTIVO_KM,
  ROTULO_CLASE, TOPE_LINEAS, TOPE_ELEMENTOS, TOPE_CULTIVOS,
  type RasgoCrudo,
} from '@/lib/contextoActual';

/*
 * El contexto actual del predio.
 *
 * Dos cosas distintas pueden salir mal acá y ninguna se estrella:
 *
 *  1. Un número equivocado. "Hay una cantera a 3 km al norte" es una frase con
 *     la que alguien decide dónde pone la huerta y de dónde toma el agua. Si la
 *     distancia está mal —o peor, si el rumbo está invertido, que es el error
 *     clásico de estas fórmulas— la app se equivoca con total aplomo. Por eso el
 *     primer bloque compara contra un caso publicado, no contra sí mismo.
 *
 *  2. Un nombre. El producto dice qué actividad hay y no de quién es, y esa
 *     decisión tiene que estar en la estructura y no en la buena intención del
 *     próximo que toque el panel. El tercer bloque le mete `name` y `operator` a
 *     los tags y exige que no salgan por ningún lado.
 *
 * Lo que este test NO puede probar: que OpenStreetMap tenga cargado lo que hay
 * en el territorio. No lo tiene, y de forma despareja. De eso se hace cargo la
 * interfaz diciendo "mapeado" en vez de "hay", y el último bloque lo vigila.
 */

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..', '..');
const leer = (ruta: string) => readFileSync(join(RAIZ, ruta), 'utf8');

describe('distancia y rumbo', () => {
  it('reproduce el caso publicado LAX → JFK', () => {
    // Ed Williams, Aviation Formulary v1.46, ejemplo del §"Distance between points":
    // LAX (33° 57′ N, 118° 24′ O) → JFK (40° 38′ N, 73° 47′ O) = 2144 millas
    // náuticas, rumbo inicial 66°.
    //
    // La tolerancia no es pereza: el formulario usa la esfera de 1' de arco por
    // milla náutica (R = 6366,7 km) y acá se usa el radio medio IUGG (6371 km).
    // Son 2,7 km de diferencia sobre 3970, y ninguno de los dos es el elipsoide.
    const LAX = { lat: 33.95, lon: -118.4 };
    const JFK = { lat: 40.633333, lon: -73.783333 };
    const publicadoKm = 2144 * 1.852;

    expect(Math.abs(distanciaKm(LAX.lat, LAX.lon, JFK.lat, JFK.lon) - publicadoKm)).toBeLessThan(5);
    expect(azimutGrados(LAX.lat, LAX.lon, JFK.lat, JFK.lon)).toBeCloseTo(66, 0);
  });

  it('los cuatro rumbos cardinales caen donde tienen que caer', () => {
    // Si alguien invierte los argumentos o mezcla radianes, esto se rompe primero.
    expect(azimutGrados(0, 0, 1, 0)).toBeCloseTo(0, 5);    // norte
    expect(azimutGrados(0, 0, 0, 1)).toBeCloseTo(90, 5);   // este
    expect(azimutGrados(0, 0, -1, 0)).toBeCloseTo(180, 5); // sur
    expect(azimutGrados(0, 0, 0, -1)).toBeCloseTo(270, 5); // oeste
  });

  it('un grado de latitud son unos 111 km', () => {
    expect(distanciaKm(0, 0, 1, 0)).toBeCloseTo(111.19, 1);
  });

  it('mide al borde del rasgo y no a su centro', () => {
    // Una cantera de un grado de lado (~111 km) cuyo centro queda lejísimos pero
    // cuyo borde está pegado. Medir al centro sería tranquilizar con un número
    // que no corresponde.
    const cantera = { minlat: -34.0, minlon: -64.0, maxlat: -33.0, maxlon: -63.0 };
    const alBorde = distanciaACajaKm(-33.5, -64.1, cantera);
    const alCentro = distanciaKm(-33.5, -64.1, -33.5, -63.5);
    expect(alBorde).toBeLessThan(10);
    expect(alCentro).toBeGreaterThan(50);
  });

  it('da cero cuando el predio cae adentro del rasgo', () => {
    const relleno = { minlat: -31.5, minlon: -64.3, maxlat: -31.4, maxlon: -64.2 };
    expect(distanciaACajaKm(-31.45, -64.25, relleno)).toBe(0);
  });
});

describe('distancia a una traza', () => {
  // Un ducto y una línea de alta tensión no están en un lugar: pasan. La
  // distancia que importa es al trazado, y es la única magnitud del módulo que
  // no sale de una fórmula entre dos puntos. Por eso arranca con un caso
  // publicado, igual que la distancia.
  const LAX = { lat: 33.95, lon: -118.4 };
  const JFK = { lat: 40.633333, lon: -73.783333 };

  it('reproduce el error de rumbo publicado del formulario de navegación', () => {
    // Ed Williams, Aviation Formulary v1.46, §"Cross track error": para el punto
    // D = N34°30′ O116°30′ sobre la ruta LAX → JFK, el error de rumbo publicado
    // es 7,4512 millas náuticas a la derecha del curso, y la distancia recorrida
    // sobre el curso hasta el pie de la perpendicular, 99,588 millas náuticas.
    //
    // Como el pie de la perpendicular cae adentro del tramo, la distancia mínima
    // del punto a la traza ES ese error de rumbo. La tolerancia sale de lo mismo
    // que en el caso LAX–JFK: el formulario usa la esfera de 1′ de arco por
    // milla náutica (R = 6366,7 km) y acá se usa el radio medio IUGG.
    const publicadoKm = 7.4512 * 1.852;
    const { km } = distanciaASegmentoKm(34.5, -116.5, LAX, JFK);
    expect(Math.abs(km - publicadoKm)).toBeLessThan(0.05);
  });

  it('el punto más cercano cae sobre el trazado y a la distancia publicada', () => {
    // La distancia sola no alcanza: el rumbo se mide hacia ese punto, así que si
    // está mal ubicado la flecha apunta a cualquier lado con la distancia bien.
    // A 99,588 nm de LAX sobre el curso, sobre el meridiano de California no.
    const { punto } = distanciaASegmentoKm(34.5, -116.5, LAX, JFK);
    expect(distanciaKm(LAX.lat, LAX.lon, punto.lat, punto.lon)).toBeCloseTo(99.588 * 1.852, 0);
    expect(distanciaKm(34.5, -116.5, punto.lat, punto.lon)).toBeCloseTo(7.4512 * 1.852, 1);
  });

  it('un tramo sobre el ecuador da la separación exacta en latitud', () => {
    // Caso analítico: el tramo va por el ecuador y el punto está 0,1° al norte
    // de su mitad. La distancia tiene que ser 0,1° de meridiano, 11,12 km.
    const a = { lat: 0, lon: 0 }, b = { lat: 0, lon: 1 };
    expect(distanciaASegmentoKm(0.1, 0.5, a, b).km).toBeCloseTo(11.12, 1);
  });

  it('cuando la perpendicular cae fuera del tramo, mide contra la punta', () => {
    // Es el chequeo que más importa y el que falta en media internet: `acos`
    // devuelve siempre positivo, así que sin mirar el signo del avance, una línea
    // que termina lejos del predio se reporta como si pasara al lado.
    const a = { lat: 0, lon: 0 }, b = { lat: 0, lon: 1 };
    expect(distanciaASegmentoKm(0, 2, a, b).km).toBeCloseTo(111.19, 1);   // pasado el final
    expect(distanciaASegmentoKm(0, -2, a, b).km).toBeCloseTo(222.39, 1);  // antes del principio
  });

  it('sobre la polilínea gana el tramo más cercano, no el primero', () => {
    // Una traza en L: el predio está pegado al segundo tramo y lejos del primero.
    const traza = [{ lat: 0, lon: 0 }, { lat: 0, lon: 1 }, { lat: 1, lon: 1 }];
    const r = distanciaATrazaKm(0.5, 1.05, traza);
    expect(r!.km).toBeCloseTo(5.56, 1);
  });

  it('una traza vacía no se ubica en el golfo de Guinea', () => {
    expect(distanciaATrazaKm(-31.4, -64.2, [])).toBeNull();
  });
});

describe('clasificación de rasgos', () => {
  it('reconoce las actividades que la consulta pide', () => {
    expect(clasificar({ landuse: 'quarry' })?.clase).toBe('mineria');
    expect(clasificar({ landuse: 'landfill' })?.clase).toBe('residuos');
    expect(clasificar({ man_made: 'petroleum_well' })?.clase).toBe('hidrocarburos');
    expect(clasificar({ man_made: 'tailings_pond' })?.clase).toBe('mineria');
    expect(clasificar({ man_made: 'works' })?.clase).toBe('industria');
    expect(clasificar({ power: 'plant' })?.clase).toBe('energia');
  });

  it('traduce el recurso y la fuente de energía, y calla si no los conoce', () => {
    expect(clasificar({ landuse: 'quarry', resource: 'gold' })?.detalle).toBe('oro');
    expect(clasificar({ power: 'plant', 'plant:source': 'coal' })?.detalle).toBe('a carbón');
    // Un valor que no está en la tabla no se muestra crudo: se omite.
    expect(clasificar({ landuse: 'quarry', resource: 'unobtanium' })?.detalle).toBeUndefined();
    expect(clasificar({ power: 'plant', 'plant:source': 'fusion' })?.detalle).toBeUndefined();
  });

  it('reconoce las trazas y dice qué llevan', () => {
    expect(clasificar({ man_made: 'pipeline' })?.clase).toBe('infraestructura');
    expect(clasificar({ man_made: 'pipeline', substance: 'gas' })?.detalle).toBe('gas');
    expect(clasificar({ man_made: 'pipeline', substance: 'slurry' })?.detalle).toBe('pulpa mineral (mineroducto)');
    expect(clasificar({ power: 'line' })?.que).toBe('Línea de alta tensión');
    // Un acueducto y un poliducto de combustible no significan lo mismo a cien
    // metros de la casa: si la sustancia no está en la tabla, se calla.
    expect(clasificar({ man_made: 'pipeline', substance: 'unobtanio' })?.detalle).toBeUndefined();
  });

  it('la tensión sale en kV y sólo si el tag parsea entero', () => {
    expect(tensionKv('132000')).toBe('132 kV');
    expect(tensionKv('500000;132000')).toBe('500 kV');  // manda la terna mayor
    expect(tensionKv('33000')).toBe('33 kV');
    // Texto libre que no es un número no se muestra crudo, aunque tenga cifras.
    expect(tensionKv('132000 (ex 33000)')).toBeUndefined();
    expect(tensionKv('alta')).toBeUndefined();
    expect(tensionKv(undefined)).toBeUndefined();
    // Fuera del rango de una línea de transmisión real.
    expect(tensionKv('220')).toBeUndefined();
    expect(tensionKv('9000000')).toBeUndefined();
  });

  it('ignora lo que no es actividad industrial', () => {
    expect(clasificar({ amenity: 'school' })).toBeNull();
    expect(clasificar({ landuse: 'farmland' })).toBeNull();
    expect(clasificar({})).toBeNull();
  });

  it('la consulta no pide nada que después no sepa clasificar', () => {
    // Si alguien suma un tag a la consulta y se olvida del clasificador, los
    // elementos llegan y se tiran en silencio: se paga el tiempo de Overpass y
    // no se muestra nada. Esto lo caza.
    //
    // Se arma el pedido entero y no cada `[clave=valor]` por separado, porque
    // dos filtros tienen una segunda condición que es la que los vuelve
    // clasificables: el tanque sólo entra si declara contenido y el campo sólo
    // entra si declara cultivo. Leer la primera condición sola diría que el
    // módulo pide basura, y lo que pide es exactamente lo que sabe leer.
    const q = consultaOverpass(-31.4, -64.2, RADIO_CONTEXTO_KM);

    // Para una condición de mera presencia —`[crop]`— hace falta un valor que la
    // satisfaga. Es el único lugar donde el test elige por su cuenta.
    const REPRESENTATIVO: Record<string, string> = { crop: 'soy' };

    // El `(` que abre cada grupo queda pegado al primer pedido, así que no se
    // ancla al principio de la línea.
    const pedidos = q.split(';').filter(s => /(nwr|way)\(around:/.test(s));
    expect(pedidos.length, 'la consulta dejó de pedir cosas').toBeGreaterThan(10);

    for (const pedido of pedidos) {
      const condiciones = [...pedido.matchAll(/\[([a-z_:]+)(?:(=|~)"?([^\]"]+)"?)?\]/g)];
      expect(condiciones.length, `pedido sin condiciones: ${pedido}`).toBeGreaterThan(0);

      // Cada alternativa de un `~"^(a|b)$"` es un caso aparte, y las condiciones
      // de un mismo pedido se combinan entre sí.
      let variantes: Record<string, string>[] = [{}];
      for (const [, clave, op, valor] of condiciones) {
        const valores = op === '~'
          ? (valor!.match(/\^\(([^)]+)\)\$/)?.[1]?.split('|') ?? [valor!])
          : op === '=' ? [valor!]
          : [REPRESENTATIVO[clave!] ?? ''];
        expect(valores[0], `falta un valor representativo para [${clave}]`).toBeTruthy();
        variantes = variantes.flatMap(v => valores.map(x => ({ ...v, [clave!]: x })));
      }

      for (const tags of variantes) {
        expect(clasificar(tags), `${JSON.stringify(tags)} se pide y no se clasifica`).not.toBeNull();
      }
    }
  });
});

describe('no se nombra a nadie', () => {
  const CON_NOMBRE: Record<string, string> = {
    landuse: 'quarry',
    resource: 'gold',
    name: 'Cantera La Esperanza',
    operator: 'Minera Ejemplo S.A.',
    'operator:wikidata': 'Q12345',
    brand: 'Ejemplo',
    ref: 'EXP-001',
    website: 'https://ejemplo.example',
  };

  it('clasificar no devuelve ningún texto que venga de los tags libres', () => {
    const et = clasificar(CON_NOMBRE);
    expect(et).not.toBeNull();
    const plano = JSON.stringify(et);
    for (const prohibido of ['Esperanza', 'Minera', 'Ejemplo', 'Q12345', 'EXP-001', 'example']) {
      expect(plano, `se filtró "${prohibido}"`).not.toContain(prohibido);
    }
  });

  it('tampoco sobrevive a la agregación, que es lo que se serializa al cliente', () => {
    const rasgos: RasgoCrudo[] = [{ tags: CON_NOMBRE, lat: -31.5, lon: -64.3 }];
    const plano = JSON.stringify(agrupar(rasgos, -31.4, -64.2));
    for (const prohibido of ['Esperanza', 'Minera', 'Q12345', 'EXP-001', 'example']) {
      expect(plano, `se filtró "${prohibido}"`).not.toContain(prohibido);
    }
  });

  it('el módulo no lee los tags de identidad en ningún lado', () => {
    // La garantía de arriba es sobre los casos que se me ocurrieron. Esta es sobre
    // todos: si el nombre no se lee, no puede salir.
    const fuente = leer('lib/contextoActual.ts');
    const codigo = fuente.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    for (const tag of ['name', 'operator', 'brand', 'website', 'ref']) {
      expect(codigo, `el código lee el tag ${tag}`).not.toMatch(new RegExp(`\\['${tag}'\\]`));
    }
  });
});

describe('agregación', () => {
  const pozo = (lat: number, lon: number): RasgoCrudo => ({ tags: { man_made: 'petroleum_well' }, lat, lon });

  it('cuenta el grupo y se queda con el más cercano', () => {
    const presencias = agrupar([pozo(-31.6, -64.2), pozo(-31.45, -64.2), pozo(-31.7, -64.2)], -31.4, -64.2);
    expect(presencias).toHaveLength(1);
    expect(presencias[0]!.cantidad).toBe(3);
    expect(presencias[0]!.dist_km).toBeCloseTo(5.6, 0);
    expect(presencias[0]!.rumbo).toBe('S');
  });

  it('separa lo que es distinto y ordena por cercanía', () => {
    const presencias = agrupar([
      { tags: { man_made: 'works' }, lat: -31.9, lon: -64.2 },
      { tags: { landuse: 'quarry', resource: 'sand' }, lat: -31.45, lon: -64.2 },
    ], -31.4, -64.2);
    expect(presencias.map(p => p.que)).toEqual(['Cantera a cielo abierto', 'Planta industrial']);
    expect(presencias[0]!.detalle).toBe('arena');
  });

  it('cuenta el polígono que llega con caja y sin centro', () => {
    // Regresión, y de las que no se notan. Overpass NO devuelve `center` y
    // `bounds` juntos: pidiéndole los dos, los ways vuelven con caja y sin
    // centro. En una prueba real sobre Añelo eso descartaba 53 de 71 rasgos
    // —todas las canteras, que son polígonos— sin un solo error: el panel
    // mostraba dieciocho pozos y ninguna cantera.
    const cantera: RasgoCrudo = {
      tags: { landuse: 'quarry' },
      bounds: { minlat: -31.46, minlon: -64.21, maxlat: -31.45, maxlon: -64.20 },
    };
    const presencias = agrupar([cantera], -31.4, -64.2);
    expect(presencias).toHaveLength(1);
    expect(presencias[0]!.dist_km).toBeGreaterThan(0);
    expect(presencias[0]!.rumbo).toBe('S');
  });

  it('la consulta no le pide a Overpass las dos formas a la vez', () => {
    const q = consultaOverpass(-31.4, -64.2, RADIO_CONTEXTO_KM);
    expect(q).toContain('out tags bb');
    expect(q, 'pedir center junto con bb deja a los ways sin centro').not.toContain('center');
  });

  it('a las trazas les pide la geometría, y en su propio radio', () => {
    const q = consultaOverpass(-31.4, -64.2, RADIO_CONTEXTO_KM);
    expect(q, 'sin `out geom` el ducto llega sin trazado y se mide contra la caja')
      .toContain(`out tags geom ${TOPE_LINEAS}`);
    expect(q).toContain(`around:${RADIO_INFRAESTRUCTURA_KM * 1000},`);
    expect(q).toContain(`around:${RADIO_CONTEXTO_KM * 1000},`);
  });

  it('mide el ducto contra su trazado y no contra su caja', () => {
    // La razón por la que los ductos estuvieron afuera del módulo, y es peor que
    // impreciso. Este ducto hace una L y su caja envolvente encierra al predio:
    // medido contra la caja, la distancia da cero y la app anuncia un gasoducto
    // lindando con el alambrado. El ducto pasa a 44 km.
    const enL: RasgoCrudo = {
      tags: { man_made: 'pipeline', substance: 'gas' },
      bounds: { minlat: -31.8, minlon: -64.9, maxlat: -31.0, maxlon: -63.5 },
      geometry: [{ lat: -31.0, lon: -64.9 }, { lat: -31.0, lon: -63.5 }, { lat: -31.8, lon: -63.5 }],
    };
    expect(distanciaACajaKm(-31.4, -64.2, enL.bounds!), 'la caja se come el predio entero').toBe(0);

    const [p] = agrupar([enL], -31.4, -64.2);
    expect(p!.dist_km, `el ducto pasa a 44 km, no lindando`).toBe(44);
    expect(p!.rumbo).toBe('N');
    expect(p!.detalle).toBe('gas');
  });

  it('la línea que pasa al lado sale con su rumbo y no con el del centro', () => {
    // De norte a sur, 500 m al este. El rumbo apunta al punto por donde pasa,
    // que es el único dato con el que alguien mueve la cortina forestal.
    const linea: RasgoCrudo = {
      tags: { power: 'line', voltage: '132000' },
      geometry: [{ lat: -31.8, lon: -64.194 }, { lat: -31.0, lon: -64.194 }],
    };
    const [p] = agrupar([linea], -31.4, -64.2);
    expect(p!.dist_km).toBeCloseTo(0.6, 1);
    expect(p!.rumbo).toBe('E');
    expect(titulo(p!)).toBe('Línea de alta tensión (132 kV)');
    expect(ubicacionTexto(p!)).toBe('a 0,6 km al E');
  });

  it('el tope de trazas se cuenta aparte del de lugares', () => {
    // Vienen mezcladas en una sola lista y los topes son distintos: si se
    // contaran juntas, 120 líneas no marcarían truncamiento y las cantidades se
    // leerían como totales cuando son un piso.
    const traza = (): RasgoCrudo => ({ tags: { power: 'line' }, geometry: [{ lat: 0, lon: 0 }, { lat: 0, lon: 1 }] });
    const pozo = (): RasgoCrudo => ({ tags: { man_made: 'petroleum_well' }, lat: 0, lon: 0 });
    expect(hayTruncamiento(Array.from({ length: TOPE_LINEAS }, traza))).toBe(true);
    expect(hayTruncamiento(Array.from({ length: TOPE_LINEAS - 1 }, traza))).toBe(false);
    expect(hayTruncamiento(Array.from({ length: TOPE_ELEMENTOS }, pozo))).toBe(true);
  });

  it('descarta el rasgo que no trae posición en vez de ubicarlo en cualquier lado', () => {
    expect(agrupar([{ tags: { landuse: 'quarry' } }], -31.4, -64.2)).toEqual([]);
  });

  it('cada clase tiene rótulo', () => {
    const clases = agrupar([
      { tags: { landuse: 'quarry' }, lat: -31.5, lon: -64.2 },
      { tags: { power: 'plant' }, lat: -31.5, lon: -64.3 },
      { tags: { landuse: 'landfill' }, lat: -31.5, lon: -64.4 },
      { tags: { man_made: 'works' }, lat: -31.5, lon: -64.5 },
      { tags: { man_made: 'flare' }, lat: -31.5, lon: -64.6 },
      { tags: { man_made: 'pipeline' }, geometry: [{ lat: -31.5, lon: -64.7 }, { lat: -31.6, lon: -64.7 }] },
    ], -31.4, -64.2);
    expect(new Set(clases.map(p => p.clase)).size).toBe(6);
    for (const p of clases) expect(ROTULO_CLASE[p.clase]).toBeTruthy();
  });
});

describe('cómo se lee', () => {
  it('arma el título con el detalle sólo cuando lo hay', () => {
    expect(titulo({ clase: 'mineria', que: 'Cantera a cielo abierto', detalle: 'oro' }))
      .toBe('Cantera a cielo abierto (oro)');
    expect(titulo({ clase: 'mineria', que: 'Mina' })).toBe('Mina');
  });

  it('dice la distancia en castellano y avisa cuando toca el predio', () => {
    const base = { clase: 'mineria', que: 'Mina', cantidad: 1 } as const;
    expect(ubicacionTexto({ ...base, dist_km: 3.4, rumbo: 'NNO' })).toBe('a 3,4 km al NNO');
    expect(ubicacionTexto({ ...base, dist_km: 18, rumbo: 'SE' })).toBe('a 18 km al SE');
    expect(ubicacionTexto({ ...base, dist_km: 0, rumbo: 'N' })).toBe('dentro del predio o lindando');
  });

  it('trece tramos de ducto no son trece ductos', () => {
    // Un solo gasoducto puede estar cargado en trece `way` de OSM porque cambia
    // de diámetro o cruza una jurisdicción. "13 ductos" es el número plausible y
    // equivocado; "13 tramos mapeados" es cierto y además dice algo.
    const ducto = { clase: 'infraestructura', que: 'Ducto', dist_km: 4.6, rumbo: 'NE' } as const;
    expect(cantidadTexto({ ...ducto, cantidad: 13 })).toBe('13 tramos mapeados');
    expect(cantidadTexto({ ...ducto, cantidad: 1 })).toBe('1 tramo mapeado');
    expect(cantidadTexto({ clase: 'hidrocarburos', que: 'Pozo', cantidad: 46, dist_km: 1.9, rumbo: 'N' }))
      .toBe('46 en el radio');
  });

  it('una traza no está adentro del predio: pasa', () => {
    // "Dentro del predio" describe una cantera. Un ducto que da cero no está
    // adentro, cruza, y lo que hay que ir a mirar entonces es la servidumbre.
    const ducto = { clase: 'infraestructura', que: 'Ducto', cantidad: 1, dist_km: 0, rumbo: 'N' } as const;
    expect(ubicacionTexto(ducto)).toBe('cruza el predio o pasa al lado');
  });
});

describe('la interfaz no afirma que no hay nada', () => {
  // Es el punto entero del módulo. OpenStreetMap se releva a mano y en buena
  // parte del continente la minería chica no está cargada: un vacío es "no está
  // mapeado", nunca "no existe". Si alguien acorta esta copia, acá se entera.
  const panel = leer('components/EntornoPanel.tsx');

  it('el panel distingue no encontrar de no poder preguntar', () => {
    expect(panel).toContain('!ctx.consultado');
    expect(panel).toContain('no se pudo preguntar');
  });

  it('el panel dice "mapeada" y explica que la cobertura es despareja', () => {
    expect(panel).toContain('mapeada');
    expect(panel).toContain('no quiere decir que no exista');
  });

  it('el informe también lo aclara, que es donde se imprime', () => {
    const informe = leer('components/InformeView.tsx');
    expect(informe).toContain('no significa que no exista');
    expect(informe).toContain('no a quien la realiza');
  });
});

/*
 * La agroindustria y el cultivo de alrededor.
 *
 * Esta capa trajo un riesgo que el resto del módulo no tenía: dos de sus tags
 * son de los más usados del planeta. `landuse=farmland` tiene 11,7 millones de
 * usos y `man_made=storage_tank` 878.000, contra los 254.000 de la cantera. Si
 * entran sin filtro, no rompen nada de forma visible: llenan el tope de
 * elementos y las canteras dejan de aparecer, con total naturalidad. Es la misma
 * familia de falla que la de `centroDe`, que escondió 53 de 71 rasgos sin tirar
 * un solo error.
 *
 * Por eso la mitad de este bloque no prueba lo que el módulo muestra, sino lo
 * que el módulo se abstiene de pedir.
 */
describe('qué se cultiva alrededor', () => {
  it('los dos nombres del maíz son el mismo cultivo', () => {
    // `corn` (19.812 usos) y `maize` (1.676) conviven en OSM para lo mismo.
    expect(cultivoTexto('corn')).toBe('maíz');
    expect(cultivoTexto('maize')).toBe('maíz');
  });

  it('traduce una rotación declarada con punto y coma', () => {
    // `wheat;barley` tiene 2.551 usos: es una rotación, no un error de carga.
    expect(cultivoTexto('wheat;barley')).toBe('trigo y cebada');
  });

  it('no traduce media rotación', () => {
    // Si un valor no está en la tabla, no se traduce ninguno: "trigo y" —o peor,
    // "trigo" a secas— diría algo que el campo no dice.
    expect(cultivoTexto('wheat;quinoa_espacial')).toBeUndefined();
  });

  it('no repite el nombre cuando los dos valores son el mismo cultivo', () => {
    expect(cultivoTexto('corn;maize')).toBe('maíz');
  });

  it('los valores que no nombran ningún cultivo no son un cultivo', () => {
    // `no` (10.330) y `yes` (9.416) suman casi 20.000 usos y no dicen qué se
    // siembra. Tampoco `mixed` ni `field_cropland`.
    for (const v of ['no', 'yes', 'mixed', 'field_cropland', '']) {
      expect(cultivoTexto(v), `crop=${v} no debería nombrar un cultivo`).toBeUndefined();
    }
  });

  it('el campo que no declara qué se siembra no entra', () => {
    // La regla del silencio aplicada al dato que casi siempre falta: que al lado
    // haya campo no es información. Qué se siembra, sí.
    expect(clasificar({ landuse: 'farmland' })).toBeNull();
    expect(clasificar({ landuse: 'farmland', crop: 'no' })).toBeNull();
  });

  it('el campo que lo declara entra con su cultivo', () => {
    const c = clasificar({ landuse: 'farmland', crop: 'soy' });
    expect(c).toEqual({ clase: 'cultivo', que: 'Campo de cultivo', detalle: 'soja' });
    expect(titulo(c!)).toBe('Campo de cultivo (soja)');
  });

  it('el viñedo no dice "(uva)"', () => {
    expect(clasificar({ landuse: 'vineyard', crop: 'grape' })).toEqual({
      clase: 'cultivo', que: 'Viñedo',
    });
  });

  it('se cuentan parcelas mapeadas y no "en el radio", porque el radio es otro', () => {
    // En la misma lista conviven los 25 km de la cantera y los 5 del cultivo.
    const p = { clase: 'cultivo' as const, que: 'Campo de cultivo', cantidad: 3, dist_km: 0.4, rumbo: 'NNO' };
    expect(cantidadTexto(p)).toBe('3 parcelas mapeadas');
    expect(cantidadTexto({ ...p, cantidad: 1 })).toBe('1 parcela mapeada');
  });
});

describe('la agroindustria, y los dos tags que había que domar', () => {
  it('el tanque de agua no es contexto industrial', () => {
    // `content=water` son 172.000 de los 878.000 usos de storage_tank.
    expect(clasificar({ man_made: 'storage_tank', content: 'water' })).toBeNull();
  });

  it('el tanque que no declara contenido tampoco', () => {
    expect(clasificar({ man_made: 'storage_tank' })).toBeNull();
  });

  it('el tanque de combustible sí, y dice qué guarda', () => {
    expect(clasificar({ man_made: 'storage_tank', content: 'fuel' })).toEqual({
      clase: 'industria', que: 'Tanque de almacenamiento', detalle: 'combustible',
    });
  });

  it('la laguna de purines entra, que es la que importa al lado de una casa', () => {
    expect(clasificar({ man_made: 'storage_tank', content: 'slurry' })?.detalle).toBe('purines');
  });

  it('silo, frigorífico, aserradero, molino e invernadero son agroindustria', () => {
    const casos: [Record<string, string>, string][] = [
      [{ man_made: 'silo' }, 'Silo'],
      [{ man_made: 'bunker_silo' }, 'Silo bunker (forraje)'],
      [{ industrial: 'slaughterhouse' }, 'Frigorífico o matadero'],
      [{ industrial: 'sawmill' }, 'Aserradero'],
      [{ industrial: 'grinding_mill' }, 'Molino'],
      [{ industrial: 'agriculture' }, 'Planta agroindustrial'],
      [{ landuse: 'greenhouse_horticulture' }, 'Invernaderos'],
      [{ landuse: 'animal_keeping' }, 'Cría de animales a corral'],
    ];
    for (const [tags, que] of casos) {
      const c = clasificar(tags);
      expect(c?.clase, JSON.stringify(tags)).toBe('agroindustria');
      expect(c?.que).toBe(que);
    }
  });

  it('el corral no se llama feedlot', () => {
    // `landuse=animal_keeping` es cría a corral en general: puede ser un piquete
    // de caballos. El tag no distingue y la app no debe inventar la diferencia.
    expect(clasificar({ landuse: 'animal_keeping' })?.que).not.toMatch(/feedlot|engorde/i);
  });

  it('la chimenea es industria y el silo no', () => {
    expect(clasificar({ man_made: 'chimney' })?.clase).toBe('industria');
    expect(clasificar({ man_made: 'silo' })?.clase).toBe('agroindustria');
  });

  it('cada clase que clasificar puede devolver tiene rótulo', () => {
    // El Record obliga en compilación; esto lo fija también en ejecución, para
    // que un rótulo vacío no pase de largo.
    for (const rotulo of Object.values(ROTULO_CLASE)) {
      expect(rotulo.length).toBeGreaterThan(3);
    }
    expect(ROTULO_CLASE.agroindustria).toBe('Agroindustria');
    expect(ROTULO_CLASE.cultivo).toContain('cultiva');
  });
});

describe('la estación transformadora, que es el nodo que le faltaba a la línea', () => {
  it('el transformador de poste no es contexto', () => {
    // 441.000 de los 631.000 que declaran clase. Es el mismo argumento por el
    // que `power=minor_line` está afuera: marcarlo sería marcar todo.
    expect(clasificar({ power: 'substation', substation: 'minor_distribution' })).toBeNull();
  });

  it('la estación que no declara de qué clase es, tampoco', () => {
    // 254.000 de los 885.000. Si nadie dijo qué es, no hay nada que contar:
    // el mismo criterio que el tanque sin contenido y que el campo sin cultivo.
    expect(clasificar({ power: 'substation' })).toBeNull();
    expect(clasificar({ power: 'substation', substation: 'yes' })).toBeNull();
  });

  it('la estación de barrio queda afuera y la de transmisión entra', () => {
    expect(clasificar({ power: 'substation', substation: 'distribution' })).toBeNull();

    const e = clasificar({ power: 'substation', substation: 'transmission', voltage: '132000' });
    expect(e?.clase).toBe('infraestructura');
    expect(e?.que).toContain('alta tensión');
    expect(e?.detalle).toBe('132 kV');
  });

  it('la de una fábrica o una central no entra, porque ya están nombradas', () => {
    // Mostrarlas pondría el mismo lugar dos veces en la lista, a la misma
    // distancia y con dos nombres: `man_made=works` y `power=plant` ya lo dicen.
    expect(clasificar({ power: 'substation', substation: 'industrial' })).toBeNull();
    expect(clasificar({ power: 'substation', substation: 'generation' })).toBeNull();
  });

  it('la tensión pasa por el mismo filtro que la de la línea', () => {
    // Un "132000 (ex 33000)" no es un entero y se cae solo, acá igual que allá.
    const sucio = clasificar({ power: 'substation', substation: 'traction', voltage: '132000 (ex 33000)' });
    expect(sucio?.que).toContain('tracción');
    expect(sucio?.detalle).toBeUndefined();

    // Y de varias ternas manda la mayor, que es la que fija la franja.
    expect(clasificar({ power: 'substation', substation: 'converter', voltage: '500000;220000' })?.detalle)
      .toBe('500 kV');
  });

  it('no nombra al operador de la estación', () => {
    // La regla de todo el módulo, fijada también acá: es una instalación con
    // dueño conocido y es justo donde la tentación de nombrarlo es mayor.
    const e = clasificar({
      power: 'substation', substation: 'transmission',
      name: 'ET Rodríguez del Busto', operator: 'Una Empresa S.A.',
    });
    expect(JSON.stringify(e)).not.toContain('Rodríguez');
    expect(JSON.stringify(e)).not.toContain('Empresa');
  });

  it('cuenta como lugar y no como cultivo ni como traza', () => {
    // Sale con `out tags bb`, sin geometry y sin landuse, así que tiene que
    // caer en el tope de lugares. Si cayera en otro, el aviso de truncamiento
    // hablaría del conjunto equivocado.
    const ets: RasgoCrudo[] = Array.from({ length: TOPE_ELEMENTOS }, (_, i) => ({
      type: 'way', id: i,
      tags: { power: 'substation', substation: 'transmission' },
      bounds: { minlat: -34.6, minlon: -58.4, maxlat: -34.59, maxlon: -58.39 },
    }));
    expect(hayTruncamiento(ets)).toBe(true);
    expect(hayTruncamiento(ets.slice(0, TOPE_CULTIVOS))).toBe(false);
  });
});

describe('lo que la consulta se abstiene de pedir', () => {
  const q = consultaOverpass(-34.6, -58.4, RADIO_CONTEXTO_KM);

  it('nunca pide el campo sin cultivo declarado', () => {
    // La prueba que sostiene todo el diseño. `landuse=farmland` son 11,7
    // millones de polígonos: pedirlo suelto llenaría el tope y las canteras
    // desaparecerían sin un solo error. Siempre va con [crop].
    expect(q).toContain('[landuse=farmland][crop]');
    expect(q).not.toMatch(/\[landuse=farmland\](?!\[crop\])/);
  });

  it('nunca pide tanques de agua', () => {
    expect(q).toContain('[man_made=storage_tank][content~');
    expect(q).not.toContain('[man_made=storage_tank];');
    expect(q).not.toMatch(/content~"[^"]*\bwater\b/);
  });

  it('la estación va en el radio de la infraestructura, no en el de la cantera', () => {
    // No es una traza —sale con los lugares, sin geometría— pero comparte con la
    // traza lo que la hace importar: restringe en vez de contaminar, y una
    // restricción a 20 km no restringe.
    const pedido = q.split(';').find(s => s.includes('[power=substation]'));
    expect(pedido, 'la consulta dejó de pedir la estación').toBeDefined();
    expect(pedido).toContain(`around:${RADIO_INFRAESTRUCTURA_KM * 1000},`);
    expect(pedido).not.toContain(`around:${RADIO_CONTEXTO_KM * 1000},`);
    // Y sigue siendo un lugar: si se colara en el conjunto de trazas, saldría
    // con `out geom` y se mediría contra un trazado que no tiene.
    expect(pedido).toMatch(/^nwr\(/);
  });

  it('nunca pide el transformador de poste', () => {
    // La otra prueba del mismo tipo que la del campo. `power=substation` son
    // 885.000 usos y 441.000 de ellos son `minor_distribution`: el poste del
    // fondo de cualquier campo. Suelto, llenaría el tope de lugares.
    expect(q).toContain('[power=substation][substation~');
    expect(q).not.toContain('[power=substation];');
    expect(q).not.toMatch(/substation~"[^"]*minor_distribution/);
    expect(q).not.toMatch(/substation~"[^"]*\bdistribution\b/);
  });

  it('los cultivos van en su propio radio, más chico que el de la cantera', () => {
    expect(RADIO_CULTIVO_KM).toBeLessThan(RADIO_CONTEXTO_KM);
    expect(q).toContain(`around:${RADIO_CULTIVO_KM * 1000},`);
    expect(q).toContain(`around:${RADIO_CONTEXTO_KM * 1000},`);
  });

  it('los tres conjuntos salen con su propio tope', () => {
    expect(q).toContain(`.lugares out tags bb ${TOPE_ELEMENTOS};`);
    expect(q).toContain(`.trazas out tags geom ${TOPE_LINEAS};`);
    expect(q).toContain(`.cultivos out tags bb ${TOPE_CULTIVOS};`);
  });

  it('el campo descartado ocupa el tope de los cultivos y no el de los lugares', () => {
    // Un campo con crop=no viajó, ocupó lugar en su conjunto y después no se
    // muestra. Contarlo como lugar avisaría de un truncamiento que no pasó.
    const campos: RasgoCrudo[] = Array.from({ length: TOPE_CULTIVOS }, () => ({
      tags: { landuse: 'farmland', crop: 'no' },
      center: { lat: -34.6, lon: -58.4 },
    }));
    expect(hayTruncamiento(campos)).toBe(true);
    expect(hayTruncamiento(campos.slice(0, 5))).toBe(false);
  });

  it('el panel avisa que el radio del cultivo es otro y que no es un modelo de deriva', () => {
    const panel = leer('components/EntornoPanel.tsx');
    // Sin los saltos de línea del JSX: si no, el test se rompe con un reformateo
    // y no con un cambio de sentido, que es lo único que acá importa.
    const texto = panel.replace(/\s+/g, ' ');
    expect(texto).toContain('RADIO_CULTIVO_KM');
    expect(texto).toContain('sólo aparecen los campos que declaran qué se siembra');
    expect(texto).toContain('no un modelo de deriva de agroquímicos');
  });
});
