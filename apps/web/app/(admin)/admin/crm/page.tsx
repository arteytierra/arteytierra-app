import { Badge, Input } from '@arteytierra/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { createSupabaseServerClient } from '@/lib/db/server';

export const metadata = { title: 'CRM · Admin' };

const STAGE_TONE: Record<string, 'moss' | 'sun' | 'clay' | 'water' | 'neutral'> = {
  lead: 'sun', subscriber: 'water', customer: 'moss',
  student: 'moss', partner: 'clay', archived: 'neutral',
};

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createSupabaseServerClient();
  let query = supabase.from('contacts')
    .select('id, email, full_name, phone, lifecycle_stage, tags, source, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  const { data } = await query;

  return (
    <>
      <PageHeader title="CRM · Alumnos & Contactos" description="Toda persona que tocó el ecosistema." />

      <form className="mb-6 max-w-md">
        <Input name="q" placeholder="Buscar nombre o email…" defaultValue={q ?? ''} />
      </form>

      {!data || data.length === 0 ? (
        <EmptyState
          title="Sin contactos"
          description="Cada compra, registro o suscripción crea un contacto automáticamente."
        />
      ) : (
        <div className="rounded-2xl border border-ink-950/10 bg-bone-50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bone-100 text-ink-800/65 text-xs uppercase tracking-[0.12em]">
              <tr>
                <th className="text-left px-5 py-3">Nombre</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Etapa</th>
                <th className="text-left px-5 py-3">Tags</th>
                <th className="text-left px-5 py-3">Origen</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="border-t border-ink-950/5">
                  <td className="px-5 py-3">{c.full_name ?? <span className="text-ink-800/40">—</span>}</td>
                  <td className="px-5 py-3 text-ink-800/80">{c.email}</td>
                  <td className="px-5 py-3">
                    <Badge tone={STAGE_TONE[c.lifecycle_stage] ?? 'neutral'}>{c.lifecycle_stage}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(c.tags ?? []).slice(0, 3).map((t: string) => (
                        <span key={t} className="text-[10px] bg-bone-100 rounded-full px-2 py-0.5">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-800/70">{c.source ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
