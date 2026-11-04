/**
 * El paso de la grilla de suelo, dicho una sola vez.
 *
 * El bug que motivó estas pruebas: el 26/09/2026 el camino principal de
 * SoilGrids pasó de la API de consulta (250 m) a leer los rásters agregados
 * (1 km), y el propio módulo dejó escrito que «la app no puede seguir
 * imprimiendo ~250 m si el número salió de 1 km». La app lo siguió imprimiendo
 * en cinco lugares hasta el 04/11/2026. Ninguno se estrelló: todos mostraban
 * un número plausible y equivocado, que es la forma en que falla este repo.
 *
 * Es el mismo caso que el relieve, que anunciaba «SRTM 30 m» mientras usaba un
 * DEM nacional, y que se arregló con `PASO_RELIEVE`. Acá la tabla es
 * `PASO_SUELO_M` y estos tests son los que impiden que vuelva a haber una
 * segunda copia escrita a mano.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PASO_SUELO_M, PASO_SUELO_HABITUAL, pasoSueloTexto,
} from '@/lib/sueloFuentes';
import { PERFILES, SINTOMAS } from '@/lib/guia';

const RAIZ = join(__dirname, '..', '..', '..');

describe('PASO_SUELO_M', () => {
  it('tiene los dos caminos, y el principal es el más grueso', () => {
    // No es un detalle: el respaldo da MEJOR resolución que el camino
    // principal. Se eligió al revés a propósito, porque la API de consulta
    // tiene cupo por IP y en Vercel ese cupo lo comparten todos los usuarios.
    expect(PASO_SUELO_M.cog).toBe(1000);
    expect(PASO_SUELO_M.rest).toBe(250);
    expect(PASO_SUELO_M.cog).toBeGreaterThan(PASO_SUELO_M.rest);
  });

  it('la URL de los rásters se arma con el mismo número', () => {
    // Si alguien cambia PASO_SUELO_M.cog sin mover la carpeta, o al revés, la
    // app pediría un archivo que no existe o declararía un paso que no es.
    const cog = readFileSync(join(RAIZ, 'lib', 'soilgridsCog.ts'), 'utf8');
    expect(cog).toContain('data_aggregated/${RESOLUCION_M}m');
    expect(cog).toContain('_mean_${RESOLUCION_M}.tif');
    expect(cog).toContain('PASO_SUELO_M.cog');
  });
});

describe('pasoSueloTexto', () => {
  it('pasa a kilómetros recién cuando corresponde', () => {
    expect(pasoSueloTexto(250)).toBe('~250 m');
    expect(pasoSueloTexto(1000)).toBe('~1 km');
    expect(pasoSueloTexto(30)).toBe('~30 m');
  });

  it('el texto habitual es el del camino principal', () => {
    expect(PASO_SUELO_HABITUAL).toBe(pasoSueloTexto(PASO_SUELO_M.cog));
    expect(PASO_SUELO_HABITUAL).toBe('~1 km');
  });
});

describe('nadie vuelve a tipear la resolución a mano', () => {
  /**
   * Los archivos donde el número ya estuvo escrito. No es la lista de todos los
   * que podrían tenerlo: es la lista de los que lo tuvieron, que es donde la
   * falla vuelve.
   */
  const VIGILADOS = [
    'lib/guia.ts',
    'lib/suelos.ts',
    'lib/sueloFuentes.ts',
    'components/SuelosPanel.tsx',
    'components/InformeView.tsx',
  ];

  /**
   * Lo que se vigila es lo que sale en pantalla, no lo que está documentado.
   * Los comentarios de estos archivos cuentan justamente esta historia —por qué
   * el paso cambió y qué decía antes— y tienen que poder nombrar el número
   * viejo. Así que se les saca el comentario y se mira el código que queda.
   */
  const sinComentarios = (s: string) =>
    s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

  it.each(VIGILADOS)('%s no afirma una resolución de suelo escrita a mano', (rel) => {
    const codigo = sinComentarios(readFileSync(join(RAIZ, rel), 'utf8'));
    // `PASO_SUELO_M` es la única declaración legítima de los dos números.
    const sinTabla = codigo.replace(/PASO_SUELO_M = \{[^}]*\}/, '');
    expect(sinTabla).not.toMatch(/~\s*250\s*m/);
    expect(sinTabla).not.toMatch(/250\s*metros/);
  });
});

describe('la guía dice el paso que la app usa de verdad', () => {
  const textos = [
    ...PERFILES.map(p => p.ojo),
    ...SINTOMAS.map(s => s.porque),
  ].join('\n');

  it('menciona el paso real al menos una vez', () => {
    expect(textos).toContain(PASO_SUELO_HABITUAL);
  });

  it('no quedó ningún «250 m» suelto', () => {
    expect(textos).not.toMatch(/250\s*m(etros)?/);
  });
});
