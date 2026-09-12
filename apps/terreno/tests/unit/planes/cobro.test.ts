import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { ACEQUIA_TRIAL_DAYS } from '@arteytierra/config/acequia';
import {
  estadoEfectivo,
  rotuloEstado,
  type SuscripcionActual,
} from '@/lib/suscripcionEstado';
import {
  ESTADO_PAGOS_POR_DEFECTO,
  normalizarEstadoPagos,
} from '@/lib/estadoPagosDato';

/*
 * Lo que la pantalla dice sobre el cobro tiene que salir de la misma regla con
 * la que el servidor da o niega el acceso. Cuando no coinciden no se rompe
 * nada: aparece un número o un rótulo plausible y equivocado, que es la falla
 * cara de este producto.
 */

const AHORA = Date.parse('2026-09-12T12:00:00Z');
const AYER = '2026-09-11T12:00:00Z';
const MANANA = '2026-09-13T12:00:00Z';

function fila(p: Partial<SuscripcionActual>): SuscripcionActual {
  return {
    plan: 'personal',
    estado: 'activa',
    periodo: 'mensual',
    provider: 'paypal',
    vigenteHasta: MANANA,
    finDePrueba: null,
    seDaDeBajaAlFinal: false,
    ...p,
  };
}

describe('estado efectivo de la suscripción', () => {
  it('sin fila es sin suscripción', () => {
    expect(estadoEfectivo(null, AHORA)).toBe('sin_suscripcion');
  });

  it('una prueba vigente es prueba, y una vencida no', () => {
    expect(estadoEfectivo(fila({ estado: 'prueba', finDePrueba: MANANA }), AHORA)).toBe('prueba');
    expect(estadoEfectivo(fila({ estado: 'prueba', finDePrueba: AYER }), AHORA)).toBe('vencida');
    // Estado 'prueba' sin fecha de fin no es una prueba abierta para siempre.
    expect(estadoEfectivo(fila({ estado: 'prueba', finDePrueba: null }), AHORA)).toBe('vencida');
  });

  it('una activa con la vigencia pasada está vencida, aunque la fila diga activa', () => {
    // Es el caso que hay hoy en producción: la fila dice 'activa' con
    // vigente_hasta en el pasado, el acceso ya cayó a Semilla y "Mi cuenta"
    // mostraba "Al día".
    expect(estadoEfectivo(fila({ estado: 'activa', vigenteHasta: AYER }), AHORA)).toBe('vencida');
    expect(estadoEfectivo(fila({ estado: 'activa', vigenteHasta: MANANA }), AHORA)).toBe('activa');
  });

  it('sin fecha de vigencia la activa sigue valiendo', () => {
    // Mismo criterio que planEfectivo: null es "se recalcula en cada
    // renovación", no "vencida".
    expect(estadoEfectivo(fila({ estado: 'activa', vigenteHasta: null }), AHORA)).toBe('activa');
  });

  it('una fecha ilegible no otorga acceso', () => {
    expect(estadoEfectivo(fila({ estado: 'activa', vigenteHasta: 'cuando sea' }), AHORA)).toBe('vencida');
  });

  it('cancelada y cualquier estado desconocido no dan acceso', () => {
    expect(estadoEfectivo(fila({ estado: 'cancelada' }), AHORA)).toBe('cancelada');
    expect(estadoEfectivo(fila({ estado: 'pausada_por_el_proveedor' }), AHORA)).toBe('vencida');
  });

  it('el rótulo distingue la baja programada de la baja hecha', () => {
    expect(rotuloEstado('activa', false)).toBe('Activa');
    expect(rotuloEstado('activa', true)).toBe('Activa, sin renovación');
    expect(rotuloEstado('cancelada', false)).toBe('Dada de baja');
    expect(rotuloEstado('vencida', false)).toBe('Vencida');
  });
});

describe('el estado del cobro se le pregunta a quien cobra', () => {
  it('si la web no contesta, no promete una prueba ni inventa la cotización', () => {
    expect(ESTADO_PAGOS_POR_DEFECTO.prueba).toBe(false);
    expect(ESTADO_PAGOS_POR_DEFECTO.arsPorUsd).toBeNull();
    // El botón sigue: si los pagos estuvieran apagados de verdad, el checkout
    // responde 503 y la pantalla lo muestra.
    expect(ESTADO_PAGOS_POR_DEFECTO.pagos).toBe(true);
    expect(ESTADO_PAGOS_POR_DEFECTO.diasPrueba).toBe(ACEQUIA_TRIAL_DAYS);
  });

  it('una respuesta que no es un objeto no habilita nada', () => {
    expect(normalizarEstadoPagos(null)).toEqual(ESTADO_PAGOS_POR_DEFECTO);
    expect(normalizarEstadoPagos('<html>502</html>')).toEqual(ESTADO_PAGOS_POR_DEFECTO);
  });

  it('una cotización cero, negativa o ilegible se descarta en vez de multiplicar por ella', () => {
    for (const valor of [0, -1420, 'mil quinientos', null, undefined]) {
      expect(normalizarEstadoPagos({ arsPorUsd: valor }).arsPorUsd).toBeNull();
    }
  });

  it('la prueba sólo se anuncia si la web dijo que sí, explícitamente', () => {
    expect(normalizarEstadoPagos({}).prueba).toBe(false);
    expect(normalizarEstadoPagos({ prueba: 'true' }).prueba).toBe(false);
    expect(normalizarEstadoPagos({ prueba: true }).prueba).toBe(true);
  });

  it('toma la respuesta de la web tal cual cuando es válida', () => {
    expect(normalizarEstadoPagos({ pagos: true, prueba: true, diasPrueba: 3, arsPorUsd: 1420.5 }))
      .toEqual({ pagos: true, prueba: true, diasPrueba: 3, arsPorUsd: 1420.5 });
  });
});

/*
 * Las dos reglas de arriba se pueden respetar hoy y romper mañana escribiendo
 * de nuevo la bandera o la cotización de este lado. Estas dos las cuidan
 * leyendo el código fuente.
 */
describe('acequia no decide sola qué se cobra', () => {
  const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
  const CARPETAS = ['app', 'components', 'lib', 'hooks'];

  function fuentes(dir: string): string[] {
    const salida: string[] = [];
    for (const entrada of readdirSync(dir)) {
      const ruta = join(dir, entrada);
      if (statSync(ruta).isDirectory()) salida.push(...fuentes(ruta));
      else if (/\.(ts|tsx)$/.test(entrada)) salida.push(ruta);
    }
    return salida;
  }

  const archivos = CARPETAS.flatMap((c) => fuentes(join(raiz, c)));

  /**
   * Se miran las sentencias, no los comentarios: los dos módulos que arreglaron
   * esto explican en su encabezado por qué no leen la bandera, y nombrarla no es
   * leerla.
   */
  function codigo(ruta: string): string {
    return readFileSync(ruta, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter((linea) => !linea.trimStart().startsWith('//'))
      .join('\n');
  }

  it('no lee ACEQUIA_TRIAL_ENABLED: esa variable vive donde están las credenciales', () => {
    const culpables = archivos.filter((a) => codigo(a).includes('ACEQUIA_TRIAL_ENABLED'));
    expect(culpables).toEqual([]);
  });

  it('no escribe su propia cotización del peso', () => {
    // El componente de confirmación tenía `const ARS_POR_USD = 1500` mientras
    // Mercado Pago cobraba con ACEQUIA_ARS_PER_USD. Dos precios, uno visible y
    // otro real.
    const culpables = archivos.filter((a) => /ARS_POR_USD\s*=\s*\d/.test(readFileSync(a, 'utf8')));
    expect(culpables).toEqual([]);
  });
});
