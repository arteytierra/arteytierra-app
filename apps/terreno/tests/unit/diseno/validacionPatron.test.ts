/**
 * Tests de la validación del patrón de cultivo.
 *
 * Son tres cosas distintas y conviene no mezclarlas:
 *
 *   1. **El método de las facetas triangulares** se prueba contra el paper que
 *      lo publica, con las superficies de las que el paper dice el resultado:
 *      un plano —donde la dirección se conoce exactamente— y el cono de su
 *      figura 4, descripto con sus números («200 minus the radius from the
 *      center on a 16 × 16 grid with grid spacing 10 units»).
 *   2. **El perfil del surco** se prueba con surcos sintéticos donde la
 *      respuesta se sabe de antemano: el que baja hacia su propio medio no
 *      desagua, por más que cada tramo esté dentro de la banda.
 *   3. **El conteo fila por fila** se prueba contra el veredicto que ya había,
 *      y el test que más importa es el que muestra lo que ese veredicto
 *      escondía: diez filas enteras fuera de grado sobre cuarenta no lo mueven.
 *
 * Si alguien vuelve a promediar el patrón entero y a tirar el detalle por fila,
 * el test que se cae es «DIEZ FILAS ENTERAS FUERA DE GRADO…».
 */
import { describe, it, expect } from 'vitest';
import {
  FACETAS_DINF, D8_DIRECCIONES, D8_SEPARACION_DEG, D8_ERROR_MAX_DEG,
  pendienteFaceta, direccionDinf, rumboD8, desvioAngular_deg, medirSesgoD8,
  perfilDeSurco, extremosDelPerfil, trazaDinf, validarPatron, leerValidacion,
  EL_PROMEDIO_ESCONDE_LA_FILA, FUENTE_TARBOTON,
} from '@/lib/validacionPatron';
import { bandaDeriva, resumirPatron, type TramoPatron } from '@/lib/keylineGeometria';
import { generarPatronCultivo } from '@/lib/keyline';
import { grillaMetrica, puntoMetrico } from '../topografia/_grilla';

/** Un plano de pendiente `s` que baja hacia el rumbo `θ` (grados desde el este). */
function plano(s: number, theta_deg: number) {
  const t = (theta_deg * Math.PI) / 180;
  const p = s * Math.cos(t), q = s * Math.sin(t);
  return (x: number, y: number) => 100 - p * x - q * y;
}

/** Accesor de vecinos para `direccionDinf` sobre una función z(x, y) en metros. */
function vecinosDe(f: (x: number, y: number) => number, dx: number, dy: number) {
  return (dr: number, dc: number) => f(dc * dx, dr * dy);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1 · El método de las ocho facetas triangulares
// ─────────────────────────────────────────────────────────────────────────────
describe('las ocho facetas triangulares (Tarboton 1997)', () => {
  it('la tabla es la del paper: ac va 0,1,1,2,2,3,3,4 y af alterna de signo', () => {
    expect(FACETAS_DINF).toHaveLength(8);
    expect(FACETAS_DINF.map(f => f.ac)).toEqual([0, 1, 1, 2, 2, 3, 3, 4]);
    expect(FACETAS_DINF.map(f => f.af)).toEqual([1, -1, 1, -1, 1, -1, 1, -1]);
    // Cada faceta se apoya en un vecino cardinal y uno diagonal contiguo.
    for (const f of FACETAS_DINF) {
      expect(Math.abs(f.e1[0]) + Math.abs(f.e1[1])).toBe(1);
      expect(Math.abs(f.e2[0]) + Math.abs(f.e2[1])).toBe(2);
    }
  });

  it('EL ERROR MÁXIMO DE D8 ES LA MITAD DE LA SEPARACIÓN QUE EL PAPER PUBLICA', () => {
    expect(D8_DIRECCIONES).toBe(8);
    expect(D8_SEPARACION_DEG).toBe(45);
    expect(D8_ERROR_MAX_DEG).toBe(22.5);
  });

  it('una faceta que sube no devuelve pendiente positiva, así que no compite', () => {
    // e0 más bajo que sus dos vecinos: la faceta sube para los dos lados.
    const f = pendienteFaceta({ e0: 10, e1: 12, e2: 14, d1: 10, d2: 10 });
    expect(f.s).toBeLessThan(0);
  });

  it('SOBRE UN PLANO DEVUELVE EL RUMBO EXACTO, QUE ES LO QUE D8 NO PUEDE', () => {
    const d = direccionDinf(vecinosDe(plano(0.1, 22.5), 10, 10), 10, 10);
    expect(d).not.toBeNull();
    expect(d!.rumbo_deg).toBeCloseTo(22.5, 9);
    expect(d!.pendiente).toBeCloseTo(0.1, 9);
  });

  it('Y AHÍ D8 SE EQUIVOCA EN 22,5°, QUE ES JUSTO EL MÁXIMO QUE PUEDE ERRAR', () => {
    const z = vecinosDe(plano(0.1, 22.5), 10, 10);
    const dinf = direccionDinf(z, 10, 10)!;
    const d8 = rumboD8(z, 10, 10)!;
    // D8 sólo puede devolver múltiplos de 45°.
    expect(d8.rumbo_deg % 45).toBeCloseTo(0, 9);
    expect(desvioAngular_deg(dinf.rumbo_deg, d8.rumbo_deg)).toBeCloseTo(D8_ERROR_MAX_DEG, 6);
  });

  it('pero cuando la ladera cae sobre un eje de la grilla los dos coinciden, como dice el paper', () => {
    for (const theta of [0, 45, 90, 135, 180, 225, 270, 315]) {
      const z = vecinosDe(plano(0.08, theta), 10, 10);
      const a = direccionDinf(z, 10, 10)!;
      const b = rumboD8(z, 10, 10)!;
      expect(desvioAngular_deg(a.rumbo_deg, b.rumbo_deg)).toBeCloseTo(0, 6);
      expect(a.pendiente).toBeCloseTo(b.pendiente, 9);
    }
  });

  it('la celda no es cuadrada en ningún predio, y el método la toma como es', () => {
    // 30 m de paso este-oeste contra 20 m norte-sur: el rumbo sigue siendo exacto.
    const d = direccionDinf(vecinosDe(plano(0.05, 70), 30, 20), 30, 20)!;
    expect(d.rumbo_deg).toBeCloseTo(70, 9);
    expect(d.pendiente).toBeCloseTo(0.05, 9);
  });

  it('EL CONO DE LA FIGURA 4 DEL PAPER: LAS FACETAS SIGUEN EL RADIO Y D8 NO', () => {
    // «Elevation was defined as 200 minus the radius from the center on a
    //  16 × 16 grid with grid spacing 10 units.» El centro de ese grid cae en
    //  (75, 75) m, y la dirección verdadera en cada celda es la radial.
    const g = grillaMetrica(16, 16, 10, (x, y) => 200 - Math.hypot(x - 75, y - 75));
    let sumaDinf = 0, sumaD8 = 0, n = 0;
    for (let r = 1; r < 15; r++) {
      for (let c = 1; c < 15; c++) {
        const z = (dr: number, dc: number) => g.elev[(r + dr) * 16 + (c + dc)] ?? NaN;
        const a = direccionDinf(z, 10, 10);
        const b = rumboD8(z, 10, 10);
        if (!a || !b) continue;
        const real = (Math.atan2(r * 10 - 75, c * 10 - 75) * 180) / Math.PI;
        sumaDinf += desvioAngular_deg(a.rumbo_deg, real);
        sumaD8 += desvioAngular_deg(b.rumbo_deg, real);
        n++;
      }
    }
    expect(n).toBe(196);
    const medioDinf = sumaDinf / n, medioD8 = sumaD8 / n;
    // 2,4° contra 10,6°: un factor de más de cuatro. Y los dos errores no son
    // de la misma clase. El de D8 es sesgo —el cono se le vuelve ocho rayos— y
    // no baja aunque la grilla sea más fina; el que queda en las facetas es la
    // curvatura del cono discretizada, y se concentra en las celdas pegadas al
    // vértice, donde no hay plano que valga.
    expect(medioDinf).toBeLessThan(3);
    expect(medioD8).toBeGreaterThan(10);
    expect(medioD8 / medioDinf).toBeGreaterThan(4);
  });

  it('un pozo no se rellena acá: se declara sin resolver, y el que llama avisa', () => {
    const z = (dr: number, dc: number) => (dr === 0 && dc === 0 ? 10 : 20);
    expect(direccionDinf(z, 10, 10)).toBeNull();
  });

  it('el desvío angular es el del círculo: 350° y 10° están a 20°, no a 340°', () => {
    expect(desvioAngular_deg(350, 10)).toBeCloseTo(20, 9);
    expect(desvioAngular_deg(0, 0)).toBe(0);
    expect(desvioAngular_deg(0, 180)).toBeCloseTo(180, 9);
  });

  it('y el sesgo medido es cero en un plano alineado con la grilla', () => {
    const g = grillaMetrica(20, 20, 10, (x) => 100 - 0.1 * x);
    const s = medirSesgoD8(g)!;
    expect(s.celdas).toBeGreaterThan(50);
    expect(s.desvio_max_deg).toBeCloseTo(0, 6);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2 · El perfil del surco
// ─────────────────────────────────────────────────────────────────────────────
/** Surco recto este-oeste a la altura `y`, de `x0` a `x1`. */
function surcoRecto(g: ReturnType<typeof grillaMetrica>, y: number, x0: number, x1: number, paso = 10) {
  const out: Array<{ lat: number; lng: number }> = [];
  for (let x = x0; x <= x1 + 1e-9; x += paso) out.push(puntoMetrico(g, x, y));
  return out;
}

describe('el perfil de un surco', () => {
  const OP = { resolucion_m: 0.5, paso_m: 10 };

  it('un surco que baja parejo entrega el agua en un extremo y en ninguna otra parte', () => {
    const g = grillaMetrica(40, 40, 10, (x) => 100 - 0.01 * x);
    const p = perfilDeSurco(surcoRecto(g, 150, 0, 300), g, OP)!;
    expect(p.salidas).toHaveLength(1);
    expect(p.salidas[0]!.tipo).toBe('extremo');
    expect(p.deriva_max_pct).toBeCloseTo(1, 2);
    expect(p.ramas).toHaveLength(1);
  });

  it('UN SURCO QUE BAJA HACIA SU PROPIO MEDIO TIENE TODA LA DERIVA EN LA BANDA Y NO DESAGUA', () => {
    // El surco cruza una vaguada: baja desde los dos extremos hacia x = 150.
    const g = grillaMetrica(40, 40, 10, (x) => 100 + 0.01 * Math.abs(x - 150));
    const p = perfilDeSurco(surcoRecto(g, 150, 0, 300), g, OP)!;
    const sumideros = p.salidas.filter(s => s.tipo === 'sumidero');
    expect(sumideros).toHaveLength(1);
    expect(sumideros[0]!.prominencia_m).toBeCloseTo(1.5, 1);
    // Y cada rama corre con 1 %, cómodamente adentro de la banda publicada.
    const banda = bandaDeriva({ pendienteTerreno_pct: 10, grupoHidro: null });
    expect(p.deriva_max_pct).toBeCloseTo(1, 1);
    expect(p.deriva_max_pct).toBeLessThan(banda.max_pct);
    expect(p.ramas).toHaveLength(2);
  });

  it('pero una ondulación más chica que lo que el modelo resuelve NO es un sumidero', () => {
    // La misma vaguada, 8 cm de hondo, con un modelo que resuelve 50 cm.
    const g = grillaMetrica(40, 40, 10, (x) => 100 - 0.01 * x + 0.0005 * Math.abs(x - 150));
    const p = perfilDeSurco(surcoRecto(g, 150, 0, 300), g, OP)!;
    expect(p.salidas.filter(s => s.tipo === 'sumidero')).toHaveLength(0);
  });

  it('CON 300 M DE SURCO Y UN MODELO DE 2 M, EL PISO PUBLICADO DE 0,2 % NO SE PUEDE MEDIR', () => {
    const g = grillaMetrica(40, 40, 10, (x) => 100 - 0.002 * x);
    const p = perfilDeSurco(surcoRecto(g, 150, 0, 300), g, { resolucion_m: 2, paso_m: 10 })!;
    expect(p.resolucion_pct).toBeCloseTo(0.67, 1);
    expect(p.deriva_max_pct).toBeCloseTo(0.2, 2);
    expect(p.medible).toBe(false);
    // Para que ese 0,2 % se despegue de cero hace falta un kilómetro de surco.
    expect(2 / 0.002).toBe(1000);
  });

  it('los extremos del perfil se filtran por prominencia y los bordes del surco siempre quedan', () => {
    const z = [10, 9, 8, 8.9, 8, 7, 6];     // la jorobita de 0,9 m
    expect(extremosDelPerfil(z, 2)).toEqual([0, 6]);
    expect(extremosDelPerfil(z, 0.5)).toEqual([0, 2, 3, 6]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3 · Fila por fila, que es lo que el estándar limita
// ─────────────────────────────────────────────────────────────────────────────
describe('el veredicto fila por fila', () => {
  it('DIEZ FILAS ENTERAS FUERA DE GRADO SOBRE CUARENTA NO MUEVEN EL VEREDICTO DEL CONJUNTO', () => {
    const banda = bandaDeriva({ pendienteTerreno_pct: 20, grupoHidro: null });
    expect(banda.max_pct).toBe(4);
    const tramos: TramoPatron[] = [];
    for (let i = 0; i < 40; i++) {
      const mala = i < 10;
      tramos.push({ largo_m: 100, deriva_pct: mala ? 6 : 2, haciaLadera: true });
    }
    const r = resumirPatron(tramos, banda);
    expect(r.fraccionExcedida).toBe(0.25);
    expect(r.veredicto).toBe('keyline');     // ← diez surcos que erosionan, y dice que está bien
    // El conteo por fila dice lo otro, que es lo que el estándar limita.
    expect(tramos.filter(t => t.deriva_pct > banda.max_pct)).toHaveLength(10);
    expect(EL_PROMEDIO_ESCONDE_LA_FILA).toContain('1/N');
  });

  it('valida el patrón fila por fila y nombra la peor', () => {
    // Tres surcos parejos y uno que cruza una vaguada.
    const g = grillaMetrica(60, 60, 10, (x, y) => 100 - 0.01 * x + (y > 240 && y < 320 ? 0.02 * Math.abs(x - 250) : 0));
    const banda = bandaDeriva({ pendienteTerreno_pct: 10, grupoHidro: null });
    const lineas = [100, 180, 280, 400].map(y => surcoRecto(g, y, 50, 450));
    const v = validarPatron({ lineas, banda }, g, { resolucion_m: 0.5, paso_m: 10 })!;
    expect(v.filas).toHaveLength(4);
    expect(v.conteo.encharca).toBe(1);
    expect(v.peor).toBe(2);
    expect(v.filasFuera).toBe(1);
    expect(v.fuentes[0]).toBe(FUENTE_TARBOTON);
    expect(leerValidacion(v)).toContain('junta el agua adentro del surco');
  });

  it('SIN UNA SOLA FILA MEDIBLE NO INVENTA UN VEREDICTO: DEVUELVE NULL', () => {
    const g = grillaMetrica(20, 20, 10, () => 100);
    const banda = bandaDeriva({ pendienteTerreno_pct: 5, grupoHidro: null });
    expect(validarPatron({ lineas: [], banda }, g)).toBeNull();
  });

  it('una fila cuya deriva no llega a la resolución del modelo no recibe un número, recibe un aviso', () => {
    const g = grillaMetrica(40, 40, 10, (x) => 100 - 0.001 * x);
    const banda = bandaDeriva({ pendienteTerreno_pct: 10, grupoHidro: null });
    const v = validarPatron({ lineas: [surcoRecto(g, 150, 0, 300)], banda }, g, { resolucion_m: 2, paso_m: 10 })!;
    expect(v.filas[0]!.veredicto).toBe('no_medible');
    expect(v.filas[0]!.motivo).toContain('no del terreno');
    expect(v.largoParaElPiso_m).toBeNull();   // sin grupo C/D no hay piso publicado
  });

  it('con suelo C el piso existe, y entonces aparece el largo de surco que ese piso necesita', () => {
    const g = grillaMetrica(40, 40, 10, (x) => 100 - 0.01 * x);
    const banda = bandaDeriva({ pendienteTerreno_pct: 10, grupoHidro: 'C' });
    expect(banda.min_pct).toBe(0.2);
    const v = validarPatron({ lineas: [surcoRecto(g, 150, 0, 300)], banda }, g, { resolucion_m: 2, paso_m: 10 })!;
    expect(v.largoParaElPiso_m).toBe(1000);
    expect(v.advertencias.join(' ')).toContain('1000 m de surco');
  });

  it('LA TRAZA DESDE LA SALIDA VA Y MIRA DÓNDE TERMINA EL AGUA, EN VEZ DE SUPONERLO', () => {
    // Una vaguada que baja hacia el este con su eje en y = 300.
    const g = grillaMetrica(60, 60, 10, (x, y) => 100 - 0.02 * x + 0.05 * Math.abs(y - 300));
    const t = trazaDinf(g, puntoMetrico(g, 200, 400), {
      paso_m: 10,
      esEjeDeValle: (lat) => {
        const dLat = (g.latMax - g.latMin) / (g.rows - 1);
        const y = ((lat - g.latMin) / dLat) * 10;
        return Math.abs(y - 300) < 15;
      },
    });
    expect(t.final).toBe('eje_de_valle');
    expect(t.largo_m).toBeGreaterThan(0);
    expect(t.caida_m).toBeGreaterThan(0);
  });

  it('y si el agua se va del terreno sin cruzar un eje, lo dice en vez de forzar un destino', () => {
    const g = grillaMetrica(40, 40, 10, (x) => 100 - 0.02 * x);
    const t = trazaDinf(g, puntoMetrico(g, 200, 200), { paso_m: 10, esEjeDeValle: () => false });
    expect(t.final).toBe('borde');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4 · El patrón completo, validado contra el terreno que lo produjo
// ─────────────────────────────────────────────────────────────────────────────
describe('generarPatronCultivo validado', () => {
  // El mismo valle parabólico de los tests de geometría, a escala de predio:
  // 400 × 640 m, con el eje del valle en y = 200.
  const valle = grillaMetrica(51, 81, 8, (x, y) => 0.05 * x + 0.00005 * Math.pow(y - 200, 2));
  const parcela = [
    puntoMetrico(valle, 160, 56), puntoMetrico(valle, 520, 56),
    puntoMetrico(valle, 520, 344), puntoMetrico(valle, 160, 344),
  ];
  const patron = generarPatronCultivo(valle, parcela, {
    espaciado_m: 40, anchoImplemento_m: 3, grupoHidro: 'C', lado: 'abajo',
  })!;

  it('el patrón ahora sale validado, con la fuente del método y el sesgo medido', () => {
    expect(patron.validacion).not.toBeNull();
    expect(patron.validacion!.fuentes[0]).toContain('Tarboton');
    expect(patron.validacion!.filas.length).toBe(patron.lineas.length);
  });

  it('EL VEREDICTO DEL CONJUNTO DICE «KEYLINE» SOBRE 45 CM DE RELIEVE EN 280 M DE SURCO', () => {
    // El resumen de todo el patrón da un veredicto sin mirar si el dato alcanza.
    expect(patron.resumen.veredicto).toBe('keyline');
    // La validación mira el surco entero: 45 cm de variación con un modelo que
    // resuelve 2 m. No es que el surco corra a nivel: es que no se puede saber.
    const fila = patron.validacion!.filas.find(f => f.largo_m > 200)!;
    expect(fila.desnivel_m).toBeLessThan(patron.validacion!.resolucion_m);
    expect(fila.veredicto).toBe('no_medible');
    expect(patron.validacion!.conteo.no_medible).toBe(patron.lineas.length);
    expect(patron.validacion!.advertencias.join(' ')).toContain('por debajo de lo que este modelo distingue');
  });

  it('y el piso de 0,2 % en suelo C pide un kilómetro de surco que esta parcela no tiene', () => {
    expect(patron.banda.min_pct).toBe(0.2);
    expect(patron.validacion!.largoParaElPiso_m).toBe(1000);
    expect(patron.validacion!.advertencias.join(' ')).toContain('1000 m de surco');
  });

  it('EN ESTE VALLE D8 SE DESVÍA 10° DE PROMEDIO Y ROZA SU MÁXIMO TEÓRICO', () => {
    const s = patron.validacion!.sesgoD8!;
    expect(s.desvio_medio_deg).toBeGreaterThan(5);
    expect(s.desvio_max_deg).toBeGreaterThan(15);
    expect(s.desvio_max_deg).toBeLessThanOrEqual(D8_ERROR_MAX_DEG);
  });
});
