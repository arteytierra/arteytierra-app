import 'server-only';

const RESEND_API = 'https://api.resend.com';
const FROM_DEFAULT = 'Arte y Tierra <hola@arteytierra.org>';

export async function sendEmail({
  to,
  subject,
  html,
  from = FROM_DEFAULT,
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[resend] RESEND_API_KEY not set — email not sent');
    return false;
  }

  try {
    const res = await fetch(`${RESEND_API}/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[resend] send failed', res.status, body);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[resend] send error', err);
    return false;
  }
}
