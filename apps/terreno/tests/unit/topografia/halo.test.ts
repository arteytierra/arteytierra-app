/**
 * El halo de la grilla no es predio.
 *
 * `obtenerGrillaDensa` calcula sobre el bbox del polígono con un margen y
 * enmascara a **1,15×** el predio, y tiene razón en hacerlo: la pendiente por
 * diferencias centradas necesita vecinos en el borde y el D8 necesita ver la
 * ladera de donde baja el agua. Pero 1,15² es un **32 % de superficie de más**,
 * y todo lo que contaba celdas para informar hectáreas estaba contando tierra
 * del vecino. Medido en la app el 09/10/2026 sobre un predio real de 84,08 ha:
 * el master plan decía «97,7 de 111,4 ha, el 88 % del predio» y las cuatro
 * clases de riesgo de erosión sumaban 111 ha.
 *
 * Lo que se arregla no es el cálculo —la clasificación sigue viendo todo el
 * contexto— sino el denominador de lo que se informa.
 */
import { describe, it, expect } from 'vitest';
import { remuestrearGrilla, grillaDesdeShader, type GrillaElevacion } from '@/lib/grillaElevacion';
import { prepararEmplazamiento, resumenEmplazamiento } from '@/lib/emplazamiento';
import { calcularErosion } from '@/lib/erosion';
import { calcularEscorrentias } from '@/lib/escorrentias';
import type { DatosShader, CeldaShader } from '@/lib/shaders';
import { grillaDesdeFn, BBOX_DEFECTO } from './_grilla';

const N = 25;
/** El predio es el cuadrado central: 15×15 de los 25×25 nodos de la grilla. */
const BORDE = 5;
const esPredio = (r: number, c: number) =>
  r >= BORDE && r < N - BORDE && c >= BORDE && c < N - BORDE;

/** Ladera suave con una concavidad, para que haya algo que excluir y clasificar. */
function grillaConHalo(): GrillaElevacion {
  const g = grillaDesdeFn(N, N, (r, c) => 100 + r * 1.2 + Math.sin(c / 3) * 0.6, BBOX_DEFECTO);
  const dentro = new Uint8Array(N * N);
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) if (esPredio(r, c)) dentro[r * N + c] = 1;
  }
  return { ...g, dentro };
}

describe('la superficie que se informa es la del predio y no la de la grilla', () => {
  it('EL EMPLAZAMIENTO CUENTA LAS CELDAS DE ADENTRO, NO LAS 625 DE LA VENTANA', () => {
    const g = grillaConHalo();
    const ctx = prepararEmplazamiento(g);
    expect(ctx).not.toBeNull();

    const conMascara = resumenEmplazamiento(ctx!);
    // 15×15 = 225 nodos de predio sobre 625 de ventana.
    expect(conMascara.celdas_total).toBe((N - 2 * BORDE) ** 2);

    // Y sin máscara —un DEM propio importado suelto— se cuenta todo, que es lo
    // que corresponde cuando no hay con qué distinguir. Las 625 son el número
    // que antes se imprimía SIEMPRE, también con predio.
    const sinMascara = resumenEmplazamiento(prepararEmplazamiento({ ...g, dentro: undefined })!);
    expect(sinMascara.celdas_total).toBe(N * N);
    expect(sinMascara.superficie_total_ha).toBeGreaterThan(conMascara.superficie_total_ha * 2.5);
  });

  it('LAS EXCLUSIONES SE SIGUEN MIRANDO CON TODO EL CONTEXTO', () => {
    // La máscara cambia qué se cuenta, no qué se calcula: la pendiente y el D8
    // de una celda del borde del predio siguen usando los vecinos del halo, y
    // por eso las celdas libres nunca pueden pasar al total informado.
    const ctx = prepararEmplazamiento(grillaConHalo())!;
    const r = resumenEmplazamiento(ctx);
    expect(r.celdas_libres).toBeLessThanOrEqual(r.celdas_total);
    expect(r.superficie_libre_ha).toBeLessThanOrEqual(r.superficie_total_ha);
  });

  it('LA MÁSCARA SOBREVIVE AL REMUESTREO Y A LA VUELTA POR EL SHADER', () => {
    const g = grillaConHalo();

    const chica = remuestrearGrilla(g, 12);
    expect(chica.dentro).toBeDefined();
    expect(chica.dentro!.length).toBe(chica.rows * chica.cols);
    // Sigue habiendo adentro y afuera: no se perdió ni se llenó de unos.
    expect(chica.dentro!.some(v => v === 1)).toBe(true);
    expect(chica.dentro!.some(v => v === 0)).toBe(true);

    // Y el viaje de ida y vuelta por las celdas del shader la conserva.
    const celdas = [{ row: 0, col: 0, latMin: 0, latMax: 1, lngMin: 0, lngMax: 1, elevation: 10, dentro: true },
                    { row: 0, col: 1, latMin: 0, latMax: 1, lngMin: 1, lngMax: 2, elevation: 11, dentro: false },
                    { row: 1, col: 0, latMin: 1, latMax: 2, lngMin: 0, lngMax: 1, elevation: 12, dentro: true },
                    { row: 1, col: 1, latMin: 1, latMax: 2, lngMin: 1, lngMax: 2, elevation: 13, dentro: false }];
    const vuelta = grillaDesdeShader({ celdas, elev_min: 10, elev_max: 13 })!;
    expect(Array.from(vuelta.dentro!)).toEqual([1, 0, 1, 0]);
  });
});

/** Ladera de 16×16 celdas donde sólo el cuadrado central de 8×8 es predio. */
function shaderConHalo(): DatosShader {
  const n = 16, borde = 4, paso = 0.0003;
  const celdas: CeldaShader[] = [];
  let min = Infinity, max = -Infinity, pmax = 0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const elevation = Math.pow(r / (n - 1), 1.8) * 90;
      const pendiente_pct = 1 + (r / (n - 1)) * 24;
      celdas.push({
        row: r, col: c,
        latMin: -30.8 + r * paso, latMax: -30.8 + (r + 1) * paso,
        lngMin: -64.7 + c * paso, lngMax: -64.7 + (c + 1) * paso,
        elevation, pendiente_pct,
        dentro: r >= borde && r < n - borde && c >= borde && c < n - borde,
      });
      if (elevation < min) min = elevation;
      if (elevation > max) max = elevation;
      if (pendiente_pct > pmax) pmax = pendiente_pct;
    }
  }
  return { celdas, elev_min: min, elev_max: max, pend_max: pmax, fuente: 'glo30' };
}

describe('riesgo de erosión', () => {
  it('LAS CUATRO CLASES SUMAN LA SUPERFICIE DEL PREDIO, NO LA DE LA VENTANA', () => {
    const shader = shaderConHalo();
    const esc = calcularEscorrentias(shader);
    const d = calcularErosion(shader, esc)!;

    // 8×8 celdas de predio sobre 16×16 de ventana: la cuarta parte.
    const sumaHa = d.resumen.reduce((s, r) => s + r.ha, 0);
    expect(sumaHa).toBeCloseTo(d.area_ha, 2);

    const sinMascara = calcularErosion(
      { ...shader, celdas: shader.celdas.map(c => ({ ...c, dentro: undefined })) },
      esc,
    )!;
    // Exactamente cuatro veces más superficie informada: ese era el error.
    expect(sinMascara.area_ha / d.area_ha).toBeCloseTo(4, 1);

    // Y los porcentajes siguen cerrando en 100 con el denominador nuevo.
    expect(d.resumen.reduce((s, r) => s + r.pct, 0)).toBeGreaterThanOrEqual(99);
    expect(d.resumen.reduce((s, r) => s + r.pct, 0)).toBeLessThanOrEqual(101);
  });

  it('PINTA TODA LA VENTANA AUNQUE CUENTE SÓLO EL PREDIO', () => {
    // El mapa se dibuja entero: si sólo se clasificaran las celdas de adentro,
    // el borde del predio quedaría sin color y la ladera de arriba —que es de
    // donde baja el agua— desaparecería de la vista.
    const shader = shaderConHalo();
    const d = calcularErosion(shader, calcularEscorrentias(shader))!;
    expect(d.celdas.length).toBe(shader.celdas.length);
  });
});
