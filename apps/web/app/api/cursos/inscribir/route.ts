import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/integrations/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
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

  if (!nombre || !email) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
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
      <h2 style="margin:0 0 4px;font-size:20px;color:#2D2416;">Nueva inscripción</h2>
      <p style="margin:0 0 24px;font-size:13px;color:#7A6F65;">${curso}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E8DCC8;">
        ${[
          ['Nombre',    nombre],
          ['Email',     email],
          ['WhatsApp',  whatsapp || '—'],
          ['Ciudad',    ciudad   || '—'],
          ['Mensaje',   mensaje  || '—'],
        ].map(([label, val]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E8DCC8;font-size:12px;font-weight:700;color:#7A6F65;width:90px;vertical-align:top;">${label}</td>
          <td style="padding:10px 0;border-bottom:1px solid #E8DCC8;font-size:13px;color:#2D2416;">${val}</td>
        </tr>`).join('')}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const ok = await sendEmail({
    to: 'info.arteytierra@gmail.com',
    from: 'Arte y Tierra · Web <notificaciones@arteytierra.org>',
    subject: `Inscripción · ${curso} · ${nombre}`,
    html,
  });

  if (!ok) {
    return NextResponse.json({ error: 'send_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
