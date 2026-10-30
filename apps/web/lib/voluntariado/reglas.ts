import { CONVOCATORIA_VOLUNTARIADO as C } from '@/lib/courses/data';

/**
 * Las reglas de la postulación al voluntariado, en funciones puras.
 *
 * Viven afuera de `actions.ts` por dos razones. La primera es que un archivo
 * con `'use server'` sólo puede exportar funciones asíncronas, así que no se
 * pueden probar desde un test sin arrastrar Supabase y Resend. La segunda es
 * peor: el formulario del navegador también valida, y si cada lado escribe su
 * propia cuenta de días y de años, un día se corren uno del otro y el cliente
 * deja mandar algo que el servidor rechaza — o al revés, que es peor, porque
 * alguien queda afuera sin entender por qué.
 *
 * Acá se escribe una vez y la usan los dos.
 *
 * Todas las fechas se manejan en UTC a propósito, igual que en
 * `lib/courses/formato.ts`: `'2026-11-15'` parseado en hora de Argentina cae el
 * 14, y con eso el primer día de la convocatoria queda fuera de su propia
 * ventana.
 */

/** Milisegundos UTC de una fecha `YYYY-MM-DD`. */
export function dia(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getTime();
}

/** Días entre dos fechas ISO, contando de la primera a la segunda. */
export function diasEntre(desde: string, hasta: string): number {
  return Math.round((dia(hasta) - dia(desde)) / (1000 * 60 * 60 * 24));
}

/**
 * Años cumplidos **al empezar la convocatoria**, no al momento de postularse.
 * Alguien que cumple 18 entre la postulación y la llegada entra.
 */
export function edadAlEmpezar(fechaNacimiento: string): number {
  const nac = new Date(`${fechaNacimiento}T00:00:00Z`);
  const ref = new Date(`${C.fechas.desde}T00:00:00Z`);
  let edad = ref.getUTCFullYear() - nac.getUTCFullYear();
  const cumpleDespues =
    ref.getUTCMonth() < nac.getUTCMonth() ||
    (ref.getUTCMonth() === nac.getUTCMonth() && ref.getUTCDate() < nac.getUTCDate());
  if (cumpleDespues) edad -= 1;
  return edad;
}

/**
 * Última fecha de nacimiento que llega a la edad mínima el primer día.
 * Es lo que el formulario le pone de tope al calendario, para que el navegador
 * no deje elegir una fecha que el servidor va a rechazar.
 */
export function nacimientoMaximo(): string {
  const d = new Date(`${C.fechas.desde}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() - C.edadMinima);
  return d.toISOString().slice(0, 10);
}

/**
 * ¿La convocatoria sigue recibiendo postulaciones?
 *
 * Es una pregunta aparte de `primerProblema` a propósito. Las reglas de quién
 * califica no cambiaron —la edad, la ventana, la estadía mínima siguen valiendo
 * tal cual para la próxima convocatoria—; lo que está cerrado es la puerta. Si
 * el cupo lleno se metiera adentro de la validación, el día que se abra de nuevo
 * habría que desarmarla en vez de bajar una bandera, y los tests de las reglas
 * empezarían a fallar por algo que no tiene nada que ver con ellas.
 */
export function recibePostulaciones(): boolean {
  return !C.cupoLleno;
}

/**
 * Lo que se le contesta a quien llega con la puerta cerrada.
 *
 * Lo dicen los dos lados: el panel que reemplaza al formulario y la acción de
 * servidor, que es la que no se puede saltear.
 */
export const MOTIVO_CUPO_LLENO = `Los ${C.cupos} lugares de esta convocatoria ya están cubiertos.`;

export interface DatosPostulacion {
  nombre: string;
  email: string;
  whatsapp: string;
  ciudad: string;
  fechaNacimiento: string;
  fechaLlegada: string;
  fechaSalida: string;
  motivacion: string;
  equipo: boolean;
}

/** El primer problema que encuentra, o `null` si la postulación sirve. */
export function primerProblema(d: DatosPostulacion): string | null {
  if (!d.nombre || d.nombre.trim().length < 2) return 'Falta el nombre completo';
  if (!d.email.match(/.+@.+\..+/)) return 'Email inválido';
  if (!d.whatsapp.trim()) return 'Falta un WhatsApp de contacto';
  if (!d.ciudad.trim()) return 'Falta ciudad y país';
  if (!d.fechaNacimiento) return 'Falta la fecha de nacimiento';
  if (edadAlEmpezar(d.fechaNacimiento) < C.edadMinima) {
    return `La convocatoria es para mayores de ${C.edadMinima} años. Escribinos por WhatsApp y lo vemos.`;
  }
  if (!d.fechaLlegada || !d.fechaSalida) return 'Faltan las fechas de llegada y salida';
  if (dia(d.fechaSalida) <= dia(d.fechaLlegada)) return 'La salida tiene que ser posterior a la llegada';
  if (dia(d.fechaLlegada) < dia(C.fechas.desde) || dia(d.fechaSalida) > dia(C.fechas.hasta)) {
    return `Las fechas tienen que caer dentro de la convocatoria: ${C.rango}.`;
  }
  if (diasEntre(d.fechaLlegada, d.fechaSalida) < C.diasMinimos) {
    return `La estadía mínima es de ${C.diasMinimos} días.`;
  }
  if (d.motivacion.trim().length < 30) return 'Contanos un poco más sobre por qué querés venir';
  if (!d.equipo) {
    return 'Hay que confirmar que traés carpa, aislante térmico y bolsa de dormir: no los prestamos.';
  }
  return null;
}

/** Si la estadía cubre la convocatoria entera. Esas tienen prioridad en el cupo. */
export function cubrePeriodoCompleto(fechaLlegada: string, fechaSalida: string): boolean {
  return dia(fechaLlegada) === dia(C.fechas.desde) && dia(fechaSalida) === dia(C.fechas.hasta);
}
