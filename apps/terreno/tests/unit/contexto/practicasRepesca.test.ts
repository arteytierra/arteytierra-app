import { describe, it, expect } from 'vitest';
import { PRACTICAS_POR_FICHA, practicasDeFicha } from '@/lib/practicasHistoricas';
import { fichaDeEcorregion } from '@/lib/ecorregiones';
import { fichaPorId } from '@/lib/contexto';

/*
 * La repesca de fase 6, del 11/11/2026. El encargo pidió seis blancos con nombre
 * —tres que sólo necesitaban otra URL, dos que necesitaban el extremo correcto de
 * un polígono y uno nuevo— y volvió con cuatro entradas y dos vacías declaradas.
 * Entraron tres, y por primera vez en esta fase **ninguna se cayó por la fuente**:
 *
 *   - dos estrenan ficha, las dos del taluka de Mulshi y separadas por la cresta
 *     de los Ghats: el devrai de Kolavade da 254 y el riego de Paud da 253;
 *   - una se mueve de polígono y se monta al lado: el control mecánico de
 *     defoliadores de Wayanad llegó para el 270 y los cinco sitios de encuesta
 *     que el artículo publica con coordenada dan los cinco 271;
 *   - una no entra: la caña de Kayu Aro Barat es el cuarto fracaso seguido de
 *     `pinar_toba`, y acá el encargo tuvo la mitad de la culpa.
 *
 * Estos tests fijan los tres veredictos de polígono, el mecanismo de cada entrada
 * y —la que más importa— la frontera entre lo que el trabajo de Wayanad midió y
 * lo que sólo describió.
 */

describe('los polígonos de la repesca', () => {
  it('Kolavade y Paud están en el mismo taluka y en dos fichas distintas', () => {
    // Kolavade: 18°27'18,66" N / 73°33'30,93" E, que es la coordenada que publica
    // la tabla 1 del artículo y no una geocodificación nuestra. Da 254. Paud, diez
    // kilómetros al noreste y del lado seco de la cresta, da 253 —y también da 253
    // nueve kilómetros más al este, así que no está sobre el borde.
    expect(fichaDeEcorregion(254)).toBe('ghats_norte_montano');
    expect(fichaDeEcorregion(253)).toBe('ghats_norte_deciduo');
    expect(practicasDeFicha('ghats_norte_montano')).toHaveLength(1);
    expect(practicasDeFicha('ghats_norte_deciduo')).toHaveLength(1);
  });

  it('los cinco sitios publicados del arrozal de Wayanad dan 271, no 270', () => {
    // Mananthavady (11,8014/76,0044), Edavaka (11,7715/75,9637), Panamaram
    // (11,7381/76,0740), Pulpally (11,6732/76,1833) y Thrissileri
    // (11,8465/76,0227). Los cinco dan 271. El caso raro no cambia nada y conviene
    // dejarlo anotado: la coordenada que el artículo imprime al lado de "Pulpally"
    // cae trece kilómetros al sur del pueblo de Pulpally, que da 270. Cuando el
    // nombre y la coordenada publicada no coinciden, vale la coordenada.
    expect(fichaDeEcorregion(271)).toBe('ghats_sur_montano');
    expect(fichaDeEcorregion(270)).toBe('ghats_sur_deciduo');
    expect(practicasDeFicha('ghats_sur_montano')).toHaveLength(2);
    expect(PRACTICAS_POR_FICHA['ghats_sur_deciduo']).toBeUndefined();
  });

  it('el pinar de Kerinci es el filo oeste del valle, y las laderas del volcán no', () => {
    // Cuarto lote consecutivo en que `pinar_toba` se propone y no corresponde, y
    // la mitad de la culpa es del encargo, que dijo «Siulak y las laderas del
    // Gunung Kerinci». Siulak (1,9626 S / 101,3125 E) da 305; las tres aldeas de
    // Kayu Aro Barat donde fue la entrega —Sungai Asam (1,8317 S / 101,2775 E),
    // Kampung Baru (1,8128/101,2766) y Giri Mulyo (1,7708/101,2615)— dan 279 las
    // tres, igual que la cumbre y que Sungai Penuh. El polígono del 305 tiene
    // cinco partes y sólo una está en Kerinci.
    expect(fichaDeEcorregion(305)).toBe('pinar_toba');
    expect(fichaDeEcorregion(279)).toBe('sumatra_montano');
    expect(PRACTICAS_POR_FICHA['pinar_toba']).toBeUndefined();
    // Y el 279 no la necesita: ya tiene cuatro entradas, una más que el piso.
    expect(practicasDeFicha('sumatra_montano').length).toBeGreaterThanOrEqual(3);
  });
});

describe('el mecanismo de las tres que entraron', () => {
  it('en el devrai la regla es oral y el fideicomiso la implementa', () => {
    const d = practicasDeFicha('ghats_norte_montano')[0]!;
    expect(d.tipo).toBe('recoleccion');
    // En retroceso y fechado: en las dos décadas anteriores al estudio se vendió
    // tierra a especuladores y los sacerdotes jóvenes dejaron la ceremonia del
    // grano con la que se negaba permiso para talar.
    expect(d.vigencia).toBe('en_retroceso');
    expect(d.detalle).toMatch(/tabú/);
    expect(d.detalle).toMatch(/sin nada escrito/);
    expect(d.detalle).toMatch(/fideicomiso/);
    // Lo que un relevamiento de territorio puede usar directo: el parche está
    // donde está el agua, y el límite lo marca el uso y no una demarcación.
    expect(d.detalle).toMatch(/manantial/);
    expect(d.detalle).toMatch(/suelo es mejor/);
    expect(d.detalle).toMatch(/no están medidos ni demarcados/);
  });

  it('en Paud la obra de riego y el arreglo entre vecinos son la misma decisión', () => {
    const p = practicasDeFicha('ghats_norte_deciduo')[0]!;
    expect(p.tipo).toBe('agua');
    expect(p.vigencia).toBe('en_uso');
    // Las dos mitades de la frase de la fuente, porque la segunda es la que sirve
    // para diseñar: quién puede pagar la bomba decide quién riega.
    expect(p.detalle).toMatch(/bombean de la napa|agua del río/);
    expect(p.detalle).toMatch(/capacidad financiera/);
    expect(p.detalle).toMatch(/acuerdos informales entre vecinos/);
    expect(p.detalle).toMatch(/menos capital/);
  });

  it('las ramas de Wayanad están descritas, no medidas, y la entrada lo dice', () => {
    // Es la línea que separa esta entrada de un número plausible y equivocado. El
    // ensayo del trabajo midió las formulaciones que se pulverizan —suero, ácidos
    // de pescado, neem, tabaco, jeevamrutham—, no el método mecánico. Atribuirle
    // a las ramas el 33,7-41,5 % → 14,2-18,5 % sería la falla de método que este
    // circuito ya cometió: la fuente correcta midiendo otra cosa.
    const ramas = practicasDeFicha('ghats_sur_montano').find((x) => /ramas/.test(x.practica))!;
    expect(ramas).toBeDefined();
    expect(ramas.tipo).toBe('cultivo');
    expect(ramas.detalle).toMatch(/Ficus hispida/);
    expect(ramas.detalle).toMatch(/Ziziphus oenopolia/);
    expect(ramas.detalle).toMatch(/Cymbopogon citratus/);
    expect(ramas.detalle).toMatch(/Cnaphalocrocis medinalis/);
    expect(ramas.detalle).toMatch(/no es uno de los tratamientos medidos/);
    expect(ramas.detalle).toMatch(/33,7-41,5 %/);
    expect(ramas.detalle).toMatch(/14,2-18,5 %/);
    expect(ramas.detalle).toMatch(/validación científica/);
  });
});

describe('las fuentes y los totales de la repesca', () => {
  const IDS = ['ghats_norte_montano', 'ghats_norte_deciduo', 'ghats_sur_montano'];

  it('el catálogo pasa de 457 sobre 225 a 460 sobre 227', () => {
    const fichas = Object.keys(PRACTICAS_POR_FICHA);
    const total = fichas.reduce((n, id) => n + practicasDeFicha(id).length, 0);
    expect(fichas).toHaveLength(227);
    expect(total).toBe(460);
    // Y la ficha de contexto ve lo mismo que el catálogo, que es lo que se imprime.
    for (const id of IDS) {
      expect(fichaPorId(id)?.practicas, id).toHaveLength(practicasDeFicha(id).length);
    }
  });

  it('Indomalaya baja de 13 fichas sin ninguna práctica a 11, de 38', () => {
    const ids = [
      'chao_phraya_deciduo', 'decan_central_hardwickia', 'decan_norte_sal',
      'decan_sur_elefantes', 'ghats_sur_deciduo', 'luzon_montano', 'negros_panay',
      'pantanos_sumatra', 'pantanos_tonle_sap', 'pinar_toba', 'sri_lanka_montano',
    ];
    expect(ids).toHaveLength(11);
    for (const id of ids) {
      expect(PRACTICAS_POR_FICHA[id], id).toBeUndefined();
    }
  });

  it('el devrai lleva dos fuentes porque la del editor está cerrada por el camino', () => {
    // Hindawi, Wiley y CORE contestan con verificación anti-bot, y la Wayback, que
    // tiene el PDF archivado, estaba caída ese día. El artículo es CC-BY: la copia
    // abierta va al lado del DOI para que el lector pueda abrirlo.
    const f = practicasDeFicha('ghats_norte_montano')[0]!.fuentes;
    expect(f).toHaveLength(2);
    expect(f[0]!.url).toBe('https://doi.org/10.1155/2014/595314');
    expect(f[0]!.label).toMatch(/Vipat y Bharucha \(2014\)/);
    expect(f[1]!.url).toMatch(/\.pdf$/);
  });

  it('ninguna fuente cuelga de un repositorio que sólo aloja, ni del host que no resuelve', () => {
    // La entrega trajo `repository.pertanian.go.id`, que no tiene registro A: el
    // nombre no resuelve en ningún DNS mientras el dominio padre sí. Es la quinta
    // variedad de fuente cerrada del circuito y no entró.
    const todas = IDS.flatMap((id) => practicasDeFicha(id).flatMap((p) => p.fuentes));
    for (const f of todas) {
      expect(f.url, f.label).not.toMatch(/researchgate|academia\.edu|scribd/i);
      expect(f.url, f.label).not.toMatch(/repository\.pertanian\.go\.id/i);
      expect(f.label, f.url).toMatch(/ — /);
    }
  });
});
