'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/session';
import { createSupabaseAdminClient } from '@/lib/db/admin';
import { sendWhatsappText } from './whatsapp';

const schema = z.object({
  channel: z.enum(['whatsapp', 'email']),
  to: z.string().min(3),
  body: z.string().min(1).max(4000),
});

export async function sendInboxReply(input: z.infer<typeof schema>) {
  await requireStaff();
  const parsed = schema.parse(input);

  if (parsed.channel === 'whatsapp') {
    const res = (await sendWhatsappText(parsed.to, parsed.body)) as { messages?: Array<{ id: string }> };
    const providerId = res.messages?.[0]?.id;

    const admin = createSupabaseAdminClient();
    await admin.from('messages').insert({
      channel: 'whatsapp',
      direction: 'outbound',
      to_address: parsed.to.replace(/[^\d]/g, ''),
      body: parsed.body,
      status: 'sent',
      provider_message_id: providerId,
    });
  } else if (parsed.channel === 'email') {
    // Hook futuro: integrar Resend/Postmark/SES. Por ahora persistimos.
    const admin = createSupabaseAdminClient();
    await admin.from('messages').insert({
      channel: 'email',
      direction: 'outbound',
      to_address: parsed.to,
      body: parsed.body,
      status: 'queued',
    });
  }

  revalidatePath('/admin/inbox');
  return { ok: true };
}
