/**
 * Que una grilla escalonada se note.
 *
 * Por qué este test existe: el 25/10/2026 `grillaGlo30` devolvió, sobre el
 * mismo predio y con la misma llamada, dos grillas distintas. Una leída por la
 * ventana de píxeles del COG e interpolada bilineal; la otra por el respaldo de
 * muestreo por nodo, que devuelve el píxel más cercano, porque un timeout de S3
 * cayó al `catch`. La segunda tenía las cotas bien —mínima, máxima y desnivel
 * casi iguales—, el sombreado bien y las curvas de nivel bien, y dejó el D8 sin
 * salida: 29.577 de 83.100 celdas sin dirección de flujo, acumulación máxima 4
 * en vez de 2.238, cero cadenas de escurrimiento en un predio de 369 m de
 * desnivel. Nada falló. Simplemente no escurría nada.
 *
 * Lo que se prueba acá es la detección, que es lo único que convierte ese
 * silencio en un aviso.
 */
import { describe, it, expect } from 'vitest';
import {
  diagnosticarMuestreo, proporcionDeMesetas, UMBRAL_MESETAS,
} from '@/lib/elevacion/muestreo';
import { avisosDeContexto, type AvisoCalculo } from '@/lib/hidrologiaPredio';

const COLS = 40;
const ROWS = 40;

/** Una ladera continua, como la devuelve una interpolación bilineal. */
function ladera(): { cols: number; rows: number; elev: Float64Array } {
  const elev = new Float64Array(ROWS * COLS);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // 0,37 m por nodo en x y 0,91 en y: irracionales entre sí, así que dos
      // vecinos no empatan nunca.
      elev[r * COLS + c] = 100 + c * 0.37 + r * 0.91;
    }
  }
  return { cols: COLS, rows: ROWS, elev };
}

/** La misma ladera muestreada por vecino más cercano a un tercio del paso. */
function laderaEscalonada(): { cols: number; rows: number; elev: Float64Array } {
  const g = ladera();
  const elev = new Float64Array(ROWS * COLS);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const rr = Math.floor(r / 3) * 3;
      const cc = Math.floor(c / 3) * 3;
      elev[r * COLS + c] = g.elev[rr * COLS + cc]!;
    }
  }
  return { cols: COLS, rows: ROWS, elev };
}

describe('detección de relieve escalonado', () => {
  it('una ladera interpolada no tiene mesetas', () => {
    expect(proporcionDeMesetas(ladera())).toBe(0);
    expect(diagnosticarMuestreo(ladera()).escalonado).toBe(false);
  });

  it('muestreada por vecino más cercano, dos de cada tres nodos repiten al vecino', () => {
    const p = proporcionDeMesetas(laderaEscalonada());
    expect(p).toBeGreaterThan(0.6);
    expect(p).toBeGreaterThan(UMBRAL_MESETAS);
    expect(diagnosticarMuestreo(laderaEscalonada()).escalonado).toBe(true);
  });

  it('EL TERRENO LLANO NO ES UN FALSO POSITIVO', () => {
    // Un salar, una planicie de inundación o un lago TIENEN vecinos con la
    // misma cota, y ahí el dato está bien aunque el D8 también sufra. La
    // salvedad de la caída por nodo es lo que separa los dos casos: sin ella,
    // este test fallaría y la app acusaría de roto a un relieve correcto.
    const elev = new Float64Array(ROWS * COLS);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) elev[r * COLS + c] = 12 + Math.floor(c / 10) * 0.1;
    }
    const g = { cols: COLS, rows: ROWS, elev };
    expect(proporcionDeMesetas(g)).toBeGreaterThan(UMBRAL_MESETAS);
    expect(diagnosticarMuestreo(g).escalonado).toBe(false);
  });

  it('una grilla sin un solo dato no inventa un veredicto', () => {
    const elev = new Float64Array(ROWS * COLS).fill(NaN);
    const d = diagnosticarMuestreo({ cols: COLS, rows: ROWS, elev });
    expect(d.mesetas).toBe(0);
    expect(d.escalonado).toBe(false);
  });
});

describe('el aviso que llega a la pantalla', () => {
  it('con el relieve escalonado avisa, y en nivel alerta', () => {
    const d = diagnosticarMuestreo(laderaEscalonada());
    const avisos: AvisoCalculo[] = [];
    avisosDeContexto({
      fuenteDem: 'glo30',
      area_ha: 417,
      relieve: { muestreo: 'por_nodo', mesetas: d.mesetas, caida_por_nodo_m: d.caida_por_nodo_m },
    }, avisos);
    const a = avisos.find(x => x.id === 'dem_escalonado');
    expect(a).toBeDefined();
    expect(a!.nivel).toBe('alerta');
    // La causa se nombra: el usuario tiene que saber que es el servicio y no su
    // predio, porque lo único que puede hacer es volver a cargar la topografía.
    expect(a!.detalle).toContain('una cota por nodo');
  });

  it('con el relieve interpolado no dice nada', () => {
    const d = diagnosticarMuestreo(ladera());
    const avisos: AvisoCalculo[] = [];
    avisosDeContexto({
      fuenteDem: 'glo30',
      area_ha: 417,
      relieve: { muestreo: 'bilineal', mesetas: d.mesetas, caida_por_nodo_m: d.caida_por_nodo_m },
    }, avisos);
    expect(avisos.some(x => x.id === 'dem_escalonado')).toBe(false);
  });

  it('sin medición del relieve tampoco inventa un aviso', () => {
    const avisos: AvisoCalculo[] = [];
    avisosDeContexto({ fuenteDem: 'glo30', area_ha: 417 }, avisos);
    expect(avisos.some(x => x.id === 'dem_escalonado')).toBe(false);
  });
});
