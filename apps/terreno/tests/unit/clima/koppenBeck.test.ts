import { describe, it, expect } from 'vitest';
import { koppenBeck } from '@/lib/koppenBeck';

/**
 * Lee el mapa de 1 km de verdad, no un fixture: el archivo está en el repo y
 * el punto de este test es justamente comprobar que lo que sale del GeoTIFF
 * coincide con el clima conocido de lugares reales. Un error de un signo en la
 * fórmula de fila/columna daría clases plausibles pero del hemisferio
 * equivocado, y sólo se detecta contrastando contra lugares que uno conoce.
 */
describe('koppenBeck — lectura del mapa de 1 km', () => {
  const casos: Array<[string, number, number, string]> = [
    ['Mendoza, Argentina',      -32.89, -68.85, 'BWk'],
    ['Manaos, Brasil',           -3.12, -60.02, 'Af'],
    // Madrid da BSk, no el Csa "de manual". No es un error del mapa: con unos
    // 420 mm anuales y 15 °C de media, el umbral de aridez (2T+14 = 44, por 10
    // = 440 mm) le queda por encima de la lluvia, así que cae en B. Es
    // exactamente la clase de caso de borde que este mapa resuelve mejor que
    // aplicar las reglas sobre una celda de 50 km.
    ['Madrid, España',           40.42,  -3.70, 'BSk'],
    ['Ames, Iowa (EE.UU.)',      41.90, -93.60, 'Dfa'],
    ['Londres, Reino Unido',     51.51,  -0.13, 'Cfb'],
    ['Bariloche, Argentina',    -41.13, -71.31, 'Csb'],
    ['Singapur',                  1.35, 103.82, 'Af'],
  ];

  it.each(casos)('%s → %s', async (_nombre, lat, lng, esperado) => {
    const k = await koppenBeck(lat, lng);
    expect(k?.codigo).toBe(esperado);
  });

  it('devuelve null en pleno océano, donde el mapa no tiene clase', async () => {
    // Atlántico sur, lejos de cualquier costa.
    expect(await koppenBeck(-35, -25)).toBeNull();
  });

  it('devuelve null con coordenadas fuera de rango en vez de leer basura', async () => {
    expect(await koppenBeck(91, 0)).toBeNull();
    expect(await koppenBeck(0, 181)).toBeNull();
    expect(await koppenBeck(NaN, 0)).toBeNull();
  });

  it('resuelve las esquinas exactas de la grilla sin salirse del raster', async () => {
    // No importa qué clase den (son océano y hielo): importa que no tiren.
    await expect(koppenBeck(90, -180)).resolves.not.toThrow();
    await expect(koppenBeck(-90, 180)).resolves.not.toThrow();
  });

  it('completa el grupo y la descripción en castellano', async () => {
    const k = await koppenBeck(-32.89, -68.85);
    expect(k).toMatchObject({ codigo: 'BWk', grupo: 'Árido' });
    expect(k?.descripcion).toMatch(/desierto/i);
  });
});
