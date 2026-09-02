/**
 * Estado del relieve como una sola cosa.
 *
 * Antes eran tres `useState` sueltos —`datosShader`, `shaderLoading`,
 * `shaderError`— que siempre se movían juntos pero nada obligaba a que fueran
 * coherentes. Se podía escribir "calculando + con error + con datos viejos", y
 * de hecho pasaba: cada una de las cinco salidas de la cascada apagaba el
 * loading a mano, así que alcanzaba con olvidarse en una para dejar el spinner
 * girando para siempre.
 *
 * Con una unión discriminada esa combinación no se puede ni escribir.
 */
import type { DatosShader } from '@/lib/shaders';
import type { ResultadoRelieve } from './obtenerShader';

export type EstadoRelieve =
  | { fase: 'vacio' }
  | { fase: 'calculando' }
  | { fase: 'listo';  datos: DatosShader }
  | { fase: 'error';  mensaje: string };

export type AccionRelieve =
  /** Arranca el cálculo. Descarta lo anterior: el predio cambió. */
  | { t: 'calcular' }
  /** Llegó la respuesta del orquestador. */
  | { t: 'resuelto'; res: ResultadoRelieve }
  /** Datos que no salieron de la cascada: import de un DEM, escenario guardado. */
  | { t: 'poner'; datos: DatosShader | null };

export const RELIEVE_VACIO: EstadoRelieve = { fase: 'vacio' };

export function reducerRelieve(estado: EstadoRelieve, accion: AccionRelieve): EstadoRelieve {
  switch (accion.t) {
    case 'calcular':
      return { fase: 'calculando' };

    case 'resuelto':
      return accion.res.ok
        ? { fase: 'listo', datos: accion.res.datos }
        : { fase: 'error', mensaje: accion.res.mensaje };

    case 'poner':
      return accion.datos ? { fase: 'listo', datos: accion.datos } : RELIEVE_VACIO;

    default: {
      // Si mañana se agrega una acción y falta el case, esto no compila.
      accion satisfies never;
      return estado;
    }
  }
}

/** Los datos, o `null` si todavía no hay. Para los consumidores que no miran la fase. */
export function datosDe(estado: EstadoRelieve): DatosShader | null {
  return estado.fase === 'listo' ? estado.datos : null;
}
