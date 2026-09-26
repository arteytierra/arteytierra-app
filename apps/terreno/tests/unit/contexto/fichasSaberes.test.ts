import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import type { BiomaFicha } from '@/lib/biomaTipos';
import { BIOMAS_REGIONALES, BIOMAS_REGIONALES_CURADAS } from '@/lib/biomasRegionales';
import { BIOMAS_REGIONALES_AMERICA } from '@/lib/biomasRegionalesAmerica';
import { BIOMAS_REGIONALES_CANADA } from '@/lib/biomasRegionalesCanada';
import { BIOMAS_REGIONALES_EUROPA } from '@/lib/biomasRegionalesEuropa';
import { BIOMAS_REGIONALES_EUROPA_UE } from '@/lib/biomasRegionalesEuropaUE';
import { BIOMAS_REGIONALES_MEDIO_ORIENTE } from '@/lib/biomasRegionalesMedioOriente';
import { BIOMAS_REGIONALES_NORTE_AFRICA } from '@/lib/biomasRegionalesNorteAfrica';
import { BIOMAS_REGIONALES_SUDAMERICA } from '@/lib/biomasRegionalesSudamerica';

/*
 * Por qué la sección de saberes del panel de contexto casi nunca tiene nada.
 *
 * No es que falte cargarlos. Los catálogos generados desde los paquetes de
 * investigación no le atribuyen prácticas a ninguna cultura, porque a escala de
 * ecorregión eso sería inventar: una ecorregión abarca muchos pueblos y ninguno
 * la ocupa entera. Los saberes que sí se afirman viven en `lib/saberes.ts`, se
 * activan por polígono y pasan una compuerta de ocho condiciones.
 *
 * Este test fija ese criterio para que una regeneración futura no empiece a
 * llenar el campo sin que nadie lo decida. Si un día hay que llenarlo, que sea
 * cambiando este test a propósito y no descubriéndolo en producción.
 */

const GENERADOS: Record<string, Record<string, BiomaFicha>> = {
  'América': BIOMAS_REGIONALES_AMERICA,
  'Canadá': BIOMAS_REGIONALES_CANADA,
  'Europa': BIOMAS_REGIONALES_EUROPA,
  'Europa UE': BIOMAS_REGIONALES_EUROPA_UE,
  'Medio Oriente': BIOMAS_REGIONALES_MEDIO_ORIENTE,
  'Norte de África': BIOMAS_REGIONALES_NORTE_AFRICA,
  'Sudamérica': BIOMAS_REGIONALES_SUDAMERICA,
};

describe('los saberes de las fichas', () => {
  it('ningún catálogo generado le atribuye una práctica a una cultura', () => {
    for (const [bloque, catalogo] of Object.entries(GENERADOS)) {
      const conSaberes = Object.values(catalogo).filter((f) => f.saberes.length > 0);
      expect(conSaberes.map((f) => f.id), bloque).toEqual([]);
    }
  });

  it('las 22 fichas argentinas escritas a mano sí los traen', () => {
    // Son anteriores al criterio y se conservan: están escritas para un
    // territorio concreto, no para una ecorregión entera.
    const fichas = Object.values(BIOMAS_REGIONALES_CURADAS);
    expect(fichas.length).toBe(22);
    expect(fichas.every((f) => f.saberes.length > 0)).toBe(true);
  });

  it('un saber de ficha nombra a quién pertenece y qué hace', () => {
    for (const ficha of Object.values(BIOMAS_REGIONALES_CURADAS)) {
      for (const saber of ficha.saberes) {
        expect(saber.cultura.trim().length, ficha.id).toBeGreaterThan(0);
        expect(saber.practicas.trim().length, ficha.id).toBeGreaterThan(0);
      }
    }
  });

  it('en total, 22 de 242 fichas regionales tienen saberes', () => {
    // El número importa porque explica lo que se ve: en casi cualquier predio
    // del mundo esa sección del panel no tiene contenido, y no es un error.
    // BIOMAS_REGIONALES ya es la unión de los nueve bloques: las 22 a mano más
    // las 220 que no atribuyen saberes a nadie.
    const todas = Object.values(BIOMAS_REGIONALES);
    expect(todas.length).toBe(242);
    expect(todas.filter((f) => f.saberes.length > 0).length).toBe(22);
  });
});

describe('el panel no se queda callado cuando no hay saberes', () => {
  const panel = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'components', 'ContextoPanel.tsx'),
    'utf8',
  );

  it('explica por qué la ficha no atribuye, en vez de esconder la sección', () => {
    // Antes la sección se omitía si el arreglo venía vacío, y el silencio se
    // leía como "acá no hay saberes".
    expect(panel).not.toContain('{ficha.saberes.length > 0 && <Seccion');
    expect(panel).toContain('ficha.saberes.length > 0 ?');
    // La explicación se reescribió cuando apareció la capa de prácticas
    // fechadas (lib/practicasHistoricas.ts): la sección dejó de ser sólo un 'no'
    // y pasó a decir qué condición hace falta para que haya un saber atribuido.
    expect(panel).toContain('Saberes atribuidos a una cultura');
    expect(panel).toContain('de quién es');
  });

  it('no nombra un ecosistema mientras la ecorregión está en vuelo', () => {
    expect(panel).toContain('if (resolviendoEco)');
    expect(panel).toContain('Identificando la ecorregión');
  });
});
