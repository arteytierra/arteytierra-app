import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import {
  ACEQUIA_FEATURES,
  ACEQUIA_TRIAL_DAYS,
  ACEQUIA_TRIAL_PLAN,
  acequiaFinDePrueba,
  acequiaPlanHabilita,
  acequiaTienePrueba,
  acequiaTrialDays,
  type AcequiaFeature,
} from '@arteytierra/config/acequia';

/*
 * La prueba es de un plan, no del checkout.
 *
 * Hasta el 23/11/2026 el alta de cualquier plan contratable arrancaba con tres
 * días en cero: la prueba la decidía `pruebaComercialHabilitada()`, una
 * variable de entorno del proyecto que cobra, y el plan no entraba en la
 * cuenta. Así que Profesional —que cuesta el triple que Personal— se probaba
 * igual, y el primer cobro se corría tres días en los dos casos.
 *
 * Decisión de Jonatan: la prueba es de Personal. Profesional y Estudio se
 * cobran desde el primer día. Lo que estos tests cuidan no es el número 3: es
 * que la regla viva en el catálogo y que ninguna pantalla pueda prometer una
 * prueba mirando sólo la bandera de entorno.
 */
describe('la prueba sin cargo es de un solo plan', () => {
  it('Personal se prueba; Profesional y Estudio se cobran desde el día uno', () => {
    expect(ACEQUIA_TRIAL_PLAN).toBe('personal');
    expect(acequiaTrialDays('personal')).toBe(ACEQUIA_TRIAL_DAYS);
    expect(acequiaTrialDays('profesional')).toBe(0);
    expect(acequiaTrialDays('estudio')).toBe(0);
  });

  it('acequiaTienePrueba contesta por nombre, incluido el nombre viejo', () => {
    expect(acequiaTienePrueba('personal')).toBe(true);
    expect(acequiaTienePrueba('profesional')).toBe(false);
    // 'disenador' resuelve a Profesional: un link viejo tampoco consigue prueba.
    expect(acequiaTienePrueba('disenador')).toBe(false);
    expect(acequiaTienePrueba('semilla')).toBe(false);
    expect(acequiaTienePrueba('no_existe')).toBe(false);
  });

  it('el fin de la prueba es null para el plan que no tiene prueba', () => {
    // Null y no "hoy": una fecha cualquiera se puede imprimir como primer cobro
    // sin que nadie note que no correspondía ninguna prueba.
    expect(acequiaFinDePrueba('profesional')).toBeNull();
    expect(acequiaFinDePrueba('estudio')).toBeNull();
  });

  it('la prueba de Personal dura los días del catálogo, contados en UTC', () => {
    const desde = new Date('2026-11-23T21:30:00Z');
    const fin = acequiaFinDePrueba('personal', desde);
    expect(fin).not.toBeNull();
    expect(fin!.toISOString()).toBe('2026-11-26T21:30:00.000Z');
    // Y no muta la fecha que se le pasó.
    expect(desde.toISOString()).toBe('2026-11-23T21:30:00.000Z');
  });
});

/*
 * Por qué la decisión no deja a nadie sin poder mirar antes de pagar: el plan
 * que se prueba es el que trae las herramientas. Lo que Profesional agrega es
 * de cartera —diez proyectos— y de entrega —el informe con marca propia—, no
 * una función de análisis ni de diseño.
 *
 * Si algún día una función de análisis o de diseño pasara a Profesional, este
 * test falla, y hay que decidir a conciencia: o la función baja a Personal, o
 * la prueba deja de mostrar el producto completo y el argumento de arriba ya no
 * se puede escribir en la vidriera.
 */
describe('la prueba muestra el producto, no una parte', () => {
  it('lo único que Profesional agrega sobre Personal es el informe con marca propia', () => {
    const suma = (Object.keys(ACEQUIA_FEATURES) as AcequiaFeature[]).filter(
      (f) => acequiaPlanHabilita('profesional', f) && !acequiaPlanHabilita(ACEQUIA_TRIAL_PLAN, f),
    );
    expect(suma).toEqual(['informe.white_label']);
  });

  it('todo el análisis y todo el diseño entran en el plan que se prueba', () => {
    const fuera = (Object.keys(ACEQUIA_FEATURES) as AcequiaFeature[]).filter(
      (f) => (f.startsWith('analisis.') || f.startsWith('diseno.'))
        && !acequiaPlanHabilita(ACEQUIA_TRIAL_PLAN, f),
    );
    expect(fuera, 'funciones de análisis o diseño afuera de la prueba:\n' + fuera.join('\n')).toEqual([]);
  });
});

/*
 * Las reglas de arriba se pueden respetar hoy y romper mañana volviendo a
 * calcular los días de prueba con la constante global en una pantalla. Estos
 * dos tests lo cuidan leyendo el código fuente, que es lo que ya se hace en
 * `cobro.test.ts` con la bandera de entorno.
 */
describe('ninguna pantalla promete una prueba sin mirar el plan', () => {
  const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

  function codigo(ruta: string): string {
    return readFileSync(join(raiz, ruta), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter((linea) => !linea.trimStart().startsWith('//'))
      .join('\n');
  }

  it('/suscribir cuenta los días del plan, no los que contestó la web', () => {
    // `pagos.diasPrueba` es el número de Personal: usarlo para la fecha del
    // primer cobro de Profesional corre el cobro tres días en la pantalla y no
    // en el proveedor.
    const fuente = codigo('app/suscribir/page.tsx');
    expect(fuente).toContain('acequiaTrialDays(plan)');
    expect(fuente).not.toContain('+ pagos.diasPrueba');
  });

  it('la confirmación decide el cartel con los días de este plan', () => {
    const fuente = codigo('components/SuscribirConfirm.tsx');
    expect(fuente).toContain('diasPrueba > 0');
    // `pagos.prueba` sigue sirviendo —sin la bandera no hay prueba de nada—
    // pero no puede ser lo único que decide el cartel de "Hoy: USD 0".
    expect(fuente).not.toMatch(/\{pagos\.prueba && \(/);
  });
});
