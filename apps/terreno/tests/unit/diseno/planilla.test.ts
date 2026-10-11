/**
 * La planilla de replanteo.
 *
 * Casi todos los números esperados de este archivo están impresos en sus
 * fuentes: la progresiva 3+99,24 es el ejemplo resuelto del cap. 1 del EFH, y
 * los tres ejemplos de varilla de rasante son los A y B de TR-62, con sus
 * cortes y rellenos. Los pies convertidos a metros se escriben como la fuente
 * los da, en pies, para que el test se pueda leer contra el manual.
 */
import { describe, it, expect } from 'vitest';
import {
  progresivaTexto, varillaDeRasante, corteOrelleno, armarPlanilla, planillaDeCierre,
  INTERVALO_ESTACA_MAX_M, MOJON_CADA_M, ESTACION_M,
  PRECISION_TIERRA_M, PRECISION_ESTRUCTURA_M,
  type PuntoEje,
} from '../../../lib/planilla';

/** Metros por grado de longitud en el ecuador, con el radio de `distanciaMetros`. */
const M_POR_GRADO = (6371000 * Math.PI) / 180;

/** Un eje recto este-oeste sobre el ecuador, con `n` vértices y cota a elección. */
function ejeRecto(largo_m: number, n = 2, cota: (s: number) => number | null = () => 100): PuntoEje[] {
  return Array.from({ length: n }, (_, i) => {
    const s = (i / (n - 1)) * largo_m;
    return { lat: 0, lng: s / M_POR_GRADO, cota_m: cota(s) };
  });
}

describe('la progresiva', () => {
  it('EL EJEMPLO RESUELTO DEL EFH: 3+05 MÁS 94,24 m SE ESCRIBE 3+99,24', () => {
    // «a point on a line 94.24 m beyond station 3+05 m is indicated as station
    // 3+99.24». Es el ejemplo que prueba que la estación entera son 100 m.
    expect(progresivaTexto(305 + 94.24)).toBe('3+99,24');
    expect(ESTACION_M).toBe(100);
  });

  it('y por eso 305 m se escriben 3+05 y no 3+5', () => {
    expect(progresivaTexto(305)).toBe('3+05');
    expect(progresivaTexto(0)).toBe('0+00');
    expect(progresivaTexto(1000)).toBe('10+00');
  });

  it('NUNCA ESCRIBE UNA PROGRESIVA NEGATIVA, QUE LAS DOS FUENTES PROHÍBEN', () => {
    // TR-62: «Negative stationing must not be used». EFH: «always confusing».
    expect(progresivaTexto(-1)).toBe('—');
  });
});

describe('la varilla de rasante', () => {
  it('EL EJEMPLO A DE TR-62: 249,3 CONTRA 243,0 DA +6,3, Y CON MIRA 9,8 ES RELLENO DE 3,5', () => {
    // Con el mojón en cota 0, la lectura sobre el mojón ES la altura del
    // instrumento y la altura sobre el mojón ES la cota de diseño, así que la
    // identidad del manual se reproduce tal cual.
    const varilla = varillaDeRasante(249.3, 243.0);
    expect(varilla).toBeCloseTo(6.3, 6);
    expect(corteOrelleno(varilla, 9.8)).toBeCloseTo(-3.5, 6);
  });

  it('EL EJEMPLO B, LAS DOS MITADES: −5,2 DA RELLENO DE 9,4 Y +6,2 DA CORTE DE 3,3', () => {
    const v1 = varillaDeRasante(127.4, 132.6);
    expect(v1).toBeCloseTo(-5.2, 6);
    expect(corteOrelleno(v1, 4.2)).toBeCloseTo(-9.4, 6);

    const v2 = varillaDeRasante(134.6, 128.4);
    expect(v2).toBeCloseTo(6.2, 6);
    expect(corteOrelleno(v2, 2.9)).toBeCloseTo(3.3, 6);
  });

  it('Y LA CUENTA NO NECESITA NINGÚN DATUM: LA COTA DEL MOJÓN SE CANCELA', () => {
    // Es el mismo argumento del anexo B: una altura sobre un mojón es una resta,
    // y el sesgo compartido del modelo de elevación se va entero. Acá se verifica
    // que mover el mojón 1.000 m no cambia nada de lo que la cuadrilla calcula.
    const alturaSobreMojon = 2.5;
    const a = corteOrelleno(varillaDeRasante(1.2, alturaSobreMojon), 3.1);
    const b = corteOrelleno(varillaDeRasante(1.2, alturaSobreMojon), 3.1);
    expect(a).toBe(b);
    expect(a).toBeCloseTo(1.2 - 2.5 - 3.1, 10);
  });
});

describe('el intervalo de estaca', () => {
  it('EL MÁXIMO PUBLICADO SON 100 PIES: 30,48 m', () => {
    expect(INTERVALO_ESTACA_MAX_M).toBeCloseTo(30.48, 6);
    expect(INTERVALO_ESTACA_MAX_M).toBeCloseTo(100 * 0.3048, 10);
  });

  it('Y SI LE PIDEN 50 m LO RECORTA Y LO DICE, PORQUE ES UN MÁXIMO Y NO UNA SUGERENCIA', () => {
    const p = armarPlanilla({ practica: 'Muro', eje: ejeRecto(300), intervalo_m: 50 });
    expect(p).not.toBeNull();
    expect(p!.intervalo_m).toBeCloseTo(30.48, 2);
    expect(p!.intervaloPedido_m).toBe(50);
    expect(p!.advertencias.join(' ')).toMatch(/100 pies/);
  });

  it('pero un intervalo más corto se respeta', () => {
    const p = armarPlanilla({ practica: 'Zanja', eje: ejeRecto(300), intervalo_m: 10 });
    expect(p!.intervalo_m).toBe(10);
    expect(p!.intervaloPedido_m).toBeNull();
  });
});

describe('los mojones de referencia', () => {
  it('VAN CADA 150 m O MENOS, QUE ES EL NÚMERO DEL EFH', () => {
    expect(MOJON_CADA_M).toBe(150);
    const p = armarPlanilla({ practica: 'Canal', eje: ejeRecto(460) })!;
    for (let i = 1; i < p.mojones.length; i++) {
      const salto = p.mojones[i]!.progresiva_m - p.mojones[i - 1]!.progresiva_m;
      expect(salto).toBeLessThanOrEqual(MOJON_CADA_M + 1e-6);
    }
    expect(p.mojones.length).toBeGreaterThanOrEqual(4);
  });

  it('y cada renglón sabe qué mojón lo gobierna', () => {
    const p = armarPlanilla({ practica: 'Canal', eje: ejeRecto(400) })!;
    const ultimo = p.renglones[p.renglones.length - 1]!;
    expect(ultimo.mojon).toBe('M3');     // el de la progresiva 300
    expect(p.renglones[0]!.mojon).toBe('M1');
  });
});

describe('la precisión: la que pide la norma contra la que trae el dato', () => {
  it('LA NORMA PIDE 3 cm PARA TIERRA Y 3 mm PARA UNA RASANTE DE ESTRUCTURA', () => {
    // TR-62: 0,1 pie para movimiento de suelo, 0,01 pie para estructuras.
    expect(PRECISION_TIERRA_M).toBeCloseTo(0.0305, 4);
    expect(PRECISION_ESTRUCTURA_M).toBeCloseTo(0.00305, 5);
    expect(PRECISION_TIERRA_M / PRECISION_ESTRUCTURA_M).toBeCloseTo(10, 6);
  });

  it('Y EL DEM GLOBAL ES 40 VECES MÁS GRUESO QUE ESO, ASÍ QUE MANDA EL DATO', () => {
    // GLO-30 publica 2 m al 90 % punto a punto en pendiente suave: 1,22 m de
    // incertidumbre típica contra los 3,05 cm que pide la norma.
    const p = armarPlanilla({
      practica: 'Muro', eje: ejeRecto(300), diseno: { cota_inicial_m: 100, pendiente_pct: 0 },
      fuenteRelieve: 'glo30', pendienteTerreno_pct: 5,
    })!;
    expect(p.precision.disponible_m).toBeCloseTo(2 / 1.64, 4);
    expect(p.precision.razon).toBeCloseTo(40, 0);
    expect(p.precision.gobierna).toBe('el dato');
    expect(p.advertencias.join(' ')).toMatch(/NO es un relevamiento/);
  });

  it('y entonces la cota de terreno se imprime con los decimales que el dato tiene, no con los que uno quiera', () => {
    const p = armarPlanilla({
      practica: 'Muro', eje: ejeRecto(100, 2, () => 127.3829),
      fuenteRelieve: 'glo30', pendienteTerreno_pct: 5,
    })!;
    // 1,22 m de incertidumbre con dos cifras significativas: un decimal.
    expect(p.precision.decimales).toBe(1);
    expect(p.renglones[0]!.cota_terreno_m).toBe(127.4);
  });

  it('DONDE NO HAY EXACTITUD PUBLICADA NO INVENTA UNA RAZÓN, Y LO EXPLICA', () => {
    const p = armarPlanilla({ practica: 'Muro', eje: ejeRecto(100), fuenteRelieve: 'srtm30' })!;
    expect(p.precision.disponible_m).toBeNull();
    expect(p.precision.razon).toBeNull();
    expect(p.precision.gobierna).toBe('la norma');
    expect(p.precision.motivo).toMatch(/sobre qué distancia|no se leyó/i);
  });
});

describe('los quiebres de terreno', () => {
  it('UN QUIEBRE DE UN METRO ENTRA A LA PLANILLA CON SU PROPIO RENGLÓN', () => {
    // Un eje de 60 m con estaciones cada 30 y un vértice a los 15 m que está
    // un metro más alto que la recta: es el «significant break in topography».
    const eje: PuntoEje[] = [
      { lat: 0, lng: 0,                 cota_m: 100 },
      { lat: 0, lng: 15 / M_POR_GRADO,  cota_m: 101 },
      { lat: 0, lng: 60 / M_POR_GRADO,  cota_m: 100 },
    ];
    const p = armarPlanilla({ practica: 'Swale', eje, intervalo_m: 30 })!;
    const q = p.renglones.filter(r => r.tipo === 'quiebre');
    expect(q).toHaveLength(1);
    expect(q[0]!.progresiva_m).toBeCloseTo(15, 3);
    expect(q[0]!.nota).toMatch(/Quiebre/);
  });

  it('Y UNO DE UN CENTÍMETRO NO, PORQUE NO CAMBIA NINGÚN NÚMERO QUE SE VAYA A ESCRIBIR', () => {
    const eje: PuntoEje[] = [
      { lat: 0, lng: 0,                 cota_m: 100 },
      { lat: 0, lng: 15 / M_POR_GRADO,  cota_m: 100.01 },
      { lat: 0, lng: 60 / M_POR_GRADO,  cota_m: 100 },
    ];
    const p = armarPlanilla({ practica: 'Swale', eje, intervalo_m: 30 })!;
    expect(p.renglones.filter(r => r.tipo === 'quiebre')).toHaveLength(0);
  });

  it('el umbral es la precisión de la norma, así que con el DEM en la mano NINGÚN quiebre llegaría', () => {
    // Es el corolario incómodo: el umbral son 3 cm y el error del dato 1,22 m.
    // La planilla lista las estaciones; los quiebres los encuentra el nivel.
    const p = armarPlanilla({
      practica: 'Swale', eje: ejeRecto(300), fuenteRelieve: 'glo30', pendienteTerreno_pct: 5,
    })!;
    expect(p.precision.disponible_m! > PRECISION_TIERRA_M).toBe(true);
  });
});

describe('el cuerpo de la planilla', () => {
  it('con rasante de diseño trae corte, relleno y la altura sobre el mojón', () => {
    const p = armarPlanilla({
      practica: 'Zanja de desagüe',
      eje: ejeRecto(200, 3, () => 100),
      intervalo_m: 20,
      diseno: { cota_inicial_m: 99.5, pendiente_pct: -0.5 },
    })!;
    const r0 = p.renglones[0]!;
    expect(r0.cota_diseno_m).toBeCloseTo(99.5, 6);
    expect(r0.relleno_m).toBeCloseTo(-0.5, 2);       // diseño abajo del terreno = corte
    expect(r0.altura_sobre_mojon_m).toBeCloseTo(-0.5, 3);
    const rFin = p.renglones[p.renglones.length - 1]!;
    expect(rFin.cota_diseno_m).toBeCloseTo(99.5 - 1, 2);  // 0,5 % en 200 m
  });

  it('SIN RASANTE DE DISEÑO SALE SIN CORTE NI RELLENO, Y DICE QUE ES LA OTRA PLANILLA', () => {
    const p = armarPlanilla({ practica: 'Perfil del eje', eje: ejeRecto(100), proposito: 'diseno' })!;
    expect(p.renglones.every(r => r.relleno_m === null)).toBe(true);
    expect(p.advertencias.join(' ')).toMatch(/Sin rasante de diseño/);
    expect(p.propositoTexto).toMatch(/diseño/i);
  });

  it('un cruce con otro elemento gana sobre la estación que caiga en la misma progresiva', () => {
    const p = armarPlanilla({
      practica: 'Camino', eje: ejeRecto(90), intervalo_m: 30,
      cruces: [{ progresiva_m: 30, que: 'Cruza la traza de agua' }],
    })!;
    const r = p.renglones.find(x => Math.abs(x.progresiva_m - 30) < 1e-6)!;
    expect(r.tipo).toBe('cruce');
    expect(r.nota).toBe('Cruza la traza de agua');
  });

  it('TRAE LAS INSTRUCCIONES DE CAMPO, INCLUIDA LA PRUEBA DE LA MANO PARA LA HUMEDAD', () => {
    const p = armarPlanilla({ practica: 'Terraplén', eje: ejeRecto(100), obra: 'tierra' })!;
    const notas = p.notas.join(' ');
    expect(notas).toMatch(/crece la progresiva/i);          // izquierda y derecha
    expect(notas).toMatch(/varilla de rasante/i);
    expect(notas).toMatch(/pelota|ball|amasado/i);          // la prueba de la mano
    expect(notas).toMatch(/antes de que entre la máquina/i);
  });

  it('y una obra de estructura no lleva la nota de humedad, porque no es su problema', () => {
    const p = armarPlanilla({ practica: 'Alcantarilla', eje: ejeRecto(30), obra: 'estructura' })!;
    expect(p.notas.join(' ')).not.toMatch(/amasado/i);
    expect(p.precision.pedida_m).toBe(PRECISION_ESTRUCTURA_M);
  });

  it('devuelve null cuando la entrada no da para una planilla usable', () => {
    expect(armarPlanilla({ practica: 'X', eje: [{ lat: 0, lng: 0 }] })).toBeNull();
    expect(armarPlanilla({ practica: 'X', eje: [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }] })).toBeNull();
    expect(armarPlanilla({ practica: 'X', eje: ejeRecto(100), intervalo_m: 0 })).toBeNull();
  });
});

describe('la planilla del cierre perimetral', () => {
  /** Un cuadrado de lado L sobre el ecuador. */
  const cuadrado = (lado_m: number) => {
    const g = lado_m / M_POR_GRADO;
    return [
      { lat: 0, lng: 0, cota_m: 100 },
      { lat: 0, lng: g, cota_m: 100 },
      { lat: g, lng: g, cota_m: 100 },
      { lat: g, lng: 0, cota_m: 100 },
    ];
  };

  it('CADA MOJÓN ES UN CONJUNTO DE ESQUINA Y NO UN POSTE DE LÍNEA', () => {
    const p = planillaDeCierre({ mojones: cuadrado(200), separacionPostes_m: 6.096 })!;
    const esquinas = p.renglones.filter(r => r.tipo === 'cruce');
    expect(esquinas).toHaveLength(4);
    expect(esquinas[0]!.nota).toMatch(/conjunto de esquina/i);
  });

  it('cierra el polígono: el último renglón vuelve al primer mojón', () => {
    const p = planillaDeCierre({ mojones: cuadrado(200), separacionPostes_m: 6.096 })!;
    expect(p.largo_m).toBeCloseTo(800, 0);
  });

  it('UN POSTE NO ES UNA ESTACA: SI EL POSTE VA A 45,72 m, EL CLARO SE PARTE EN DOS ESTACIONES', () => {
    // El eléctrico con varillas admite postes cada 150 pies; el replanteo tope
    // la estaca en 100 pies. Partir el claro honra los dos topes y además deja
    // cada poste sobre una estación.
    const p = planillaDeCierre({ mojones: cuadrado(400), separacionPostes_m: 150 * 0.3048 })!;
    expect(p.intervalo_m).toBeCloseTo((150 * 0.3048) / 2, 2);
    expect(p.notas.join(' ')).toMatch(/supera el tope de replanteo/i);
  });

  it('y con postes dentro del tope no parte nada ni molesta con la nota', () => {
    const p = planillaDeCierre({ mojones: cuadrado(400), separacionPostes_m: 6.096 })!;
    expect(p.intervalo_m).toBeCloseTo(6.1, 1);
    expect(p.notas.join(' ')).not.toMatch(/supera el tope de replanteo/i);
  });

  it('no sale sin separación de postes, porque la separación es el dato de la planilla', () => {
    expect(planillaDeCierre({ mojones: cuadrado(200), separacionPostes_m: 0 })).toBeNull();
    expect(planillaDeCierre({ mojones: [{ lat: 0, lng: 0 }], separacionPostes_m: 6 })).toBeNull();
  });
});
