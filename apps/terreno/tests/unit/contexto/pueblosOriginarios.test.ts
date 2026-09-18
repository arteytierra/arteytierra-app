import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import {
  registroDelPunto, censoDelPunto, casarNombre, normalizarNombreAdmin,
  porcentaje, pueblosDestacados,
  FECHA_REGISTRO_AR, FUENTE_REGISTRO_AR,
} from '@/lib/pueblosOriginarios';
import { REGISTRO_AR } from '@/lib/pueblosOriginariosAr';
import { CENSO_AR, CENSO_PAIS } from '@/lib/censoIndigena2022Ar';
import type { Ubicacion } from '@/lib/entorno';

/*
 * El contrato de los pueblos originarios con comunidades registradas.
 *
 * Es la capa más delicada de las tres, porque el vacío es sobre personas. Las
 * prácticas fechadas pueden faltar y sólo se pierde un párrafo; acá, decir "no
 * hay" donde el registro no llega es afirmar algo falso sobre la gente que vive
 * en un territorio.
 *
 * Así que lo que este test defiende son tres cosas:
 *
 * 1. Que los números de la tabla sean los del registro del INAI y cierren entre
 *    sí. Son datos agregados de 1.878 filas: si un total no coincide con la
 *    suma de sus partes, la agregación se rompió y nadie lo iba a notar mirando
 *    la pantalla.
 * 2. Que el emparejamiento del departamento no invente. Un departamento
 *    equivocado es peor que ninguno, y la regla es explícita: si hay dos
 *    candidatos, no se elige.
 * 3. Que ninguna rama del panel escriba "acá no hay pueblos originarios".
 *
 * Lo que NO puede hacer: saber si el registro está completo. No lo está, y por
 * eso el texto lo dice.
 */

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..', '..');
const leer = (ruta: string) => readFileSync(join(RAIZ, ruta), 'utf8');

/** La ubicación que devuelve Nominatim, que es lo único que entra al resolvedor. */
const ubic = (u: Partial<Ubicacion>): Ubicacion => ({
  localidad: null, departamento: null, provincia: null, pais: 'Argentina', ...u,
});

const total = (f: (p: typeof REGISTRO_AR[number]) => number) =>
  REGISTRO_AR.reduce((n, p) => n + f(p), 0);

describe('la tabla del registro del INAI', () => {
  it('tiene las 1.878 comunidades de la foto del 23/02/2024, en 23 provincias', () => {
    // Los tres números salen del CSV congelado en
    // _research/pueblos-originarios-argentina/. Si el archivo se regenera con
    // una distribución nueva, este test falla y hay que actualizarlo a mano:
    // que la cifra cambie sin que nadie la mire es justamente lo que no se
    // quiere. Son 23 y no 24 porque la Ciudad de Buenos Aires no tiene
    // comunidades registradas.
    expect(REGISTRO_AR.length).toBe(23);
    expect(total(p => p.comunidades)).toBe(1878);
    expect(total(p => p.departamentos.length)).toBe(229);
    expect(FECHA_REGISTRO_AR).toBe('23 de febrero de 2024');
  });

  it('cada provincia cierra: sus departamentos suman su total', () => {
    for (const p of REGISTRO_AR) {
      const suma = p.departamentos.reduce((n, d) => n + d.comunidades, 0);
      expect(suma, `${p.provincia}: los departamentos no suman el total`).toBe(p.comunidades);
    }
  });

  it('cada provincia cierra: los estados del relevamiento suman su total', () => {
    for (const p of REGISTRO_AR) {
      const r = p.relevamiento;
      const suma = r.culminado + r.iniciado + r.en_tramite + r.sin_relevar + r.sin_dato;
      expect(suma, `${p.provincia}: el relevamiento no suma el total`).toBe(p.comunidades);
      expect(p.conPersoneria, `${p.provincia}: más personerías que comunidades`)
        .toBeLessThanOrEqual(p.comunidades);
    }
  });

  it('el relevamiento de la Ley 26.160 da los totales nacionales del registro', () => {
    expect(total(p => p.relevamiento.culminado)).toBe(989);
    expect(total(p => p.relevamiento.iniciado)).toBe(146);
    expect(total(p => p.relevamiento.en_tramite)).toBe(127);
    expect(total(p => p.relevamiento.sin_relevar)).toBe(612);
    expect(total(p => p.relevamiento.sin_dato)).toBe(4);
  });

  it('ninguna jurisdicción ni departamento figura sin pueblos ni con conteos en cero', () => {
    for (const p of REGISTRO_AR) {
      expect(p.pueblos.length, `${p.provincia} sin pueblos`).toBeGreaterThan(0);
      expect(p.comunidades).toBeGreaterThan(0);
      for (const pu of p.pueblos) {
        expect(pu.pueblo.trim().length, `${p.provincia}: pueblo sin nombre`).toBeGreaterThan(1);
        expect(pu.comunidades, `${p.provincia}/${pu.pueblo}`).toBeGreaterThan(0);
      }
      for (const d of p.departamentos) {
        expect(d.pueblos.length, `${p.provincia}/${d.departamento} sin pueblos`).toBeGreaterThan(0);
        expect(d.comunidades).toBeGreaterThan(0);
      }
    }
  });

  it('los pueblos de un departamento son pueblos de su provincia', () => {
    // Un pueblo que aparece en un departamento y no en la provincia significa
    // que las dos agregaciones se hicieron distinto, y entonces una de las dos
    // está mal.
    for (const p of REGISTRO_AR) {
      const enLaProvincia = new Set(p.pueblos.map(x => x.pueblo));
      for (const d of p.departamentos) {
        for (const pu of d.pueblos) {
          expect(enLaProvincia.has(pu.pueblo), `${p.provincia}/${d.departamento}: ${pu.pueblo} no está en la provincia`).toBe(true);
        }
      }
    }
  });

  it('la suma por pueblo puede pasar el total, y es por las comunidades con más de un pueblo', () => {
    // Salta tiene comunidades anotadas como «Wichí - Guaraní» o
    // «Wichí - Chorote»: el registro les asigna dos pueblos y las dos columnas
    // las cuentan. Por eso el conteo por pueblo nunca se muestra como un total.
    const salta = REGISTRO_AR.find(p => p.provincia === 'Salta');
    expect(salta).toBeDefined();
    const porPueblo = salta!.pueblos.reduce((n, x) => n + x.comunidades, 0);
    expect(salta!.comunidades).toBe(521);
    expect(porPueblo).toBeGreaterThan(salta!.comunidades);
  });

  it('coincide con el registro en las jurisdicciones que se pueden leer de memoria', () => {
    const porNombre = (n: string) => REGISTRO_AR.find(p => p.provincia === n);

    // Misiones: 126 comunidades y un solo pueblo en todo el registro.
    const misiones = porNombre('Misiones');
    expect(misiones?.comunidades).toBe(126);
    expect(misiones?.pueblos).toEqual([{ pueblo: 'Mbya Guaraní', comunidades: 126 }]);

    // Tierra del Fuego: dos comunidades, una de cada pueblo.
    const tdf = porNombre('Tierra del Fuego');
    expect(tdf?.comunidades).toBe(2);
    expect(tdf?.pueblos.map(p => p.pueblo).sort()).toEqual(['Selk´Nam (Onas)', 'Yagán']);

    // La Rioja: una sola comunidad registrada en toda la provincia.
    expect(porNombre('La Rioja')?.comunidades).toBe(1);

    expect(porNombre('Jujuy')?.comunidades).toBe(298);
    expect(porNombre('Formosa')?.comunidades).toBe(160);
  });

  it('escribe los pueblos como el registro y no unifica denominaciones', () => {
    // El script de armado corrige tildes y mayúsculas, nada más. Que «Rankel» y
    // «Ranquel» convivan, o «Mapuche Tehuelche» y «Tehuelche Mapuche», es la
    // decisión: que una app resuelva cómo se llama un pueblo es peor que
    // mostrar dos grafías. Si alguien las unifica, este test lo avisa.
    const rotulos = new Set(REGISTRO_AR.flatMap(p => p.pueblos.map(x => x.pueblo)));
    expect(rotulos.has('Ranquel')).toBe(true);
    expect(rotulos.has('Rankel')).toBe(true);
    expect(rotulos.has('Mapuche Tehuelche')).toBe(true);
    expect(rotulos.has('Tehuelche Mapuche')).toBe(true);
    // Lo que sí se corrige: la misma palabra sin tilde en algunas filas.
    expect(rotulos.has('Diaguita Calchaqui')).toBe(false);
    expect(rotulos.has('Diaguita Calchaquí')).toBe(true);
  });

  it('la tabla es generada y dice de dónde sale', () => {
    const generado = leer('lib/pueblosOriginariosAr.ts');
    expect(generado).toContain('GENERADO. No editar a mano.');
    expect(generado).toContain('build-pueblos-argentina.mjs');
    expect(FUENTE_REGISTRO_AR.url).toMatch(/^https:\/\/datos\.jus\.gob\.ar\//);
    expect(FUENTE_REGISTRO_AR.licencia).toBe('CC BY 4.0');
  });
});

describe('el emparejamiento del nombre administrativo', () => {
  it('le saca al nombre lo que el geocodificador agrega y el registro no', () => {
    // Nominatim devuelve los tres rótulos para el mismo campo; están
    // verificados contra el servicio, punto por punto.
    expect(normalizarNombreAdmin('Departamento Iruya')).toBe('iruya');
    expect(normalizarNombreAdmin('Partido de Tandil')).toBe('tandil');
    expect(normalizarNombreAdmin('Rivadavia')).toBe('rivadavia');
    // Y las abreviaturas con que el registro escribe seis departamentos.
    expect(normalizarNombreAdmin('Grl. José de San Martín')).toBe('general jose san martin');
    expect(normalizarNombreAdmin('Dr. Manuel Belgrano')).toBe('doctor manuel belgrano');
  });

  it('con dos candidatos posibles no elige ninguno', () => {
    // La regla que evita el peor error de esta capa. «General» es subconjunto
    // de los dos nombres, así que la respuesta es no saber.
    const candidatos = ['General San Martín', 'General Viamonte'];
    expect(casarNombre('General', candidatos, x => x)).toBeNull();
    expect(casarNombre('Partido de General Viamonte', candidatos, x => x)).toBe('General Viamonte');
  });
});

describe('qué se puede decir del punto', () => {
  it('sin ubicación no arriesga nada', () => {
    expect(registroDelPunto(null).estado).toBe('sin_ubicacion');
    expect(registroDelPunto(ubic({ pais: null })).estado).toBe('sin_ubicacion');
    expect(registroDelPunto(ubic({ provincia: null })).estado).toBe('sin_ubicacion');
  });

  it('fuera de Argentina lo dice, en vez de contestar vacío', () => {
    const r = registroDelPunto(ubic({ pais: 'Uruguay', provincia: 'Paysandú' }));
    expect(r.estado).toBe('fuera_de_argentina');
    if (r.estado === 'fuera_de_argentina') expect(r.pais).toBe('Uruguay');
  });

  it('encuentra el departamento cuando el geocodificador lo escribe distinto', () => {
    // Los dos casos salen de consultar Nominatim: en Iruya devuelve
    // «Departamento Iruya» y sobre el Pilcomayo «General San Martín», donde el
    // registro escribe «Grl. José de San Martín».
    const iruya = registroDelPunto(ubic({ provincia: 'Salta', departamento: 'Departamento Iruya' }));
    expect(iruya.estado).toBe('con_registro');
    if (iruya.estado === 'con_registro') {
      expect(iruya.provincia.provincia).toBe('Salta');
      expect(iruya.departamento?.departamento).toBe('Iruya');
      expect(iruya.departamento?.pueblos.map(p => p.pueblo)).toEqual(['Kolla']);
    }

    const sanMartin = registroDelPunto(ubic({ provincia: 'Salta', departamento: 'General San Martín' }));
    if (sanMartin.estado === 'con_registro') {
      expect(sanMartin.departamento?.departamento).toBe('Grl. José de San Martín');
    } else {
      expect.fail('no encontró el departamento abreviado');
    }
  });

  it('cuando el departamento no está en el registro, contesta la provincia y no otro departamento', () => {
    // Tandil existe y Nominatim lo devuelve, pero no hay comunidades
    // registradas ahí. La respuesta correcta es provincial.
    const r = registroDelPunto(ubic({ provincia: 'Buenos Aires', departamento: 'Partido de Tandil' }));
    expect(r.estado).toBe('con_registro');
    if (r.estado === 'con_registro') {
      expect(r.provincia.provincia).toBe('Buenos Aires');
      expect(r.departamento).toBeNull();
    }
  });

  it('la Ciudad de Buenos Aires tiene su propia respuesta', () => {
    const r = registroDelPunto(ubic({ provincia: 'Ciudad Autónoma de Buenos Aires', departamento: 'Comuna 1' }));
    expect(r.estado).toBe('sin_comunidades');
    if (r.estado === 'sin_comunidades') expect(r.jurisdiccion).toBe('Ciudad Autónoma de Buenos Aires');
  });

  it('una provincia que no reconoce no se lee como una provincia sin comunidades', () => {
    // La diferencia importa: si el geocodificador cambiara un rótulo, el error
    // silencioso sería mostrar un territorio vacío.
    const r = registroDelPunto(ubic({ provincia: 'Provincia Inventada' }));
    expect(r.estado).toBe('jurisdiccion_desconocida');
  });

  it('resuelve las 23 provincias del registro por su nombre', () => {
    for (const p of REGISTRO_AR) {
      const r = registroDelPunto(ubic({ provincia: p.provincia }));
      expect(r.estado, `${p.provincia} no resuelve`).toBe('con_registro');
    }
  });
});

describe('el panel de contexto', () => {
  const panel = leer('components/ContextoPanel.tsx');

  it('muestra la sección y la resuelve con la ubicación, no con la ecorregión', () => {
    // La sección se llama «Pueblos originarios» y adentro tiene dos rótulos,
    // uno por fuente: desde que entró el censo, el título no puede prometer
    // sólo comunidades registradas.
    expect(panel).toContain('titulo="Pueblos originarios"');
    expect(panel).toContain('Comunidades registradas · INAI');
    expect(panel).toContain('registroDelPunto(ubicacion)');
  });

  it('atiende las cinco ramas: ninguna se cae en un vacío sin explicación', () => {
    for (const estado of [
      'sin_ubicacion', 'fuera_de_argentina', 'jurisdiccion_desconocida',
      'sin_comunidades', 'con_registro',
    ]) {
      expect(panel, `el panel no atiende ${estado}`).toContain(`registro.estado === '${estado}'`);
    }
  });

  it('nunca escribe que no hay pueblos originarios', () => {
    // El texto que esta capa no puede contener. Si aparece, algo se resumió
    // mal: la ausencia en el registro es del trámite, no de la gente.
    expect(panel).not.toMatch(/no hay pueblos originarios/i);
    expect(panel).toContain('sin comunidades <em>registradas</em>');
  });

  it('muestra la fecha de la foto y la licencia junto a los números', () => {
    expect(panel).toContain('FECHA_REGISTRO_AR');
    expect(panel).toContain('FUENTE_REGISTRO_AR.licencia');
  });

  it('el informe también lo lleva, y la advertencia va pegada a los números', () => {
    // El informe se lee en voz alta delante de gente. Si los números viajan
    // sin la aclaración de qué es lo que el registro no dice, el informe
    // afirma algo que nadie escribió.
    const informe = leer('components/InformeView.tsx');
    expect(informe).toContain('Pueblos originarios con comunidades registradas');
    expect(informe).toContain("registroDelPunto(datos.entorno?.admin ?? null)");
    expect(informe).toContain('no significa que no');
    expect(informe).toContain('Ley 26.160');
  });
});

/*
 * ── El Censo 2022, que es la otra fuente ────────────────────────────────────
 *
 * Mide otra cosa: personas que se reconocen indígenas donde viven, no
 * comunidades con trámite. Los riesgos son otros dos.
 *
 * El primero es el de siempre en esta app: un número plausible y equivocado. La
 * tabla se arma de 72 planillas del INDEC, y cinco de las que publica
 * censo.gob.ar tienen adentro otra provincia —el archivo de Chubut trae
 * Formosa—. El generador lo detecta porque compara cada cuadro contra el cuadro
 * nacional; estos tests defienden ese cierre desde este lado, para que una
 * regeneración futura no meta los pueblos de una provincia en otra.
 *
 * El segundo es leer el censo como si fuera un padrón. Un tercio de quienes se
 * reconocen indígenas no declaró pueblo: la lista es lo que contestó quien
 * contestó, y la pantalla tiene que decirlo.
 */

const sumaCenso = (f: (p: typeof CENSO_AR[number]) => number) =>
  CENSO_AR.reduce((n, p) => n + f(p), 0);

describe('la tabla del Censo 2022', () => {
  it('tiene las cifras publicadas del total del país', () => {
    // Salen de los cuadros de resultados definitivos del INDEC y están
    // congeladas a propósito: si alguien regenera la tabla con otra
    // distribución, este test falla y hay que mirar el cambio a mano.
    expect(CENSO_PAIS.indigena).toBe(1306730);
    expect(CENSO_PAIS.poblacion).toBe(45618787);
    expect(CENSO_PAIS.sinInformacion).toBe(431703);
    expect(CENSO_PAIS.pueblos).toBe(58);
    expect(CENSO_AR.length).toBe(24);
    expect(sumaCenso(p => p.departamentos.length)).toBe(527);
  });

  it('las 24 jurisdicciones suman el total del país', () => {
    expect(sumaCenso(p => p.indigena)).toBe(CENSO_PAIS.indigena);
    expect(sumaCenso(p => p.poblacion)).toBe(CENSO_PAIS.poblacion);
    expect(sumaCenso(p => p.sinInformacion)).toBe(CENSO_PAIS.sinInformacion);
  });

  it('cada provincia cierra por departamento y por pueblo', () => {
    for (const p of CENSO_AR) {
      const porDepartamento = p.departamentos.reduce((n, d) => n + d.indigena, 0);
      expect(porDepartamento, `${p.provincia} no cierra por departamento`).toBe(p.indigena);
      const porPueblo = p.pueblos.reduce((n, x) => n + x.personas, 0) + p.sinInformacion;
      expect(porPueblo, `${p.provincia} no cierra por pueblo`).toBe(p.indigena);
    }
  });

  it('nadie tiene más gente indígena que habitantes', () => {
    // Un cruce mal hecho entre el cuadro de población indígena y el de
    // estructura daría justo esto, y el porcentaje saldría arriba de 100.
    for (const p of CENSO_AR) {
      expect(p.indigena, p.provincia).toBeLessThanOrEqual(p.poblacion);
      for (const d of p.departamentos) {
        expect(d.indigena, `${p.provincia} / ${d.departamento}`).toBeLessThanOrEqual(d.poblacion);
      }
    }
  });

  it('las provincias del registro del INAI están todas en el censo', () => {
    // Las dos capas se muestran juntas y se buscan por el mismo rótulo de
    // provincia. Si una tabla se regenera con otro rótulo, la sección del censo
    // desaparecería sin que nadie lo note.
    for (const p of REGISTRO_AR) {
      expect(CENSO_AR.map(c => c.provincia), `${p.provincia} no está en el censo`).toContain(p.provincia);
    }
  });

  it('los pueblos vienen del más numeroso al menos, para poder cortar la cola', () => {
    for (const p of CENSO_AR) {
      const personas = p.pueblos.map(x => x.personas);
      expect([...personas].sort((a, b) => b - a), p.provincia).toEqual(personas);
    }
  });

  it('no unifica los nombres de pueblo con los del INAI', () => {
    // El censo escribe «Qom/Toba» y el INAI «Qom (Toba)». Emparejarlos haría
    // creer que una fuente confirma a la otra, y son dos preguntas distintas
    // hechas por dos organismos distintos. Si alguien los unifica, esto falla.
    const salta = CENSO_AR.find(p => p.provincia === 'Salta')!;
    expect(salta.pueblos.map(p => p.pueblo)).toContain('Qom/Toba');
    const saltaInai = REGISTRO_AR.find(p => p.provincia === 'Salta')!;
    expect(saltaInai.pueblos.map(p => p.pueblo)).toContain('Qom (Toba)');
  });

  it('Jujuy es la de mayor proporción y Buenos Aires la de más gente', () => {
    // Dos invariantes de la publicación del INDEC que se romperían si dos
    // provincias se cruzaran entre sí, que es exactamente lo que pasa en los
    // archivos que publica censo.gob.ar.
    const porProporcion = [...CENSO_AR].sort((a, b) => b.indigena / b.poblacion - a.indigena / a.poblacion);
    expect(porProporcion[0]!.provincia).toBe('Jujuy');
    const porCantidad = [...CENSO_AR].sort((a, b) => b.indigena - a.indigena);
    expect(porCantidad[0]!.provincia).toBe('Buenos Aires');
    expect(CENSO_AR.find(p => p.provincia === 'Salta')!.indigena).toBe(142870);
  });
});

describe('el censo del punto', () => {
  it('contesta por departamento cuando el nombre casa', () => {
    const c = censoDelPunto(ubic({ provincia: 'Salta', departamento: 'Departamento Iruya' }));
    expect(c.estado).toBe('con_censo');
    if (c.estado === 'con_censo') {
      expect(c.provincia.provincia).toBe('Salta');
      expect(c.departamento?.departamento).toBe('Iruya');
    }
  });

  it('en la Ciudad de Buenos Aires el registro no tiene comunidades y el censo cuenta 74.724 personas', () => {
    // Es el caso que justifica la segunda fuente: las dos cosas son ciertas a
    // la vez. Si alguna vez una rama tapa a la otra, acá se ve.
    const u = ubic({ provincia: 'Ciudad Autónoma de Buenos Aires', departamento: 'Comuna 7' });
    expect(registroDelPunto(u).estado).toBe('sin_comunidades');
    const c = censoDelPunto(u);
    expect(c.estado).toBe('con_censo');
    if (c.estado === 'con_censo') {
      expect(c.provincia.indigena).toBe(74724);
      expect(c.departamento?.departamento).toBe('Comuna 7');
    }
  });

  it('cuando el departamento no casa, contesta la provincia y no otro departamento', () => {
    // «Rosario» es subconjunto de Rosario de Lerma y de Rosario de la Frontera:
    // entre dos candidatos no se elige.
    const c = censoDelPunto(ubic({ provincia: 'Salta', departamento: 'Rosario' }));
    expect(c.estado).toBe('con_censo');
    if (c.estado === 'con_censo') expect(c.departamento).toBeNull();
  });

  it('las tres formas de no saber son las mismas que las del registro', () => {
    expect(censoDelPunto(null).estado).toBe('sin_ubicacion');
    expect(censoDelPunto(ubic({ pais: 'Bolivia', provincia: 'La Paz' })).estado).toBe('fuera_de_argentina');
    expect(censoDelPunto(ubic({ provincia: 'Provincia Inventada' })).estado).toBe('jurisdiccion_desconocida');
  });

  it('las 24 jurisdicciones resuelven por su nombre', () => {
    for (const p of CENSO_AR) {
      expect(censoDelPunto(ubic({ provincia: p.provincia })).estado, p.provincia).toBe('con_censo');
    }
  });
});

describe('cómo se muestran los números del censo', () => {
  it('el porcentaje va con una décima y coma decimal', () => {
    expect(porcentaje(142870, 1434225)).toBe('10,0');
    expect(porcentaje(CENSO_PAIS.indigena, CENSO_PAIS.poblacion)).toBe('2,9');
  });

  it('un total en cero no devuelve Infinity ni NaN', () => {
    // Pasaría si una provincia quedara sin población: el informe imprimiría
    // «Infinity%» y nadie lo vería venir.
    expect(porcentaje(5, 0)).toBe('—');
  });

  it('la cola de pueblos se resume y se dice cuánta gente quedó afuera', () => {
    const salta = CENSO_AR.find(p => p.provincia === 'Salta')!;
    const { visibles, resto } = pueblosDestacados(salta.pueblos, 5);
    expect(visibles).toHaveLength(5);
    expect(resto.pueblos).toBe(salta.pueblos.length - 5);
    expect(visibles.reduce((n, p) => n + p.personas, 0) + resto.personas)
      .toBe(salta.pueblos.reduce((n, p) => n + p.personas, 0));
  });

  it('una provincia con pocos pueblos no tiene cola', () => {
    const { resto } = pueblosDestacados([{ pueblo: 'Mbya Guaraní', personas: 10 }], 12);
    expect(resto).toEqual({ pueblos: 0, personas: 0 });
  });
});

describe('el panel y el informe con las dos fuentes', () => {
  const panel = leer('components/ContextoPanel.tsx');
  const informe = leer('components/InformeView.tsx');

  it('el panel resuelve el censo con la misma ubicación y atiende sus ramas', () => {
    expect(panel).toContain('censoDelPunto(ubicacion)');
    for (const estado of ['sin_ubicacion', 'fuera_de_argentina', 'jurisdiccion_desconocida']) {
      expect(panel, `el panel no atiende ${estado}`).toContain(`registro.estado === '${estado}'`);
    }
    expect(panel).toContain("censo.estado === 'con_censo'");
  });

  it('distingue las dos fuentes en la pantalla', () => {
    // Si se mezclan, el lector suma comunidades con personas.
    expect(panel).toContain('Comunidades registradas · INAI');
    expect(panel).toContain('Personas que se reconocen indígenas · Censo 2022');
  });

  it('dice que el censo cuenta gente donde vive y no territorio', () => {
    // Es el malentendido posible de esta capa: leer el conteo como si dijera de
    // quién es la tierra.
    expect(panel).toMatch(/cuenta personas donde viven, no\s+territorio/);
    expect(informe).toMatch(/autorreconocimiento donde la\s+persona vive, no territorio/);
  });

  it('muestra cuánta gente no declaró pueblo, en las dos pantallas', () => {
    expect(panel).toMatch(/no declararon a qué pueblo pertenecen/);
    expect(informe).toMatch(/no\s+declararon a qué pueblo pertenecen/);
  });

  it('el informe lleva las dos secciones y cita las dos fuentes', () => {
    expect(informe).toContain('Personas que se reconocen indígenas (Censo 2022)');
    expect(informe).toContain('censoDelPunto(datos.entorno?.admin ?? null)');
    expect(informe).toContain('FUENTE_CENSO_2022.label');
    expect(informe).toContain('FUENTE_REGISTRO_AR.label');
  });
});
