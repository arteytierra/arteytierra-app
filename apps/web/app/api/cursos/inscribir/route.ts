import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/integrations/resend';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { limitar, ipDe, demasiadosIntentos } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** El formulario es público: lo que llega se escapa antes de entrar al HTML del mail. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(req: Request) {
  // El formulario es público y no pide nada para enviarse. Sin tope, un script
  // en loop llena la casilla y la tabla de contactos en minutos.
  if (!limitar(`inscribir:${ipDe(req)}`, 5, 60_000)) return demasiadosIntentos();

  let data: FormData;
  try {
    data = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const nombre  = data.get('nombre')?.toString().trim()  ?? '';
  const email   = data.get('email')?.toString().trim()   ?? '';
  const whatsapp = data.get('whatsapp')?.toString().trim() ?? '';
  const ciudad  = data.get('ciudad')?.toString().trim()  ?? '';
  const mensaje = data.get('mensaje')?.toString().trim() ?? '';
  const curso   = data.get('curso')?.toString().trim()   ?? 'Curso';
  const opcion  = data.get('opcion')?.toString().trim()  ?? '';
  const fechaLlegada = data.get('fechaLlegada')?.toString().trim() ?? '';
  const fechaSalida  = data.get('fechaSalida')?.toString().trim()  ?? '';

  if (!nombre || !email) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const rows: [string, string][] = [
    ['Nombre', nombre],
    ['Email', email],
    ['WhatsApp', whatsapp || '—'],
    ['Ciudad', ciudad || '—'],
  ];
  if (opcion) rows.push(['Opción', opcion]);
  if (fechaLlegada) rows.push(['Llegada', fechaLlegada]);
  if (fechaSalida) rows.push(['Salida', fechaSalida]);
  rows.push(['Mensaje', mensaje || '—']);

  const html = `
<!DOCTYPE html>
<html lang="es">
<body style="font-family:Georgia,serif;background:#F5F0E8;padding:32px 16px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#FDFAF5;border-radius:6px;overflow:hidden;">
    <tr><td style="background:#2D2416;padding:20px 32px;">
      <p style="margin:0;color:#E8DCC8;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Arte y Tierra</p>
    </td></tr>
    <tr><td style="padding:32px;">
      <h2 style="margin:0 0 4px;font-size:20px;color:#2D2416;">Nueva inscripción</h2>
      <p style="margin:0 0 24px;font-size:13px;color:#7A6F65;">${esc(curso)}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E8DCC8;">
        ${rows.map(([label, val]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E8DCC8;font-size:12px;font-weight:700;color:#7A6F65;width:90px;vertical-align:top;">${esc(label)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #E8DCC8;font-size:13px;color:#2D2416;">${esc(val)}</td>
        </tr>`).join('')}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // Primero se guarda, después se avisa.
  //
  // Hasta hoy esto era sólo un mail: si Resend fallaba, o si el mail se perdía
  // entre otros mil, la inscripción no existía en ningún lado. Ya pasó una vez
  // que la única casilla de contacto del sitio rebotaba. Un lead que alguien se
  // tomó el trabajo de escribir no puede depender de que un tercero entregue.
  let guardado = false;
  try {
    const admin = createSupabaseAdminClient();
    const notas = [
      `Curso: ${curso}`,
      opcion ? `Opción: ${opcion}` : null,
      fechaLlegada ? `Llegada: ${fechaLlegada}` : null,
      fechaSalida ? `Salida: ${fechaSalida}` : null,
      ciudad ? `Ciudad: ${ciudad}` : null,
      mensaje || null,
    ].filter(Boolean).join('\n');

    const { error } = await admin.schema('app').from('contacts').insert({
      email,
      full_name: nombre,
      phone: whatsapp || null,
      source: 'inscripcion-curso',
      tags: ['curso', curso],
      lifecycle_stage: 'lead',
      notes: notas,
    });
    if (error) throw error;
    guardado = true;
  } catch (err) {
    console.error('[inscribir] no se pudo guardar el contacto', err);
  }

  const avisado = await sendEmail({
    to: 'info.arteytierra@gmail.com',
    from: 'Arte y Tierra · Web <notificaciones@arteytierra.org>',
    subject: `Inscripción · ${curso} · ${nombre}`,
    html,
  });

  // Sólo es un error para quien se inscribe si no quedó registrada en ningún
  // lado. Si se guardó pero el mail no salió, el dato está y se ve en el panel:
  // hacerla completar el formulario de nuevo sería perderlo por segunda vez.
  if (!guardado && !avisado) {
    return NextResponse.json({ error: 'send_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
