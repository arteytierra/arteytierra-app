import { describe, it, expect } from 'vitest';
import {
  aHomolosine,
  zonaHomolosine,
  _desplazamientoMollweideM,
  _latEmpalme,
} from '@/lib/homolosine';

/**
 * La Goode Homolosine interrumpida decide en qué píxel de SoilGrids cae un
 * predio. Si la proyección está mal, la app no se estrella: imprime el suelo de
 * otro lugar del planeta, con la misma cara de siempre. De ahí que estos tests
 * no verifiquen que devuelve un número.
 *
 * Los casos resueltos son propiedades de la proyección que se pueden comprobar
 * sin red y sin PROJ instalado: que los lóbulos se peguen donde tienen que
 * pegarse, que el ancho del lienzo sea el que es, y que el corrimiento de las
 * zonas Mollweide sea el que hace continuo el empalme.
 */

const R = 6_378_137;                      // radio de la esfera igh, en metros
const grados = (g: number) => (g * Math.PI) / 180;

/** Un kilómetro de tolerancia: el paso de la grilla que vamos a leer. */
const UN_KM = 1_000;

describe('zonaHomolosine — las doce zonas de igh.cpp', () => {
  it('parte el norte en dos lóbulos por el meridiano −40', () => {
    // Mollweide arriba de la latitud de empalme
    expect(zonaHomolosine(60, -90)).toBe(1);
    expect(zonaHomolosine(60,  30)).toBe(2);
    // sinusoidal entre el ecuador y el empalme
    expect(zonaHomolosine(20, -90)).toBe(3);
    expect(zonaHomolosine(20,  30)).toBe(4);
  });

  it('parte el sur en cuatro lóbulos por −100, −20 y 80', () => {
    expect(zonaHomolosine(-20, -150)).toBe(5);
    expect(zonaHomolosine(-20,  -60)).toBe(6);
    expect(zonaHomolosine(-20,   20)).toBe(7);
    expect(zonaHomolosine(-20,  140)).toBe(8);
    expect(zonaHomolosine(-60, -150)).toBe(9);
    expect(zonaHomolosine(-60,  -60)).toBe(10);
    expect(zonaHomolosine(-60,   20)).toBe(11);
    expect(zonaHomolosine(-60,  140)).toBe(12);
  });

  it('pone el borde en la zona de la izquierda, como hace igh.cpp con <=', () => {
    expect(zonaHomolosine(20, -40)).toBe(3);
    expect(zonaHomolosine(20, -39.999)).toBe(4);
    expect(zonaHomolosine(-20, -100)).toBe(5);
    expect(zonaHomolosine(-20, -99.999)).toBe(6);
    expect(zonaHomolosine(-20, 80)).toBe(7);
    expect(zonaHomolosine(-20, 80.001)).toBe(8);
  });

  it('normaliza la longitud, así 200° es −160°', () => {
    expect(zonaHomolosine(-20, 200)).toBe(zonaHomolosine(-20, -160));
    expect(aHomolosine(-20, 200).x).toBeCloseTo(aHomolosine(-20, -160).x, 6);
  });
});

describe('aHomolosine — casos resueltos', () => {
  it('manda el origen al origen', () => {
    const o = aHomolosine(0, 0);
    expect(o.x).toBeCloseTo(0, 6);
    expect(o.y).toBeCloseTo(0, 6);
  });

  it('abre el lienzo a ±π·R en el ecuador, que son ±20.037 km', () => {
    // El ráster de SoilGrids mide 39.812 px de 1 km: el mundo entero menos el
    // recorte a donde hay dato. Su ancho teórico es 2·π·R.
    //
    // El borde oeste se pide con −179,9999 y no con −180 porque ±180 es el mismo
    // meridiano y la normalización lo lleva a +180, que en una proyección
    // interrumpida es el otro extremo del lienzo. Esa diezmilésima de grado son
    // 11 m, de ahí el kilómetro de tolerancia.
    expect(aHomolosine(0, 180).x).toBeCloseTo(Math.PI * R, 0);
    expect(Math.abs(aHomolosine(0, -179.9999).x + Math.PI * R)).toBeLessThan(UN_KM);
  });

  it('en el ecuador la latitud es lineal: y = R·φ', () => {
    expect(aHomolosine(30, 20).y).toBeCloseTo(R * grados(30), 6);
    expect(aHomolosine(-30, 20).y).toBeCloseTo(R * grados(-30), 6);
  });

  it('pega los lóbulos del norte en el ecuador, sobre el meridiano −40', () => {
    // Las interrupciones son huecos que se abren al alejarse del ecuador; en el
    // ecuador mismo los dos lóbulos tienen que coincidir.
    const izq = aHomolosine(0, -40);          // zona 3
    const der = aHomolosine(0, -39.9999);     // zona 4
    expect(izq.zona).toBe(3);
    expect(der.zona).toBe(4);
    expect(Math.abs(izq.x - der.x)).toBeLessThan(UN_KM);
  });

  it('pega los cuatro lóbulos del sur en el ecuador', () => {
    for (const corte of [-100, -20, 80]) {
      const izq = aHomolosine(-0.0001, corte);
      const der = aHomolosine(-0.0001, corte + 0.0001);
      expect(Math.abs(izq.x - der.x)).toBeLessThan(UN_KM);
    }
  });

  it('abre el hueco al alejarse del ecuador, que es de lo que se trata "interrumpida"', () => {
    // Si esto no pasara, la proyección sería la Goode continua y los píxeles
    // estarían corridos cientos de kilómetros.
    const izq = aHomolosine(20, -40);
    const der = aHomolosine(20, -39.9999);
    expect(Math.abs(izq.x - der.x)).toBeGreaterThan(800 * UN_KM);
  });

  it('empalma la sinusoidal con la Mollweide sin escalón, que es para lo que existe el corrimiento', () => {
    // Sobre el meridiano central de la zona (−100), en la latitud de empalme, la
    // zona 3 (sinusoidal) y la 1 (Mollweide) tienen que dar el mismo punto. Es
    // la ecuación que define `_desplazamientoMollweideM`.
    const abajo = aHomolosine(_latEmpalme - 0.0001, -100);
    const arriba = aHomolosine(_latEmpalme, -100);
    expect(abajo.zona).toBe(3);
    expect(arriba.zona).toBe(1);
    expect(Math.abs(arriba.y - abajo.y)).toBeLessThan(UN_KM);
    expect(Math.abs(arriba.x - abajo.x)).toBeLessThan(1);
  });

  it('empalma también en el sur, con el corrimiento al revés', () => {
    const arriba = aHomolosine(-_latEmpalme, -60);        // zona 6, sinusoidal
    const abajo  = aHomolosine(-_latEmpalme - 0.0001, -60); // zona 10, Mollweide
    expect(arriba.zona).toBe(6);
    expect(abajo.zona).toBe(10);
    expect(Math.abs(arriba.y - abajo.y)).toBeLessThan(UN_KM);
  });

  it('fija el corrimiento de las zonas Mollweide en −336.788 m', () => {
    // Medido el 26/09/2026 con proj4 2.20.8. Está clavado a propósito: si una
    // versión nueva de proj4 cambiara su Mollweide, el mundo se correría 337 km
    // y tiene que romperse acá, no en un informe.
    expect(_desplazamientoMollweideM).toBeCloseTo(-336_788, -1);
  });

  it('deja Tierra del Fuego dentro del ráster de SoilGrids', () => {
    // El ráster va de y = 8.361.000 a y = −6.148.000 (leído de su ModelTiepoint
    // el 26/09/2026). El borde sur existe porque ahí se termina la tierra con
    // suelo: la punta de Tierra del Fuego. Si el signo del corrimiento del sur
    // estuviera invertido, este punto se saldría del ráster.
    const tdf = aHomolosine(-55.9, -67.3);
    expect(tdf.zona).toBe(10);
    expect(tdf.y).toBeGreaterThan(-6_148_000);
    expect(tdf.y).toBeLessThan(-6_000_000);
  });

  it('mantiene dentro del ráster los puntos que la app tiene que resolver', () => {
    const puntos: Array<[string, number, number]> = [
      ['Pampa',      -33.5,  -61.5],
      ['Java',        -7.75, 112.5],
      ['Iowa',        42.03, -93.6],
      ['Punjab',      30.9,   75.85],
      ['Congo',       -1.0,   22.0],
      ['Kiev',        50.45,  30.52],
      ['Saskatoon',   52.13, -106.67],
      ['Nueva Gales', -33.0, 148.0],
    ];
    for (const [nombre, lat, lng] of puntos) {
      const { x, y } = aHomolosine(lat, lng);
      expect(x, nombre).toBeGreaterThan(-19_949_750);
      expect(x, nombre).toBeLessThan(19_862_250);
      expect(y, nombre).toBeGreaterThan(-6_148_000);
      expect(y, nombre).toBeLessThan(8_361_000);
    }
  });
});
