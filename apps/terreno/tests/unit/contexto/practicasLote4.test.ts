import { describe, it, expect } from 'vitest';
import { PRACTICAS_POR_FICHA, practicasDeFicha } from '@/lib/practicasHistoricas';
import { fichaDeEcorregion } from '@/lib/ecorregiones';
import { fichaPorId } from '@/lib/contexto';

/*
 * El cuarto lote de prácticas, que cerró el bloque 1 de Indomalaya: llegaron 18
 * entradas y entraron 7. Es el peor de los cuatro, y lo que cambió no fue la
 * lectura —las once fuentes que abrieron decían lo que la entrega decía— sino
 * dónde se cae una entrada. En los lotes anteriores se caían por la fuente; en
 * éste, seis se cayeron por el polígono:
 *
 *   - tres en un ECO_ID que no tiene ficha (286, 280 y 294);
 *   - dos porque esa práctica ya está escrita en este archivo, con la misma
 *     fuente, en la ficha que el polígono le había asignado antes;
 *   - dos a cuatrocientos kilómetros de la ficha propuesta, buscadas por el
 *     nombre de la especie que nombra a la ficha en vez de por el polígono.
 *
 * Estos tests fijan las dos cosas que no se pueden perder: cada veredicto de
 * polígono con el ECO_ID que lo decidió, y el mecanismo de cada una de las siete
 * que entraron.
 */

describe('los polígonos que decidieron el lote', () => {
  it('la coordenada publicada del bosque sagrado de Kolavade da el montano, no el deciduo', () => {
    // El encargo pedía la aldea o la coordenada justamente porque el taluka de
    // Mulshi cruza la cresta. La entrega trajo la coordenada —18°27'18,66" N,
    // 73°33'30,93" E— y con ella el veredicto se da de una: ese punto da 254, y
    // dos kilómetros al este ya da 253. La entrada iba propuesta en el 253.
    expect(fichaDeEcorregion(254)).toBe('ghats_norte_montano');
    expect(fichaDeEcorregion(253)).toBe('ghats_norte_deciduo');
    // No entró igual, y no por el polígono: el artículo es CC-BY y las dos rutas
    // —Wiley y el espejo de Hindawi— contestan con una verificación anti-bot.
    expect(PRACTICAS_POR_FICHA['ghats_norte_montano']).toBeUndefined();
    expect(PRACTICAS_POR_FICHA['ghats_norte_deciduo']).toBeUndefined();
  });

  it('Semerap y Jujun son la punta del valle de Kerinci que NO es el pinar', () => {
    // Tercer lote consecutivo en que `pinar_toba` se propone y no corresponde, y
    // esta vez el encargo no tuvo la culpa: el 305 sí es el pinar de Kerinci
    // —Siulak, en el extremo noroeste del valle, da 305— pero Semerap y Jujun
    // están en el extremo sureste, sobre el lago, y dan 279. Es la otra punta del
    // mismo valle.
    expect(fichaDeEcorregion(279)).toBe('sumatra_montano');
    expect(fichaDeEcorregion(305)).toBe('pinar_toba');
    expect(PRACTICAS_POR_FICHA['pinar_toba']).toBeUndefined();
    const pelak = practicasDeFicha('sumatra_montano').filter((p) => /[Pp]elak|Jujun/.test(p.practica + p.periodo));
    expect(pelak).toHaveLength(2);
  });

  it('Daraitan es selva baja de Luzón, igual que los asentamientos agta del lote 3', () => {
    // Segunda vez que `luzon_montano` se propone y da 241. El monte de Daraitan
    // entra en el 240 a cinco kilómetros al este, pero el barangay donde la
    // fuente trabajó es 241.
    expect(fichaDeEcorregion(241)).toBe('luzon_bajo');
    expect(fichaDeEcorregion(240)).toBe('luzon_montano');
    expect(PRACTICAS_POR_FICHA['luzon_montano']).toBeUndefined();
    expect(practicasDeFicha('luzon_bajo').some((p) => /[Kk]aingin/.test(p.practica))).toBe(true);
  });

  it('Jhansi está fuera del Decán central, y el propio trabajo publica la latitud', () => {
    // Los dos ensayos de Hardwickia binata llegaron propuestos en la ficha que la
    // especie nombra. Están en Bundelkhand, que la fuente ubica entre los 23°20'
    // y los 26° de latitud; el polígono del 290 no pasa de 21,7°, y Jhansi da 287.
    expect(fichaDeEcorregion(290)).toBe('decan_central_hardwickia');
    expect(fichaDeEcorregion(287)).toBe('gangetica_superior');
    expect(PRACTICAS_POR_FICHA['decan_central_hardwickia']).toBeUndefined();
    // Y tampoco se mudaron al 287: un ensayo en los campos de un centro de
    // investigación no es una práctica del territorio. La única entrada del 287
    // es una parcela de productor.
    expect(practicasDeFicha('gangetica_superior')).toHaveLength(1);
    expect(practicasDeFicha('gangetica_superior')[0]!.practica).toMatch(/Álamo/);
  });

  it('los vayal se asignan por el núcleo de la comunidad, y eso va dicho', () => {
    // Wayanad está partido: Mananthavady, Kammana, Thirunelly y Kalpetta dan 271;
    // Pulpally y Sulthan Bathery, al este del mismo distrito, dan 270. Las cuatro
    // aldeas que la fuente agradece no resuelven, así que la ficha se eligió por
    // el núcleo documentado de los kurichiya y no por una coordenada.
    expect(fichaDeEcorregion(271)).toBe('ghats_sur_montano');
    expect(fichaDeEcorregion(270)).toBe('ghats_sur_deciduo');
    expect(practicasDeFicha('ghats_sur_montano')).toHaveLength(1);
    // El 270 volvió vacío del lote, y la entrega lo declaró así.
    expect(PRACTICAS_POR_FICHA['ghats_sur_deciduo']).toBeUndefined();
  });
});

describe('las que no entraron por falta de ficha', () => {
  it('las doce fincas del Tonle Sap publican su coordenada, y las doce dan 286', () => {
    // 12°39' a 12°41' N, 104°47' E. El 285 —`pantanos_tonle_sap`— empieza más
    // cerca del lago. La entrada queda verificada y esperando polígono, como el
    // manglar de Sundarbans antes de tener ficha.
    expect(fichaDeEcorregion(285)).toBe('pantanos_tonle_sap');
    expect(fichaDeEcorregion(286)).toBeNull();
    expect(PRACTICAS_POR_FICHA['pantanos_tonle_sap']).toBeUndefined();
  });

  it('el sonor de Perigi cae en el mismo polígono por el que se rechazó el lebak de Pampangan', () => {
    // 280, pantano de turba de Sumatra, veinte kilómetros al norte del sitio que
    // el encargo ya había descartado por eso mismo. La ficha `pantanos_sumatra`
    // es el 277, que es pantano de agua dulce.
    expect(fichaDeEcorregion(277)).toBe('pantanos_sumatra');
    expect(fichaDeEcorregion(280)).toBeNull();
    expect(PRACTICAS_POR_FICHA['pantanos_sumatra']).toBeUndefined();
  });

  it('el cultivo mixto de la zona seca de Myanmar ya estaba entregado y el encargo lo había excluido', () => {
    // Kyaukpadaung da 294 y el 294 no tiene ficha. La entrada equivalente está
    // entregada y verificada desde el lote 2; el encargo de este lote la listaba
    // entre las que no hay que volver a mandar.
    expect(fichaDeEcorregion(235)).toBe('irrawaddy_deciduo');
    expect(fichaDeEcorregion(294)).toBeNull();
    expect(PRACTICAS_POR_FICHA['irrawaddy_deciduo']).toBeUndefined();
  });
});

describe('las dos que ya estaban escritas, con la misma fuente', () => {
  const urls = Object.values(PRACTICAS_POR_FICHA).flatMap((ps) => ps.flatMap((p) => p.fuentes.map((f) => f.url)));

  it('el capítulo del CBD sobre el huerto kandyano se cita una sola vez en todo el catálogo', () => {
    // Llegó propuesto en `sri_lanka_montano` y la práctica ya estaba en
    // `sri_lanka_humedo_bajo` desde el lote 2, con esta misma URL y con la altura
    // de la fuente —400 a 650 m— como argumento de la mudanza.
    expect(urls.filter((u) => u.includes('cbd-ts-52-en.pdf'))).toHaveLength(1);
    expect(practicasDeFicha('sri_lanka_humedo_bajo').some((p) => /kandyano/.test(p.practica))).toBe(true);
    expect(PRACTICAS_POR_FICHA['sri_lanka_montano']).toBeUndefined();
  });

  it('el trabajo de Molle sobre Bang Kum se cita dos veces, y las dos son del lote 2', () => {
    // Llegó propuesto en `chao_phraya_deciduo`. Bang Kum está en la provincia de
    // Ayutthaya, que da 224, y las dos entradas que salen de ese trabajo ya
    // estaban en `pantanos_chao_phraya`.
    expect(urls.filter((u) => u.includes('seas/10/1/10_141'))).toHaveLength(2);
    expect(fichaDeEcorregion(224)).toBe('pantanos_chao_phraya');
    expect(fichaDeEcorregion(225)).toBe('chao_phraya_deciduo');
    expect(practicasDeFicha('pantanos_chao_phraya')).toHaveLength(2);
    expect(PRACTICAS_POR_FICHA['chao_phraya_deciduo']).toBeUndefined();
  });
});

describe('los mecanismos de las siete que entraron', () => {
  const buscar = (ficha: string, re: RegExp) => practicasDeFicha(ficha).find((p) => re.test(p.practica))!;

  it('de los tres vayal, el que se abona es el de media loma, porque es el menos fértil', () => {
    const v = buscar('ghats_sur_montano', /vayal/);
    expect(v.tipo).toBe('agua');
    expect(v.detalle).toMatch(/kuni vayal es la media loma/);
    expect(v.detalle).toMatch(/es el único que se abona, con ceniza y bosta, porque es el menos fértil/);
    // Y el pantanoso no se abona porque ya es fértil: el gradiente va al revés de
    // lo que haría pensar el encharcamiento.
    expect(v.detalle).toMatch(/naturalmente fértil así que no se abona/);
    expect(v.detalle).toMatch(/no se puede caminar encima sin hundirse/);
    // El reparto de variedades por tipo es la parte accionable.
    expect(v.detalle).toMatch(/variedades cortas y tolerantes a la seca/);
    expect(v.detalle).toMatch(/variedades largas y tolerantes a la inundación/);
  });

  it('el pelak se renueva imitando el claro del bosque de al lado', () => {
    const p = buscar('sumatra_montano', /Pelak de frutales/);
    expect(p.detalle).toMatch(/se talan los árboles menos productivos/);
    expect(p.detalle).toMatch(/las que se instalan solas en los claros del bosque natural/);
    expect(p.detalle).toMatch(/la renovación imita el claro del bosque/);
    // El motivo por el que el sistema existe es la falta de tierra y la ladera
    // que se mueve, y lo dicen los mayores de la aldea.
    expect(p.detalle).toMatch(/la falta de tierra y una ladera que se desmorona/);
  });

  it('en Jujun lo que se elige no es la especie sino a qué edad se reinicia', () => {
    const p = buscar('sumatra_montano', /tres caminos/);
    expect(p.detalle).toMatch(/año ocho o nueve/);
    expect(p.detalle).toMatch(/veinticinco años/);
    expect(p.detalle).toMatch(/jardín mixto permanente/);
    expect(p.detalle).toMatch(/lo que cambia entre las tres es cuánto se saca de una vez/);
  });

  it('la regla de Ciptagelar se ve desde arriba como un borde de uso del suelo', () => {
    const p = buscar('java_occidental_bajo', /cosecha al año/);
    expect(p.detalle).toMatch(/únicamente en los dos caseríos/);
    expect(p.detalle).toMatch(/donde la regla termina, la parcela cambia de forma/);
  });

  it('el pekarangan se midió contra el talún-kebun de la misma aldea, y por eso sirve', () => {
    const p = buscar('java_occidental_bajo', /Pekarangan/);
    expect(p.detalle).toMatch(/186 especies/);
    expect(p.detalle).toMatch(/75 especies/);
    expect(p.detalle).toMatch(/dos veces y media/);
    // Lo fechado es el inventario, no el huerto: la vigencia dice `historica` por
    // eso y no porque la fuente diga que se perdió.
    expect(p.vigencia).toBe('historica');
    expect(p.detalle).toMatch(/Lo que está fechado es el inventario/);
  });

  it('el álamo crece más rápido por el riego del cultivo, y el cultivo cambia con la sombra', () => {
    const p = buscar('gangetica_superior', /Álamo/);
    expect(p.detalle).toMatch(/18 m entre pares/);
    expect(p.detalle).toMatch(/el riego y la carpida que el cultivo necesita hacen crecer más rápido al álamo/);
    expect(p.detalle).toMatch(/aguantan sólo dos años/);
    expect(p.detalle).toMatch(/jengibre, cúrcuma/);
    // Y lo que lo sostiene es un comprador, no una herencia.
    expect(p.detalle).toMatch(/años setenta/);
    expect(p.detalle).toMatch(/haya quien compre la madera/);
  });

  it('el kaingin va con su ilegalidad y con el reemplazo que propone la fuente', () => {
    const p = buscar('luzon_bajo', /[Kk]aingin/);
    expect(p.tipo).toBe('fuego');
    expect(p.detalle).toMatch(/trabajo intercambiado entre hogares/);
    expect(p.detalle).toMatch(/ilegal en Filipinas/);
    expect(p.detalle).toMatch(/no tienen otra tierra de cultivo/);
    expect(p.detalle).toMatch(/cultivo en callejones/);
  });
});

describe('las fuentes y los totales del lote', () => {
  const FICHAS = ['ghats_sur_montano', 'sumatra_montano', 'java_occidental_bajo', 'gangetica_superior', 'luzon_bajo'];

  it('son siete entradas sobre cinco fichas, tres de ellas estrenando bloque', () => {
    const esperado: Record<string, number> = {
      ghats_sur_montano: 1, java_occidental_bajo: 2, gangetica_superior: 1,
      sumatra_montano: 4, luzon_bajo: 6,
    };
    for (const [id, n] of Object.entries(esperado)) {
      expect(practicasDeFicha(id), id).toHaveLength(n);
      expect(fichaPorId(id)?.practicas, id).toHaveLength(n);
    }
  });

  it('el catálogo queda en 453 entradas sobre 221 fichas', () => {
    const fichas = Object.keys(PRACTICAS_POR_FICHA);
    const total = fichas.reduce((n, id) => n + practicasDeFicha(id).length, 0);
    expect(fichas).toHaveLength(221);
    expect(total).toBe(453);
  });

  it('ninguna fuente cuelga de un repositorio que sólo aloja', () => {
    // La entrega trajo ResearchGate para el trabajo de los suludnon, tercer
    // intento de esa entrada. No entró.
    const del = FICHAS.flatMap((id) => practicasDeFicha(id).flatMap((p) => p.fuentes));
    for (const f of del) {
      expect(f.url, f.label).not.toMatch(/researchgate|academia\.edu|scribd/i);
    }
    expect(PRACTICAS_POR_FICHA['negros_panay']).toBeUndefined();
  });

  it('el rótulo nombra al que publica antes del título', () => {
    const del = FICHAS.flatMap((id) => practicasDeFicha(id).flatMap((p) => p.fuentes));
    for (const f of del) {
      expect(f.label, f.url).toMatch(/ — /);
    }
  });

  it('Indomalaya queda con 14 fichas sin ninguna práctica', () => {
    const ids = [
      'chao_phraya_deciduo', 'decan_central_hardwickia', 'decan_norte_sal',
      'decan_sur_elefantes', 'ghats_norte_deciduo', 'ghats_norte_montano',
      'ghats_sur_deciduo', 'irrawaddy_deciduo', 'luzon_montano', 'negros_panay',
      'pantanos_sumatra', 'pantanos_tonle_sap', 'pinar_toba', 'sri_lanka_montano',
    ];
    for (const id of ids) {
      expect(PRACTICAS_POR_FICHA[id], id).toBeUndefined();
    }
  });
});
