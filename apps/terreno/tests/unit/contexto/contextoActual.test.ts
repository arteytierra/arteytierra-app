import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import {
  clasificar, agrupar, distanciaKm, azimutGrados, distanciaACajaKm,
  consultaOverpass, titulo, ubicacionTexto,
  RADIO_CONTEXTO_KM, ROTULO_CLASE,
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

  it('ignora lo que no es actividad industrial', () => {
    expect(clasificar({ amenity: 'school' })).toBeNull();
    expect(clasificar({ landuse: 'farmland' })).toBeNull();
    expect(clasificar({})).toBeNull();
  });

  it('la consulta no pide nada que después no sepa clasificar', () => {
    // Si alguien suma un tag a la consulta y se olvida del clasificador, los
    // elementos llegan y se tiran en silencio: se paga el tiempo de Overpass y
    // no se muestra nada. Esto lo caza.
    const q = consultaOverpass(-31.4, -64.2, RADIO_CONTEXTO_KM);
    const manMade = q.match(/man_made~"\^\(([^)]+)\)\$"/)?.[1]?.split('|') ?? [];
    expect(manMade.length).toBeGreaterThan(0);
    for (const v of manMade) {
      expect(clasificar({ man_made: v }), `man_made=${v} se pide y no se clasifica`).not.toBeNull();
    }
    for (const [, clave, valor] of [...q.matchAll(/\[(landuse|industrial|power)=([a-z_]+)\]/g)]) {
      expect(clasificar({ [clave!]: valor! }), `${clave}=${valor} se pide y no se clasifica`).not.toBeNull();
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
    ], -31.4, -64.2);
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
