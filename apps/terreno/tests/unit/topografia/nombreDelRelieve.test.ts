/**
 * Que ningún panel vuelva a afirmar de qué modelo de elevación salen sus números.
 *
 * Este bug ya apareció dos veces. El router elige la mejor fuente del lugar
 * —swissALTI3D en Suiza, AHN en Países Bajos, 3DEP en EE.UU.— pero los textos
 * de la UI tenían "SRTM 30 m" escrito a mano, así que sobre un predio suizo la
 * app decía swissALTI3D en el chip del mapa y SRTM en la nota al pie, al mismo
 * tiempo. No es cosmético: el usuario decide si confía en una curva de 50 cm
 * según de qué modelo salió.
 *
 * La regla es simple: en un texto que el usuario lee, la fuente se nombra con
 * `useTextoRelieve()` (o con `datos.topo.fuente` en el informe), nunca a mano.
 * Las excepciones de abajo son afirmaciones que sí son ciertas siempre.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fmtPaso } from '@/lib/contextoRelieve';

const COMPONENTES = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '../../../components',
);

/**
 * Una fuente de relieve nombrada junto a un número o a la palabra MDE: el patrón
 * de "acá se está afirmando de dónde salen las cotas".
 */
const AFIRMA_FUENTE = /(SRTM|Terrarium|GLO-?30|Copernicus)/i;

/**
 * Dónde está permitido escribirlo a mano, y por qué. Si agregás una excepción,
 * dejá el motivo: sirve para que la próxima persona no la copie sin pensar.
 */
const PERMITIDO: Record<string, string> = {
  'MapLeaflet.tsx':
    'atribución de OpenTopoMap, que efectivamente rellena con SRTM — la exige su licencia',
  'InformeView.tsx':
    'el anexo describe la cadena de respaldo entera (nacional → GLO-30 → SRTM), no la fuente de este predio',
};

/**
 * Sólo lo que termina en pantalla: el texto suelto entre etiquetas JSX y los
 * props que son rótulos. Deja afuera el código —URLs de tiles, nombres de
 * encoding, comentarios—, que puede nombrar una fuente sin afirmarle nada a
 * nadie.
 */
function textosVisibles(fuente: string): string[] {
  // Los comentarios pueden nombrar la fuente todo lo que quieran: explican el
  // código, no le afirman nada al usuario. Se sacan primero para que no se
  // cuelen en un texto que arranca en una llave y termina en otra.
  const src = fuente.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');
  const limpiar = (t: string) => t.replace(/\s+/g, ' ').trim();

  // 1. Texto suelto de JSX. Los bordes pueden ser llaves además de etiquetas:
  //    un párrafo se parte en pedazos cada vez que intercala un {valor}, y el
  //    pedazo de después de la llave se lee igual que el de antes. Puede ocupar
  //    varias líneas, que es como está escrita casi toda nota al pie de la app.
  //    Como el barrido es tan ancho, se descarta lo que tenga ";" o "=", que es
  //    código colado: bloques de tipos (`pines: Pin[];`) y URLs (`?z=`).
  const sueltos = [...src.matchAll(/[>}]([^<>{}]{12,})[<{]/g)]
    .map(m => limpiar(m[1]!))
    .filter(t => /\S\s\S/.test(t) && !/[;=]/.test(t));

  // 2. Props que son rótulos. Acá el contenido es texto por definición, así que
  //    no se filtra: una atribución lleva entidades HTML (`&copy;`) y se caería
  //    con el filtro de arriba.
  const rotulos = [...src.matchAll(
    /(?:label|title|placeholder|texto|nota|attribution)=(?:"([^"]+)"|'([^']+)'|\{`([^`]+)`\})/g,
  )].map(m => limpiar(m[1] ?? m[2] ?? m[3] ?? ''));

  return [...sueltos, ...rotulos].filter(Boolean);
}

describe('nadie afirma a mano de qué modelo de elevación salen las cotas', () => {
  const archivos = readdirSync(COMPONENTES).filter(f => f.endsWith('.tsx'));

  it('hay componentes para revisar (si esto falla, cambió la ruta)', () => {
    expect(archivos.length).toBeGreaterThan(20);
  });

  for (const archivo of archivos) {
    it(`${archivo} nombra la fuente por contexto y no a mano`, () => {
      const src = readFileSync(path.join(COMPONENTES, archivo), 'utf8');
      const hallazgos = textosVisibles(src).filter(t => AFIRMA_FUENTE.test(t));

      if (PERMITIDO[archivo]) {
        // La excepción existe por algo concreto; si el archivo dejó de tener el
        // texto que la justificaba, la excepción sobra y hay que sacarla.
        expect(hallazgos.length, `sobra la excepción de ${archivo}`).toBeGreaterThan(0);
        return;
      }
      expect(hallazgos, 'usá useTextoRelieve() en vez de escribir la fuente').toEqual([]);
    });
  }
});

describe('fmtPaso', () => {
  it('dice los pasos finos en centímetros, que es como se leen', () => {
    expect(fmtPaso(0.5)).toBe('50 cm');
    expect(fmtPaso(0.25)).toBe('25 cm');
  });

  it('no arrastra decimales cuando no hacen falta', () => {
    expect(fmtPaso(2)).toBe('2 m');
    expect(fmtPaso(30)).toBe('30 m');
  });

  it('con paso quebrado deja un solo decimal', () => {
    expect(fmtPaso(2.5)).toBe('2.5 m');
    expect(fmtPaso(3.14159)).toBe('3.1 m');
  });
});
