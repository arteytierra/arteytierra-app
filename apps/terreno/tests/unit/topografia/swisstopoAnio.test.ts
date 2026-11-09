/**
 * Elección de tile en swissALTI3D cuando el mismo km² está relevado dos veces.
 *
 * El catálogo STAC de swisstopo devuelve un ítem por km² Y POR AÑO de vuelo.
 * Consultado el 08/11/2026, el km² `2600-1198` (Berna) devuelve cuatro COG:
 * 2019 y 2025, cada uno en 0,5 m y en 2 m. El proveedor se quedaba con todos
 * los de 2 m y el muestreo cortaba en el primero que contenía al nodo, que es
 * el que el STAC lista primero: el de 2019. Así que el relieve salía del vuelo
 * viejo teniendo el nuevo descargado al lado, y la descarga iba doble.
 *
 * Los nombres de archivo de acá son los que devolvió el catálogo ese día.
 */
import { describe, it, expect } from 'vitest';
import { elegirTilesPorAnio } from '@/lib/elevacion/proveedores/swisstopo';

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
  it('devuelve un solo COG por km², no uno por año', () => {
    expect(elegirTilesPorAnio(CATALOGO)).toHaveLength(2);
  });

  it('se queda con el vuelo más nuevo de cada km²', () => {
    const elegidos = elegirTilesPorAnio(CATALOGO);
    expect(elegidos.every(u => u.includes('_2025_'))).toBe(true);
    expect(elegidos.some(u => u.includes('_2019_'))).toBe(false);
  });

  it('ignora los COG de 0,5 m: el proveedor lee los de 2 m', () => {
    // No es una preferencia estética. El paso declarado de la fuente
    // (`PASO_RELIEVE.swisstopo`) es una constante de 2 m y el muestreo lee el
    // tile entero; servir 0,5 m exigiría ventana de píxeles y un paso que
    // viaje con la grilla, no una constante por fuente.
    expect(elegirTilesPorAnio(CATALOGO).every(u => u.includes('_2_2056_'))).toBe(true);
  });

  it('conserva el km² cuyo único vuelo es viejo: el ciclo es rodante', () => {
    const soloViejo = [
      `${BASE}2019_2600-1198/swissalti3d_2019_2600-1198_2_2056_5728.tif`,
      `${BASE}2025_2600-1199/swissalti3d_2025_2600-1199_2_2056_5728.tif`,
    ];
    expect(elegirTilesPorAnio(soloViejo)).toHaveLength(2);
  });

  it('fuera de Suiza el catálogo viene vacío y no elige nada', () => {
    expect(elegirTilesPorAnio([])).toEqual([]);
    expect(elegirTilesPorAnio(['https://ejemplo.org/otra_cosa.tif'])).toEqual([]);
  });
});
