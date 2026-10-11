/**
 * La versión progresiva tiene que dar EXACTAMENTE lo mismo que la de una sola
 * pasada. Es la condición que la hace usable: si difiriera, el mapa cambiaría
 * según cuánto tardó en calcularse, que es la clase de bug que nadie reproduce.
 */
import { describe, it, expect } from 'vitest';
import { calcularCurvas, calcularCurvasProgresivo, nivelesDe, TECHO_NIVELES } from '@/lib/curvasNivel';
import { grillaDesdeFn } from './_grilla';

const relieve = (n: number) => grillaDesdeFn(n, n, (r, c) => 120
  + 18 * Math.sin((r / n) * Math.PI * 3)
  + 14 * Math.cos((c / n) * Math.PI * 2.4)
  + 4  * Math.sin((r + c) / n * Math.PI * 7));

describe('calcularCurvasProgresivo', () => {
  it('da el mismo resultado que calcularCurvas', async () => {
    const g = relieve(90);
    for (const intervalo of [5, 2, 0.5]) {
      const deUnaVez  = calcularCurvas(g, intervalo);
      const porTandas = await calcularCurvasProgresivo(g, intervalo);
      expect(porTandas, 'intervalo ' + intervalo).toEqual(deUnaVez);
    }
  });

  it('informa progreso creciente y termina en 1', async () => {
    const g = relieve(120);
    const vistos: number[] = [];
    await calcularCurvasProgresivo(g, 0.25, { onProgreso: f => vistos.push(f) });

    expect(vistos.length).toBeGreaterThan(0);
    expect(vistos[vistos.length - 1]).toBe(1);
    for (const f of vistos) {
      expect(f).toBeGreaterThan(0);
      expect(f).toBeLessThanOrEqual(1);
    }
    // Monótono: una barra que retrocede es peor que no tener barra.
    for (let i = 1; i < vistos.length; i++) {
      expect(vistos[i]!).toBeGreaterThanOrEqual(vistos[i - 1]!);
    }
  });

  it('un cálculo ya abortado no devuelve nada', async () => {
    const g = relieve(90);
    const ac = new AbortController();
    ac.abort();
    expect(await calcularCurvasProgresivo(g, 0.5, { signal: ac.signal })).toEqual([]);
  });

  it('abortar a mitad de camino corta', async () => {
    const g = relieve(150);
    const ac = new AbortController();
    let avisos = 0;
    const curvas = await calcularCurvasProgresivo(g, 0.1, {
      signal: ac.signal,
      onProgreso: f => { avisos++; if (f > 0.1) ac.abort(); },
    });
    expect(avisos).toBeGreaterThan(0);
    expect(curvas).toEqual([]);
  });
});

describe('nivelesDe', () => {
  it('null es el pedido absurdo, [] es "no hay nada que dibujar"', () => {
    // Son dos cosas distintas y quien llama las trata distinto: una es un error
    // del usuario que merece explicación, la otra es un terreno plano.
    const g = relieve(40);
    expect(nivelesDe(g, 0.0001)).toBeNull();
    expect(nivelesDe(grillaDesdeFn(10, 10, () => 100), 2)).toEqual([]);
    expect(nivelesDe(g, 5)!.length).toBeGreaterThan(0);
  });

  it('no arma la lista entera antes de darse cuenta del absurdo', () => {
    // El corte va DENTRO del bucle: con un intervalo microscópico, armar el
    // array completo para después descartarlo puede llenar la memoria.
    const g = relieve(40);
    expect(nivelesDe(g, 1e-9)).toBeNull();
    expect(TECHO_NIVELES).toBeGreaterThan(1000);
  });
});
