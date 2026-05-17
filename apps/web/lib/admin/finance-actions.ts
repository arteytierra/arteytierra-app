'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/db/server';
import { requireStaff } from '@/lib/auth/session';

const txSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  date: z.string().min(1),
  amount: z.coerce.number().positive('Monto inválido'),
  currency: z.string().min(3).max(3),
  account_id: z.string().uuid(),
  category_id: z.string().uuid().optional().or(z.literal('').transform(() => undefined)),
  description: z.string().max(500).optional(),
  project: z.string().max(80).optional(),
});

export type FinanceState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createTransaction(
  _: FinanceState,
  formData: FormData,
): Promise<FinanceState> {
  const user = await requireStaff('/admin/finanzas');

  const raw = Object.fromEntries(formData.entries());
  const parsed = txSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0]?.toString() ?? '_'] = issue.message;
    }
    return { error: 'Revisá los campos.', fieldErrors };
  }
  const d = parsed.data;

  const supabase = await createSupabaseServerClient();

  // Adjuntar comprobante si vino
  let attachmentUrl: string | null = null;
  const file = formData.get('attachment');
  if (file && file instanceof File && file.size > 0) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const buffer = new Uint8Array(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from('finance-attachments')
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (!upErr) attachmentUrl = path;
  }

  const { error } = await supabase.from('transactions').insert({
    type: d.type,
    date: d.date,
    amount_cents: Math.round(d.amount * 100),
    currency: d.currency.toUpperCase(),
    account_id: d.account_id,
    category_id: d.category_id ?? null,
    description: d.description ?? null,
    project: d.project ?? null,
    attachment_url: attachmentUrl,
    created_by: user.id,
  });

  if (error) return { error: `No pudimos guardar: ${error.message}` };

  revalidatePath('/admin/finanzas');
  revalidatePath('/admin');
  return { ok: true };
}

export async function deleteTransaction(id: string) {
  await requireStaff('/admin/finanzas');
  const supabase = await createSupabaseServerClient();
  await supabase.from('transactions').delete().eq('id', id);
  revalidatePath('/admin/finanzas');
}
