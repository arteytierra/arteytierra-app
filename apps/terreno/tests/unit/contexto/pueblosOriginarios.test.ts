import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import {
  registroDelPunto, censoDelPunto, censoChilenoDelPunto, censoParaguayoDelPunto,
  censoPeruanoDelPunto,
  provinciaChilena, pueblosDeLocalidadPy, lenguasDelDepartamentoPe,
  casarNombre, normalizarNombreAdmin, porcentaje, pueblosDestacados,
  FECHA_REGISTRO_AR, FUENTE_REGISTRO_AR,
  FUENTE_CENSO_2024_CL, REGISTRO_CL_FALTANTE, PORCENTAJE_PAIS_CL,
  FUENTE_CENSO_2022_PY, REGISTRO_PY_FALTANTE, PORCENTAJE_PAIS_PY,
  FUENTE_CENSO_2017_PE, REGISTRO_PE_FALTANTE,
} from '@/lib/pueblosOriginarios';
import { REGISTRO_AR } from '@/lib/pueblosOriginariosAr';
import { CENSO_AR, CENSO_PAIS } from '@/lib/censoIndigena2022Ar';
import { CENSO_CL, CENSO_CL_PAIS, CENSO_CL_PUEBLOS } from '@/lib/censoIndigena2024Cl';
import { CENSO_PY, CENSO_PY_PAIS, CENSO_PY_PUEBLOS, PUEBLOS_PY } from '@/lib/censoIndigena2022Py';
import { CENSO_PE, CENSO_PE_PAIS, LENGUAS_PE } from '@/lib/censoIndigena2017Pe';
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

/*
 * Chile. La misma pregunta, otro país, y una sola de las dos fuentes.
 *
 * Lo que defiende este bloque, además de que los números cierren:
 *
 * 1. Que la comuna del Gran Santiago no se confunda. Nominatim devuelve
 *    `city: "Santiago"` para un punto en Ñuñoa y pone la comuna en `suburb`.
 *    Si el resolvedor mirara `city`, Ñuñoa —9.927 personas— saldría publicada
 *    con los 23.972 de la comuna de Santiago. Los casos de acá salen de
 *    consultar Nominatim de verdad, punto por punto.
 * 2. Que el denominador sea el mismo en los cuatro niveles, y que la cifra que
 *    publica el INE con su propio denominador siga estando para poder citarla.
 * 3. Que las dos listas de pueblos no se cruzen ni se sumen entre países: la
 *    chilena es cerrada y la argentina abierta.
 * 4. Que la ausencia del registro de CONADI se diga y no se tape.
 */

const ubicCl = (u: Partial<Ubicacion>): Ubicacion => ({
  localidad: null, departamento: null, provincia: null, pais: 'Chile', comuna: null, ...u,
});

describe('la tabla del Censo 2024 de Chile', () => {
  it('tiene las 16 regiones y las 346 comunas, y cierran contra el total del país', () => {
    expect(CENSO_CL).toHaveLength(16);
    expect(CENSO_CL.flatMap(r => r.comunas)).toHaveLength(346);

    const indigena = CENSO_CL.reduce((n, r) => n + r.indigena, 0);
    const poblacion = CENSO_CL.reduce((n, r) => n + r.poblacion, 0);
    expect(indigena).toBe(CENSO_CL_PAIS.indigena);
    expect(indigena).toBe(2_105_863);
    expect(poblacion).toBe(CENSO_CL_PAIS.poblacion);
    expect(poblacion).toBe(18_480_432);
  });

  it('cada región cierra por comuna y por pueblo', () => {
    for (const r of CENSO_CL) {
      const porComuna = r.comunas.reduce((n, c) => n + c.indigena, 0);
      expect(porComuna, r.region).toBe(r.indigena);

      const porPueblo = r.pueblos.reduce((n, p) => n + p.personas, 0) + r.otroPueblo + r.sinDeclarar;
      expect(porPueblo, r.region).toBe(r.indigena);

      expect(r.comunas.reduce((n, c) => n + c.poblacion, 0), r.region).toBe(r.poblacion);
    }
  });

  it('nadie tiene más gente de pueblos originarios que habitantes', () => {
    for (const r of CENSO_CL) {
      for (const c of r.comunas) {
        expect(c.indigena, `${c.comuna} (${r.region})`).toBeLessThanOrEqual(c.poblacion);
      }
    }
  });

  it('los 346 nombres de comuna son únicos, que es lo que permite buscarlos por nombre', () => {
    const nombres = CENSO_CL.flatMap(r => r.comunas.map(c => c.comuna));
    expect(new Set(nombres).size).toBe(nombres.length);
  });

  it('la lista de pueblos es cerrada: once rótulos, no los 58 de la Argentina', () => {
    expect(CENSO_CL_PAIS.pueblos).toBe(11);
    expect(CENSO_CL_PUEBLOS).toHaveLength(11);
    expect(CENSO_CL_PUEBLOS.map(p => p.pueblo)).toContain('Mapuche');
    expect(CENSO_CL_PUEBLOS.map(p => p.pueblo)).toContain('Rapa Nui');
    // «Otro» y «Pueblo no declarado» son columnas de la planilla y no pueblos.
    // Si alguna vez entran a la lista, el conteo de pueblos miente.
    expect(CENSO_CL_PUEBLOS.map(p => p.pueblo)).not.toContain('Otro');
    expect(CENSO_CL_PUEBLOS.map(p => p.pueblo)).not.toContain('Pueblo no declarado');
  });

  it('con lista cerrada casi nadie deja el pueblo sin declarar, al revés que en la Argentina', () => {
    // 2.395 sobre 2.105.863 en Chile; 431.703 sobre 1.306.730 en la Argentina.
    // Es la diferencia entre marcar una casilla y escribir una respuesta, y es
    // la razón por la que las dos listas no son comparables.
    expect(CENSO_CL_PAIS.sinDeclarar).toBe(2_395);
    expect(CENSO_CL_PAIS.sinDeclarar / CENSO_CL_PAIS.indigena).toBeLessThan(0.01);
    expect(CENSO_PAIS.sinInformacion / CENSO_PAIS.indigena).toBeGreaterThan(0.3);
    // Lo que en Chile queda afuera de la lista son los de «Otro».
    expect(CENSO_CL_PAIS.otroPueblo).toBe(20_631);
  });

  it('el universo incluye viviendas colectivas y situación de calle, al revés que el argentino', () => {
    // El INDEC cuenta población indígena sólo en viviendas particulares; el INE
    // de Chile le preguntó a toda la población censada. Por eso acá el
    // denominador es la población censada entera y no hace falta un cuadro de
    // estructura como en la Argentina.
    const suma = CENSO_CL_PAIS.viviendasParticulares
      + CENSO_CL_PAIS.viviendasColectivas
      + CENSO_CL_PAIS.situacionDeCalle;
    expect(suma).toBe(CENSO_CL_PAIS.poblacion);
    expect(CENSO_CL_PAIS.viviendasColectivas).toBeGreaterThan(0);
  });

  it('guarda la cifra que publica el INE, que sale de otro denominador', () => {
    // El INE divide por quienes respondieron la pregunta y publica 11,5%. La
    // app divide por la población censada, que es el único denominador que
    // existe por comuna, y da 11,4%. Las dos tienen que estar: la de la app
    // para comparar niveles entre sí, la del INE para citarla como está.
    expect(PORCENTAJE_PAIS_CL).toBe('11,4');
    expect(CENSO_CL_PAIS.porcentajeIne).toBe('11,5');
    expect(CENSO_CL_PAIS.respondieron).toBeLessThan(CENSO_CL_PAIS.poblacion);
    expect(porcentaje(CENSO_CL_PAIS.indigena, CENSO_CL_PAIS.respondieron)).toBe('11,5');
  });

  it('los pueblos de cada región vienen ordenados de mayor a menor', () => {
    for (const r of CENSO_CL) {
      const personas = r.pueblos.map(p => p.personas);
      expect([...personas].sort((a, b) => b - a), r.region).toEqual(personas);
    }
  });

  it('La Araucanía y la Metropolitana son las dos puntas del país', () => {
    const araucania = CENSO_CL.find(r => r.region === 'La Araucanía')!;
    const metro = CENSO_CL.find(r => r.region === 'Metropolitana de Santiago')!;
    const arica = CENSO_CL.find(r => r.region === 'Arica y Parinacota')!;

    // La mayor cantidad está en la Metropolitana, igual que en la Argentina
    // está en Buenos Aires: es donde vive más gente, no donde hay más presencia.
    expect(metro.indigena).toBe(545_700);
    expect(Math.max(...CENSO_CL.map(r => r.indigena))).toBe(metro.indigena);
    // La mayor proporción está en Arica y Parinacota, y La Araucanía tiene la
    // mayor cantidad fuera de la capital: 347.285 personas, el 34% de la región.
    expect(araucania.indigena).toBe(347_285);
    expect(porcentaje(arica.indigena, arica.poblacion)).toBe('35,9');
    expect(porcentaje(metro.indigena, metro.poblacion)).toBe('7,4');
    // En La Araucanía el pueblo con más población declarada es el mapuche.
    expect(araucania.pueblos[0]!.pueblo).toBe('Mapuche');
  });
});

describe('el censo chileno del punto', () => {
  it('resuelve la comuna cuando Nominatim la da como localidad', () => {
    // Temuco: city=Temuco, county=Provincia de Cautín, state=Región de la Araucanía.
    const r = censoChilenoDelPunto(ubicCl({
      localidad: 'Temuco', departamento: 'Provincia de Cautín', provincia: 'Región de la Araucanía',
    }));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.region.region).toBe('La Araucanía');
    expect(r.comuna?.comuna).toBe('Temuco');
    expect(r.comuna?.indigena).toBe(71_483);
    expect(r.provincia?.provincia).toBe('Cautín');
  });

  it('no confunde Ñuñoa con la comuna de Santiago, que es el error que pagaría caro', () => {
    // Nominatim: suburb=Ñuñoa, city=Santiago. Mirar `city` daría 23.972 en vez
    // de 9.927 —dos veces y media—, con la fuente citada y el número redondo.
    const nunoa = censoChilenoDelPunto(ubicCl({
      comuna: 'Ñuñoa', localidad: 'Santiago',
      departamento: 'Provincia de Santiago', provincia: 'Región Metropolitana de Santiago',
    }));
    expect(nunoa.estado).toBe('con_censo');
    if (nunoa.estado !== 'con_censo') return;
    expect(nunoa.comuna?.comuna).toBe('Ñuñoa');
    expect(nunoa.comuna?.indigena).toBe(9_927);

    // El mismo punto sin `suburb` —un payload cacheado de antes del campo— cae
    // en la comuna de Santiago. No es ideal y es lo que Nominatim dio: lo que
    // importa es que con el dato disponible no se elija mal.
    const santiago = censoChilenoDelPunto(ubicCl({
      localidad: 'Santiago', departamento: 'Provincia de Santiago',
      provincia: 'Región Metropolitana de Santiago',
    }));
    if (santiago.estado !== 'con_censo') throw new Error('debería resolver');
    expect(santiago.comuna?.indigena).toBe(23_972);
    expect(santiago.comuna?.indigena).not.toBe(nunoa.comuna?.indigena);
  });

  it('Maipú también sale del suburb, y no es la provincia que suena parecido', () => {
    const r = censoChilenoDelPunto(ubicCl({
      comuna: 'Maipú', localidad: 'Santiago',
      departamento: 'Provincia de Santiago', provincia: 'Región Metropolitana de Santiago',
    }));
    if (r.estado !== 'con_censo') throw new Error('debería resolver');
    expect(r.comuna?.comuna).toBe('Maipú');
    expect(r.comuna?.indigena).toBe(39_002);
    // La comuna de Maipú está en la provincia de Santiago. La provincia de
    // Maipo existe y son otras cuatro comunas: la provincia sale de la tabla y
    // nunca de lo que se parezca al nombre de la comuna.
    expect(r.provincia?.provincia).toBe('Santiago');
    const maipo = provinciaChilena(r.region, 'Maipo');
    expect(maipo!.comunas).toBe(4);
    expect(maipo!.indigena).not.toBe(r.provincia!.indigena);
  });

  it('las dieciséis regiones se resuelven con el rótulo que devuelve Nominatim', () => {
    // «Región de la Araucanía» contra «La Araucanía», «Región del Biobío»
    // contra «Biobío», «Región Aysén del General Carlos Ibáñez del Campo».
    const rotulos: Array<[string, string]> = [
      ['Región de Arica y Parinacota', 'Arica y Parinacota'],
      ['Región de Tarapacá', 'Tarapacá'],
      ['Región de Antofagasta', 'Antofagasta'],
      ['Región de Atacama', 'Atacama'],
      ['Región de Coquimbo', 'Coquimbo'],
      ['Región de Valparaíso', 'Valparaíso'],
      ['Región Metropolitana de Santiago', 'Metropolitana de Santiago'],
      ['Región del Libertador General Bernardo O\'Higgins', 'Libertador General Bernardo O\'Higgins'],
      ['Región del Maule', 'Maule'],
      ['Región de Ñuble', 'Ñuble'],
      ['Región del Biobío', 'Biobío'],
      ['Región de la Araucanía', 'La Araucanía'],
      ['Región de Los Ríos', 'Los Ríos'],
      ['Región de Los Lagos', 'Los Lagos'],
      ['Región Aysén del General Carlos Ibáñez del Campo', 'Aysén del General Carlos Ibáñez del Campo'],
      ['Región de Magallanes y de la Antártica Chilena', 'Magallanes y de la Antártica Chilena'],
    ];
    expect(rotulos).toHaveLength(16);
    for (const [deNominatim, delIne] of rotulos) {
      const r = censoChilenoDelPunto(ubicCl({ provincia: deNominatim }));
      expect(r.estado, deNominatim).toBe('con_censo');
      if (r.estado === 'con_censo') expect(r.region.region, deNominatim).toBe(delIne);
    }
  });

  it('cae a la provincia cuando la comuna no casa, y a la región cuando tampoco', () => {
    // Nominatim da la provincia en un campo propio, así que el respaldo es más
    // fino que en la Argentina.
    const conProvincia = censoChilenoDelPunto(ubicCl({
      localidad: 'Un paraje que no es una comuna',
      departamento: 'Provincia de Cautín', provincia: 'Región de la Araucanía',
    }));
    if (conProvincia.estado !== 'con_censo') throw new Error('debería resolver');
    expect(conProvincia.comuna).toBeNull();
    expect(conProvincia.provincia?.provincia).toBe('Cautín');
    expect(conProvincia.provincia!.comunas).toBeGreaterThan(1);

    const soloRegion = censoChilenoDelPunto(ubicCl({ provincia: 'Región de la Araucanía' }));
    if (soloRegion.estado !== 'con_censo') throw new Error('debería resolver');
    expect(soloRegion.comuna).toBeNull();
    expect(soloRegion.provincia).toBeNull();
    expect(soloRegion.region.region).toBe('La Araucanía');
  });

  it('la provincia sumada es exactamente la suma de sus comunas', () => {
    const region = CENSO_CL.find(r => r.region === 'Arica y Parinacota')!;
    const p = provinciaChilena(region, 'Parinacota');
    expect(p).not.toBeNull();
    const suyas = region.comunas.filter(c => c.provincia === 'Parinacota');
    expect(p!.comunas).toBe(suyas.length);
    expect(p!.indigena).toBe(suyas.reduce((n, c) => n + c.indigena, 0));
    expect(p!.poblacion).toBe(suyas.reduce((n, c) => n + c.poblacion, 0));
    // Una provincia que no existe no devuelve ceros: devuelve null.
    expect(provinciaChilena(region, 'Cautín')).toBeNull();
  });

  it('las tres maneras de no saber suenan igual que en la Argentina', () => {
    expect(censoChilenoDelPunto(null).estado).toBe('sin_ubicacion');
    expect(censoChilenoDelPunto(ubicCl({ pais: null })).estado).toBe('sin_ubicacion');
    expect(censoChilenoDelPunto(ubicCl({ provincia: null })).estado).toBe('sin_ubicacion');

    const afuera = censoChilenoDelPunto(ubicCl({ pais: 'Argentina', provincia: 'Salta' }));
    expect(afuera.estado).toBe('fuera_de_chile');

    const raro = censoChilenoDelPunto(ubicCl({ provincia: 'Región de Aconcagua' }));
    expect(raro.estado).toBe('region_desconocida');
  });

  it('las dos capas no se pisan: un punto argentino no resuelve censo chileno y al revés', () => {
    const enSalta = ubic({ provincia: 'Salta', departamento: 'Departamento Iruya' });
    expect(censoDelPunto(enSalta).estado).toBe('con_censo');
    expect(censoChilenoDelPunto(enSalta).estado).toBe('fuera_de_chile');

    const enTemuco = ubicCl({ localidad: 'Temuco', provincia: 'Región de la Araucanía' });
    expect(censoChilenoDelPunto(enTemuco).estado).toBe('con_censo');
    expect(censoDelPunto(enTemuco).estado).toBe('fuera_de_argentina');
  });

  it('las 346 comunas resuelven, y ninguna devuelve un número de otra', () => {
    for (const region of CENSO_CL) {
      for (const comuna of region.comunas) {
        const r = censoChilenoDelPunto(ubicCl({
          comuna: comuna.comuna, provincia: `Región de ${region.region}`,
        }));
        expect(r.estado, comuna.comuna).toBe('con_censo');
        if (r.estado !== 'con_censo') continue;
        expect(r.comuna?.codigo, comuna.comuna).toBe(comuna.codigo);
      }
    }
  });
});

describe('las dos fuentes de Chile, y la que falta', () => {
  it('dice por qué no está el registro de CONADI, en vez de omitirlo', () => {
    expect(REGISTRO_CL_FALTANTE.organismo).toContain('CONADI');
    expect(REGISTRO_CL_FALTANTE.motivo).toMatch(/licencia/);
    const panel = leer('components/ContextoPanel.tsx');
    expect(panel).toContain('REGISTRO_CL_FALTANTE.organismo');
    expect(panel).toContain('REGISTRO_CL_FALTANTE.motivo');
    expect(leer('components/InformeView.tsx')).toContain('REGISTRO_CL_FALTANTE.organismo');
  });

  it('el censo chileno viaja con su licencia, que es CompartirIgual', () => {
    // CC BY-SA 4.0 permite uso comercial y obliga a que la adaptación lleve la
    // misma licencia, así que la tabla generada tiene que declararlo.
    expect(FUENTE_CENSO_2024_CL.licencia).toBe('CC BY-SA 4.0');
    expect(leer('lib/censoIndigena2024Cl.ts')).toContain('CC BY-SA 4.0');
    expect(leer('components/ContextoPanel.tsx')).toContain('FUENTE_CENSO_2024_CL.licencia');
    expect(leer('components/InformeView.tsx')).toContain('FUENTE_CENSO_2024_CL.licencia');
  });

  it('el panel muestra el denominador del INE al lado del propio', () => {
    const panel = leer('components/ContextoPanel.tsx');
    expect(panel).toContain('CENSO_CL_PAIS.porcentajeIne');
    expect(panel).toContain('CENSO_CL_PAIS.respondieron');
    expect(panel).toMatch(/no está publicado por comuna/);
  });

  it('ya no dice que fuera de la Argentina no hay nada relevado', () => {
    const panel = leer('components/ContextoPanel.tsx');
    // La rama de «fuera de la Argentina» tiene que preguntar por las dos capas.
    // Con `censoCl.estado !== 'con_censo'` un punto chileno con la región sin
    // resolver leía las dos cosas a la vez: que no relevamos su país y que su
    // región no está entre las dieciséis. Sólo se escribe si está fuera de los
    // dos países.
    expect(panel).toContain("registro.estado === 'fuera_de_argentina' && censoCl.estado === 'fuera_de_chile'");
    expect(panel).toContain('las de Chile');
  });

  it('un punto chileno con la región sin resolver no lee que no relevamos Chile', () => {
    const raro = ubicCl({ provincia: 'Región de Aconcagua' });
    expect(censoChilenoDelPunto(raro).estado).toBe('region_desconocida');
    // La otra capa lo ve como extranjero, y esa es justamente la combinación
    // que hacía aparecer los dos mensajes contradictorios.
    expect(registroDelPunto(raro).estado).toBe('fuera_de_argentina');
  });

  it('el panel y el informe hablan de comuna en Chile y de departamento en la Argentina', () => {
    const panel = leer('components/ContextoPanel.tsx');
    expect(panel).toContain('Pertenencia a un pueblo indígena · Censo 2024 · Chile');
    expect(panel).toContain('censoCl.comuna.comuna');
    expect(panel).toMatch(/población censada/);
    const informe = leer('components/InformeView.tsx');
    expect(informe).toContain('Censo 2024, Chile');
    expect(informe).toContain('censoCl.comuna.comuna');
  });

  it('el panel dice que la lista chilena es cerrada y no la compara con la argentina', () => {
    const panel = leer('components/ContextoPanel.tsx');
    expect(panel).toMatch(/lista chilena\s*\n?\s*es cerrada|lista chilena es cerrada/);
    expect(panel).toContain('19.253');
    expect(panel).toMatch(/no se puede\s*\n?\s*comparar con la lista argentina/i);
  });

  it('nunca escribe que no hay pueblos originarios', () => {
    for (const archivo of ['components/ContextoPanel.tsx', 'components/InformeView.tsx']) {
      const texto = leer(archivo).toLowerCase();
      expect(texto, archivo).not.toMatch(/no hay pueblos originarios en/);
    }
  });

  it('el campo comuna de la ubicación sale del suburb de Nominatim', () => {
    // Sin esto la comuna del Gran Santiago no llega nunca al resolvedor.
    const ruta = leer('app/api/entorno/route.ts');
    expect(ruta).toContain("comuna: a['suburb']");
    // Y es opcional porque los payloads cacheados de antes no lo traen: el
    // resolvedor tiene que poder contestar sin él.
    expect(leer('lib/entorno.ts')).toContain('comuna?:');
  });
});

/*
 * Paraguay. La misma pregunta, el tercer país, y la primera vez que el censo
 * indígena no vive adentro del censo nacional.
 *
 * Lo que defiende este bloque, además de que los números cierren:
 *
 * 1. **Que los dos pueblos con barra en el nombre no se partan.** «Guarani
 *    Occidental / Pueblo Guarani» y «Toba Maskoy / Toba Enenlhet» son un pueblo
 *    cada uno, y la columna del cuadro A3 separa pueblos justamente con barras.
 *    Partirlas inventa cuatro pueblos y borra dos decisiones de autodenominación
 *    que el INE documentó a propósito.
 * 2. **Que no aparezca ningún porcentaje por departamento.** El numerador sale
 *    del operativo indígena y el denominador saldría del Censo Nacional: dos
 *    relevamientos, dos universos. El cociente sería creíble y no significaría
 *    lo que parece.
 * 3. **Que Asunción resuelva.** Es la única jurisdicción sin `state` en
 *    Nominatim —es el Distrito Capital— y sin su rama no contestaría nunca.
 * 4. **Que los tres departamentos donde el operativo no fue tengan su frase.**
 *    Ñeembucú existe y lo reconocemos: lo que falta es el operativo, no el
 *    departamento, y una cosa no se dice con las palabras de la otra.
 *
 * Los casos de ubicación salen de consultar Nominatim de verdad, punto por
 * punto, igual que los chilenos.
 */

const ubicPy = (u: Partial<Ubicacion>): Ubicacion => ({
  localidad: null, departamento: null, provincia: null, pais: 'Paraguay / Paraguái',
  comuna: null, ...u,
});

describe('la tabla del IV Censo Indígena 2022 de Paraguay', () => {
  it('tiene las 15 jurisdicciones, los 118 distritos y las 834 localidades', () => {
    expect(CENSO_PY).toHaveLength(15);
    expect(CENSO_PY.flatMap(d => d.distritos)).toHaveLength(118);
    const localidades = CENSO_PY.flatMap(d => d.distritos.flatMap(x => x.localidades));
    expect(localidades).toHaveLength(834);
    expect(CENSO_PY_PAIS.localidades).toBe(834);
  });

  it('el A2 y el A3 cierran entre sí, departamento por departamento', () => {
    // Son dos cuadros distintos del mismo operativo: el A2 abre por pueblo y el
    // A3 por localidad. Si no coinciden, una de las dos agregaciones se rompió
    // y nadie lo notaría mirando la pantalla.
    for (const d of CENSO_PY) {
      const porDistrito = d.distritos.reduce((n, x) => n + x.censadas, 0);
      expect(porDistrito, d.departamento).toBe(d.indigena + d.noIndigena);

      const porLocalidad = d.distritos.reduce(
        (n, x) => n + x.localidades.reduce((m, l) => m + l.censadas, 0), 0);
      expect(porLocalidad, d.departamento).toBe(porDistrito);

      const porFamilia = d.familias.reduce((n, f) => n + f.personas, 0);
      expect(porFamilia, d.departamento).toBe(d.indigena);
      for (const f of d.familias) {
        expect(f.pueblos.reduce((n, p) => n + p.personas, 0), `${d.departamento}/${f.familia}`)
          .toBe(f.personas);
      }
    }
  });

  it('el país cierra, y el total oficial no es el de estas tablas', () => {
    const indigena = CENSO_PY.reduce((n, d) => n + d.indigena, 0);
    const noIndigena = CENSO_PY.reduce((n, d) => n + d.noIndigena, 0);
    expect(indigena).toBe(CENSO_PY_PAIS.indigena);
    expect(noIndigena).toBe(CENSO_PY_PAIS.noIndigena);
    expect(noIndigena).toBe(1_245);
    // Lo que levantó el operativo indígena.
    expect(indigena + noIndigena).toBe(CENSO_PY_PAIS.operativo);
    expect(CENSO_PY_PAIS.operativo).toBe(137_547);
    // Y el total que publica el INE, que le agrega los captados por carnet.
    expect(CENSO_PY_PAIS.operativo + CENSO_PY_PAIS.porCarnet).toBe(CENSO_PY_PAIS.total);
    expect(CENSO_PY_PAIS.total).toBe(140_049);
    expect(CENSO_PY_PAIS.porCarnet).toBe(2_502);
  });

  it('el país por pueblo suma lo mismo que el país por departamento', () => {
    expect(CENSO_PY_PUEBLOS).toHaveLength(19);
    expect(CENSO_PY_PUEBLOS.reduce((n, p) => n + p.personas, 0)).toBe(CENSO_PY_PAIS.indigena);
    // Los cuatro que publica el propio INE en su informe de resultados.
    const de = (p: string) => CENSO_PY_PUEBLOS.find(x => x.pueblo === p)!.personas;
    expect(de('Mbya Guarani')).toBe(28_278);
    expect(de('Nivacle')).toBe(18_280);
    expect(de('Enlhet Norte')).toBe(9_874);
    expect(de('Guana')).toBe(556);
  });

  it('los dos pueblos con barra en el nombre son uno cada uno, y no cuatro', () => {
    // Es la trampa del cuadro A3: la columna separa pueblos con barras, y estos
    // dos rótulos traen una adentro. Si el armador la partiera, acá habría 21
    // pueblos y aparecerían «Pueblo Guarani» y «Toba Enenlhet» sueltos.
    expect(PUEBLOS_PY).toContain('Guarani Occidental / Pueblo Guarani');
    expect(PUEBLOS_PY).toContain('Toba Maskoy / Toba Enenlhet');
    expect(PUEBLOS_PY).not.toContain('Pueblo Guarani');
    expect(PUEBLOS_PY).not.toContain('Toba Enenlhet');
    expect(PUEBLOS_PY).not.toContain('Guarani Occidental');
    expect(PUEBLOS_PY).not.toContain('Toba Maskoy');
    // 19 pueblos más el rótulo de quienes no son indígenas y viven ahí.
    expect(PUEBLOS_PY).toHaveLength(20);
    expect(PUEBLOS_PY[PUEBLOS_PY.length - 1]).toBe('No indigena');
    expect(CENSO_PY_PAIS.pueblos).toBe(19);
  });

  it('las localidades sólo apuntan a pueblos que existen en la lista', () => {
    for (const d of CENSO_PY) {
      for (const x of d.distritos) {
        for (const l of x.localidades) {
          expect(l.pueblos.length, `${l.nombre} sin pueblos`).toBeGreaterThan(0);
          for (const i of l.pueblos) {
            expect(PUEBLOS_PY[i], `${l.nombre} apunta a ${i}`).toBeDefined();
          }
        }
      }
    }
  });

  it('«No indigena» no se cuela entre los pueblos de una localidad', () => {
    // La localidad más poblada del país los tiene a los dos: pueblos de verdad
    // y el rótulo. El rótulo sale de la lista y vuelve como bandera.
    const ujelhavos = CENSO_PY
      .flatMap(d => d.distritos.flatMap(x => x.localidades))
      .find(l => l.censadas === 3_107)!;
    const { pueblos, conNoIndigenas } = pueblosDeLocalidadPy(ujelhavos);
    expect(conNoIndigenas).toBe(true);
    expect(pueblos).not.toContain('No indigena');
    expect(pueblos.length).toBe(ujelhavos.pueblos.length - 1);
    expect(pueblos).toContain('Guarani Occidental / Pueblo Guarani');
  });

  it('los nombres no llevan tildes porque los archivos del INE tampoco', () => {
    // Decisión, no descuido: los cuatro CSV son ASCII puro aunque la publicación
    // escriba Nivaclé y Angaité. Se reponen el día que el INE publique una tabla
    // con tildes, y hasta entonces la pantalla lo aclara.
    const rotulos = PUEBLOS_PY.join(' ');
    expect(rotulos.normalize('NFD')).toBe(rotulos);
    expect(leer('components/ContextoPanel.tsx')).toMatch(/no traen\s*\n?\s*tildes/);
  });

  it('nadie tiene más gente indígena que censada', () => {
    for (const d of CENSO_PY) {
      expect(d.indigena, d.departamento).toBeLessThanOrEqual(d.indigena + d.noIndigena);
      for (const x of d.distritos) {
        expect(x.censadas, x.distrito).toBeGreaterThan(0);
      }
    }
  });

  it('el Chaco concentra la población, al revés que en la Argentina y en Chile', () => {
    // Presidente Hayes y Boquerón juntos son más del 40% del país, y son los dos
    // departamentos menos poblados en términos generales. Acá la mayor cantidad
    // no está donde vive más gente.
    const hayes = CENSO_PY.find(d => d.departamento === 'Presidente Hayes')!;
    const boqueron = CENSO_PY.find(d => d.departamento === 'Boqueron')!;
    expect(hayes.indigena).toBe(29_592);
    expect(boqueron.indigena).toBe(29_443);
    expect((hayes.indigena + boqueron.indigena) / CENSO_PY_PAIS.indigena).toBeGreaterThan(0.4);
  });

  it('el porcentaje del país es el único que se calcula, y con las dos puntas publicadas', () => {
    expect(PORCENTAJE_PAIS_PY).toBe('2,3');
    expect(CENSO_PY_PAIS.poblacionPais).toBe(6_109_903);
    expect(porcentaje(CENSO_PY_PAIS.total, CENSO_PY_PAIS.poblacionPais)).toBe(PORCENTAJE_PAIS_PY);
  });
});

describe('el censo paraguayo del punto', () => {
  it('resuelve el distrito cuando Nominatim lo da como localidad', () => {
    // Horqueta: town=Horqueta, state=Concepción, y ningún county.
    const r = censoParaguayoDelPunto(ubicPy({ localidad: 'Horqueta', provincia: 'Concepción' }));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.departamento.departamento).toBe('Concepcion');
    expect(r.distrito?.distrito).toBe('Horqueta');
    expect(r.distrito?.censadas).toBe(254);
  });

  it('Asunción resuelve aunque Nominatim no le dé departamento', () => {
    // Es el Distrito Capital: OSM devuelve city=Asunción y ningún state. Sin la
    // rama que la busca por localidad, la única jurisdicción urbana del censo
    // no contestaría nunca.
    const r = censoParaguayoDelPunto(ubicPy({ localidad: 'Asunción', provincia: null }));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.departamento.departamento).toBe('Asuncion');
    expect(r.departamento.indigena).toBe(404);
    expect(r.distrito?.censadas).toBe(420);
    expect(r.distrito?.localidades).toHaveLength(2);
  });

  it('el suburb de una ciudad grande no tapa al distrito', () => {
    // Ciudad del Este: suburb=Microcentro, city=Ciudad del Este. El distrito
    // sale de `localidad` y el barrio no casa con nada, que es lo correcto.
    const r = censoParaguayoDelPunto(ubicPy({
      comuna: 'Microcentro', localidad: 'Ciudad del Este', provincia: 'Alto Paraná',
    }));
    if (r.estado !== 'con_censo') throw new Error('debería resolver');
    expect(r.departamento.departamento).toBe('Alto Parana');
    expect(r.distrito?.distrito).toBe('Ciudad del Este');
    expect(r.distrito?.censadas).toBe(412);
  });

  it('los quince departamentos resuelven con el rótulo que devuelve Nominatim', () => {
    // Nominatim los escribe con tilde y el cuadro del INE sin ninguna.
    const rotulos: Array<[string, string]> = [
      ['Concepción', 'Concepcion'],
      ['San Pedro', 'San Pedro'],
      ['Guairá', 'Guaira'],
      ['Caaguazú', 'Caaguazu'],
      ['Caazapá', 'Caazapa'],
      ['Itapúa', 'Itapua'],
      ['Paraguarí', 'Paraguari'],
      ['Alto Paraná', 'Alto Parana'],
      ['Central', 'Central'],
      ['Amambay', 'Amambay'],
      ['Canindeyú', 'Canindeyu'],
      ['Presidente Hayes', 'Presidente Hayes'],
      ['Boquerón', 'Boqueron'],
      ['Alto Paraguay', 'Alto Paraguay'],
    ];
    expect(rotulos).toHaveLength(14);
    for (const [deNominatim, delIne] of rotulos) {
      const r = censoParaguayoDelPunto(ubicPy({ provincia: deNominatim }));
      expect(r.estado, deNominatim).toBe('con_censo');
      if (r.estado === 'con_censo') expect(r.departamento.departamento, deNominatim).toBe(delIne);
    }
    // La quince es Asunción, que llega por otro campo.
    const capital = censoParaguayoDelPunto(ubicPy({ localidad: 'Asunción' }));
    expect(capital.estado).toBe('con_censo');
  });

  it('los tres departamentos sin operativo tienen su propia frase', () => {
    // Pilar, San Juan Bautista y Caacupé: Nominatim devuelve el departamento
    // perfectamente y el censo no tiene comunidades ahí. Decir «no reconocemos
    // Ñeembucú» sería falso.
    for (const nombre of ['Ñeembucú', 'Misiones', 'Cordillera']) {
      const r = censoParaguayoDelPunto(ubicPy({ provincia: nombre, localidad: 'Pilar' }));
      expect(r.estado, nombre).toBe('sin_comunidades');
    }
    // Un rótulo que de verdad no conocemos sí cae en la otra rama.
    const raro = censoParaguayoDelPunto(ubicPy({ provincia: 'Departamento del Chaco Boreal' }));
    expect(raro.estado).toBe('departamento_desconocido');
  });

  it('los 118 distritos resuelven y ninguno devuelve el número de otro', () => {
    for (const d of CENSO_PY) {
      for (const x of d.distritos) {
        const r = censoParaguayoDelPunto(ubicPy({ localidad: x.distrito, provincia: d.departamento }));
        expect(r.estado, x.distrito).toBe('con_censo');
        if (r.estado !== 'con_censo') continue;
        expect(r.departamento.departamento, x.distrito).toBe(d.departamento);
        // Puede no casar —hay nombres con apóstrofo y abreviaturas—, y eso es
        // aceptable: lo que no puede es casar con el distrito equivocado.
        if (r.distrito) expect(r.distrito.distrito, x.distrito).toBe(x.distrito);
      }
    }
  });

  it('cae al departamento cuando el distrito no casa', () => {
    const r = censoParaguayoDelPunto(ubicPy({
      localidad: 'Un paraje que no es un distrito', provincia: 'Boquerón',
    }));
    if (r.estado !== 'con_censo') throw new Error('debería resolver');
    expect(r.distrito).toBeNull();
    expect(r.departamento.departamento).toBe('Boqueron');
    expect(r.departamento.indigena).toBe(29_443);
  });

  it('el país bilingüe de Nominatim no lo deja afuera', () => {
    // OSM devuelve «Paraguay / Paraguái». Con una comparación literal contra
    // «Paraguay», toda la capa no habría disparado jamás y el síntoma habría
    // sido una sección vacía, no un error.
    for (const pais of ['Paraguay / Paraguái', 'Paraguay', 'Paraguái']) {
      const r = censoParaguayoDelPunto(ubicPy({ pais, provincia: 'Boquerón' }));
      expect(r.estado, pais).toBe('con_censo');
    }
  });

  it('las tres maneras de no saber suenan igual que en los otros dos países', () => {
    expect(censoParaguayoDelPunto(null).estado).toBe('sin_ubicacion');
    expect(censoParaguayoDelPunto(ubicPy({ pais: null })).estado).toBe('sin_ubicacion');
    expect(censoParaguayoDelPunto(ubicPy({ provincia: null })).estado).toBe('sin_ubicacion');
    expect(censoParaguayoDelPunto(ubicPy({ pais: 'Argentina', provincia: 'Salta' })).estado)
      .toBe('fuera_de_paraguay');
  });

  it('las tres capas no se pisan', () => {
    const enBoqueron = ubicPy({ provincia: 'Boquerón', localidad: 'Filadelfia' });
    expect(censoParaguayoDelPunto(enBoqueron).estado).toBe('con_censo');
    expect(registroDelPunto(enBoqueron).estado).toBe('fuera_de_argentina');
    expect(censoChilenoDelPunto(enBoqueron).estado).toBe('fuera_de_chile');

    const enSalta = ubic({ provincia: 'Salta', departamento: 'Departamento Iruya' });
    expect(censoParaguayoDelPunto(enSalta).estado).toBe('fuera_de_paraguay');

    const enTemuco = ubicCl({ localidad: 'Temuco', provincia: 'Región de la Araucanía' });
    expect(censoParaguayoDelPunto(enTemuco).estado).toBe('fuera_de_paraguay');
  });
});

describe('las dos fuentes de Paraguay, y la que falta', () => {
  const panel = leer('components/ContextoPanel.tsx');
  const informe = leer('components/InformeView.tsx');

  it('no publica ningún porcentaje por departamento, y dice por qué', () => {
    // Es la decisión central de este país: el numerador sale del operativo
    // indígena y el denominador saldría del Censo Nacional. El cociente sería
    // creíble y no significaría lo que parece.
    expect(panel).not.toMatch(/porcentaje\(censoPy/);
    expect(informe).not.toMatch(/porcentaje\(censoPy/);
    expect(panel).toMatch(/Acá no va ningún porcentaje/);
    expect(informe).toMatch(/No se publica porcentaje por\s*\n?\s*departamento a propósito/);
  });

  it('dice por qué no está el registro del INDI, en vez de omitirlo', () => {
    expect(REGISTRO_PY_FALTANTE.organismo).toContain('INDI');
    expect(REGISTRO_PY_FALTANTE.motivo).toMatch(/no hay tabla, consulta ni descarga/);
    expect(panel).toContain('REGISTRO_PY_FALTANTE.organismo');
    expect(panel).toContain('REGISTRO_PY_FALTANTE.motivo');
    expect(informe).toContain('REGISTRO_PY_FALTANTE.organismo');
  });

  it('el censo paraguayo viaja con su licencia, que permite uso comercial', () => {
    expect(FUENTE_CENSO_2022_PY.licencia).toMatch(/Gobierno Paraguayo/);
    expect(FUENTE_CENSO_2022_PY.licencia).toMatch(/4064\/2015/);
    expect(leer('lib/censoIndigena2022Py.ts')).toMatch(/4064\/2015/);
    expect(panel).toContain('FUENTE_CENSO_2022_PY.licencia');
    expect(informe).toContain('FUENTE_CENSO_2022_PY.licencia');
  });

  it('las dos pantallas separan el total oficial del de las tablas', () => {
    // 140.049 y 137.547 no son el mismo número y la diferencia tiene nombre.
    for (const [archivo, texto] of [['panel', panel], ['informe', informe]] as const) {
      expect(texto, archivo).toContain('CENSO_PY_PAIS.operativo');
      expect(texto, archivo).toContain('CENSO_PY_PAIS.porCarnet');
      expect(texto, archivo).toMatch(/carnet indígena/);
    }
  });

  it('el panel nombra las comunidades del distrito, que es a lo que sirve el dato', () => {
    expect(panel).toContain('Población indígena · IV Censo Indígena 2022 · Paraguay');
    expect(panel).toContain('pueblosDeLocalidadPy');
    expect(panel).toContain('censoPy.distrito.distrito');
    expect(informe).toContain('IV Censo Indígena 2022, Paraguay');
  });

  it('explica que la barra en un nombre es un cambio de denominación', () => {
    expect(panel).toMatch(/un pueblo, no\s*\n?\s*dos/);
    expect(panel).toContain('Toba Enenlhet');
    expect(panel).toContain('Pueblo Guaraní');
    expect(informe).toMatch(/un pueblo y no dos/);
  });

  it('la rama de «fuera de todo» pregunta por los cuatro países', () => {
    // Con dos, un punto paraguayo sin departamento resuelto leía a la vez que
    // no relevamos su país y que su departamento no está entre los quince. Es
    // la misma falla que ya había aparecido con Chile, y que vuelve a aparecer
    // cada vez que se suma un país y no se suma a esta condición.
    expect(panel).toContain("censoPy.estado === 'fuera_de_paraguay'");
    expect(panel).toContain("censoPe.estado === 'fuera_de_peru'");
    expect(panel).toContain('las de Paraguay');

    const raro = ubicPy({ provincia: 'Departamento del Chaco Boreal' });
    expect(censoParaguayoDelPunto(raro).estado).toBe('departamento_desconocido');
    expect(registroDelPunto(raro).estado).toBe('fuera_de_argentina');
    expect(censoChilenoDelPunto(raro).estado).toBe('fuera_de_chile');
    expect(censoPeruanoDelPunto(raro).estado).toBe('fuera_de_peru');
  });

  it('el vacío de los tres departamentos habla del operativo y no de la gente', () => {
    expect(panel).toMatch(/Eso dice adónde fue el operativo, no que no haya/);
    expect(informe).toMatch(/Eso dice adónde fue el operativo, no que no haya gente/);
  });
});

/*
 * Perú. La misma pregunta, el cuarto país, y el primero que contesta con una
 * sola escala.
 *
 * Lo que defiende este bloque, además de que los números cierren:
 *
 * 1. **Que el denominador sea el de las personas de 12 y más años.** La
 *    pregunta 25 no se le hizo a los menores de 12. Dividir por la población
 *    total daría un porcentaje más chico, igual de creíble y de otra cosa, que
 *    es exactamente la falla que describe `lib/README.md`. Por eso el test
 *    exige que las dos pantallas escriban la edad al lado del porcentaje.
 * 2. **Que `indigena` sea la suma de los dos grupos y no otra cosa.** El INEI
 *    publica los Andes y la Amazonía separados y el total nacional de 5.984.708
 *    no es una fila de ningún cuadro.
 * 3. **Que la lengua materna no se presente como la lista de pueblos.** Son
 *    2.473.986 los indígenas andinos que declaran castellano; si la pantalla
 *    dijera «pueblos» ahí estaría afirmando algo falso sobre casi la mitad de
 *    ellos.
 * 4. **Que se diga que la respuesta es departamental y no baja.** Los anexos no
 *    abren por provincia ni por distrito, y sugerir precisión que no hay es
 *    peor que admitir el grano grueso.
 *
 * Los casos de ubicación salen de consultar Nominatim de verdad, punto por
 * punto, igual que los chilenos y los paraguayos.
 */

const ubicPe = (u: Partial<Ubicacion>): Ubicacion => ({
  localidad: null, departamento: null, provincia: null, pais: 'Perú',
  comuna: null, ...u,
});

describe('la tabla del Censo 2017 del Perú', () => {
  it('son los veinticinco departamentos, sin repetidos', () => {
    expect(CENSO_PE).toHaveLength(25);
    expect(new Set(CENSO_PE.map(d => d.departamento)).size).toBe(25);
  });

  it('los departamentos suman exactamente el país, en las tres cifras', () => {
    const suma = (f: (d: typeof CENSO_PE[number]) => number) => CENSO_PE.reduce((s, d) => s + f(d), 0);
    expect(suma(d => d.andes)).toBe(CENSO_PE_PAIS.andes);
    expect(suma(d => d.amazonia)).toBe(CENSO_PE_PAIS.amazonia);
    expect(suma(d => d.censada12)).toBe(CENSO_PE_PAIS.censada12);
  });

  it('`indigena` es la suma de los dos grupos, en el país y en cada departamento', () => {
    // El total nacional no es una fila de ningún cuadro del INEI: es esta suma,
    // y por eso se verifica en vez de copiarse.
    expect(CENSO_PE_PAIS.indigena).toBe(CENSO_PE_PAIS.andes + CENSO_PE_PAIS.amazonia);
    expect(CENSO_PE_PAIS.indigena).toBe(5984708);
    for (const d of CENSO_PE) {
      expect(d.indigena, d.departamento).toBe(d.andes + d.amazonia);
    }
  });

  it('las cuatro categorías nacionales cierran el universo de la pregunta', () => {
    // Es lo que permite sumar el denominador de tres anexos distintos sin
    // estimarlo: las cuatro son excluyentes y exhaustivas.
    const { andes, amazonia, afroperuano, resto, censada12 } = CENSO_PE_PAIS;
    expect(andes + amazonia + afroperuano + resto).toBe(censada12);
    expect(censada12).toBe(23196391);
  });

  it('la lengua materna suma la población indígena del departamento', () => {
    expect(LENGUAS_PE).toHaveLength(15);
    for (const d of CENSO_PE) {
      expect(d.lenguas, d.departamento).toHaveLength(LENGUAS_PE.length);
      expect(d.lenguas.reduce((s, n) => s + n, 0), d.departamento).toBe(d.indigena);
    }
  });

  it('ningún departamento tiene cero población indígena', () => {
    // Por eso esta capa no tiene rama de «acá no hay»: el más chico es Tumbes.
    for (const d of CENSO_PE) expect(d.indigena, d.departamento).toBeGreaterThan(0);
    const menor = [...CENSO_PE].sort((a, b) => a.indigena - b.indigena)[0];
    expect(menor?.departamento).toBe('Tumbes');
    expect(menor?.indigena).toBe(3660);
  });

  it('cada departamento tiene más gente censada que gente indígena', () => {
    for (const d of CENSO_PE) expect(d.censada12, d.departamento).toBeGreaterThan(d.indigena);
  });

  it('el grupo grande cambia de departamento en departamento', () => {
    // Promediar los dos grupos borraría justamente esto, que es lo que hace
    // distinto a un predio en Ucayali de uno en Puno.
    const de = (n: string) => CENSO_PE.find(d => d.departamento === n);
    expect(de('Puno')!.andes).toBeGreaterThan(de('Puno')!.amazonia);
    expect(de('Loreto')!.amazonia).toBeGreaterThan(de('Loreto')!.andes);
    expect(de('Ucayali')!.amazonia).toBeGreaterThan(de('Ucayali')!.andes);
  });

  it('Callao entra con su nombre largo, que es el del INEI', () => {
    expect(CENSO_PE.some(d => d.departamento === 'Provincia Constitucional del Callao')).toBe(true);
    // La abreviatura del cuadro no queda en la tabla.
    expect(CENSO_PE.some(d => d.departamento.includes('Prov.'))).toBe(false);
  });

  it('los dos pedazos de Lima no están montados como departamentos', () => {
    // «Provincia de Lima» y «Región Lima» suman Lima y el script lo comprueba,
    // pero no se montan: el geocodificador no los distingue sin riesgo.
    expect(CENSO_PE.some(d => d.departamento === 'Lima')).toBe(true);
    expect(CENSO_PE.some(d => /Provincia de Lima|Región Lima/.test(d.departamento))).toBe(false);
  });

  it('el archivo generado no tiene llamadas al pie pegadas a un nombre', () => {
    // El cuadro las escribe «Provincia de Lima 2/» y el número cambia entre
    // cuadros. Si una se coló, el cotejo entre anexos se hizo mal.
    for (const d of CENSO_PE) expect(d.departamento, d.departamento).not.toMatch(/\d\/$/);
  });
});

describe('el censo peruano del punto', () => {
  it('sin ubicación no contesta', () => {
    expect(censoPeruanoDelPunto(null).estado).toBe('sin_ubicacion');
    expect(censoPeruanoDelPunto(ubicPe({})).estado).toBe('sin_ubicacion');
  });

  it('afuera del Perú lo dice, y no dice que no haya pueblos', () => {
    const cl = censoPeruanoDelPunto({ localidad: null, departamento: null, provincia: 'Maule', pais: 'Chile' });
    expect(cl).toEqual({ estado: 'fuera_de_peru', pais: 'Chile' });
  });

  it('resuelve el departamento desde `state`, que es donde lo pone Nominatim', () => {
    // Cusco, -13.5320/-71.9675: state «Cusco».
    const r = censoPeruanoDelPunto(ubicPe({ provincia: 'Cusco', localidad: 'Wanchaq' }));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.departamento.departamento).toBe('Cusco');
    expect(r.departamento.andes).toBe(716013);
  });

  it('casa «Ancash» sin tilde contra el «Áncash» del INEI', () => {
    // Nominatim devuelve «Ancash» pelado en Huaraz, -9.5278/-77.5289, y el
    // cuadro del INEI escribe «Áncash». Sin normalizar los diacríticos el
    // departamento más poblado de la sierra norte no casaba con nada.
    const r = censoPeruanoDelPunto(ubicPe({ provincia: 'Ancash', localidad: 'Huaraz' }));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.departamento.departamento).toBe('Áncash');
  });

  it('Callao casa por el nombre corto que devuelve el geocodificador', () => {
    // -12.0566/-77.1181: state «Callao», y el censo lo escribe «Provincia
    // Constitucional del Callao». Es subconjunto de palabras y único.
    const r = censoPeruanoDelPunto(ubicPe({ provincia: 'Callao', localidad: 'Callao' }));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.departamento.departamento).toBe('Provincia Constitucional del Callao');
  });

  it('Lima resuelve al departamento y no a uno de sus pedazos', () => {
    // -12.0464/-77.0428 devuelve state «Lima» y state_district «Lima
    // Metropolitana». El segundo no se mira: a Callao, que es otro
    // departamento, Nominatim le pone el mismo state_district.
    const r = censoPeruanoDelPunto(ubicPe({
      provincia: 'Lima', departamento: 'Lima Metropolitana', localidad: 'Lima',
    }));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.departamento.departamento).toBe('Lima');
    expect(r.departamento.censada12).toBe(7782282);
  });

  it('un rótulo que no reconocemos se admite, no se rellena', () => {
    const r = censoPeruanoDelPunto(ubicPe({ provincia: 'Departamento de Tarapacá' }));
    expect(r).toEqual({ estado: 'departamento_desconocido', departamento: 'Departamento de Tarapacá' });
  });

  it('no mira el campo `departamento` de la ubicación, que en Perú es la provincia', () => {
    // En Perú los niveles están corridos: `provincia` sale de `state` y es el
    // departamento; `departamento` sale de `county` y es la provincia. Mirar el
    // segundo devolvería «Maynas» donde el censo dice «Loreto».
    const r = censoPeruanoDelPunto(ubicPe({ provincia: 'Loreto', departamento: 'Maynas', localidad: 'Iquitos' }));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.departamento.departamento).toBe('Loreto');
  });

  it('los veinticinco departamentos resuelven con su propio nombre', () => {
    for (const d of CENSO_PE) {
      const r = censoPeruanoDelPunto(ubicPe({ provincia: d.departamento }));
      expect(r.estado, d.departamento).toBe('con_censo');
    }
  });
});

describe('las lenguas maternas del departamento peruano', () => {
  const de = (n: string) => CENSO_PE.find(d => d.departamento === n)!;

  it('parte en originarias, castellano y resto, y no pierde a nadie', () => {
    for (const d of CENSO_PE) {
      const { originarias, castellano, resto } = lenguasDelDepartamentoPe(d);
      const suma = originarias.reduce((s, l) => s + l.personas, 0) + castellano + resto;
      expect(suma, d.departamento).toBe(d.indigena);
    }
  });

  it('el castellano no se cuenta entre las lenguas originarias', () => {
    for (const d of CENSO_PE) {
      const { originarias } = lenguasDelDepartamentoPe(d);
      expect(originarias.map(l => l.lengua), d.departamento).not.toContain('Castellano');
    }
  });

  it('ordena de mayor a menor y saca las que dieron cero', () => {
    const { originarias } = lenguasDelDepartamentoPe(de('Amazonas'));
    expect(originarias[0]?.lengua).toBe('Awajún/Aguaruna');
    expect(originarias[0]?.personas).toBe(28951);
    for (const l of originarias) expect(l.personas).toBeGreaterThan(0);
    for (let i = 1; i < originarias.length; i++) {
      expect(originarias[i]!.personas).toBeLessThanOrEqual(originarias[i - 1]!.personas);
    }
  });

  it('las barras de una lengua no se parten', () => {
    // «Awajún/Aguaruna» y «Shipibo/Konibo» son dos nombres de una lengua, igual
    // que las barras de los pueblos paraguayos. Partirlas inventaría lenguas.
    const { originarias } = lenguasDelDepartamentoPe(de('Ucayali'));
    expect(originarias.map(l => l.lengua)).toContain('Shipibo/Konibo');
    expect(originarias.map(l => l.lengua)).not.toContain('Shipibo');
  });

  it('el castellano es la lengua materna de la mayoría de los indígenas andinos', () => {
    // Es el número que sostiene la advertencia de la pantalla. Si alguna vez
    // deja de ser cierto, la frase hay que reescribirla.
    expect(CENSO_PE_PAIS.castellanoAndes).toBe(2473986);
    expect(CENSO_PE_PAIS.castellanoAndes / CENSO_PE_PAIS.andes).toBeGreaterThan(0.4);
  });
});

describe('las dos fuentes del Perú, y la que falta', () => {
  const panel = leer('components/ContextoPanel.tsx');
  const informe = leer('components/InformeView.tsx');

  it('el porcentaje siempre viaja con la edad del universo', () => {
    // Sin «de 12 y más años» el número es la mitad de un dato: el lector lo
    // compararía contra el de Chile o el de la Argentina, que son sobre toda la
    // población.
    expect(panel).toMatch(/de 12 y más años/);
    expect(informe).toMatch(/censadas de 12 y más\s*\n?\s*años/);
    expect(panel).toMatch(/La edad del universo no es un detalle/);
  });

  it('dice por qué no está la BDPI, en vez de omitirla', () => {
    expect(REGISTRO_PE_FALTANTE.organismo).toContain('BDPI');
    expect(REGISTRO_PE_FALTANTE.motivo).toMatch(/no declara ninguna licencia/);
    expect(panel).toContain('REGISTRO_PE_FALTANTE.organismo');
    expect(panel).toContain('REGISTRO_PE_FALTANTE.motivo');
    expect(informe).toContain('REGISTRO_PE_FALTANTE.organismo');
    expect(informe).toContain('REGISTRO_PE_FALTANTE.motivo');
  });

  it('el censo peruano viaja con la condición de uso que declara el INEI', () => {
    expect(FUENTE_CENSO_2017_PE.licencia).toMatch(/uso comercial/);
    expect(FUENTE_CENSO_2017_PE.licencia).toMatch(/INEI/);
    expect(panel).toContain('FUENTE_CENSO_2017_PE.licencia');
    expect(informe).toContain('FUENTE_CENSO_2017_PE.licencia');
  });

  it('las dos pantallas dicen que la respuesta es departamental y no baja', () => {
    expect(panel).toMatch(/Esta respuesta es departamental y no baja/);
    expect(informe).toMatch(/La respuesta es departamental/);
    expect(panel).toMatch(/no por\s*\n?\s*provincia ni por distrito/);
  });

  it('las dos pantallas aclaran que la lengua materna no es el pueblo', () => {
    expect(panel).toMatch(/La lengua materna no es el pueblo/);
    expect(informe).toMatch(/La lengua\s*\n?\s*materna no es el pueblo/);
    expect(panel).toContain('CENSO_PE_PAIS.castellanoAndes');
  });

  it('las dos pantallas abren los dos grupos en vez de mostrar sólo el total', () => {
    for (const [archivo, texto] of [['panel', panel], ['informe', informe]] as const) {
      expect(texto, archivo).toContain('censoPe.departamento.andes');
      expect(texto, archivo).toContain('censoPe.departamento.amazonia');
    }
  });

  it('ninguna rama peruana dice que no haya pueblos originarios', () => {
    // La misma regla que en los otros tres países: el vacío es sobre personas.
    const raro = censoPeruanoDelPunto(ubicPe({ provincia: 'Tarapacá' }));
    expect(raro.estado).toBe('departamento_desconocido');
    expect(panel).toMatch(/No significa que no haya pueblos\s*\n?\s*originarios\./);
  });
});
