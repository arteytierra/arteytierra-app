/**
 * Techo de tamaño para los archivos de /mapa.
 *
 * `MapaTerrenoApp` llegó a 5.643 líneas creciendo de a poco, sin que ningún
 * cambio individual se sintiera grande. Este test no juzga el diseño: sólo
 * avisa cuando un archivo volvió a cruzar el tamaño en el que dejó de poder
 * leerse entero, para que la decisión de partirlo se tome a tiempo y no cuando
 * ya cuesta abrirlo.
 *
 * Si un límite molesta, la respuesta esperable es mudar un bloque a su propio
 * archivo — no subir el número.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = join(__dirname, '..', '..', '..');

const TECHOS: Array<[string, number]> = [
  ['components/MapaTerrenoApp.tsx',    4200],
  ['components/mapa/PanelCapas.tsx',   1300],
  ['components/mapa/controles.tsx',     600],
  ['components/mapa/riel.tsx',          400],
];

describe('tamaño de los archivos de /mapa', () => {
  for (const [rel, techo] of TECHOS) {
    it(`${rel} se mantiene bajo ${techo} líneas`, () => {
      const lineas = readFileSync(join(RAIZ, rel), 'utf8').split('\n').length;
      expect(lineas).toBeLessThanOrEqual(techo);
    });
  }
});
