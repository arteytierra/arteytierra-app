import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { PRACTICAS_POR_FICHA, practicasDeFicha } from '@/lib/practicasHistoricas';
import { fichaPorId } from '@/lib/contexto';

/*
 * El contrato de las prácticas documentadas.
 *
 * Esta capa existe porque 188 de las 210 fichas regionales tienen `saberes: []`
 * a propósito —a escala de ecorregión atribuirle una práctica a un pueblo sería
 * inventar— y la sección quedaba vacía, que se leía como "acá no hay nada".
 * Decir qué se hizo y cuándo sí se puede: es lo que el registro fecha.
 *
 * Pero el riesgo cambió de lugar, no desapareció. Antes el error posible era
 * atribuir mal; ahora es afirmar un hecho histórico sin respaldo. Una cita
 * inventada es corta, plausible y pasa cualquier revisión de código —al armar
 * el archivo, un DOI escrito de memoria resolvió a un artículo distinto de la
 * misma revista—, así que lo que este test defiende es que cada afirmación
 * quede a un clic de poder ser desmentida.
 *
 * Lo que NO puede hacer: verificar que la fuente diga lo que decimos. Eso lo
 * hace una persona. Tampoco chequea que la URL esté viva: sería un test que
 * falla por una caída ajena y que además no corre sin red.
 */

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..', '..');
const leer = (ruta: string) => readFileSync(join(RAIZ, ruta), 'utf8');

const TODAS = Object.entries(PRACTICAS_POR_FICHA).flatMap(
  ([fichaId, lista]) => lista.map(p => ({ fichaId, ...p })),
);

describe('las prácticas documentadas', () => {
  it('hay al menos una, y cada una cuelga de una ficha que existe', () => {
    expect(TODAS.length).toBeGreaterThan(0);
    for (const fichaId of Object.keys(PRACTICAS_POR_FICHA)) {
      // Una clave con un id mal tipeado no rompe nada: simplemente la práctica
      // no se muestra nunca, que es la peor forma de perder trabajo escrito.
      expect(fichaPorId(fichaId), `ficha inexistente: ${fichaId}`).not.toBeNull();
    }
  });

  it('ninguna afirma nada sin una fuente publicada', () => {
    for (const p of TODAS) {
      expect(p.fuentes.length, `sin fuente: ${p.practica}`).toBeGreaterThan(0);
      for (const f of p.fuentes) {
        expect(f.url, `${p.practica}: fuente sin https`).toMatch(/^https:\/\/\S+$/);
        expect(f.label.trim().length, `${p.practica}: fuente sin rótulo`).toBeGreaterThan(10);
      }
    }
  });

  it('no cita enciclopedias colaborativas como fuente', () => {
    // No es esnobismo: Wikipedia es un buen punto de partida y una mala
    // referencia para fechar una obra en el territorio de alguien. Si el dato
    // es cierto, tiene una publicación detrás; esa es la que va.
    for (const p of TODAS) {
      for (const f of p.fuentes) {
        expect(f.url, `${p.practica}: cita una enciclopedia`).not.toMatch(/wikipedia\.org|wikiwand/i);
      }
    }
  });

  it('todas dicen cuándo, y lo dicen en texto', () => {
    for (const p of TODAS) {
      expect(p.periodo.trim().length, `${p.practica}: sin período`).toBeGreaterThan(4);
    }
  });

  it('el detalle le sirve a alguien que está diseñando, no es una definición', () => {
    // El umbral es bajo a propósito: no mide calidad, corta el amague de dejar
    // un título con dos palabras abajo y seguir.
    for (const p of TODAS) {
      expect(p.detalle.trim().length, `${p.practica}: detalle demasiado corto`).toBeGreaterThan(120);
    }
  });

  it('no repite una misma práctica dentro de una ficha', () => {
    for (const [fichaId, lista] of Object.entries(PRACTICAS_POR_FICHA)) {
      const nombres = lista.map(p => p.practica.toLowerCase());
      expect(new Set(nombres).size, `duplicada en ${fichaId}`).toBe(nombres.length);
    }
  });

  it('practicasDeFicha nunca devuelve undefined', () => {
    expect(practicasDeFicha('esta_ficha_no_existe')).toEqual([]);
  });
});

describe('dónde vive esta capa', () => {
  it('fichaPorId se las inyecta a la ficha', () => {
    const [fichaId] = Object.keys(PRACTICAS_POR_FICHA);
    const ficha = fichaPorId(fichaId!);
    expect(ficha?.practicas?.length).toBe(PRACTICAS_POR_FICHA[fichaId!]!.length);
  });

  it('una ficha sin prácticas cargadas no estrena un campo vacío', () => {
    // `practicas: []` y `practicas: undefined` se renderizan igual hoy, pero el
    // día que alguien escriba `ficha.practicas &&` dejan de hacerlo. Que no
    // aparezca el campo es la señal correcta.
    const sinPracticas = fichaPorId('amazonia_noroccidental_tierra_firme');
    expect(sinPracticas).not.toBeNull();
    expect(sinPracticas?.practicas).toBeUndefined();
  });

  it('ningún catálogo generado declara prácticas', () => {
    // Si un montaje futuro empieza a escribirlas adentro de los catálogos, el
    // siguiente montaje se las lleva puestas sin que nadie se entere. Van en la
    // capa editorial, que ningún generador toca.
    const generados = [
      'lib/biomasRegionalesAmerica.ts',
      'lib/biomasRegionalesCanada.ts',
      'lib/biomasRegionalesEuropa.ts',
      'lib/biomasRegionalesEuropaUE.ts',
      'lib/biomasRegionalesMedioOriente.ts',
      'lib/biomasRegionalesNorteAfrica.ts',
      'lib/biomasRegionalesSudamerica.ts',
    ];
    for (const ruta of generados) {
      expect(leer(ruta), `${ruta} declara practicas`).not.toMatch(/^\s*practicas:/m);
    }
  });
});

describe('el panel de contexto', () => {
  const panel = leer('components/ContextoPanel.tsx');

  it('muestra la sección de prácticas cuando las hay', () => {
    expect(panel).toContain('Prácticas documentadas en el territorio');
    expect(panel).toContain('{practicas.length > 0 &&');
  });

  it('sigue explicando por qué no atribuye, pero sin ser un muro cuando hay prácticas', () => {
    expect(panel).toContain('{practicas.length === 0 &&');
    expect(panel).toContain('Saberes atribuidos a una cultura');
  });

  it('el informe también las lleva, con período y fuente', () => {
    const informe = leer('components/InformeView.tsx');
    expect(informe).toContain('Prácticas documentadas en el territorio');
    expect(informe).toContain('pr.periodo');
    expect(informe).toContain('pr.fuentes');
  });
});
