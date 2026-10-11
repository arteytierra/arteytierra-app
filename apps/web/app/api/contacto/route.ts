import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/integrations/resend';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { limitar, ipDe, demasiadosIntentos } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * El unico buzon de los formularios publicos del sitio.
 *
 * Antes habia dos caminos: contacto, asesorias y diseño salian por Formspree
 * —un tercero, con su propio remitente— y las inscripciones a cursos salian
 * por aca. Eso dejaba dos problemas: el mismo sitio escribia desde dos
 * direcciones distintas (imposible de filtrar en Gmail como una sola cosa), y
 * lo que entraba por Formspree no quedaba guardado en ningun lado. Si el mail
 * se perdia, el lead se perdia.
 *
 * Ahora los cinco formularios entran por esta ruta: primero se guarda el
 * contacto, despues se avisa por mail, y el mail sale siempre con el mismo
 * remitente.
 */

/** El formulario es publico: lo que llega se escapa antes de entrar al HTML del mail. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Campos de control: no son datos de la persona, no se muestran como filas. */
const CONTROL = new Set(['_subject', '_fuente', '_replyto', 'form-name']);

/** Los nombres internos de los campos no sirven como etiqueta en el mail. */
const ETIQUETAS: Record<string, string> = {
  nombre: 'Nombre',
  email: 'Email',
  whatsapp: 'WhatsApp',
  telefono: 'Teléfono',
  pais: 'País',
  ciudad: 'Ciudad',
  lugar: 'Dónde queda',
  hectareas: 'Superficie',
  tema: 'Tema',
  modo: 'Modo de trabajo',
  plazo: 'Plazo',
  presupuesto: 'Presupuesto',
  tipo_sesion: 'Tipo de sesión',
  mensaje: 'Mensaje',
};

function etiqueta(campo: string): string {
  if (ETIQUETAS[campo]) return ETIQUETAS[campo];
  // interes_bioarq -> "Interes bioarq"
  const limpio = campo.replace(/[_-]+/g, ' ').trim();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

export async function POST(req: Request) {
  // El formulario es publico y no pide nada para enviarse. Sin tope, un script
  // en loop llena la casilla y la tabla de contactos en minutos.
  if (!limitar(`contacto:${ipDe(req)}`, 5, 60_000)) return demasiadosIntentos();

  let data: FormData;
  try {
    data = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const nombre = data.get('nombre')?.toString().trim() ?? '';
  const email = data.get('email')?.toString().trim() ?? '';
  if (!nombre || !email) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const fuente = data.get('_fuente')?.toString().trim() || 'contacto';
  const asunto = data.get('_subject')?.toString().trim() || 'Nuevo mensaje · arteytierra.org';
  const telefono =
    data.get('whatsapp')?.toString().trim() || data.get('telefono')?.toString().trim() || '';

  // Todo lo que no sea control entra al mail, en el orden en que viene el
  // formulario. Asi un campo nuevo en un formulario aparece solo, sin tocar
  // esta ruta y sin que nadie se entere tarde de que faltaba.
  const filas: [string, string][] = [];
  for (const [campo, valor] of data.entries()) {
    if (CONTROL.has(campo)) continue;
    const texto = valor.toString().trim();
    if (!texto) continue;
    filas.push([etiqueta(campo), texto]);
  }

  const html = `
<!DOCTYPE html>
<html lang="es">
<body style="font-family:Georgia,serif;background:#F5F0E8;padding:32px 16px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#FDFAF5;border-radius:6px;overflow:hidden;">
    <tr><td style="background:#2D2416;padding:20px 32px;">
      <p style="margin:0;color:#E8DCC8;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Arte y Tierra</p>
    </td></tr>
    <tr><td style="padding:32px;">
      <h2 style="margin:0 0 4px;font-size:20px;color:#2D2416;">${esc(asunto)}</h2>
      <p style="margin:0 0 24px;font-size:13px;color:#7A6F65;">Formulario: ${esc(fuente)}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E8DCC8;">
        ${filas
          .map(
            ([label, val]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E8DCC8;font-size:12px;font-weight:700;color:#7A6F65;width:120px;vertical-align:top;">${esc(label)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #E8DCC8;font-size:13px;color:#2D2416;">${esc(val)}</td>
        </tr>`,
          )
          .join('')}
      </table>
      <p style="margin:24px 0 0;font-size:12px;color:#7A6F65;">Respondé a este mail y le llega directo a quien escribió.</p>
    </td></tr>
  </table>
</body>
</html>`;

  // Primero se guarda, despues se avisa: un lead que alguien se tomo el
  // trabajo de escribir no puede depender de que un tercero entregue el mail.
  let guardado = false;
  try {
    const admin = createSupabaseAdminClient();
    const notas = filas
      .filter(([label]) => label !== 'Nombre' && label !== 'Email')
      .map(([label, val]) => `${label}: ${val}`)
      .join('\n');

    const { error } = await admin.schema('app').from('contacts').insert({
      email,
      full_name: nombre,
      phone: telefono || null,
      source: fuente,
      tags: ['web', fuente],
      lifecycle_stage: 'lead',
      notes: notas,
    });
    if (error) throw error;
    guardado = true;
  } catch (err) {
    console.error('[contacto] no se pudo guardar el contacto', err);
  }

  const avisado = await sendEmail({
    to: 'info.arteytierra@gmail.com',
    from: 'Arte y Tierra · Web <notificaciones@arteytierra.org>',
    // Contestar el aviso le escribe a la persona, no a la casilla del sitio.
    replyTo: email,
    subject: `${asunto} · ${nombre}`,
    html,
  });

  // Solo es un error para quien escribe si no quedo registrado en ningun lado.
  if (!guardado && !avisado) {
    return NextResponse.json({ error: 'send_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
