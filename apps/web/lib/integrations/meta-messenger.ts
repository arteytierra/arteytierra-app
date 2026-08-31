import 'server-only';

/**
 * Envío de mensajes a Messenger e Instagram (Meta) vía Graph API.
 *
 * Los dos canales usan la MISMA página de Facebook y su Page Access Token: el
 * Instagram profesional queda vinculado a esa página, así una sola llave
 * (`META_PAGE_ACCESS_TOKEN`) atiende ambos.
 *
 * Solo se puede responder texto libre dentro de la ventana de 24h desde el
 * último mensaje de la persona (mensajería estándar).
 *
 * Doc: https://developers.facebook.com/docs/messenger-platform/send-messages
 */

const API_VERSION = 'v20.0';

type MetaPlatform = 'messenger' | 'instagram';

async function graphPost(body: unknown): Promise<unknown> {
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!token) throw new Error('Meta (Messenger/Instagram) no configurado: falta META_PAGE_ACCESS_TOKEN');
  const res = await fetch(`https://graph.facebook.com/${API_VERSION}/me/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Meta ${res.status}: ${await res.text()}`);
  return res.json();
}

/** Texto libre a un usuario de Messenger o Instagram (dentro de la ventana de 24h). */
export async function sendMetaMessage(opts: {
  to: string;
  text: string;
  platform: MetaPlatform;
}): Promise<{ recipient_id?: string; message_id?: string }> {
  const body: Record<string, unknown> = {
    recipient: { id: opts.to },
    message: { text: opts.text },
  };
  // Messenger admite/espera messaging_type; Instagram lo ignora, así que solo
  // lo mandamos en Messenger para no arriesgar un rechazo.
  if (opts.platform === 'messenger') body.messaging_type = 'RESPONSE';
  return graphPost(body) as Promise<{ recipient_id?: string; message_id?: string }>;
}
