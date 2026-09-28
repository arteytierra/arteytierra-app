/**
 * Censo guatemalteco 2018: que las sumas cierren, que el punto caiga donde debe
 * y que en ningún lado aparezca un total que el INE no publica.
 *
 * Lo propio de Guatemala, y lo que cuida la mitad de este archivo, son tres
 * cosas que ningún país anterior tenía:
 *
 *   1. **No hay un total «indígena».** El INE cuenta Maya, Garífuna y Xinka por
 *      separado. La suma da 6.491.199 y ningún cuadro del censo la avala: si
 *      alguna vez aparece como un campo, este archivo lo frena.
 *
 *   2. **Las 22 comunidades lingüísticas están adentro del pueblo Maya.** Suman
 *      exactamente el total maya en los tres niveles. Sumarlas al pueblo Maya
 *      contaría dos veces a 6.207.503 personas.
 *
 *   3. **«Guatemala» es tres cosas a la vez:** el país, uno de los 22
 *      departamentos y uno de los 340 municipios. El resolver tiene que
 *      atravesar los tres niveles sin confundirse, y hay un test para eso.
 */
import { describe, it, expect } from 'vitest';
import { CENSO_GT, CENSO_GT_PAIS, COMUNIDADES_MAYAS_GT } from '@/lib/censoIndigena2018Gt';
import {
  censoGuatemaltecoDelPunto, municipiosDestacadosGt, comunidadesDestacadasGt,
  puebloMayorGt, PORCENTAJES_PAIS_GT, FUENTE_CENSO_2018_GT, REGISTRO_GT_FALTANTE,
} from '@/lib/pueblosOriginarios';
import { PAISES_NACIONAL } from '@/lib/pueblosOriginariosNacional';
import type { Ubicacion } from '@/lib/entorno';

/**
 * Una ubicación como la que arma `/api/entorno` desde Nominatim.
 *
 * En Guatemala el departamento viene en `provincia` (el `state`, nivel 4 de
 * OSM) y el municipio en `departamento` (el `county`, nivel 6).
 */
function ubi(campos: Partial<Ubicacion>): Ubicacion {
  return { localidad: null, departamento: null, provincia: null, pais: 'Guatemala', ...campos };
}

describe('las sumas cierran', () => {
  it('los 22 departamentos suman el país en las cuatro cifras', () => {
    expect(CENSO_GT.length).toBe(22);
    expect(CENSO_GT.reduce((a, d) => a + d.poblacion, 0)).toBe(CENSO_GT_PAIS.poblacion);
    expect(CENSO_GT.reduce((a, d) => a + d.maya, 0)).toBe(CENSO_GT_PAIS.maya);
    expect(CENSO_GT.reduce((a, d) => a + d.garifuna, 0)).toBe(CENSO_GT_PAIS.garifuna);
    expect(CENSO_GT.reduce((a, d) => a + d.xinka, 0)).toBe(CENSO_GT_PAIS.xinka);
  });

  it('los municipios de cada departamento suman su departamento', () => {
    let total = 0;
    for (const d of CENSO_GT) {
      total += d.municipios.length;
      expect(d.municipios.reduce((a, m) => a + m.poblacion, 0), d.departamento).toBe(d.poblacion);
      expect(d.municipios.reduce((a, m) => a + m.maya, 0), d.departamento).toBe(d.maya);
      expect(d.municipios.reduce((a, m) => a + m.garifuna, 0), d.departamento).toBe(d.garifuna);
      expect(d.municipios.reduce((a, m) => a + m.xinka, 0), d.departamento).toBe(d.xinka);
    }
    expect(total).toBe(340);
    expect(CENSO_GT_PAIS.municipios).toBe(340);
  });

  it('las cifras del país son las que publica el INE', () => {
    // Si alguna cambia, cambió el insumo: hay que mirar por qué antes de
    // publicarlo.
    expect(CENSO_GT_PAIS.poblacion).toBe(14_901_286);
    expect(CENSO_GT_PAIS.maya).toBe(6_207_503);
    expect(CENSO_GT_PAIS.garifuna).toBe(19_529);
    expect(CENSO_GT_PAIS.xinka).toBe(264_167);
  });

  it('las seis categorías del cuadro suman la población: no hay «no declarado»', () => {
    // Es la propiedad que hace que el porcentaje sea directo. Las otras tres
    // categorías no son pueblos originarios y viajan sólo para esto.
    const suma = CENSO_GT_PAIS.maya + CENSO_GT_PAIS.garifuna + CENSO_GT_PAIS.xinka
      + CENSO_GT_PAIS.afrodescendiente + CENSO_GT_PAIS.ladino + CENSO_GT_PAIS.extranjero;
    expect(suma).toBe(CENSO_GT_PAIS.poblacion);
  });

  it('los códigos de municipio no se repiten', () => {
    const codigos = CENSO_GT.flatMap(d => d.municipios.map(m => m.codigo));
    expect(new Set(codigos).size).toBe(codigos.length);
  });
});

describe('el total que no existe', () => {
  it('no hay ningún campo que sume los tres pueblos', () => {
    // 6.207.503 + 19.529 + 264.167 = 6.491.199, un número que el INE no
    // publica. Que no esté es la decisión; este test la sostiene.
    expect('indigena' in CENSO_GT_PAIS).toBe(false);
    expect('total' in CENSO_GT_PAIS).toBe(false);
    expect(Object.values(CENSO_GT_PAIS)).not.toContain(6_491_199);
    for (const d of CENSO_GT) expect('indigena' in d, d.departamento).toBe(false);
  });

  it('hay tres porcentajes y ninguno los junta', () => {
    expect(Object.keys(PORCENTAJES_PAIS_GT).sort()).toEqual(['garifuna', 'maya', 'xinka']);
    // El maya sobre la población censada entera, sin recorte de edad.
    expect(PORCENTAJES_PAIS_GT.maya).toBe('41,7');
  });
});

describe('las 22 comunidades lingüísticas están adentro del pueblo Maya', () => {
  it('son 22 y se escriben como las escribe el INE', () => {
    expect(COMUNIDADES_MAYAS_GT).toHaveLength(22);
    // La grafía con el espacio antes de la barra es la del cuadro. Se copia,
    // no se corrige: es el nombre tal como lo publica la fuente.
    expect(COMUNIDADES_MAYAS_GT).toContain("Jakalteko /Popti'");
    expect(COMUNIDADES_MAYAS_GT).toContain("K'iche'");
  });

  it('suman el total maya en los tres niveles', () => {
    const suma = (cs: ReadonlyArray<readonly [string, number]>) => cs.reduce((a, c) => a + c[1], 0);
    expect(suma(CENSO_GT_PAIS.comunidades)).toBe(CENSO_GT_PAIS.maya);
    for (const d of CENSO_GT) {
      expect(suma(d.comunidades), d.departamento).toBe(d.maya);
      for (const m of d.municipios) expect(suma(m.comunidades), m.municipio).toBe(m.maya);
    }
  });

  it('ninguna comunidad viaja en cero', () => {
    // El cuadro trae las 22 columnas siempre, con guión donde no hubo nadie.
    // El guión es cero y el cero no entra: una fila «· 0» no informa.
    for (const d of CENSO_GT) {
      for (const [nombre, n] of d.comunidades) expect(n, `${d.departamento} ${nombre}`).toBeGreaterThan(0);
    }
  });

  it('todos los nombres que aparecen están en la lista de 22', () => {
    const conocidas = new Set<string>(COMUNIDADES_MAYAS_GT);
    for (const d of CENSO_GT) {
      for (const [nombre] of d.comunidades) expect(conocidas.has(nombre), nombre).toBe(true);
    }
  });
});

describe('dónde cae el punto', () => {
  it('«Guatemala» es país, departamento y municipio, y los tres se atraviesan', () => {
    // El homónimo triple. Si el resolver confundiera un nivel con otro, éste es
    // el punto donde se vería.
    const r = censoGuatemaltecoDelPunto(
      ubi({ provincia: 'Guatemala', departamento: 'Guatemala' }));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.departamento.codigo).toBe(1);
    expect(r.municipio.codigo).toBe(101);
    expect(r.municipio.poblacion).toBe(923_392);
  });

  it('el municipio se lee del `county`, que acá cae en `departamento`', () => {
    const r = censoGuatemaltecoDelPunto(
      ubi({ provincia: 'Sololá', departamento: 'Sololá' }));
    expect(r.estado).toBe('con_censo');
    if (r.estado !== 'con_censo') return;
    expect(r.municipio.codigo).toBe(701);
    expect(r.municipio.maya).toBe(83_767);
  });

  it('si el county no vino, lo intenta con la comuna y con la localidad', () => {
    const porComuna = censoGuatemaltecoDelPunto(
      ubi({ provincia: 'Alta Verapaz', comuna: 'Cobán' }));
    expect(porComuna.estado).toBe('con_censo');

    const porLocalidad = censoGuatemaltecoDelPunto(
      ubi({ provincia: 'Guatemala', localidad: 'Mixco' }));
    expect(porLocalidad.estado).toBe('con_censo');
    if (porLocalidad.estado !== 'con_censo') return;
    expect(porLocalidad.municipio.codigo).toBe(108);
  });

  it('cuando el municipio no se identifica, contesta con el departamento y lo dice', () => {
    // Es peor dar el municipio equivocado que dar el departamento y aclararlo.
    const r = censoGuatemaltecoDelPunto(
      ubi({ provincia: 'Sololá', localidad: 'Aldea Que No Existe' }));
    expect(r.estado).toBe('con_departamento');
    if (r.estado !== 'con_departamento') return;
    expect(r.departamento.departamento).toBe('Sololá');
    expect(r.municipioBuscado).toBe('Aldea Que No Existe');
  });

  it('un departamento que no reconocemos no se inventa', () => {
    const r = censoGuatemaltecoDelPunto(ubi({ provincia: 'Departamento Inventado' }));
    expect(r.estado).toBe('departamento_desconocido');
  });

  it('afuera de Guatemala no contesta, y el país homónimo no lo confunde', () => {
    expect(censoGuatemaltecoDelPunto(
      ubi({ pais: 'México', provincia: 'Chiapas' })).estado).toBe('fuera_de_guatemala');
    expect(censoGuatemaltecoDelPunto(null).estado).toBe('sin_ubicacion');
    // Un predio en el departamento de Guatemala pero con el país sin resolver
    // tampoco entra: el país manda.
    expect(censoGuatemaltecoDelPunto(
      ubi({ pais: null, provincia: 'Guatemala' })).estado).toBe('sin_ubicacion');
  });
});

describe('qué se muestra primero', () => {
  it('en Santa Rosa el pueblo mayor es el Xinka, no el Maya', () => {
    // 55.855 xinkas contra 7.863 mayas. Encabezar la lista con «Maya» porque es
    // el más grande del país mostraría el departamento equivocado.
    const santaRosa = CENSO_GT.find(d => d.departamento === 'Santa Rosa')!;
    expect(puebloMayorGt(santaRosa)).toBe('xinka');

    const solola = CENSO_GT.find(d => d.departamento === 'Sololá')!;
    expect(puebloMayorGt(solola)).toBe('maya');
  });

  it('los municipios destacados se piden por pueblo y nunca suman los tres', () => {
    const santaRosa = CENSO_GT.find(d => d.departamento === 'Santa Rosa')!;
    const porXinka = municipiosDestacadosGt(santaRosa, 'xinka');
    const porMaya = municipiosDestacadosGt(santaRosa, 'maya');
    expect(porXinka.length).toBeGreaterThan(0);
    // Ordenados de mayor a menor y sin ceros adentro.
    for (const lista of [porXinka, porMaya]) {
      for (let i = 1; i < lista.length; i++) {
        const pueblo = lista === porXinka ? 'xinka' : 'maya';
        expect(lista[i]![pueblo]).toBeLessThanOrEqual(lista[i - 1]![pueblo]);
      }
    }
    for (const m of porXinka) expect(m.xinka).toBeGreaterThan(0);
    // El primero por xinka no tiene por qué ser el primero por maya: si lo
    // fuera siempre, el parámetro no estaría haciendo nada.
    expect(porXinka[0]!.codigo).not.toBe(porMaya[0]!.codigo);
  });

  it('las comunidades se ordenan para mostrar sin tocar el dato', () => {
    const solola = CENSO_GT.find(d => d.departamento === 'Sololá')!;
    const antes = solola.comunidades.map(c => c[0]);
    const top = comunidadesDestacadasGt(solola.comunidades, 3);

    expect(top.map(c => c[0])).toEqual(["K'iche'", 'Kaqchikel', "Tz'utujil"]);
    // El dato sigue en el orden del cuadro, que es el que permite auditarlo
    // contra el XLSX del INE.
    expect(solola.comunidades.map(c => c[0])).toEqual(antes);
    expect(antes[0]).toBe('Achi');
  });
});

describe('la licencia y la fuente', () => {
  it('se cita el dataset del portal, que es donde está declarada la licencia', () => {
    // El visor censo2018.ine.gob.gt no la repite. Citar el visor dejaría el uso
    // sin respaldo.
    expect(FUENTE_CENSO_2018_GT.url).toContain('datos.ine.gob.gt');
    expect(FUENTE_CENSO_2018_GT.licencia).toContain('Creative Commons');
    expect(FUENTE_CENSO_2018_GT.atribucion.length).toBeGreaterThan(20);
  });

  it('se dice qué fuente falta y por qué', () => {
    expect(REGISTRO_GT_FALTANTE.motivo).toContain('Registro de Información Catastral');
  });

  it('Guatemala ya no entra como cifra nacional', () => {
    // Si estuviera en las dos listas, un predio guatemalteco vería dos bloques
    // diciendo cosas distintas sobre lo mismo.
    expect(PAISES_NACIONAL.some(p => p.iso2 === 'GT')).toBe(false);
  });
});
