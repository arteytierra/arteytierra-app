'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/db/server';

const emailSchema = z.string().email('Correo inválido');
const passwordSchema = z.string().min(8, 'Mínimo 8 caracteres');

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2, 'Nombre demasiado corto'),
  marketingConsent: z.boolean().optional(),
});

export type ActionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function parseFormData<T extends z.ZodTypeAny>(
  formData: FormData,
  schema: T,
): { data: z.infer<T>; error?: undefined } | { data?: undefined; error: ActionState } {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse({
    ...raw,
    marketingConsent: raw.marketingConsent === 'on' || raw.marketingConsent === 'true',
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? '_';
      fieldErrors[key] = issue.message;
    }
    return { error: { error: 'Revisá los campos.', fieldErrors } };
  }
  return { data: parsed.data };
}

function safeNext(next: FormDataEntryValue | null): string {
  const raw = typeof next === 'string' ? next : '';
  return raw.startsWith('/') && !raw.startsWith('//') ? raw : '/mi-cuenta';
}

// ----- Login con email/password -----
export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const result = parseFormData(formData, loginSchema);
  if (result.error) return result.error;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(result.data);

  if (error) {
    return { error: error.message === 'Invalid login credentials'
        ? 'Email o contraseña incorrectos.'
        : 'No pudimos iniciar sesión. Probá de nuevo.' };
  }

  revalidatePath('/', 'layout');
  redirect(safeNext(formData.get('next')));
}

// ----- Magic link -----
export async function magicLinkAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) return { fieldErrors: { email: parsed.error.issues[0]!.message } };

  const supabase = await createSupabaseServerClient();
  const next = safeNext(formData.get('next'));
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { error: 'No pudimos enviar el link. Probá de nuevo.' };
  return { ok: true };
}

// ----- Signup -----
export async function signupAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const result = parseFormData(formData, signupSchema);
  if (result.error) return result.error;
  const { email, password, fullName, marketingConsent } = result.data;

  const supabase = await createSupabaseServerClient();
  const next = safeNext(formData.get('next'));

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, marketing_consent: !!marketingConsent },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      return { error: 'Ese correo ya está registrado. Iniciá sesión.' };
    }
    return { error: 'No pudimos crear tu cuenta. Probá de nuevo.' };
  }

  return { ok: true };
}

// ----- Solicitar reset de password -----
export async function requestPasswordResetAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) return { fieldErrors: { email: parsed.error.issues[0]!.message } };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/nueva-password`,
  });

  // No revelamos si el email existe (anti-enumeration)
  if (error && !error.message.includes('rate')) return { ok: true };
  return { ok: true };
}

// ----- Actualizar password (usuario logueado vía reset link) -----
export async function updatePasswordAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = passwordSchema.safeParse(formData.get('password'));
  if (!parsed.success) return { fieldErrors: { password: parsed.error.issues[0]!.message } };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { error: 'No pudimos actualizar la contraseña.' };

  redirect('/mi-cuenta');
}

// ----- Logout -----
export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
