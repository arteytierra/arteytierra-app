import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/db/server';
import { getPreferences, resolveContextFromToken, type EmailPrefs } from '@/lib/email/preferences';
import { updateEmailPreferencesAction, unsubscribeAction } from '@/lib/email/actions';

export const metadata: Metadata = {
  title: 'Preferencias de email',
  robots: { index: false, follow: false },
};

const LABELS: Record<keyof EmailPrefs, { title: string; desc: string }> = {
  orders: { title: 'Compras y pagos', desc: 'Recibos, pagos pendientes, envíos.' },
  courses: { title: 'Cursos', desc: 'Enrollments, nuevas clases, recordatorios.' },
  reservations: { title: 'Reservas', desc: 'Hospedaje y asesorías.' },
  marketing: { title: 'Newsletter y promos', desc: 'Novedades y campañas.' },
  community: { title: 'Comunidad', desc: 'Foros, respuestas a tus posts.' },
};

const ALL_KEYS: (keyof EmailPrefs)[] = ['orders', 'courses', 'reservations', 'marketing', 'community'];

export default async function EmailPreferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token ?? null;

  // Resolver user_id: sesión o token
  let userId: string | null = null;
  let recipient: string | null = null;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    userId = user.id;
    recipient = user.email ?? null;
  } else if (token) {
    const ctx = await resolveContextFromToken(token);
    userId = ctx.userId;
    recipient = ctx.recipient;
  }

  if (!userId && !recipient) {
    return (
      <main className="container mx-auto max-w-xl px-4 py-12">
        <h1 className="font-display text-2xl text-ink">Preferencias de email</h1>
        <p className="mt-4 text-mute">
          Para gestionar tus preferencias, iniciá sesión o usá el link incluido en uno de nuestros emails.
        </p>
        <p className="mt-4"><a className="underline" href="/auth/login">Iniciar sesión</a></p>
      </main>
    );
  }

  const prefs = userId ? await getPreferences(userId) : null;

  return (
    <main className="container mx-auto max-w-xl px-4 py-12">
      <h1 className="font-display text-2xl text-ink">Preferencias de email</h1>
      <p className="mt-2 text-sm text-mute">
        {recipient ? `Configurando ${recipient}.` : 'Configurá qué emails querés recibir.'}
      </p>

      {prefs && (
        <form action={updateEmailPreferencesAction} className="mt-8 space-y-4">
          {token && <input type="hidden" name="token" value={token} />}
          {ALL_KEYS.map((k) => (
            <label key={k} className="flex items-start gap-3 rounded-lg border border-ink/10 p-4">
              <input
                type="checkbox"
                name={`pref_${k}`}
                defaultChecked={prefs[k]}
                className="mt-1 h-4 w-4 accent-leaf"
              />
              <div>
                <div className="font-medium text-ink">{LABELS[k].title}</div>
                <div className="text-sm text-mute">{LABELS[k].desc}</div>
              </div>
            </label>
          ))}

          <p className="text-xs text-mute">
            Los emails transaccionales críticos (confirmaciones de pago, certificados,
            seguridad) se envían siempre.
          </p>
          <button type="submit" className="rounded-md bg-leaf px-5 py-2.5 text-bone font-medium">
            Guardar
          </button>
        </form>
      )}

      {!userId && token && (
        <form action={unsubscribeAction} className="mt-10 rounded-lg border border-ink/10 p-4">
          <p className="text-sm text-mute mb-3">
            Para gestionar preferencias granulares, necesitás una cuenta. Mientras tanto, podés cancelar
            la categoría que te trajo acá:
          </p>
          <input type="hidden" name="token" value={token} />
          {sp.cat && <input type="hidden" name="category" value={sp.cat} />}
          <button type="submit" className="rounded-md border border-ink/20 px-4 py-2 text-sm">
            Cancelar suscripción {sp.cat ? `de ${LABELS[sp.cat as keyof EmailPrefs]?.title ?? sp.cat}` : ''}
          </button>
        </form>
      )}
    </main>
  );
}
