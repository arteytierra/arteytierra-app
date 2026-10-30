import { describe, it, expect } from 'vitest';
import {
  ESTRATOS_CORTINA,
  FACTOR_PROTECCION,
  LARGO_MINIMO_H,
  construirCortina,
  sugerirCortina,
} from '@/lib/cortinas';

/*
 * La cortina rompevientos: una banda de plantación y la zona que resguarda.
 *
 * Lo que este archivo protege son las tres afirmaciones de Brandle, Hodges,
 * Tyndall y Sudmeyer (2009), «Windbreak Practices», en North American
 * Agroforestry, 2.ª ed., cap. 29:
 *
 *   - el reparo a sotavento llega de 10 a 30 veces la altura (la app usa 15);
 *   - la cortina va perpendicular al viento;
 *   - y tiene que medir al menos diez veces su altura, o el aire da la vuelta
 *     por las puntas.
 *
 * La tercera no estaba: el piso de largo de `sugerirCortina` eran 60 m fijos,
 * así que una cortina de 10 m de alto podía salir con 6 H de largo y la app
 * informaba sus hectáreas resguardadas como si no pasara nada.
 *
 * Y la cuarta cosa, que es de dónde sopla, vive en `lib/viento.ts` y se prueba
 * en `tests/unit/clima/viento.test.ts`: acá sólo se comprueba que sin azimut no
 * se construye nada.
 */

/** Un predio chico y cuadrado, de unos 400 m de lado, en Córdoba. */
const MOJONES = [
  { lat: -31.400, lng: -64.200 },
  { lat: -31.400, lng: -64.1958 },
  { lat: -31.4036, lng: -64.1958 },
  { lat: -31.4036, lng: -64.200 },
];
const CASA = { lat: -31.4018, lng: -64.1979 };

/** Un predio grande: 4 km de lado, para que el largo no lo limite el terreno. */
const GRANDE = [
  { lat: -31.40, lng: -64.20 },
  { lat: -31.40, lng: -64.158 },
  { lat: -31.436, lng: -64.158 },
  { lat: -31.436, lng: -64.20 },
];

const BASE = { ancho_m: 8, alto_m: 10 };

describe('sin dirección de viento no hay cortina', () => {
  it('construirCortina devuelve null con un azimut que no es un número', () => {
    const eje = [MOJONES[0]!, MOJONES[1]!];
    expect(construirCortina(eje, { ...BASE, vientoFrioAz: NaN }, MOJONES)).toBeNull();
    expect(construirCortina(eje, { ...BASE, vientoFrioAz: Infinity }, MOJONES)).toBeNull();
  });

  it('sugerirCortina tampoco inventa un lado', () => {
    expect(sugerirCortina(CASA, MOJONES, { ...BASE, vientoFrioAz: NaN })).toBeNull();
  });
});

describe('el reparo a sotavento', () => {
  it('es 15 veces la altura, dentro de la banda de 10 a 30 que publica la literatura', () => {
    const r = sugerirCortina(CASA, GRANDE, { ...BASE, vientoFrioAz: 225 })!;
    expect(r.proteccion_m).toBe(BASE.alto_m * FACTOR_PROTECCION);
    const factor = r.proteccion_m / r.alto_m;
    expect(factor).toBeGreaterThanOrEqual(10);
    expect(factor).toBeLessThanOrEqual(30);
  });

  it('cae del lado opuesto al viento, no del lado del que sopla', () => {
    // Viento del SO (225°): el resguardo tiene que quedar al NE del eje.
    const r = sugerirCortina(CASA, GRANDE, { ...BASE, vientoFrioAz: 225 })!;
    const latEje = r.eje.reduce((s, p) => s + p.lat, 0) / r.eje.length;
    const lngEje = r.eje.reduce((s, p) => s + p.lng, 0) / r.eje.length;
    const latZona = r.zonaProtegida.reduce((s, p) => s + p.lat, 0) / r.zonaProtegida.length;
    const lngZona = r.zonaProtegida.reduce((s, p) => s + p.lng, 0) / r.zonaProtegida.length;
    expect(latZona).toBeGreaterThan(latEje);
    expect(lngZona).toBeGreaterThan(lngEje);
  });

  it('deja la casa adentro del resguardo', () => {
    const r = sugerirCortina(CASA, GRANDE, { ...BASE, vientoFrioAz: 225 })!;
    // La casa está a sotavento del eje: más al NE que el eje y a menos de los
    // metros de protección.
    const latEje = r.eje.reduce((s, p) => s + p.lat, 0) / r.eje.length;
    expect(CASA.lat).toBeGreaterThan(latEje);
    const dist = Math.hypot(
      (CASA.lng - r.eje[0]!.lng) * 111_320 * Math.cos(CASA.lat * Math.PI / 180),
      (CASA.lat - latEje) * 111_320,
    );
    expect(dist).toBeLessThan(r.proteccion_m);
  });
});

describe('el largo mínimo de 10 H', () => {
  it('la sugerencia estira el eje hasta 10 H cuando el predio da', () => {
    const r = sugerirCortina(CASA, GRANDE, { ...BASE, vientoFrioAz: 225 })!;
    expect(r.longitud_m).toBeGreaterThanOrEqual(BASE.alto_m * LARGO_MINIMO_H);
    expect(r.corta).toBe(false);
    expect(r.falta_largo_m).toBe(0);
  });

  it('un eje corto se construye igual, pero avisa cuánto le falta', () => {
    // 50 m de eje para una cortina de 10 m de alto: 5 H, la mitad de lo que
    // pide la literatura. Antes esto salía sin una palabra.
    const a = { lat: -31.4018, lng: -64.1990 };
    const b = { lat: -31.4018, lng: -64.19847 };
    const r = construirCortina([a, b], { ...BASE, vientoFrioAz: 225 }, MOJONES)!;
    expect(r.longitud_m).toBeLessThan(BASE.alto_m * LARGO_MINIMO_H);
    expect(r.corta).toBe(true);
    expect(r.falta_largo_m).toBe(BASE.alto_m * LARGO_MINIMO_H - r.longitud_m);
  });

  it('una cortina baja necesita menos largo: el mínimo es relativo a su altura', () => {
    const a = { lat: -31.4018, lng: -64.1990 };
    const b = { lat: -31.4018, lng: -64.19847 };
    const baja = construirCortina([a, b], { ancho_m: 4, alto_m: 4, vientoFrioAz: 225 }, MOJONES)!;
    expect(baja.corta).toBe(false);
  });
});

describe('los estratos ya no nombran especies de otra región', () => {
  it('son tres alturas con su función, y ninguna especie', () => {
    expect(ESTRATOS_CORTINA).toHaveLength(3);
    for (const e of ESTRATOS_CORTINA) {
      expect(e.funcion.length).toBeGreaterThan(20);
      expect(Object.keys(e)).toEqual(['estrato', 'altura', 'funcion']);
    }
    // Las que estaban hasta el 30/10/2026, para cualquier predio del mundo.
    const texto = JSON.stringify(ESTRATOS_CORTINA);
    for (const especie of ['Algarrobo', 'Quebracho', 'Jarilla', 'Piquillín', 'Prosopis', 'Larrea']) {
      expect(texto).not.toContain(especie);
    }
  });

  it('la flora nativa sale de la ficha del predio, y vacía cuando no hay ficha', () => {
    const eje = [MOJONES[0]!, MOJONES[1]!];
    const sinFicha = construirCortina(eje, { ...BASE, vientoFrioAz: 225 }, MOJONES)!;
    expect(sinFicha.flora_nativa).toEqual([]);

    const conFicha = construirCortina(
      eje,
      { ...BASE, vientoFrioAz: 225, floraNativa: ['Liquidámbar (Liquidambar styraciflua)'] },
      MOJONES,
    )!;
    expect(conFicha.flora_nativa).toEqual(['Liquidámbar (Liquidambar styraciflua)']);
  });
});

describe('el rumbo que se informa', () => {
  it('sale de la rosa de 16 puntas y no de una de 8', () => {
    // 67,5° es ENE. La rosa de 8 puntas que tenía este módulo lo redondeaba a
    // NE o a E según el lado, y el panel mostraba un rumbo distinto del que
    // mostraba el clima para el mismo viento.
    const eje = [MOJONES[0]!, MOJONES[1]!];
    const r = construirCortina(eje, { ...BASE, vientoFrioAz: 67.5 }, MOJONES)!;
    expect(r.dir_viento_frio).toBe('ENE');
    expect(r.viento_az).toBe(67.5);
  });

  it('normaliza un azimut fuera de rango en vez de arrastrarlo', () => {
    const eje = [MOJONES[0]!, MOJONES[1]!];
    expect(construirCortina(eje, { ...BASE, vientoFrioAz: -45 }, MOJONES)!.viento_az).toBe(315);
    expect(construirCortina(eje, { ...BASE, vientoFrioAz: 405 }, MOJONES)!.viento_az).toBe(45);
  });
});
