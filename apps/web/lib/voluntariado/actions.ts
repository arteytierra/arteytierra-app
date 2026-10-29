'use server';

import 'server-only';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { emitN8nEvent } from '@/lib/integrations/n8n';
import { sendEmail } from '@/lib/integrations/resend';
import { CONVOCATORIA_VOLUNTARIADO as C } from '@/lib/courses/data';
import {
  MOTIVO_CUPO_LLENO,
  cubrePeriodoCompleto,
  diasEntre,
  edadAlEmpezar,
  primerProblema,
  recibePostulaciones,
} from './reglas';

/**
 * Postulación al voluntariado de bioconstrucción de noviembre–diciembre.
 *
 * Son cinco lugares y se eligen, así que esto no es una inscripción: es una
 * postulación que se lee y se sigue con una entrevista por videollamada.
 * Formulario público, sin cuenta.
 *
 * La ventana, la estadía mínima y la edad salen de `CONVOCATORIA_VOLUNTARIADO`,
 * el mismo objeto del que la ficha saca lo que muestra. Escribir las fechas acá
 * otra vez es cómo se termina aceptando una llegada que la página declara
 * imposible.
 */

const NOTIFY_EMAIL = 'info.arteytierra@gmail.com';

/** El formulario es público: todo lo que llega se escapa antes de entrar al HTML del mail. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface VoluntariadoApplicationInput {
  nombre: string;
  email: string;
  whatsapp: string;
  ciudad: string;
  fechaNacimiento: string;
  fechaLlegada: string;
  fechaSalida: string;
  motivacion: string;
  experiencia?: string;
  restricciones?: string;
  /** Confirma que trae carpa, aislante térmico y bolsa de dormir. Sin eso no duerme. */
  equipo: boolean;
}

export async function submitVoluntariadoApplicationAction(input: VoluntariadoApplicationInput) {
  // La puerta primero. El formulario ya no se dibuja cuando el cupo está
  // cubierto, pero esto es una acción pública: alguien con el link viejo abierto
  // en una pestaña, o un POST armado a mano, siguen llegando acá.
  if (!recibePostulaciones()) throw new Error(MOTIVO_CUPO_LLENO);

  const nombre = input.nombre.trim();
  const email = input.email.trim();
  const whatsapp = input.whatsapp.trim();
  const ciudad = input.ciudad.trim();
  const fechaNacimiento = input.fechaNacimiento.trim();
  const fechaLlegada = input.fechaLlegada.trim();
  const fechaSalida = input.fechaSalida.trim();
  const motivacion = input.motivacion.trim();
  const experiencia = (input.experiencia ?? '').trim();
  const restricciones = (input.restricciones ?? '').trim();

  const problema = primerProblema({
    nombre, email, whatsapp, ciudad, fechaNacimiento, fechaLlegada, fechaSalida, motivacion,
    equipo: input.equipo,
  });
  if (problema) throw new Error(problema);

  const dias = diasEntre(fechaLlegada, fechaSalida);
  const cubreTodo = cubrePeriodoCompleto(fechaLlegada, fechaSalida);

  const rows: [string, string][] = [
    ['Nombre', nombre],
    ['Email', email],
    ['WhatsApp', whatsapp],
    ['Ciudad / país', ciudad],
    ['Fecha de nacimiento', `${fechaNacimiento} (${edadAlEmpezar(fechaNacimiento)} años al empezar)`],
    ['Llegada', fechaLlegada],
    ['Salida', fechaSalida],
    ['Estadía', `${dias} días${cubreTodo ? ' · CUBRE EL PERÍODO COMPLETO' : ''}`],
    ['Por qué quiere venir', motivacion],
    ['Experiencia en obra', experiencia || '— (no es requisito)'],
    ['Restricciones alimentarias / salud', restricciones || '—'],
    ['Equipo de acampe', 'Confirma que trae carpa, aislante y bolsa'],
  ];

  const html = `
<!DOCTYPE html>
<html lang="es">
<body style="font-family:Georgia,serif;background:#F5F0E8;padding:32px 16px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#FDFAF5;border-radius:6px;overflow:hidden;">
    <tr><td style="background:#2D2416;padding:20px 32px;">
      <p style="margin:0;color:#E8DCC8;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Arte y Tierra</p>
    </td></tr>
    <tr><td style="padding:32px;">
      <h2 style="margin:0 0 4px;font-size:20px;color:#2D2416;">Postulación · Voluntariado de Bioconstrucción</h2>
      <p style="margin:0 0 24px;font-size:13px;color:#7A6F65;">${esc(C.rango)} · Tay Pichín</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E8DCC8;">
        ${rows
          .map(
            ([label, val]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E8DCC8;font-size:12px;font-weight:700;color:#7A6F65;width:150px;vertical-align:top;">${esc(label)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #E8DCC8;font-size:13px;color:#2D2416;">${esc(val)}</td>
        </tr>`,
          )
          .join('')}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // Primero queda anotada, después se avisa. Al revés, un fallo de Resend borra
  // la postulación — la misma lección que dejó el formulario de oficio.
  const notas = rows
    .filter(([label]) => label !== 'Nombre' && label !== 'Email' && label !== 'WhatsApp')
    .map(([label, val]) => `${label}: ${val}`)
    .join(' · ');
  const { error: errorGuardado } = await createSupabaseAdminClient()
    .schema('app')
    .from('contacts')
    .insert({
      email,
      full_name: nombre,
      phone: whatsapp || null,
      source: 'voluntariado-bioconstruccion',
      tags: ['web', 'voluntariado', 'bioconstruccion'],
      lifecycle_stage: 'lead',
      notes: notas,
    });
  if (errorGuardado) console.error('[voluntariado] no se pudo guardar el contacto', errorGuardado);
  const guardado = !errorGuardado;

  const ok = await sendEmail({
    to: NOTIFY_EMAIL,
    from: 'Arte y Tierra · Web <notificaciones@arteytierra.org>',
    // Contestar el aviso le escribe a quien se postuló, no a la casilla del sitio.
    replyTo: email,
    subject: `Postulación voluntariado · ${nombre} · ${dias} días${cubreTodo ? ' (completo)' : ''}`,
    html,
  });
  // Sólo se le pide reintentar si además no quedó guardada: si está en el CRM,
  // el dato no se perdió aunque el mail no haya salido.
  if (!ok && !guardado) {
    throw new Error('No se pudo enviar la postulación. Probá de nuevo o escribinos por WhatsApp.');
  }

  void emitN8nEvent('voluntariado-applied', {
    nombre,
    email,
    whatsapp,
    ciudad,
    fecha_nacimiento: fechaNacimiento,
    fecha_llegada: fechaLlegada,
    fecha_salida: fechaSalida,
    dias,
    cubre_periodo_completo: cubreTodo,
    motivacion,
    experiencia,
    restricciones,
  });

  return { ok: true as const };
}
