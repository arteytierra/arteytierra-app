import { NextResponse, type NextRequest } from 'next/server';
import { sendEmail } from '@/lib/integrations/resend';

export const runtime = 'nodejs';

/**
 * Aviso por correo cuando alguien se postula al piloto de Acequia.
 *
 * La landing (acequia.app, otro repo) guarda la postulación en Supabase y, si
 * tiene `PILOT_NOTIFICATION_WEBHOOK_URL` cargada, hace un POST acá. La landing
 * no manda correo por sí misma; el remitente verificado en Resend vive en este
 * proyecto, así que el aviso se arma donde ya hay con qué mandarlo.
 *
 * Nunca bloquea la postulación: del lado de la landing esta llamada va sin
 * await y con los errores tragados. Si esto falla, la persona igual quedó
 * anotada en la base.
 */

const DESTINO_DEFAULT = 'acequia.app@gmail.com';

function escapar(v: unknown): string {
  return String(v ?? '—').replace(/[<>&]/g, (c) => (c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;'));
}

export async function POST(req: NextRequest) {
  // Sin token configurado no se atiende a nadie: el endpoint es público y no
  // queremos que un tercero dispare correos a nuestra casilla.
  const esperado = process.env.PILOT_NOTIFICATION_WEBHOOK_TOKEN;
  if (!esperado) return NextResponse.json({ error: 'No configurado' }, { status: 503 });
  if (req.headers.get('authorization') !== `Bearer ${esperado}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    event?: string;
    id?: string;
    createdAt?: string;
    email?: string;
    name?: string;
  };

  const destino = process.env.ACEQUIA_AVISOS_EMAIL ?? DESTINO_DEFAULT;
  const nombre = escapar(body.name);
  const correo = escapar(body.email);

  const ok = await sendEmail({
    to: destino,
    subject: `Postulación al piloto: ${nombre}`,
    html: `
      <p><strong>${nombre}</strong> se postuló al programa fundador de Acequia.</p>
      <p>Correo: <a href="mailto:${correo}">${correo}</a></p>
      <p style="color:#666">Fecha: ${escapar(body.createdAt)}<br>Ficha: ${escapar(body.id)}</p>
      <p>Los datos completos (oficio, región, tipo de terreno, motivación) están
      en la tabla <code>public.acequia_pilot_applications</code> de Supabase.</p>
      <p>Para darle acceso, mandale:<br>
      <a href="https://terreno.arteytierra.org/canjear?codigo=FUNDADOR26">https://terreno.arteytierra.org/canjear?codigo=FUNDADOR26</a></p>
    `,
  });

  // 200 aunque el correo falle: la landing no puede hacer nada al respecto y no
  // queremos que lo reintente. El fallo queda en los logs de Resend.
  return NextResponse.json({ ok, enviado: ok });
}
