/**
 * Elección de tile en swissALTI3D: resolución y año de vuelo.
 *
 * El catálogo STAC de swisstopo devuelve un ítem por km² Y POR AÑO. Consultado
 * el 08/11/2026, el km² `2600-1198` (Berna) devuelve cuatro COG: 2019 y 2025,
 * cada uno en 0,5 m y en 2 m. Dos errores salían de ahí:
 *
 * 1. Se tomaban los de 2 m de LOS DOS años y el muestreo corta en el primer
 *    tile que contiene al nodo —el que el STAC lista primero, 2019—, así que el
 *    relieve salía del vuelo viejo con el nuevo descargado al lado, y la
 *    descarga iba doble.
 * 2. Nunca se miraba el COG de 0,5 m, aunque Suiza lo publica para todo el
 *    país: la app se negaba a dibujar curvas cada 0,25 m teniendo el modelo.
 *
 * Los nombres de archivo de acá son los que devolvió el catálogo ese día.
 */
import { describe, it, expect } from 'vitest';
import {
  elegirTilesPorAnio, resolucionSwisstopo, RES_FINA, RES_GRUESA,
} from '@/lib/elevacion/proveedores/swisstopo';

const BASE = 'https://data.geo.admin.ch/ch.swisstopo.swissalti3d/swissalti3d_';

/** Los cuatro assets reales de `2600-1198` más los cuatro de `2600-1199`. */
const CATALOGO = [
  `${BASE}2019_2600-1198/swissalti3d_2019_2600-1198_0.5_2056_5728.tif`,
  `${BASE}2019_2600-1198/swissalti3d_2019_2600-1198_2_2056_5728.tif`,
  `${BASE}2025_2600-1198/swissalti3d_2025_2600-1198_0.5_2056_5728.tif`,
  `${BASE}2025_2600-1198/swissalti3d_2025_2600-1198_2_2056_5728.tif`,
  `${BASE}2019_2600-1199/swissalti3d_2019_2600-1199_0.5_2056_5728.tif`,
  `${BASE}2019_2600-1199/swissalti3d_2019_2600-1199_2_2056_5728.tif`,
  `${BASE}2025_2600-1199/swissalti3d_2025_2600-1199_0.5_2056_5728.tif`,
  `${BASE}2025_2600-1199/swissalti3d_2025_2600-1199_2_2056_5728.tif`,
];

describe('elegirTilesPorAnio', () => {
  it('devuelve un solo COG por km², no uno por año ni uno por resolución', () => {
    expect(elegirTilesPorAnio(CATALOGO, RES_FINA)).toHaveLength(2);
    expect(elegirTilesPorAnio(CATALOGO, RES_GRUESA)).toHaveLength(2);
  });

  it('se queda con el vuelo más nuevo de cada km²', () => {
    for (const res of [RES_FINA, RES_GRUESA]) {
      const elegidos = elegirTilesPorAnio(CATALOGO, res);
      expect(elegidos.every(u => u.includes('_2025_'))).toBe(true);
      expect(elegidos.some(u => u.includes('_2019_'))).toBe(false);
    }
  });

  it('devuelve la resolución pedida y no la otra', () => {
    expect(elegirTilesPorAnio(CATALOGO, RES_FINA).every(u => u.includes('_0.5_2056_'))).toBe(true);
    expect(elegirTilesPorAnio(CATALOGO, RES_GRUESA).every(u => u.includes('_2_2056_'))).toBe(true);
  });

  it('conserva el km² cuyo único vuelo es viejo: el ciclo es rodante', () => {
    const soloViejo = [
      `${BASE}2019_2600-1198/swissalti3d_2019_2600-1198_2_2056_5728.tif`,
      `${BASE}2025_2600-1199/swissalti3d_2025_2600-1199_2_2056_5728.tif`,
    ];
    expect(elegirTilesPorAnio(soloViejo, RES_GRUESA)).toHaveLength(2);
  });

  it('fuera de Suiza el catálogo viene vacío y no elige nada', () => {
    expect(elegirTilesPorAnio([], RES_FINA)).toEqual([]);
    expect(elegirTilesPorAnio(['https://ejemplo.org/otra_cosa.tif'], RES_FINA)).toEqual([]);
  });
});

describe('resolucionSwisstopo', () => {
  it('pide 0,5 m cuando la grilla puede resolverlo', () => {
    // 300 m de lado con 301 nodos = 1 m de paso: 0,5 m sí agrega.
    expect(resolucionSwisstopo(300, 300, 301, 301)).toBe(RES_FINA);
  });

  it('se queda en 2 m cuando la grilla pide un nodo cada 2 m o más', () => {
    // 600 m con 301 nodos = 2 m de paso: el DTM de 0,5 m se promedia hasta
    // desaparecer y costaría dieciséis veces la descarga por los mismos números.
    expect(resolucionSwisstopo(600, 600, 301, 301)).toBe(RES_GRUESA);
    expect(resolucionSwisstopo(9000, 9000, 301, 301)).toBe(RES_GRUESA);
  });

  it('mira el eje MÁS FINO: alcanza con que uno pueda resolverlo', () => {
    // 1 m de paso en x, 5,33 m en y: el eje fino manda y la ventana entra
    // (600 × 3200 = 1,92 M de píxeles, abajo del tope de descarga).
    expect(resolucionSwisstopo(300, 1600, 301, 301)).toBe(RES_FINA);
  });

  it('pero el eje fino no alcanza si la ventana no entra en la descarga', () => {
    // Mismo caso estirado a 6 km de alto: el paso en x sigue siendo 1 m, así
    // que 0,5 m «se justificaría», pero leer 600 × 12.000 son 7,2 M de píxeles
    // y el tope está en 4 M. Gana el tope: el predio se lee a 2 m.
    expect(resolucionSwisstopo(300, 6000, 301, 301)).toBe(RES_GRUESA);
  });

  it('se queda en 2 m si la ventana a 0,5 m no entra en la descarga', () => {
    // 3 km × 3 km a 0,5 m son 36 M de píxeles: 144 MB. No se baja eso en 60 s.
    expect(resolucionSwisstopo(3000, 3000, 20_001, 20_001)).toBe(RES_GRUESA);
  });

  it('una grilla degenerada no pide la resolución fina', () => {
    expect(resolucionSwisstopo(300, 300, 1, 1)).toBe(RES_GRUESA);
  });
});
