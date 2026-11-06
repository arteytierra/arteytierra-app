import { describe, expect, it } from 'vitest';

import { BIOMAS_GLOBALES } from '../../../lib/biomasGlobales';
import { BIOMAS_REGIONALES_INDOMALAYA } from '../../../lib/biomasRegionales';
import { componerAptitud, fichaPorId } from '../../../lib/contexto';
import { fichaDeEcorregion } from '../../../lib/ecorregiones';
import { practicasDeFicha } from '../../../lib/practicasHistoricas';
import type { ModificadorAptitud } from '../../../lib/biomaTipos';

/**
 * Las tres fichas del 05/11/2026: manglar de Sundarbans (323), bosques secos
 * del Irrawaddy (294) y matorral espinoso del Decán (315).
 *
 * No entraron para corregir un número. Entraron porque cada una tenía una
 * práctica fechada del territorio ya verificada que no se podía montar sin
 * ficha, y por eso lo primero que estos tests cuidan es justamente eso: que la
 * ficha exista y que la práctica haya entrado. Si alguien borra una de las tres,
 * vuelve a quedar una práctica verificada sin casa.
 *
 * Lo demás que cuidan son las cuatro formas en que este lote podría haber metido
 * un número plausible y equivocado:
 *
 * 1. **Citar un documento por una URL que no lo sirve.** El informe del Banco
 *    Mundial sobre el Sundarbans llegó citado por un PDF de
 *    `sundarbanaffairswb.in` que devuelve 200 con la página de error del propio
 *    departamento. Las cifras eran correctas y están en el documento real del
 *    repositorio del Banco Mundial, que es la URL que quedó.
 * 2. **Leer el nivel de protección de One Earth como porcentaje protegido.** Es
 *    el porcentaje de la meta de la Red de Seguridad Global en una escala de 0 a
 *    10. Para el 315 el 1 % sí está escrito en la página; para el 294 no.
 * 3. **Confundir el 315 con el 290.** Ya costó una entrada en otro lote.
 * 4. **Heredar el vertisol del Decán en Myanmar**, que es otro basamento.
 */

const delta = (aptitud: ModificadorAptitud[], uso: ModificadorAptitud['uso']) =>
  aptitud.find((m) => m.uso === uso)?.delta;

const razon = (aptitud: ModificadorAptitud[], uso: ModificadorAptitud['uso']) =>
  aptitud.find((m) => m.uso === uso)?.razon ?? '';

const efectiva = (id: string, biomaGlobalId: string) =>
  componerAptitud(BIOMAS_REGIONALES_INDOMALAYA[id]?.aptitud, BIOMAS_GLOBALES[biomaGlobalId]?.aptitud);

const MANGLAR = 'resolve_manglar';
const SECO = 'resolve_bosque_tropical_seco';
const XEROFILO = 'resolve_desierto_matorral_xerofilo';

describe('las tres fichas existen y destraban lo que tenían que destrabar', () => {
  it('cada ECO_ID deja de caer al bioma global', () => {
    expect(fichaDeEcorregion(323)).toBe('manglares_sundarbans');
    expect(fichaDeEcorregion(294)).toBe('bosques_secos_irrawaddy');
    expect(fichaDeEcorregion(315)).toBe('matorral_espinoso_decan');
  });

  it('las tres nacieron con la práctica que las estaba esperando', () => {
    expect(practicasDeFicha('manglares_sundarbans')).toHaveLength(1);
    expect(practicasDeFicha('bosques_secos_irrawaddy')).toHaveLength(1);
    expect(practicasDeFicha('matorral_espinoso_decan')).toHaveLength(1);
  });

  it('y la práctica le llega a la ficha compuesta, que es lo que ve el usuario', () => {
    for (const id of ['manglares_sundarbans', 'bosques_secos_irrawaddy', 'matorral_espinoso_decan']) {
      expect(fichaPorId(id)?.practicas, id).toHaveLength(1);
    }
  });

  it('ninguna atribuye saberes, como todo el catálogo regional', () => {
    for (const id of ['manglares_sundarbans', 'bosques_secos_irrawaddy', 'matorral_espinoso_decan']) {
      expect(BIOMAS_REGIONALES_INDOMALAYA[id]!.saberes, id).toEqual([]);
    }
  });
});

describe('el polígono, que es lo que decidió cada ficha', () => {
  it('el 323 no es el 282: el manglar y el pantano de agua dulce son dos fichas', () => {
    // Gosaba, Sagar, Hingalganj, Kakdwip, Patharpratima y Mongla dan 323;
    // Khulna y Sandeshkhali dan 282. El informe de arroces salinos cubre seis
    // bloques y el polígono los parte: cinco caen acá y Sandeshkhali no.
    expect(fichaDeEcorregion(282)).toBe('pantanos_sundarbans');
    expect(fichaDeEcorregion(323)).toBe('manglares_sundarbans');
    expect(practicasDeFicha('pantanos_sundarbans')[0]!.practica).toMatch(/Dhap/);
  });

  it('el 315 no es el 290, y llega hasta Jaffna', () => {
    // Dhule, Sakri, Shindkheda, Malegaon y Jalgaon dan los cinco 315, y Jaffna
    // también. El Decán central de Hardwickia es el 290 y es otra ficha.
    expect(fichaDeEcorregion(290)).toBe('decan_central_hardwickia');
    expect(fichaDeEcorregion(315)).toBe('matorral_espinoso_decan');
    expect(BIOMAS_REGIONALES_INDOMALAYA['matorral_espinoso_decan']!.resumen).toMatch(/el 315 no es el 290/);
    expect(BIOMAS_REGIONALES_INDOMALAYA['matorral_espinoso_decan']!.resumen).toMatch(/Jaffna/);
  });

  it('el 294 no es el 235, y el trabajo de Khin cayó en los dos', () => {
    // Nyaung-U, Kyaukpadaung y Meiktila dan 294; Pyinmana, Thazi y Yamethin dan
    // 235. Una sola fuente, dos ecorregiones, dos entradas.
    expect(fichaDeEcorregion(294)).toBe('bosques_secos_irrawaddy');
    expect(fichaDeEcorregion(235)).toBe('irrawaddy_deciduo');
    const url = practicasDeFicha('bosques_secos_irrawaddy')[0]!.fuentes[0]!.url;
    expect(practicasDeFicha('irrawaddy_deciduo')[0]!.fuentes[0]!.url).toBe(url);
    expect(practicasDeFicha('bosques_secos_irrawaddy')[0]!.practica).toMatch(/Nyaung-U/);
    expect(practicasDeFicha('irrawaddy_deciduo')[0]!.practica).toMatch(/Poroto negro/);
  });
});

describe('las tres confirman sus deltas heredados, y cambian la variable', () => {
  it('el manglar confirma los cuatro que toca y no inventa un quinto', () => {
    const f = BIOMAS_REGIONALES_INDOMALAYA['manglares_sundarbans']!;
    expect(f.aptitud!.map((m) => m.uso)).toEqual(['huerta', 'frutales', 'pasturas', 'reserva']);
    // Confirmar es repetir el número del bioma con otra razón: los cuatro deltas
    // tienen que coincidir con los globales, o esto dejó de ser una confirmación.
    for (const uso of ['huerta', 'frutales', 'pasturas', 'reserva'] as const) {
      expect(delta(f.aptitud!, uso), uso).toBe(delta(BIOMAS_GLOBALES[MANGLAR]!.aptitud!, uso));
      expect(razon(f.aptitud!, uso), uso).not.toBe(razon(BIOMAS_GLOBALES[MANGLAR]!.aptitud!, uso));
    }
    // El forestal −25 del bioma no se toca y por lo tanto sigue vivo.
    expect(delta(efectiva('manglares_sundarbans', MANGLAR), 'forestal')).toBe(-25);
  });

  it('el Irrawaddy confirma los dos del bioma seco y agrega la reserva', () => {
    const f = BIOMAS_REGIONALES_INDOMALAYA['bosques_secos_irrawaddy']!;
    expect(delta(f.aptitud!, 'huerta')).toBe(-10);
    expect(delta(f.aptitud!, 'pasturas')).toBe(10);
    expect(delta(BIOMAS_GLOBALES[SECO]!.aptitud!.filter((m) => m.uso === 'reserva'), 'reserva')).toBeUndefined();
    expect(delta(f.aptitud!, 'reserva')).toBe(15);
  });

  it('el matorral espinoso confirma los tres del bioma 13', () => {
    const f = BIOMAS_REGIONALES_INDOMALAYA['matorral_espinoso_decan']!;
    for (const uso of ['huerta', 'pasturas', 'reserva'] as const) {
      expect(delta(f.aptitud!, uso), uso).toBe(delta(BIOMAS_GLOBALES[XEROFILO]!.aptitud!, uso));
    }
    expect(delta(efectiva('matorral_espinoso_decan', XEROFILO), 'huerta')).toBe(-25);
  });
});

describe('los mecanismos que no se pueden perder al reescribir', () => {
  it('el terraplén del Sundarbans protege y hunde: ésa es la razón de la huerta', () => {
    // Es el hallazgo del lote. El polígono incluye las islas habitadas, así que
    // no alcanza con «suelo salino y anegado»: lo que decide es que adentro del
    // terraplén se cortó la deposición de sedimento, la tierra no sube y se
    // anega en el kharif, y el riego de invierno es imposible por la sal.
    const f = BIOMAS_REGIONALES_INDOMALAYA['manglares_sundarbans']!;
    expect(f.suelos).toMatch(/cortaron por completo la deposición de sedimento/);
    expect(f.suelos).toMatch(/no hay elección efectiva/);
    expect(razon(f.aptitud!, 'huerta')).toMatch(/detrás de un terraplén/);
    expect(razon(f.aptitud!, 'huerta')).toMatch(/un solo cultivo de arroz/);
  });

  it('las dos causas de la sal del Sundarbans se corrigen distinto, y están las dos', () => {
    expect(BIOMAS_REGIONALES_INDOMALAYA['manglares_sundarbans']!.suelos)
      .toMatch(/inundación mareal cuando el terraplén se rompe/);
    expect(BIOMAS_REGIONALES_INDOMALAYA['manglares_sundarbans']!.suelos)
      .toMatch(/ascenso capilar desde las capas de abajo durante el rabi/);
  });

  it('en el Irrawaddy el riego hace falta también en la temporada de lluvia', () => {
    // Es lo que hace que el −10 del bioma sea más duro de lo que su propia razón
    // supone: no es que la huerta se pare en la seca, es que la lluvia no cubre
    // la demanda del cultivo ni cuando llueve.
    const f = BIOMAS_REGIONALES_INDOMALAYA['bosques_secos_irrawaddy']!;
    expect(razon(f.aptitud!, 'huerta')).toMatch(/de la temporada de lluvia/);
    expect(razon(f.aptitud!, 'huerta')).toMatch(/siglos XI y XII/);
    expect(f.vegetacion).toMatch(/rara vez hay más de quince días de lluvia en el año/);
  });

  it('en el matorral espinoso el sistema histórico es el phad y no el oasis', () => {
    // El bioma 13 dice «el sistema histórico acá es el oasis». Acá no: el phad
    // devuelve el agua al río, que es lo contrario de concentrarla en un punto.
    expect(BIOMAS_GLOBALES[XEROFILO]!.aptitud!.find((m) => m.uso === 'huerta')!.razon)
      .toMatch(/el oasis/);
    const f = BIOMAS_REGIONALES_INDOMALAYA['matorral_espinoso_decan']!;
    expect(razon(f.aptitud!, 'huerta')).toMatch(/No es un oasis/);
    expect(razon(f.aptitud!, 'huerta')).toMatch(/36 phad bandharas/);
    expect(razon(f.aptitud!, 'huerta')).toMatch(/la mayor parte del distrito no está bajo riego/);
  });

  it('las dos lluvias de Dhule no se promedian: se dicen las dos', () => {
    // 512 mm el GSDA y 674 mm el comisionado divisional, para el mismo distrito.
    // Y 1.097,1 mm en Navapur, sobre el borde occidental. Elegir una sería
    // inventar precisión; acequia la lee en el punto.
    const s = BIOMAS_REGIONALES_INDOMALAYA['matorral_espinoso_decan']!.suelos;
    expect(s).toMatch(/512 mm/);
    expect(s).toMatch(/674 mm/);
    expect(s).toMatch(/1\.097,1 mm/);
  });

  it('el escurrimiento medido del 290 no se transfiere al 315', () => {
    // La ficha del Decán central tiene los coeficientes del ICRISAT medidos
    // adentro de su propio polígono. Acá se nombran para decir que no se usan.
    const s = BIOMAS_REGIONALES_INDOMALAYA['matorral_espinoso_decan']!.suelos;
    expect(s).toMatch(/no se transfiere el escurrimiento medido del Decán central/);
    expect(s).toMatch(/no se encontró una medición comparable para el 315/);
    expect(BIOMAS_REGIONALES_INDOMALAYA['decan_central_hardwickia']!.suelos).toMatch(/del 7 al 11 %/);
  });

  it('el vertisol del Decán no se hereda en Myanmar', () => {
    expect(BIOMAS_REGIONALES_INDOMALAYA['bosques_secos_irrawaddy']!.suelos)
      .toMatch(/no se hereda acá/);
  });

  it('las tres dicen que no tienen reparto de HWSD ni de SoilGrids', () => {
    for (const id of ['manglares_sundarbans', 'bosques_secos_irrawaddy', 'matorral_espinoso_decan']) {
      expect(BIOMAS_REGIONALES_INDOMALAYA[id]!.suelos, id).toMatch(/HWSD/);
      expect(BIOMAS_REGIONALES_INDOMALAYA[id]!.suelos, id).toMatch(/no se extrajo/);
    }
  });
});

describe('las fuentes: lo que se cita es lo que se pudo leer', () => {
  it('el informe del Banco Mundial se cita por su documento y no por el host que no lo sirve', () => {
    const urls = BIOMAS_REGIONALES_INDOMALAYA['manglares_sundarbans']!.fuentes.map((f) => f.url);
    expect(urls.some((u) => /documents\.worldbank\.org/.test(u))).toBe(true);
    expect(urls.some((u) => /sundarbanaffairswb\.in/.test(u))).toBe(false);
  });

  it('ninguna de las tres cita una fuente que esta máquina no pudo abrir', () => {
    // `era-india.org`, `mdpi.com` y `themimu.info` contestan con una
    // verificación anti-bot; `exporthubs.gov.in` no conecta. Las cuatro venían
    // en la entrega y ninguna entró.
    const cerradas = /era-india\.org|mdpi\.com|themimu\.info|exporthubs\.gov\.in/;
    for (const id of ['manglares_sundarbans', 'bosques_secos_irrawaddy', 'matorral_espinoso_decan']) {
      for (const f of BIOMAS_REGIONALES_INDOMALAYA[id]!.fuentes) {
        expect(f.url, `${id} → ${f.url}`).not.toMatch(cerradas);
      }
    }
  });

  it('el phad no cita el host muerto, y la ficha del Irrawaddy no cita el PDF trunco', () => {
    const phad = practicasDeFicha('matorral_espinoso_decan')[0]!;
    expect(phad.fuentes.every((f) => !/eacpm\.gov\.in/.test(f.url))).toBe(true);
    const mm = practicasDeFicha('bosques_secos_irrawaddy')[0]!;
    expect(mm.fuentes.every((f) => !/thaiscience\.info/.test(f.url))).toBe(true);
  });

  it('cada fuente tiene label descriptivo, como el resto del catálogo', () => {
    for (const id of ['manglares_sundarbans', 'bosques_secos_irrawaddy', 'matorral_espinoso_decan']) {
      for (const f of BIOMAS_REGIONALES_INDOMALAYA[id]!.fuentes) {
        expect(f.label.length, `${id} → ${f.label}`).toBeGreaterThan(20);
        expect(f.url, f.label).toMatch(/^https:\/\//);
      }
    }
  });
});

describe('los cultivos declarados', () => {
  it('el manglar declara sólo los cuatro que el informe respalda', () => {
    // El arroz es la producción principal y el informe nombra además sésamo,
    // algodón y girasol. La hoja de betel y el poroto mungo no tienen id en el
    // catálogo y por eso van nombrados en la prosa, no reemplazados por un
    // pariente.
    expect(BIOMAS_REGIONALES_INDOMALAYA['manglares_sundarbans']!.cultivos)
      .toEqual(['arroz', 'sesamo', 'algodon', 'girasol']);
    expect(BIOMAS_REGIONALES_INDOMALAYA['manglares_sundarbans']!.suelos).toMatch(/hoja de betel/);
  });

  it('el matorral espinoso declara los cinco del perfil distrital, con la cebolla', () => {
    // Trigo, bajra, jowar, cebolla y algodón son los que nombra el perfil de
    // Dhule. La banana y la granada de la entrega venían de un host que no
    // conecta y no entraron.
    expect(BIOMAS_REGIONALES_INDOMALAYA['matorral_espinoso_decan']!.cultivos)
      .toEqual(['trigo', 'mijo', 'sorgo', 'cebolla', 'algodon']);
  });

  it('el Irrawaddy declara los de la tabla de la FAO y dice que es nacional', () => {
    expect(BIOMAS_REGIONALES_INDOMALAYA['bosques_secos_irrawaddy']!.cultivos).toHaveLength(9);
    expect(BIOMAS_REGIONALES_INDOMALAYA['bosques_secos_irrawaddy']!.suelos)
      .toMatch(/es nacional y no una estadística del polígono/);
  });
});
