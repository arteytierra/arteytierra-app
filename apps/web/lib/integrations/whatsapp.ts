import 'server-only';

/**
 * WhatsApp Cloud API (Meta) — envío de mensajes desde la app.
 *
 * Plantillas: deben estar pre-aprobadas en Meta Business Manager.
 * Mensajes libres (texto plano): solo dentro de la ventana de 24h tras
 * último mensaje entrante del usuario.
 *
 * Doc: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const API_VERSION = 'v20.0';

function normalizePhone(p: string): string {
  return p.replace(/[^\d]/g, '');
}

async function whatsappPost(body: unknown): Promise<unknown> {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;
  if (!phoneId || !token) throw new Error('WhatsApp no configurado');
  const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`WhatsApp ${res.status}: ${await res.text()}`);
  return res.json();
}

/** Envío de plantilla aprobada (recomendado para outbound). */
export async function sendWhatsappTemplate(opts: {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: Array<{
    type: 'body' | 'header' | 'button';
    parameters: Array<{ type: 'text'; text: string }>;
  }>;
}) {
  return whatsappPost({
    messaging_product: 'whatsapp',
    to: normalizePhone(opts.to),
    type: 'template',
    template: {
      name: opts.templateName,
      language: { code: opts.languageCode ?? 'es_AR' },
      components: opts.components,
    },
  });
}

/** Texto libre — sólo dentro de la ventana de 24h. */
export async function sendWhatsappText(to: string, text: string) {
  return whatsappPost({
    messaging_product: 'whatsapp',
    to: normalizePhone(to),
    type: 'text',
    text: { body: text },
  });
}
