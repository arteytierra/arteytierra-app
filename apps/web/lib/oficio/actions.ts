'use server';

import 'server-only';
import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { emitN8nEvent } from '@/lib/integrations/n8n';
import { sendEmail } from '@/lib/integrations/resend';

/**
 * Postulación de "voluntariado de oficio" para Inmersión Viva: alguien con
 * un oficio (electricista, plomero, herrero, carpintero, community manager…)
 * ofrece ese servicio para la construcción de la ecoescuela a cambio de una
 * beca completa. Formulario público, sin cuenta — llega por email para
 * revisión manual + entrevista por videollamada. Reutiliza el bucket
 * `scholarships` (mismo uso de fondo: evidencia de una postulación).
 */

const BUCKET = 'scholarships';
const MAX_PHOTOS = 6;
const NOTIFY_EMAIL = 'info.arteytierra@gmail.com';

/** El formulario es público: todo lo que llega se escapa antes de entrar al HTML del mail. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const EXTENSIONES_OK = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'avif']);

export async function createOficioUploadUrlAction(input: { filename: string }) {
  const safe = input.filename.trim().replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  if (!safe) throw new Error('Falta nombre de archivo');
  // La acción es pública (el formulario no pide cuenta), así que al menos el
  // bucket sólo recibe imágenes y no cualquier cosa que alguien quiera alojar.
  const ext = safe.includes('.') ? safe.split('.').pop()!.toLowerCase() : '';
  if (!EXTENSIONES_OK.has(ext)) throw new Error('Sólo aceptamos imágenes (jpg, png, webp, heic)');
  const path = `oficio/${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safe}`;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message ?? 'No se pudo preparar la subida');
  return { path, token: data.token, signedUrl: data.signedUrl };
}

export interface OficioApplicationInput {
  nombre: string;
  email: string;
  whatsapp: string;
  ciudad: string;
  fechaNacimiento: string;
  formacion: string;
  oficio: string;
  fechaLlegada: string;
  fechaSalida: string;
  redes: string;
  mensaje?: string;
  fotoPaths: string[];
}

function diasEntre(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export async function submitOficioApplicationAction(input: OficioApplicationInput) {
  const nombre = input.nombre.trim();
  const email = input.email.trim();
  const whatsapp = input.whatsapp.trim();
  const ciudad = input.ciudad.trim();
  const fechaNacimiento = input.fechaNacimiento.trim();
  const formacion = input.formacion.trim();
  const oficio = input.oficio.trim();
  const fechaLlegada = input.fechaLlegada.trim();
  const fechaSalida = input.fechaSalida.trim();
  const redes = input.redes.trim();
  const mensaje = (input.mensaje ?? '').trim();
  const fotoPaths = (input.fotoPaths ?? []).filter(Boolean).slice(0, MAX_PHOTOS);

  if (!nombre || nombre.length < 2) throw new Error('Falta el nombre completo');
  if (!email.match(/.+@.+\..+/)) throw new Error('Email inválido');
  if (!whatsapp) throw new Error('Falta un WhatsApp de contacto');
  if (!ciudad) throw new Error('Falta ciudad y país');
  if (!fechaNacimiento) throw new Error('Falta la fecha de nacimiento');
  if (formacion.length < 10) throw new Error('Contanos un poco más sobre tu formación');
  if (!oficio) throw new Error('Falta el servicio que querés brindar');
  if (!fechaLlegada || !fechaSalida) throw new Error('Faltan las fechas de participación');
  if (diasEntre(fechaLlegada, fechaSalida) < 28) throw new Error('La participación mínima para esta beca es de 4 semanas');
  if (!redes) throw new Error('Faltan redes sociales o portfolio que muestren tu labor');
  if (fotoPaths.length === 0) throw new Error('Necesitamos al menos una foto de tu labor');

  const admin = createSupabaseAdminClient();
  const fotoLinks = (
    await Promise.all(
      fotoPaths.map(async (path) => {
        const { data } = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
        return data?.signedUrl ?? null;
      }),
    )
  ).filter((u): u is string => !!u);

  const rows: [string, string][] = [
    ['Nombre', nombre],
    ['Email', email],
    ['WhatsApp', whatsapp],
    ['Ciudad / país', ciudad],
    ['Fecha de nacimiento', fechaNacimiento],
    ['Formación', formacion],
    ['Oficio a aportar', oficio],
    ['Llegada', fechaLlegada],
    ['Salida', fechaSalida],
    ['Redes / portfolio', redes],
    ['Mensaje', mensaje || '—'],
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
      <h2 style="margin:0 0 4px;font-size:20px;color:#2D2416;">Postulación · Voluntariado de oficio</h2>
      <p style="margin:0 0 24px;font-size:13px;color:#7A6F65;">Inmersión Viva · Tay Pichín</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E8DCC8;">
        ${rows
          .map(
            ([label, val]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E8DCC8;font-size:12px;font-weight:700;color:#7A6F65;width:130px;vertical-align:top;">${esc(label)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #E8DCC8;font-size:13px;color:#2D2416;">${esc(val)}</td>
        </tr>`,
          )
          .join('')}
      </table>
      <p style="margin:24px 0 8px;font-size:12px;font-weight:700;color:#7A6F65;text-transform:uppercase;letter-spacing:1px;">Fotos de su labor</p>
      ${
        fotoLinks.length
          ? fotoLinks.map((url, i) => `<p style="margin:0 0 6px;"><a href="${url}" style="color:#B5651D;font-size:13px;">Foto ${i + 1} → (link válido 7 días)</a></p>`).join('')
          : '<p style="font-size:13px;color:#2D2416;">—</p>'
      }
    </td></tr>
  </table>
</body>
</html>`;

  const ok = await sendEmail({
    to: NOTIFY_EMAIL,
    subject: `Postulación oficio · ${oficio} · ${nombre}`,
    html,
  });
  if (!ok) throw new Error('No se pudo enviar la postulación. Probá de nuevo o escribinos por WhatsApp.');

  void emitN8nEvent('oficio-applied', {
    nombre,
    email,
    whatsapp,
    ciudad,
    oficio,
    formacion,
    fecha_nacimiento: fechaNacimiento,
    fecha_llegada: fechaLlegada,
    fecha_salida: fechaSalida,
    redes,
    mensaje,
    fotos: fotoLinks,
  });

  return { ok: true as const };
}
