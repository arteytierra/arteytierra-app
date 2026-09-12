import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/integrations/resend';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { limitar, ipDe, demasiadosIntentos } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Entra texto de cualquiera: se escapa antes de armar el HTML del mail. */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Botón de arrepentimiento (art. 34, Ley 24.240).
 *
 * Esto tiene plazo legal: 10 días corridos. Un pedido que se pierde porque un
 * correo no salió es un derecho que no se pudo ejercer. Por eso se guarda en la
 * base primero y el correo es sólo el aviso; si el correo falla pero la fila
 * quedó, la respuesta sigue siendo un éxito, porque el pedido existe y se ve en
 * el panel. Si no se pudo guardar, se devuelve error y la persona ve los otros
 * canales en vez de una pantalla de éxito falsa.
 */
export async function POST(req: Request) {
  if (!limitar(`arrepentimiento:${ipDe(req)}`, 5, 60_000)) return demasiadosIntentos();

  let data: FormData;
  try {
    data = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_body', mensaje: 'No pudimos leer el formulario.' }, { status: 400 });
  }

  const nombre  = data.get('nombre')?.toString().trim()  ?? '';
  const email   = data.get('email')?.toString().trim()   ?? '';
  const pedido  = data.get('pedido')?.toString().trim()  ?? '';
  const detalle = data.get('detalle')?.toString().trim().slice(0, 1500) ?? '';

  if (!nombre || !email) {
    return NextResponse.json(
      { error: 'missing_fields', mensaje: 'Necesitamos tu nombre y el correo con el que compraste.' },
      { status: 400 },
    );
  }

  const recibido = new Date().toISOString();
  const notas = [
    'PEDIDO DE ARREPENTIMIENTO (art. 34 Ley 24.240)',
    `Recibido: ${recibido}`,
    'Plazo de respuesta: 10 dias corridos desde la entrega o el contrato.',
    pedido ? `Pedido: ${pedido}` : null,
    detalle || null,
  ].filter(Boolean).join('\n');

  let guardado = false;
  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.schema('app').from('contacts').insert({
      email,
      full_name: nombre,
      source: 'arrepentimiento',
      tags: ['arrepentimiento', 'legal'],
      lifecycle_stage: 'lead',
      notes: notas,
    });
    if (error) throw error;
    guardado = true;
  } catch (err) {
    console.error('[arrepentimiento] no se pudo guardar el pedido', err);
  }

  const filas: [string, string][] = [
    ['Nombre', nombre],
    ['Email', email],
    ['Pedido', pedido || '—'],
    ['Detalle', detalle || '—'],
    ['Recibido', recibido],
  ];

  const html = `
<!DOCTYPE html>
<html lang="es">
<body style="font-family:Georgia,serif;background:#F5F0E8;padding:32px 16px;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#FDFAF5;border-radius:6px;overflow:hidden;">
    <tr><td style="background:#7A1F1F;padding:20px 32px;">
      <p style="margin:0;color:#F5E8E8;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Arte y Tierra · Legal</p>
    </td></tr>
    <tr><td style="padding:32px;">
      <h2 style="margin:0 0 4px;font-size:20px;color:#2D2416;">Pedido de arrepentimiento</h2>
      <p style="margin:0 0 24px;font-size:13px;color:#7A6F65;">Tiene plazo legal de 10 días corridos. Responder cuanto antes.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E8DCC8;">
        ${filas.map(([label, val]) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E8DCC8;font-size:12px;font-weight:700;color:#7A6F65;width:90px;vertical-align:top;">${esc(label)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #E8DCC8;font-size:13px;color:#2D2416;white-space:pre-wrap;">${esc(val)}</td>
        </tr>`).join('')}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await sendEmail({
    to: 'info.arteytierra@gmail.com',
    from: 'Arte y Tierra · Web <notificaciones@arteytierra.org>',
    subject: `ARREPENTIMIENTO · ${nombre}`,
    html,
  });

  if (!guardado) {
    return NextResponse.json(
      {
        error: 'not_saved',
        mensaje:
          'No pudimos registrar tu pedido. Escribinos a info.arteytierra@gmail.com o por WhatsApp al +54 9 3549 431594 para que quede asentado dentro del plazo.',
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
